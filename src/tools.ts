import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { SELF_MARKER } from './config.ts';
import type { Watches } from './watches.ts';

const run = promisify(execFile);
const MAX_OUTPUT = 12_000;
const clip = (text: string) => (text.length > MAX_OUTPUT ? `${text.slice(0, MAX_OUTPUT)}\n… (cut)` : text);

export interface ToolDeps {
  /** owner/name the GitHub tools read. Empty: they say no repo is connected. */
  repo: string;
  /** What the agent has seen and sent lately, for "what happened while I was away?". */
  activity(): unknown;
  /** Standing instructions: what to report into the thread. */
  watches: Watches;
  /** The chat may comment on issues and PRs in `repo` (CHAT_CAN_COMMENT=1), never anything else. */
  canComment?: boolean;
}

/** The repo the agent's checkout came from, so the chat can read GitHub even when the poller is off. */
export async function originRepo(): Promise<string> {
  try {
    const { stdout } = await run('git', ['remote', 'get-url', 'origin']);
    return stdout.trim().match(/github\.com[:/]([^/]+\/[^/.]+)/)?.[1] ?? '';
  } catch {
    return '';
  }
}

/** Paths stay inside the checkout. */
function inside(path: string): string {
  const root = process.cwd();
  const full = resolve(root, path);
  if (full !== root && !full.startsWith(`${root}/`)) throw new Error('path is outside the repo');
  return full;
}

const skillsDir = () => join(process.cwd(), '.claude', 'skills');
export const skillNames = () => (existsSync(skillsDir()) ? readdirSync(skillsDir()).filter((n) => existsSync(join(skillsDir(), n, 'SKILL.md'))) : []);

async function gh(repo: string, args: string[]): Promise<string> {
  if (!repo) return 'No GitHub repo connected (set GITHUB_REPO).';
  try {
    const { stdout } = await run('gh', [...args, '--repo', repo], { timeout: 20_000 });
    return clip(stdout.trim() || '(nothing)');
  } catch (error) {
    return `gh failed: ${String((error as { stderr?: string }).stderr ?? error).slice(0, 300)}`;
  }
}

/** The agent's hands: read the repo, read GitHub, load a skill, look at recent activity, keep watches. */
export function buildTools(deps: ToolDeps): ToolSet {
  return {
    list_files: tool({
      description: 'List files and folders at a path in the repo.',
      inputSchema: z.object({ path: z.string().default('.') }),
      execute: async ({ path }) =>
        readdirSync(inside(path))
          .filter((n) => n !== 'node_modules' && n !== '.git')
          .map((n) => (statSync(join(inside(path), n)).isDirectory() ? `${n}/` : n))
          .join('\n'),
    }),
    read_file: tool({
      description: 'Read a text file in the repo.',
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => clip(readFileSync(inside(path), 'utf8')),
    }),
    search: tool({
      description: 'Search the repo for a regular expression; returns file:line matches.',
      inputSchema: z.object({ pattern: z.string() }),
      execute: async ({ pattern }) => {
        try {
          const { stdout } = await run('git', ['grep', '-n', '-E', pattern], { maxBuffer: 4_000_000 });
          return clip(stdout.split('\n').map((l) => relative('.', l)).join('\n'));
        } catch {
          return 'no matches';
        }
      },
    }),
    github_issues: tool({
      description: 'List GitHub issues (open by default).',
      inputSchema: z.object({ state: z.enum(['open', 'closed', 'all']).default('open') }),
      execute: async ({ state }) => gh(deps.repo, ['issue', 'list', '--state', state, '--limit', '20']),
    }),
    github_issue: tool({
      description: 'Read one GitHub issue with its comments.',
      inputSchema: z.object({ number: z.number().int() }),
      execute: async ({ number }) => gh(deps.repo, ['issue', 'view', String(number), '--comments']),
    }),
    github_prs: tool({
      description: 'List open pull requests.',
      inputSchema: z.object({}),
      execute: async () => gh(deps.repo, ['pr', 'list', '--limit', '20']),
    }),
    github_runs: tool({
      description: 'List recent CI runs and whether they passed.',
      inputSchema: z.object({}),
      execute: async () => gh(deps.repo, ['run', 'list', '--limit', '10']),
    }),
    load_skill: tool({
      description: 'Load a skill: step-by-step instructions for a kind of job. Load one before doing that job.',
      inputSchema: z.object({ name: z.string() }),
      execute: async ({ name }) => {
        const path = join(skillsDir(), name, 'SKILL.md');
        return existsSync(path) ? readFileSync(path, 'utf8') : `No skill "${name}". Skills: ${skillNames().join(', ')}`;
      },
    }),
    watch: tool({
      description: 'Start watching for something: from now on, events about it are reported into this thread. Plain words, e.g. "PRs about cats". If the person also says what to do when it happens ("reply that…", "label it…"), put that in `then`: the worker will do it.',
      inputSchema: z.object({ what: z.string(), then: z.string().optional() }),
      execute: async ({ what, then }) => `Watching. All watches:\n${deps.watches.add(then ? `${what} → ${then}` : what).map((w) => `- ${w}`).join('\n')}`,
    }),
    unwatch: tool({
      description: 'Stop watching for something; give the watch as it is listed.',
      inputSchema: z.object({ what: z.string() }),
      execute: async ({ what }) => `Watches now:\n${deps.watches.remove(what).map((w) => `- ${w}`).join('\n') || '(none)'}`,
    }),
    ...(deps.canComment && deps.repo ? {
      github_comment: tool({
        description: `Post a comment on an issue or PR in ${deps.repo}. Only when the person asked for it.`,
        inputSchema: z.object({ number: z.number().int(), body: z.string() }),
        // Pinned to this repo and to commenting; the marker lets the agent recognise its own comment when it comes back.
        execute: async ({ number, body }) => gh(deps.repo, ['issue', 'comment', String(number), '--body', `${body}\n\n${SELF_MARKER}`]),
      }),
    } : {}),
    recent_activity: tool({
      description: 'What the agent has seen and sent lately: events, what happened to each, and notifications.',
      inputSchema: z.object({}),
      execute: async () => clip(JSON.stringify(deps.activity(), null, 1)),
    }),
  };
}
