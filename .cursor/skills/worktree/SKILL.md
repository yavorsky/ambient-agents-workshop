---
name: worktree
description: Create, start, stop, list or remove git worktrees that each run their own ambient agent instance on a separate port with a separate database. Use to compare steps side by side (e.g. naive vs finished), to build a step in parallel with the demo, or when the user says worktree, side by side, parallel instance, new instance.
---

# Worktree instances

Each worktree is a checkout of a tag or branch with its own agent instance: own port (4101–4199),
own SQLite file, own simulated clock. Instances register in `~/.ambient-workshop/registry.json`, so the
dashboard (`pnpm dashboard`, http://localhost:4000/dashboard) picks them up automatically.

## Commands (run from any checkout of the repo)

```bash
pnpm wt new <name> [ref]   # worktree at ../ambient-agents-workshop-wt/<name>, branch wt/<name>, then start it
pnpm wt start <name>       # (re)start its instance
pnpm wt stop <name>
pnpm wt ls                 # name, port, running/stopped, tag
pnpm wt logs <name>
pnpm wt rm <name>          # stop, remove worktree and branch wt/<name>
```

## Typical uses

- Side by side for the talk: `pnpm wt new naive step-1` and `pnpm wt new finished step-5`, then "Storm all" in /dashboard (naive left, finished right; the `stage` worktree is hidden there by default).
- Build the next step while demoing the current one: `pnpm wt new live step-1`, then run Claude Code inside
  `../ambient-agents-workshop-wt/live` with `prompts/step-2.md`. Restart with `pnpm wt start live` to see the change.

## Rules

- Worktrees never poll GitHub (`GITHUB_REPO` is cleared); only the main checkout is the live agent.
- `node_modules` and `.env` come from the main checkout. Do not run `pnpm install` inside a worktree.
- Before `rm`, check `git -C <dir> status` for uncommitted work and tell the user if there is any.
