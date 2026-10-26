---
name: preflight
description: Fast local gate before a push or a PR — type-check, evals and a review of the diff, run at the same time; fixes what it safely can and reports what it did not cover. Use when about to push or open a PR, or when asked for a preflight or a pre-PR check.
---

# Preflight

1. Scope: `git status --short` and `git diff --stat main...HEAD`. Nothing changed → say so and stop.
2. Run these at the same time (parallel tool calls or subagents, not one after another):
   - `pnpm typecheck`
   - `pnpm eval`: the contract. The passing count must not drop compared with `main`; a fix may raise it.
   - The code-review skill on the diff, in a subagent, asked for **blockers only**.
3. Fix what is clearly caused by this diff: type errors and confirmed blockers. Never edit `evals/` or
   `fixtures/` to make a check pass; that hides the regression instead of fixing it.
4. Re-run only what failed, once. Still failing → stop and report; do not loop.
5. If the diff touches `dashboard/`, there are no tests for it: open the changed page, use it once, and check the
   browser console for errors.
6. Report in four lines: what ran, what passed, what you fixed (`file:line`), what was not covered (for example
   real model calls, the GitHub poller). Never push; the person pushes.
