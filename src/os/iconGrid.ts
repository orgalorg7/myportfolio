// Desktop icons live on a grid of cells, like "Align to Grid" in Windows.
export const CELL_W = 76
export const CELL_H = 78
const X0 = 4, Y0 = 6

export type Cell = { c: number; r: number }

export const gridSize = (w: number, h: number) => ({
  cols: Math.max(1, Math.floor((w - X0) / CELL_W)),
  rows: Math.max(1, Math.floor((h - Y0) / CELL_H)),
})

export const cellToPx = ({ c, r }: Cell) => ({ x: X0 + c * CELL_W, y: Y0 + r * CELL_H })

export const pxToCell = (x: number, y: number, cols: number, rows: number): Cell => ({
  c: Math.max(0, Math.min(cols - 1, Math.round((x - X0) / CELL_W))),
  r: Math.max(0, Math.min(rows - 1, Math.round((y - Y0) / CELL_H))),
})

const key = ({ c, r }: Cell) => `${c},${r}`

// Closest free cell to `want`, searching outward ring by ring.
export function nearestFree(want: Cell, taken: Set<string>, cols: number, rows: number): Cell {
  const max = Math.max(cols, rows)
  for (let d = 0; d <= max; d++) {
    const ring: Cell[] = []
    for (let dc = -d; dc <= d; dc++) {
      for (let dr = -d; dr <= d; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue
        const c = want.c + dc, r = want.r + dr
        if (c >= 0 && r >= 0 && c < cols && r < rows && !taken.has(key({ c, r }))) ring.push({ c, r })
      }
    }
    if (ring.length) {
      ring.sort((a, b) => Math.hypot(a.c - want.c, a.r - want.r) - Math.hypot(b.c - want.c, b.r - want.r))
      return ring[0]
    }
  }
  return want // grid is full; overlap rather than lose the icon
}

/**
 * Lay out every icon: saved cells first (clamped to the current screen and
 * de-duplicated), then the rest in default order. Left icons fill columns from the
 * left, `right` icons fill columns from the right edge.
 */
export function layoutIcons(
  icons: { id: string; right?: boolean }[],
  saved: Record<string, Cell>,
  cols: number,
  rows: number,
  rightSide: boolean,
): Record<string, Cell> {
  const taken = new Set<string>()
  const out: Record<string, Cell> = {}
  const claim = (id: string, cell: Cell) => { out[id] = cell; taken.add(key(cell)) }

  for (const ic of icons) {
    const s = saved[ic.id]
    if (!s) continue
    const clamped = { c: Math.min(cols - 1, Math.max(0, s.c)), r: Math.min(rows - 1, Math.max(0, s.r)) }
    claim(ic.id, taken.has(key(clamped)) ? nearestFree(clamped, taken, cols, rows) : clamped)
  }

  let li = 0, ri = 0
  for (const ic of icons) {
    if (out[ic.id]) continue
    let cell: Cell
    do {
      if (ic.right && rightSide) { cell = { c: cols - 1 - Math.floor(ri / rows), r: ri % rows }; ri++ }
      else { cell = { c: Math.floor(li / rows), r: li % rows }; li++ }
    } while (taken.has(key(cell)) && li + ri < cols * rows * 2)
    claim(ic.id, taken.has(key(cell)) ? nearestFree(cell, taken, cols, rows) : cell)
  }
  return out
}

/** Where a dragged group lands: each icon snaps to its nearest cell, bumped if taken. */
export function dropIcons(
  all: Record<string, Cell>,
  moving: string[],
  target: (id: string) => Cell,
  cols: number,
  rows: number,
): Record<string, Cell> {
  const next = { ...all }
  const taken = new Set(Object.entries(all).filter(([id]) => !moving.includes(id)).map(([, c]) => key(c)))
  for (const id of moving) {
    const want = target(id)
    const cell = taken.has(key(want)) ? nearestFree(want, taken, cols, rows) : want
    next[id] = cell
    taken.add(key(cell))
  }
  return next
}
