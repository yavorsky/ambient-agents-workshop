import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { Chat } from './chat.ts';
import type { Clock } from './clock.ts';
import type { Memory } from './memory.ts';
import type { Agent, AgentUpdate } from './pipeline.ts';
import type { Policy } from './policy.ts';
import { fromWebhook, verifySignature, type WebhookPayload } from './sources/github.ts';
import { buildStorm, isScenario, SCENARIOS } from './sources/sim.ts';
import type { Store } from './store.ts';
import type { Thread } from './thread.ts';
import type { Timers } from './timers.ts';
import type { AgentEvent } from './types.ts';
import type { Watches } from './watches.ts';

export interface ServerDeps {
  agent: Agent;
  chat: Chat;
  thread: Thread;
  watches: Watches;
  /** Step 7 on. */
  memory?: Memory;
  clock: Clock;
  store: Store;
  timers: Timers;
  policy: Policy;
  info: { instance: string; ref: string; workerMode: string; gateMode: string; repo: string };
  stormPath: string;
  /** GITHUB_WEBHOOK_SECRET: deliveries must carry GitHub's signature for it. Empty: accepted unsigned. */
  webhookSecret: string;
}

async function rawBody(req: IncomingMessage): Promise<string> {
  let raw = '';
  for await (const chunk of req) raw += String(chunk);
  return raw;
}

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await rawBody(req);
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
}

function send(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
}

function loadStorm(path: string): AgentEvent[] {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as AgentEvent[];
  } catch {
    return buildStorm();
  }
}

const appPage = new URL('../app/index.html', import.meta.url);

/** HTTP API the dashboard and the CLI scripts use. CORS is open: the dashboard runs on another port. */
export function startServer(port: number, deps: ServerDeps) {
  const { agent, chat, thread, watches, clock, store, timers, policy, info } = deps;
  let stormRun = 0;

  const snapshot = () => ({
    ...info,
    port,
    stats: agent.stats,
    clock: clock.now(),
    budget: Number.isFinite(policy.budget()) ? policy.budget() : null,
    pings: store.recentPings(20),
    wakeups: timers.pending(),
    events: agent.recent(),
    asks: agent.openAsks(),
  });

  const server = createServer(async (req, res) => {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-headers', 'content-type');
    if (req.method === 'OPTIONS') return res.writeHead(204).end();
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    try {
      // The agent's own app: chat, what it did, notifications, memory. The talk's pages are on the dashboard.
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(readFileSync(appPage));
      }
      if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, snapshot());
      // GitHub calls this on every issue, PR, comment and CI run (set up a webhook, or `gh webhook forward`).
      if (req.method === 'POST' && url.pathname === '/webhooks/github') {
        const raw = await rawBody(req);
        const name = String(req.headers['x-github-event'] ?? '');
        if (name === 'ping') return send(res, 200, { ok: true });
        const signature = req.headers['x-hub-signature-256'];
        if (deps.webhookSecret && !verifySignature(deps.webhookSecret, raw, typeof signature === 'string' ? signature : undefined)) {
          return send(res, 401, { error: 'bad signature' });
        }
        const events = fromWebhook(name, String(req.headers['x-github-delivery'] ?? ''), JSON.parse(raw) as WebhookPayload);
        events.forEach((e) => agent.ingest({ ...e, at: clock.now() }));
        return send(res, 202, { events: events.length });
      }
      if (req.method === 'GET' && url.pathname === '/api/stream') {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
        res.write(`data: ${JSON.stringify({ t: 'snapshot', state: snapshot() })}\n\n`);
        const forward = (update: AgentUpdate) => res.write(`data: ${JSON.stringify(update)}\n\n`);
        agent.on('update', forward);
        req.on('close', () => agent.off('update', forward));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/trigger') {
        const { scenario, title, body: text } = await body(req);
        if (typeof scenario !== 'string' || !isScenario(scenario)) return send(res, 400, { error: `scenarios: ${Object.keys(SCENARIOS).join(', ')}` });
        const events = scenario === 'new-issue' ? SCENARIOS['new-issue'](String(title ?? 'Crash on empty config file'), String(text ?? '')) : SCENARIOS[scenario]();
        events.forEach((e) => agent.ingest({ ...e, at: clock.now() }));
        return send(res, 200, { injected: events.length });
      }
      if (req.method === 'POST' && url.pathname === '/api/storm') {
        const { rateMs } = await body(req);
        const delay = typeof rateMs === 'number' ? rateMs : 160;
        const run = ++stormRun;
        const storm = loadStorm(deps.stormPath);
        // Delivered later, outside this request: a stub agent that throws must not take the process down.
        const deliver = (e: AgentEvent) => {
          try {
            agent.ingest({ ...e, id: `${e.id}#${run}`, at: clock.now() });
          } catch (error) {
            console.warn(`[storm] ${String(error)}`);
          }
        };
        storm.forEach((e, i) => setTimeout(() => deliver(e), i * delay));
        return send(res, 200, { events: storm.length, seconds: (storm.length * delay) / 1000 });
      }
      if (req.method === 'POST' && url.pathname === '/api/replay') {
        const { file } = await body(req);
        const events = JSON.parse(readFileSync(String(file), 'utf8')) as AgentEvent[];
        events.forEach((e) => agent.ingest({ ...e, id: `${e.id}-${Date.now()}`, at: clock.now() }));
        return send(res, 200, { injected: events.length });
      }
      if (req.method === 'POST' && url.pathname === '/api/clock') {
        const { advanceMinutes, jumpTo } = await body(req);
        if (typeof advanceMinutes === 'number') clock.advance(advanceMinutes);
        if (typeof jumpTo === 'string') clock.jumpTo(jumpTo);
        agent.tick();
        return send(res, 200, { clock: clock.now() });
      }
      if (req.method === 'POST' && url.pathname === '/api/digest') return send(res, 200, { items: agent.digest() });
      if (req.method === 'GET' && url.pathname === '/api/wakeups') return send(res, 200, timers.pending());
      if (req.method === 'GET' && url.pathname === '/api/memory') {
        if (!deps.memory) return send(res, 404, { error: 'no memory before step-7' });
        return send(res, 200, { where: deps.memory.where, files: await deps.memory.index() });
      }
      if (req.method === 'GET' && url.pathname === '/api/memory/file') {
        const text = await deps.memory?.read(url.searchParams.get('path') ?? '');
        return text === undefined ? send(res, 404, { error: 'no such file' }) : send(res, 200, { text });
      }
      if (req.method === 'POST' && url.pathname === '/api/chat') {
        const { message } = await body(req);
        if (typeof message !== 'string' || !message.trim()) return send(res, 400, { error: 'message required' });
        res.writeHead(200, { 'content-type': 'application/x-ndjson', 'cache-control': 'no-cache' });
        // Both sides of the conversation go into the main thread, where the agent's reports also land.
        thread.add('you', message);
        let answer = '';
        try {
          for await (const part of chat.send(message)) {
            if (part.t === 'text') answer += part.text;
            res.write(`${JSON.stringify(part)}\n`);
          }
        } catch (error) {
          res.write(`${JSON.stringify({ t: 'error', error: String(error) })}\n`);
        }
        if (answer.trim()) thread.add('agent', answer);
        return res.end();
      }
      if (req.method === 'GET' && url.pathname === '/api/thread') return send(res, 200, { entries: thread.recent() });
      if (url.pathname === '/api/watches') {
        if (req.method === 'POST') {
          const { add, remove } = await body(req);
          if (typeof add === 'string') watches.add(add);
          if (typeof remove === 'string') watches.remove(remove);
        }
        return send(res, 200, { watches: watches.list() });
      }
      if (req.method === 'POST' && url.pathname === '/api/answer') {
        const { id, yes } = await body(req);
        if (typeof id !== 'number' || typeof yes !== 'boolean') return send(res, 400, { error: 'id (number) and yes (boolean) required' });
        return agent.answer(id, yes) ? send(res, 200, { ok: true }) : send(res, 404, { error: 'no open ask with that id' });
      }
      if (req.method === 'POST' && url.pathname === '/api/reset') {
        agent.reset();
        chat.reset();
        thread.clear();
        return send(res, 200, { ok: true });
      }
      send(res, 404, { error: 'not found' });
    } catch (error) {
      send(res, 500, { error: String(error) });
    }
  });
  // Localhost only: /api/replay reads files from disk.
  server.listen(port, '127.0.0.1');
  return server;
}
