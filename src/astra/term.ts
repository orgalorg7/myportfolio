// Shared terminal sizing for the emulator windows (ASTRA, PotatoLM).
export const coarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/** Largest font size (7–14 px) that still fits `minCols` columns in `width` pixels. */
export function fitFont(width: number, minCols: number) {
  if (!width) return 14
  const charWidth = 0.6 // monospace advance is roughly 0.6em
  return Math.max(7, Math.min(14, Math.floor((width - 16) / (minCols * charWidth))))
}
