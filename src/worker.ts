import { execute, type RunnerOptions } from './runners.ts';
import type { AgentEvent, Signal, WorkerResult } from './types.ts';

export type WorkerOptions = RunnerOptions;

export interface RunHooks {
  onStart(): void;
  onEnd(): void;
}

export function signalOf(event: AgentEvent): Signal {
  if (event.kind.startsWith('ci_') || event.subject.startsWith('ci:')) return 'ci';
  if (event.kind.startsWith('pr_')) return 'prs';
  return 'issues';
}

/** Fix 4 (not done yet): one session per signal. For now every run is a fresh session, all at once. */
export class Worker {
  private runCount = 0;

  constructor(private readonly options: WorkerOptions) {}

  async run(signal: Signal, events: AgentEvent[], hooks: RunHooks): Promise<WorkerResult> {
    this.runCount++;
    hooks.onStart();
    try {
      return await execute(this.options, signal, events, undefined);
    } finally {
      hooks.onEnd();
    }
  }

  sessionCount(): number {
    return this.runCount;
  }
}
