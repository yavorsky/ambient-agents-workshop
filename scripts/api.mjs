#!/usr/bin/env node
// Tiny CLI over an instance's HTTP API: pnpm storm | digest | wakeups | replay <file>. PORT picks the instance.
import { resolve } from 'node:path';

const port = process.env.PORT ?? '4100';
const base = `http://localhost:${port}/api`;
const [command, arg] = process.argv.slice(2);

const post = (path, body = {}) =>
  fetch(`${base}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

const commands = {
  storm: () => post('storm', arg ? { rateMs: Number(arg) } : {}),
  digest: () => post('digest'),
  wakeups: () => fetch(`${base}/wakeups`).then((r) => r.json()),
  replay: () => post('replay', { file: resolve(arg ?? 'fixtures/audience-issue.json') }),
  clock: () => post('clock', /^\d+:\d+$/.test(arg ?? '') ? { jumpTo: arg } : { advanceMinutes: Number(arg ?? 10) }),
  trigger: () => post('trigger', { scenario: arg }),
  reset: () => post('reset'),
};

const run = commands[command];
if (!run) {
  console.error(`usage: node scripts/api.mjs <${Object.keys(commands).join('|')}> [arg]`);
  process.exit(1);
}
try {
  console.log(JSON.stringify(await run(), null, 2));
} catch (error) {
  console.error(`instance on port ${port} is not reachable: ${error.message}`);
  process.exit(1);
}
