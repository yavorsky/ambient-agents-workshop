Make the `duplicates` case in `pnpm eval` pass. Change only `src/inbox.ts`.

Key work by `event.subject`. One run per subject at a time. While a subject is busy, collect new events for
it and hand them all over in one follow-up run when it finishes. Treat the same event id as a duplicate, and the
same subject + kind within `quietMinutes` (from `options.now()`) as the same news. Return 'merged' for anything
that did not start a run.
