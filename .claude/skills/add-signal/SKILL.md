---
name: add-signal
description: Teach the agent a new kind of event end to end — the event kind, a simulator scenario, what the prefilter drops, a gate question, how it routes, and an eval that proves it — without lowering the existing evals. Use when asked to add a source (Sentry, Linear, Slack, a deploy hook, a cron), a new event kind, or a new signal.
---

# Add a signal

Work in a worktree (`pnpm wt new <name> main`) so the running demo is untouched. Then, in this order:

1. **The event.** Add the kind to `EventKind` in `src/types.ts`. A source only ever produces `AgentEvent`;
   map the outside payload to `kind`, `actor`, `subject`, `title`, `body` in the source, nowhere else.
2. **The subject key.** Decide what makes two events the same piece of work (`sentry:<issue-id>`,
   `deploy:<service>`). The inbox merges on it, so a wrong key means duplicate runs or lost events.
3. **Make it happen on demand.** Add a scenario to `src/sources/sim.ts` (a button in the dashboard) with one
   real-looking event and one noisy one (a bot, a repeat, a resolved state).
4. **Drop the noise in code.** If the source has fields that say "no work" (resolved, automated, a test
   environment), add a rule with a reason to `src/prefilter.ts`. Plain code, before any model.
5. **Ask the gate.** If it is a new signal, add `Signal` in `src/types.ts`, a yes/no question for it to
   `GATE_QUESTIONS` in `src/questions.ts`, and a fallback in `signalOf` (`src/worker.ts`). Then run the
   event through `/decisions` and check the probabilities before trusting it.
6. **Say what the worker does.** A skill in `.ruler/skills/<name>/SKILL.md` (like `fix-ci`), then `pnpm ruler`.
7. **Prove it.** Add a case to `evals/run.ts`: the noisy event is filtered, the real one reaches exactly one
   worker run on the right signal. `pnpm eval` must still pass everything it passed before.
8. Run the preflight skill, then storm the worktree's instance from the dashboard and watch it once.
