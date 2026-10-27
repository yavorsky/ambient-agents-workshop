Tech: Node 22 built-ins only: `node:crypto` (`createHmac`, `timingSafeEqual`) for GitHub's HMAC-SHA256 webhook signature, the `gh` CLI (`gh api`) through `node:child_process` for polling, `node:sqlite` via `Store` for seen ids.

Connect the agent to GitHub: implement `src/sources/github.ts`. Events from it go to `agent.ingest`, which for now
only records them (the pipeline comes next), so you can see each one arrive in the agent's app.

1. `verifySignature(secret, body, header)`: GitHub sends `X-Hub-Signature-256: sha256=<hex>`, an HMAC-SHA256 of
   the raw body with the webhook secret. Compute it with `node:crypto` and compare with `timingSafeEqual`
   (same length first). Missing or malformed header: false.
2. `fromWebhook(name, delivery, payload)`: map one delivery to `AgentEvent[]`:
   `issues` opened → `issue_opened`, edited → `issue_edited`; `pull_request` opened → `pr_opened`;
   `issue_comment` created → `issue_comment` or `pr_comment` (when `issue.pull_request` is set);
   `workflow_run` completed with failure / success → `ci_failed` / `ci_passed` on subject `ci:<branch>`.
   Subjects are `<owner/repo>#<number>`. Ids: `issue-<id>`, `comment-<id>`, `run-<id>`, the same ids the poller
   uses, so one issue seen by both is one event. Anything else: `[]`. Bots: `actor.bot` when `user.type` is "Bot".
3. `GitHubPoller`: every interval, `gh api` the latest issues, comments and completed runs, turn unseen ones into
   the same events, and keep the seen ids in the store. The first poll only records what exists.

`src/server.ts` already has `POST /webhooks/github` (401 on a bad signature) and `src/main.ts` starts the poller when
`GITHUB_REPO` is set and `GITHUB_SOURCE` is `poll`. `pnpm typecheck` must pass. Then send a test delivery:
`pnpm webhook build issue`, and a forged one: `pnpm webhook build issue --bad` (expect 401).
