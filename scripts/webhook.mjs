#!/usr/bin/env node
// Sends a signed GitHub-style delivery to a running agent, through the dashboard (which holds the secret).
// Usage: pnpm webhook [agent=stage] [issue|pr|comment|ci] [--bad]     (--bad signs with the wrong secret: expect 401)
const BASE = process.env.DASHBOARD_URL ?? 'http://localhost:4000';
const args = process.argv.slice(2);
const forged = args.includes('--bad');
const [instance = 'stage', sample = 'issue'] = args.filter((a) => a !== '--bad');
const r = await fetch(`${BASE}/api/webhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ instance, sample, forged }) });
const out = await r.json().catch(() => ({}));
if (!r.ok) {
  console.error(out.error ?? r.status);
  process.exit(1);
}
console.log(`${out.event} → ${instance}: ${out.status} ${out.response}`);
