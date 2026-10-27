#!/usr/bin/env bash
# Stops the dashboard and every worktree agent.
set -uo pipefail
cd "$(dirname "$0")/.."
BASE="$(dirname "$(pwd)")/$(basename "$(pwd)")-wt"
for dir in "$BASE"/*/; do
  [ -d "$dir" ] && bash scripts/wt.sh stop "$(basename "$dir")"
done
pid="$(lsof -tiTCP:"${DASHBOARD_PORT:-4000}" -sTCP:LISTEN 2>/dev/null || true)"
[ -n "$pid" ] && kill $pid && echo "stopped the dashboard"
exit 0
