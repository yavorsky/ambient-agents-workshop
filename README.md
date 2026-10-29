# Agents that work while you don't

> A hands-on workshop: build an AI agent from an empty stub, then take its prompt away and teach it to work on
> its own. It watches a GitHub repo and a clock, decides what is worth doing, does it, and bothers you only when
> it should. Nine git tags, eight prompts, six evals that turn green one by one.

```
you ─▶ chat ─▶ agent (model + tools + loop)                                        step 1
github ─▶ webhook / poll ─▶ one event shape                                         step 2
events ─▶ prefilter ─▶ gate ─▶ inbox ─▶ worker sessions ─▶ policy ─▶ you / 09:00 digest   steps 3–7
                                              └──▶ memory/*.md ◀── one chat         step 8
```

## The story

Meet **the agent**. It joins your team on a Monday, and its job is to look after a busy GitHub repo: CI breaks,
issues pile up, bots comment, people say "+1". You are its manager.

On Monday it can only chat. By Tuesday it can hear GitHub. On Wednesday you tell it "watch the repo" and it does
exactly that, all of it, at once, and your notifications explode. The rest of the week is spent turning that
eager intern into a colleague you would trust: one who ignores noise, notices that five alerts are one problem,
works on each thing in its own session, asks before it does anything risky, comes back later to check, and
remembers what you told it.

Every day of the week is one **step**. Each step is a git tag with a prompt you paste into your coding agent
(Claude Code, Codex, Cursor…), and a set of evals that tells you, without opinion, whether the agent got
better.

## Before you start

- **Node 22.13+** and **pnpm**.
- **A coding agent.** The prompts are written for Claude Code, but any agent that edits files works. Each
  worktree gets `CLAUDE.md` / `AGENTS.md` with the map of the code, the APIs to get right and the common problems.
- **An LLM key** for the chat (step 1 on): `OPENROUTER_API_KEY` or Vercel's `AI_GATEWAY_API_KEY`. Without one,
  everything else still runs: events, the gate (in rules mode), workers and evals are simulated.
- Optional: a decision model for the gate (Clef on Cloudflare Workers AI, or Jev), `GITHUB_REPO` to hear a real
  repo, `SLACK_WEBHOOK_URL` for real pings, `DAYTONA_API_KEY` for memory in a sandbox. All of them are in
  `.env.example`, with a comment each.

```bash
git clone https://github.com/yavorsky/ambient-agents-workshop.git
cd ambient-agents-workshop
pnpm install
cp .env.example .env        # then fill in what you have; every key is optional
```

## Your workbench

You build in a **worktree** of your own, so the main checkout stays clean and you can always jump to a prepared
step. Worktrees live next to the repo (`../ambient-agents-workshop-wt/<name>`) and share its `node_modules` and
`.env`. Each runs its own agent, with its own port, database and app.

```bash
pnpm wt new build step-0       # your worktree, at the very beginning
pnpm wt claude build           # Claude Code inside it
pnpm wt start build            # (re)start the agent you built; prints its URL (http://localhost:41xx)
pnpm wt eval build             # the six evals against your code
pnpm wt reset build step-4     # stuck? jump to the prepared step-4 and carry on from there
pnpm wt logs build             # what the agent is doing right now
pnpm wt rm build               # when you are done
```

The loop for every step is the same:

1. Read the chapter below.
2. Paste `prompts/step-N.md` into your coding agent inside the worktree.
3. `pnpm wt start build`, open the app, poke it, hit **Storm** to send it a burst of events.
4. `pnpm wt eval build`. The chapter says how many should pass. Red cases print what is still wrong.

Don't edit `evals/` or `fixtures/` to make a case pass: the evals are the referee.

## The week

### Step 0 · The empty desk

```bash
pnpm wt new build step-0
```

Everything around the agent already exists: the event sources, a simulator that can throw a storm of 60 GitHub
events at it, the app with its main thread, the evals. The agent itself is a stub that politely says it is not
built yet. Open the app and look around. **Evals: 0/6.** That is the to-do list.

### Step 1 · Monday: it can talk · `prompts/step-1.md`

You write the agent: a model, a few tools (read files, search, `gh` reads) and a loop that lets it call tools
until it has an answer. One conversation, which becomes **the main thread**: the place it will later report into
on its own. Ask it about the repo and watch it use its tools. **Evals: 0/6** (it can't hear anything yet).

### Step 2 · Tuesday: it can hear · `prompts/step-2.md`

GitHub learns to reach it: signed webhooks (it checks the HMAC signature and rejects forgeries) and polling for
when your laptop has no public URL. Whatever arrives becomes one `AgentEvent` shape. The agent only records
events for now. With `pnpm dashboard` running in another terminal (it holds the webhook secret), try
`pnpm webhook build issue` (expect 202), then `pnpm webhook build issue --bad`, a forgery that should get a 401.
**Evals: 0/6.**

### Step 3 · Wednesday: chaos · `prompts/step-3.md`

You say "watch the repo" and wire every event straight to a worker. Hit **Storm**. Every bot comment, every
"+1", every edit wakes the agent, five CI failures start five workers, and the thread fills with reports nobody
asked for. This is the naive version, and it is what most "agent with a webhook" demos really are. Take a good
look: the next four steps fix exactly what you see here. **Evals: 0/6, but now they fail for real reasons.**

### Step 4 · Thursday morning: it learns to ignore · `prompts/step-4.md`

Two fixes. A **prefilter** in plain code drops what never needs a brain: bots, edits, green builds, its own
posts. Then a **gate** asks, for each event that is left, "act, ignore or ask?", and checks it against your
watches. The gate is a cascade: a decision model answers in milliseconds with a probability; only unsure events
go to an LLM; with no keys at all it uses rules. Every drop gets a reason you can read. **Evals: 2/6** (noise,
cost).

### Step 5 · Thursday afternoon: five alerts, one problem · `prompts/step-5.md`

The same CI failure arriving five times is one problem, not five. Events get a **subject key** (`ci:main`,
`issue:42`), repeats that arrive while one is being handled merge into it, and the thread groups its reports by
subject. **Evals: 3/6** (duplicates).

### Step 6 · Friday: its own desk for each job, and manners · `prompts/step-6.md`

Each signal gets **one session** that remembers what it already did, instead of a fresh worker every time. A
**policy** decides what you hear: act on what is safe, draft what needs your eyes, **ask** with Yes/No buttons
before anything risky, and stay within the ping budget in `memory/preferences.md` ("at most 3 pings a day").
**Evals: 5/6** (sessions, pings).

### Step 7 · The weekend: it comes back later · `prompts/step-7.md`

A red CI that is "being looked at" should be looked at again. The agent books its **own wakeups** ("check this
again in 30 minutes"), keeps your reminders, and sends a 09:00 digest of what waited. Use **+10 min** to move
the agent's clock instead of waiting. **Evals: 6/6.** 🎉

### Step 8 · Next Monday: it remembers · `prompts/step-8.md`

The final touch: **memory as Markdown files** (local by default, or a Daytona sandbox with `DAYTONA_API_KEY`
and `pnpm wt memory build daytona`). Every result is written down; the chat sees a short index and opens a file
only when it needs one, so the conversation stays short and the agent still knows what happened last week.
**Evals: 6/6**, with a much shorter chat.

## Before and after

Run the Wednesday agent and the finished one side by side and storm them both:

```bash
pnpm wt new naive step-3
pnpm wt new finished step-8
pnpm dashboard                 # http://localhost:4000/dashboard: "Storm all" sends the same events to both
```

The dashboard draws every event as it flows through each agent, counts workers, pings and model calls, and
plays music that follows the load (sound is off until you press it). The left side gets loud. The right side
stays calm.

## When something looks wrong

| You see | Why | Fix |
|---------|-----|-----|
| the chat says "I am not built yet" | you are on step 0 | do step 1, or `pnpm wt reset build step-1` |
| "heard it; no pipeline yet" | step 1 or 2: nothing processes events yet | step 3 or later |
| "no watch matches" | the event is about nothing you watch | add a watch in the app, or use the Cat PR / New issue buttons |
| a CI failure stops at the inbox, "joined ci:main" | the same subject arrived within 5 minutes (agent clock), so it merged | **+10 min** or reset; that is step 5 working |
| `clef 429` in a log | the Workers AI free quota | nothing: the gate falls back to the LLM |
| a new GitHub issue never arrives | the first poll only records what already exists, or `GITHUB_REPO` is unset | open a new issue; check `.env` |
| typecheck: unused parameter | strict mode | prefix it with `_` |
| fewer evals than the chapter says | the step isn't finished | read the failing case: it names the number that is off |
| everything is tangled | it happens | `pnpm wt reset build step-N` and carry on from the prepared step |

`pnpm typecheck && pnpm eval` in any checkout is the definition of done.

## Running it as a talk

The repo is also the slides. `pnpm start` sets up everything from any state: a naive agent (step 3), a finished
one (step 8), a `stage` worktree at step 1 for live coding, and the dashboard on http://localhost:4000. `pnpm
stop` stops it all.

- `/` the start page and run sheet · `/stage` the slides · `/presenter` notes, timer and prompts ·
  `/dashboard` naive vs stage · `/decisions` decision models explained, with a playground · `/db` what the agent
  stores.
- On a step slide, **Load step-N** moves the stage worktree to that tag, **Storm** runs the 60 events,
  **Run evals** shows the cases. `L` undoes your live edits. Slide text lives in `dashboard/stage-chapters.js`.
- `pnpm rehearse` loads every step, storms it and checks each fix (needs the dashboard running).
- `pnpm live` runs the real agent on this repo: real issues and PRs, answered by Claude Code
  (`LIVE_GH_TOKEN` in `.env`).

## Skills

The repo ships the skills the talk shows, edited in `.ruler/skills/` and synced to Claude Code, Codex, Cursor and
OpenCode with `pnpm ruler`.

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
| `launch-video` | Records a demo video of the real UI with captions and the dashboard's music |

## Where things are

| Path | What |
|------|------|
| `src/chat.ts` | the agent: model, tools, loop; the main thread |
| `src/sources/` | GitHub (webhooks, polling) and the simulator |
| `src/prefilter.ts`, `gate.ts`, `inbox.ts`, `worker.ts`, `policy.ts`, `timers.ts`, `memory.ts` | one fix each |
| `src/pipeline.ts` | ingest → prefilter → batch → gate → inbox → worker → policy → deliver |
| `prompts/step-N.md` | the prompt for each step |
| `evals/run.ts`, `fixtures/storm.json` | the six cases and the 60-event storm they replay |
| `dashboard/` | the talk: slides, presenter view, dashboard, decision-model pages |
| `memory/` | your watches and preferences, in plain Markdown |
