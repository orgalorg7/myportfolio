#!/usr/bin/env bash
# Captures public/og-image.png (the link preview) from a running dev server.
# Usage: npm run dev, then: ./scripts/og-image.sh [http://localhost:5173]
set -euo pipefail
URL="${1:-http://localhost:5173}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/og-image.png"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
env -u TMPDIR google-chrome --headless=new --no-sandbox --user-data-dir="$PROFILE" --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=20000 --run-all-compositor-stages-before-draw \
  --screenshot="$PROFILE/og.png" "$URL/?scene=og" >/dev/null 2>&1
cp "$PROFILE/og.png" "$OUT"
echo "wrote $OUT"
