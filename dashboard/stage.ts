import { execFile } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { config } from '../src/config.ts';
import { liveInstances } from '../src/registry.ts';

/**
 * The presenter's stage: one worktree named "stage" that the /stage page moves between the step tags.
 * Loading a step force-checks-out the tag there and starts the instance with a fresh database, so never
 * edit files in that worktree by hand.
 */

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const NAME = 'stage';
const STEPS = [0, 1, 2, 3, 4, 5, 6, 7];
const scoresPath = join(root, '.data', 'stage-scores.json');

export const isStep = (n: unknown): n is number => typeof n === 'number' && STEPS.includes(n);

async function mainCheckout(): Promise<string> {
  const { stdout } = await run('git', ['worktree', 'list', '--porcelain'], { cwd: root });
  return stdout.split('\n')[0]?.replace(/^worktree /, '') ?? root;
}

async function stageDir(): Promise<string> {
  const main = await mainCheckout();
  return join(dirname(main), `${basename(main)}-wt`, NAME);
}

function portOf(dir: string): number | undefined {
  try {
    return Number(readFileSync(join(dir, '.data', 'port'), 'utf8').trim()) || undefined;
  } catch {
    return undefined;
  }
}

async function stateOf(port: number): Promise<{ ref: string } | undefined> {
  try {
    const r = await fetch(`http://localhost:${port}/api/state`, { signal: AbortSignal.timeout(800) });
    return (await r.json()) as { ref: string };
  } catch {
    return undefined;
  }
}

export async function status() {
  const dir = await stageDir();
  if (!existsSync(dir)) return { exists: false, running: false };
  const port = portOf(dir);
  const state = port ? await stateOf(port) : undefined;
  return { exists: true, running: Boolean(state), port, ref: state?.ref };
}

let loading: Promise<unknown> | undefined;

/** Moves the stage worktree to step-N and restarts its instance. Resolves once the instance reports the new ref. */
export function load(step: number) {
  if (loading) throw new Error('a step is already loading');
  const task = (async () => {
    const dir = await stageDir();
    const ref = `step-${step}`;
    const wt = (...args: string[]) => run('bash', ['scripts/wt.sh', ...args], { cwd: root });
    if (!existsSync(dir)) {
      await run('git', ['branch', '-D', `wt/${NAME}`], { cwd: root }).catch(() => undefined);
      await wt('new', NAME, ref);
    } else {
      await wt('stop', NAME);
      // What you told the agent to watch is yours, not the step's: keep it across loads.
      const watchesPath = join(dir, 'memory', 'watches.md');
      const watches = existsSync(watchesPath) ? readFileSync(watchesPath, 'utf8') : undefined;
      await run('git', ['checkout', '-q', '-f', '-B', `wt/${NAME}`, ref], { cwd: dir });
      await run('git', ['clean', '-fdq'], { cwd: dir });
      if (watches !== undefined) writeFileSync(watchesPath, watches);
      for (const suffix of ['', '-wal', '-shm']) rmSync(join(dir, '.data', `agent.db${suffix}`), { force: true });
      await wt('start', NAME);
    }
    const port = portOf(dir);
    if (!port) throw new Error('stage worktree has no port');
    for (let i = 0; i < 40; i++) {
      if ((await stateOf(port))?.ref === ref) return { port, ref };
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`stage did not come up at ${ref}; see ${join(dir, '.data', 'server.log')}`);
  })();
  loading = task;
  return task.finally(() => (loading = undefined));
}

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

/** The checkout an instance runs from: the stage worktree, or any registered instance (e.g. the live main checkout). */
async function dirOf(instance: string | undefined): Promise<string> {
  const dir = !instance || instance === NAME ? await stageDir() : liveInstances(config.registryPath).find((e) => e.name === instance)?.cwd;
  if (!dir || !existsSync(dir)) throw new Error(instance && instance !== NAME ? `no running instance "${instance}"` : 'load a step first');
  return dir;
}

/** Runs `pnpm eval` in an instance's checkout and returns each case. */
export async function evals(instance?: string) {
  const dir = await dirOf(instance);
  const output = await run('node_modules/.bin/tsx', ['evals/run.ts'], { cwd: dir, timeout: 30_000, env: { ...process.env, NODE_NO_WARNINGS: '1' } })
    .then((r) => r.stdout)
    .catch((error: { stdout?: string }) => error.stdout ?? '');
  const lines = output.replace(ANSI, '').split('\n');
  const cases: { name: string; ok: boolean; detail?: string }[] = [];
  lines.forEach((line, i) => {
    const m = /^\s+([✓✗]) (.+)$/.exec(line);
    if (!m?.[2]) return;
    const ok = m[1] === '✓';
    cases.push({ name: m[2], ok, detail: ok ? undefined : lines[i + 1]?.trim() });
  });
  return { passing: cases.filter((c) => c.ok).length, total: cases.length, cases };
}

/** Appends a line to an instance's memory/preferences.md; the agent re-reads it on every decision. */
export async function addPreference(text: string, instance?: string) {
  const dir = await dirOf(instance);
  const path = join(dir, 'memory', 'preferences.md');
  if (!existsSync(path)) throw new Error('load a step first');
  appendFileSync(path, `\n- ${text.replace(/\s+/g, ' ').trim()}\n`);
  return { preferences: readFileSync(path, 'utf8') };
}

export function prompt(step: number): string | undefined {
  const path = join(root, 'prompts', `step-${step}.md`);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

/** Storm results per ref, recorded by the page once a storm settles, for the step-by-step chart. */
export function scores(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(readFileSync(scoresPath, 'utf8')) as Record<string, Record<string, number>>;
  } catch {
    return {};
  }
}

export function saveScore(ref: string, stats: Record<string, number>) {
  const all = { ...scores(), [ref]: stats };
  mkdirSync(dirname(scoresPath), { recursive: true });
  writeFileSync(scoresPath, JSON.stringify(all, null, 2));
  return all;
}

export function clearScores() {
  rmSync(scoresPath, { force: true });
  return {};
}
