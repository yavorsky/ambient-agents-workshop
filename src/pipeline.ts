import { EventEmitter } from 'node:events';
import type { Clock } from './clock.ts';
import type { GateOptions } from './gate.ts';
import type { Notifier } from './notify.ts';
import type { Policy } from './policy.ts';
import type { Store } from './store.ts';
import type { Timers } from './timers.ts';
import type { AgentEvent, Stage, Stats } from './types.ts';
import type { Worker } from './worker.ts';
export interface AgentDeps {
  store: Store;
  clock: Clock;
  notifier: Notifier;
  worker: Worker;
  policy: Policy;
  timers: Timers;
  gate: GateOptions;
  selfLogin: string;
  /** How long the gate collects events before one call. */
  gateWindowMs: number;
  /** Simulated workers post a comment that comes back as a new event, like a real one would. */
  simulateEchoes: boolean;
  simSpeed: number;
}

export interface EventView {
  id: string;
  kind: AgentEvent['kind'];
  subject: string;
  title: string;
  actor: string;
  stage: Stage;
  reason?: string;
}

export type AgentUpdate =
  | { t: 'event'; event: EventView }
  | { t: 'stats'; stats: Stats }
  | { t: 'ping'; subject: string; text: string; ping: boolean; route: string }
  | { t: 'gate'; calls: number }
  | { t: 'digest'; items: number };

const emptyStats = (): Stats => ({
  received: 0, filtered: 0, gateCalls: 0, ignored: 0, merged: 0, workerRuns: 0,
  activeWorkers: 0, maxWorkers: 0, pingsSent: 0, pingsHeld: 0, timersFired: 0, sessions: 0,
});

/** Step 3 (not done yet): signals in, five boxes in order: prefilter → gate → inbox → worker → policy. */
export class Agent extends EventEmitter {
  stats = emptyStats();
  private seen: EventView[] = [];

  constructor(private readonly deps: AgentDeps) {
    super();
  }

  /** For now it only records what comes in, so you can see the sources work before the pipeline exists. */
  ingest(event: AgentEvent): void {
    this.stats.received++;
    const view: EventView = {
      id: event.id, kind: event.kind, subject: event.subject, title: event.title, actor: event.actor.login,
      stage: 'received', reason: 'heard it; no pipeline yet (prompts/step-3.md)',
    };
    this.seen = [...this.seen, view].slice(-60);
    this.emit('update', { t: 'event', event: view } satisfies AgentUpdate);
    this.emit('update', { t: 'stats', stats: this.stats } satisfies AgentUpdate);
  }

  tick(): void {}

  digest(): number {
    return this.deps.notifier.digest().length;
  }

  idle(): boolean {
    return true;
  }

  recent(): EventView[] {
    return this.seen;
  }

  reset(): void {
    this.stats = emptyStats();
    this.seen = [];
    this.deps.store.reset();
  }
}
