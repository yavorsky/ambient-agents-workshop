Tech: plain code for the prefilter; for the gate, Clef on Cloudflare Workers AI (or Jev) through `decide()` in `src/decision.ts`, with typed `choice` / `noul` questions and probabilities; the fallback is one AI SDK `generateObject` call with a zod schema (Claude Haiku 4.5 via OpenRouter); rules when no key is set.

Make the `noise` and `cost` cases in `pnpm eval` pass, and make the gate check every event against the person's
watches (`options.watches()`, from memory/watches.md). Change `src/prefilter.ts`, `src/gate.ts`, and in
`src/pipeline.ts` only the line that offers a gated event to the inbox (carry `verdict.watch` on the event).

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
3. Watches: an event the gate would act on (or ask about) but that matches no watch is ignored, with the closest
   watch in the reason; a match sets `verdict.watch`. In `decision` mode ask one extra `noul` question per watch
   ("Is this event about: <watch>?") in the same `decide` call and take the highest ≥ 0.5. In `model` mode add
   the numbered watches to the prompt and a nullable `watch` index to the schema. In `rules` mode export
   `watchMatches(event, watch)`: words like PR / CI / issue limit the event kind, other words must appear in the
   title or body ("PRs about cats" matches a PR mentioning "cat").

Don't touch evals or fixtures. Show me the diff summary when done.
