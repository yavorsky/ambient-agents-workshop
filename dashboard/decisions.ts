import { generateObject } from 'ai';
import { z } from 'zod';
import { type Answer, DECISION_PROVIDERS, type DecisionProvider, type DecisionResult, decide, decisionAvailable, type Questions } from '../src/decision.ts';
import { languageModel, MODEL_TIERS, modelsAvailable } from '../src/models.ts';
import { eventState, GATE_QUESTIONS } from '../src/questions.ts';
import { buildStorm } from '../src/sources/sim.ts';
import type { AgentEvent, EventKind, Signal } from '../src/types.ts';
import { signalOf } from '../src/worker.ts';

/** The /decisions playground: the same state and questions through every way the gate can decide. */

export type PlaygroundProvider = DecisionProvider | 'llm' | 'rules';

const LABELS: Record<PlaygroundProvider, string> = {
  jev: 'Jev · TypeSafe',
  clef: 'Clef · Cloudflare',
  'clef-flash': 'Clef-Flash · Cloudflare',
  llm: `LLM · ${MODEL_TIERS.gate}`,
  rules: 'No gate · kind only',
};
const NEEDS: Record<PlaygroundProvider, string> = {
  jev: 'TYPESAFE_API_KEY',
  clef: 'CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN',
  'clef-flash': 'CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN',
  llm: 'OPENROUTER_API_KEY',
  rules: '',
};

export const isPlaygroundProvider = (p: unknown): p is PlaygroundProvider => typeof p === 'string' && p in LABELS;

export function providers() {
  return (Object.keys(LABELS) as PlaygroundProvider[]).map((id) => ({
    id,
    label: LABELS[id],
    kind: id === 'llm' ? 'llm' : id === 'rules' ? 'rules' : 'decision',
    available: id === 'rules' ? true : id === 'llm' ? modelsAvailable() : decisionAvailable(id),
    needs: NEEDS[id],
  }));
}

export type PlaygroundResult = DecisionResult & { outputTokens?: number };

export function run(provider: PlaygroundProvider, state: unknown, questions: Questions): Promise<PlaygroundResult> {
  if (provider === 'llm') return llm(state, questions);
  if (provider === 'rules') return Promise.resolve(rules(state, questions));
  return decide(provider, state, questions);
}

// ---------- the LLM, asked to estimate probabilities (for contrast: generated, not calibrated) ----------

function llmSchema(questions: Questions) {
  const prob = z.number().min(0).max(1);
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [id, q] of Object.entries(questions)) {
    if (q.type === 'noul') shape[id] = z.object({ probability_true: prob });
    else {
      const keys = q.type === 'choice' ? Object.keys(q.criteria) : q.criteria.map((_, i) => String(i));
      shape[id] = z.object({ probabilities: z.object(Object.fromEntries(keys.map((k) => [k, prob]))) });
    }
  }
  return z.object(shape);
}

function describe(questions: Questions): string {
  return Object.entries(questions)
    .map(([id, q]) => {
      const head = `${id} (${q.type}): ${q.instructions ?? id}`;
      if (q.type === 'choice') return `${head}\n${Object.entries(q.criteria).map(([k, v]) => `  - ${k}: ${v}`).join('\n')}`;
      if (q.type === 'score') return `${head}\n${q.criteria.map((v, i) => `  - ${i}: ${v}`).join('\n')}`;
      return `${head}\n  answer the probability that it is true`;
    })
    .join('\n\n');
}

async function llm(state: unknown, questions: Questions): Promise<PlaygroundResult> {
  if (!modelsAvailable()) throw new Error('no LLM configured: set OPENROUTER_API_KEY');
  const started = performance.now();
  const result = await generateObject({
    model: languageModel(MODEL_TIERS.gate),
    schema: llmSchema(questions),
    system: 'Answer every question about the state. For each question give a probability per option; they must sum to 1.',
    prompt: `State:\n${typeof state === 'string' ? state : JSON.stringify(state, null, 2)}\n\nQuestions:\n${describe(questions)}`,
  });
  const ms = Math.round(performance.now() - started);
  const object = result.object as Record<string, { probability_true?: number; probabilities?: Record<string, number> }>;
  const answers: Record<string, Answer> = {};
  for (const [id, q] of Object.entries(questions)) {
    const a = object[id];
    if (!a) continue;
    if (q.type === 'noul') {
      answers[id] = { type: 'noul', noul: a.probability_true ?? 0 };
      continue;
    }
    const probabilities = a.probabilities ?? {};
    const [top, p] = Object.entries(probabilities).sort((x, y) => y[1] - x[1])[0] ?? ['', 0];
    answers[id] = q.type === 'choice'
      ? { type: 'choice', choice: top, confidence: p, probabilities }
      : { type: 'score', score: Object.entries(probabilities).reduce((sum, [k, v]) => sum + Number(k) * v, 0), confidence: p, probabilities };
  }
  return { provider: 'llm', model: MODEL_TIERS.gate, answers, ms, inputTokens: result.usage?.inputTokens, outputTokens: result.usage?.outputTokens };
}

// ---------- no gate: what the pipeline knows from the event kind alone (always act, route by kind) ----------

const SIGNALS: Signal[] = ['ci', 'issues', 'prs'];

function asEvent(state: unknown): AgentEvent {
  const s = (typeof state === 'object' && state !== null ? state : { title: String(state) }) as Record<string, unknown>;
  const kind = (typeof s.kind === 'string' ? s.kind : 'issue_comment') as EventKind;
  return {
    id: 'playground', source: 'sim', kind,
    actor: { login: String(s.from ?? 'someone'), bot: false },
    subject: String(s.subject ?? 'demo/app#1'), title: String(s.title ?? ''),
    body: typeof s.body === 'string' ? s.body : undefined, at: 0,
  };
}

function rules(state: unknown, questions: Questions): DecisionResult {
  const event = asEvent(state);
  const answers: Record<string, Answer> = {};
  const action = questions.action;
  if (action?.type === 'choice' && 'act' in action.criteria) {
    answers.action = { type: 'choice', choice: 'act', confidence: 1, probabilities: Object.fromEntries(Object.keys(action.criteria).map((k) => [k, k === 'act' ? 1 : 0])) };
  }
  for (const s of SIGNALS) if (questions[s]?.type === 'noul') answers[s] = { type: 'noul', noul: signalOf(event) === s ? 1 : 0 };
  return { provider: 'rules', model: 'event kind', answers, ms: 0 };
}

// ---------- presets ----------

interface Expected { action: 'act' | 'ignore' | 'ask'; signal?: Signal }

const sample = (kind: EventKind, from: string, subject: string, title: string, body?: string) => ({ kind, from, subject, title, body });

/** Hand-picked cases where kind-based rules and an understanding model disagree. */
const EXAMPLES: { label: string; state: ReturnType<typeof sample>; expected: Expected }[] = [
  { label: 'Comment that is really about CI', expected: { action: 'act', signal: 'ci' },
    state: sample('issue_comment', 'omar', 'demo/app#14', 'Re: Timeout on large repos', 'CI on main has been red since this morning, the inbox test times out every run.') },
  { label: 'Risky request in an issue', expected: { action: 'ask', signal: 'issues' },
    state: sample('issue_opened', 'lena', 'demo/app#120', 'Clean up staging', 'Please wipe the staging database and rewrite main history so the leaked token is gone.') },
  { label: '+1 that carries new information', expected: { action: 'act', signal: 'issues' },
    state: sample('issue_comment', 'chen', 'demo/app#11', '+1', '+1, same on Safari 18.2, and it also breaks the logout button.') },
  { label: 'Plain reaction', expected: { action: 'ignore' },
    state: sample('pr_comment', 'sam', 'demo/app#51', 'LGTM', 'LGTM 🚀') },
  { label: 'Question in a PR thread', expected: { action: 'act', signal: 'prs' },
    state: sample('pr_comment', 'ivan', 'demo/app#52', 'Question', 'Should this retry also cover the GitHub poller, or is that a separate PR?') },
  { label: 'Feature request', expected: { action: 'act', signal: 'issues' },
    state: sample('issue_opened', 'maria', 'demo/app#121', 'Support GitLab', 'Would be great if the agent could watch GitLab merge requests too.') },
];

function expectedFor({ id, kind }: AgentEvent): Expected | undefined {
  if (kind === 'ci_failed') return { action: 'act', signal: 'ci' };
  if (id.startsWith('react-')) return { action: 'ignore' };
  if (id.startsWith('q-') || id.startsWith('issue-')) return { action: 'act', signal: 'issues' };
  if (id.startsWith('pr-')) return { action: 'act', signal: 'prs' };
  return undefined;
}

/** What reaches the gate from the storm: one entry per unique event that has an expected label (noise the
 * prefilter drops has none), so this works at every step, even before the prefilter exists. */
function stormForGate() {
  const seen = new Set<string>();
  return buildStorm()
    .filter((e) => !seen.has(e.id) && seen.add(e.id))
    .flatMap((e) => {
      const expected = expectedFor(e);
      return expected ? [{ id: e.id, state: eventState(e), expected }] : [];
    });
}

export function presets() {
  return { questions: GATE_QUESTIONS, examples: EXAMPLES, storm: stormForGate(), providers: DECISION_PROVIDERS };
}

// ---------- the race: ten events, a decision model against the classic LLM gate ----------

/** The classic gate from step 2, with routing added so both sides answer the same two things. */
const CLASSIC_PROMPT = `You are the gate of an ambient engineering agent watching a GitHub repo.
For each event decide the action:
- "act": real work the agent should do (new issue, red CI, real question)
- "ignore": no work needed (reactions like +1/thanks, chatter)
- "ask": needs a human decision before any work (deletes, force-pushes, anything risky)
and the signal it belongs to: "ci" (builds, tests, CI runs), "issues" (issues and questions), "prs" (pull requests and reviews).
Give a reason of at most 8 words for every event.`;

const classicSchema = z.object({
  verdicts: z.array(z.object({ i: z.number().int(), action: z.enum(['act', 'ignore', 'ask']), signal: z.enum(['ci', 'issues', 'prs']), reason: z.string() })),
});

async function classic(states: unknown[]) {
  const lines = states.map((state, i) => `${i}. ${JSON.stringify(state)}`);
  const result = await generateObject({ model: languageModel(MODEL_TIERS.gate), schema: classicSchema, system: CLASSIC_PROMPT, prompt: lines.join('\n') });
  return { verdicts: result.object.verdicts, inputTokens: result.usage?.inputTokens, outputTokens: result.usage?.outputTokens };
}

export const RACE_LANES = ['clef-flash', 'clef', 'jev', 'classic-each', 'classic-batch'] as const;
export type RaceLane = (typeof RACE_LANES)[number];
export const isRaceLane = (l: unknown): l is RaceLane => RACE_LANES.some((x) => x === l);

export function raceLanes() {
  const llmLabel = `Classic LLM gate · ${MODEL_TIERS.gate}`;
  return RACE_LANES.map((id) => {
    const decision = id !== 'classic-each' && id !== 'classic-batch';
    return {
      id,
      label: decision ? `${LABELS[id]} · one call per event` : id === 'classic-each' ? `${llmLabel} · one call per event` : `${llmLabel} · one call for all`,
      kind: decision ? 'decision' : 'llm',
      available: decision ? decisionAvailable(id) : modelsAvailable(),
      needs: decision ? NEEDS[id] : NEEDS.llm,
    };
  });
}

/** One answered event in a race. `t` is milliseconds since the lane started, measured on the server. */
export interface RaceHit {
  i: number;
  t: number;
  action?: string;
  signal?: Signal;
  confidence?: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
}

const topSignal = (answers: Record<string, Answer>): Signal | undefined => {
  const [signal, p] = SIGNALS.map((s) => [s, answers[s]?.type === 'noul' ? answers[s].noul : 0] as const).sort((a, b) => b[1] - a[1])[0] ?? [];
  return signal && (p ?? 0) >= 0.5 ? signal : undefined;
};

/** Runs every state through one lane at once and reports each answer as it lands. */
export async function race(lane: RaceLane, states: unknown[], onHit: (hit: RaceHit) => void): Promise<void> {
  const started = performance.now();
  const at = () => Math.round(performance.now() - started);
  const fail = (i: number, error: unknown) => onHit({ i, t: at(), error: error instanceof Error ? error.message : String(error) });
  if (lane === 'classic-batch') {
    try {
      const r = await classic(states);
      const t = at();
      states.forEach((_, i) => {
        const v = r.verdicts.find((x) => x.i === i);
        // One call for all: each event carries an equal share of the tokens.
        const share = (n?: number) => (n === undefined ? undefined : n / states.length);
        onHit(v ? { i, t, action: v.action, signal: v.signal, inputTokens: share(r.inputTokens), outputTokens: share(r.outputTokens) } : { i, t, error: 'no verdict for this event' });
      });
    } catch (error) {
      states.forEach((_, i) => fail(i, error));
    }
    return;
  }
  await Promise.all(states.map(async (state, i) => {
    try {
      if (lane === 'classic-each') {
        const r = await classic([state]);
        const v = r.verdicts[0];
        return onHit(v ? { i, t: at(), action: v.action, signal: v.signal, inputTokens: r.inputTokens, outputTokens: r.outputTokens } : { i, t: at(), error: 'no verdict' });
      }
      const r = await decide(lane, state, GATE_QUESTIONS);
      const action = r.answers.action;
      onHit({
        i, t: at(),
        action: action?.type === 'choice' ? action.choice : undefined,
        confidence: action?.type === 'choice' ? action.confidence : undefined,
        // Like the gate: no confident signal means route by event kind.
        signal: topSignal(r.answers) ?? signalOf(asEvent(state)),
        inputTokens: r.inputTokens,
      });
    } catch (error) {
      fail(i, error);
    }
  }));
}

// ---------- prices, for "cost per 1,000 events" ----------

/** Per input token, output not charged (Cloudflare Workers AI pricing, Oct 2026). Jev has no public price in our sources. */
const PER_INPUT_TOKEN = { clef: 0.24 / 1_000_000, 'clef-flash': 0.038 / 1_000_000 };
let llmPrice: Promise<{ prompt: number; completion: number } | null> | undefined;

/** The gate model's price per token from OpenRouter's public model list, cached for the process. */
export async function prices() {
  llmPrice ??= fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(8_000) })
    .then((r) => r.json())
    .then((data: unknown) => {
      const list = z.object({ data: z.array(z.object({ id: z.string(), pricing: z.object({ prompt: z.string(), completion: z.string() }) })) }).parse(data).data;
      const model = list.find((m) => m.id === MODEL_TIERS.gate);
      return model ? { prompt: Number(model.pricing.prompt), completion: Number(model.pricing.completion) } : null;
    })
    .catch(() => null);
  return { model: MODEL_TIERS.gate, llm: await llmPrice, input: PER_INPUT_TOKEN };
}
