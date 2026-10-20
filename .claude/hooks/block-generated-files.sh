#!/usr/bin/env bash
# PreToolUse (Edit|Write|MultiEdit): rifiuta le modifiche a mano ai file che escono solo da un comando.
# Exit 2 = blocca la chiamata e mostra il messaggio a Claude.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty' || true)
[ -z "$file" ] && exit 0

# Percorso relativo alla radice del progetto
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file#"$root"/}"

hint=""
case "$rel" in
  drizzle/*|drizzle/meta/*)
    hint="Le migrazioni Drizzle si generano: modifica src/db/schema/ e lancia 'bunx drizzle-kit generate'." ;;
  assets/data/foods.json|assets/data/foods.meta.json)
    hint="Il catalogo si genera: lancia 'bun run catalog:build'. Le correzioni ai nomi vanno in scripts/catalog/glossary-it.json." ;;
  scripts/catalog/translations-it.json)
    hint="La traduzione automatica si rigenera con scripts/catalog/translate-it.py. Le correzioni a mano vanno in scripts/catalog/glossary-it.json (ha la precedenza)." ;;
  .expo/types/*|expo-env.d.ts)
    hint="I tipi delle rotte li genera Expo: avvia il dev server ('bunx expo start') per rigenerarli." ;;
esac

if [ -n "$hint" ]; then
  echo "File generato, non si modifica a mano ($rel). $hint" >&2
  exit 2
fi
exit 0
