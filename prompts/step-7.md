Make the `timers` case pass. Change only `src/timers.ts`.

`schedule(subject, inMinutes, reason)` stores a wakeup at clock time + inMinutes. `due()` returns every wakeup
whose time has passed as a `timer` event (actor `clock`, not a bot) about the same subject, and marks it fired,
so it goes through the same pipeline as any GitHub event. `pending()` lists the ones still waiting.

Then let the person book one: export `reminderTools(timers)` from `src/timers.ts` with a `remind` tool
(`what`, and `inMinutes` or `at` as HH:MM on the agent clock) that schedules a wakeup on subject `reminders`
with reason `Reminder: <what>`. In `src/pipeline.ts` `tick()`, a due wakeup whose title starts with `Reminder:`
skips the pipeline and goes straight to the thread as `⏰ Reminder: …`. Add the tool to the chat in `src/main.ts`.
