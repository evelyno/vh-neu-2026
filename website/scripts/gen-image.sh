#!/usr/bin/env bash
# Bild-Generierung über die Google Gemini API (Nano Banana / Nano Banana Pro).
#
# Aufruf:  scripts/gen-image.sh "<prompt>" <output-basename> [aspect_ratio] [model]
#   z. B.  scripts/gen-image.sh "modern cleanroom ..." pharma-hero 16:9
#          -> schreibt public/img/pharma-hero.webp
#
# Liest GEMINI_API_KEY aus website/.env.local.
# Versucht standardmäßig zuerst Nano Banana Pro (gemini-3-pro-image-preview)
# und fällt auf Nano Banana (gemini-2.5-flash-image) zurück.
set -euo pipefail

PROMPT="${1:?Prompt fehlt (Arg 1)}"
OUT="${2:?Output-Basename fehlt (Arg 2)}"
AR="${3:-16:9}"
FORCE_MODEL="${4:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"          # website/
ENV_FILE="$ROOT/.env.local"

[ -f "$ENV_FILE" ] || { echo "ERROR: $ENV_FILE nicht gefunden — GEMINI_API_KEY dort hinterlegen." >&2; exit 1; }
set -a; # shellcheck disable=SC1090
source "$ENV_FILE"; set +a
: "${GEMINI_API_KEY:?GEMINI_API_KEY ist in .env.local nicht gesetzt}"

IMG_DIR="$ROOT/public/img"
TMP_PNG="$(mktemp /tmp/gen-XXXXXX).png"
API="https://generativelanguage.googleapis.com/v1beta/models"

try_model() {
  local model="$1" body resp b64
  body=$(jq -n --arg p "$PROMPT" --arg ar "$AR" \
    '{contents:[{parts:[{text:$p}]}],generationConfig:{responseModalities:["IMAGE"],imageConfig:{aspectRatio:$ar}}}')
  resp=$(curl -sS -X POST "$API/$model:generateContent?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' -d "$body")
  b64=$(printf '%s' "$resp" | jq -r '.candidates[0].content.parts[]?.inlineData.data // empty' | head -1)
  if [ -z "$b64" ]; then
    echo "  [$model] kein Bild. API-Meldung:" >&2
    printf '%s' "$resp" | jq -r '.error.message // (.promptFeedback|tostring) // "unbekannt"' 2>/dev/null >&2 || echo "  (Antwort nicht parsebar)" >&2
    return 1
  fi
  printf '%s' "$b64" | base64 -d > "$TMP_PNG"
  echo "$model"
}

if [ -n "$FORCE_MODEL" ]; then
  MODELS=("$FORCE_MODEL")
else
  MODELS=("gemini-3-pro-image-preview" "gemini-2.5-flash-image")
fi

USED=""
for m in "${MODELS[@]}"; do
  echo "Versuche $m ..." >&2
  if USED=$(try_model "$m"); then break; fi
  USED=""
done

[ -n "$USED" ] || { echo "ERROR: alle Modelle fehlgeschlagen." >&2; rm -f "$TMP_PNG"; exit 1; }

mkdir -p "$IMG_DIR"
cwebp -q 82 "$TMP_PNG" -o "$IMG_DIR/$OUT.webp" >/dev/null 2>&1
rm -f "$TMP_PNG"
echo "OK ($USED) -> public/img/$OUT.webp"
