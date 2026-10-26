#!/usr/bin/env bash
# Sync .ruler/ (AGENTS.md + skills) into every agent's files: CLAUDE.md, .claude/skills, .codex, .cursor, .opencode.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npx -y @intellectronica/ruler apply --no-backup
