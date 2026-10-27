#!/usr/bin/env node
// Dress rehearsal: drives every build step the way the slides do and checks that each fix shows what the
// talk claims. Needs `pnpm dashboard` running. Usage: pnpm rehearse   (leaves the stage agent on step-1)
const BASE = process.env.DASHBOARD_URL ?? 'http://localhost:4000';
const EXPECTED_EVALS = [0, 0, 0, 0, 2, 3, 5, 6, 6];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const json = async (url, body) => {
  const r = await fetch(url, body === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${url}: ${data.error ?? r.status}`);
  return data;
};

let failures = 0;
const results = [];
function check(step, name, ok, detail) {
  if (!ok) failures++;
  results.push({ step, name, ok, detail });
  console.log(`  ${ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${name}${detail ? `  \x1b[2m${detail}\x1b[0m` : ''}`);
}

/** Waits until the agent has taken in `atLeast` events and nothing has changed for a few seconds. */
async function settle(api, atLeast = 1, timeoutMs = 120_000) {
  const started = Date.now();
  let last = '', same = 0, state;
  while (Date.now() - started < timeoutMs) {
    await sleep(500);
    state = await json(`${api}/state`);
    const key = JSON.stringify(state.stats);
    same = key === last ? same + 1 : 0;
    last = key;
    // Events still at the gate or waiting for a worker: an LLM gate can take seconds without any counter moving.
    const pending = (state.events ?? []).some((e) => ['received', 'queued', 'working'].includes(e.stage));
    if (state.stats.received >= atLeast && state.stats.activeWorkers === 0 && !pending && same >= 5) return state;
  }
  throw new Error(`agent did not settle within ${timeoutMs / 1000}s: ${last}`);
}

async function stormFresh(api) {
  await json(`${api}/reset`, {});
  await json(`${api}/storm`, { rateMs: 60 });
  return settle(api, 60);
}

async function trigger(api, scenario, times = 1) {
  for (let i = 0; i < times; i++) await json(`${api}/trigger`, { scenario });
}

/** Asks the chat agent one question and returns what it streamed. */
async function ask(api, message) {
  const r = await fetch(`${api}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session: 'rehearse', message }) });
  if (!r.ok) throw new Error(`${api}/chat: ${r.status}`);
  const parts = (await r.text()).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  return { text: parts.filter((p) => p.t === 'text').map((p) => p.text).join(''), tools: parts.filter((p) => p.t === 'tool').map((p) => p.name), errors: parts.filter((p) => p.t === 'error').map((p) => p.error) };
}

const CAT_WATCH = 'PRs about cats';
const CAT_PR = 'demo/app#52';
const reports = async (api) => (await json(`${api}/thread`)).entries.filter((e) => e.kind === 'report');

const STEPS = {
  3: async (s, api) => {
    check(3, 'nothing is filtered or gated yet', s.stats.filtered === 0 && s.stats.gateCalls === 0, `filtered ${s.stats.filtered}, gate calls ${s.stats.gateCalls}`);
    check(3, 'the storm wakes a crowd of workers', s.stats.maxWorkers >= 10, `max ${s.stats.maxWorkers} at once, ${s.stats.workerRuns} runs`);
    check(3, 'and pings about almost everything', s.stats.pingsSent >= 10, `${s.stats.pingsSent} pings`);
    const r = await reports(api);
    check(3, 'every result floods the main thread', r.length >= 20, `${r.length} reports in the thread`);
  },
  4: async (s, api) => {
    check(4, 'the prefilter drops bots, edits and self-echoes in code', s.stats.filtered >= 20, `${s.stats.filtered} filtered`);
    check(4, 'the gate ignores reactions', s.stats.ignored >= 5, `${s.stats.ignored} ignored, ${s.stats.gateCalls} gate calls`);
    const reasons = (s.events ?? []).map((e) => e.reason ?? '').filter((r) => /clef|jev|llm|%/.test(r));
    check(4, 'gate verdicts come from the decision model (with the LLM for unsure ones)', reasons.length > 0, reasons[0] ?? `gate mode ${s.gateMode}`);
    const r = await reports(api);
    const cat = r.find((e) => e.subject === CAT_PR);
    check(4, 'slide: the cat PR is reported, with its watch', cat?.watch === CAT_WATCH, cat ? `${cat.subject} [watch: ${cat.watch ?? 'none'}]` : 'no report for the cat PR');
    const others = r.filter((e) => e.subject === 'demo/app#50' || e.subject === 'demo/app#51');
    check(4, 'slide: PRs nobody watches stay out of the thread', others.length === 0, `${others.length} unwatched PR reports, ${r.length} reports in all`);
  },
  5: async (s, api) => {
    check(5, 'repeats are merged by subject', s.stats.merged >= 5, `${s.stats.merged} merged`);
    const subjects = (await reports(api)).map((e) => e.subject);
    check(5, 'the thread has one entry per subject', new Set(subjects).size === subjects.length, `${subjects.length} entries, ${new Set(subjects).size} subjects`);
    await json(`${api}/reset`, {});
    await trigger(api, 'ci-failed', 3);
    const ci = await settle(api, 3);
    check(5, 'slide: CI fails ×3 → at most two runs', ci.stats.workerRuns <= 2, `${ci.stats.workerRuns} runs for 3 CI failures`);
  },
  6: async (s, api) => {
    check(6, 'one session per signal: never a crowd', s.stats.maxWorkers <= 3, `max ${s.stats.maxWorkers} at once, ${s.stats.sessions} sessions`);
    check(6, 'the policy holds what can wait for the digest', s.stats.pingsHeld > 0 && s.stats.pingsSent < 10, `${s.stats.pingsSent} pings, ${s.stats.pingsHeld} held`);
    const ask = s.asks?.find((a) => a.subject === CAT_PR) ?? s.asks?.[0];
    check(6, 'hard-to-undo work waits for a yes', Boolean(ask), ask ? `${ask.subject}: ${ask.text.slice(0, 60)}` : 'no open asks');
    if (ask) {
      await json(`${api}/answer`, { id: ask.id, yes: true });
      const after = await settle(api, s.stats.received + 1);
      void after;
      const entry = (await reports(api)).find((e) => e.subject === ask.subject);
      check(6, 'slide: Yes → the answer comes back as an event, and the thread entry updates', /as you approved/.test(entry?.text ?? ''), entry?.text ?? 'no thread entry for the answer');
    }
  },
  7: async (s, api) => {
    const digest = await json(`${api}/digest`, {});
    check(7, 'slide: 09:00 digest sends what the policy held', digest.items >= 1 && digest.items === s.stats.pingsHeld, `${digest.items} items in one digest (held ${s.stats.pingsHeld})`);
    await json(`${api}/reset`, {});
    await trigger(api, 'ci-failed');
    await settle(api, 1);
    const wakeups = await json(`${api}/wakeups`);
    check(7, 'slide: CI fails → the agent books its own check-back', wakeups.length >= 1, wakeups[0] ? `${wakeups[0].subject}: ${wakeups[0].reason}` : 'no wakeup booked');
    await json(`${api}/clock`, { advanceMinutes: 10 });
    const after = await settle(api, 2);
    check(7, 'slide: +10 min → the wakeup comes back as an event', after.stats.timersFired >= 1, `${after.stats.timersFired} timers fired, ${after.stats.workerRuns} runs`);
  },
  8: async (s, api) => {
    const { files } = await json(`${api}/memory`);
    const journal = files.find((f) => f.path.startsWith('journal/'));
    check(8, 'every handled subject leaves a line in memory', journal?.lines >= 5, journal ? `${journal.path}: ${journal.lines} lines, ${files.length} files` : 'no journal');
    const reply = await ask(api, 'What happened while I was away? One line.');
    check(8, 'the chat reads memory instead of the event stream', reply.tools.includes('memory_read'), reply.tools.join(', ') || 'no tool calls');
  },
};

console.log(`\nRehearsal against ${BASE}\n`);
try {
  for (const path of ['/', '/dashboard', '/stage', '/presenter', '/decisions', '/chat']) {
    const r = await fetch(`${BASE}${path}`);
    if (!r.ok) check(0, `page ${path}`, false, String(r.status));
  }
  const running = new Map((await json(`${BASE}/api/summary`)).instances.map((i) => [i.name, i.ref]));
  check(0, 'naive runs step-3 (left column on /dashboard)', running.get('naive') === 'step-3', running.get('naive') ?? 'not running');
  check(0, 'finished runs step-8 (right column)', running.get('finished') === 'step-8', running.get('finished') ?? 'not running');

  {
    const t0 = Date.now();
    console.log('\nstep-1');
    const { port } = await json(`${BASE}/api/stage/load`, { step: 1 });
    const api = `http://localhost:${port}/api`;
    const reply = await ask(api, 'What does prompts/step-2.md ask for? Read it, answer in one line.');
    check(1, 'the chat agent answers', reply.text.trim().length > 0 && reply.errors.length === 0, reply.errors[0] ?? reply.text.trim().slice(0, 90));
    check(1, 'and calls a tool to find out', reply.tools.length > 0, reply.tools.join(', ') || 'no tool calls');
    const ev = await json(`${BASE}/api/stage/eval`, {});
    check(1, `evals ${ev.passing}/${ev.total}`, ev.passing === EXPECTED_EVALS[1], `expected ${EXPECTED_EVALS[1]}`);
    console.log(`  \x1b[2m${((Date.now() - t0) / 1000).toFixed(0)} s\x1b[0m`);
  }

  {
    const t0 = Date.now();
    console.log('\nstep-2');
    const { port } = await json(`${BASE}/api/stage/load`, { step: 2 });
    const api = `http://localhost:${port}/api`;
    const signed = await json(`${BASE}/api/webhook`, { instance: 'stage', sample: 'issue' });
    const heard = (await json(`${api}/state`)).events ?? [];
    check(2, 'a signed GitHub delivery becomes an event', signed.status === 202 && heard.some((e) => e.kind === 'issue_opened'), `${signed.status} ${signed.response}, ${heard.length} events heard`);
    const forged = await json(`${BASE}/api/webhook`, { instance: 'stage', sample: 'issue', forged: true });
    check(2, 'a forged signature is rejected', forged.status === 401, `${forged.status} ${forged.response}`);
    console.log(`  \x1b[2m${((Date.now() - t0) / 1000).toFixed(0)} s\x1b[0m`);
  }

  for (const step of [3, 4, 5, 6, 7, 8]) {
    const t0 = Date.now();
    console.log(`\nstep-${step}`);
    const { port } = await json(`${BASE}/api/stage/load`, { step });
    const api = `http://localhost:${port}/api`;
    await json(`${api}/watches`, { add: CAT_WATCH });
    const state = await stormFresh(api);
    const s = state.stats;
    console.log(`  \x1b[2mstorm: ${s.received} in · ${s.filtered} filtered · ${s.ignored} ignored · ${s.merged} merged · ${s.workerRuns} runs (max ${s.maxWorkers} at once) · ${s.pingsSent} pings, ${s.pingsHeld} held\x1b[0m`);
    await STEPS[step](state, api);
    const ev = await json(`${BASE}/api/stage/eval`, {});
    check(step, `evals ${ev.passing}/${ev.total}`, ev.passing === EXPECTED_EVALS[step], `expected ${EXPECTED_EVALS[step]}`);
    console.log(`  \x1b[2m${((Date.now() - t0) / 1000).toFixed(0)} s\x1b[0m`);
  }
} catch (error) {
  check('-', 'rehearsal stopped', false, error.message);
} finally {
  const back = await json(`${BASE}/api/stage/load`, { step: 1 }).catch(() => undefined);
  // The talk adds the cat watch live; leave the stage agent with only the default watches.
  if (back) await json(`http://localhost:${back.port}/api/watches`, { remove: CAT_WATCH }).catch(() => undefined);
}

console.log(`\n${failures ? `\x1b[31m${failures} failed\x1b[0m` : '\x1b[32mall good\x1b[0m'} · ${results.length} checks · stage agent back on step-1\n`);
process.exit(failures ? 1 : 0);
