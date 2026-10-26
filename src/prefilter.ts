import { SELF_MARKER } from './config.ts';
import type { AgentEvent, FilterResult } from './types.ts';

export interface PrefilterOptions {
  selfLogin: string;
}

/**
 * Fix 1: drop noise in plain code, before any model sees it.
 * Pure function over fields every event already carries.
 */
export function prefilter(event: AgentEvent, { selfLogin }: PrefilterOptions): FilterResult {
  if (event.actor.bot) return { keep: false, reason: `bot: ${event.actor.login}` };
  if (event.actor.login === selfLogin || event.body?.includes(SELF_MARKER)) {
    return { keep: false, reason: 'its own post' };
  }
  if (event.kind === 'issue_edited') return { keep: false, reason: 'edit, not new work' };
  if (event.kind === 'ci_passed') return { keep: false, reason: 'green build' };
  return { keep: true };
}
