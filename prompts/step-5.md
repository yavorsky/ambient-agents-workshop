Make the `duplicates` case in `pnpm eval` pass. Change `src/inbox.ts`, and `report()` in `src/thread.ts`.

Key work by `event.subject`. One run per subject at a time. While a subject is busy, collect new events for
it and hand them all over in one follow-up run when it finishes. Treat the same event id as a duplicate, and the
same subject + kind within `quietMinutes` (from `options.now()`) as the same news. Return 'merged' for anything
that did not start a run.

In the thread, the same idea: one entry per subject. When a report arrives for a subject that already has an
entry, update that entry (move its old text into `updates`, keep the last 5), keep its watch, and move it to the
bottom, instead of adding a new message.
