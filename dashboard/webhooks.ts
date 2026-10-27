import { createHmac, randomUUID } from 'node:crypto';

const REPO = 'yavorsky/ambient-agents-workshop';
const user = (login: string) => ({ login, type: 'User' });
let next = 9000;

/** Real-shaped GitHub deliveries (trimmed), for showing step 2 without waiting for GitHub. */
const SAMPLES = {
  issue: () => ['issues', { action: 'opened', repository: { full_name: REPO }, issue: {
    id: ++next, number: next % 1000, title: 'Cats are missing from the welcome page', body: 'There used to be a cat. Where is the cat?',
    html_url: `https://github.com/${REPO}/issues/${next % 1000}`, user: user('maria'),
  } }],
  pr: () => ['pull_request', { action: 'opened', repository: { full_name: REPO }, pull_request: {
    id: ++next, number: next % 1000, title: 'Add a cat of the day to the welcome page', body: 'A random cat and a cat fact on first visit.',
    html_url: `https://github.com/${REPO}/pull/${next % 1000}`, user: user('lena'),
  } }],
  comment: () => ['issue_comment', { action: 'created', repository: { full_name: REPO },
    issue: { id: 1, number: 12, title: 'Login broken on Safari', body: null, html_url: '', user: user('sam') },
    comment: { id: ++next, body: 'Still broken on Safari 18, is there a workaround?', html_url: `https://github.com/${REPO}/issues/12#issuecomment-${next}`, issue_url: '', user: user('chen') },
  }],
  ci: () => ['workflow_run', { action: 'completed', repository: { full_name: REPO }, workflow_run: {
    id: ++next, name: 'CI', head_branch: 'main', conclusion: 'failure', html_url: `https://github.com/${REPO}/actions/runs/${next}`,
  } }],
} satisfies Record<string, () => [string, unknown]>;

export type Sample = keyof typeof SAMPLES;
export const isSample = (s: unknown): s is Sample => typeof s === 'string' && s in SAMPLES;
export const SAMPLE_NAMES = Object.keys(SAMPLES);

/** Signs a sample like GitHub does (or with the wrong secret) and posts it to an agent's /webhooks/github. */
export async function deliver(port: number, sample: Sample, forged: boolean) {
  const [name, payload] = SAMPLES[sample]();
  const body = JSON.stringify(payload);
  const secret = forged ? 'not-the-secret' : (process.env.GITHUB_WEBHOOK_SECRET ?? '');
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-github-event': name, 'x-github-delivery': randomUUID() };
  if (secret) headers['x-hub-signature-256'] = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
  const r = await fetch(`http://localhost:${port}/webhooks/github`, { method: 'POST', headers, body });
  return { status: r.status, event: name, response: await r.text() };
}
