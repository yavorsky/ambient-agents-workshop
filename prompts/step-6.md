Tech: plain TypeScript; sessions are promise chains per signal with the session id stored in `node:sqlite` (`Store`); in claude mode each run is `claude -p --resume <id>` (Claude Code headless) with a `gh` allowlist. The ping budget is parsed from `memory/preferences.md`.

Make the `sessions` and `pings` cases pass. Change exactly these files: `src/worker.ts`, `src/policy.ts`,
`src/pipeline.ts`, `src/server.ts`, `src/types.ts`, `src/runners.ts`. Nothing else.

One long-lived session per signal (ci, issues, prs): runs for the same signal queue behind each other, and each
run resumes the signal's session id stored in the store under `session:<signal>` (`claude -p --resume <id>` in
claude mode). `sessionCount()` returns how many signals have a session.

Then fix 5 in `src/policy.ts`: decide from `reversible` × `confidence >= 0.7`: act (sure, reversible) and note
(unsure, irreversible) go to the digest; draft (unsure, reversible) and ask (sure, irreversible) ping the human,
unless today's pings already reached the budget read from `memory/preferences.md` ("At most N pings a day").
Make the `pings` case pass too. In `src/pipeline.ts` `handle()`, pass the event's signal and watch on to `deliver()`.

Last, let the person answer an ask, right in the thread. In `src/pipeline.ts` keep the open asks (id, subject,
signal, text) when a notification goes out with route `ask`, pass the ask's id to `Notifier.send` (the thread shows
Yes / No on it), expose them as `openAsks()`, and add `answer(id, yes)`: it turns the answer into an `answer` event
(`source: 'you'`) on the same subject and offers it straight to the inbox, skipping the prefilter and the gate.
The result of a run that handled your answer is always reported back, whatever the policy says.
Add `POST /api/answer {id, yes}` and `asks` in `/api/state` (`src/server.ts`).
In `src/types.ts` add the event kind `'answer'` and the source `'you'`. In `src/runners.ts` add `answer` to
`SIMULATED_RESULTS`, and make `runSimulated` return "Done, as you approved: …" for a Yes and "Left it as it is, as you
said." for a No.

Done when `pnpm typecheck` passes and `pnpm eval` shows 5/6 (only `timers` still fails).
