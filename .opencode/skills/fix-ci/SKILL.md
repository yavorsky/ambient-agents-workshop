---
name: fix-ci
description: Investigate a failed GitHub Actions run as the ambient agent — find the failing step and likely cause from the logs and the code, and report it with a proposed fix; book a check-back when a re-run is in progress. Used by the worker for the ci signal.
---

# Fix CI

1. Find the run: `gh run list --repo <repo> --status failure --limit 3`, then `gh run view <id> --repo <repo> --log-failed`.
2. Name the failing job and step, quote the 3–10 most relevant log lines, and find the code they point at (Read/Grep).
3. Classify: flaky (passes on re-run, timing, network) / real regression (link the commit) / infra (runner, quota).
4. Report once: if an open issue titled "CI red on <branch>" exists, comment on it; otherwise
   `gh issue create --repo <repo> --title "CI red on <branch>" --body ...`. Include the proposed fix as a diff
   in the body. End with `<!-- ambient-agent -->`.
5. If a re-run is in progress or you are not sure yet, set `"wakeupInMinutes": 10` in the RESULT instead of guessing.

Do not push, re-run workflows or open PRs; a drafted fix is reported with `"reversible": true` and your confidence.
