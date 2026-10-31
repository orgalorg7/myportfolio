import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { Icon, Logo } from './icons'
import { isMuted, onMute, setMuted } from './sound'
import { StartMenu } from './StartMenu'
import { useWM } from './wm'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000 * 10); return () => clearInterval(t) }, [])
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: profile.timeZone })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: profile.timeZone })
  return <span className="tray-clock" title={`${date}\n(Cairo time, where I am)`}>{time}</span>
}

export function Taskbar() {
  const wm = useWM()
  const [startOpen, setStartOpen] = useState(false)
  const [muted, setM] = useState(isMuted())
  const startRef = useRef<HTMLButtonElement>(null)
  useEffect(() => onMute(setM), [])

  // Ctrl+Esc / Meta opens Start, like the real thing.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'Escape') || e.key === 'Meta') { e.preventDefault(); setStartOpen((o) => !o) }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const sorted = wm.windows

  return (
    <div className="taskbar" onContextMenu={(e) => e.preventDefault()}>
      <button ref={startRef} className={`start-btn ${startOpen ? 'active' : ''}`}
        onPointerDown={(e) => { e.stopPropagation(); setStartOpen((o) => !o) }}>
        <Logo size={16} /><b>Start</b>
      </button>
      <div className="tb-sep" />
      <div className="quick-launch">
        <button title="Show Desktop" onClick={() => wm.minimizeAll()}><Icon name="computer" size={16} /></button>
        <button title="Launch Internet Explorer Browser" onClick={() => wm.open('browser', { url: 'nehad://home' })}><Icon name="browser" size={16} /></button>
        <button title="MS-DOS Prompt" onClick={() => wm.open('terminal')}><Icon name="dos" size={16} /></button>
        <button title="My Projects" onClick={() => wm.open('explorer', { path: 'C:\\Projects' })}><Icon name="folder" size={16} /></button>
      </div>
      <div className="tb-sep" />
      <div className="tasks">
        {sorted.map((w) => {
          const active = wm.activeId === w.id && !w.minimized
          return (
            <button key={w.id} data-task={w.id} className={`task-btn ${active ? 'active' : ''}`} title={w.title}
              onClick={() => (active ? wm.minimize(w.id) : wm.restore(w.id))}>
              <Icon name={w.icon} size={16} />
              <span>{w.title}</span>
            </button>
          )
        })}
      </div>
      <div className="tray">
        <button className="tray-icon" title={muted ? 'Sound is off (click to turn on)' : 'Volume (click to mute)'} onClick={() => setMuted(!muted)}>
          <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M2 6h3l4-3v10l-4-3H2z" fill="#ffff00" stroke="#000" />
            {muted ? <path d="M11 5l4 6M15 5l-4 6" stroke="#f00" strokeWidth="1.5" /> : <path d="M11 6c1 1 1 3 0 4M13 4c2 2 2 6 0 8" stroke="#000" fill="none" />}
          </svg>
        </button>
        {profile.openToWork && (
          <button className="tray-icon" title={`${profile.availability}\nClick to get in touch.`} onClick={() => wm.open('mail', { subject: 'Opportunity for you' })}>
            <span className="otw-dot" />
          </button>
        )}
        <a className="tray-icon" href={profile.github} target="_blank" rel="noreferrer" title="GitHub: orgalorg7"><Icon name="network" size={16} /></a>
        <Clock />
      </div>
      {startOpen && <StartMenu onClose={() => setStartOpen(false)} anchor={startRef} />}
    </div>
  )
}
