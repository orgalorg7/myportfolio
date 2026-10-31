import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { audio, hz, isMuted, onMute, setMuted, tone } from '../os/sound'
import { MenuBar } from '../os/ui'
import { useWin, useWM } from '../os/wm'

/* Four original tunes. Melody tokens are NOTE:eighths, '-' is a rest. */
type Track = { title: string; bpm: number; chords: [string, 'maj' | 'min' | 'dom' | 'phr'][]; lead: string; wave: OscillatorType }
const tracks: Track[] = [
  {
    title: 'Boot Sequence', bpm: 132, wave: 'square',
    chords: [['C', 'maj'], ['A', 'min'], ['F', 'maj'], ['G', 'dom'], ['C', 'maj'], ['A', 'min'], ['F', 'maj'], ['G', 'dom']],
    lead: 'E5:1 G5:1 C6:2 B5:1 G5:1 E5:2 | A5:2 C6:1 A5:1 E5:2 -:2 | F5:1 A5:1 C6:2 D6:1 C6:1 A5:2 | B5:2 G5:2 D6:2 B5:2 | C6:1 B5:1 G5:1 E5:1 G5:2 C6:2 | A5:1 G5:1 E5:1 C5:1 E5:2 A5:2 | F5:1 G5:1 A5:1 C6:1 F6:2 E6:1 D6:1 | D6:2 B5:2 G5:4',
  },
  {
    title: 'Null Pointer Blues', bpm: 92, wave: 'triangle',
    chords: [['A', 'min'], ['A', 'min'], ['D', 'min'], ['A', 'min'], ['E', 'dom'], ['D', 'min'], ['A', 'min'], ['E', 'dom']],
    lead: 'A4:2 C5:1 D5:1 D#5:1 E5:3 | G5:2 E5:2 C5:2 A4:2 | D5:2 F5:1 G5:1 G#5:1 A5:3 | G5:1 E5:1 D5:1 C5:1 A4:4 | B4:2 D5:1 E5:1 G#5:2 B5:2 | A5:2 F5:2 D5:4 | C5:1 A4:1 C5:1 E5:1 A5:2 G5:2 | G#4:4 B4:4',
  },
  {
    title: 'Merge Conflict', bpm: 158, wave: 'sawtooth',
    chords: [['D', 'min'], ['A#', 'maj'], ['C', 'maj'], ['A', 'dom'], ['D', 'min'], ['A#', 'maj'], ['G', 'min'], ['A', 'dom']],
    lead: 'D5:1 F5:1 A5:1 D6:1 C6:1 A5:1 F5:2 | D5:1 F5:1 A#5:2 F5:2 D5:2 | E5:1 G5:1 C6:2 G5:1 E5:1 C5:2 | C#5:2 E5:2 A5:2 C#6:2 | D6:1 C6:1 A5:1 F5:1 A5:2 D5:2 | F5:1 A#5:1 D6:2 C6:1 A#5:1 F5:2 | G5:2 A#5:2 D6:1 C6:1 A#5:2 | A5:1 G5:1 F5:1 E5:1 C#5:4',
  },
  {
    title: 'Cairo Nights', bpm: 104, wave: 'triangle',
    chords: [['E', 'phr'], ['E', 'phr'], ['F', 'maj'], ['E', 'phr'], ['D', 'min'], ['F', 'maj'], ['E', 'phr'], ['E', 'phr']],
    lead: 'E5:1 F5:1 G#5:2 A5:1 G#5:1 F5:2 | E5:2 B4:2 C5:1 B4:1 E5:2 | F5:1 A5:1 C6:2 B5:1 A5:1 G#5:2 | A5:1 G#5:1 F5:1 E5:1 E5:4 | D5:1 F5:1 A5:2 G#5:1 F5:1 E5:2 | F5:2 E5:1 F5:1 G#5:2 A5:2 | B5:1 C6:1 B5:1 A5:1 G#5:2 F5:2 | E5:6 -:2',
  },
]

const NOTE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }
const midi = (n: string) => { const m = n.match(/^([A-G]#?)(\d)$/)!; return NOTE[m[1]] + (Number(m[2]) + 1) * 12 }
const chordTones = (root: string, q: string) => {
  const r = NOTE[root] + 48
  const iv = q === 'maj' ? [0, 4, 7, 12] : q === 'min' ? [0, 3, 7, 12] : q === 'dom' ? [0, 4, 7, 10] : [0, 1, 4, 7]
  return iv.map((i) => r + i)
}

type Ev = { at: number; fn: (t: number, dest: AudioNode) => void }
function compile(tr: Track) {
  const e8 = 60 / tr.bpm / 2
  const evs: Ev[] = []
  let t = 0
  for (const tok of tr.lead.replace(/\|/g, ' ').split(/\s+/).filter(Boolean)) {
    const [n, d] = tok.split(':'); const dur = Number(d) * e8
    if (n !== '-') { const f = hz(midi(n)); evs.push({ at: t, fn: (s, dest) => tone(f, s, dur * 0.92, { type: tr.wave, gain: tr.wave === 'sawtooth' ? 0.035 : 0.06, release: Math.min(0.12, dur / 2), dest }) }) }
    t += dur
  }
  tr.chords.forEach(([root, q], bar) => {
    const ct = chordTones(root, q)
    for (let i = 0; i < 16; i++) {
      const at = bar * 8 * e8 + i * e8 / 2
      const f = hz(ct[i % 4] + 12)
      evs.push({ at, fn: (s, dest) => tone(f, s, e8 / 2 * 0.8, { type: 'square', gain: 0.012, release: 0.03, dest }) })
    }
    for (let i = 0; i < 8; i += 2) {
      const f = hz(ct[0] - 12 + (i === 6 ? 7 : 0))
      evs.push({ at: bar * 8 * e8 + i * e8, fn: (s, dest) => tone(f, s, e8 * 1.6, { type: 'triangle', gain: 0.11, release: 0.08, dest }) })
    }
    for (let i = 0; i < 8; i++) evs.push({ at: bar * 8 * e8 + i * e8, fn: (s, dest) => (i % 4 === 0 ? kick(s, dest) : i % 4 === 2 ? snare(s, dest) : hat(s, dest)) })
  })
  return { evs: evs.sort((a, b) => a.at - b.at), length: tr.chords.length * 8 * e8 }
}

function kick(start: number, dest: AudioNode) {
  const { ctx } = audio(); const t = ctx.currentTime + start
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12)
  g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
  o.connect(g).connect(dest); o.start(t); o.stop(t + 0.16)
}
function noiseHit(start: number, dest: AudioNode, len: number, gain: number, hp: number) {
  const { ctx } = audio(); const t = ctx.currentTime + start
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  f.type = 'highpass'; f.frequency.value = hp; g.gain.value = gain
  s.buffer = b; s.connect(f).connect(g).connect(dest); s.start(t)
}
const hat = (s: number, d: AudioNode) => noiseHit(s, d, 0.04, 0.05, 7000)
const snare = (s: number, d: AudioNode) => noiseHit(s, d, 0.14, 0.12, 1500)

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function CDPlayer() {
  const wm = useWM()
  const { close } = useWin()
  const [track, setTrack] = useState(0)
  const [state, setState] = useState<'stop' | 'play' | 'pause'>('stop')
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  useEffect(() => onMute(setMutedState), [])
  const engine = useRef<{ timer: number; startAt: number; next: number; loop: number; analyser: AnalyserNode; bus: GainNode } | null>(null)
  const viz = useRef<HTMLCanvasElement>(null)
  const compiled = useRef(tracks.map(compile))

  const stop = () => {
    const e = engine.current
    if (e) { clearInterval(e.timer); e.bus.gain.setTargetAtTime(0, audio().ctx.currentTime, 0.02); setTimeout(() => e.bus.disconnect(), 300) }
    engine.current = null
  }

  const play = (ti = track, offset = 0) => {
    // Pressing Play means "I want to hear this", so lift the system-wide mute.
    if (isMuted()) setMuted(false)
    stop()
    const { ctx, out } = audio()
    const bus = ctx.createGain(); bus.gain.value = 1
    const analyser = ctx.createAnalyser(); analyser.fftSize = 128
    bus.connect(analyser).connect(out)
    const { evs, length } = compiled.current[ti]
    const e = { timer: 0, startAt: ctx.currentTime + 0.05 - offset, next: 0, loop: 0, analyser, bus }
    e.next = evs.findIndex((x) => x.at >= offset); if (e.next < 0) e.next = 0
    e.timer = window.setInterval(() => {
      const now = ctx.currentTime
      const horizon = now + 0.25
      while (true) {
        const ev = evs[e.next]
        const at = e.startAt + e.loop * length + ev.at
        if (at > horizon) break
        if (at >= now - 0.01) ev.fn(at - now, bus)
        e.next++
        if (e.next >= evs.length) { e.next = 0; e.loop++ }
      }
      setElapsed(((now - e.startAt) % length + length) % length)
    }, 40)
    engine.current = e
    setTrack(ti); setState('play')
  }

  useEffect(() => () => stop(), [])

  // Spectrum visualiser.
  useEffect(() => {
    let raf = 0
    const c = viz.current!, g = c.getContext('2d')!
    const draw = () => {
      g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height)
      const a = engine.current?.analyser
      const bars = 24, bw = c.width / bars
      const data = new Uint8Array(64)
      if (a && state === 'play') a.getByteFrequencyData(data)
      for (let i = 0; i < bars; i++) {
        const v = (data[i + 2] ?? 0) / 255
        const h = Math.round(v * (c.height - 4) / 4) * 4
        for (let y = 0; y < h; y += 4) {
          g.fillStyle = y > c.height * 0.75 ? '#ff4040' : y > c.height * 0.5 ? '#ffff40' : '#40ff40'
          g.fillRect(i * bw + 1, c.height - y - 4, bw - 2, 3)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [state])

  const len = compiled.current[track].length
  const go = (d: number) => { const t = (track + d + tracks.length) % tracks.length; if (state === 'play') play(t); else { setTrack(t); setElapsed(0) } }

  return (
    <div className="cdplayer">
      <MenuBar menus={[
        { label: '&Disc', items: [{ label: 'E&xit', onClick: () => { stop(); close() } }] },
        { label: '&View', items: [{ label: '&Track Time Elapsed', checked: true }] },
        { label: '&Options', items: [{ label: '&Continuous Play', checked: true }] },
        { label: '&Help', items: [{ label: '&About CD Player', onClick: () => wm.alert({ title: 'About CD Player', icon: 'info', message: 'All four tracks are original compositions, synthesised live in your browser with the Web Audio API.\n\nNo samples were harmed.' }) }] },
      ]} />
      <div className="cd-top">
        <div className="cd-led sunken">
          <span className="cd-track">[{String(track + 1).padStart(2, '0')}]</span>
          <span className="cd-time">{fmt(elapsed)}</span>
          {muted && <button className="cd-muted" onClick={() => setMuted(false)} title="Sound is muted. Click to unmute.">MUTED</button>}
        </div>
        <div className="cd-btns">
          <div>
            <button className="cd-btn wide" onClick={() => (state === 'pause' ? play(track, elapsed) : play())} aria-label="Play">▶</button>
            <button className="cd-btn" onClick={() => { if (state === 'play') { stop(); setState('pause') } }} aria-label="Pause">❚❚</button>
            <button className="cd-btn" onClick={() => { stop(); setState('stop'); setElapsed(0) }} aria-label="Stop">■</button>
          </div>
          <div>
            <button className="cd-btn" onClick={() => go(-1)} aria-label="Previous track">|◀◀</button>
            <button className="cd-btn" onClick={() => state === 'play' && play(track, Math.max(0, elapsed - 4))} aria-label="Skip back">◀◀</button>
            <button className="cd-btn" onClick={() => state === 'play' && play(track, Math.min(len - 0.5, elapsed + 4))} aria-label="Skip forward">▶▶</button>
            <button className="cd-btn" onClick={() => go(1)} aria-label="Next track">▶▶|</button>
            <button className="cd-btn" onClick={() => wm.alert({ title: 'CD Player', icon: 'warning', message: 'The disc tray is stuck.\n\n(It\'s 2026. There is no disc.)' })} aria-label="Eject">⏏</button>
          </div>
        </div>
      </div>
      <div className="cd-info">
        <div className="field-row"><label>Artist:</label><select disabled><option>{profile.name} &lt;D:&gt;</option></select></div>
        <div className="field-row"><label>Title:</label><input readOnly value="Chip Sessions, Vol. 98" /></div>
        <div className="field-row"><label>Track:</label>
          <select value={track} onChange={(e) => { const t = Number(e.target.value); if (state === 'play') play(t); else { setTrack(t); setElapsed(0) } }}>
            {tracks.map((t, i) => <option key={t.title} value={i}>{t.title} &lt;{String(i + 1).padStart(2, '0')}&gt;</option>)}
          </select>
        </div>
      </div>
      <canvas ref={viz} className="cd-viz sunken" width={300} height={56} />
      <div className="status-bar">
        <p className="status-bar-field">Total Play: {fmt(compiled.current.reduce((n, c) => n + c.length, 0))} m:s</p>
        <p className="status-bar-field">Track: {fmt(len)} m:s</p>
      </div>
    </div>
  )
}
