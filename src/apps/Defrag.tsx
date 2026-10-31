import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import { sfx } from '../os/sound'
import { useWin } from '../os/wm'

// 0 free, 1 fragmented, 2 optimised, 3 reading, 4 writing, 5 system (unmovable)
const COLORS = ['#fff', '#ff4040', '#2040d0', '#00e0e0', '#ff00ff', '#606060']
const N = 560

function fresh(): number[] {
  return Array.from({ length: N }, (_, i) => (i < 12 ? 5 : Math.random() < 0.55 ? 1 : Math.random() < 0.35 ? 2 : 0))
}

export function Defrag() {
  const { close } = useWin()
  const [cells, setCells] = useState(fresh)
  const [running, setRunning] = useState(false)
  const [details, setDetails] = useState(true)
  const [file, setFile] = useState('')
  const timer = useRef(0)

  const total = useRef(cells.filter((c) => c === 1).length || 1)
  const left = cells.filter((c) => c === 1).length
  const pct = Math.round(((total.current - left) / total.current) * 100)
  const done = left === 0

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => {
      setCells((cs) => {
        const next = cs.map((c) => (c === 3 ? 0 : c === 4 ? 2 : c))
        const from = next.findIndex((c, i) => c === 1 && i > 0)
        if (from === -1) { setRunning(false); return next }
        const to = next.findIndex((c) => c === 0)
        if (to !== -1 && to < from) { next[from] = 3; next[to] = 4 } else next[from] = 4
        if (Math.random() < 0.25) sfx.hdd()
        if (Math.random() < 0.08) { const p = projects[Math.floor(Math.random() * projects.length)]; setFile(`C:\\PROJECTS\\${p.file}`) }
        return next
      })
    }, 45)
    return () => clearInterval(timer.current)
  }, [running])

  return (
    <div className="defrag">
      <div className="defrag-title">{done ? 'Defragmentation of drive C is complete.' : running ? 'Defragmenting Drive C' : 'Ready to defragment Drive C'}</div>
      {details && (
        <div className="defrag-grid sunken">
          {cells.map((c, i) => <span key={i} style={{ background: COLORS[c] }} />)}
        </div>
      )}
      <div className="defrag-progress">
        <div className="progress-indicator segmented"><span className="progress-indicator-bar" style={{ width: `${pct}%` }} /></div>
        <span>{pct}% Complete</span>
      </div>
      <p className="defrag-file">{done ? 'Your projects are now in perfect order.' : running ? `Moving ${file || 'file allocation table'}...` : 'Click Start to begin.'}</p>
      <div className="btn-row">
        <button onClick={() => { if (done) { const f = fresh(); total.current = f.filter((c) => c === 1).length || 1; setCells(f) } setRunning((r) => !r) }}>{running ? 'Pause' : done ? 'Again' : 'Start'}</button>
        <button onClick={() => { setRunning(false); close() }}>Stop</button>
        <button onClick={() => setDetails((d) => !d)}>{details ? 'Hide Details' : 'Show Details'}</button>
      </div>
      {details && (
        <div className="defrag-legend">
          {[['Fragmented', 1], ['Optimised', 2], ['Free space', 0], ['Reading', 3], ['Writing', 4], ['Unmovable', 5]].map(([l, c]) => (
            <span key={l}><i style={{ background: COLORS[c as number] }} />{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}
