import { useEffect, useMemo, useState } from 'react'
import { childPath, favoriteAction, parentPath, resolvePath, type FsNode } from '../data/fs'
import { profile } from '../data/profile'
import { projectById } from '../data/projects'
import { useRunAction } from '../os/actions'
import { Icon } from '../os/icons'
import { sfx } from '../os/sound'
import { openedByTap, recentTouch } from '../os/touch'
import { ContextMenu, MenuBar, type MenuItem } from '../os/ui'
import { useWin, useWM } from '../os/wm'
import { NavIcon } from './navicons'

type View = 'large' | 'small' | 'list' | 'details'

export function Explorer({ args }: { args?: { path?: string } }) {
  const wm = useWM()
  const { setTitle, setIcon, close } = useWin()
  const run = useRunAction()
  const [hist, setHist] = useState<{ stack: string[]; i: number }>({ stack: [args?.path ?? 'My Computer'], i: 0 })
  const path = hist.stack[hist.i]
  const node = useMemo(() => resolvePath(path), [path])
  const [sel, setSel] = useState<string | null>(null)
  const [view, setView] = useState<View>('large')
  const [web, setWeb] = useState(true)
  const [addr, setAddr] = useState(path)
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)

  useEffect(() => {
    setAddr(path)
    setSel(null)
    if (node) { setTitle(node.name); setIcon(node.icon === 'folder' ? 'folderOpen' : node.icon) }
  }, [path, node, setTitle, setIcon])

  const go = (p: string) => {
    if (!resolvePath(p)) {
      wm.alert({ title: 'Address', icon: 'error', message: `The folder '${p}' does not exist.` })
      setAddr(path)
      return
    }
    setHist((h) => ({ stack: [...h.stack.slice(0, h.i + 1), p], i: h.i + 1 }))
  }
  const back = () => setHist((h) => ({ ...h, i: Math.max(0, h.i - 1) }))
  const fwd = () => setHist((h) => ({ ...h, i: Math.min(h.stack.length - 1, h.i + 1) }))
  const up = () => { const p = parentPath(path); if (p) go(p) }

  // Reopening an existing window with a different path navigates it.
  useEffect(() => { if (args?.path && args.path !== path) go(args.path) }, [args?.path]) // eslint-disable-line react-hooks/exhaustive-deps

  const items = node?.children ?? []
  const selected = items.find((c) => c.name === sel) ?? null

  const openItem = (c: FsNode) => {
    sfx.click()
    if (c.children) go(childPath(path, c))
    else run(c.action, c, childPath(path, c))
  }

  const props = (c: FsNode) => {
    if (c.projectId) wm.open('properties', { projectId: c.projectId })
    else wm.alert({ title: `${c.name} Properties`, icon: 'info', message: `${c.name}\n\nType: ${c.type}\n${c.size ? `Size: ${c.size}\n` : ''}${c.description ?? ''}` })
  }

  const itemMenu = (c: FsNode, x: number, y: number) => {
    setSel(c.name)
    setMenu({
      x, y, items: [
        { label: '&Open', bold: true, onClick: () => openItem(c) },
        ...(c.projectId ? [{ label: 'Open in &New Window', onClick: () => run(c.action, c) }] : []),
        { sep: true },
        { label: 'Se&nd To', items: [{ label: '3½ Floppy (A)', icon: 'drive', onClick: () => wm.alert({ title: 'Floppy', icon: 'error', message: 'A:\\ is not accessible.\n\nThe device is not ready. (Nobody has a floppy drive anymore.)' }) }, { label: 'Mail Recipient', icon: 'mail', onClick: () => wm.open('mail', { subject: `About ${c.name}` }) }] },
        { sep: true },
        { label: '&Delete', onClick: () => wm.alert({ title: 'Confirm File Delete', icon: 'warning', message: `Are you sure you want to send '${c.name}' to the Recycle Bin?`, buttons: [{ label: 'Yes', onClick: () => wm.alert({ title: 'Access Denied', icon: 'error', message: 'Nice try. These projects are load-bearing.' }) }, { label: 'No', default: true }] }) },
        { sep: true },
        { label: 'P&roperties', onClick: () => props(c) },
      ],
    })
  }

  const totalSize = items.reduce((n, c) => n + (parseInt(c.size ?? '0') || 0), 0)
  const isPC = path === 'My Computer'
  const project = selected?.projectId ? projectById(selected.projectId) : null

  const menus = [
    { label: '&File', items: [
      { label: '&Open', disabled: !selected, onClick: () => selected && openItem(selected) },
      { label: 'P&roperties', disabled: !selected, onClick: () => selected && props(selected) },
      { sep: true as const },
      { label: '&Close', onClick: close },
    ] },
    { label: '&Edit', items: [{ label: 'Select &All', shortcut: 'Ctrl+A', disabled: true }, { label: '&Invert Selection', disabled: true }] },
    { label: '&View', items: [
      { label: 'as &Web Page', checked: web, onClick: () => setWeb((w) => !w) },
      { sep: true as const },
      { label: 'Lar&ge Icons', radio: true, checked: view === 'large', onClick: () => setView('large') },
      { label: 'S&mall Icons', radio: true, checked: view === 'small', onClick: () => setView('small') },
      { label: '&List', radio: true, checked: view === 'list', onClick: () => setView('list') },
      { label: '&Details', radio: true, checked: view === 'details', onClick: () => setView('details') },
    ] },
    { label: '&Go', items: [
      { label: '&Back', disabled: hist.i === 0, onClick: back },
      { label: '&Forward', disabled: hist.i >= hist.stack.length - 1, onClick: fwd },
      { label: '&Up One Level', disabled: !parentPath(path), onClick: up },
      { sep: true as const },
      { label: '&My Computer', onClick: () => go('My Computer') },
      { label: 'My &Projects', onClick: () => go('C:\\Projects') },
      { label: 'My &Documents', onClick: () => go('My Documents') },
    ] },
    { label: 'F&avorites', items: profile.favorites.map((f) => ({ label: f.title, icon: 'music' as const, onClick: () => run(favoriteAction(f)) })) },
    { label: '&Help', items: [{ label: '&About Nehad 98', onClick: () => wm.open('system') }] },
  ]

  return (
    <div className="explorer">
      <MenuBar menus={menus} />
      <div className="toolbar">
        <button className="tool-btn big" disabled={hist.i === 0} onClick={back}><NavIcon kind="back" /><span>Back</span></button>
        <button className="tool-btn big" disabled={hist.i >= hist.stack.length - 1} onClick={fwd}><NavIcon kind="fwd" /><span>Forward</span></button>
        <button className="tool-btn big" disabled={!parentPath(path)} onClick={up}><NavIcon kind="up" /><span>Up</span></button>
        <span className="tb-divider" />
        <button className="tool-btn big hide-sm" disabled><NavIcon kind="cut" /><span>Cut</span></button>
        <button className="tool-btn big hide-sm" disabled><NavIcon kind="copy" /><span>Copy</span></button>
        <span className="tb-divider hide-sm" />
        <button className="tool-btn big" disabled={!selected} onClick={() => selected && props(selected)}><NavIcon kind="props" /><span>Properties</span></button>
        <button className="tool-btn big" onClick={() => setView((v) => (v === 'large' ? 'details' : v === 'details' ? 'list' : 'large'))}><NavIcon kind="views" /><span>Views</span></button>
      </div>
      <div className="addressbar">
        <span className="addr-label">A<u>d</u>dress</span>
        <div className="addr-field">
          {node && <Icon name={node.icon} size={16} />}
          <input value={addr} onChange={(e) => setAddr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go(addr.trim())} aria-label="Address" spellCheck={false} />
        </div>
      </div>
      <div className="explorer-main sunken">
        {web && (
          <aside className="webview">
            {node && <Icon name={node.icon === 'folder' ? 'folderOpen' : node.icon} size={32} className="wv-icon" />}
            <h2>{node?.name}</h2>
            <div className="wv-rule" />
            {selected ? (
              project ? (
                <div className="wv-sel">
                  <b>{project.name}</b>
                  <p>{project.tagline}</p>
                  {project.shots?.[0] && <img src={project.shots[0]} alt="" className="wv-thumb" />}
                  <p className="wv-meta">{project.role} · {project.year} · {project.status}</p>
                  <p className="wv-meta">{project.stack.slice(0, 5).join(', ')}</p>
                  <a href="#" onClick={(e) => { e.preventDefault(); openItem(selected) }}>Open project page ▸</a>
                </div>
              ) : (
                <div className="wv-sel">
                  <b>{selected.name}</b>
                  <p>{selected.type}</p>
                  {selected.description && <p>{selected.description}</p>}
                  {selected.size && <p>Size: {selected.size}</p>}
                </div>
              )
            ) : (
              <p>{node?.description ?? 'Select an item to view its description.'}</p>
            )}
            {isPC && !selected && <p className="wv-hint">Tip: double-click <b>(C:)</b>, then <b>Projects</b>.</p>}
          </aside>
        )}
        <div className={`file-view view-${view}`} onPointerDown={(e) => { if (e.target === e.currentTarget) setSel(null) }}
          onContextMenu={(e) => { e.preventDefault(); if (e.target === e.currentTarget) setMenu({ x: e.clientX, y: e.clientY, items: [{ label: '&View', items: [{ label: 'Lar&ge Icons', onClick: () => setView('large') }, { label: '&Details', onClick: () => setView('details') }] }, { label: 'R&efresh', onClick: () => sfx.click() }, { sep: true }, { label: 'P&roperties', onClick: () => node && wm.alert({ title: node.name, icon: 'info', message: `${node.name}\n${items.length} object(s)` }) }] }) }}>
          {view === 'details' ? (
            <table className="details">
              <thead><tr><th>Name</th><th>Size</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.name} className={sel === c.name ? 'sel' : ''} onClick={() => setSel(c.name)} onDoubleClick={() => { if (!recentTouch()) openItem(c) }} onPointerUp={(e) => { if (e.pointerType === 'touch') { openedByTap(); openItem(c) } }}
                    onContextMenu={(e) => { e.preventDefault(); itemMenu(c, e.clientX, e.clientY) }}>
                    <td><Icon name={c.icon} size={16} /> {c.name}</td><td>{c.size ?? ''}</td><td>{c.type}</td><td>{c.description ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : items.map((c) => (
            <div key={c.name} className={`file-item ${sel === c.name ? 'selected' : ''}`} tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setSel(c.name) }}
              onDoubleClick={() => { if (!recentTouch()) openItem(c) }}
              onPointerUp={(e) => { if (e.pointerType === 'touch') { openedByTap(); openItem(c) } }}
              onKeyDown={(e) => e.key === 'Enter' && openItem(c)}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); itemMenu(c, e.clientX, e.clientY) }}>
              <Icon name={c.icon} size={view === 'large' ? 32 : 16} shortcut={c.kind === 'link' && view === 'large'} />
              <span>{c.name}</span>
            </div>
          ))}
          {items.length === 0 && <p className="empty">This folder is empty.</p>}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{selected ? (selected.description ?? selected.type) : `${items.length} object(s)`}</p>
        <p className="status-bar-field sb-narrow">{totalSize ? `${totalSize} KB` : ''}</p>
        <p className="status-bar-field sb-narrow"><Icon name="computer" size={16} /> My Computer</p>
      </div>
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  )
}
