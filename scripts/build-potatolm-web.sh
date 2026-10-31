#!/usr/bin/env bash
# Builds the PotatoLM binary that runs in the browser (POTATO.EXE).
# Differences from the native build: statically linked (the emulator has no
# dynamic loader), and the chat window slides 4 tokens at a time instead of 1,
# so the KV cache is rebuilt 4x less often. Slide 4 matched native answers in
# testing (16 was faster but garbled some replies); emulated x86 is ~300x slower.
set -euo pipefail
SRC="${1:-$HOME/Desktop/potatolm}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/potato"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp -r "$SRC/src" "$WORK/src"
patch -s -d "$WORK" -p1 < "$(dirname "$0")/potatolm-web.patch"
nasm -f elf64 -I"$WORK/src/" -DWEB_HALF_SLIDE=4 "$WORK/src/potatolm.asm" -o "$WORK/potatolm.o"
gcc -no-pie -static "$WORK/potatolm.o" -lm -o "$WORK/potatolm"
strip "$WORK/potatolm"
mkdir -p "$OUT"
cp "$WORK/potatolm" "$OUT/potatolm.elf"
cp "$SRC/models/potato.plm" "$OUT/potato.plm"
ls -la "$OUT"
