import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, projectById, projects } from '../data/projects'
import { profile } from '../data/profile'
import { Icon, Logo } from '../os/icons'
import { useSystem } from '../os/system'
import { sfx } from '../os/sound'
import { useWin, useWM, type MsgBoxOpts } from '../os/wm'

/* ---------------- Message box ---------------- */
export function MsgBox({ args }: { args: MsgBoxOpts }) {
  const { close } = useWin()
  const buttons = args.buttons ?? [{ label: 'OK', default: true }]
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => { first.current?.focus() }, [])
  return (
    <div className="msgbox">
      <div className="msgbox-row">
        {args.icon && <Icon name={args.icon} size={32} />}
        <div className="msgbox-text">{typeof args.message === 'string' ? args.message.split('\n').map((l, i) => <p key={i}>{l || '\u00a0'}</p>) : args.message}</div>
      </div>
      <div className="btn-row center">
        {buttons.map((b, i) => (
          <button key={b.label} ref={i === 0 ? first : undefined} className={b.default ? 'default' : ''} onClick={() => { close(); b.onClick?.() }}>{b.label}</button>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Run... ---------------- */
const runAliases: Record<string, [string, Record<string, unknown>?]> = {
  notepad: ['notepad'], 'notepad.exe': ['notepad'], paint: ['paint'], mspaint: ['paint'], pbrush: ['paint'],
  cmd: ['terminal'], command: ['terminal'], 'command.com': ['terminal'], dos: ['terminal'],
  iexplore: ['browser', { url: 'nehad://home' }], explorer: ['explorer', { path: 'My Computer' }],
  msimn: ['outlook'], blog: ['outlook'], potatolm: ['potato'], 'potato.exe': ['potato'], wmplayer: ['mediaplayer'], mplayer: ['mediaplayer'], music: ['mediaplayer'], astra: ['astra'], 'astra.com': ['astra'], tetris: ['astra'], defrag: ['defrag'], cdplayer: ['cdplayer'], 'bughunt': ['bughunt'], control: ['explorer', { path: 'Control Panel' }],
  'desk.cpl': ['display'], sysedit: ['system'], msinfo32: ['system'], outlook: ['outlook'], welcome: ['welcome'],
}

export function RunDialog() {
  const wm = useWM()
  const { close } = useWin()
  const [v, setV] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { input.current?.focus() }, [])
  const run = () => {
    const q = v.trim().toLowerCase()
    if (!q) return
    close()
    if (/^https?:\/\//.test(q)) { window.open(v.trim(), '_blank', 'noopener'); return }
    if (runAliases[q]) { const [app, args] = runAliases[q]; wm.open(app, args); return }
    if (q === 'regedit') { wm.alert({ title: 'Registry Editor', icon: 'warning', message: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Nehad\\Hireable = 1\n\nNo other keys were found.' }); return }
    if (q === 'winmine' || q === 'sol' || q === 'minesweeper') { wm.alert({ title: q, icon: 'info', message: 'That one isn\'t installed on this machine.\n\nTry Bug Hunt instead (Start > Programs > Accessories > Games).' }); return }
    const p = projects.find((x) => x.id === q || x.name.toLowerCase() === q || x.file.toLowerCase() === q || x.file.toLowerCase().replace(/\.\w+$/, '') === q)
    if (p) { wm.open('browser', { url: `nehad://projects/${p.id}` }); return }
    if (/^[a-z]:\\?/.test(q) || q === 'my computer') { wm.open('explorer', { path: v.trim().replace(/\\$/, '') || 'My Computer' }); return }
    wm.alert({ title: v.trim(), icon: 'error', message: `Cannot find the file '${v.trim()}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.` })
  }
  return (
    <div className="run-dialog">
      <div className="msgbox-row">
        <Icon name="run" size={32} />
        <p>Type the name of a program, folder, document, or Internet resource, and Nehad 98 will open it for you.</p>
      </div>
      <div className="field-row run-field">
        <label htmlFor="run-in"><u>O</u>pen:</label>
        <input id="run-in" ref={input} list="run-list" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} />
        <datalist id="run-list">{['notepad', 'cmd', 'paint', 'defrag', 'iexplore', 'xray', 'potatolm', 'regedit', 'https://github.com/orgalorg7'].map((x) => <option key={x} value={x} />)}</datalist>
      </div>
      <div className="btn-row right">
        <button className="default" onClick={run}>OK</button>
        <button onClick={close}>Cancel</button>
        <button onClick={() => { close(); wm.open('find') }}>Browse...</button>
      </div>
    </div>
  )
}

/* ---------------- Shut Down ---------------- */
export function ShutdownDialog() {
  const { close } = useWin()
  const wm = useWM()
  const sys = useSystem()
  const [choice, setChoice] = useState('shutdown')
  const ok = () => {
    close()
    if (choice === 'standby') { sys.startSaver(); return }
    wm.closeAll()
    if (choice === 'shutdown') sys.setPhase('shutting')
    else if (choice === 'restart') { try { sessionStorage.removeItem('n98.booted') } catch { /* ignore */ } sys.setPhase('bios') }
    else sys.setPhase('dos')
  }
  return (
    <div className="shutdown-dialog">
      <div className="msgbox-row">
        <Icon name="shutdown" size={32} />
        <div>
          <p>What do you want the computer to do?</p>
          {[['standby', 'Stand by'], ['shutdown', 'Shut down'], ['restart', 'Restart'], ['dos', 'Restart in MS-DOS mode']].map(([id, label]) => (
            <div className="field-row" key={id}>
              <input type="radio" id={`sd-${id}`} name="sd" checked={choice === id} onChange={() => setChoice(id)} />
              <label htmlFor={`sd-${id}`}>{label}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="btn-row right">
        <button className="default" onClick={ok}>OK</button>
        <button onClick={close}>Cancel</button>
        <button onClick={() => wm.alert({ title: 'Help', icon: 'info', message: 'Shutting down is not recommended.\nThere are still projects you haven\'t looked at.' })}>Help</button>
      </div>
    </div>
  )
}

/* ---------------- Find ---------------- */
export function FindDialog() {
  const wm = useWM()
  const [q, setQ] = useState('')
  const [text, setText] = useState('')
  const [results, setResults] = useState<typeof projects | null>(null)
  const [searching, setSearching] = useState(false)
  const find = () => {
    setSearching(true)
    sfx.hdd()
    setTimeout(() => {
      const n = q.trim().toLowerCase(), t = text.trim().toLowerCase()
      setResults(projects.filter((p) => {
        const hay = [p.name, p.file, p.tagline, p.description, ...p.stack, ...p.features].join(' ').toLowerCase()
        return (!n || p.name.toLowerCase().includes(n) || p.file.toLowerCase().includes(n)) && (!t || hay.includes(t))
      }))
      setSearching(false)
    }, 450)
  }
  return (
    <div className="find-dialog">
      <div className="find-top">
        <menu role="tablist"><li role="tab" aria-selected="true"><a>Name &amp; Location</a></li><li role="tab"><a>Date</a></li><li role="tab"><a>Advanced</a></li></menu>
        <div className="window tab-panel" role="tabpanel">
          <div className="window-body">
            <div className="field-row"><label className="lbl">Named:</label><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && find()} placeholder="e.g. xray" /></div>
            <div className="field-row"><label className="lbl">Containing text:</label><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && find()} placeholder="e.g. Rust, PostgreSQL, three.js" /></div>
            <div className="field-row"><label className="lbl">Look in:</label><select defaultValue="p"><option value="p">C:\Projects</option></select></div>
          </div>
        </div>
        <div className="find-btns">
          <button onClick={find} disabled={searching}>F<u>i</u>nd Now</button>
          <button onClick={() => setSearching(false)} disabled={!searching}>Stop</button>
          <button onClick={() => { setQ(''); setText(''); setResults(null) }}>New Search</button>
          <div className={`find-anim ${searching ? 'on' : ''}`}><Icon name="find" size={32} /></div>
        </div>
      </div>
      <div className="sunken find-results">
        <table className="details">
          <thead><tr><th>Name</th><th>In Folder</th><th>Type</th></tr></thead>
          <tbody>
            {(results ?? []).map((p) => (
              <tr key={p.id} onDoubleClick={() => wm.open('browser', { url: `nehad://projects/${p.id}` })} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && wm.open('browser', { url: `nehad://projects/${p.id}` })}>
                <td><Icon name={p.icon} size={16} /> {p.file}</td>
                <td>C:\Projects\{categories.find((c) => c.id === p.category)?.name}</td>
                <td>{p.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="status-bar"><p className="status-bar-field">{searching ? 'Searching...' : results ? `${results.length} file(s) found${results.length ? ' — double-click to open' : ''}` : 'Enter a name or some text, then press Find Now.'}</p></div>
    </div>
  )
}

/* ---------------- Welcome ---------------- */
const welcomeItems = [
  { id: 'tour', label: 'Tour My Projects', icon: 'folder', text: 'Open the Projects folder. Pick a folder on the left, click a project to read about it in the side panel, then double-click to open its page.' },
  { id: 'about', label: 'About Me', icon: 'user', text: `${profile.name}: ${profile.role.toLowerCase()} in ${profile.location}. ${profile.statement}` },
  { id: 'net', label: 'Connect to the Internet', icon: 'browser', text: 'Open my homepage in Internet Explorer: featured work, my résumé and a guestbook.' },
  { id: 'dos', label: 'Discover MS-DOS', icon: 'dos', text: 'Prefer a keyboard? The MS-DOS Prompt has real commands: DIR, CD, TYPE, PROJECTS, OPEN, NEOFETCH... try HELP.' },
  { id: 'fun', label: 'Have Some Fun', icon: 'bug', text: 'Bugs are escaping onto the desktop! Play Bug Hunt, draw in Paint, play a chiptune in CD Player, or check what\'s in the Recycle Bin.' },
] as const

export function Welcome() {
  const wm = useWM()
  const { close } = useWin()
  const [hover, setHover] = useState<string>('tour')
  const [show, setShow] = useState(() => { try { return localStorage.getItem('n98.welcome') !== '0' } catch { return true } })
  const act = (id: string) => {
    if (id === 'tour') wm.open('explorer', { path: 'C:\\Projects' })
    if (id === 'about') wm.open('browser', { url: 'nehad://about' })
    if (id === 'net') wm.open('browser', { url: 'nehad://home' })
    if (id === 'dos') wm.open('terminal')
    if (id === 'fun') wm.open('bughunt')
  }
  const item = welcomeItems.find((i) => i.id === hover)!
  return (
    <div className="welcome">
      <div className="welcome-head">
        <span>Welcome to <b>Nehad</b><i>98</i></span>
        <Logo size={40} />
      </div>
      <div className="welcome-main">
        <ul className="welcome-list">
          {welcomeItems.map((i) => (
            <li key={i.id} className={hover === i.id ? 'hot' : ''} onPointerEnter={() => setHover(i.id)} onFocus={() => setHover(i.id)} tabIndex={0}
              onClick={() => act(i.id)} onKeyDown={(e) => e.key === 'Enter' && act(i.id)}>
              <Icon name={i.icon} size={32} /><span>{i.label}</span>
            </li>
          ))}
        </ul>
        <div className="welcome-detail">
          <h3>{item.label}</h3>
          <p>{item.text}</p>
          <button className="default" onClick={() => act(item.id)}>Go ▸</button>
          <p className="welcome-tip"><b>Tip:</b> everything here works like it did in 1998: double-click icons, drag windows by their title bar, right-click the desktop, and press <kbd>Ctrl</kbd>+<kbd>Esc</kbd> for the Start menu.</p>
        </div>
      </div>
      <div className="welcome-foot">
        <div className="field-row">
          <input type="checkbox" id="welcome-show" checked={show} onChange={(e) => { setShow(e.target.checked); try { localStorage.setItem('n98.welcome', e.target.checked ? '1' : '0') } catch { /* ignore */ } }} />
          <label htmlFor="welcome-show">Show this screen each time Nehad 98 starts.</label>
        </div>
        <button onClick={close}>Close</button>
      </div>
    </div>
  )
}

/* ---------------- System Properties ---------------- */
export function SystemProps() {
  const { close } = useWin()
  const [tab, setTab] = useState('General')
  const [open, setOpen] = useState<Set<string>>(new Set(['Languages']))
  const visits = useMemo(() => { try { return Number(localStorage.getItem('n98.hits') ?? '1') } catch { return 1 } }, [])
  return (
    <div className="props-dialog">
      <menu role="tablist">
        {['General', 'Device Manager', 'Performance'].map((t) => (
          <li key={t} role="tab" aria-selected={tab === t}><a onClick={() => setTab(t)}>{t}</a></li>
        ))}
      </menu>
      <div className="window tab-panel" role="tabpanel">
        <div className="window-body">
          {tab === 'General' && (
            <div className="sys-general">
              <Icon name="computer" size={32} className="big-icon" />
              <div>
                <p><b>System:</b><br />&nbsp;&nbsp;Nehad 98<br />&nbsp;&nbsp;Second Edition<br />&nbsp;&nbsp;4.10.2026 A</p>
                <p><b>Registered to:</b><br />&nbsp;&nbsp;{profile.name}<br />&nbsp;&nbsp;@{profile.handle}<br />&nbsp;&nbsp;{profile.location}</p>
                <p><b>Computer:</b><br />&nbsp;&nbsp;Caffeinated x86-64<br />&nbsp;&nbsp;{projects.length} projects installed<br />&nbsp;&nbsp;64.0MB RAM (+ swap: coffee)</p>
              </div>
            </div>
          )}
          {tab === 'Device Manager' && (
            <>
              <div className="field-row"><input type="radio" id="dm1" defaultChecked name="dm" /><label htmlFor="dm1">View skills by type</label></div>
              <ul className="tree-view dm-tree">
                <li><Icon name="computer" size={16} /> Nehad's Brain
                  <ul>
                    {Object.entries(profile.stack).map(([k, v]) => (
                      <li key={k}>
                        <span className="tree-toggle" onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n })}>{open.has(k) ? '⊟' : '⊞'} <Icon name="chip" size={16} /> {k}</span>
                        {open.has(k) && <ul>{v.map((x) => <li key={x}><Icon name="gear" size={16} /> {x}</li>)}</ul>}
                      </li>
                    ))}
                    <li><Icon name="warning" size={16} /> Sleep (driver not found)</li>
                  </ul>
                </li>
              </ul>
            </>
          )}
          {tab === 'Performance' && (
            <div className="perf">
              <fieldset><legend>Performance status</legend>
                <table><tbody>
                  <tr><td>Memory:</td><td>64.0 MB of RAM</td></tr>
                  <tr><td>System Resources:</td><td>98% free</td></tr>
                  <tr><td>File System:</td><td>32-bit</td></tr>
                  <tr><td>Visits on this PC:</td><td>{visits}</td></tr>
                  <tr><td>Hireability:</td><td>High</td></tr>
                </tbody></table>
              </fieldset>
              {[['Focus', 92], ['Curiosity', 100], ['Coffee level', 23]].map(([l, v]) => (
                <div key={l} className="perf-bar"><span>{l}</span><div className="progress-indicator segmented"><span className="progress-indicator-bar" style={{ width: `${v}%` }} /></div></div>
              ))}
              <p className="muted">⚠ Coffee level is low. Run C:\WINDOWS\COFFEE.EXE.</p>
            </div>
          )}
        </div>
      </div>
      <div className="btn-row right"><button className="default" onClick={close}>OK</button><button onClick={close}>Cancel</button></div>
    </div>
  )
}

/* ---------------- Project Properties ---------------- */
export function ProjectProps({ args }: { args: { projectId: string } }) {
  const { close } = useWin()
  const wm = useWM()
  const p = projectById(args.projectId)!
  const [tab, setTab] = useState('General')
  const cat = categories.find((c) => c.id === p.category)!
  return (
    <div className="props-dialog">
      <menu role="tablist">
        {['General', 'Details', 'Links'].map((t) => <li key={t} role="tab" aria-selected={tab === t}><a onClick={() => setTab(t)}>{t}</a></li>)}
      </menu>
      <div className="window tab-panel" role="tabpanel">
        <div className="window-body">
          {tab === 'General' && (
            <div className="pp-general">
              <div className="pp-head"><Icon name={p.icon} size={32} /><input readOnly value={p.file} /></div>
              <hr />
              <table className="kv"><tbody>
                <tr><td>Type:</td><td>{p.name}</td></tr>
                <tr><td>Location:</td><td>C:\Projects\{cat.name}</td></tr>
                <tr><td>Role:</td><td>{p.role}</td></tr>
                <tr><td>Status:</td><td>{p.status}</td></tr>
                <tr><td>Created:</td><td>{p.year}</td></tr>
              </tbody></table>
              <hr />
              <p className="pp-desc">{p.tagline}</p>
              <hr />
              <div className="pp-attrs">
                Attributes:
                <span className="field-row"><input type="checkbox" checked={p.source !== 'public'} readOnly id="a1" /><label htmlFor="a1">Private source</label></span>
                <span className="field-row"><input type="checkbox" checked={!!p.credit} readOnly id="a2" /><label htmlFor="a2">Team project</label></span>
                <span className="field-row"><input type="checkbox" checked={!!p.featured} readOnly id="a3" /><label htmlFor="a3">Featured</label></span>
              </div>
            </div>
          )}
          {tab === 'Details' && (
            <div className="pp-details">
              <fieldset><legend>Built with</legend><p>{p.stack.join(' · ')}</p></fieldset>
              {p.highlights.length > 0 && <fieldset><legend>Highlights</legend><ul>{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul></fieldset>}
              {p.credit && <p className="muted">ℹ {p.credit}</p>}
            </div>
          )}
          {tab === 'Links' && (
            <div className="pp-links">
              {p.links.length ? p.links.map((l) => (
                <p key={l.url}><Icon name="network" size={16} /> <a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></p>
              )) : <p>{p.source === 'client' ? 'This is client work; the source belongs to the client.' : 'The source code for this project is private.'}<br /><br />Happy to walk through it on a call.</p>}
            </div>
          )}
        </div>
      </div>
      <div className="btn-row right">
        <button className="default" onClick={() => { close(); wm.open('browser', { url: `nehad://projects/${p.id}` }) }}>Open</button>
        <button onClick={close}>OK</button>
      </div>
    </div>
  )
}

/* ---------------- Image viewer ---------------- */
export function ImageView({ args }: { args: { src: string; name: string } }) {
  const [zoom, setZoom] = useState(1)
  return (
    <div className="imageview">
      <div className="toolbar">
        <button className="tool-btn" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>Zoom In</button>
        <button className="tool-btn" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>Zoom Out</button>
        <button className="tool-btn" onClick={() => setZoom(1)}>100%</button>
      </div>
      <div className="sunken imageview-area">
        <img src={args.src} alt={`Screenshot of ${args.name}`} style={{ width: `${zoom * 100}%` }} />
      </div>
      <div className="status-bar"><p className="status-bar-field">{args.name}</p><p className="status-bar-field">Zoom: {Math.round(zoom * 100)}%</p></div>
    </div>
  )
}
