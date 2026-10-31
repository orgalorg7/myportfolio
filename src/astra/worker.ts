/// <reference lib="webworker" />
// Runs the emulator off the main thread so the desktop stays responsive.
import MUnicorn from '@alexaltea/unicorn-js/x86'
import { AstraVM } from './vm'

export type ToWorker =
  | { type: 'start'; elf: ArrayBuffer; argv: string[]; cols: number; rows: number; files: Record<string, Uint8Array>; keys?: string }
  | { type: 'input'; data: string }
  | { type: 'resize'; cols: number; rows: number }

export type FromWorker =
  | { type: 'out'; data: Uint8Array }
  | { type: 'ready' }
  | { type: 'save'; path: string; data: Uint8Array }
  | { type: 'exit'; code: number | null; error: string | null }

const post = (m: FromWorker, transfer: Transferable[] = []) => (self as DedicatedWorkerGlobalScope).postMessage(m, transfer)
const enc = new TextEncoder()
const t0 = performance.now()
const now = () => BigInt(Math.round((performance.now() - t0) * 1e6)) + 1_000_000_000n

let vm: AstraVM | null = null
let timer = 0
let pending: Uint8Array[] = []

function flush() {
  if (!pending.length) return
  const size = pending.reduce((n, b) => n + b.length, 0)
  const out = new Uint8Array(size)
  let o = 0
  for (const b of pending) { out.set(b, o); o += b.length }
  pending = []
  post({ type: 'out', data: out }, [out.buffer])
}

function loop() {
  clearTimeout(timer)
  if (!vm) return
  vm.run()
  flush()
  if (vm.state === 'exited') {
    post({ type: 'exit', code: vm.exitCode, error: vm.error })
    vm.close()
    vm = null
    return
  }
  if (vm.state === 'sleep') timer = self.setTimeout(loop, Math.max(0, vm.wake ?? 0))
  else if (vm.state === 'input') { if (vm.wake !== null) timer = self.setTimeout(loop, vm.wake) }
  else timer = self.setTimeout(loop, 0)
}

let ucPromise: ReturnType<typeof MUnicorn> | null = null

self.onmessage = async (ev: MessageEvent<ToWorker>) => {
  const m = ev.data
  if (m.type === 'start') {
    ucPromise ??= MUnicorn()
    const uc = await ucPromise
    vm = new AstraVM(uc, new Uint8Array(m.elf), {
      argv: m.argv, cols: m.cols, rows: m.rows, now, files: m.files,
      write: (b) => pending.push(b.slice()),
      saveFile: (path, data) => post({ type: 'save', path, data }),
    })
    if (m.keys) vm.pushInput(enc.encode(m.keys))
    post({ type: 'ready' })
    loop()
  } else if (m.type === 'input' && vm) {
    vm.pushInput(enc.encode(m.data))
    if (vm.state === 'input') loop()
  } else if (m.type === 'resize' && vm) {
    vm.cols = m.cols
    vm.rows = m.rows
  }
}
