import type { GateMode } from './config.ts';
import type { DecisionProvider } from './decision.ts';
import type { AgentEvent, Verdict } from './types.ts';

export interface GateOptions {
  mode: GateMode;
  model: string;
  decision?: { provider: DecisionProvider; threshold: number };
  /** What the person asked to be told about (memory/watches.md), read fresh for every batch. */
  watches: () => string[];
}

export interface GateResult {
  verdicts: Verdict[];
  /** Small-model calls spent on this batch. */
  calls: number;
}

/** Fix 2 (not done yet): one small-model call per batch decides act / ignore / ask. For now everything is "act". */
export async function gate(batch: AgentEvent[], _options: GateOptions): Promise<GateResult> {
  return { verdicts: batch.map((e) => ({ id: e.id, action: 'act', reason: 'no gate yet' })), calls: 0 };
}
