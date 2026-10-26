---
name: pr-description
description: Write a pull request title and description from the actual diff — why, what changed in behavior, how it was checked, what was not — and apply it with gh, keeping anything others added. Use when opening or updating a PR, or when asked to write a PR description.
---

# PR description

1. **Read the real change**: `git fetch origin main`, then `git diff origin/main...HEAD --stat`, the full diff,
   and `git log origin/main..HEAD --format='%s%n%b'`. Describe the diff, not the conversation that led to it.
2. **Title**: imperative, under 70 characters, the change a user or reviewer cares about
   ("Gate: settle confident events with Clef", not "Update gate.ts").
3. **Body**:
   ```markdown
   ## Why
   One or two sentences: the problem and who has it.

   ## What changes
   - 3 to 6 bullets about behavior, naming the module or step. No file lists.

   ## How it was checked
   - The exact commands and results: `pnpm typecheck` ✓, `pnpm eval` 6/6. A screenshot for dashboard changes.

   ## Not covered
   - What you did not run or could not verify. "Nothing" is rarely true.
   ```
4. **No claims the diff does not support.** No "this PR…" filler, no adjectives about the code.
5. **Apply**: a new PR with `gh pr create --title "…" --body-file pr.md`. For an existing PR, read the current
   body first (`gh pr view <n> --json body`) and keep anything below a `---` line that someone else added, then
   `gh pr edit <n> --title "…" --body-file pr.md`.
