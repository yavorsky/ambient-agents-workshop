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

export function run(provider: PlaygroundProvider, state: unknown, questions: Questions): Promise<DecisionResult> {
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

async function llm(state: unknown, questions: Questions): Promise<DecisionResult> {
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
  return { provider: 'llm', model: MODEL_TIERS.gate, answers, ms, inputTokens: result.usage?.inputTokens };
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
