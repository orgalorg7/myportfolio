import { useEffect, useRef, useState } from 'react'
import { MenuBar } from '../os/ui'
import { useWin, useWM } from '../os/wm'

export function Notepad({ args }: { args?: { title?: string; content?: string } }) {
  const wm = useWM()
  const { setTitle, close } = useWin()
  const [text, setText] = useState(args?.content ?? '')
  const [wrap, setWrap] = useState(true)
  const [name, setName] = useState(args?.title ?? 'Untitled')
  const ta = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (args?.content !== undefined) { setText(args.content); setName(args.title ?? 'Untitled') } }, [args?.content, args?.title])
  useEffect(() => { setTitle(`${name} - Notepad`) }, [name, setTitle])

  const save = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = name.endsWith('.txt') ? name : `${name}.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const insertDate = () => {
    const el = ta.current!
    const stamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'numeric', day: 'numeric', year: 'numeric' })
    const s = el.selectionStart, e = el.selectionEnd
    setText(text.slice(0, s) + stamp + text.slice(e))
  }

  return (
    <div className="notepad">
      <MenuBar menus={[
        { label: '&File', items: [
          { label: '&New', onClick: () => { setText(''); setName('Untitled') } },
          { label: '&Save As...', onClick: save },
          { label: '&Print', onClick: () => window.print() },
          { sep: true },
          { label: 'E&xit', onClick: close },
        ] },
        { label: '&Edit', items: [
          { label: 'Select &All', onClick: () => ta.current?.select() },
          { label: 'Time/&Date', shortcut: 'F5', onClick: insertDate },
          { sep: true },
          { label: '&Word Wrap', checked: wrap, onClick: () => setWrap((w) => !w) },
        ] },
        { label: '&Search', items: [{ label: '&Find...', onClick: () => wm.open('find') }] },
        { label: '&Help', items: [{ label: '&About Notepad', onClick: () => wm.alert({ title: 'About Notepad', icon: 'info', message: 'Notepad\nNehad 98\n\nStill the best IDE for writing TODO lists you will ignore.' }) }] },
      ]} />
      <textarea ref={ta} className="notepad-text" value={text} spellCheck={false}
        style={{ whiteSpace: wrap ? 'pre-wrap' : 'pre', overflowX: wrap ? 'hidden' : 'auto' }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'F5') { e.preventDefault(); insertDate() } }} />
    </div>
  )
}
