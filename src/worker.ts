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

/**
 * Fix 4: one long-lived session per signal. Runs for the same signal queue behind each other and resume
 * the signal's session, so the agent keeps context and reports results instead of its tool calls.
 */
export class Worker {
  private chains = new Map<Signal, Promise<unknown>>();

  constructor(private readonly options: WorkerOptions) {}

  run(signal: Signal, events: AgentEvent[], hooks: RunHooks): Promise<WorkerResult> {
    const previous = this.chains.get(signal) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(async () => {
      hooks.onStart();
      try {
        const sessionId = this.options.store.get(`session:${signal}`);
        const result = await execute(this.options, signal, events, sessionId);
        this.options.store.set(`session:${signal}`, result.sessionId);
        return result;
      } finally {
        hooks.onEnd();
      }
    });
    this.chains.set(signal, next);
    return next;
  }

  sessionCount(): number {
    return (['ci', 'issues', 'prs'] as const).filter((s) => this.options.store.get(`session:${s}`)).length;
  }
}
