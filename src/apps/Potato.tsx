import { useCallback, useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { FromWorker, ToWorker } from '../astra/worker'
import { MenuBar } from '../os/ui'
import { coarsePointer, fitFont } from '../astra/term'
import { useWin, useWM } from '../os/wm'

/*
 * POTATO.EXE: the real PotatoLM chat (x86-64 assembly) running on the same
 * in-browser emulator as ASTRA. See scripts/build-potatolm-web.sh for the build.
 */
const MODEL_PATH = 'models/potato.plm'
// Quick answers first; "who created you?" is the long one (about 200 tokens).
const SUGGESTIONS = ['hello', 'what are you?', 'what can you do?', 'who created you?']

export function Potato() {
  const wm = useWM()
  const { close } = useWin()
  const host = useRef<HTMLDivElement>(null)
  const term = useRef<Terminal | null>(null)
  const worker = useRef<Worker | null>(null)
  const assets = useRef<{ elf: ArrayBuffer; model: Uint8Array } | null>(null)
  const exited = useRef(false)
  const [status, setStatus] = useState('Booting the x86-64 emulator...')

  const send = (m: ToWorker, transfer: Transferable[] = []) => worker.current?.postMessage(m, transfer)

  const start = useCallback(async () => {
    const t = term.current!
    worker.current?.terminate()
    exited.current = false
    t.reset()
    t.write('\x1b[38;5;245mLoading POTATO.EXE (real x86-64 assembly, 809 KB) and its 44K-parameter brain...\x1b[0m\r\n')
    setStatus('Booting the x86-64 emulator...')
    try {
      assets.current ??= await Promise.all([
        fetch('/potato/potatolm.elf').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer() }),
        fetch('/potato/potato.plm').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer() }).then((b) => new Uint8Array(b)),
      ]).then(([elf, model]) => ({ elf, model }))
    } catch (err) {
      t.write(`\r\n\x1b[31mCould not load PotatoLM: ${String(err)}\x1b[0m\r\n`)
      return
    }
    const w = new Worker(new URL('../astra/worker.ts', import.meta.url), { type: 'module' })
    worker.current = w
    w.onmessage = (ev: MessageEvent<FromWorker>) => {
      const msg = ev.data
      if (msg.type === 'out') t.write(msg.data)
      else if (msg.type === 'ready') setStatus('Running · Ask it something, then press Enter. Short answers are quick; long ones stream in slowly, like typing.')
      else if (msg.type === 'exit') {
        exited.current = true
        setStatus('Exited. Press R to restart.')
        t.write(`\x1b[0m\x1b[?25h\r\n\x1b[38;5;245m[PotatoLM exited${msg.error ? ` with an emulator error: ${msg.error}` : ''}. Press R to restart, or close the window.]\x1b[0m\r\n`)
      }
    }
    w.onerror = (e) => { t.write(`\r\n\x1b[31mEmulator crashed: ${e.message}\x1b[0m\r\n`); setStatus('Emulator error') }
    const { elf: image, model } = assets.current!
    const elf = image.slice(0)
    send({ type: 'start', elf, argv: ['potatolm', '--chat', MODEL_PATH], cols: t.cols, rows: t.rows, files: { [MODEL_PATH]: model } }, [elf])
    t.focus()
  }, [])

  const key = (data: string) => {
    if (exited.current) { if (/^r$/i.test(data)) void start(); return }
    send({ type: 'input', data })
  }
  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    const t = new Terminal({
      fontFamily: '"DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 500,
      // A Linux tty turns "\n" into "\r\n" on output (ONLCR); PotatoLM relies on that.
      convertEol: true,
      theme: { background: '#0b0d08', foreground: '#d8e0c8' },
    })
    const f = new FitAddon()
    t.loadAddon(f)
    t.open(host.current!)
    // WebGL is fastest on desktops; phones get the DOM renderer, which is the most dependable there.
    if (!coarsePointer()) {
      import('@xterm/addon-webgl').then(({ WebglAddon }) => {
        try { const gl = new WebglAddon(); gl.onContextLoss(() => gl.dispose()); t.loadAddon(gl) } catch { /* DOM renderer */ }
      }).catch(() => {})
    }
    t.options.fontSize = fitFont(host.current!.clientWidth, 46)
    f.fit()
    term.current = t
    const sub = t.onData((d) => keyRef.current(d))
    const ro = new ResizeObserver(() => {
      const size = fitFont(host.current?.clientWidth ?? 0, 46)
      if (t.options.fontSize !== size) t.options.fontSize = size
      try { f.fit() } catch { return }
      send({ type: 'resize', cols: t.cols, rows: t.rows })
    })
    ro.observe(host.current!)
    void start()
    return () => { ro.disconnect(); sub.dispose(); worker.current?.terminate(); t.dispose() }
  }, [start])

  const ask = (q: string) => { key(`${q}\r`); term.current?.focus() }

  return (
    <div className="astra potato">
      <MenuBar menus={[
        { label: '&File', items: [{ label: '&Restart', onClick: () => void start() }, { sep: true }, { label: 'E&xit', onClick: close }] },
        { label: '&Help', items: [
          { label: '&How does this work?', onClick: () => wm.alert({ title: 'About POTATO.EXE', icon: 'info', message: 'This is PotatoLM, a 44K-parameter language model whose tokenizer, attention, matrix maths and chat UI are written in x86-64 assembly.\n\nYour browser runs a static build of the real binary on the Unicorn CPU emulator (QEMU\'s x86-64 core in WebAssembly). A small JavaScript "kernel" answers its Linux system calls and serves the model file.\n\nThe emulator has no AVX2, so it uses PotatoLM\'s scalar SSE path. The web build also slides its 64-token window 4 tokens at a time instead of 1, so the KV cache isn\'t rebuilt on every token.' }) },
          { label: 'Chat &Commands', onClick: () => ask('/help') },
          { label: 'View &Source on GitHub', onClick: () => window.open('https://github.com/orgalorg7/PotatoLM', '_blank', 'noopener') },
        ] },
      ]} />
      <div className="toolbar astra-toolbar">
        <span>Try:</span>
        {SUGGESTIONS.map((q) => <button key={q} className="tool-btn suggest" onClick={() => ask(q)}>{q}</button>)}
        <button onClick={() => ask('/reset')} title="Forget the conversation">Reset chat</button>
      </div>
      <div className="astra-screen" onClick={() => term.current?.focus()}>
        <div ref={host} className="astra-term" />
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{status}</p>
        <p className="status-bar-field sb-narrow">x86-64 asm → WebAssembly</p>
      </div>
    </div>
  )
}
