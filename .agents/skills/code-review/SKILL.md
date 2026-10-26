---
name: code-review
description: Review a pull request or the current diff — correctness first, then tests, then simplicity — and report blockers and suggestions, each checked against the source. Use when asked for a code review, /code-review <PR>, or by the worker for the prs signal.
---

# Code review

1. Get the diff: `gh pr diff <n> --repo <repo>` for a PR, or `git diff main...HEAD` locally. Read the changed
   files in full where the diff is not enough.
2. Check, in this order:
   - Correctness: wrong conditions, missing awaits, unhandled errors, state that can go stale, races.
   - The contract: does `pnpm eval` still describe the behavior? Did the change edit `evals/` or `fixtures/` to pass?
   - Boundaries: one fix per module, `AgentEvent` as the only event shape, model calls only in gate/runners and only via `languageModel()`.
   - Simplicity: dead code, duplicated helpers, needless abstractions.
3. Verify every finding against the source before reporting it. Drop anything you cannot point to a line for.
4. Report: **Blockers** (would break behavior) and **Suggestions**, each with `file:line` and one sentence.
   On a PR, post it as one `gh pr review <n> --comment --body ...` ending with `<!-- ambient-agent -->`.

Never approve or merge. Approval is a human decision: put `"action": "merge PR", "reversible": false` in the
RESULT when the PR looks ready.
