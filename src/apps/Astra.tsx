import { useCallback, useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { FromWorker, ToWorker } from '../astra/worker'
import { useWin, useWM } from '../os/wm'
import { MenuBar } from '../os/ui'
import { coarsePointer, fitFont } from '../astra/term'

type Mode = 'solo' | 'demo' | 'versus'
const MODES: Record<Mode, { label: string; argv: string[]; keys?: string; note: string }> = {
  // The copilot's per-piece search is the expensive part under emulation, so solo starts with hints off (H).
  solo: { label: 'Solo', argv: ['tetris'], keys: 'h', note: 'You play. H turns the copilot hint on (slower in the emulator).' },
  demo: { label: 'Copilot demo', argv: ['tetris', '--demo'], note: 'The CPU copilot plays. Press a move key to take over.' },
  versus: { label: 'You vs CPU', argv: ['tetris', '--versus'], note: 'Battle arena with garbage attacks. V opens the replay timeline.' },
}
const HS_KEY = 'n98.astra.highscore'
const HS_PATH = '.tetris_highscore'

function loadHighScore(): Record<string, Uint8Array> {
  try {
    const v = localStorage.getItem(HS_KEY)
    return v ? { [HS_PATH]: Uint8Array.from(atob(v), (c) => c.charCodeAt(0)) } : {}
  } catch { return {} }
}

export function Astra() {
  const wm = useWM()
  const { close } = useWin()
  const host = useRef<HTMLDivElement>(null)
  const term = useRef<Terminal | null>(null)
  const fit = useRef<FitAddon | null>(null)
  const worker = useRef<Worker | null>(null)
  const elf = useRef<ArrayBuffer | null>(null)
  const exited = useRef(false)
  const [mode, setMode] = useState<Mode>('solo')
  const modeRef = useRef(mode)
  modeRef.current = mode
  const [status, setStatus] = useState('Booting the x86-64 emulator...')

  const send = (m: ToWorker, transfer: Transferable[] = []) => worker.current?.postMessage(m, transfer)

  const start = useCallback(async (m: Mode) => {
    const t = term.current!
    worker.current?.terminate()
    exited.current = false
    t.reset()
    t.write('\x1b[2J\x1b[H\x1b[38;5;245mLoading ASTRA.COM (real x86-64 binary, 95 KB) into the emulator...\x1b[0m\r\n')
    setStatus('Booting the x86-64 emulator...')
    try {
      elf.current ??= await fetch('/astra/astra.elf').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer() })
    } catch (err) {
      t.write(`\r\n\x1b[31mCould not load the binary: ${String(err)}\x1b[0m\r\n`)
      return
    }
    const w = new Worker(new URL('../astra/worker.ts', import.meta.url), { type: 'module' })
    worker.current = w
    w.onmessage = (ev: MessageEvent<FromWorker>) => {
      const msg = ev.data
      if (msg.type === 'out') t.write(msg.data)
      else if (msg.type === 'ready') setStatus(`Running · ${MODES[m].note}`)
      else if (msg.type === 'save') {
        try { localStorage.setItem(HS_KEY, btoa(String.fromCharCode(...msg.data))) } catch { /* storage blocked */ }
      } else if (msg.type === 'exit') {
        exited.current = true
        setStatus('Exited. Press R to restart.')
        t.write(`\x1b[0m\x1b[?25h\r\n\r\n\x1b[38;5;245m[ASTRA exited${msg.error ? ` with an emulator error: ${msg.error}` : ''}. Press R to restart, or close the window.]\x1b[0m\r\n`)
      }
    }
    w.onerror = (e) => { t.write(`\r\n\x1b[31mEmulator crashed: ${e.message}\x1b[0m\r\n`); setStatus('Emulator error') }
    const buf = elf.current!.slice(0)
    send({ type: 'start', elf: buf, argv: MODES[m].argv, cols: t.cols, rows: t.rows, files: loadHighScore(), keys: MODES[m].keys }, [buf])
    t.focus()
  }, [])

  useEffect(() => {
    const t = new Terminal({
      fontFamily: '"DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1,
      cursorBlink: false,
      scrollback: 0,
      allowProposedApi: false,
      theme: { background: '#000000', foreground: '#c0c0c0' },
    })
    const f = new FitAddon()
    t.loadAddon(f)
    t.open(host.current!)
    // WebGL draws box-drawing glyphs itself and keeps 40 fps output cheap; fall back to the DOM renderer.
    // WebGL is fastest on desktops; phones get the DOM renderer, which is the most dependable there.
    if (!coarsePointer()) {
      import('@xterm/addon-webgl').then(({ WebglAddon }) => {
        try { const gl = new WebglAddon(); gl.onContextLoss(() => gl.dispose()); t.loadAddon(gl) } catch { /* DOM renderer */ }
      }).catch(() => {})
    }
    t.options.fontSize = fitFont(host.current!.clientWidth, 62)
    f.fit()
    term.current = t
    fit.current = f
    const sub = t.onData((data) => keyRef.current(data))
    const ro = new ResizeObserver(() => {
      const size = fitFont(host.current?.clientWidth ?? 0, 62)
      if (t.options.fontSize !== size) t.options.fontSize = size
      try { f.fit() } catch { return }
      send({ type: 'resize', cols: t.cols, rows: t.rows })
    })
    ro.observe(host.current!)
    void start('solo')
    return () => { ro.disconnect(); sub.dispose(); worker.current?.terminate(); t.dispose() }
  }, [start])

  const pick = (m: Mode) => { setMode(m); void start(m) }

  // Keystrokes from the terminal and the touch pad both land here.
  const key = (data: string) => {
    if (exited.current) { if (/^r$/i.test(data)) void start(modeRef.current); return }
    send({ type: 'input', data })
  }
  const keyRef = useRef(key)
  keyRef.current = key
  const pad: [string, string, string][] = [
    ['⟲', 'z', 'Rotate left'], ['←', '\x1b[D', 'Left'], ['↻', '\x1b[A', 'Rotate'], ['→', '\x1b[C', 'Right'],
    ['↓', '\x1b[B', 'Soft drop'], ['DROP', ' ', 'Hard drop'], ['HOLD', 'c', 'Hold'], ['AUTO', 'b', 'Autopilot'], ['P', 'p', 'Pause'], ['R', 'r', 'Restart'],
  ]

  return (
    <div className="astra">
      <MenuBar menus={[
        { label: '&Game', items: [
          ...(Object.keys(MODES) as Mode[]).map((m) => ({ label: MODES[m].label, radio: true, checked: mode === m, onClick: () => pick(m) })),
          { sep: true as const },
          { label: '&Restart', onClick: () => void start(mode) },
          { label: 'E&xit', onClick: close },
        ] },
        { label: '&Help', items: [
          { label: '&Controls', onClick: () => wm.alert({ title: 'ASTRA Controls', icon: 'info', message: '← → / A D   move\n↑ / W   rotate · Z   rotate left\n↓ / S   soft drop · Space   hard drop\nC   hold · B   autopilot · N   let the copilot place one piece\nH   landing hint · P   pause · R   restart · Q   quit\n\nVersus: V replay timeline, ← → scrub, Enter branch, 1-3 difficulty.' }) },
          { label: '&How does this work?', onClick: () => wm.alert({ title: 'About ASTRA.COM', icon: 'info', message: 'This is the actual ASTRA binary: about 95 KB of hand-written x86-64 NASM with no libc, unchanged.\n\nYour browser runs it on the Unicorn CPU emulator (QEMU\'s x86-64 core compiled to WebAssembly) in a background thread. A small JavaScript "kernel" answers its 14 Linux system calls: terminal I/O, timers, random numbers, and the high-score file (kept in your browser).\n\nThe copilot\'s search is much slower emulated than native, so AI modes pause briefly on each new piece.\n\nCredits: Unicorn.js (GPL-2.0) by Alexandro Sanchez Bach, built on the Unicorn engine and QEMU. Terminal: xterm.js (MIT).' }) },
          { label: 'Emulator &License (GPL-2.0)', onClick: () => window.open('/licenses/unicorn-js-LICENSE.txt', '_blank', 'noopener') },
          { label: 'Emulator S&ource Code', onClick: () => window.open('https://github.com/AlexAltea/unicorn.js/tree/v2.1.4', '_blank', 'noopener') },
          { label: 'View &Source on GitHub', onClick: () => window.open('https://github.com/orgalorg7/asm-tetries', '_blank', 'noopener') },
        ] },
      ]} />
      <div className="toolbar astra-toolbar">
        <span>Mode:</span>
        <select value={mode} onChange={(e) => pick(e.target.value as Mode)} aria-label="Game mode">
          {(Object.keys(MODES) as Mode[]).map((m) => <option key={m} value={m}>{MODES[m].label}</option>)}
        </select>
        <button onClick={() => void start(mode)}>Restart</button>
        <span className="astra-keys">←→ move · ↑ rotate · ↓ soft · Space drop · C hold · B autopilot · P pause</span>
      </div>
      <div className="astra-screen" onClick={() => term.current?.focus()}>
        <div ref={host} className="astra-term" />
      </div>
      <div className="astra-pad" aria-label="Touch controls">
        {pad.map(([label, data, title]) => (
          <button key={title} title={title} aria-label={title}
            onPointerDown={(e) => { e.preventDefault(); key(data) }}>{label}</button>
        ))}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{status}</p>
        <p className="status-bar-field sb-narrow">x86-64 → WebAssembly</p>
      </div>
    </div>
  )
}
