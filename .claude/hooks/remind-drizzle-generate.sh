#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): dopo una modifica a src/db/schema/ ricorda di rigenerare le migrazioni.
# drizzle/ non si modifica a mano (lo blocca block-generated-files.sh), quindi serve il comando.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty' || true)
[ -z "$file" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file#"$root"/}"
case "$rel" in
  src/db/schema/*) ;;
  *) exit 0 ;;
esac

jq -n '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: "Schema DB modificato: a fine modifica lancia `bunx drizzle-kit generate` (le migrazioni in drizzle/ non si scrivono a mano) e aggiorna test e seed se toccati."}}'
