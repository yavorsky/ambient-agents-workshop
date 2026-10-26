import { EventEmitter } from 'node:events';
import type { Clock } from './clock.ts';
import { SELF_MARKER } from './config.ts';
import { gate, type GateOptions } from './gate.ts';
import { Inbox } from './inbox.ts';
import type { Notifier } from './notify.ts';
import type { Policy } from './policy.ts';
import { prefilter } from './prefilter.ts';
import type { Store } from './store.ts';
import type { Timers } from './timers.ts';
import type { AgentEvent, Stage, Stats, WorkerResult } from './types.ts';
import { signalOf, type Worker } from './worker.ts';

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

const MAX_ECHOES_PER_SUBJECT = 4;

const emptyStats = (): Stats => ({
  received: 0, filtered: 0, gateCalls: 0, ignored: 0, merged: 0, workerRuns: 0,
  activeWorkers: 0, maxWorkers: 0, pingsSent: 0, pingsHeld: 0, timersFired: 0, sessions: 0,
});

/** Signals in, five boxes in order: prefilter → gate → inbox → worker → policy. */
export class Agent extends EventEmitter {
  stats = emptyStats();
  private views = new Map<string, EventView>();
  private buffer: AgentEvent[] = [];
  private flushTimer: NodeJS.Timeout | undefined;
  private gating = 0;
  private echoesInFlight = 0;
  private echoCount = new Map<string, number>();
  private inbox: Inbox;
  private lastTick: number;

  constructor(private readonly deps: AgentDeps) {
    super();
    this.inbox = this.newInbox();
    this.lastTick = deps.clock.now();
  }

  ingest(event: AgentEvent): void {
    this.stats.received++;
    this.view(event, 'received');
    const filter = prefilter(event, { selfLogin: this.deps.selfLogin });
    if (!filter.keep) {
      this.stats.filtered++;
      this.view(event, 'filtered', filter.reason);
      return this.publishStats();
    }
    this.buffer.push(event);
    this.flushTimer ??= setTimeout(() => void this.flush(), this.deps.gateWindowMs);
    this.publishStats();
  }

  /** Fires due wakeups and, once a day at 09:00, the digest. Call every second or so. */
  tick(): void {
    for (const event of this.deps.timers.due()) {
      this.stats.timersFired++;
      this.ingest(event);
    }
    const now = this.deps.clock.now();
    const nine = new Date(now);
    nine.setHours(9, 0, 0, 0);
    if (this.lastTick < nine.getTime() && now >= nine.getTime()) this.digest();
    this.lastTick = now;
  }

  digest(): number {
    const items = this.deps.notifier.digest().length;
    this.emit('update', { t: 'digest', items } satisfies AgentUpdate);
    return items;
  }

  idle(): boolean {
    return this.buffer.length === 0 && this.gating === 0 && this.echoesInFlight === 0 && this.stats.activeWorkers === 0 && this.inbox.idle();
  }

  recent(): EventView[] {
    return [...this.views.values()].slice(-60);
  }

  reset(): void {
    this.stats = emptyStats();
    this.views.clear();
    this.echoCount.clear();
    this.deps.store.reset();
    this.inbox = this.newInbox();
    this.publishStats();
  }

  private newInbox(): Inbox {
    return new Inbox((subject, events) => this.work(subject, events), { now: () => this.deps.clock.now(), quietMinutes: 5 });
  }

  private async flush(): Promise<void> {
    this.flushTimer = undefined;
    const batch = this.buffer.splice(0);
    this.gating++;
    try {
      const { verdicts, calls } = await gate(batch, this.deps.gate);
      this.stats.gateCalls += calls;
      if (calls) this.emit('update', { t: 'gate', calls } satisfies AgentUpdate);
      for (const event of batch) {
        const verdict = verdicts.find((v) => v.id === event.id);
        if (verdict?.action === 'ignore') {
          this.stats.ignored++;
          this.view(event, 'ignored', verdict.reason);
        } else if (verdict?.action === 'ask') {
          this.view(event, 'done', verdict.reason);
          this.deliver(event.subject, `Before I touch "${event.title}": ${verdict.reason}. Go ahead?`, true, 'ask', verdict.watch);
        } else {
          const offered = this.inbox.offer(verdict?.signal ? { ...event, route: verdict.signal } : event);
          if (offered === 'merged') this.stats.merged++;
          this.view(event, offered === 'merged' ? 'merged' : 'queued', offered === 'merged' ? `joined ${event.subject}` : verdict?.reason);
        }
      }
    } finally {
      this.gating--;
      this.publishStats();
    }
  }

  private async work(subject: string, events: AgentEvent[]): Promise<void> {
    const first = events[0];
    if (!first) return;
    // A reset swaps in fresh stats. A run that started before it keeps counting on the old ones, and its
    // results are dropped, so a reset mid-storm never leaves negative counters or stale pings behind.
    const stats = this.stats;
    try {
      const result = await this.deps.worker.run(first.route ?? signalOf(first), events, {
        onStart: () => {
          stats.workerRuns++;
          stats.activeWorkers++;
          stats.maxWorkers = Math.max(stats.maxWorkers, stats.activeWorkers);
          if (stats !== this.stats) return;
          for (const e of events) this.view(e, 'working');
          this.publishStats();
        },
        onEnd: () => {
          stats.activeWorkers--;
          if (stats === this.stats) this.publishStats();
        },
      });
      if (stats !== this.stats) return;
      for (const e of events) this.view(e, 'done', result.summary);
      this.handle(subject, first, result);
    } catch (error) {
      if (stats !== this.stats) return;
      for (const e of events) this.view(e, 'done', `failed: ${String(error).slice(0, 120)}`);
    }
    this.stats.sessions = this.deps.worker.sessionCount();
    this.publishStats();
  }

  private handle(subject: string, first: AgentEvent, result: WorkerResult): void {
    const decision = this.deps.policy.decide(result);
    this.deliver(subject, `${result.summary} (${decision.why})`, decision.ping, decision.route, first.watch);
    if (result.wakeupInMinutes) this.deps.timers.schedule(subject, result.wakeupInMinutes, `check ${subject} again`);
    if (result.commented && this.deps.simulateEchoes) this.echo(first);
  }

  /** Pings land in the main thread (the notifier writes them there), labelled with the watch that made them worth it. */
  private deliver(subject: string, text: string, ping: boolean, route: string, watch?: string): void {
    this.deps.notifier.send(subject, text, ping, { watch });
    if (ping) this.stats.pingsSent++;
    else this.stats.pingsHeld++;
    this.emit('update', { t: 'ping', subject, text, ping, route } satisfies AgentUpdate);
  }

  /** A real agent's comment comes back from GitHub as a new event. Simulate that round trip. */
  private echo(source: AgentEvent): void {
    const n = (this.echoCount.get(source.subject) ?? 0) + 1;
    if (n > MAX_ECHOES_PER_SUBJECT) return;
    this.echoCount.set(source.subject, n);
    this.echoesInFlight++;
    setTimeout(() => {
      this.echoesInFlight--;
      this.ingest({
        id: `echo-${source.subject}-${n}`,
        source: 'sim',
        kind: source.kind.startsWith('pr_') ? 'pr_comment' : 'issue_comment',
        actor: { login: this.deps.selfLogin, bot: false },
        subject: source.subject,
        title: `Re: ${source.title}`,
        body: `Thanks, I've looked into this. ${SELF_MARKER}`,
        at: this.deps.clock.now(),
      });
    }, 800 * this.deps.simSpeed);
  }

  private view(event: AgentEvent, stage: Stage, reason?: string): void {
    const view: EventView = { id: event.id, kind: event.kind, subject: event.subject, title: event.title, actor: event.actor.login, stage, reason };
    this.views.delete(event.id);
    this.views.set(event.id, view);
    if (this.views.size > 200) this.views.delete(this.views.keys().next().value as string);
    this.emit('update', { t: 'event', event: view } satisfies AgentUpdate);
  }

  private publishStats(): void {
    this.emit('update', { t: 'stats', stats: { ...this.stats } } satisfies AgentUpdate);
  }
}
