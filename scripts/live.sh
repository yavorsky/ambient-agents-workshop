#!/usr/bin/env bash
# The live agent: hears the real GitHub repo and answers with Claude Code. Public input reaches it, so it
# runs with LIVE_GH_TOKEN, a fine-grained token limited to that one repo (Issues + Pull requests: read and
# write; Contents, Actions, Metadata: read; Webhooks: read and write for LIVE_SOURCE=webhook), never your own gh login.
#   LIVE_SOURCE=poll (default)  ask GitHub every GITHUB_POLL_MS
#   LIVE_SOURCE=webhook         GitHub pushes each event through `gh webhook forward` (gh extension install cli/gh-webhook)
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; [ -f .env ] && . ./.env; set +a
: "${LIVE_GH_TOKEN:?set LIVE_GH_TOKEN in .env: a fine-grained token for ${LIVE_REPO:-the repo} only}"
export GH_TOKEN="$LIVE_GH_TOKEN"
export GITHUB_REPO="${LIVE_REPO:-yavorsky/ambient-agents-workshop}"
export INSTANCE=live PORT="${LIVE_PORT:-4100}" WORKER_MODE="${LIVE_WORKER_MODE:-claude}" GITHUB_POLL_MS="${GITHUB_POLL_MS:-10000}"
export GITHUB_SOURCE="${LIVE_SOURCE:-poll}"
export DB_PATH=.data/live.db NODE_NO_WARNINGS=1

if [ "$GITHUB_SOURCE" = webhook ]; then
  : "${GITHUB_WEBHOOK_SECRET:?set GITHUB_WEBHOOK_SECRET in .env (any random string)}"
  gh webhook --help >/dev/null 2>&1 || { echo "needs the gh webhook extension: gh extension install cli/gh-webhook" >&2; exit 1; }
  # A temporary webhook on the repo whose deliveries come to this laptop, no public URL needed.
  gh webhook forward --repo="$GITHUB_REPO" --events=issues,issue_comment,pull_request,workflow_run \
    --url="http://localhost:$PORT/webhooks/github" --secret="$GITHUB_WEBHOOK_SECRET" &
  forward=$!
  trap 'kill $forward 2>/dev/null || true' EXIT
  echo "live agent → $GITHUB_REPO by webhook (gh webhook forward), worker: $WORKER_MODE, http://localhost:$PORT"
else
  echo "live agent → $GITHUB_REPO every $((GITHUB_POLL_MS / 1000)) s, worker: $WORKER_MODE, http://localhost:$PORT"
fi
node_modules/.bin/tsx src/main.ts
