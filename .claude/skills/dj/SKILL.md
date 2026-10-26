---
name: dj
description: Turn the agents' day into music. Reads live pipeline stats from the dashboard and writes dj/pattern.json, a short step-sequencer pattern the dashboard plays in DJ mode. Use when the user says /dj, make a track, theme song, play something, or wants music from the agents' activity.
---

# DJ

1. Read the stats: `curl -s localhost:4000/api/summary`. Each instance is one worktree/agent; `totals` sums them.
2. Decide the mood from the numbers, and say in one line why:
   - many `filtered` + `ignored` vs few `workerRuns` → calm, confident groove (the filters are working)
   - high `maxWorkers` or `pingsSent` → frantic, distorted, faster
   - `timersFired` > 0 → add a ticking clock layer
   - one layer per instance, named after it; the noisiest instance gets the bass
3. Write `dj/pattern.json` (overwrite it):

```json
{
  "title": "Three Cats and a Red CI",
  "bpm": 118,
  "layers": [
    { "name": "kick", "wave": "kick", "steps": "x...x...x...x..." },
    { "name": "hats", "wave": "hat", "steps": "..x...x...x...x.", "gain": 0.12 },
    { "name": "main (bass)", "wave": "sawtooth", "steps": "x..x..x.x..x..x.", "notes": [36, 36, 39, 41], "gain": 0.12, "length": 0.18 },
    { "name": "v0 (lead)", "wave": "square", "steps": "x.x.....x.x.....", "notes": [60, 63, 67, 70], "gain": 0.06 }
  ]
}
```

Rules: `steps` is 16 characters of `x` and `.`; `wave` is one of `kick`, `snare`, `hat`, `sine`, `square`,
`sawtooth`, `triangle`; `notes` are MIDI numbers 36–84; `gain` ≤ 0.2; `bpm` 80–170; at most 8 layers.
The title is a short joke about what the stats show.

4. Tell the user to press **DJ** in the dashboard (it reloads the pattern every 5 s) and give the title.
