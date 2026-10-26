import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateObject } from 'ai';
import { z } from 'zod';
import { SELF_MARKER, type WorkerMode } from './config.ts';
import { languageModel } from './models.ts';
import type { Store } from './store.ts';
import type { AgentEvent, EventKind, Signal, WorkerResult } from './types.ts';

/** How one worker turn actually runs. The Worker decides which session; a runner does the turn. */
export interface RunnerOptions {
  mode: WorkerMode;
  /** `claude -p --model` in claude mode; OpenRouter / AI Gateway id in model mode. */
  model: string;
  repo: string;
  simSpeed: number;
  store: Store;
}

/** Real work only for real GitHub events, and never for the agent's own comment coming back. */
const realGitHubWork = (events: AgentEvent[]) =>
  events.some((e) => e.source === 'github') && !events.some((e) => e.body?.includes(SELF_MARKER));

export function execute(options: RunnerOptions, signal: Signal, events: AgentEvent[], sessionId: string | undefined): Promise<WorkerResult> {
  if (options.mode === 'claude' || (options.mode === 'auto' && realGitHubWork(events))) return runClaude(signal, events, sessionId, options);
  if (options.mode === 'model') return runModel(signal, events, sessionId ?? `model-${signal}-${randomUUID().slice(0, 8)}`, options);
  return runSimulated(events, sessionId ?? `sim-${signal}-${randomUUID().slice(0, 8)}`, options.simSpeed);
}

type Canned = Omit<WorkerResult, 'sessionId'>;

/** What the simulated worker "did" for each kind of event. Shown as simulated in the dashboard. */
export const SIMULATED_RESULTS: Record<EventKind, Canned> = {
  ci_failed: { summary: 'CI red on main: flaky retry in inbox test. Drafted a fix PR.', action: 'draft fix PR', reversible: true, confidence: 0.55, wakeupInMinutes: 10 },
  ci_passed: { summary: 'CI is green again.', action: 'note', reversible: true, confidence: 0.95 },
  issue_opened: { summary: 'Labelled and triaged the issue, asked for repro steps.', action: 'label + comment', reversible: true, confidence: 0.85, commented: true },
  issue_edited: { summary: 'Re-read the edited issue and updated labels.', action: 'relabel', reversible: true, confidence: 0.8, commented: true },
  issue_comment: { summary: 'Replied to the comment.', action: 'comment', reversible: true, confidence: 0.8, commented: true },
  pr_opened: { summary: 'Reviewed the PR: no blockers, 2 suggestions. Merge?', action: 'merge PR', reversible: false, confidence: 0.8, commented: true },
  pr_comment: { summary: 'Answered the review question.', action: 'comment', reversible: true, confidence: 0.8, commented: true },
  timer: { summary: 'Checked back on CI: the retry passed.', action: 'close loop', reversible: true, confidence: 0.9 },
  answer: { summary: 'Did what you approved.', action: 'carry out', reversible: true, confidence: 1 },
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

async function runSimulated(events: AgentEvent[], sessionId: string, simSpeed: number): Promise<WorkerResult> {
  const first = events[0];
  if (!first) throw new Error('worker called without events');
  const ms = (2000 + hash(first.id) * 3000) * simSpeed;
  await new Promise((resolve) => setTimeout(resolve, ms));
  // Your answer decides what happens to the subject, whatever else arrived with it.
  const answer = events.findLast((e) => e.kind === 'answer');
  if (answer?.title.startsWith('No')) return { sessionId, summary: 'Left it as it is, as you said.', action: 'nothing', reversible: true, confidence: 1 };
  if (answer) return { sessionId, summary: `Done, as you approved: ${answer.title.replace(/^Yes to: /, '')}`, action: 'carry out', reversible: true, confidence: 1 };
  return { sessionId, ...SIMULATED_RESULTS[first.kind] };
}

const SKILL_FOR: Record<Signal, string> = { ci: 'fix-ci', issues: 'triage-issue', prs: 'code-review' };

const eventList = (events: AgentEvent[]) =>
  events.map((e) => `- [${e.kind}] ${e.subject} by ${e.actor.login}: ${e.title}${e.body ? ` — ${e.body.slice(0, 300)}` : ''}${e.url ? ` (${e.url})` : ''}`).join('\n');

// ---------- model: one structured call through OpenRouter / AI Gateway, no tools ----------

const resultSchema = z.object({
  summary: z.string().describe('One sentence: what you would do and why'),
  action: z.string().describe('Short label, e.g. "label + comment", "draft fix PR", "merge PR"'),
  reversible: z.boolean().describe('Can the action be undone easily?'),
  confidence: z.number().min(0).max(1),
  wakeupInMinutes: z.number().int().positive().optional().describe('Set when you should check this subject again later'),
  commented: z.boolean().describe('Whether the action posts a comment on GitHub'),
});

function skillText(signal: Signal): string {
  const path = join(process.cwd(), '.claude', 'skills', SKILL_FOR[signal], 'SKILL.md');
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

async function runModel(signal: Signal, events: AgentEvent[], sessionId: string, options: RunnerOptions): Promise<WorkerResult> {
  const historyKey = `history:${sessionId}`;
  const history = JSON.parse(options.store.get(historyKey) ?? '[]') as string[];
  const { object } = await generateObject({
    model: languageModel(options.model),
    schema: resultSchema,
    system: `You are an ambient agent looking after the GitHub repo ${options.repo || 'demo/app'} (signal: ${signal}).
In this mode you cannot run tools: decide what you would do, following the skill below. Never merge, close, delete or push yourself.

${skillText(signal)}`,
    prompt: `${history.length ? `Earlier in this session:\n${history.map((h) => `- ${h}`).join('\n')}\n\n` : ''}New events:\n${eventList(events)}`,
  });
  options.store.set(historyKey, JSON.stringify([...history, object.summary].slice(-8)));
  return { sessionId, ...object };
}

// ---------- claude: Claude Code headless, with the repo's skills and a gh allowlist ----------

const ALLOWED_TOOLS = [
  'Read', 'Grep', 'Glob',
  // No issue create: the live agent reads public input, so it may answer, label and review, never open new threads.
  'Bash(gh issue view:*)', 'Bash(gh issue list:*)', 'Bash(gh issue comment:*)', 'Bash(gh issue edit:*)',
  'Bash(gh pr view:*)', 'Bash(gh pr diff:*)', 'Bash(gh pr comment:*)', 'Bash(gh pr review:*)',
  'Bash(gh run view:*)', 'Bash(gh run list:*)',
];

/** What the person asked to happen when a watch matches ("… → reply that we have no capacity"). */
function watchInstructions(events: AgentEvent[]): string {
  const asked = [...new Set(events.map((e) => e.watch).filter((w): w is string => Boolean(w?.includes(' → '))))];
  return asked.length ? `\nThe person asked for this when these events happen; do it, it overrides the skill:\n${asked.map((w) => `- ${w}`).join('\n')}\n` : '';
}

function claudePrompt(signal: Signal, events: AgentEvent[], repo: string): string {
  return `You are an ambient agent looking after the GitHub repo ${repo}. Signal: ${signal}.
New events since your last turn:
${eventList(events)}
${watchInstructions(events)}
Use the /${SKILL_FOR[signal]} skill. Never merge, close, delete or push. Every comment you post must end with "<!-- ambient-agent -->".
Finish with exactly one last line:
RESULT {"summary": "<one sentence>", "action": "<what you did or want to do>", "reversible": true|false, "confidence": 0..1, "wakeupInMinutes": <number, optional>}`;
}

function runClaude(signal: Signal, events: AgentEvent[], sessionId: string | undefined, options: RunnerOptions): Promise<WorkerResult> {
  const args = ['-p', claudePrompt(signal, events, options.repo), '--output-format', 'json', '--model', options.model, '--allowedTools', ALLOWED_TOOLS.join(',')];
  if (sessionId) args.push('--resume', sessionId);
  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), 5 * 60_000);
    child.stdout.on('data', (d: Buffer) => (out += d.toString()));
    child.stderr.on('data', (d: Buffer) => (err += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(out) as { result?: string; session_id?: string };
        resolve(parseResult(parsed.result ?? '', parsed.session_id ?? sessionId ?? 'unknown'));
      } catch {
        reject(new Error(`claude exited ${code}: ${err.slice(0, 300) || out.slice(0, 300)}`));
      }
    });
  });
}

function parseResult(text: string, sessionId: string): WorkerResult {
  const line = text.split('\n').reverse().find((l) => l.trim().startsWith('RESULT'));
  const fallback: WorkerResult = { sessionId, summary: text.slice(0, 200) || 'no summary', action: 'comment', reversible: true, confidence: 0.5 };
  if (!line) return fallback;
  try {
    const r = JSON.parse(line.trim().slice('RESULT'.length)) as Partial<WorkerResult>;
    return {
      sessionId,
      summary: typeof r.summary === 'string' ? r.summary : fallback.summary,
      action: typeof r.action === 'string' ? r.action : fallback.action,
      reversible: r.reversible !== false,
      confidence: typeof r.confidence === 'number' ? r.confidence : 0.5,
      wakeupInMinutes: typeof r.wakeupInMinutes === 'number' ? r.wakeupInMinutes : undefined,
    };
  } catch {
    return fallback;
  }
}
