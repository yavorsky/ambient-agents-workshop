#!/usr/bin/env node
// Records one beat of a launch video: real UI driven by the beat script, captions drawn into the page,
// and the page's own Web Audio (the dashboard exposes it as window.__audioTap).
// Usage: node .ruler/skills/launch-video/record.mjs video/beats/01-calm.mjs   (BASE_URL defaults to :4000)
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const beatPath = process.argv[2];
if (!beatPath) {
  console.error('usage: record.mjs <beat.mjs>');
  process.exit(1);
}
const base = process.env.BASE_URL ?? 'http://localhost:4000';
const name = basename(beatPath, '.mjs');
const out = 'video/raw';
const size = { width: 1920, height: 1080 };
await mkdir(out, { recursive: true });

// Headless Chromium plays Web Audio without a user gesture only with this flag.
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: size, recordVideo: { dir: out, size }, colorScheme: 'dark' });
const page = await context.newPage();
const t0 = Date.now();
const marks = [];
const now = () => (Date.now() - t0) / 1000;

const helpers = {
  page,
  base,
  mark: (label) => marks.push({ label, t: now() }),
  wait: (ms) => page.waitForTimeout(ms),
  caption: (text) =>
    page.evaluate((text) => {
      let el = document.getElementById('lv-caption');
      if (!el) {
        el = document.createElement('div');
        el.id = 'lv-caption';
        el.style.cssText = 'position:fixed;left:50%;bottom:56px;transform:translateX(-50%);z-index:99999;max-width:1400px;'
          + 'padding:14px 28px;border-radius:999px;background:rgba(10,10,12,.86);border:1px solid rgba(255,255,255,.14);'
          + 'color:#fff;font:600 30px/1.3 Inter,system-ui,sans-serif;letter-spacing:-.01em;text-align:center;'
          + 'box-shadow:0 12px 40px rgba(0,0,0,.45);transition:opacity .35s;';
        document.body.append(el);
      }
      el.style.opacity = text ? '1' : '0';
      if (text) el.textContent = text;
    }, text),
  card: (title, sub = '') =>
    page.setContent(`<body style="margin:0;height:100vh;display:grid;place-content:center;gap:18px;text-align:center;
      background:radial-gradient(70% 60% at 50% 40%,#1d1838,#0a0a0c);color:#ededef;font-family:Inter,system-ui,sans-serif">
      <div style="font:600 84px/1.05 Inter,system-ui,sans-serif;letter-spacing:-.04em">${title}</div>
      <div style="font-size:32px;color:#a3a3ad">${sub}</div></body>`),
  startAudio: async () => {
    const ok = await page.evaluate(() => {
      const tap = window.__audioTap;
      if (!tap) return false;
      const rec = new MediaRecorder(tap.stream, { mimeType: 'audio/webm' });
      window.__lvChunks = [];
      rec.ondataavailable = (e) => window.__lvChunks.push(e.data);
      rec.start(250);
      window.__lvRec = rec;
      return true;
    });
    if (ok) marks.push({ label: 'audio', t: now() });
    else console.warn('no window.__audioTap: click Start sound before startAudio()');
  },
};

const beat = (await import(pathToFileURL(resolve(beatPath)).href)).default;
await beat(helpers);

const audio = await page.evaluate(async () => {
  const rec = window.__lvRec;
  if (!rec) return null;
  await new Promise((done) => { rec.onstop = done; rec.stop(); });
  const bytes = new Uint8Array(await new Blob(window.__lvChunks, { type: 'audio/webm' }).arrayBuffer());
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
});
const video = page.video();
await context.close();
await browser.close();
await rename(await video.path(), `${out}/${name}.webm`);
if (audio) await writeFile(`${out}/${name}.audio.webm`, Buffer.from(audio, 'base64'));
await writeFile(`${out}/${name}.marks.json`, `${JSON.stringify(marks, null, 2)}\n`);
console.log(`${out}/${name}.webm (${now().toFixed(1)} s)${audio ? ' + audio' : ''}; marks: ${marks.map((m) => `${m.label}@${m.t.toFixed(1)}`).join(', ') || 'none'}`);
