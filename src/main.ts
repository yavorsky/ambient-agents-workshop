import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Chat } from './chat.ts';
import { Clock } from './clock.ts';
import { config } from './config.ts';
import { Memory, memoryStore, memoryTools } from './memory.ts';
import { MODEL_TIERS, modelProviderName } from './models.ts';
import { Notifier } from './notify.ts';
import { Agent } from './pipeline.ts';
import { Policy } from './policy.ts';
import { register, unregister } from './registry.ts';
import { startServer } from './server.ts';
import { GitHubPoller } from './sources/github.ts';
import { Store } from './store.ts';
import { Thread } from './thread.ts';
import { reminderTools, Timers } from './timers.ts';
import { buildTools, originRepo, skillNames } from './tools.ts';
import { Watches } from './watches.ts';
import { Worker } from './worker.ts';

function gitRef(): string {
  for (const args of [['describe', '--tags', '--exact-match'], ['rev-parse', '--abbrev-ref', 'HEAD']]) {
    try {
      const out = execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (out && out !== 'HEAD') return out;
    } catch {
      // try the next form
    }
  }
  return 'detached';
}


const store = new Store(config.dbPath);
const clock = new Clock();
const timers = new Timers(store, clock);
const memory = new Memory(memoryStore(store), clock);
await memory.load();
const policy = new Policy(() => memory.preferencesText(), store, clock);
const thread = new Thread(() => clock.now());
const watches = new Watches(join(process.cwd(), 'memory', 'watches.md'));
const notifier = new Notifier({ store, clock, instance: config.instance, slackWebhook: config.slackWebhook, thread });
const workerModel = config.workerMode === 'model' ? MODEL_TIERS.worker : config.claudeModel;
const worker = new Worker({ mode: config.workerMode, model: workerModel, repo: config.repo, simSpeed: config.simSpeed, store });
const agent = new Agent({
  store, clock, notifier, worker, policy, timers,
  gate: {
    mode: config.gateMode,
    model: MODEL_TIERS.gate,
    decision: config.decisionProvider ? { provider: config.decisionProvider, threshold: config.decisionThreshold } : undefined,
    watches: () => watches.list(),
  },
  selfLogin: config.selfLogin,
  gateWindowMs: 400 * config.simSpeed,
  simulateEchoes: config.workerMode === 'sim',
  simSpeed: config.simSpeed,
  memory,
});

const chatRepo = config.repo || (await originRepo());
// Step 7: the chat sees an index of memory, not the event stream, and reads a file when it needs one.
const { recent_activity: _activity, ...repoTools } = buildTools({ repo: chatRepo, watches, canComment: process.env.CHAT_CAN_COMMENT === '1', activity: () => ({}) });
const memoryIndex = async () =>
  (await memory.index()).map((f) => `- ${f.path} (${f.lines} lines): ${f.about}`).join('\n') || '(empty)';
const chat = new Chat({
  model: MODEL_TIERS.chat,
  tools: { ...repoTools, ...memoryTools(memory), ...reminderTools(timers) },
  // The main thread: the reports the agent sends on its own land in it, but the model sees only an index of memory.
  instructions: async () => `You are an agent that looks after the GitHub repo ${chatRepo || '(none connected)'} and its code, which is your working directory.
This conversation is the main thread. You also work on your own: events from GitHub are checked against the watches below,
and what you do about them is reported into this thread and leaves a line in memory (journal/<date>.md, subjects/<subject>.md).
When the person asks you to watch for something, use the watch tool; to be reminded of something, use the remind tool.
Older messages drop out of this conversation; memory files stay.

Watches:
${watches.list().map((w) => `- ${w}`).join('\n') || '(none)'}

Memory files (read the ones you need with memory_read; never all of them):
${await memoryIndex()}

preferences.md is how the person wants to be treated, and the policy re-reads it on every decision. When they tell you
something like that (what to ping about, how many pings a day: write it as "At most N pings a day"), update it with memory_write.
Use your tools to look things up instead of guessing; load a skill before doing the job it describes (skills: ${skillNames().join(', ')}).
${process.env.CHAT_CAN_COMMENT === '1' ? 'You can read the repo and GitHub, and comment on issues and PRs with github_comment when the person asks; watches can carry an instruction for the worker (watch tool, then).' : 'You can read the repo and GitHub, not change them.'} Answer briefly, in plain words.`,
});

const ref = gitRef();
startServer(config.port, {
  agent, chat, thread, watches, memory, clock, store, timers, policy,
  info: { instance: config.instance, ref, workerMode: config.workerMode, gateMode: config.gateMode, repo: config.repo },
  stormPath: join(process.cwd(), 'fixtures', 'storm.json'),
  webhookSecret: config.webhookSecret,
});
setInterval(() => agent.tick(), 1000);
if (config.repo && config.githubSource === 'poll') new GitHubPoller(config.repo, store, (e) => agent.ingest(e)).start();

register(config.registryPath, {
  name: config.instance, port: config.port, ref, cwd: process.cwd(), pid: process.pid, workerMode: config.workerMode, startedAt: Date.now(),
});
const stop = () => {
  unregister(config.registryPath, process.pid);
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

console.log(`ambient agent "${config.instance}" (${ref}) on http://localhost:${config.port}  worker=${config.workerMode}${config.workerMode === 'sim' ? '' : `:${workerModel}`} gate=${config.gateMode}${config.gateMode === 'decision' ? `:${config.decisionProvider} ≥${config.decisionThreshold}, else ${MODEL_TIERS.gate}` : config.gateMode === 'model' ? `:${MODEL_TIERS.gate} via ${modelProviderName()}` : ''}${config.repo ? ` repo=${config.repo}` : ''}`);
