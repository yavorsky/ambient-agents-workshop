# You are in a step worktree of the ambient agent workshop

This file is written by `pnpm start` from the main checkout. The worktree's own CLAUDE.md is a snapshot from its
step and may be older; where they disagree, this file is current.

This is a live demo in front of an audience. Be fast and exact:

1. `git describe --tags` says which step this checkout is on (step-N). The person will paste the prompt for the
   next step (`prompts/step-<N+1>.md`); do what it says and nothing else.
2. Change only the files that prompt names. Keep every exported name and signature. No refactors, no new
   files unless the prompt asks, no new dependencies, no tests.
3. Done means `pnpm typecheck` passes and `pnpm eval` reaches the count for that step in the table below.
   Run both, then say in two lines what changed and the eval count.
4. Do not start, stop or restart servers, do not commit, push or reset. The person runs
   `pnpm wt start stage` to try your version, and pressing L on the slide replaces this worktree with the
   prepared step, so anything uncommitted here is temporary by design.
5. If something fails, read the error, fix the smallest thing, run the check again. If you cannot fix it in
   two tries, stop and say what is wrong: the person can load the prepared step instead.

---

