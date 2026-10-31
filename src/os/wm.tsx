import { createContext, useCallback, useContext, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import type { IconName } from './icons'
import { sfx } from './sound'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppArgs = Record<string, any> | undefined

export type AppDef = {
  title: string | ((args: any) => string)
  icon: IconName | ((args: any) => IconName)
  component: ComponentType<{ args: any }>
  size?: { w: number; h: number }
  key?: (args: any) => string
  multi?: boolean
  resizable?: boolean
  dialog?: boolean
  maximized?: boolean
  bodyClass?: string
}

// Filled by apps/registry.ts at startup; kept here to avoid an import cycle.
export const appRegistry: Record<string, AppDef> = {}

export type Win = {
  id: string; app: string; key: string; args: AppArgs
  title: string; icon: IconName
  x: number; y: number; w: number; h: number; z: number
  minimized: boolean; maximized: boolean
  resizable: boolean; dialog: boolean
}

export type MsgBoxOpts = {
  title: string; message: ReactNode; icon?: 'info' | 'warning' | 'error' | 'question'
  buttons?: { label: string; onClick?: () => void; default?: boolean }[]
}

type WM = {
  windows: Win[]
  activeId: string | null
  open: (app: string, args?: AppArgs) => string
  close: (id: string) => void
  focus: (id: string | null) => void
  minimize: (id: string) => void
  restore: (id: string) => void
  toggleMax: (id: string) => void
  patch: (id: string, p: Partial<Win>) => void
  alert: (o: MsgBoxOpts) => void
  closeAll: () => void
  minimizeAll: () => void
}

const Ctx = createContext<WM | null>(null)
export const useWM = () => useContext(Ctx)!

export const TASKBAR_H = 28
const isSmall = () => window.innerWidth < 640

let seq = 0

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<Win[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const zTop = useRef(10)
  const winsRef = useRef(windows)
  winsRef.current = windows

  const focus = useCallback((id: string | null) => {
    setActiveId(id)
    if (!id) return
    const w = winsRef.current.find((x) => x.id === id)
    if (!w || (w.z === zTop.current && !w.minimized)) return
    // Bump the counter here, not inside the updater, so updaters stay pure.
    const z = w.z === zTop.current ? w.z : ++zTop.current
    setWindows((ws) => ws.map((x) => (x.id === id ? { ...x, z, minimized: false } : x)))
  }, [])

  const open = useCallback((app: string, args?: AppArgs) => {
    const def = appRegistry[app]
    if (!def) throw new Error(`Unknown app ${app}`)
    const key = def.multi ? `${app}#${++seq}` : def.key ? `${app}:${def.key(args)}` : app
    const existing = winsRef.current.find((w) => w.key === key)
    if (existing) {
      if (args && !def.dialog) setWindows((ws) => ws.map((w) => (w.id === existing.id ? { ...w, args } : w)))
      focus(existing.id)
      return existing.id
    }
    sfx.open()
    const id = `w${++seq}`
    const vw = window.innerWidth, vh = window.innerHeight - TASKBAR_H
    const size = def.size ?? { w: 560, h: 420 }
    const w = Math.min(size.w, vw - 8), h = Math.min(size.h, vh - 8)
    const n = winsRef.current.length
    let x = def.dialog ? (vw - w) / 2 : 40 + (n % 7) * 26 + Math.min(120, vw * 0.06)
    let y = def.dialog ? (vh - h) / 2.6 : 24 + (n % 7) * 26
    x = Math.max(0, Math.min(x, vw - w)); y = Math.max(0, Math.min(y, vh - h))
    const resizable = def.resizable ?? !def.dialog
    const win: Win = {
      id, app, key, args,
      title: typeof def.title === 'function' ? def.title(args) : def.title,
      icon: typeof def.icon === 'function' ? def.icon(args) : def.icon,
      x: Math.round(x), y: Math.round(y), w, h, z: ++zTop.current,
      minimized: false, maximized: resizable && (def.maximized || isSmall()),
      resizable, dialog: !!def.dialog,
    }
    setWindows((ws) => [...ws, win])
    setActiveId(id)
    return id
  }, [focus])

  const close = useCallback((id: string) => {
    setWindows((ws) => {
      const rest = ws.filter((w) => w.id !== id)
      const next = [...rest].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]
      setActiveId(next?.id ?? null)
      return rest
    })
  }, [])

  const minimize = useCallback((id: string) => {
    const el = document.querySelector(`[data-window="${id}"] .title-bar`)
    const btn = document.querySelector(`[data-task="${id}"]`)
    if (el && btn) zoomRect(el.getBoundingClientRect(), btn.getBoundingClientRect())
    sfx.minimize()
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    setActiveId((a) => {
      if (a !== id) return a
      const next = winsRef.current.filter((w) => w.id !== id && !w.minimized).sort((a, b) => b.z - a.z)[0]
      return next?.id ?? null
    })
  }, [])

  const restore = useCallback((id: string) => {
    const w = winsRef.current.find((x) => x.id === id)
    const btn = document.querySelector(`[data-task="${id}"]`)
    if (w && w.minimized && btn) {
      const target = w.maximized
        ? new DOMRect(0, 0, window.innerWidth, 18)
        : new DOMRect(w.x, w.y, w.w, 18)
      zoomRect(btn.getBoundingClientRect(), target)
    }
    focus(id)
  }, [focus])

  const toggleMax = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id && w.resizable ? { ...w, maximized: !w.maximized } : w)))
  }, [])

  const patch = useCallback((id: string, p: Partial<Win>) => {
    setWindows((ws) => {
      const cur = ws.find((w) => w.id === id)
      if (!cur || (Object.keys(p) as (keyof Win)[]).every((k) => cur[k] === p[k])) return ws
      return ws.map((w) => (w.id === id ? { ...w, ...p } : w))
    })
  }, [])

  const alert = useCallback((o: MsgBoxOpts) => {
    if (o.icon === 'error') sfx.error(); else sfx.ding()
    open('msgbox', o)
  }, [open])

  const closeAll = useCallback(() => { setWindows([]); setActiveId(null) }, [])
  const minimizeAll = useCallback(() => {
    setWindows((ws) => ws.map((w) => ({ ...w, minimized: true })))
    setActiveId(null)
  }, [])

  const value = useMemo<WM>(() => ({ windows, activeId, open, close, focus, minimize, restore, toggleMax, patch, alert, closeAll, minimizeAll }),
    [windows, activeId, open, close, focus, minimize, restore, toggleMax, patch, alert, closeAll, minimizeAll])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// The classic animated "caption zoom" between a window and its taskbar button.
function zoomRect(from: DOMRect, to: DOMRect) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = document.createElement('div')
  el.className = 'zoom-rect'
  document.body.appendChild(el)
  const frame = (r: DOMRect) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` })
  const anim = el.animate([frame(from), frame(to)], { duration: 220, easing: 'linear' })
  anim.onfinish = () => el.remove()
}

/* ---------- per-window context ---------- */
type WinApi = { win: Win; close: () => void; setTitle: (t: string) => void; setIcon: (i: IconName) => void }
const WinCtx = createContext<WinApi | null>(null)
export const useWin = () => useContext(WinCtx)!
export const useMaybeWin = () => useContext(WinCtx)
export const WinProvider = WinCtx.Provider
