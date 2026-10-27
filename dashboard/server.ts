import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { config } from '../src/config.ts';
import { liveInstances } from '../src/registry.ts';
import { questionsSchema } from '../src/decision.ts';
import * as decisions from './decisions.ts';
import * as stage from './stage.ts';

const port = Number(process.env.DASHBOARD_PORT ?? 4000);
const homePage = new URL('./home.html', import.meta.url);
const agentsPage = new URL('./agents.html', import.meta.url);
const stagePage = new URL('./stage.html', import.meta.url);
const presenterPage = new URL('./presenter.html', import.meta.url);
const decisionsPage = new URL('./decisions.html', import.meta.url);
const chatPage = new URL('./chat.html', import.meta.url);
const patternPath = new URL('../dj/pattern.json', import.meta.url);
const chaptersPath = new URL('./stage-chapters.js', import.meta.url);

function json(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(data));
}

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = '';
  for await (const chunk of req) raw += String(chunk);
  const parsed: unknown = raw ? JSON.parse(raw) : {};
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
}

/** /api/decide/*: the decision-model playground. */
async function decideRoute(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
  if (req.method === 'GET' && path === '/api/decide/providers') return json(res, 200, decisions.providers());
  if (req.method === 'GET' && path === '/api/decide/presets') return json(res, 200, decisions.presets());
  if (req.method === 'GET' && path === '/api/decide/lanes') return json(res, 200, decisions.raceLanes());
  if (req.method === 'GET' && path === '/api/decide/prices') return json(res, 200, await decisions.prices());
  if (req.method === 'POST' && path === '/api/decide/race') {
    const { lane, states } = await body(req);
    if (!decisions.isRaceLane(lane)) return json(res, 400, { error: 'unknown lane' });
    if (!Array.isArray(states) || states.length < 1 || states.length > 20 || JSON.stringify(states).length > 40_000) {
      return json(res, 400, { error: 'states: 1 to 20, at most 40,000 characters' });
    }
    // One JSON line per answered event, as it lands, so the page can draw the race live.
    res.writeHead(200, { 'content-type': 'application/x-ndjson', 'cache-control': 'no-store' });
    await decisions.race(lane, states, (hit) => res.write(`${JSON.stringify(hit)}\n`));
    return void res.end();
  }
  if (req.method === 'POST' && path === '/api/decide') {
    const { provider, state, questions } = await body(req);
    if (!decisions.isPlaygroundProvider(provider)) return json(res, 400, { error: 'unknown provider' });
    const parsed = questionsSchema.safeParse(questions);
    if (!parsed.success) return json(res, 400, { error: `questions: ${parsed.error.issues[0]?.message ?? 'invalid'}` });
    if (state === undefined || JSON.stringify(state).length > 20_000) return json(res, 400, { error: 'state: required, at most 20,000 characters' });
    return json(res, 200, await decisions.run(provider, state, parsed.data));
  }
  json(res, 404, { error: 'not found' });
}

/** /api/stage/*: the presenter page's controls over the "stage" worktree. */
async function stageRoute(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
  const post = req.method === 'POST';
  if (!post && path === '/api/stage') return json(res, 200, await stage.status());
  if (post && path === '/api/stage/load') {
    const { step } = await body(req);
    if (!stage.isStep(step)) return json(res, 400, { error: 'step must be 0..6' });
    return json(res, 200, await stage.load(step));
  }
  if (post && path === '/api/stage/eval') {
    const { instance } = await body(req);
    return json(res, 200, await stage.evals(typeof instance === 'string' ? instance : undefined));
  }
  if (post && path === '/api/stage/preference') {
    const { text, instance } = await body(req);
    if (typeof text !== 'string' || !text.trim() || text.length > 300) return json(res, 400, { error: 'text: 1..300 chars' });
    return json(res, 200, await stage.addPreference(text, typeof instance === 'string' ? instance : undefined));
  }
  if (!post && path === '/api/stage/prompt') {
    const step = Number(new URL(req.url ?? '', 'http://x').searchParams.get('step'));
    const text = stage.isStep(step) ? stage.prompt(step) : undefined;
    return text === undefined ? json(res, 404, { error: 'no prompt for that step' }) : json(res, 200, { text });
  }
  if (path === '/api/stage/scores') {
    if (!post) return json(res, 200, stage.scores());
    const { ref, stats, clear } = await body(req);
    if (clear === true) return json(res, 200, stage.clearScores());
    if (typeof ref !== 'string' || typeof stats !== 'object' || stats === null) return json(res, 400, { error: 'ref and stats required' });
    return json(res, 200, stage.saveScore(ref, stats as Record<string, number>));
  }
  json(res, 404, { error: 'not found' });
}

interface InstanceState {
  instance: string;
  ref: string;
  port: number;
  workerMode: string;
  stats: Record<string, number>;
}

/** Everything the /dj skill needs: per-instance stats and totals across all running worktrees. */
async function summary() {
  const states = await Promise.all(
    liveInstances(config.registryPath).map(async (entry) => {
      try {
        const r = await fetch(`http://localhost:${entry.port}/api/state`, { signal: AbortSignal.timeout(800) });
        const s = (await r.json()) as InstanceState;
        return { name: s.instance, ref: s.ref, port: s.port, workerMode: s.workerMode, stats: s.stats };
      } catch {
        return undefined;
      }
    }),
  );
  const instances = states.filter((s) => s !== undefined);
  const totals: Record<string, number> = {};
  for (const i of instances) for (const [k, v] of Object.entries(i.stats)) totals[k] = (totals[k] ?? 0) + v;
  return { at: new Date().toISOString(), instances, totals };
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(readFileSync(homePage));
  }
  if (url.pathname === '/dashboard') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(readFileSync(agentsPage));
  }
  if (url.pathname === '/chat') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(readFileSync(chatPage));
  }
  if (url.pathname === '/presenter') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(readFileSync(presenterPage));
  }
  if (url.pathname === '/stage') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(readFileSync(stagePage));
  }
  if (url.pathname === '/stage-chapters.js') {
    res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    return res.end(readFileSync(chaptersPath));
  }
  if (url.pathname === '/decisions') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(readFileSync(decisionsPage));
  }
  if (url.pathname.startsWith('/api/decide')) {
    try {
      return await decideRoute(req, res, url.pathname);
    } catch (error) {
      return json(res, 502, { error: error instanceof Error ? error.message : String(error) });
    }
  }
  if (url.pathname.startsWith('/api/stage')) {
    try {
      return await stageRoute(req, res, url.pathname);
    } catch (error) {
      return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }
  if (url.pathname === '/api/instances') return json(res, 200, liveInstances(config.registryPath));
  if (url.pathname === '/api/summary') return json(res, 200, await summary());
  if (url.pathname === '/api/pattern') {
    try {
      return json(res, 200, JSON.parse(readFileSync(patternPath, 'utf8')));
    } catch {
      return json(res, 404, { error: 'no pattern yet: run the /dj skill' });
    }
  }
  json(res, 404, { error: 'not found' });
  // Localhost only: the stage moves worktrees, and instances read files for /api/replay.
}).listen(port, '127.0.0.1', () => console.log(`workshop on http://localhost:${port}  (/stage, /presenter, /dashboard, /decisions)`));
