import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { blogGroup, posts, welcomeMail } from '../data/blog'
import { profile } from '../data/profile'
import { Icon } from '../os/icons'
import { MenuBar } from '../os/ui'
import { useWin, useWM } from '../os/wm'

type Folder = 'inbox' | 'blog'
type Item = { id: string; subject: string; from: string; date: string; body: string }

const inbox: Item[] = [{ id: 'welcome', ...welcomeMail }]
const blog: Item[] = posts.map((p) => ({ id: p.id, subject: p.subject, from: profile.name, date: p.date, body: p.body }))

// Tiny renderer for the post format: paragraphs, "- " bullets, ``` fences and `inline code`.
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) => (part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>))
}
function render(body: string) {
  const blocks = body.split(/\n```\n?/)
  return blocks.map((block, i) => {
    if (i % 2 === 1) return <pre key={i} className="oe-code">{block.replace(/\n$/, '')}</pre>
    return block.split(/\n{2,}/).filter((b) => b.trim()).map((para, j) => {
      const lines = para.split('\n')
      if (lines.every((l) => l.startsWith('- '))) return <ul key={`${i}-${j}`}>{lines.map((l, k) => <li key={k}>{inline(l.slice(2))}</li>)}</ul>
      return <p key={`${i}-${j}`}>{lines.map((l, k) => <Fragment key={k}>{k > 0 && <br />}{inline(l)}</Fragment>)}</p>
    })
  })
}

export function Outlook({ args }: { args?: { post?: string } }) {
  const wm = useWM()
  const { close, setTitle } = useWin()
  const [folder, setFolder] = useState<Folder>('blog')
  const [read, setRead] = useState<Set<string>>(() => { try { return new Set(JSON.parse(localStorage.getItem('n98.read') ?? '[]')) } catch { return new Set() } })
  const items = folder === 'inbox' ? inbox : blog
  const [sel, setSel] = useState<string>(args?.post ?? blog[0].id)
  const current = items.find((m) => m.id === sel) ?? items[0]

  useEffect(() => { if (args?.post) { setFolder('blog'); setSel(args.post) } }, [args?.post])
  useEffect(() => { setTitle(folder === 'blog' ? `${blogGroup} - Outlook Express` : 'Inbox - Outlook Express') }, [folder, setTitle])
  useEffect(() => {
    if (!current || read.has(current.id)) return
    const n = new Set(read); n.add(current.id); setRead(n)
    try { localStorage.setItem('n98.read', JSON.stringify([...n])) } catch { /* ignore */ }
  }, [current, read])

  const unread = (list: Item[]) => list.filter((m) => !read.has(m.id)).length
  const open = (f: Folder) => { setFolder(f); setSel((f === 'inbox' ? inbox : blog)[0].id) }

  return (
    <div className="outlook">
      <MenuBar menus={[
        { label: '&File', items: [{ label: '&New Message', onClick: () => wm.open('mail') }, { sep: true }, { label: 'E&xit', onClick: close }] },
        { label: '&View', items: [{ label: '&Inbox', onClick: () => open('inbox') }, { label: `&${blogGroup}`, onClick: () => open('blog') }] },
        { label: '&Help', items: [{ label: '&About', onClick: () => wm.alert({ title: 'Outlook Express', icon: 'info', message: `This newsgroup is my blog: ${posts.length} posts about the things I build.\n\nNew Mail sends a message to me.` }) }] },
      ]} />
      <div className="toolbar">
        <button className="tool-btn big" onClick={() => wm.open('mail')}><Icon name="mail" size={20} /><span>New Mail</span></button>
        <button className="tool-btn big" onClick={() => wm.open('mail', { subject: `Re: ${current.subject}` })}><Icon name="mail" size={20} /><span>Reply</span></button>
        <span className="tb-divider" />
        <button className="tool-btn big hide-sm" onClick={() => window.print()}><Icon name="txt" size={20} /><span>Print</span></button>
        <button className="tool-btn big hide-sm" onClick={() => wm.open('find')}><Icon name="find" size={20} /><span>Find</span></button>
      </div>
      <div className="oe-main">
        <ul className="oe-folders sunken">
          <li className="oe-root"><Icon name="cd" size={16} /> Outlook Express</li>
          <li className={folder === 'inbox' ? 'on' : ''} onClick={() => open('inbox')}><Icon name="mail" size={16} /> Inbox {unread(inbox) > 0 && <b>({unread(inbox)})</b>}</li>
          <li className="oe-root"><Icon name="network" size={16} /> news.nehad98.net</li>
          <li className={folder === 'blog' ? 'on' : ''} onClick={() => open('blog')}><Icon name="book" size={16} /> {blogGroup} {unread(blog) > 0 && <b>({unread(blog)})</b>}</li>
        </ul>
        <div className="oe-right">
          <div className="oe-list sunken">
          <table className="details">
            <thead><tr><th>Subject</th><th className="hide-sm">From</th><th>Sent</th></tr></thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className={`${m.id === current.id ? 'sel' : ''} ${read.has(m.id) ? '' : 'unread'}`} onClick={() => setSel(m.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSel(m.id)}>
                  <td><Icon name={folder === 'blog' ? 'txt' : 'mail'} size={16} /> {m.subject}</td>
                  <td className="hide-sm">{m.from}</td>
                  <td>{m.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="oe-preview sunken">
            <div className="oe-head">
              <div><b>From:</b> {current.from}</div>
              <div><b>Subject:</b> {current.subject}</div>
              <div className="hide-sm"><b>Newsgroups:</b> {folder === 'blog' ? blogGroup : 'Inbox'} · <b>Date:</b> {current.date}</div>
            </div>
            <div className="oe-body">{render(current.body)}</div>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{items.length} message(s), {unread(items)} unread</p>
        <p className="status-bar-field sb-narrow"><Icon name="network" size={16} /> Working Online</p>
      </div>
    </div>
  )
}
