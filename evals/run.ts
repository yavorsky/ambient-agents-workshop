/**
 * Replays the storm through a fresh in-process agent (simulated worker, rules gate, fast clock) and checks
 * behavior, one case per failure the workshop fixes. Red cases are the to-do list.
 */
import { readFileSync } from 'node:fs';
import { Clock } from '../src/clock.ts';
import { SELF_MARKER } from '../src/config.ts';
import { Notifier } from '../src/notify.ts';
import { Agent } from '../src/pipeline.ts';
import { Policy } from '../src/policy.ts';
import { Store } from '../src/store.ts';
import { Timers } from '../src/timers.ts';
import type { AgentEvent, Signal, WorkerResult } from '../src/types.ts';
import { Worker, type RunHooks } from '../src/worker.ts';

const SPEED = 0.01;
const PREFERENCES = 'At most 3 pings a day. Never merge without asking.';
const WATCHES = ['CI fails on main', 'New issues that need triage'];
const REACTION_ONLY = /^\s*(\+1|same here|me too|thanks!?|👍)\s*$/i;

interface Run { signal: Signal; events: AgentEvent[]; result?: WorkerResult }

class RecordingWorker extends Worker {
  recorded: Run[] = [];
  override run(signal: Signal, events: AgentEvent[], hooks: RunHooks): Promise<WorkerResult> {
    const record: Run = { signal, events };
    this.recorded.push(record);
    return super.run(signal, events, hooks).then((result) => (record.result = result));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function settle(agent: Agent): Promise<void> {
  let quiet = 0;
  for (let i = 0; i < 2000 && quiet < 10; i++) {
    await sleep(10);
    quiet = agent.idle() ? quiet + 1 : 0;
  }
}

async function main(): Promise<void> {
  const storm = JSON.parse(readFileSync(new URL('../fixtures/storm.json', import.meta.url), 'utf8')) as AgentEvent[];
  const store = new Store(':memory:');
  const clock = new Clock();
  clock.jumpTo('10:00');
  const worker = new RecordingWorker({ mode: 'sim', model: 'sim', repo: 'demo/app', simSpeed: SPEED, store });
  const timers = new Timers(store, clock);
  const agent = new Agent({
    store, clock, worker, timers,
    notifier: new Notifier({ store, clock, instance: 'eval', slackWebhook: '', log: false }),
    policy: new Policy(() => PREFERENCES, store, clock),
    gate: { mode: 'rules', model: 'rules', watches: () => WATCHES },
    selfLogin: 'ambient-agent',
    gateWindowMs: 40,
    simulateEchoes: true,
    simSpeed: SPEED,
  });
  const ignoredReasons: string[] = [];
  agent.on('update', (u: { t: string; event?: { stage: string; reason?: string } }) => {
    if (u.t === 'event' && u.event?.stage === 'ignored') ignoredReasons.push(u.event.reason ?? '');
  });

  let crashed: unknown;
  try {
    for (const event of storm) {
      agent.ingest({ ...event, at: clock.now() });
      await sleep(2);
    }
    await settle(agent);
  } catch (error) {
    crashed = error;
  }

  const handled = worker.recorded.flatMap((r) => r.events);
  const s = agent.stats;
  const cases: Array<[string, () => string | true]> = [
    ['noise: bots, edits and its own posts never reach a worker', () => {
      const bad = handled.filter((e) => e.actor.bot || e.kind === 'issue_edited' || e.body?.includes(SELF_MARKER));
      return bad.length === 0 || `${bad.length} noise events reached a worker`;
    }],
    ['cost: reaction-only comments are ignored by the gate, with a reason', () => {
      const reactions = handled.filter((e) => REACTION_ONLY.test(e.body ?? ''));
      if (s.gateCalls === 0) return 'no gate calls: nothing decides before the worker';
      if (reactions.length) return `${reactions.length} "+1"-style comments reached a worker`;
      if (ignoredReasons.some((r) => !r)) return 'an ignored event has no reason';
      return true;
    }],
    ['duplicates: one CI failure, at most two runs', () => {
      const ci = worker.recorded.filter((r) => r.events[0]?.subject === 'ci:main').length;
      return ci <= 2 || `${ci} runs for the same CI failure`;
    }],
    ['sessions: one session per signal, never a crowd of workers', () => {
      const sessions = new Set(worker.recorded.map((r) => r.result?.sessionId)).size;
      if (sessions > 3) return `${sessions} sessions for 3 signals`;
      return s.maxWorkers <= 3 || `${s.maxWorkers} workers ran at once`;
    }],
    ['pings: stays within the budget in memory/preferences.md', () => s.pingsSent <= 3 || `${s.pingsSent} pings with a budget of 3`],
  ];

  let timerResult: string | true = 'not run';
  if (!crashed) {
    clock.advance(11);
    agent.tick();
    await settle(agent);
    timerResult = s.timersFired > 0 || 'red CI never booked a check-back';
  }
  cases.push(['timers: a red CI books its own check-back', () => timerResult]);

  let failed = 0;
  console.log(`\nstorm: ${storm.length} events → worker runs ${s.workerRuns}, gate calls ${s.gateCalls}, pings ${s.pingsSent} sent / ${s.pingsHeld} held\n`);
  for (const [name, check] of cases) {
    // Before the pipeline exists nothing reaches a worker, and "nothing bad happened" is not a pass.
    const outcome = crashed ? `crashed: ${String(crashed).split('\n')[0]}` : worker.recorded.length === 0 ? 'nothing reached a worker: no pipeline yet' : check();
    if (outcome === true) console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    else {
      failed++;
      console.log(`  \x1b[31m✗\x1b[0m ${name}\n      ${outcome}`);
    }
  }
  console.log(`\n${cases.length - failed}/${cases.length} passing\n`);
  process.exit(failed ? 1 : 0);
}

void main();
