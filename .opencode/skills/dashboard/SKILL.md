---
name: dashboard
description: Start and use the central dashboard that shows every running agent instance (main checkout and worktrees) side by side with counters, events, pings, music and dancing cats; trigger events and move the simulated clock for all instances at once. Use when the user says dashboard, observe, compare instances, storm all, show the agents.
---

# Dashboard

`pnpm dashboard` serves http://localhost:4000. It reads the instance registry every 3 s and opens a live
stream to each instance, so new worktrees appear on their own.

## What it shows per instance

- Counters: events, filtered (prefilter), ignored (gate), merged (inbox), worker runs, working now, gate calls,
  pings sent / held for the digest, ping budget from `memory/preferences.md`.
- Cats: one dancing cat per active worker; a cat with a `?` or `!` sign after a ping.
- Pings and the event feed with the stage each event stopped at and why.

## Controls

- Header: **Storm all** (same 60 events to every instance), speed, **+10 min / +1 h / 09:00** (simulated clock
  for all; 09:00 fires the digest), **Reset all**, **Start sound**, **DJ** (plays `dj/pattern.json`, see the `dj` skill).
- Per column: Storm, single scenarios (CI fails, bot comment, dependabot PR, edit ×3, own comment, +1, PR, new issue),
  Mute / Solo for its music channel.

## Stage: the presenter view

http://localhost:4000/stage is the talk itself: intro slides (ambient agents, products in the wild, the
five-agent comparison, lessons, anatomy), one chapter per build step (live pipeline diagram, the problem in
the storm, the fix, how production systems do it, the real code, evals, the notifications) and a wrap-up (skills,
measured chart, blueprint). Slide text lives in `dashboard/stage-chapters.js`; edit words there, not in
`stage.html`. Every link on the slides is public. The dashboard and every instance listen on 127.0.0.1 only. **Load step-N** force-checks-out that tag in the `stage` worktree (`../<repo>-wt/stage`), wipes its
database and restarts it, so never edit that worktree by hand. Storms run from the page are recorded per step
in `.data/stage-scores.json` and drawn as the chart in chapter 06.

Keys: ← → (or a clicker's PageUp/PageDown) chapters, L load, S storm, E evals, N presenter notes with the
step's prompt and a copy button. The **target** select points the page at any running instance instead,
for example the main checkout where Claude Code is building the step live.

## Decisions: the decision-model playground

http://localhost:4000/decisions explains decision models (Jev, Clef) and the gate's cascade (code → decision
model → LLM below a confidence threshold), then lets you run one event, or the 30 storm events with expected
labels, through every provider side by side: Jev, Clef, Clef-Flash, the LLM gate model and "no gate". Keys:
`TYPESAFE_API_KEY` for Jev, `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` for Clef; missing ones are shown
as disabled.

## From the terminal (same API the page uses)

```bash
curl -s localhost:4000/api/instances      # registry
curl -s localhost:4000/api/summary        # stats per instance + totals
curl -s -XPOST localhost:4000/api/stage/load -d '{"step":3}'   # move the stage worktree to step-3
PORT=4101 pnpm storm                      # one instance
```

Sound needs a click on **Start sound** (browser autoplay rule). Check the venue audio before the talk.
