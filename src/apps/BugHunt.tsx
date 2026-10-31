import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../os/icons'
import { sfx } from '../os/sound'
import { TASKBAR_H } from '../os/wm'

const NAMES = ['off-by-one', 'race condition', 'null reference', 'z-index: 9999', 'timezone bug', 'N+1 query', 'memory leak', 'stale cache', 'CORS error', 'flaky test', 'undefined is not a function', 'merge conflict', 'leap year', 'floating point', 'infinite re-render', 'Unicode RTL bug']
const ROUND = 30

type Bug = { id: number; x: number; y: number; a: number; v: number; name: string; dead?: number; wiggle: number }

export function BugHunt() {
  const [state, setState] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [time, setTime] = useState(ROUND)
  const [bugs, setBugs] = useState<Bug[]>([])
  const [best, setBest] = useState(() => { try { return Number(localStorage.getItem('n98.bugs') ?? '0') } catch { return 0 } })
  const seq = useRef(0)
  const raf = useRef(0)
  const t0 = useRef(0)
  const live = useRef<Bug[]>([])

  useEffect(() => {
    if (state !== 'play') return
    t0.current = performance.now()
    let last = performance.now(), spawnAcc = 0
    const loop = (now: number) => {
      const dt = Math.min(50, now - last) / 16.67; last = now
      const elapsed = (now - t0.current) / 1000
      const left = Math.max(0, ROUND - elapsed)
      setTime(Math.ceil(left))
      spawnAcc += dt
      const rate = Math.max(14, 50 - elapsed * 1.4)
      // Simulate in a ref (updaters must stay pure), then hand React a snapshot.
      const W = window.innerWidth, H = window.innerHeight - TASKBAR_H
      let next = live.current
        .filter((b) => !b.dead || now - b.dead < 600)
        .map((b) => {
          if (b.dead) return b
          const a = b.a + (Math.random() - 0.5) * 0.25
          return { ...b, a, x: b.x + Math.cos(a) * b.v * dt, y: b.y + Math.sin(a) * b.v * dt, wiggle: b.wiggle + dt }
        })
      const escaped = next.filter((b) => !b.dead && (b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40))
      if (escaped.length) { setMissed((m) => m + escaped.length); next = next.filter((b) => !escaped.includes(b)) }
      if (spawnAcc > rate && left > 0) {
        spawnAcc = 0
        const edge = Math.floor(Math.random() * 4)
        const x = edge === 0 ? -20 : edge === 1 ? W + 20 : Math.random() * W
        const y = edge === 2 ? -20 : edge === 3 ? H + 20 : Math.random() * H
        const a = Math.atan2(H / 2 - y + (Math.random() - .5) * H * .6, W / 2 - x + (Math.random() - .5) * W * .6)
        next = [...next, { id: ++seq.current, x, y, a, v: 1.4 + elapsed * 0.09 + Math.random(), name: NAMES[Math.floor(Math.random() * NAMES.length)], wiggle: 0 }]
      }
      live.current = next
      setBugs(next)
      if (left <= 0) { setState('over'); return }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [state])

  useEffect(() => {
    if (state !== 'over') return
    setBugs([])
    if (score > best) { setBest(score); try { localStorage.setItem('n98.bugs', String(score)) } catch { /* ignore */ } }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const start = () => { live.current = []; setScore(0); setMissed(0); setTime(ROUND); setBugs([]); setState('play') }
  const squash = (id: number) => {
    const hit = live.current.find((b) => b.id === id && !b.dead)
    if (!hit) return
    sfx.squash()
    hit.dead = performance.now()
    setBugs([...live.current])
    setScore((s) => s + 1)
  }

  const rank = score >= 60 ? 'Principal Engineer' : score >= 40 ? 'Senior Engineer' : score >= 25 ? 'Software Engineer' : score >= 10 ? 'Junior Developer' : 'Intern (unpaid)'

  return (
    <div className="bughunt">
      <div className="bh-head">
        <Icon name="bug" size={32} />
        <div>
          <b>Bug Hunt</b>
          <p>Bugs are escaping from the codebase onto your desktop. Click them before they ship to production!</p>
        </div>
      </div>
      <div className="bh-stats">
        <div className="bh-led sunken"><small>FIXED</small><b>{String(score).padStart(3, '0')}</b></div>
        <div className="bh-led sunken"><small>TIME</small><b>{String(time).padStart(2, '0')}</b></div>
        <div className="bh-led sunken"><small>SHIPPED</small><b className="red">{String(missed).padStart(3, '0')}</b></div>
      </div>
      {state === 'over' && (
        <fieldset className="bh-result">
          <legend>Sprint review</legend>
          <p>You fixed <b>{score}</b> bugs. <b>{missed}</b> shipped to production.</p>
          <p>Title earned: <b>{rank}</b></p>
          <p className="muted">Best this PC: {best} · Unpaid overtime: 0h</p>
        </fieldset>
      )}
      {state !== 'over' && state !== 'play' && <p className="muted bh-tip">30-second sprint. They get faster. Good luck.</p>}
      {state === 'play' && <p className="bh-tip blink-soft">Squash them! Bugs are on the desktop...</p>}
      <div className="btn-row center">
        <button className="default" onClick={start} disabled={state === 'play'}>{state === 'over' ? 'Play Again' : 'Start Sprint'}</button>
      </div>
      {state === 'play' && createPortal(
        <div className="bug-layer">
          {bugs.map((b) => (
            <button key={b.id} className={`bug ${b.dead ? 'dead' : ''}`} title={b.name} aria-label={`Squash ${b.name}`}
              style={{ left: b.x, top: b.y, transform: `rotate(${b.a + Math.PI / 2}rad)` }}
              onPointerDown={(e) => { e.stopPropagation(); if (!b.dead) squash(b.id) }}>
              {b.dead ? <span className="splat" /> : <span className={`bug-body ${Math.floor(b.wiggle / 4) % 2 ? 'w' : ''}`}><Icon name="bug" size={28} /></span>}
              {b.dead && <span className="bug-name">{b.name} ✔</span>}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
