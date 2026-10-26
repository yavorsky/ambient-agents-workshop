---
name: babysit
description: Shepherd an open PR to green — watch CI, read failing job logs, fix what this PR broke, rerun what is flaky, rebase when main moves, answer review comments — and stop when it is ready for a person to merge. Use when asked to babysit a PR, watch CI, get a PR green, or keep a PR mergeable.
---

# Babysit a PR

Each round:

1. **Status**: `gh pr checks <n>` and `gh pr view <n> --json mergeable,mergeStateStatus,reviewDecision`.
2. **A failing job**: `gh run view <run-id> --log-failed | tail -200`, then decide:
   - **Caused by this PR**: fix it (the fix-ci skill), run the preflight skill, commit, push.
   - **Flaky or infrastructure** (network, a timeout in code this PR does not touch): rerun once with
     `gh run rerun <run-id> --failed`. If it fails the same way twice, it is not flaky: report it and stop.
3. **Behind main or conflicting**: `git fetch origin && git rebase origin/main`, resolve keeping both sides'
   intent, run preflight, then `git push --force-with-lease`. Only ever on this PR's branch.
4. **New review comments**: fix them, or reply with the reason you did not. Never resolve a thread you did not
   address.
5. **Checks still running**: wait a few minutes and start the next round (`/loop` works well here).

Stop when every check is green, nothing is unanswered and the PR is mergeable. Post one line: what you fixed,
what you reran, what is left. Never merge, never push to `main`, never force-push without `--force-with-lease`.
