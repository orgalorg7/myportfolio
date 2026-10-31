import { useEffect, useRef } from 'react'
import { Terminal } from './apps/Terminal'
import { Desktop } from './os/Desktop'
import { BiosScreen, Bsod, OffScreen, PowerScreen, ScreenSaver, SplashScreen } from './os/Screens'
import { SystemProvider, useSystem } from './os/system'
import { useWM, WindowManagerProvider } from './os/wm'

function Shell() {
  const sys = useSystem()
  const wm = useWM()
  const greeted = useRef(false)

  // Count a visit once per session (shown on the homepage hit counter).
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('n98.counted')) {
        localStorage.setItem('n98.hits', String(Number(localStorage.getItem('n98.hits') ?? '0') + 1))
        sessionStorage.setItem('n98.counted', '1')
      }
    } catch { /* storage blocked */ }
  }, [])

  // Show the Welcome screen when the desktop first appears.
  useEffect(() => {
    if (sys.phase !== 'desktop' || greeted.current) return
    greeted.current = true
    if (new URLSearchParams(location.search).get('scene') === 'og') {
      // Staged desktop for the 1200x630 link preview.
      const place = (app: string, args: Record<string, unknown> | undefined, x: number, y: number, w: number, h: number) => wm.patch(wm.open(app, args), { x, y, w, h })
      place('explorer', { path: 'C:\\Projects\\Systems & Dev Tools' }, 560, 380, 620, 214)
      place('terminal', { run: 'neofetch' }, 664, 14, 528, 356)
      place('browser', { url: 'nehad://about' }, 150, 14, 506, 450)
      return
    }
    let show = true
    try {
      show = localStorage.getItem('n98.welcome') !== '0' && !sessionStorage.getItem('n98.welcomed')
      sessionStorage.setItem('n98.welcomed', '1')
    } catch { /* ignore */ }
    if (show && wm.windows.length === 0) setTimeout(() => wm.open('welcome'), 350)
  }, [sys.phase, wm])

  switch (sys.phase) {
    case 'power': return <PowerScreen />
    case 'bios': return <BiosScreen />
    case 'splash': return <SplashScreen />
    case 'shutting': return <SplashScreen mode="shutdown" />
    case 'off': return <OffScreen />
    case 'bsod': return <Bsod />
    case 'dos': return <div className="screen dos-mode"><Terminal args={{ fullscreen: true }} /></div>
    default:
      return (
        <>
          <Desktop />
          {sys.saverActive && <ScreenSaver kind={sys.settings.saver === 'none' ? 'starfield' : sys.settings.saver} text={sys.settings.marquee} onExit={sys.stopSaver} />}
        </>
      )
  }
}

export default function App() {
  return (
    <SystemProvider>
      <WindowManagerProvider>
        <Shell />
      </WindowManagerProvider>
    </SystemProvider>
  )
}
