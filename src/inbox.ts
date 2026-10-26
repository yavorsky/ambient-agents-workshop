import type { AgentEvent, OfferResult } from './types.ts';

export type RunSubject = (subject: string, events: AgentEvent[]) => Promise<void>;

export interface InboxOptions {
  now: () => number;
  /** The same kind of news about a subject within this window is the same news (CI re-runs, retries). */
  quietMinutes: number;
}

/**
 * Fix 3: work is keyed by subject. One run per subject at a time; events that arrive while it is busy
 * (including repeated deliveries of the same event) are collected and handed over in one follow-up turn.
 */
export class Inbox {
  private seen = new Set<string>();
  private busy = new Set<string>();
  private pending = new Map<string, AgentEvent[]>();
  private handledAt = new Map<string, number>();

  constructor(
    private readonly run: RunSubject,
    private readonly options: InboxOptions,
  ) {}

  offer(event: AgentEvent): OfferResult {
    const duplicate = this.seen.has(event.id);
    this.seen.add(event.id);
    if (duplicate) return 'merged';
    const key = `${event.subject}|${event.kind}`;
    const last = this.handledAt.get(key);
    if (last !== undefined && this.options.now() - last < this.options.quietMinutes * 60_000) return 'merged';
    this.handledAt.set(key, this.options.now());
    if (this.busy.has(event.subject)) {
      this.pending.set(event.subject, [...(this.pending.get(event.subject) ?? []), event]);
      return 'merged';
    }
    this.start(event.subject, [event]);
    return 'started';
  }

  idle(): boolean {
    return this.busy.size === 0;
  }

  private start(subject: string, events: AgentEvent[]): void {
    this.busy.add(subject);
    void this.run(subject, events).finally(() => {
      this.busy.delete(subject);
      const next = this.pending.get(subject);
      this.pending.delete(subject);
      if (next?.length) this.start(subject, next);
    });
  }
}
