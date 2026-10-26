import { z } from 'zod';

/**
 * Client for "System One" decision models: Jev (TypeSafe) and Clef / Clef-Flash (Cloudflare Workers AI).
 * They read a state and typed questions and return a probability for every allowed option in one forward
 * pass. No text is generated, so an answer is always one of the options you allowed.
 *   Jev:  TYPESAFE_API_KEY                           https://docs.typesafe.ai
 *   Clef: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN https://developers.cloudflare.com/workers-ai/models/clef/
 */

export const DECISION_PROVIDERS = ['jev', 'clef', 'clef-flash'] as const;
export type DecisionProvider = (typeof DECISION_PROVIDERS)[number];

export type Question =
  | { type: 'choice'; instructions?: string; criteria: Record<string, string> }
  | { type: 'score'; instructions?: string; criteria: string[] }
  | { type: 'noul'; instructions?: string; criteria?: { true?: string; false?: string } };
export type Questions = Record<string, Question>;

/** Validates questions that arrive over HTTP (the playground). */
export const questionsSchema: z.ZodType<Questions> = z.record(
  z.string().regex(/^[a-z][a-z0-9_]{0,40}$/i),
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('choice'), instructions: z.string().optional(), criteria: z.record(z.string().regex(/^[a-z][a-z0-9_]{0,40}$/i), z.string()) }),
    z.object({ type: z.literal('score'), instructions: z.string().optional(), criteria: z.array(z.string()).min(2) }),
    z.object({ type: z.literal('noul'), instructions: z.string().optional(), criteria: z.object({ true: z.string().optional(), false: z.string().optional() }).optional() }),
  ]),
).refine((q) => Object.keys(q).length >= 1 && Object.keys(q).length <= 64, '1 to 64 questions');

export type Answer =
  | { type: 'choice'; choice: string; confidence: number; probabilities: Record<string, number> }
  | { type: 'score'; score: number; confidence: number; probabilities: Record<string, number> }
  | { type: 'noul'; noul: number };

export interface DecisionResult {
  provider: string;
  model: string;
  answers: Record<string, Answer>;
  ms: number;
  inputTokens?: number;
}

export function decisionAvailable(provider: DecisionProvider): boolean {
  if (provider === 'jev') return Boolean(process.env.TYPESAFE_API_KEY);
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);
}

/** DECISION_PROVIDER if set and configured, otherwise the first provider with credentials. */
export function defaultDecisionProvider(): DecisionProvider | undefined {
  const wanted = DECISION_PROVIDERS.find((p) => p === process.env.DECISION_PROVIDER);
  if (wanted && decisionAvailable(wanted)) return wanted;
  return DECISION_PROVIDERS.find(decisionAvailable);
}

function endpoint(provider: DecisionProvider): { url: string; token: string; model: string } {
  if (provider === 'jev') {
    return { url: 'https://api.typesafe.ai/v1/systemone', token: process.env.TYPESAFE_API_KEY ?? '', model: process.env.JEV_MODEL ?? 'jev-latest' };
  }
  const account = process.env.CLOUDFLARE_ACCOUNT_ID ?? '';
  return {
    url: `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/cloudflare/${provider}`,
    token: process.env.CLOUDFLARE_API_TOKEN ?? '',
    model: provider,
  };
}

// The response is untrusted: validate it, then normalise the three answer types.
const probabilityMap = z.union([z.record(z.string(), z.number()), z.array(z.number())]);
const rawAnswer = z.object({
  type: z.enum(['choice', 'score', 'noul']).optional(),
  choice: z.string().optional(),
  score: z.number().optional(),
  noul: z.number().optional(),
  confidence: z.number().optional(),
  probabilities: probabilityMap.optional(),
});
const rawResponse = z.object({
  model: z.string().optional(),
  answers: z.record(z.string(), rawAnswer),
  usage: z.object({ input_tokens: z.number().optional() }).passthrough().optional(),
});

const asRecord = (p: z.infer<typeof probabilityMap> | undefined): Record<string, number> =>
  Array.isArray(p) ? Object.fromEntries(p.map((v, i) => [String(i), v])) : (p ?? {});

function normalise(question: Question, raw: z.infer<typeof rawAnswer>): Answer {
  if (question.type === 'noul') return { type: 'noul', noul: raw.noul ?? 0 };
  const probabilities = asRecord(raw.probabilities);
  const top = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0];
  if (question.type === 'score') {
    return { type: 'score', score: raw.score ?? Number(top?.[0] ?? 0), confidence: raw.confidence ?? top?.[1] ?? 0, probabilities };
  }
  return { type: 'choice', choice: raw.choice ?? top?.[0] ?? '', confidence: raw.confidence ?? top?.[1] ?? 0, probabilities };
}

export async function decide(provider: DecisionProvider, state: unknown, questions: Questions): Promise<DecisionResult> {
  if (!decisionAvailable(provider)) throw new Error(`${provider} is not configured; see .env.example`);
  const { url, token, model } = endpoint(provider);
  const started = performance.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, state, questions }),
    signal: AbortSignal.timeout(15_000),
  });
  const ms = Math.round(performance.now() - started);
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(`${provider} ${response.status}: ${JSON.stringify(body).slice(0, 300)}`);
  // Workers AI wraps the payload as { result, success, errors }.
  const payload = typeof body === 'object' && body !== null && 'result' in body ? (body as { result: unknown }).result : body;
  const parsed = rawResponse.parse(payload);
  const answers: Record<string, Answer> = {};
  for (const [id, question] of Object.entries(questions)) {
    const raw = parsed.answers[id];
    if (raw) answers[id] = normalise(question, raw);
  }
  return { provider, model: parsed.model ?? model, answers, ms, inputTokens: parsed.usage?.input_tokens };
}
