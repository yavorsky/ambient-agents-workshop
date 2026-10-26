Make the `noise` and `cost` cases in `pnpm eval` pass. Change only `src/prefilter.ts` and `src/gate.ts`.

1. `prefilter`: pure function, no I/O. Drop bots (`actor.bot`), the agent's own posts (`selfLogin` or a body
   containing SELF_MARKER), issue edits and green builds. Return a short reason for every drop.
2. `gate`: in `decision` mode, call `decide(options.decision.provider, eventState(e), GATE_QUESTIONS)` from
   `src/decision.ts` / `src/questions.ts` for every event in parallel. If the `action` answer's confidence is at
   least `options.decision.threshold`, that is the verdict; set `signal` to the signal whose noul is highest
   (if ≥ 0.5) and put the probability in the reason. Send the unsure events to the `model` path below.
   In `model` mode, one AI SDK `generateObject` call with
   `languageModel(options.model)` from `src/models.ts` (OpenRouter) and a zod schema: a verdict per event,
   `{action: act | ignore | ask, reason}`; fall back to rules if the call fails. In `rules`
   mode, ignore reaction-only comments (+1, thanks, same here…) and ask on risky requests (delete, force-push).
   Count one call per batch.

Don't touch evals or fixtures. Show me the diff summary when done.
