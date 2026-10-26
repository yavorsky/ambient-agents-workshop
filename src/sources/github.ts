import type { Store } from '../store.ts';
import type { AgentEvent } from '../types.ts';

/** What a webhook delivery carries that we use. GitHub sends much more. */
export interface WebhookPayload {
  action?: string;
  repository?: { full_name: string };
  [key: string]: unknown;
}

/** Step 2 (not done yet): check GitHub's signature on a webhook delivery (X-Hub-Signature-256). */
export function verifySignature(_secret: string, _body: string, _header: string | undefined): boolean {
  throw new Error('verifySignature is not implemented yet (prompts/step-2.md)');
}

/** Step 2 (not done yet): turn one webhook delivery into the events it means. */
export function fromWebhook(_name: string, _delivery: string, _payload: WebhookPayload): AgentEvent[] {
  throw new Error('fromWebhook is not implemented yet (prompts/step-2.md)');
}

/** Step 2 (not done yet): poll the repo for new issues, comments and CI runs. */
export class GitHubPoller {
  constructor(_repo: string, _store: Store, _ingest: (event: AgentEvent) => void) {}

  start(intervalMs = 20_000): NodeJS.Timeout {
    console.warn('[github] polling is not implemented yet (prompts/step-2.md)');
    return setInterval(() => undefined, intervalMs);
  }
}
