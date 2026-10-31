// Every sound is synthesised with WebAudio, so the site ships no audio files.
let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = readMuted()
const listeners = new Set<(m: boolean) => void>()

function readMuted() {
  try { return localStorage.getItem('n98.muted') === '1' } catch { return false }
}

export function audio() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
}

export function isMuted() { return muted }
export function onMute(fn: (m: boolean) => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
export function setMuted(m: boolean) {
  muted = m
  try { localStorage.setItem('n98.muted', m ? '1' : '0') } catch { /* private mode */ }
  if (master) master.gain.value = m ? 0 : 0.5
  listeners.forEach((fn) => fn(m))
}

type ToneOpts = { type?: OscillatorType; gain?: number; attack?: number; release?: number; detune?: number; dest?: AudioNode }

export function tone(freq: number, start: number, dur: number, o: ToneOpts = {}) {
  const { ctx, out } = audio()
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.value = freq
  if (o.detune) osc.detune.value = o.detune
  const peak = o.gain ?? 0.15
  const a = o.attack ?? 0.01
  const r = o.release ?? Math.min(0.3, dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + a)
  g.gain.setValueAtTime(peak, t + Math.max(a, dur - r))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(o.dest ?? out)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function noise(start: number, dur: number, gain = 0.05) {
  const { ctx, out } = audio()
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ctx.createBufferSource()
  const g = ctx.createGain()
  g.gain.value = gain
  src.buffer = buf
  src.connect(g).connect(out)
  src.start(ctx.currentTime + start)
}

export const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

export const sfx = {
  // PC speaker POST beep
  post() { tone(1000, 0, 0.16, { type: 'square', gain: 0.06, release: 0.02 }) },
  // An original startup swell: a slow major-ninth pad with a bell arpeggio over it.
  startup() {
    ;[51, 58, 63, 67, 70].forEach((n, i) => {
      tone(hz(n), i * 0.06, 4.2, { type: 'triangle', gain: 0.05, attack: 1.2, release: 2.4, detune: -6 })
      tone(hz(n), i * 0.06, 4.2, { type: 'sine', gain: 0.05, attack: 1.4, release: 2.4, detune: 7 })
    })
    ;[75, 79, 82, 87, 86, 82].forEach((n, i) => tone(hz(n), 0.9 + i * 0.32, 1.6, { type: 'sine', gain: 0.07, attack: 0.005, release: 1.4 }))
    tone(hz(39), 0, 4.5, { type: 'sine', gain: 0.08, attack: 1, release: 2.5 })
  },
  shutdown() {
    ;[82, 77, 70, 63].forEach((n, i) => tone(hz(n), i * 0.28, 1.4, { type: 'triangle', gain: 0.07, attack: 0.01, release: 1.2 }))
    ;[51, 58].forEach((n) => tone(hz(n), 0, 2.6, { type: 'sine', gain: 0.06, attack: 0.4, release: 1.8 }))
  },
  ding() {
    tone(hz(84), 0, 0.6, { type: 'sine', gain: 0.12, release: 0.55 })
    tone(hz(91), 0, 0.45, { type: 'sine', gain: 0.05, release: 0.4 })
  },
  error() {
    tone(hz(64), 0, 0.35, { type: 'square', gain: 0.04, release: 0.3 })
    tone(hz(60), 0.12, 0.45, { type: 'square', gain: 0.04, release: 0.4 })
  },
  chord() {
    ;[72, 76, 79].forEach((n, i) => tone(hz(n), i * 0.03, 0.7, { type: 'triangle', gain: 0.06, release: 0.6 }))
  },
  click() { noise(0, 0.02, 0.06) },
  open() { tone(hz(79), 0, 0.08, { type: 'square', gain: 0.025 }); tone(hz(86), 0.05, 0.1, { type: 'square', gain: 0.025 }) },
  minimize() { tone(hz(84), 0, 0.07, { type: 'square', gain: 0.02 }); tone(hz(77), 0.05, 0.09, { type: 'square', gain: 0.02 }) },
  recycle() { noise(0, 0.35, 0.12); noise(0.15, 0.4, 0.08) },
  squash() { noise(0, 0.08, 0.2); tone(120, 0, 0.12, { type: 'square', gain: 0.05 }) },
  hdd() { for (let i = 0; i < 6; i++) noise(i * 0.05 + Math.random() * 0.03, 0.012, 0.05) },
}
