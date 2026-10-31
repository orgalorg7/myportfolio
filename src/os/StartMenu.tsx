import { useEffect, useRef, useState, type RefObject } from 'react'
import { aboutTxt, profile } from '../data/profile'
import { categories, projectsIn } from '../data/projects'
import { Glyph } from './glyphs'
import { Icon, type IconName } from './icons'
import { useSystem } from './system'
import { useOpenFavorite } from './actions'
import { Accel, MenuList, type MenuItem } from './ui'
import { useWM } from './wm'

type Entry = { label: string; icon: IconName; onClick?: () => void; items?: MenuItem[] } | { sep: true }

export function StartMenu({ onClose, anchor }: { onClose: () => void; anchor: RefObject<HTMLButtonElement | null> }) {
  const wm = useWM()
  const sys = useSystem()
  const openFav = useOpenFavorite()
  const [sub, setSub] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current?.contains(e.target as Node) || anchor.current?.contains(e.target as Node)) return
      onClose()
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', key) }
  }, [onClose, anchor])

  const projectsMenu: MenuItem[] = categories.map((c) => ({
    label: c.name, icon: 'folder' as IconName,
    items: projectsIn(c.id).map((p) => ({ label: p.name, icon: p.icon, onClick: () => wm.open('browser', { url: `nehad://projects/${p.id}` }) })),
  }))

  const entries: Entry[] = [
    { label: 'GitHub &Update', icon: 'network', onClick: () => window.open(profile.github, '_blank', 'noopener') },
    { sep: true },
    {
      label: '&Programs', icon: 'folder', items: [
        {
          label: 'Accessories', icon: 'folder', items: [
            { label: 'Games', icon: 'folder', items: [{ label: 'ASTRA (real x86-64 binary)', icon: 'blocks', onClick: () => wm.open('astra') }, { label: 'Bug Hunt', icon: 'bug', onClick: () => wm.open('bughunt') }] },
            { label: 'System Tools', icon: 'folder', items: [{ label: 'Disk Defragmenter', icon: 'defrag', onClick: () => wm.open('defrag') }, { label: 'System Information', icon: 'computer', onClick: () => wm.open('system') }] },
            { label: 'CD Player', icon: 'cd', onClick: () => wm.open('cdplayer') },
            { label: 'Media Player (my playlist)', icon: 'music', onClick: () => wm.open('mediaplayer') },
            { label: 'Notepad', icon: 'notepad', onClick: () => wm.open('notepad') },
            { label: 'Paint', icon: 'paint', onClick: () => wm.open('paint') },
          ],
        },
        { label: 'My Projects', icon: 'folder', items: projectsMenu },
        { label: 'Internet Explorer', icon: 'browser', onClick: () => wm.open('browser', { url: 'nehad://home' }) },
        { label: 'MS-DOS Prompt', icon: 'dos', onClick: () => wm.open('terminal') },
        { label: 'PotatoLM (chat with my AI)', icon: 'potato', onClick: () => wm.open('potato') },
        { label: 'xray Live Demo', icon: 'map', onClick: () => wm.open('browser', { url: 'https://orgalorg7.github.io/xray-codebase/' }) },
        { label: 'Outlook Express (my blog)', icon: 'mail', onClick: () => wm.open('outlook') },
        { label: 'Windows Explorer', icon: 'folderOpen', onClick: () => wm.open('explorer', { path: 'My Computer' }) },
      ],
    },
    {
      label: 'F&avorites', icon: 'star', items: [
        { label: "Nehad's Playlist", icon: 'cd', onClick: () => wm.open('mediaplayer') },
        ...profile.favorites.map((f) => ({ label: `${f.title} — ${f.by}`, icon: 'music' as IconName, onClick: () => openFav(f) })),
        { sep: true },
        { label: 'GitHub', icon: 'network', onClick: () => window.open(profile.github, '_blank', 'noopener') },
        { label: 'LinkedIn', icon: 'network', onClick: () => window.open(profile.linkedin, '_blank', 'noopener') },
      ],
    },
    {
      label: '&Documents', icon: 'documents', items: [
        { label: 'My Documents', icon: 'documents', onClick: () => wm.open('explorer', { path: 'My Documents' }) },
        { sep: true },
        { label: 'About Me.txt', icon: 'txt', onClick: () => wm.open('notepad', { title: 'About Me.txt', content: aboutTxt }) },
        { label: 'My CV.pdf', icon: 'txt', onClick: () => wm.open('pdf') },
        { label: 'Resume.html', icon: 'html', onClick: () => wm.open('browser', { url: 'nehad://resume' }) },
        { label: 'Guestbook.html', icon: 'html', onClick: () => wm.open('browser', { url: 'nehad://guestbook' }) },
      ],
    },
    {
      label: '&Settings', icon: 'control', items: [
        { label: '&Control Panel', icon: 'control', onClick: () => wm.open('explorer', { path: 'Control Panel' }) },
        { label: '&Display', icon: 'display', onClick: () => wm.open('display') },
        { label: '&Taskbar & Start Menu...', icon: 'computer', onClick: () => wm.alert({ title: 'Taskbar Properties', icon: 'info', message: 'The taskbar is perfect the way it is.' }) },
      ],
    },
    { label: '&Find', icon: 'find', items: [{ label: '&Files or Folders...', icon: 'find', onClick: () => wm.open('find') }, { label: 'On the &Internet...', icon: 'browser', onClick: () => window.open(`${profile.github}?tab=repositories`, '_blank', 'noopener') }] },
    { label: '&Help', icon: 'help', onClick: () => wm.open('welcome') },
    { label: '&Run...', icon: 'run', onClick: () => wm.open('run') },
    { sep: true },
    { label: `&Log Off ${profile.name.split(' ')[1]}...`, icon: 'key', onClick: () => { wm.closeAll(); try { sessionStorage.removeItem('n98.booted') } catch { /* ignore */ } sys.setPhase('splash') } },
    { label: 'Sh&ut Down...', icon: 'shutdown', onClick: () => wm.open('shutdown') },
  ]

  return (
    <div className="start-menu window" ref={ref} onContextMenu={(e) => e.preventDefault()}>
      <div className="start-banner"><span><b>Nehad</b>98</span></div>
      <ul className="start-items">
        {entries.map((en, i) =>
          'sep' in en ? <li key={i} className="menu-sep" /> : (
            <li key={i} className={`start-item ${sub === i ? 'open' : ''}`}
              onPointerEnter={() => setSub(en.items ? i : null)}
              onClick={() => { if (en.items) { setSub(i); return } onClose(); en.onClick?.() }}>
              <Icon name={en.icon} size={24} />
              <span className="start-label"><Accel text={en.label} /></span>
              {en.items && <span className="menu-arrow"><Glyph name="arrow" /></span>}
              {en.items && sub === i && <MenuList items={en.items} onDone={onClose} className="submenu" />}
            </li>
          ))}
      </ul>
    </div>
  )
}
