import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { Logo } from './icons'
import { sfx, audio } from './sound'
import { useSystem } from './system'

/* ---------------- Power button ---------------- */
export function PowerScreen() {
  const { setPhase } = useSystem()
  const go = () => { audio(); setPhase('bios') }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') go() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })
  return (
    <div className="screen power-screen" onClick={go}>
      <button className="power-btn" aria-label="Power on" onClick={(e) => { e.stopPropagation(); go() }}>
        <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 3v8M7 6.5a7 7 0 1 0 10 0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </button>
      <p className="power-hint">Press the power button</p>
      <p className="power-sub">🔊 Sound on for the full experience · {profile.name}'s portfolio</p>
    </div>
  )
}

/* ---------------- BIOS POST ---------------- */
const drives = [['Primary Master', 'XRAY-CODEBASE 10LANG'], ['Primary Slave', 'POTATOLM NASM-AVX2'], ['Secondary Master', 'ASTRA MULTIVERSE ASM'], ['Secondary Slave', 'ARGUS AUTH-ONLY']]

export function BiosScreen() {
  const { setPhase } = useSystem()
  const [mem, setMem] = useState(0)
  const [step, setStep] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    sfx.post()
    const finish = () => { if (!done.current) { done.current = true; setPhase('splash') } }
    let m = 0
    const memT = setInterval(() => { m = Math.min(65536, m + 2048); setMem(m); if (m >= 65536) clearInterval(memT) }, 28)
    const timers = [1100, 1500, 1800, 2100, 2400, 2800, 3300, 3900].map((t, i) => setTimeout(() => setStep(i + 1), t))
    const end = setTimeout(finish, 4600)
    const skip = (e: KeyboardEvent | MouseEvent) => { if (!(e instanceof KeyboardEvent) || e.key === 'Escape' || e.key === 'Delete' || e.key === 'Enter') finish() }
    // Arm skipping a moment later so the power-button click doesn't skip the POST.
    const arm = setTimeout(() => { window.addEventListener('keydown', skip); window.addEventListener('click', skip) }, 400)
    return () => { clearInterval(memT); timers.forEach(clearTimeout); clearTimeout(end); clearTimeout(arm); window.removeEventListener('keydown', skip); window.removeEventListener('click', skip) }
  }, [setPhase])

  const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  return (
    <div className="screen bios crt">
      <div className="bios-logo">
        <div className="bios-badge">N98</div>
        <span>EPA POLLUTION<br />PREVENTER (probably)</span>
      </div>
      <pre className="bios-text">{`NehadBIOS v4.51PG, An Energy Star Ally
Copyright (C) 1984-98, Orgalorg Software, Inc.

NEHAD-98 ACPI BIOS Revision 1007

Main Processor : Caffeinated x86-64 @ 3000MHz
Memory Testing : ${String(mem).padStart(6, ' ')}K ${mem >= 65536 ? 'OK' : ''}
${profile.openToWork && mem >= 65536 ? 'Hire Status    : AVAILABLE (open to work)\n' : ''}`}{step >= 1 && `
Orgalorg Plug and Play BIOS Extension v1.0A
`}{drives.slice(0, Math.max(0, step - 1)).map(([k, v]) => `   Detecting IDE ${k.padEnd(17)}... ${v}\n`).join('')}{step >= 6 && `
Verifying DMI Pool Data ............`}{step >= 7 && ` Update Success`}{step >= 8 && `
Boot from ATAPI CD-ROM : Failure ...
Starting Nehad 98...`}</pre>
      <pre className="bios-footer">{`Press DEL to enter SETUP, ESC to skip memory test
${date}-i440BX-NEHAD98-${profile.handle.toUpperCase()}`}</pre>
    </div>
  )
}

/* ---------------- Splash (startup / shutdown) ---------------- */
export function SplashScreen({ mode = 'startup' }: { mode?: 'startup' | 'shutdown' }) {
  const { setPhase } = useSystem()
  useEffect(() => {
    if (mode === 'startup') sfx.startup(); else sfx.shutdown()
    const t = setTimeout(() => setPhase(mode === 'startup' ? 'desktop' : 'off'), mode === 'startup' ? 3800 : 2600)
    const skip = () => { clearTimeout(t); setPhase(mode === 'startup' ? 'desktop' : 'off') }
    const arm = setTimeout(() => { window.addEventListener('click', skip); window.addEventListener('keydown', skip) }, 600)
    return () => { clearTimeout(t); clearTimeout(arm); window.removeEventListener('click', skip); window.removeEventListener('keydown', skip) }
  }, [mode, setPhase])
  return (
    <div className={`screen splash ${mode}`}>
      <div className="splash-clouds" />
      <div className="splash-mark">
        <div className="splash-logo"><Logo size={96} /></div>
        <div className="splash-word">
          <small>{profile.name}</small>
          <span><b>Nehad</b><i>98</i></span>
        </div>
      </div>
      {mode === 'shutdown' && <p className="splash-msg">Please wait while your computer shuts down.</p>}
      <div className="splash-bar" />
    </div>
  )
}

/* ---------------- It's now safe... ---------------- */
export function OffScreen() {
  const { setPhase } = useSystem()
  return (
    <div className="screen off-screen" onClick={() => setPhase('power')}>
      <p>It's now safe to turn off<br />your computer.</p>
      <small>(click anywhere to turn it back on)</small>
    </div>
  )
}

/* ---------------- BSOD ---------------- */
export function Bsod() {
  const { setPhase } = useSystem()
  useEffect(() => {
    sfx.error()
    let armed = false
    const t = setTimeout(() => { armed = true }, 400)
    const k = (e: KeyboardEvent | MouseEvent) => {
      if (!armed) return
      if (e instanceof KeyboardEvent && e.ctrlKey && e.altKey && e.key === 'Delete') { setPhase('power'); return }
      setPhase('desktop')
    }
    window.addEventListener('keydown', k)
    window.addEventListener('click', k)
    return () => { clearTimeout(t); window.removeEventListener('keydown', k); window.removeEventListener('click', k) }
  }, [setPhase])
  return (
    <div className="screen bsod">
      <div className="bsod-inner">
        <p className="bsod-title"><span>Nehad 98</span></p>
        <p>A fatal exception 0E has occurred at 0028:C0DE1998 in VXD PORTFOLIO(01) +
          00010E36. The current application will be terminated.</p>
        <p>*  Press any key to return to the desktop.<br />
          *  Press CTRL+ALT+DEL to restart your computer. You will<br />
          &nbsp;&nbsp;&nbsp;lose any unsaved information in all applications.<br />
          *  You were warned. The file was literally called DO_NOT_OPEN.</p>
        <p className="bsod-center">Press any key to continue <span className="blink">_</span></p>
      </div>
    </div>
  )
}

/* ---------------- Screen savers ---------------- */
export function ScreenSaver({ kind, text, preview, onExit }: { kind: string; text: string; preview?: boolean; onExit?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const g = c.getContext('2d')!
    let raf = 0
    const fit = () => { c.width = c.clientWidth; c.height = c.clientHeight }
    fit()
    window.addEventListener('resize', fit)
    const W = () => c.width, H = () => c.height
    g.fillStyle = '#000'; g.fillRect(0, 0, W(), H())

    let draw: () => void
    if (kind === 'starfield') {
      const stars = Array.from({ length: preview ? 80 : 400 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }))
      draw = () => {
        g.fillStyle = '#000'; g.fillRect(0, 0, W(), H())
        for (const s of stars) {
          s.z -= 0.006
          if (s.z <= 0.01) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1 }
          const sx = (s.x / s.z) * W() / 2 + W() / 2, sy = (s.y / s.z) * H() / 2 + H() / 2
          const r = Math.max(1, (1 - s.z) * (preview ? 2 : 3))
          const b = Math.floor((1 - s.z) * 255)
          g.fillStyle = `rgb(${b},${b},${b})`
          g.fillRect(sx, sy, r, r)
        }
      }
    } else if (kind === 'polygons') {
      const mk = () => Array.from({ length: 4 }, () => ({ x: Math.random() * W(), y: Math.random() * H(), vx: (Math.random() * 2 + 1) * (Math.random() < .5 ? -1 : 1), vy: (Math.random() * 2 + 1) * (Math.random() < .5 ? -1 : 1) }))
      const shapes = [mk(), mk()]
      const trails: { pts: { x: number; y: number }[]; hue: number }[][] = [[], []]
      let hue = 0
      draw = () => {
        g.fillStyle = '#000'; g.fillRect(0, 0, W(), H())
        hue = (hue + 0.6) % 360
        shapes.forEach((pts, si) => {
          for (const p of pts) {
            p.x += p.vx; p.y += p.vy
            if (p.x < 0 || p.x > W()) p.vx *= -1
            if (p.y < 0 || p.y > H()) p.vy *= -1
          }
          trails[si].unshift({ pts: pts.map((p) => ({ x: p.x, y: p.y })), hue: (hue + si * 160) % 360 })
          trails[si] = trails[si].slice(0, 6)
          trails[si].forEach((t, i) => {
            if (i % 2) return
            g.strokeStyle = `hsl(${t.hue} 100% 55%)`
            g.beginPath(); t.pts.forEach((p, j) => (j ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.stroke()
          })
        })
      }
    } else {
      let x = W(), y = H() / 2
      const colors = ['#ff0', '#0ff', '#f0f', '#0f0', '#fff']
      let ci = 0
      draw = () => {
        g.fillStyle = '#000'; g.fillRect(0, 0, W(), H())
        g.font = `${preview ? 14 : 48}px "Times New Roman", serif`
        g.fillStyle = colors[ci]
        g.fillText(text, x, y)
        x -= preview ? 1.2 : 3
        if (x < -g.measureText(text).width) { x = W(); y = (preview ? 20 : 60) + Math.random() * (H() - (preview ? 30 : 120)); ci = (ci + 1) % colors.length }
      }
    }
    const loop = () => { draw(); raf = requestAnimationFrame(loop) }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit) }
  }, [kind, text, preview])

  useEffect(() => {
    if (preview || !onExit) return
    let start: { x: number; y: number } | null = null
    const armT = setTimeout(() => {
      const mv = (e: PointerEvent) => { if (!start) start = { x: e.clientX, y: e.clientY }; else if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) onExit() }
      window.addEventListener('pointermove', mv)
      window.addEventListener('pointerdown', onExit)
      window.addEventListener('keydown', onExit)
      cleanup = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerdown', onExit); window.removeEventListener('keydown', onExit) }
    }, 500)
    let cleanup = () => {}
    return () => { clearTimeout(armT); cleanup() }
  }, [preview, onExit])

  return <canvas ref={ref} className={preview ? 'saver-preview' : 'screen saver'} />
}
