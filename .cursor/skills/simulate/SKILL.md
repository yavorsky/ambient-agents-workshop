---
name: simulate
description: Send simulated events to a running agent instance — the 60-event storm, single scenarios (CI failure, bot comment, dependabot PR, issue edits, the agent's own comment, +1 reaction, PR, new issue), fixture replays — and move its simulated clock. Use when the user asks to trigger, simulate, replay, storm, fast-forward or test the pipeline by hand.
---

# Simulate events

Every simulated event is a normal `AgentEvent` sent through `Agent.ingest`, the same path the GitHub poller uses.

```bash
PORT=4100 pnpm storm [rateMs]                       # replay fixtures/storm.json (default 160 ms apart)
PORT=4100 node scripts/api.mjs trigger ci-failed    # ci-failed | bot-comment | dependabot-pr | issue-edits |
                                                    # self-echo | reaction | pr-opened | new-issue
PORT=4100 pnpm replay fixtures/audience-issue.json
PORT=4100 node scripts/api.mjs clock 10             # +10 minutes; or `clock 09:00`
PORT=4100 pnpm wakeups                              # what the agent booked for itself
PORT=4100 pnpm digest                               # deliver held items now
PORT=4100 node scripts/api.mjs reset
```

A custom issue: `curl -s -XPOST localhost:4100/api/trigger -H 'content-type: application/json' -d '{"scenario":"new-issue","title":"..."}'`.

After a run, report what the counters say (`curl -s localhost:$PORT/api/state`) rather than guessing.
