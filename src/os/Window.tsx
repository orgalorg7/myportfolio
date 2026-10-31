import { memo, useCallback, useMemo, useRef, type PointerEvent as RPE } from 'react'
import { Icon } from './icons'
import { appRegistry, TASKBAR_H, useWM, WinProvider, type Win } from './wm'

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
const MIN_W = 220, MIN_H = 140

function WindowFrame({ win, active }: { win: Win; active: boolean }) {
  const wm = useWM()
  const def = appRegistry[win.app]
  const Comp = def.component
  const drag = useRef<{ dx: number; dy: number; edge?: Edge; sx: number; sy: number; x: number; y: number; w: number; h: number } | null>(null)

  const { patch, close } = wm
  const setTitle = useCallback((title: string) => patch(win.id, { title }), [patch, win.id])
  const setIcon = useCallback((icon: string) => patch(win.id, { icon }), [patch, win.id])
  const closeSelf = useCallback(() => close(win.id), [close, win.id])
  const api = useMemo(() => ({ win, close: closeSelf, setTitle, setIcon }), [win, closeSelf, setTitle, setIcon])

  const onTitleDown = (e: RPE<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || win.maximized || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y, sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h }
  }
  const onTitleMove = (e: RPE<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.edge) return
    const x = Math.max(-win.w + 60, Math.min(window.innerWidth - 40, e.clientX - d.dx))
    const y = Math.max(0, Math.min(window.innerHeight - TASKBAR_H - 20, e.clientY - d.dy))
    wm.patch(win.id, { x, y })
  }
  const end = () => { drag.current = null }

  const onEdgeDown = (edge: Edge) => (e: RPE<HTMLDivElement>) => {
    if (win.maximized) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { dx: 0, dy: 0, edge, sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h }
  }
  const onEdgeMove = (e: RPE<HTMLDivElement>) => {
    const d = drag.current
    if (!d?.edge) return
    const mx = e.clientX - d.sx, my = e.clientY - d.sy
    let { x, y, w, h } = d
    if (d.edge.includes('e')) w = Math.max(MIN_W, d.w + mx)
    if (d.edge.includes('s')) h = Math.max(MIN_H, d.h + my)
    if (d.edge.includes('w')) { w = Math.max(MIN_W, d.w - mx); x = d.x + d.w - w }
    if (d.edge.includes('n')) { h = Math.max(MIN_H, d.h - my); y = Math.max(0, d.y + d.h - h) }
    wm.patch(win.id, { x, y, w, h })
  }

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: `calc(100% - ${TASKBAR_H}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.dialog || !win.resizable ? undefined : win.h, zIndex: win.z }

  return (
    <div
      className={`window os-window ${win.maximized ? 'maximized' : ''} ${win.dialog ? 'dialog' : ''}`}
      style={{ ...style, display: win.minimized ? 'none' : undefined }}
      data-window={win.id}
      role="dialog"
      aria-label={win.title}
      onPointerDownCapture={() => { if (!active) wm.focus(win.id) }}
    >
      <div className={`title-bar ${active ? '' : 'inactive'}`}
        onPointerDown={onTitleDown} onPointerMove={onTitleMove} onPointerUp={end} onPointerCancel={end}
        onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest('button')) wm.toggleMax(win.id) }}>
        <div className="title-bar-text">
          {!win.dialog && <Icon name={win.icon} size={16} />}
          <span>{win.title}</span>
        </div>
        <div className="title-bar-controls">
          {!win.dialog && <button aria-label="Minimize" onClick={() => wm.minimize(win.id)} />}
          {!win.dialog && <button aria-label={win.maximized ? 'Restore' : 'Maximize'} disabled={!win.resizable} onClick={() => wm.toggleMax(win.id)} />}
          {win.dialog && def.title !== 'Shut Down Windows' && <button aria-label="Help" onClick={() => wm.alert({ title: 'Help', icon: 'info', message: 'There is no help. Only portfolio.' })} />}
          <button aria-label="Close" onClick={() => wm.close(win.id)} />
        </div>
      </div>
      <div className={`window-body os-body ${def.bodyClass ?? ''}`}>
        <WinProvider value={api}>
          <Comp args={win.args} />
        </WinProvider>
      </div>
      {win.resizable && !win.maximized && (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as Edge[]).map((edge) => (
        <div key={edge} className={`rz rz-${edge}`} onPointerDown={onEdgeDown(edge)} onPointerMove={onEdgeMove} onPointerUp={end} onPointerCancel={end} />
      ))}
    </div>
  )
}

export const Window = memo(WindowFrame)
