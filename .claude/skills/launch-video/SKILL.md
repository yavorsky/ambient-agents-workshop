---
name: launch-video
description: Record a short launch or demo video of this app — real UI driven by a Playwright script, captions drawn into the page, the dashboard's own music as the soundtrack — and cut it with ffmpeg. Use when asked for a launch video, a demo video, a screen recording or a backup recording of the live demo.
---

# Launch video

Needs Playwright (`pnpm add -D playwright && pnpm exec playwright install chromium`) and `ffmpeg`.
Skill dir: `S=.ruler/skills/launch-video`.

1. **Storyboard first.** Write `video/storyboard.md`: 4 to 6 beats, one idea and one caption each, 45 to 90 s
   in total. Every shot is real UI. Say on screen when something is simulated (the storm is).
2. **Seed.** `pnpm wt start <name>` for the instances you need, `pnpm dashboard`, then Reset all so counters
   and the clock start clean.
3. **One script per beat** in `video/beats/NN-name.mjs`. A beat exports one async function and gets helpers:

   ```js
   export default async ({ page, base, caption, mark, wait, startAudio, card }) => {
     await page.goto(`${base}/`);
     await page.click('#sound');           // the dashboard's Web Audio starts here
     await startAudio();                   // records what the page plays, in sync with the video
     mark('start');                        // the cut starts here; everything before is trimmed
     await caption('Sixty events arrive. v0 wakes a worker for every one.');
     await page.click('#storm-all');
     await wait(8000);
   };
   ```

   `card(title, sub)` replaces the page with a title card (no audio). `caption('')` hides the caption.
4. **Record** each beat: `node $S/record.mjs video/beats/01-calm.mjs`. It writes `video/raw/<beat>.webm`, the
   page audio next to it, and `marks.json`. Re-shoot a beat rather than editing around a glitch.
5. **Cut**: `bash $S/compose.sh video/launch.mp4 01-calm 02-storm 03-filtered …` trims each beat at its
   `start` mark, adds its audio (or silence), and joins them at 1920×1080, 30 fps.
6. **Check**: watch it once at 1x, then `ffmpeg -i video/launch.mp4 -vf fps=1/5,scale=480:-1,tile=4x3 sheet.png`
   for a contact sheet. Captions readable at a glance? Nothing in an error state?
