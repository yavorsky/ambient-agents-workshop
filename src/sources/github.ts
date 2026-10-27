import { execFile } from 'node:child_process';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Store } from '../store.ts';
import type { AgentEvent } from '../types.ts';

const run = promisify(execFile);

interface GhUser { login: string; type: string }
interface GhIssue { id: number; number: number; title: string; body: string | null; html_url: string; user: GhUser; pull_request?: unknown }
interface GhComment { id: number; body: string; html_url: string; issue_url: string; user: GhUser }
interface GhRun { id: number; name: string; head_branch: string; conclusion: string | null; html_url: string }

/** What a webhook delivery carries that we use. GitHub sends much more. */
export interface WebhookPayload {
  action?: string;
  repository?: { full_name: string };
  issue?: GhIssue;
  pull_request?: GhIssue;
  comment?: GhComment;
  workflow_run?: GhRun;
  [key: string]: unknown;
}

const actor = (u: GhUser) => ({ login: u.login, bot: u.type === 'Bot' || u.login.endsWith('[bot]') });

// ---------- webhooks: GitHub calls us ----------

/**
 * GitHub signs every delivery: X-Hub-Signature-256 is "sha256=" + HMAC-SHA256(secret, raw body).
 * Compare in constant time, so the check does not leak how much of a forged signature was right.
 */
export function verifySignature(secret: string, body: string, header: string | undefined): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(body).digest('hex')}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * One delivery becomes the events it means; anything else becomes none. Ids match the poller's, so the same
 * issue seen by both sources is one event (the inbox drops repeated ids).
 */
export function fromWebhook(name: string, delivery: string, p: WebhookPayload): AgentEvent[] {
  const repo = p.repository?.full_name ?? 'unknown/repo';
  const at = Date.now();
  const issue = p.issue ?? p.pull_request;
  if ((name === 'issues' || name === 'pull_request') && issue && (p.action === 'opened' || p.action === 'edited')) {
    const pr = name === 'pull_request';
    return [{
      id: p.action === 'opened' ? `issue-${issue.id}` : `edit-${issue.id}-${delivery}`, source: 'github',
      kind: pr ? 'pr_opened' : p.action === 'opened' ? 'issue_opened' : 'issue_edited', actor: actor(issue.user),
      subject: `${repo}#${issue.number}`, title: issue.title, body: issue.body ?? '', url: issue.html_url, at,
    }];
  }
  if (name === 'issue_comment' && p.action === 'created' && p.comment && p.issue) {
    return [{
      id: `comment-${p.comment.id}`, source: 'github', kind: p.issue.pull_request ? 'pr_comment' : 'issue_comment',
      actor: actor(p.comment.user), subject: `${repo}#${p.issue.number}`,
      title: p.comment.body.split('\n')[0]?.slice(0, 80) ?? '', body: p.comment.body, url: p.comment.html_url, at,
    }];
  }
  const runInfo = p.workflow_run;
  if (name === 'workflow_run' && p.action === 'completed' && runInfo && (runInfo.conclusion === 'failure' || runInfo.conclusion === 'success')) {
    return [{
      id: `run-${runInfo.id}`, source: 'github', kind: runInfo.conclusion === 'failure' ? 'ci_failed' : 'ci_passed',
      actor: { login: 'github-actions', bot: false }, subject: `ci:${runInfo.head_branch}`,
      title: `${runInfo.name} ${runInfo.conclusion} on ${runInfo.head_branch}`, url: runInfo.html_url, at,
    }];
  }
  return [];
}

// ---------- polling: we ask GitHub ----------

async function gh<T>(path: string): Promise<T> {
  const { stdout } = await run('gh', ['api', path], { maxBuffer: 10 * 1024 * 1024 });
  return JSON.parse(stdout) as T;
}

/**
 * Polls the repo with the gh CLI (issues, comments, workflow runs) and turns new items into events. Works from a
 * laptop with no public URL; costs a few API calls per interval and adds up to one interval of delay.
 * The first poll only records what already exists, so history is not replayed as new work.
 */
export class GitHubPoller {
  private seen: Set<string>;
  private bootstrapped: boolean;

  constructor(
    private readonly repo: string,
    private readonly store: Store,
    private readonly ingest: (event: AgentEvent) => void,
  ) {
    const saved = store.get('gh-seen');
    this.seen = new Set(saved ? (JSON.parse(saved) as string[]) : []);
    this.bootstrapped = saved !== undefined;
  }

  start(intervalMs = 20_000): NodeJS.Timeout {
    void this.poll();
    return setInterval(() => void this.poll(), intervalMs);
  }

  async poll(): Promise<void> {
    try {
      const [issues, comments, runs] = await Promise.all([
        gh<GhIssue[]>(`repos/${this.repo}/issues?state=all&sort=created&direction=desc&per_page=30`),
        gh<GhComment[]>(`repos/${this.repo}/issues/comments?sort=created&direction=desc&per_page=30`),
        gh<{ workflow_runs: GhRun[] }>(`repos/${this.repo}/actions/runs?per_page=10&status=completed`),
      ]);
      const fresh: AgentEvent[] = [];
      for (const i of issues) {
        this.track(`issue-${i.id}`, fresh, () => ({
          id: `issue-${i.id}`, source: 'github', kind: i.pull_request ? 'pr_opened' : 'issue_opened', actor: actor(i.user),
          subject: `${this.repo}#${i.number}`, title: i.title, body: i.body ?? '', url: i.html_url, at: Date.now(),
        }));
      }
      for (const c of comments) {
        const number = c.issue_url.split('/').pop();
        this.track(`comment-${c.id}`, fresh, () => ({
          id: `comment-${c.id}`, source: 'github', kind: c.html_url.includes('/pull/') ? 'pr_comment' : 'issue_comment', actor: actor(c.user),
          subject: `${this.repo}#${number}`, title: c.body.split('\n')[0]?.slice(0, 80) ?? '', body: c.body, url: c.html_url, at: Date.now(),
        }));
      }
      for (const r of runs.workflow_runs) {
        if (r.conclusion !== 'failure' && r.conclusion !== 'success') continue;
        this.track(`run-${r.id}`, fresh, () => ({
          id: `run-${r.id}`, source: 'github', kind: r.conclusion === 'failure' ? 'ci_failed' : 'ci_passed', actor: { login: 'github-actions', bot: false },
          subject: `ci:${r.head_branch}`, title: `${r.name} ${r.conclusion} on ${r.head_branch}`, url: r.html_url, at: Date.now(),
        }));
      }
      this.store.set('gh-seen', JSON.stringify([...this.seen].slice(-1000)));
      if (this.bootstrapped) fresh.reverse().forEach((e) => this.ingest(e));
      this.bootstrapped = true;
    } catch (error) {
      console.warn(`[github] poll failed: ${String(error).slice(0, 200)}`);
    }
  }

  private track(key: string, fresh: AgentEvent[], make: () => AgentEvent): void {
    if (this.seen.has(key)) return;
    this.seen.add(key);
    fresh.push(make());
  }
}
