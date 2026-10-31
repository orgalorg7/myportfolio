import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPE } from 'react'
import { projects } from '../data/projects'
import { Icon, type IconName } from './icons'
import { useSystem } from './system'
import { Taskbar } from './Taskbar'
import { ContextMenu, type MenuItem } from './ui'
import { Window } from './Window'
import { TASKBAR_H, useWM } from './wm'
import { wallpaperStyle } from './wallpapers'
import { sfx } from './sound'
import { recentTouch } from './touch'
import { CELL_H, CELL_W, cellToPx, dropIcons, gridSize, layoutIcons, pxToCell } from './iconGrid'

type DIcon = { id: string; label: string; icon: IconName; shortcut?: boolean; open: () => void; props?: () => void; right?: boolean }

export function Desktop() {
  const wm = useWM()
  const sys = useSystem()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [refreshKey, setRefreshKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  // A drag moves every selected icon by the same offset.
  const drag = useRef<{ id: string; ids: string[]; moved: boolean; sx: number; sy: number; wasSelected: boolean } | null>(null)
  const [dragDelta, setDragDelta] = useState<{ ids: Set<string>; dx: number; dy: number } | null>(null)

  useEffect(() => {
    const r = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])

  const icons: DIcon[] = useMemo(() => [
    { id: 'computer', label: 'My Computer', icon: 'computer', open: () => wm.open('explorer', { path: 'My Computer' }), props: () => wm.open('system') },
    { id: 'docs', label: 'My Documents', icon: 'documents', open: () => wm.open('explorer', { path: 'My Documents' }) },
    { id: 'projects', label: 'My Projects', icon: 'folder', open: () => wm.open('explorer', { path: 'C:\\Projects' }) },
    { id: 'ie', label: 'Internet Explorer', icon: 'browser', open: () => wm.open('browser', { url: 'nehad://home' }) },
    { id: 'recycle', label: 'Recycle Bin', icon: 'recycleFull', open: () => wm.open('explorer', { path: 'Recycle Bin' }) },
    { id: 'about', label: 'About Me', icon: 'user', open: () => wm.open('browser', { url: 'nehad://about' }) },
    { id: 'cv', label: 'My CV.pdf', icon: 'txt', open: () => wm.open('pdf') },
    { id: 'dos', label: 'MS-DOS Prompt', icon: 'dos', shortcut: true, open: () => wm.open('terminal') },
    { id: 'mail', label: 'Contact Me', icon: 'mail', shortcut: true, open: () => wm.open('mail') },
    { id: 'paint', label: 'Paint', icon: 'paint', shortcut: true, open: () => wm.open('paint') },
    { id: 'bugs', label: 'Bug Hunt', icon: 'bug', shortcut: true, open: () => wm.open('bughunt') },
    { id: 'playlist', label: 'My Playlist', icon: 'cd', shortcut: true, open: () => wm.open('mediaplayer') },
    ...projects.filter((p) => p.featured).map((p): DIcon => ({
      id: `p-${p.id}`, label: p.playLabel ?? p.name, icon: p.icon, shortcut: true, right: true,
      open: () => (p.play ? wm.open(p.play) : wm.open('browser', { url: `nehad://projects/${p.id}` })),
      props: () => wm.open('properties', { projectId: p.id }),
    })),
  ], [wm])

  // Every icon sits in a grid cell; featured projects start on the right edge.
  const deskH = size.h - TASKBAR_H
  const { cols, rows } = gridSize(size.w, deskH)
  const narrow = size.w < 640
  const cells = useMemo(() => layoutIcons(icons, sys.settings.iconCells, cols, rows, !narrow), [icons, sys.settings.iconCells, cols, rows, narrow])
  const positions = useMemo(() => Object.fromEntries(Object.entries(cells).map(([id, c]) => [id, cellToPx(c)])), [cells])

  const arrange = useCallback(() => { sys.update({ iconCells: {} }) }, [sys])

  /* ---- icon interactions ---- */
  // Keep the whole group on screen while it moves, preserving its layout.
  const clampDelta = (ids: string[], dx: number, dy: number) => {
    const ps = ids.map((id) => positions[id])
    const minX = Math.min(...ps.map((p) => p.x)), maxX = Math.max(...ps.map((p) => p.x))
    const minY = Math.min(...ps.map((p) => p.y)), maxY = Math.max(...ps.map((p) => p.y))
    return {
      dx: Math.max(-minX, Math.min(size.w - CELL_W - maxX, dx)),
      dy: Math.max(-minY, Math.min(deskH - CELL_H - maxY, dy)),
    }
  }

  const landing = (ids: string[], dx: number, dy: number) =>
    dropIcons(cells, ids, (id) => pxToCell(positions[id].x + dx, positions[id].y + dy, cols, rows), cols, rows)

  const onIconDown = (ic: DIcon) => (e: RPE<HTMLDivElement>) => {
    e.stopPropagation()
    if (e.button === 2) return
    const toggle = e.ctrlKey || e.metaKey
    const wasSelected = selected.has(ic.id)
    let next: Set<string>
    if (toggle) next = new Set(wasSelected ? [...selected].filter((x) => x !== ic.id) : [...selected, ic.id])
    else next = wasSelected ? selected : new Set([ic.id])
    setSelected(next)
    // Ctrl-clicking a selected icon deselects it, so there's nothing to drag.
    if (toggle && wasSelected) { drag.current = null; return }
    drag.current = { id: ic.id, ids: [...next], moved: false, sx: e.clientX, sy: e.clientY, wasSelected: wasSelected && !toggle }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onIconMove = (e: RPE<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return
    d.moved = true
    const { dx, dy } = clampDelta(d.ids, e.clientX - d.sx, e.clientY - d.sy)
    setDragDelta({ ids: new Set(d.ids), dx, dy })
  }
  const onIconUp = (ic: DIcon) => (e: RPE<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (d?.moved && dragDelta) {
      // Snap the group to the grid; icons bump to the nearest free cell if theirs is taken.
      sys.update({ iconCells: landing(d.ids, dragDelta.dx, dragDelta.dy) })
      setDragDelta(null)
      return
    }
    setDragDelta(null)
    // A plain click on one icon of a multi-selection narrows the selection to it.
    if (d?.wasSelected && selected.size > 1) setSelected(new Set([ic.id]))
    if (e.pointerType === 'touch') { sfx.click(); ic.open() }
  }

  const iconMenu = (ic: DIcon, x: number, y: number) => {
    setSelected(new Set([ic.id]))
    setMenu({
      x, y, items: [
        { label: '&Open', bold: true, onClick: ic.open },
        ...(ic.id === 'recycle' ? [{ label: 'Empty Recycle &Bin', onClick: () => { sfx.recycle(); wm.alert({ title: 'Recycle Bin', icon: 'warning', message: 'Some regrets cannot be deleted.\n\n(The Recycle Bin is read-only. Have a look inside instead.)' }) } }] : []),
        { sep: true },
        { label: 'Cu&t', disabled: true }, { label: '&Copy', disabled: true },
        { sep: true },
        { label: 'Create &Shortcut', disabled: true },
        { label: '&Delete', onClick: () => wm.alert({ title: 'Error Deleting File', icon: 'error', message: `Cannot delete ${ic.label}: It is being used by a portfolio.\n\nMake sure the recruiter is not currently looking at it.` }) },
        { label: 'Rena&me', disabled: true },
        { sep: true },
        { label: 'P&roperties', onClick: ic.props ?? (() => wm.alert({ title: `${ic.label} Properties`, icon: 'info', message: `${ic.label}\n\nType: ${ic.shortcut ? 'Shortcut' : 'System Folder'}\nLocation: Desktop\nOpened by: you, hopefully` })) },
      ],
    })
  }

  /* ---- desktop background: marquee selection + context menu ---- */
  const onDeskDown = (e: RPE<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.button !== 0) return
    setSelected(new Set())
    wm.focus(null)
    e.currentTarget.setPointerCapture(e.pointerId)
    setBand({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY })
  }
  const onDeskMove = (e: RPE<HTMLDivElement>) => {
    if (!band) return
    const b = { ...band, x1: e.clientX, y1: e.clientY }
    setBand(b)
    const [l, r] = [Math.min(b.x0, b.x1), Math.max(b.x0, b.x1)]
    const [t, bt] = [Math.min(b.y0, b.y1), Math.max(b.y0, b.y1)]
    setSelected(new Set(icons.filter((ic) => {
      const p = positions[ic.id]
      return p.x + 60 > l && p.x + 16 < r && p.y + 50 > t && p.y < bt
    }).map((ic) => ic.id)))
  }
  const onDeskUp = () => setBand(null)

  const deskMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (e.target !== e.currentTarget) return
    setMenu({
      x: e.clientX, y: e.clientY, items: [
        { label: 'Active Des&ktop', items: [{ label: '&View as Web Page', checked: false, disabled: true }, { label: '&Customize my Desktop...', onClick: () => wm.open('display') }] },
        { sep: true },
        { label: 'Arrange &Icons', items: [{ label: 'by &Name', onClick: arrange }, { label: 'by &Type', onClick: arrange }, { label: '&Auto Arrange', onClick: arrange }] },
        { label: 'Line &Up Icons', onClick: () => sys.update({ iconCells: cells }) },
        { sep: true },
        { label: 'R&efresh', onClick: () => { setRefreshKey((k) => k + 1); sfx.click() } },
        { sep: true },
        { label: '&Paste', disabled: true },
        { label: 'Paste &Shortcut', disabled: true },
        { sep: true },
        { label: 'Ne&w', items: [{ label: '&Folder', disabled: true }, { label: '&Shortcut', disabled: true }, { sep: true }, { label: 'Text Document', icon: 'txt', onClick: () => wm.open('notepad', { title: 'New Text Document.txt', content: '' }) }, { label: 'Bitmap Image', icon: 'paint', onClick: () => wm.open('paint') }] },
        { sep: true },
        { label: 'P&roperties', onClick: () => wm.open('display') },
      ],
    })
  }

  // Keyboard: Enter opens selection, Delete complains.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (wm.activeId || (e.target as HTMLElement).closest('input,textarea')) return
      if (e.key === 'Enter') icons.filter((i) => selected.has(i.id)).forEach((i) => i.open())
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [icons, selected, wm.activeId])

  return (
    <div className={`os-root ${sys.settings.crt ? 'crt' : ''} scheme-${sys.settings.scheme}`}>
      <div className="desktop" ref={ref} style={wallpaperStyle(sys.settings.wallpaper)} key={refreshKey}
        onPointerDown={onDeskDown} onPointerMove={onDeskMove} onPointerUp={onDeskUp} onContextMenu={deskMenu}>
        {icons.map((ic) => {
          const moving = !!dragDelta?.ids.has(ic.id)
          const base = positions[ic.id]
          const p = moving ? { x: base.x + dragDelta!.dx, y: base.y + dragDelta!.dy } : base
          const sel = selected.has(ic.id)
          return (
            <div key={ic.id} className={`desk-icon ${sel ? 'selected' : ''} ${moving ? 'dragging' : ''}`}
              style={{ left: p.x, top: p.y }} tabIndex={0}
              onPointerDown={onIconDown(ic)} onPointerMove={onIconMove} onPointerUp={onIconUp(ic)}
              onDoubleClick={() => { if (recentTouch()) return; sfx.click(); ic.open() }}
              onKeyDown={(e) => e.key === 'Enter' && ic.open()}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); iconMenu(ic, e.clientX, e.clientY) }}>
              <div className="desk-icon-img"><Icon name={ic.icon} shortcut={ic.shortcut} /></div>
              <span className="desk-icon-label">{ic.label}</span>
            </div>
          )
        })}
        {dragDelta && Object.entries(landing([...dragDelta.ids], dragDelta.dx, dragDelta.dy))
          .filter(([id]) => dragDelta.ids.has(id))
          .map(([id, c]) => { const p = cellToPx(c); return <div key={`g-${id}`} className="snap-ghost" style={{ left: p.x, top: p.y, width: CELL_W - 2, height: CELL_H - 4 }} /> })}
        {band && (
          <div className="marquee" style={{ left: Math.min(band.x0, band.x1), top: Math.min(band.y0, band.y1), width: Math.abs(band.x1 - band.x0), height: Math.abs(band.y1 - band.y0) }} />
        )}
        {wm.windows.map((w) => <Window key={w.id} win={w} active={wm.activeId === w.id} />)}
      </div>
      <Taskbar />
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  )
}
