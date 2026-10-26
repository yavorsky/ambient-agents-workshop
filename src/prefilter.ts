import type { AgentEvent, FilterResult } from './types.ts';

export interface PrefilterOptions {
  selfLogin: string;
}

/** Fix 1 (not done yet): drop noise in plain code. For now everything passes. */
export function prefilter(_event: AgentEvent, _options: PrefilterOptions): FilterResult {
  return { keep: true };
}
