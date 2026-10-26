import type { AgentEvent, OfferResult } from './types.ts';

export type RunSubject = (subject: string, events: AgentEvent[]) => Promise<void>;

export interface InboxOptions {
  now: () => number;
  /** The same kind of news about a subject within this window is the same news (CI re-runs, retries). */
  quietMinutes: number;
}

/** Fix 3 (not done yet): key work by subject and merge repeats. For now every event starts its own run. */
export class Inbox {
  private running = 0;

  constructor(
    private readonly run: RunSubject,
    _options: InboxOptions,
  ) {}

  offer(event: AgentEvent): OfferResult {
    this.running++;
    void this.run(event.subject, [event]).finally(() => this.running--);
    return 'started';
  }

  idle(): boolean {
    return this.running === 0;
  }
}
