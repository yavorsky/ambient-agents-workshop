# Agents that work while you don't

Workshop repo: build an agent from scratch, first as a chat (a model, tools, a loop), then make it ambient.
It watches a GitHub repo, a clock and a simulator, decides what is worth doing, does it, and messages a
human only when it should.

```
you ─▶ chat ─▶ agent (model + tools + loop)                                   step 1
github ─▶ webhook / poll ─▶ event                                         step 2
sources ─▶ prefilter ─▶ gate ─▶ inbox ─▶ worker ─▶ policy ─▶ you / 09:00 digest   steps 3–7
                                          └──▶ memory/*.md ◀── one chat           step 8
```

## Quick start

```bash
pnpm install
pnpm dev          # the agent and its app (chat, activity, notifications, memory) on http://localhost:4100
pnpm dashboard    # http://localhost:4000: the talk: start page, /stage, /presenter, /dashboard (naive vs finished)
pnpm rehearse     # dress rehearsal: loads every step, storms it, checks each fix and the evals (needs the dashboard)
pnpm eval         # replay the 60-event storm and check behavior
```

Optional `.env` (see `.env.example`). Models go through OpenRouter when `OPENROUTER_API_KEY` is set, otherwise
Vercel AI Gateway (`AI_GATEWAY_API_KEY`); ids are `vendor/model` (`MODEL_GATE`, `MODEL_WORKER`, `MODEL_CHAT`). With a key the gate
uses the model. `WORKER_MODE=model` makes each worker turn one structured call (no tools); `WORKER_MODE=claude`
runs real `claude -p` sessions with the repo's skills. `GITHUB_REPO=owner/name` watches a real repo,
`SLACK_WEBHOOK_URL` delivers pings.

## Steps

Each tag is one step of the workshop. `pnpm eval` turns greener at each one.

| Tag | What it adds | Module | Evals |
|-----|--------------|--------|-------|
| `step-0` | Sources, simulator, the agent's app, the main thread, watches, chat tools; the agent and every fix is a stub | — | 0/6 |
| `step-1` | The chat agent: a model with tools in a loop, one conversation (the main thread) in its app | `chat.ts` | 0/6 |
| `step-2` | GitHub signals: signed webhooks (`POST /webhooks/github`) and polling, one event shape; the agent only records them | `sources/github.ts` | 0/6 |
| `step-3` | Ambient, the naive way: "watch for PRs about cats", every event wakes the agent, every result lands in the thread | `pipeline.ts` | 0/6 |
| `step-4` | Fix 1 prefilter in plain code, fix 2 gate with a reason; only events that match a watch go on | `prefilter.ts`, `gate.ts` | 2/6 |
| `step-5` | Fix 3 subject keys, merge while busy; one thread entry per subject | `inbox.ts`, `thread.ts` | 3/6 |
| `step-6` | Fix 4 one session per signal; fix 5 act/draft/ask policy and ping budget; Yes/No on asks in the thread | `worker.ts`, `policy.ts`, `pipeline.ts` | 5/6 |
| `step-7` | Timers: the agent books its own check-backs | `timers.ts` | 6/6 |
| `step-8` | Memory as Markdown files (local, or a Daytona sandbox with `DAYTONA_API_KEY`); one chat that reads an index, not the events | `memory.ts`, `chat.ts` | 6/6 |

The live prompts are in `prompts/step-N.md`. Build in one worktree of your own, from step-0, pasting the prompts in order:

```bash
pnpm wt new build step-0       # once: ../ambient-agents-workshop-wt/build
pnpm wt claude build           # Claude Code inside it; paste prompts/step-1.md, then step-2.md, …
pnpm wt start build            # run what it built: its app on the printed port
pnpm wt eval build             # its evals
pnpm wt reset build step-3     # a step went wrong: back to the prepared step-3
pnpm webhook build issue       # a signed GitHub-style delivery to that agent (--bad: forged, expect 401)
```

## Side by side

```bash
pnpm wt new naive step-3       # left column on /dashboard
pnpm wt new finished step-8    # right column
pnpm dashboard          # both columns; "Storm all" sends the same events to both
pnpm wt rm naive        # when done
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
