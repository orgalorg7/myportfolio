import { profile } from '../data/profile'
import { Icon } from '../os/icons'
import { MenuBar } from '../os/ui'
import { useWin } from '../os/wm'

type Args = { src?: string; name?: string } | undefined

// Phones usually can't show a PDF inside a page, so offer buttons instead.
const inlinePdf = typeof navigator !== 'undefined' && (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled !== false && !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)

export function PdfViewer({ args }: { args: Args }) {
  const { close } = useWin()
  const src = args?.src ?? profile.cv
  const name = args?.name ?? 'Mohammad-Nehad-Moghrabi-CV.pdf'
  return (
    <div className="pdfviewer">
      <MenuBar menus={[
        { label: '&File', items: [{ label: '&Download', onClick: () => { const a = document.createElement('a'); a.href = src; a.download = name; a.click() } }, { label: 'Open in New &Tab', onClick: () => window.open(src, '_blank', 'noopener') }, { sep: true }, { label: 'E&xit', onClick: close }] },
      ]} />
      <div className="toolbar">
        <a className="tool-btn big" href={src} download={name}><Icon name="drive" size={20} /><span>Download</span></a>
        <a className="tool-btn big" href={src} target="_blank" rel="noreferrer"><Icon name="browser" size={20} /><span>New Tab</span></a>
        <a className="tool-btn big" href={`mailto:${profile.email}?subject=${encodeURIComponent('About your CV')}`}><Icon name="mail" size={20} /><span>Email Me</span></a>
      </div>
      <div className="pdf-area sunken">
        {inlinePdf
          ? <iframe className="pdf-frame" src={`${src}#view=FitH`} title={name} />
          : (
            <div className="pdf-fallback">
              <Icon name="txt" size={32} />
              <p><b>{name}</b></p>
              <p>2 pages · A4 · 54 KB</p>
              <p className="pdf-btns">
                <a className="pdf-btn" href={src} target="_blank" rel="noreferrer">Open CV</a>
                <a className="pdf-btn" href={src} download={name}>Download</a>
              </p>
            </div>
          )}
      </div>
      <div className="status-bar"><p className="status-bar-field">{name}</p><p className="status-bar-field sb-narrow">2 pages</p></div>
    </div>
  )
}
