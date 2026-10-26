#!/usr/bin/env node
// Dress rehearsal: drives every build step the way the slides do and checks that each fix shows what the
// talk claims. Needs `pnpm dashboard` running. Usage: pnpm rehearse   (leaves the stage agent on step-1)
const BASE = process.env.DASHBOARD_URL ?? 'http://localhost:4000';
const EXPECTED_EVALS = [0, 0, 2, 3, 5, 6];
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
    if (state.stats.received >= atLeast && state.stats.activeWorkers === 0 && same >= 5) return state;
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

const STEPS = {
  1: async (s, api) => {
    check(1, 'nothing is filtered or gated yet', s.stats.filtered === 0 && s.stats.gateCalls === 0, `filtered ${s.stats.filtered}, gate calls ${s.stats.gateCalls}`);
    check(1, 'the storm wakes a crowd of workers', s.stats.maxWorkers >= 10, `max ${s.stats.maxWorkers} at once, ${s.stats.workerRuns} runs`);
    check(1, 'and pings about almost everything', s.stats.pingsSent >= 10, `${s.stats.pingsSent} pings`);
  },
  2: async (s) => {
    check(2, 'the prefilter drops bots, edits and self-echoes in code', s.stats.filtered >= 20, `${s.stats.filtered} filtered`);
    check(2, 'the gate ignores reactions', s.stats.ignored >= 5, `${s.stats.ignored} ignored, ${s.stats.gateCalls} gate calls`);
    const reasons = (s.events ?? []).map((e) => e.reason ?? '').filter((r) => /clef|jev|llm|%/.test(r));
    check(2, 'gate verdicts come from the decision model (with the LLM for unsure ones)', reasons.length > 0, reasons[0] ?? `gate mode ${s.gateMode}`);
  },
  3: async (s, api) => {
    check(3, 'repeats are merged by subject', s.stats.merged >= 5, `${s.stats.merged} merged`);
    await json(`${api}/reset`, {});
    await trigger(api, 'ci-failed', 3);
    const ci = await settle(api, 3);
    check(3, 'slide: CI fails ×3 → at most two runs', ci.stats.workerRuns <= 2, `${ci.stats.workerRuns} runs for 3 CI failures`);
  },
  4: async (s) => {
    check(4, 'one session per signal: never a crowd', s.stats.maxWorkers <= 3, `max ${s.stats.maxWorkers} at once, ${s.stats.sessions} sessions`);
    check(4, 'the policy holds what can wait for the digest', s.stats.pingsHeld > 0 && s.stats.pingsSent < 10, `${s.stats.pingsSent} pings, ${s.stats.pingsHeld} held`);
  },
  5: async (s, api) => {
    const digest = await json(`${api}/digest`, {});
    check(5, 'slide: 09:00 digest sends what the policy held', digest.items >= 1 && digest.items === s.stats.pingsHeld, `${digest.items} items in one digest (held ${s.stats.pingsHeld})`);
    await json(`${api}/reset`, {});
    await trigger(api, 'ci-failed');
    await settle(api, 1);
    const wakeups = await json(`${api}/wakeups`);
    check(5, 'slide: CI fails → the agent books its own check-back', wakeups.length >= 1, wakeups[0] ? `${wakeups[0].subject}: ${wakeups[0].reason}` : 'no wakeup booked');
    await json(`${api}/clock`, { advanceMinutes: 10 });
    const after = await settle(api, 2);
    check(5, 'slide: +10 min → the wakeup comes back as an event', after.stats.timersFired >= 1, `${after.stats.timersFired} timers fired, ${after.stats.workerRuns} runs`);
  },
};

console.log(`\nRehearsal against ${BASE}\n`);
try {
  for (const path of ['/', '/dashboard', '/stage', '/presenter', '/decisions']) {
    const r = await fetch(`${BASE}${path}`);
    if (!r.ok) check(0, `page ${path}`, false, String(r.status));
  }
  const running = new Map((await json(`${BASE}/api/summary`)).instances.map((i) => [i.name, i.ref]));
  check(0, 'naive runs step-1 (left column on /dashboard)', running.get('naive') === 'step-1', running.get('naive') ?? 'not running');
  check(0, 'finished runs step-5 (right column)', running.get('finished') === 'step-5', running.get('finished') ?? 'not running');

  for (const step of [1, 2, 3, 4, 5]) {
    const t0 = Date.now();
    console.log(`\nstep-${step}`);
    const { port } = await json(`${BASE}/api/stage/load`, { step });
    const api = `http://localhost:${port}/api`;
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
  await json(`${BASE}/api/stage/load`, { step: 1 }).catch(() => undefined);
}

console.log(`\n${failures ? `\x1b[31m${failures} failed\x1b[0m` : '\x1b[32mall good\x1b[0m'} · ${results.length} checks · stage agent back on step-1\n`);
process.exit(failures ? 1 : 0);
