# Agents that work while you don't

Workshop repo: build an ambient agent from scratch. It watches a GitHub repo, a clock and a simulator,
decides what is worth doing, does it with Claude Code, and messages a human only when it should.

```
sources ─▶ prefilter ─▶ gate ─▶ inbox ─▶ worker ─▶ policy ─▶ you / 09:00 digest
```

## Quick start

```bash
pnpm install
pnpm dev          # agent instance on http://localhost:4100 (fully simulated, no keys needed)
pnpm dashboard    # http://localhost:4000: start page; /dashboard for the agents ("Storm all", "Start sound")
pnpm eval         # replay the 60-event storm and check behavior
```

Optional `.env` (see `.env.example`). Models go through OpenRouter when `OPENROUTER_API_KEY` is set, otherwise
Vercel AI Gateway (`AI_GATEWAY_API_KEY`); ids are `vendor/model` (`MODEL_GATE`, `MODEL_WORKER`). With a key the gate
uses the model. `WORKER_MODE=model` makes each worker turn one structured call (no tools); `WORKER_MODE=claude`
runs real `claude -p` sessions with the repo's skills. `GITHUB_REPO=owner/name` watches a real repo,
`SLACK_WEBHOOK_URL` delivers pings.

## Steps

Each tag is one step of the workshop. `pnpm eval` turns greener at each one.

| Tag | What it adds | Module | Evals |
|-----|--------------|--------|-------|
| `step-0` | Sources, simulator, dashboard, store; every fix is a stub | — | 0/6 (crash) |
| `step-1` | Naive v0: every event goes to a worker and pings you | `pipeline.ts` | 0/6 |
| `step-2` | Fix 1 prefilter in plain code, fix 2 small-model gate with a reason | `prefilter.ts`, `gate.ts` | 2/6 |
| `step-3` | Fix 3 subject keys, merge while busy | `inbox.ts` | 3/6 |
| `step-4` | Fix 4 one session per signal; fix 5 act/draft/ask policy and ping budget | `worker.ts`, `policy.ts` | 5/6 |
| `step-5` | Timers: the agent books its own check-backs | `timers.ts` | 6/6 |

The live prompts are in `prompts/step-N.md`.

## Side by side

```bash
pnpm wt new v0 step-1
pnpm wt new final step-5
pnpm dashboard          # both columns; "Storm all" sends the same events to both
pnpm wt rm v0           # when done
```

## Stage

`pnpm dashboard`, then open http://localhost:4000/stage: the talk as a presentation. Intro slides on
ambient agents (with links), then one chapter per step with a live pipeline diagram; **Load step-N** moves a `stage` worktree to that tag and restarts it, **Storm** runs
the 60 events, **Run evals** shows which cases pass. Press N for notes and the step's prompt. Slide text is in `dashboard/stage-chapters.js`.

## Decision models

The gate can run as a cascade (`GATE_MODE=decision`): plain code drops noise, a decision model (Jev or
Clef, set the keys in `.env`) answers "act, ignore or ask?" and "CI, issue or PR?" for every event with
probabilities, and only events below `DECISION_THRESHOLD` go to the LLM. http://localhost:4000/decisions
explains it and has a playground.

## Skills

Edited in `.ruler/skills/`, synced to Claude Code, Codex, Cursor and OpenCode with `pnpm ruler`.

| Skill | For |
|-------|-----|
| `worktree` | Worktrees with their own instance, port and database |
| `dashboard` | The central view over every instance |
| `simulate` | Storm, scenarios, fixture replay, clock |
| `dj` | Writes `dj/pattern.json` from live stats; the dashboard plays it |
| `triage-issue`, `fix-ci`, `code-review` | What the worker does for each signal (`claude -p "/code-review #42"`) |
| `preflight` | Type-check, evals and a blockers-only review in parallel before a push |
| `proposal` | A one-page HTML plan or explainer with a picture per section |
| `pr-review` | Checks out a PR in a worktree, runs the checks, posts one review with inline comments |
| `pr-description` | Title and description from the real diff: why, what, how it was checked, what was not |
| `babysit` | Watches a PR's CI, fixes what it broke, reruns flakes once, rebases, stops when it is mergeable |
| `add-signal` | Adds a new event source or signal end to end, with an eval that proves it |
| `launch-video` | Records a demo video of the real UI with captions and the dashboard's music (`record.mjs`, `compose.sh`) |
