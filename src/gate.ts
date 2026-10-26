import { generateObject } from 'ai';
import { z } from 'zod';
import type { GateMode } from './config.ts';
import { type DecisionProvider, decide, type Questions } from './decision.ts';
import { eventState, GATE_QUESTIONS } from './questions.ts';
import { languageModel, modelsAvailable } from './models.ts';
import type { AgentEvent, Signal, Verdict } from './types.ts';
import { watchTopic } from './watches.ts';

export interface GateOptions {
  mode: GateMode;
  model: string;
  /** decision mode: which decision model, and the confidence below which an event escalates to the LLM. */
  decision?: { provider: DecisionProvider; threshold: number };
  /** What the person asked to be told about (memory/watches.md), read fresh for every batch. */
  watches: () => string[];
}

export interface GateResult {
  verdicts: Verdict[];
  /** Model calls spent on this batch (decision-model calls plus LLM calls). */
  calls: number;
}

const REACTION_ONLY = /^\s*(\+1|same here|me too|thanks!?|thank you!?|lgtm|nice|👍|🎉)\s*$/i;

/**
 * Fix 2: decide act / ignore / ask for every event, with a reason, and which of your watches it matches.
 * Real work that matches no watch is ignored: you only hear about what you asked to hear about.
 *   decision: a decision model (Jev, Clef) answers typed questions per event; confident answers settle it,
 *             unsure ones escalate to the LLM. The same call routes the event to a signal.
 *   model:    one small-LLM call per batch.
 *   rules:    a deterministic stand-in used by evals and when no key is set.
 */
export async function gate(batch: AgentEvent[], options: GateOptions): Promise<GateResult> {
  if (batch.length === 0) return { verdicts: [], calls: 0 };
  const watches = options.watches();
  if (options.mode === 'decision' && options.decision) {
    try {
      return await decisionVerdicts(batch, watches, options.decision, options.model);
    } catch (error) {
      console.warn(`[gate] decision model failed, falling back: ${String(error)}`);
    }
  }
  if (options.mode !== 'rules' && modelsAvailable()) {
    try {
      return { verdicts: await modelVerdicts(batch, watches, options.model), calls: 1 };
    } catch (error) {
      console.warn(`[gate] model call failed, using rules: ${String(error)}`);
    }
  }
  return { verdicts: batch.map((e) => ruleVerdict(e, watches)), calls: 1 };
}

/** Work or a question that matches no watch is not your business: ignore it, and say which watch came closest. */
function requireWatch(verdict: Verdict, watch: string | undefined, nearest = ''): Verdict {
  if (verdict.action === 'ignore') return verdict;
  if (watch) return { ...verdict, watch, reason: `${verdict.reason} · watch: ${watch}` };
  return { ...verdict, action: 'ignore', reason: `no watch matches${nearest ? ` (${nearest})` : ''}` };
}

// ---------- rules: words in the watch against the event, no model ----------

const KIND_HINTS: Array<[RegExp, (kind: string) => boolean]> = [
  [/\b(prs?|pull requests?)\b/i, (k) => k.startsWith('pr_')],
  [/\b(ci|builds?|tests?|pipelines?)\b/i, (k) => k.startsWith('ci_')],
  [/\bissues?\b/i, (k) => k.startsWith('issue_')],
];
const NOT_TOPICS = new Set(('a an the and or of on in to for with about that this any new need needs me my tell watch when it from by ' +
  'pr prs pull request requests ci build builds test tests pipeline pipelines issue issues fail fails failing failed main triage review reviews').split(' '));

/** "PRs about cats": a PR event whose text mentions "cat". "CI fails on main": any CI event. */
export function watchMatches(event: AgentEvent, fullWatch: string): boolean {
  const watch = watchTopic(fullWatch);
  const hints = KIND_HINTS.filter(([re]) => re.test(watch));
  if (hints.length && !hints.some(([, fits]) => fits(event.kind))) return false;
  const topics = (watch.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 2 && !NOT_TOPICS.has(w));
  const text = `${event.title} ${event.body ?? ''}`.toLowerCase();
  return topics.length === 0 || topics.some((w) => text.includes(w.replace(/s$/, '')));
}

function ruleVerdict(event: AgentEvent, watches: string[]): Verdict {
  if ((event.kind === 'issue_comment' || event.kind === 'pr_comment') && REACTION_ONLY.test(event.body ?? '')) {
    return { id: event.id, action: 'ignore', reason: 'reaction-only comment' };
  }
  if (/\b(delete|drop|force[- ]push|rotate (the )?keys?)\b/i.test(`${event.title} ${event.body ?? ''}`)) {
    return { id: event.id, action: 'ask', reason: 'risky request; a human decides' };
  }
  return requireWatch({ id: event.id, action: 'act', reason: `new ${event.kind.replace('_', ' ')}` }, watches.find((w) => watchMatches(event, w)));
}

const PROMPT = `You are the gate of an ambient engineering agent watching a GitHub repo.
For each event decide:
- "act": real work the agent should do (new issue, red CI, real question)
- "ignore": no work needed (reactions like +1/thanks, chatter)
- "ask": the event itself requests something destructive (deleting data, force-pushing, rotating keys).
  A question, a bug report or a pull request to review is "act", not "ask".
and "watch": the number of the person's watch this event is about, or null if none fits.
Give a reason of at most 8 words for every event.`;

const verdictSchema = z.object({
  verdicts: z.array(z.object({
    i: z.number().int(), action: z.enum(['act', 'ignore', 'ask']), watch: z.number().int().nullable(), reason: z.string(),
  })),
});

async function modelVerdicts(batch: AgentEvent[], watches: string[], model: string): Promise<Verdict[]> {
  const lines = batch.map((e, i) => `${i}. [${e.kind}] ${e.actor.login}: ${e.title}${e.body ? ` — ${e.body.slice(0, 200)}` : ''}`);
  const { object } = await generateObject({
    model: languageModel(model), schema: verdictSchema, system: PROMPT,
    prompt: `Watches:\n${watches.map((w, i) => `${i}. ${watchTopic(w)}`).join('\n') || '(none)'}\n\nEvents:\n${lines.join('\n')}`,
  });
  return batch.map((event, i) => {
    const v = object.verdicts.find((entry) => entry.i === i);
    const verdict: Verdict = { id: event.id, action: v?.action ?? 'act', reason: v?.reason ?? 'no reason given' };
    return requireWatch(verdict, typeof v?.watch === 'number' ? watches[v.watch] : undefined);
  });
}

// ---------- decision mode: typed questions, probabilities, a threshold ----------

const SIGNALS: Signal[] = ['ci', 'issues', 'prs'];
const pct = (p: number) => `${Math.round(p * 100)}%`;

/** One yes/no question per watch, asked in the same call as the gate's own questions. */
const watchQuestions = (watches: string[]): Questions =>
  Object.fromEntries(watches.map((w, i) => [`watch${i}`, { type: 'noul', instructions: `Is this event about: ${watchTopic(w)}?` }]));

async function decisionVerdicts(batch: AgentEvent[], watches: string[], options: { provider: DecisionProvider; threshold: number }, model: string): Promise<GateResult> {
  const questions = { ...GATE_QUESTIONS, ...watchQuestions(watches) };
  const results = await Promise.all(batch.map((e) => decide(options.provider, eventState(e), questions)));
  const verdicts: Verdict[] = [];
  const unsure: AgentEvent[] = [];
  batch.forEach((event, i) => {
    const answers = results[i]?.answers ?? {};
    const action = answers.action;
    if (action?.type !== 'choice' || action.confidence < options.threshold) return unsure.push(event);
    const scores = SIGNALS.map((s) => [s, answers[s]?.type === 'noul' ? answers[s].noul : 0] as const).sort((a, b) => b[1] - a[1]);
    const [signal, p] = scores[0] ?? ['issues', 0];
    const watchScores = watches.map((w, j) => {
      const answer = answers[`watch${j}`];
      return [w, answer?.type === 'noul' ? answer.noul : 0] as const;
    }).sort((a, b) => b[1] - a[1]);
    const [watch, wp] = watchScores[0] ?? ['', 0];
    verdicts.push(requireWatch({
      id: event.id,
      action: action.choice as Verdict['action'],
      reason: `${action.choice} ${pct(action.confidence)} · ${options.provider}${action.choice === 'act' ? ` → ${signal} ${pct(p)}` : ''}`,
      signal: p >= 0.5 ? signal : undefined,
      confidence: action.confidence,
    }, wp >= 0.5 ? watch : undefined, watch ? `closest: ${watch} ${pct(wp)}` : ''));
  });
  let calls = batch.length;
  if (unsure.length) {
    // Below the threshold: a second opinion from the LLM, or the rules when no LLM is configured.
    const escalated = modelsAvailable() ? await modelVerdicts(unsure, watches, model).then((v) => ((calls += 1), v)) : unsure.map((e) => ruleVerdict(e, watches));
    for (const v of escalated) {
      const first = results[batch.findIndex((e) => e.id === v.id)]?.answers.action;
      const seen = first?.type === 'choice' ? `${first.choice} ${pct(first.confidence)}` : 'no answer';
      verdicts.push({ ...v, reason: `unsure (${seen}) → ${modelsAvailable() ? 'llm' : 'rules'}: ${v.reason}` });
    }
  }
  return { verdicts, calls };
}
