#!/usr/bin/env bash
# The live agent: polls the real GitHub repo and answers with Claude Code. Public input reaches it, so it
# runs with LIVE_GH_TOKEN, a fine-grained token limited to that one repo (Issues + Pull requests: read and
# write; Contents, Actions, Metadata: read), never your own gh login.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; [ -f .env ] && . ./.env; set +a
: "${LIVE_GH_TOKEN:?set LIVE_GH_TOKEN in .env: a fine-grained token for ${LIVE_REPO:-the repo} only}"
export GH_TOKEN="$LIVE_GH_TOKEN"
export GITHUB_REPO="${LIVE_REPO:-yavorsky/ambient-agents-workshop}"
export INSTANCE=live PORT="${LIVE_PORT:-4100}" WORKER_MODE="${LIVE_WORKER_MODE:-claude}" GITHUB_POLL_MS="${GITHUB_POLL_MS:-10000}"
export DB_PATH=.data/live.db NODE_NO_WARNINGS=1
echo "live agent → $GITHUB_REPO every $((GITHUB_POLL_MS / 1000)) s, worker: $WORKER_MODE, http://localhost:$PORT"
exec node_modules/.bin/tsx src/main.ts
