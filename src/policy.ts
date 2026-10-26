import type { Clock } from './clock.ts';
import type { Store } from './store.ts';
import type { Decision, WorkerResult } from './types.ts';

/** Fix 5 (not done yet): decide act / draft / ask / note and spend a ping budget. For now everything pings. */
export class Policy {
  constructor(
    _readPreferences: () => string,
    _store: Store,
    _clock: Clock,
  ) {}

  decide(_result: WorkerResult): Decision {
    return { route: 'act', ping: true, why: 'no policy yet' };
  }

  budget(): number {
    return Number.POSITIVE_INFINITY;
  }
}
