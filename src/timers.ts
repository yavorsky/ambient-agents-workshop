import type { Clock } from './clock.ts';
import type { Store } from './store.ts';
import type { AgentEvent } from './types.ts';

/** Timers (not done yet): wakeups the worker books for itself. For now they are dropped. */
export class Timers {
  constructor(
    _store: Store,
    _clock: Clock,
  ) {}

  schedule(_subject: string, _inMinutes: number, _reason: string): void {}

  due(): AgentEvent[] {
    return [];
  }

  pending(): Array<{ at: number; subject: string; reason: string }> {
    return [];
  }
}
