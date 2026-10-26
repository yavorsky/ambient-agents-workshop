Make the `timers` case pass. Change only `src/timers.ts`.

`schedule(subject, inMinutes, reason)` stores a wakeup at clock time + inMinutes. `due()` returns every wakeup
whose time has passed as a `timer` event (actor `clock`, not a bot) about the same subject, and marks it fired,
so it goes through the same pipeline as any GitHub event. `pending()` lists the ones still waiting.
