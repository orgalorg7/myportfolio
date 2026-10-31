import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { Logo } from '../os/icons'
import { MenuBar } from '../os/ui'
import { useOpenFavorite } from '../os/actions'
import { useWin, useWM } from '../os/wm'
import { NavIcon } from './navicons'
import { pageFor, pageTitle } from './pages'

const HOST = 'http://www.nehad98.net'
// Real sites that may be shown inside this window (they must allow being framed).
const EMBEDDABLE = ['https://orgalorg7.github.io/']
export const isEmbeddable = (u: string) => EMBEDDABLE.some((p) => u.startsWith(p))

export const toDisplay = (u: string) => u.startsWith('nehad://') ? `${HOST}/${u.slice(8).replace(/^home$/, '')}`.replace(/\/$/, '/') : u
export function fromInput(s: string) {
  const t = s.trim()
  if (t.startsWith('nehad://')) return t
  const m = t.match(/^(?:https?:\/\/)?(?:www\.)?nehad98\.net\/?(.*)$/i)
  if (m) return `nehad://${m[1].replace(/\.html?$/, '') || 'home'}`
  if (/^[\w-]+(\.[\w-]+)+/.test(t)) return `http://${t}`
  return t
}

export function Browser({ args }: { args?: { url?: string } }) {
  const wm = useWM()
  const { setTitle, close } = useWin()
  const openFav = useOpenFavorite()
  const [hist, setHist] = useState({ stack: [args?.url ?? 'nehad://home'], i: 0 })
  const url = hist.stack[hist.i]
  const [addr, setAddr] = useState(toDisplay(url))
  const [loading, setLoading] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAddr(toDisplay(url))
    setTitle(`${pageTitle(url)} - Internet Explorer`)
    scroller.current?.scrollTo(0, 0)
    setLoading(1)
    const steps = [setTimeout(() => setLoading(2), 120), setTimeout(() => setLoading(3), 280), setTimeout(() => setLoading(0), 450)]
    return () => steps.forEach(clearTimeout)
  }, [url, setTitle])

  const nav = (u: string) => {
    if (/^https?:\/\//.test(u) && !u.includes('nehad98.net') && !isEmbeddable(u)) { window.open(u, '_blank', 'noopener'); return }
    setHist((h) => ({ stack: [...h.stack.slice(0, h.i + 1), u], i: h.i + 1 }))
  }
  const back = () => setHist((h) => ({ ...h, i: Math.max(0, h.i - 1) }))
  const fwd = () => setHist((h) => ({ ...h, i: Math.min(h.stack.length - 1, h.i + 1) }))

  // Reopening the browser with a new URL navigates the existing window.
  useEffect(() => { if (args?.url && args.url !== url) nav(args.url) }, [args?.url]) // eslint-disable-line react-hooks/exhaustive-deps

  const menus = [
    { label: '&File', items: [{ label: '&New Window', onClick: () => wm.open('browser', { url: 'nehad://home', _n: Date.now() }) }, { label: '&Print...', onClick: () => window.print() }, { sep: true as const }, { label: '&Close', onClick: close }] },
    { label: '&Edit', items: [{ label: 'Select &All', disabled: true }, { label: '&Find (on This Page)...', onClick: () => wm.open('find') }] },
    { label: '&View', items: [{ label: '&Refresh', shortcut: 'F5', onClick: () => setHist((h) => ({ ...h })) }, { label: 'Sour&ce', onClick: () => window.open('https://github.com/orgalorg7', '_blank', 'noopener') }] },
    { label: '&Go', items: [{ label: '&Back', onClick: back }, { label: '&Forward', onClick: fwd }, { label: '&Home Page', onClick: () => nav('nehad://home') }, { sep: true as const }, { label: 'Pro&jects', onClick: () => nav('nehad://projects') }, { label: '&Résumé', onClick: () => nav('nehad://resume') }] },
    { label: 'F&avorites', items: [{ label: 'My Projects', icon: 'folder' as const, onClick: () => nav('nehad://projects') }, { label: 'Guestbook', icon: 'html' as const, onClick: () => nav('nehad://guestbook') }, { sep: true as const }, ...profile.favorites.map((f) => ({ label: f.title, icon: 'music' as const, onClick: () => openFav(f) }))] },
    { label: '&Help', items: [{ label: '&About Internet Explorer', onClick: () => wm.alert({ title: 'About Internet Explorer', icon: 'info', message: 'Internet Explorer for Nehad 98\nVersion 5.0 (hand-made, 2026)\n\nBased on caffeine and nostalgia.' }) }] },
  ]

  return (
    <div className="browser">
      <div className="ie-top">
        <MenuBar menus={menus} />
        <div className={`ie-throbber ${loading ? 'spin' : ''}`}><Logo size={22} /></div>
      </div>
      <div className="toolbar ie-toolbar">
        <button className="tool-btn big" disabled={hist.i === 0} onClick={back}><NavIcon kind="back" /><span>Back</span></button>
        <button className="tool-btn big" disabled={hist.i >= hist.stack.length - 1} onClick={fwd}><NavIcon kind="fwd" /><span>Forward</span></button>
        <button className="tool-btn big" onClick={() => setLoading(0)}><NavIcon kind="stop" /><span>Stop</span></button>
        <button className="tool-btn big" onClick={() => setHist((h) => ({ ...h }))}><NavIcon kind="refresh" /><span>Refresh</span></button>
        <button className="tool-btn big" onClick={() => nav('nehad://home')}><NavIcon kind="home" /><span>Home</span></button>
        <span className="tb-divider hide-sm" />
        <button className="tool-btn big hide-sm" onClick={() => wm.open('find')}><NavIcon kind="search" /><span>Search</span></button>
        <button className="tool-btn big hide-sm" onClick={() => nav('nehad://projects')}><NavIcon kind="fav" /><span>Projects</span></button>
        <button className="tool-btn big hide-sm" onClick={() => wm.open('mail')}><NavIcon kind="mail" /><span>Mail</span></button>
      </div>
      <div className="addressbar">
        <span className="addr-label">A<u>d</u>dress</span>
        <div className="addr-field">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 1.5h8l3 3v10h-11z" fill="#fff" stroke="#000" /><circle cx="8" cy="9" r="3.5" fill="#3a6ee8" /></svg>
          <input value={addr} onChange={(e) => setAddr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && nav(fromInput(addr))} spellCheck={false} aria-label="Address" />
        </div>
        <button className="go-btn" onClick={() => nav(fromInput(addr))}>→ Go</button>
      </div>
      <div className="ie-page sunken" ref={scroller}>
        {isEmbeddable(url)
          ? <iframe className="ie-frame" src={url} title={toDisplay(url)} />
          : <div className="webpage">{pageFor(url, nav)}</div>}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{loading ? `Opening page ${toDisplay(url)}...` : 'Done'}</p>
        <p className="status-bar-field sb-narrow ie-progress">{loading > 0 && <span style={{ width: `${loading * 33}%` }} />}</p>
        <p className="status-bar-field sb-narrow">🌐 Internet zone</p>
      </div>
    </div>
  )
}
