Make the `sessions` case pass. Change only `src/worker.ts`.

One long-lived session per signal (ci, issues, prs): runs for the same signal queue behind each other, and each
run resumes the signal's session id stored in the store under `session:<signal>` (`claude -p --resume <id>` in
claude mode). `sessionCount()` returns how many signals have a session.

Then fix 5 in `src/policy.ts`: decide from `reversible` × `confidence >= 0.7`: act (sure, reversible) and note
(unsure, irreversible) go to the digest; draft (unsure, reversible) and ask (sure, irreversible) ping the human,
unless today's pings already reached the budget read from `memory/preferences.md` ("At most N pings a day").
Make the `pings` case pass too.
