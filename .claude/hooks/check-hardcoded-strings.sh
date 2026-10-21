#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): cerca stringhe visibili scritte a mano nei .tsx di src/.
# Exit 2 = rimanda il messaggio a Claude (la modifica è già fatta, serve solo correggerla).
# Euristica su una riga sola: il testo JSX su più righe non viene visto.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty' || true)
[ -z "$file" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file#"$root"/}"
case "$rel" in
  src/*.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Testo tra tag (>Testo<) con almeno due lettere, e attributi visibili con valore letterale.
# Le righe con "=>" sono escluse: sono funzioni a freccia, non JSX.
hits=$(grep -nE \
  -e '>[^<>{}=]*[[:alpha:]]{2,}[^<>{}]*</' \
  -e '(placeholder|accessibilityLabel|accessibilityHint|title|label|eyebrow)="[^"{]*[[:alpha:]]{2,}' \
  "$file" | grep -vE '=>|^\s*[0-9]+:\s*(//|\*)' || true)

if [ -n "$hits" ]; then
  {
    echo "Possibili stringhe hardcoded in $rel (CLAUDE.md: nessuna stringa visibile a mano):"
    echo "$hits"
    echo "Usa useTranslation() e aggiungi la chiave in src/i18n/locales/it.ts e en.ts. Se è un falso positivo (es. simbolo o unità), ignora."
  } >&2
  exit 2
fi
exit 0
