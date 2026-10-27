Implement `Agent` in `src/pipeline.ts`: the naive v0 loop. From now on the agent works on its own and reports
into the main thread: `Notifier.send` already writes every ping there.

Every event that comes in through `ingest` goes through the stages in this order, using the modules that
already exist (they are pass-through stubs for now): `prefilter` → `gate` (collect events for
`gateWindowMs`, then one call) → `Inbox.offer` → `Worker.run` → `Policy.decide` → `Notifier.send(subject, text, ping, { watch: event.watch })`.
Schedule `timers` from `wakeupInMinutes`, and when `simulateEchoes` is on, feed a simulated comment back in
after a worker comments (marked with SELF_MARKER), like GitHub would.

Keep the exported types (`AgentDeps`, `AgentUpdate`, `EventView`) and emit an `update` for every stage change
and stats change so the dashboard works. `tick()` fires due wakeups and the digest once when the clock passes 09:00.
`pnpm typecheck` must pass and `pnpm eval` must run (cases are expected to fail).
