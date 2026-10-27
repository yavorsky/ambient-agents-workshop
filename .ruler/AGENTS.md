# Ambient agent workshop

A chat agent (a model, tools, a loop) that becomes ambient: it hears GitHub, a clock and a simulator, keeps the
watches you gave it, does the work in one session per signal, and reports into one main thread. Built live,
one step per git tag, in a one-hour talk. Node 22 + tsx, no build step, `node:sqlite`, ESM.

```
you ─▶ chat (main thread) ─▶ model + tools + loop                          step 1
github / sim / timers ─▶ AgentEvent                                         step 2
  ─▶ prefilter ─▶ gate (watches) ─▶ inbox ─▶ worker sessions ─▶ policy ─▶ thread / 09:00 digest   steps 3–7
memory/*.md ◀─ every result; the chat sees an index, reads on demand        step 8
```

## Steps (git tags)

| Tag | Builds | Files the step changes | `pnpm eval` |
|-----|--------|------------------------|-------------|
| step-0 | scaffolding; every fix is a stub | — | 0/6 |
| step-1 | chat agent: `streamText` + tools + loop, one conversation | `src/chat.ts` | 0/6 |
| step-2 | GitHub signals: signed webhooks + polling | `src/sources/github.ts` | 0/6 |
| step-3 | naive pipeline: every event → worker → thread | `src/pipeline.ts` | 0/6 |
| step-4 | prefilter in code; gate (decision model → LLM → rules) checks watches | `src/prefilter.ts`, `src/gate.ts`, one line in `pipeline.ts` | 2/6 |
| step-5 | inbox: subject keys, merge repeats; thread groups by subject | `src/inbox.ts`, `src/thread.ts` | 3/6 |
| step-6 | one session per signal; act/draft/ask/note policy; Yes/No answers | `src/worker.ts`, `src/policy.ts`, `src/pipeline.ts`, `src/server.ts` | 5/6 |
| step-7 | self-booked wakeups, reminders, 09:00 digest | `src/timers.ts`, `pipeline.ts` `tick()`, `main.ts` | 6/6 |
| step-8 | memory as Markdown files; short conversation + memory index | `src/memory.ts`, `pipeline.ts`, `chat.ts`, `main.ts`, `server.ts` | 6/6 |

The prompt for each step is `prompts/step-N.md`. `git describe --tags` tells you which step a checkout is on;
stubs say "not implemented yet (prompts/step-N.md)".

## Map

| Path | What |
|------|------|
| `src/types.ts` | `AgentEvent` (the one event shape: kind, actor, subject, title, body, watch, route), `Verdict`, `WorkerResult` |
| `src/chat.ts` | `Chat.send(message)`: the agent loop, one conversation = the main thread |
| `src/tools.ts` | chat tools: files, search, `gh` reads, `load_skill`, `watch`/`unwatch`, `github_comment` (stage only) |
| `src/thread.ts` | the main thread: your messages, answers, reports (grouped by subject from step 5) |
| `src/watches.ts` | `memory/watches.md`; `topic → instruction` lines; `watchTopic()` |
| `src/sources/github.ts` | `verifySignature`, `fromWebhook`, `GitHubPoller` · `src/sources/sim.ts`: storm and Simulate buttons |
| `src/prefilter.ts` `gate.ts` `inbox.ts` `worker.ts` `policy.ts` `timers.ts` | one fix each |
| `src/pipeline.ts` | `Agent`: ingest → prefilter → batch → gate → inbox → worker → policy → deliver; `tick()`, `answer()` |
| `src/notify.ts` | pings and watched results into the thread; the digest |
| `src/memory.ts` | memory files (local, or Daytona with `DAYTONA_API_KEY`), `memoryTools()` |
| `src/runners.ts` | one worker turn: `sim`, `model`, `claude` (`claude -p --resume` + gh allowlist), `auto` (real GitHub events → claude) |
| `src/models.ts` | `languageModel(id)` (OpenRouter, else AI Gateway), `MODEL_TIERS` · `src/decision.ts`: `decide()` (Clef, Jev) |
| `src/server.ts` | the agent's API and its app (`app/index.html`): state, stream, chat, thread, watches, trigger, storm, clock, answer, webhooks |
| `dashboard/` | the talk: `/` start page + run sheet, `/stage` slides (`stage-chapters.js`), `/presenter`, `/dashboard`, `/decisions` |
| `evals/run.ts` | replays `fixtures/storm.json`; six cases; the definition of done |

## Rules

- `pnpm typecheck` and `pnpm eval` are the definition of done; never edit `evals/` or `fixtures/` to pass.
- Change only the files the step's prompt names; keep exported names and signatures (the dashboard and the
  next steps depend on them).
- Every event from any source is an `AgentEvent` through `Agent.ingest`; no demo shortcuts.
- LLM calls only through `languageModel()`; decision-model calls only through `decide()`. No new dependencies.
- TypeScript strict; prefix unused parameters with `_`.
- The worker never merges, closes, deletes or pushes; its comments end with `<!-- ambient-agent -->`.
- Use cases live in skills (`.ruler/skills/`) and memory files, not in code.
- Edit instructions and skills in `.ruler/`, then `pnpm ruler`; generated agent files are not hand-edited.

## APIs to get right first time

- AI SDK v7: `streamText({ model, system, messages, tools, stopWhen: isStepCount(10) })`; iterate
  `result.fullStream`: `text-delta` (`.text`), `tool-call` (`.toolName`, `.input`), `tool-result` (`.output`),
  `tool-error`; then `await result.responseMessages`. Tools: `tool({ description, inputSchema: z.object(…), execute })`.
  Structured: `generateObject({ model, schema, system, prompt })`.
- `decide(provider, eventState(e), questions)`: a `choice` question needs `instructions` and `criteria`; answers are
  `{ type: 'choice', choice, confidence, probabilities }` or `{ type: 'noul', noul }`. Threshold `DECISION_THRESHOLD` (0.6).
- Webhooks: `X-Hub-Signature-256: sha256=<hex>` = HMAC-SHA256(secret, raw body); compare with `timingSafeEqual`.

## Common problems, quick fixes

| You see | Why | Fix |
|---------|-----|-----|
| “heard it; no pipeline yet” | step < 3 | load step 3 or later |
| chat says “I am not built yet” | step 0 | load step 1 |
| `clef 429` in a log | Workers AI quota | nothing: the gate falls back to the LLM |
| CI fails stops at the inbox, “joined ci:main” | same subject + kind within 5 min (agent clock) | **+10 min** or Reset |
| a new GitHub issue never arrives | the first poll only records what exists; or `GITHUB_REPO` unset | open a new issue; check `.env` |
| “no watch matches” | the event is about nothing you watch | add a watch, or use the Cat PR / New issue buttons |
| typecheck: unused parameter | strict mode | prefix it with `_` |
| a step’s evals lower than the table | the step is not finished | read the failing case’s message: it names the number that is off |

## Commands

```bash
pnpm start                   # from the root: everything clean (naive :4101, finished :4102, stage :4103, dashboard :4000)
pnpm stop
pnpm wt claude stage         # Claude Code inside the stage worktree
pnpm wt start stage          # restart the stage agent with the code in its worktree (keeps your changes)
pnpm wt eval stage           # evals on that code
pnpm wt reset stage step-4   # back to a prepared step (L on the slide does the same)
pnpm wt memory stage daytona # step 8: memory files in a Daytona sandbox (DAYTONA_API_KEY in .env); `local` goes back
pnpm typecheck && pnpm eval  # in any checkout
pnpm webhook stage issue     # a signed GitHub delivery to the stage agent (--bad: forged)
pnpm rehearse                # every step loaded, stormed and checked (needs the dashboard)
```
