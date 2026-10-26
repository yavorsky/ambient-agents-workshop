import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { defaultDecisionProvider } from './decision.ts';
import { modelsAvailable } from './models.ts';

/** auto: real GitHub events go to Claude Code, simulated ones (storms, buttons) stay simulated. */
export type WorkerMode = 'sim' | 'claude' | 'model' | 'auto';
export type GateMode = 'decision' | 'model' | 'rules';

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const SELF_MARKER = '<!-- ambient-agent -->';

export const config = {
  port: Number(process.env.PORT ?? 4100),
  instance: process.env.INSTANCE ?? basename(process.cwd()),
  /** owner/name. When set, the GitHub poller runs. */
  repo: process.env.GITHUB_REPO ?? '',
  /** How GitHub events arrive when GITHUB_REPO is set: poll (works anywhere) or webhook (POST /webhooks/github). */
  githubSource: oneOf<'poll' | 'webhook'>(process.env.GITHUB_SOURCE, ['poll', 'webhook'], 'poll'),
  /** The secret GitHub signs webhook deliveries with. Without it, deliveries are accepted unsigned (local only). */
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET ?? '',
  /** Login the agent posts as, so its own comments can be recognized. */
  selfLogin: process.env.AGENT_LOGIN ?? 'ambient-agent',
  workerMode: oneOf<WorkerMode>(process.env.WORKER_MODE, ['sim', 'claude', 'model', 'auto'], 'sim'),
  /** Model for `claude -p --model` in claude mode. Model mode uses MODEL_TIERS.worker (OpenRouter id). */
  claudeModel: process.env.CLAUDE_MODEL ?? 'claude-sonnet-5-5',
  gateMode: oneOf<GateMode>(process.env.GATE_MODE, ['decision', 'model', 'rules'], defaultDecisionProvider() ? 'decision' : modelsAvailable() ? 'model' : 'rules'),
  /** decision mode: Jev or Clef, and the confidence below which the gate asks the LLM instead. */
  decisionProvider: defaultDecisionProvider(),
  decisionThreshold: Number(process.env.DECISION_THRESHOLD ?? 0.6),
  slackWebhook: process.env.SLACK_WEBHOOK_URL ?? '',
  dbPath: process.env.DB_PATH ?? '.data/agent.db',
  /** Multiplies simulated worker durations and the gate batching window. */
  simSpeed: Number(process.env.SIM_SPEED ?? 1),
  registryPath: process.env.REGISTRY_PATH ?? join(homedir(), '.ambient-workshop', 'registry.json'),
};
