---
name: pr-review
description: Review a GitHub pull request end to end — check it out in its own worktree, run the checks, review the diff against what the PR says it does, and post one review with inline comments on the lines that matter. Use when asked to review PR #N, review a pull request, or leave review comments on GitHub.
---

# PR review

`code-review` decides what is wrong. This skill does the rest of the job around it on GitHub.

1. **Read what it claims.** `gh pr view <n> --json title,body,author,baseRefName,headRefName,files` and
   `gh pr diff <n>`. Review against the stated goal: a PR that does what it says, simply, is a good PR.
2. **Check it out in a worktree**, never in your working copy:
   `git fetch origin pull/<n>/head:pr-<n> && git worktree add ../pr-<n> pr-<n>`. In there run
   `pnpm install --frozen-lockfile`, `pnpm typecheck` and `pnpm eval`, and compare the eval count with `main`.
3. **Review** with the code-review skill. Verify every finding in the worktree; drop anything you cannot pin to
   a line that is in the diff.
4. **Sort the findings**:
   - **Blocker**: breaks behavior, loses data, leaks a secret, lowers the eval count.
   - **Suggestion**: clearly better, but the PR works without it.
   - **Question**: you are not sure. Ask; do not assert.
   At most two nitpicks, or none.
5. **Post one review**, not a stream of comments. Write `review.json`:
   ```json
   { "event": "COMMENT", "body": "<one-line verdict> · typecheck ✓ · evals 6/6 · 1 blocker",
     "comments": [{ "path": "src/gate.ts", "line": 42, "side": "RIGHT", "body": "**Blocker**: …" }] }
   ```
   then `gh api repos/{owner}/{repo}/pulls/<n>/reviews --input review.json`. Inline comments only on lines
   that are part of the diff; everything else goes in the summary.
6. **Re-reviews**: read your earlier threads first (`gh api repos/{owner}/{repo}/pulls/<n>/comments`). Reply
   "fixed" where it is fixed, and do not repeat a point that was answered.
7. Clean up: `git worktree remove ../pr-<n> && git branch -D pr-<n>`.

Never approve, request changes or merge on your own: the event is always `COMMENT`. Approval is a person's call.
