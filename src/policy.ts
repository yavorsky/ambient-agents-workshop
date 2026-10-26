import type { Clock } from './clock.ts';
import type { Store } from './store.ts';
import type { Decision, WorkerResult } from './types.ts';

const SURE = 0.7;

/** Reads "At most 3 pings a day" (any wording close to it) from memory/preferences.md. */
export function pingBudget(preferences: string): number {
  const match = /at most (\d+) pings?/i.exec(preferences);
  return match?.[1] ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

/**
 * Fix 5: can it be undone × how sure is the agent decides act / draft / ask / note.
 * Pings are a daily budget read from memory; everything else waits for the 09:00 digest.
 */
export class Policy {
  constructor(
    private readonly readPreferences: () => string,
    private readonly store: Store,
    private readonly clock: Clock,
  ) {}

  decide(result: WorkerResult): Decision {
    const sure = result.confidence >= SURE;
    if (result.reversible && sure) return { route: 'act', ping: false, why: 'done; easy to undo' };
    if (!result.reversible && !sure) return { route: 'note', ping: false, why: 'unsure and hard to undo' };
    const route = result.reversible ? 'draft' : 'ask';
    const budget = pingBudget(this.readPreferences());
    if (this.sentToday() >= budget) return { route, ping: false, why: `ping budget (${budget}/day) used` };
    return { route, ping: true, why: route === 'ask' ? 'hard to undo; needs a yes' : 'drafted; needs review' };
  }

  budget(): number {
    return pingBudget(this.readPreferences());
  }

  private sentToday(): number {
    const start = new Date(this.clock.now());
    start.setHours(0, 0, 0, 0);
    return this.store.pingsSentOn(start.getTime(), start.getTime() + 86_400_000);
  }
}
