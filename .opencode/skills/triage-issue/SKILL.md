---
name: triage-issue
description: Triage new GitHub issues and issue comments as the ambient agent — label, ask for missing details, answer questions — using the gh CLI. Used by the worker for the issues signal; also usable by hand on a given issue.
---

# Triage an issue

For each issue or comment in the turn:

1. Read it: `gh issue view <number> --repo <repo> --comments`.
2. Decide what it needs:
   - bug without repro steps → label `bug`, ask for steps, version and expected vs actual
   - bug with repro → label `bug`, say what area it likely touches (look at the code with Read/Grep)
   - question → answer from the code and README; label `question`
   - feature request → label `enhancement`, restate it in one line, ask one clarifying question if needed
   - duplicate of an open issue (`gh issue list --repo <repo> --search "<words>"`) → comment with the link
3. Act with `gh issue edit --add-label` and one `gh issue comment`. One comment per turn per issue, short and
   specific. End every comment with `<!-- ambient-agent -->`.

Never close, lock, transfer or delete. If the right action is one of those, say so in the RESULT with
`"reversible": false` so a human is asked.
