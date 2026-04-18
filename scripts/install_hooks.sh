#!/usr/bin/env bash
# install_hooks.sh — install local git hooks for this fork.
#
# Usage: scripts/install_hooks.sh
# Idempotent. Run once after cloning; re-run if the hook script is updated.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

install_hook() {
  local name="$1"
  local src="$REPO_ROOT/scripts/$name"
  local dest="$HOOKS_DIR/$name"

  if [ ! -f "$src" ]; then
    echo "ERROR: $src not found" >&2
    exit 1
  fi

  chmod +x "$src"
  ln -sf "../../scripts/$name" "$dest"
  echo "Installed $name hook: $dest -> $src"
}

install_hook pre-commit
