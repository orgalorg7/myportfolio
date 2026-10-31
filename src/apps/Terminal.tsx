import { useEffect, useRef, useState, type ReactNode } from 'react'
import { childPath, parentPath, resolvePath, type FsNode } from '../data/fs'
import { profile } from '../data/profile'
import { categories, projects, projectsIn } from '../data/projects'
import { useRunAction } from '../os/actions'
import { useSystem } from '../os/system'
import { sfx } from '../os/sound'
import { useMaybeWin, useWM } from '../os/wm'

type Line = { t: ReactNode; c?: string }

const dosColors = ['#000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa', '#555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#fff']

const banner: Line[] = [
  { t: '' },
  { t: 'Nehad 98 [Version 4.10.2026]' },
  { t: '(C)Copyright Orgalorg Corp 1981-2026.' },
  { t: '' },
  { t: 'Type HELP for a list of commands. Try NEOFETCH, PROJECTS, or OPEN XRAY.', c: '#ffff55' },
  { t: '' },
]

const COMMANDS = ['astra', 'music', 'potatolm', 'blog', 'cv', 'help', 'cls', 'dir', 'ls', 'cd', 'type', 'cat', 'open', 'start', 'projects', 'tree', 'neofetch', 'whoami', 'about', 'ver', 'date', 'time', 'echo', 'color', 'mem', 'ping', 'history', 'github', 'linkedin', 'contact', 'hire', 'edit', 'potato', 'matrix', 'sudo', 'format', 'exit', 'win']

const potato = String.raw`
       .-"""-.
      /  o o  \     PotatoLM v2
     |    ^    |    "Small tuber.
      \  '-'  /      Big instructions."
       '-...-'
`

function short(name: string) {
  const [base, ext = ''] = name.replace(/\s+/g, '').toUpperCase().split(/\.(?=[^.]+$)/)
  const b = base.length > 8 ? `${base.slice(0, 6)}~1` : base
  return `${b.padEnd(8)} ${ext.slice(0, 3).padEnd(3)}`
}

export function Terminal({ args }: { args?: { fullscreen?: boolean; run?: string } }) {
  const wm = useWM()
  const sys = useSystem()
  const win = useMaybeWin()
  const run = useRunAction()
  const full = !!args?.fullscreen
  const [lines, setLines] = useState<Line[]>(args?.run ? [] : banner)
  const [cwd, setCwd] = useState('C:')
  const [input, setInput] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)
  const [fg, setFg] = useState('#c0c0c0')
  const [bg, setBg] = useState('#000')
  const [matrix, setMatrix] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight) }, [lines])
  useEffect(() => { inputRef.current?.focus() }, [])

  const prompt = `${cwd.length === 2 ? `${cwd}\\` : cwd}>`
  const out = (...ls: (string | Line)[]) => setLines((p) => [...p, ...ls.map((l) => (typeof l === 'string' ? { t: l } : l))])

  const findChild = (dir: FsNode | null, name: string) => {
    const n = name.replace(/^"|"$/g, '').toLowerCase()
    return dir?.children?.find((c) => c.name.toLowerCase() === n || short(c.name).replace(/\s+/g, '').toLowerCase() === n.replace('.', '') || c.name.toLowerCase().startsWith(n))
  }
  const findProject = (q: string) => {
    const n = q.toLowerCase().replace(/\.(exe|com|txt)$/, '')
    return projects.find((p) => p.id === n || p.name.toLowerCase() === n || p.file.toLowerCase().replace(/\.\w+$/, '') === n)
  }

  const leaveDos = (then?: () => void) => { if (full) { sys.setPhase('desktop'); if (then) setTimeout(then, 50) } else then?.() }

  const exec = (raw: string) => {
    const line = raw.trim()
    out({ t: `${prompt}${raw}` })
    if (!line) return
    setHist((h) => [line, ...h].slice(0, 50)); setHi(-1)
    const [cmd0, ...rest] = line.split(/\s+/)
    const cmd = cmd0.toLowerCase()
    const arg = rest.join(' ')
    const dir = resolvePath(cwd)

    if (/^[a-z]:$/i.test(cmd)) {
      if (resolvePath(cmd.toUpperCase())) setCwd(cmd.toUpperCase()); else out('Invalid drive specification')
      return
    }

    switch (cmd) {
      case 'help': case '?':
        out(
          { t: 'Available commands:', c: '#55ffff' },
          '  DIR / LS          List files in the current directory',
          '  CD <dir>          Change directory (CD .. to go up, D: for the CD-ROM)',
          '  TYPE <file>       Show a file or a project write-up',
          '  OPEN <name>       Open a file, folder, app or project (alias START)',
          '  PROJECTS          List all projects       TREE   Show the projects tree',
          '  NEOFETCH          System info, but cooler  WHOAMI Who is this guy?',
          '  GITHUB / LINKEDIN Open profiles           CONTACT Send me a message',
          '  HIRE              The elevator pitch      EDIT <file> Open in Notepad',
          '  ASTRA             Play the real assembly game (runs in an emulator)',
          '  MUSIC             Play my playlist in Media Player',
          '  POTATOLM          Chat with my assembly language model',
          '  BLOG              Read my blog in Outlook Express',
          '  CV                Read or download my CV (PDF)',
          '  COLOR <bf>        e.g. COLOR 0A           CLS    Clear the screen',
          '  DATE TIME VER MEM ECHO PING HISTORY EXIT',
          { t: '  ...and a few undocumented ones.', c: '#808080' },
        ); break
      case 'cls': setLines([]); break
      case 'dir': case 'ls': {
        if (!dir?.children) { out('File not found'); break }
        out(' Volume in drive C is NEHAD98', ' Volume Serial Number is 1998-0731', ` Directory of ${prompt.slice(0, -1)}`, '')
        if (cwd.length > 2) out(`${'.'.padEnd(16)}<DIR>        10-31-26  9:41a`, `${'..'.padEnd(16)}<DIR>        10-31-26  9:41a`)
        let files = 0, dirs = 0
        for (const c of dir.children) {
          const isDir = !!c.children
          if (isDir) dirs++; else files++
          out(`${short(c.name)}    ${isDir ? '<DIR>     ' : String((parseInt(c.size ?? '1') || 1) * 1024).padStart(10)}   10-31-26  9:41a  ${c.name}`)
        }
        out(`${String(files).padStart(9)} file(s)`, `${String(dirs).padStart(9)} dir(s)     640,000 bytes free`)
        break
      }
      case 'cd': case 'chdir': {
        if (!arg) { out(prompt.slice(0, -1)); break }
        if (arg === '..') { const p = parentPath(cwd); if (p && p !== 'My Computer') setCwd(p); break }
        if (arg === '\\' || arg === '/') { setCwd(cwd.slice(0, 2)); break }
        if (/^[a-z]:\\?/i.test(arg)) { const p = arg.replace(/\\$/, ''); if (resolvePath(p)) setCwd(p.length === 2 ? p.toUpperCase() : p); else out('Invalid directory'); break }
        const c = findChild(dir, arg)
        if (c?.children) setCwd(childPath(cwd, c)); else out('Invalid directory')
        break
      }
      case 'type': case 'cat': case 'more': {
        if (!arg) { out('Required parameter missing'); break }
        const c = findChild(dir, arg)
        const p = c?.projectId ? projects.find((x) => x.id === c.projectId) : findProject(arg)
        if (c?.content !== undefined) { c.content.split('\n').forEach((l) => out(l)); break }
        if (p) {
          out({ t: `${p.name} — ${p.tagline}`, c: '#ffff55' }, '', p.description, '', ...p.features.map((f) => `  * ${f}`), '', { t: `Stack: ${p.stack.join(', ')}`, c: '#55ffff' }, ...p.links.map((l) => ({ t: `${l.label}: ${l.url}`, c: '#55ff55' })), '', { t: `Tip: OPEN ${p.id.toUpperCase()} to see the full page.`, c: '#808080' })
          break
        }
        out('File not found')
        break
      }
      case 'edit': {
        const c = findChild(dir, arg)
        if (c?.content !== undefined) leaveDos(() => wm.open('notepad', { title: c.name, content: c.content }))
        else leaveDos(() => wm.open('notepad'))
        break
      }
      case 'open': case 'start': case 'run': {
        if (!arg) { out('Usage: OPEN <file, folder, app or project>'); break }
        const c = findChild(dir, arg)
        if (c) { out(`Opening ${c.name}...`); leaveDos(() => (c.children ? wm.open('explorer', { path: childPath(cwd, c) }) : run(c.action, c))); break }
        const p = findProject(arg)
        if (p) { out(`Opening ${p.name}...`); leaveDos(() => wm.open('browser', { url: `nehad://projects/${p.id}` })); break }
        if (/^about(\.html)?$/i.test(arg)) { out('Opening About Me...'); leaveDos(() => wm.open('browser', { url: 'nehad://about' })); break }
        const apps: Record<string, string> = { notepad: 'notepad', paint: 'paint', mspaint: 'paint', explorer: 'explorer', iexplore: 'browser', browser: 'browser', defrag: 'defrag', cdplayer: 'cdplayer', mail: 'mail', bughunt: 'bughunt', bugs: 'bughunt' }
        if (apps[arg.toLowerCase()]) { leaveDos(() => wm.open(apps[arg.toLowerCase()], arg.toLowerCase() === 'iexplore' || arg.toLowerCase() === 'browser' ? { url: 'nehad://home' } : arg.toLowerCase() === 'explorer' ? { path: 'My Computer' } : undefined)); break }
        out(`'${arg}' is not recognized. Try PROJECTS to see what you can open.`)
        break
      }
      case 'projects': {
        for (const c of categories) {
          out({ t: `\n[${c.name}]`, c: '#55ffff' })
          for (const p of projectsIn(c.id)) out({ t: `  ${p.id.padEnd(12)} ${p.name.padEnd(28).slice(0, 28)} ${p.tagline.slice(0, 60)}`, c: p.featured ? '#ffff55' : undefined })
        }
        out('', { t: 'OPEN <id> to view one (yellow = featured).', c: '#808080' })
        break
      }
      case 'tree': {
        out('C:\\PROJECTS')
        categories.forEach((c, ci) => {
          const last = ci === categories.length - 1
          out(`${last ? '└' : '├'}───${c.name}`)
          projectsIn(c.id).forEach((p, pi, arr) => out(`${last ? ' ' : '│'}   ${pi === arr.length - 1 ? '└' : '├'}───${p.file}`))
        })
        break
      }
      case 'neofetch': case 'winver': case 'sysinfo': {
        const logo = [
          ' ,----------------, ', ' |  .----------.  | ', ' |  |  NEHAD   |  | ', ' |  |   98 SE  |  | ',
          " |  '----------'  | ", ' |      ____    o | ', " '----------------' ", '     /________\\     ',
        ].map((l) => l.padEnd(22))
        const info: [string, string][] = [
          [`${profile.handle}@nehad98`, ''], ['---------------', ''], ['OS', 'Nehad 98 SE (4.10.2026)'], ['Host', profile.name],
          ['Role', profile.role], ['Location', profile.location], ['Shell', 'COMMAND.COM'], ['Projects', `${projects.length} (${projects.filter((p) => p.featured).length} featured)`],
          ['Langs', `${profile.stack.Languages.slice(0, 4).join(', ')} +${profile.stack.Languages.length - 4}`], ['Status', profile.openToWork ? 'OPEN TO WORK' : 'busy'], ['Uptime', 'since the first cup of coffee'],
        ]
        const colors = ['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff']
        logo.forEach((l, i) => out({ t: <><span style={{ color: colors[i % 6] }}>{l}</span>  {info[i] && <><span style={{ color: '#55ffff' }}>{info[i][0]}</span>{info[i][1] && `: ${info[i][1]}`}</>}</> }))
        info.slice(logo.length).forEach(([k, v]) => out({ t: <>{' '.repeat(24)}<span style={{ color: '#55ffff' }}>{k}</span>: {v}</> }))
        out({ t: <>{' '.repeat(24)}{dosColors.slice(8).map((c) => <span key={c} style={{ background: c }}>{'   '}</span>)}</> })
        break
      }
      case 'whoami': case 'about':
        out({ t: `${profile.name} (@${profile.handle})`, c: '#ffff55' }, `${profile.role}, ${profile.location}.`, profile.statement, ...(profile.openToWork ? [{ t: profile.availability, c: '#55ff55' }] : []), '', 'TYPE "C:\\My Documents\\About Me.txt" for more, or just run HIRE.')
        break
      case 'hire':
        out({ t: '>> THE PITCH', c: '#55ff55' }, 'I build dependable systems end to end: multi-tenant backends, real-time', 'dashboards, retrieval + LLM pipelines, and the occasional language model', 'in assembly to see how it really works. Arabic RTL is a first-class citizen.', '', ...(profile.openToWork ? [{ t: `>> ${profile.availability}`, c: '#ffff55' }] : []), { t: `>> ${profile.email}`, c: '#55ffff' }, { t: `>> ${profile.linkedin}`, c: '#55ffff' }, { t: `>> ${profile.github}`, c: '#55ffff' })
        break
      case 'github': out('Opening GitHub...'); window.open(profile.github, '_blank', 'noopener'); break
      case 'linkedin': out('Opening LinkedIn...'); window.open(profile.linkedin, '_blank', 'noopener'); break
      case 'contact': case 'mail': out('Starting Outlook Express...'); leaveDos(() => wm.open('mail')); break
      case 'ver': out('', 'Nehad 98 [Version 4.10.2026]', ''); break
      case 'date': out(`Current date is ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })}`); break
      case 'time': out(`Current time is ${new Date().toLocaleTimeString('en-US', { timeZone: profile.timeZone })} (Cairo)`); break
      case 'echo': out(arg || 'ECHO is on'); break
      case 'mem': out('', 'Memory Type        Total  =   Used  +   Free', '----------------  -------   -------   -------', 'Conventional         640K      ∞ ideas    0K', 'Coffee               100%       77%      23%', '', 'Largest executable program size   xray (17 packages)'); break
      case 'history': hist.slice().reverse().forEach((h, i) => out(`${String(i + 1).padStart(3)}  ${h}`)); break
      case 'color': {
        const m = arg.match(/^([0-9a-f])([0-9a-f])$/i)
        if (!m) { setFg('#c0c0c0'); setBg('#000'); break }
        if (m[1].toLowerCase() === m[2].toLowerCase()) { out('Background and foreground cannot match.'); break }
        setBg(dosColors[parseInt(m[1], 16)]); setFg(dosColors[parseInt(m[2], 16)])
        break
      }
      case 'ping': {
        const host = arg || 'github.com'
        setBusy(true)
        out(`Pinging ${host} with 32 bytes of data:`)
        let n = 0
        const t = setInterval(() => {
          out(`Reply from ${host}: bytes=32 time=${Math.floor(Math.random() * 40 + 8)}ms TTL=54`)
          if (++n === 4) { clearInterval(t); out('', `Ping statistics for ${host}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`); setBusy(false) }
        }, 450)
        break
      }
      case 'potato': out({ t: potato, c: '#ffff55' }, { t: 'Type POTATOLM to chat with the real thing.', c: '#808080' }); break
      case 'potatolm': case 'potato.exe': case 'chat':
        out('Loading POTATO.EXE into the x86-64 emulator...'); leaveDos(() => wm.open('potato')); break
      case 'music': case 'play': case 'playlist':
        out('Starting Media Player...'); leaveDos(() => wm.open('mediaplayer')); break
      case 'cv': case 'resume':
        out('Opening My CV.pdf...'); leaveDos(() => wm.open('pdf')); break
      case 'blog': case 'news':
        out('Starting Outlook Express...'); leaveDos(() => wm.open('outlook')); break
      case 'xray':
        out('Opening the live xray gallery...'); leaveDos(() => wm.open('browser', { url: 'https://orgalorg7.github.io/xray-codebase/' })); break
      case 'astra': case 'astra.com': case 'tetris':
        out('Loading ASTRA.COM into the x86-64 emulator...'); leaveDos(() => wm.open('astra')); break
      case 'matrix': setMatrix(true); setTimeout(() => setMatrix(false), 6000); break
      case 'sudo':
        if (/make\s+(me\s+a\s+)?coffee/i.test(arg)) { sfx.hdd(); out('[sudo] password for nehad: ********', { t: 'coffee is ready ☕', c: '#55ff55' }) }
        else if (/make/i.test(arg)) out('make: *** No rule to make target. Try: sudo make coffee')
        else out('nehad is not in the sudoers file. This incident will be reported. (to the Recycle Bin)')
        break
      case 'make': out(/coffee/i.test(arg) ? 'make: coffee: Permission denied. (Did you forget sudo?)' : "make: *** No targets specified and no makefile found.  Stop."); break
      case 'rm': case 'del': case 'deltree':
        out(/-rf|\/s/i.test(arg) ? 'Nice try. These projects are load-bearing.' : 'Access denied - this portfolio is read-only.'); break
      case 'format': {
        if (!/^c:?$/i.test(arg.trim())) { out('Required parameter missing'); break }
        setBusy(true)
        out('', 'WARNING, ALL DATA ON NON-REMOVABLE DISK', 'DRIVE C: WILL BE LOST!', 'Proceed with Format (Y/N)? Y', '')
        let pct = 0
        const t = setInterval(() => {
          pct += 17
          setLines((p) => [...p.slice(0, -1), { t: `${Math.min(pct, 100)} percent completed.` }])
          if (pct >= 100) { clearInterval(t); setBusy(false); sys.setPhase('bsod') }
        }, 300)
        out('0 percent completed.')
        break
      }
      case 'exit': case 'win':
        if (full) sys.setPhase('desktop'); else win?.close()
        break
      case 'hello': case 'hi': out('Hello! 👋 Type HELP to see what I can do.'); break
      case 'ls -la': break
      default:
        if (findProject(cmd)) { out(`Opening ${findProject(cmd)!.name}...`); leaveDos(() => wm.open('browser', { url: `nehad://projects/${findProject(cmd)!.id}` })); break }
        out('Bad command or file name')
    }
  }

  // Optional command to run on open (used by the staged link-preview scene).
  const ranStartup = useRef(false)
  useEffect(() => {
    if (!args?.run || ranStartup.current) return
    ranStartup.current = true
    exec(args.run)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const complete = () => {
    const parts = input.split(' ')
    const last = parts[parts.length - 1].toLowerCase()
    const pool = parts.length === 1 ? COMMANDS : [...(resolvePath(cwd)?.children?.map((c) => c.name) ?? []), ...projects.map((p) => p.id)]
    const hit = pool.find((x) => x.toLowerCase().startsWith(last) && x.toLowerCase() !== last)
    if (hit) { parts[parts.length - 1] = hit.includes(' ') ? `"${hit}"` : hit; setInput(parts.join(' ')) }
  }

  return (
    <div className={`terminal ${full ? 'full crt' : ''}`} style={{ color: fg, background: bg }} onClick={() => inputRef.current?.focus()}>
      {!full && (
        <div className="toolbar term-toolbar">
          <select defaultValue="auto" aria-label="Font size"><option value="auto">Auto</option><option>8 x 12</option><option>10 x 18</option></select>
          <button className="tool-btn" title="Mark" onClick={() => setLines([])}>⌫ Clear</button>
          <button className="tool-btn" title="Full screen" onClick={() => win && wm.toggleMax(win.win.id)}>⛶</button>
          <button className="tool-btn" title="Help" onClick={() => exec('help')}>?</button>
        </div>
      )}
      <div className="term-screen" ref={scrollRef}>
        {lines.map((l, i) => <div key={i} className="term-line" style={l.c ? { color: l.c } : undefined}>{l.t || '\u00a0'}</div>)}
        {!busy && (
          <div className="term-line term-input">
            <span>{prompt}</span>
            <input ref={inputRef} value={input} spellCheck={false} autoComplete="off" autoCapitalize="off" aria-label="Command"
              style={{ color: fg }}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { exec(input); setInput('') }
                else if (e.key === 'Tab') { e.preventDefault(); complete() }
                else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hist.length - 1, hi + 1); if (hist[n]) { setHi(n); setInput(hist[n]) } }
                else if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(Math.max(-1, n)); setInput(n >= 0 ? hist[n] : '') }
                else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]) }
              }} />
          </div>
        )}
      </div>
      {matrix && <MatrixRain />}
    </div>
  )
}

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!
    c.width = c.clientWidth; c.height = c.clientHeight
    const cols = Math.floor(c.width / 14), drops = Array(cols).fill(0).map(() => Math.random() * -40)
    const chars = 'NEHAD98アカサタナハマヤラワ0123456789<>/{}=+*'
    const t = setInterval(() => {
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, c.width, c.height)
      g.font = '14px monospace'
      drops.forEach((y, i) => {
        g.fillStyle = Math.random() > .95 ? '#cfc' : '#0f0'
        g.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14)
        drops[i] = y * 14 > c.height && Math.random() > .97 ? 0 : y + 1
      })
    }, 45)
    return () => clearInterval(t)
  }, [])
  return <canvas ref={ref} className="matrix" />
}
