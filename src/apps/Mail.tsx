import { useState } from 'react'
import { profile } from '../data/profile'
import { Icon } from '../os/icons'
import { MenuBar } from '../os/ui'
import { useWin, useWM } from '../os/wm'

export function Mail({ args }: { args?: { subject?: string } }) {
  const wm = useWM()
  const { close } = useWin()
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState(args?.subject ?? 'Hello from your portfolio!')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!body.trim()) { wm.alert({ title: 'Outlook Express', icon: 'warning', message: 'The message is empty. Write something first!' }); return }
    const text = `${body}\n\n— ${from || 'A visitor'}`
    if (profile.contactForm) {
      setSending(true)
      try {
        const res = await fetch(profile.contactForm, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name: from, email: /\S+@\S+\.\S+/.exec(from)?.[0] ?? '', _replyto: /\S+@\S+\.\S+/.exec(from)?.[0] ?? '', subject, message: body, _subject: `[Nehad 98] ${subject}` }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        close()
        wm.alert({ title: 'Outlook Express', icon: 'info', message: 'Message sent! 📨\n\nThanks for writing. I\'ll get back to you soon.' })
      } catch (err) {
        setSending(false)
        wm.alert({ title: 'Outlook Express', icon: 'error', message: `The message could not be sent (${String((err as Error).message ?? err)}).\n\nYou can reach me on LinkedIn instead.`, buttons: [{ label: 'Open LinkedIn', default: true, onClick: () => window.open(profile.linkedin, '_blank', 'noopener') }, { label: 'Cancel' }] })
      }
      return
    }
    if (profile.email) {
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
      close()
      return
    }
    try { await navigator.clipboard.writeText(`${subject}\n\n${text}`) } catch { /* clipboard unavailable */ }
    close()
    wm.alert({
      title: 'Outlook Express', icon: 'info',
      message: 'This 1998 mail server is a little too vintage to deliver real mail.\n\nYour message has been copied to the clipboard. Paste it into a LinkedIn message and I\'ll get back to you!',
      buttons: [{ label: 'Open LinkedIn', default: true, onClick: () => window.open(profile.linkedin, '_blank', 'noopener') }, { label: 'Open GitHub', onClick: () => window.open(profile.github, '_blank', 'noopener') }, { label: 'Cancel' }],
    })
  }

  return (
    <div className="mail">
      <MenuBar menus={[
        { label: '&File', items: [{ label: '&Send Message', onClick: send }, { sep: true }, { label: '&Close', onClick: close }] },
        { label: '&Edit', items: [{ label: 'Select &All', disabled: true }] },
        { label: '&Insert', items: [{ label: '&Signature', onClick: () => setBody((b) => `${b}\n\n--\nSent from Nehad 98`) }] },
        { label: '&Help', items: [{ label: '&About', onClick: () => wm.alert({ title: 'Outlook Express', icon: 'info', message: `Reach ${profile.name} on LinkedIn or GitHub.` }) }] },
      ]} />
      <div className="toolbar">
        <button className="tool-btn big" onClick={send} disabled={sending}><Icon name="mail" size={20} /><span>{sending ? 'Sending...' : 'Send'}</span></button>
        <span className="tb-divider" />
        <button className="tool-btn big" onClick={() => window.open(profile.linkedin, '_blank', 'noopener')}><Icon name="user" size={20} /><span>LinkedIn</span></button>
        <button className="tool-btn big" onClick={() => window.open(profile.github, '_blank', 'noopener')}><Icon name="github" size={20} /><span>GitHub</span></button>
      </div>
      <div className="mail-fields">
        <div className="field-row"><label>To:</label><input readOnly value={`${profile.name} <${profile.email || (profile.contactForm ? 'nehad98 inbox' : 'via LinkedIn')}>`} /></div>
        <div className="field-row"><label>From:</label><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Your name / email" /></div>
        <div className="field-row"><label>Subject:</label><input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      </div>
      <textarea className="mail-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi Nehad, I saw your portfolio and..." />
    </div>
  )
}
