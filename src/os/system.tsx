import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Phase = 'power' | 'bios' | 'splash' | 'desktop' | 'shutting' | 'off' | 'bsod' | 'dos'

export type Settings = {
  wallpaper: string
  scheme: string
  saver: 'starfield' | 'marquee' | 'polygons' | 'none'
  saverWait: number // minutes
  marquee: string
  crt: boolean
  iconCells: Record<string, { c: number; r: number }>
}

const defaults: Settings = {
  wallpaper: 'none', scheme: 'standard', saver: 'starfield', saverWait: 2,
  marquee: 'Mohammed Nehad - software engineer - available for interesting problems',
  crt: false, iconCells: {},
}

function load(): Settings {
  try {
    // Drop iconPos from older versions; icons are stored as grid cells now.
    const { iconPos: _old, ...saved } = JSON.parse(localStorage.getItem('n98.settings') ?? '{}')
    return { ...defaults, ...saved }
  } catch { return defaults }
}

type Sys = {
  phase: Phase
  setPhase: (p: Phase) => void
  settings: Settings
  update: (p: Partial<Settings>) => void
  saverActive: boolean
  startSaver: (preview?: boolean) => void
  stopSaver: () => void
}

const Ctx = createContext<Sys | null>(null)
export const useSystem = () => useContext(Ctx)!

export function SystemProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(() => {
    // ?scene=og stages the desktop for the link-preview screenshot (see scripts/og-image.sh).
    if (new URLSearchParams(location.search).get('scene') === 'og') return 'desktop'
    try { return sessionStorage.getItem('n98.booted') ? 'desktop' : 'power' } catch { return 'power' }
  })
  const [settings, setSettings] = useState(load)
  const [saverActive, setSaverActive] = useState(false)

  const update = useCallback((p: Partial<Settings>) => {
    setSettings((s) => {
      const n = { ...s, ...p }
      try { localStorage.setItem('n98.settings', JSON.stringify(n)) } catch { /* ignore */ }
      return n
    })
  }, [])

  useEffect(() => {
    if (phase === 'desktop') try { sessionStorage.setItem('n98.booted', '1') } catch { /* ignore */ }
  }, [phase])

  // Idle timer for the screen saver.
  useEffect(() => {
    if (phase !== 'desktop' || settings.saver === 'none') return
    let t = 0
    const arm = () => { clearTimeout(t); t = window.setTimeout(() => setSaverActive(true), settings.saverWait * 60_000) }
    const evts = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const
    evts.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    arm()
    return () => { clearTimeout(t); evts.forEach((e) => window.removeEventListener(e, arm)) }
  }, [phase, settings.saver, settings.saverWait])

  const startSaver = useCallback(() => setSaverActive(true), [])
  const stopSaver = useCallback(() => setSaverActive(false), [])

  return (
    <Ctx.Provider value={{ phase, setPhase, settings, update, saverActive, startSaver, stopSaver }}>
      {children}
    </Ctx.Provider>
  )
}
