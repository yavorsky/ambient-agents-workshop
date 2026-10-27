#!/usr/bin/env bash
# Everything the talk needs, from any state, in one command:
#   naive (step-3) and finished (step-8) for the dashboard, stage (step-1) for the slides, then the dashboard itself.
# Each agent starts clean: its own data wiped, default watches, no memory of earlier runs.
set -euo pipefail
cd "$(dirname "$0")/.."
MAIN="$(pwd)"
BASE="$(dirname "$MAIN")/$(basename "$MAIN")-wt"

echo "stopping anything still running…"
bash scripts/down.sh >/dev/null 2>&1 || true

for spec in naive:step-3 finished:step-8 stage:step-1; do
  name="${spec%%:*}" ref="${spec##*:}" dir="$BASE/$name"
  if [ -d "$dir" ]; then
    git -C "$dir" checkout -q -f -B "wt/$name" "$ref"
    git -C "$dir" clean -fdqx -e node_modules -e .env -e .data
    rm -f "$dir"/.data/agent.db*
    bash scripts/wt.sh start "$name" | head -1
  else
    git branch -D "wt/$name" >/dev/null 2>&1 || true
    bash scripts/wt.sh new "$name" "$ref" | head -1
  fi
done

echo
echo "ready. Open http://localhost:4000 (start page: everything should be green)."
echo "projector: http://localhost:4000/stage   your laptop: http://localhost:4000/presenter   stop: Ctrl-C, then pnpm down"
echo
exec env NODE_NO_WARNINGS=1 node_modules/.bin/tsx --env-file-if-exists=.env dashboard/server.ts
