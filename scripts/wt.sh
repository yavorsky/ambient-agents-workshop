#!/usr/bin/env bash
# Worktrees, each running its own agent instance on its own port with its own database.
#   wt new <name> [ref]   create ../<repo>-wt/<name> from ref (default HEAD) on branch wt/<name>, start it
#   wt start <name>       start (or restart) the instance in an existing worktree
#   wt stop <name>        stop it
#   wt ls                 list worktrees with port and status
#   wt logs <name>        tail its log
#   wt rm <name>          stop, remove the worktree and its branch
set -euo pipefail

MAIN="$(git worktree list --porcelain | awk 'NR==1 {print $2}')"
BASE="$(dirname "$MAIN")/$(basename "$MAIN")-wt"
cmd="${1:-ls}"
name="${2:-}"
dir="$BASE/$name"

need_name() { [ -n "$name" ] || { echo "usage: wt $cmd <name>" >&2; exit 1; }; }

free_port() {
  for port in $(seq 4101 4199); do
    if ! lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && ! grep -qs "^$port$" "$BASE"/*/.data/port; then
      echo "$port"; return
    fi
  done
  echo "no free port in 4101-4199" >&2; exit 1
}

stop() {
  local pidfile="$dir/.data/pid"
  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    kill "$(cat "$pidfile")" && echo "stopped $name"
  fi
  rm -f "$pidfile"
}

start() {
  mkdir -p "$dir/.data"
  [ -f "$dir/.data/port" ] || free_port > "$dir/.data/port"
  local port; port="$(cat "$dir/.data/port")"
  stop
  # Instances outside the main checkout reuse its node_modules and .env.
  [ -e "$dir/node_modules" ] || ln -s "$MAIN/node_modules" "$dir/node_modules"
  [ -e "$dir/.env" ] || { [ -f "$MAIN/.env" ] && cp "$MAIN/.env" "$dir/.env"; } || true
  (
    cd "$dir"
    set -a; [ -f .env ] && . ./.env; set +a
    # Worktrees never poll the real repo; the main checkout is the live agent.
    NODE_NO_WARNINGS=1 PORT="$port" INSTANCE="$name" GITHUB_REPO="" DB_PATH=".data/agent.db" \
      nohup node_modules/.bin/tsx src/main.ts > .data/server.log 2>&1 &
    echo $! > .data/pid
  )
  sleep 1
  echo "$name → http://localhost:$port  ($(git -C "$dir" describe --tags --always 2>/dev/null))"
}

case "$cmd" in
  new)
    need_name
    ref="${3:-HEAD}"
    if [ -d "$dir" ]; then echo "worktree $name exists: $dir" >&2; exit 1; fi
    mkdir -p "$BASE"
    git -C "$MAIN" worktree add -q -b "wt/$name" "$dir" "$ref"
    start
    ;;
  start) need_name; start ;;
  stop) need_name; stop ;;
  logs) need_name; tail -f "$dir/.data/server.log" ;;
  rm)
    need_name
    stop
    git -C "$MAIN" worktree remove --force "$dir"
    git -C "$MAIN" branch -D "wt/$name" >/dev/null 2>&1 || true
    echo "removed $name"
    ;;
  ls)
    for d in "$BASE"/*/; do
      [ -d "$d" ] || continue
      n="$(basename "$d")"
      port="$(cat "$d/.data/port" 2>/dev/null || echo -)"
      status=stopped
      [ -f "$d/.data/pid" ] && kill -0 "$(cat "$d/.data/pid")" 2>/dev/null && status=running
      printf '%-12s %-6s %-8s %s\n' "$n" "$port" "$status" "$(git -C "$d" describe --tags --always 2>/dev/null)"
    done
    ;;
  *) sed -n '2,8p' "$0"; exit 1 ;;
esac
