import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { MenuBar } from '../os/ui'
import { useWin, useWM } from '../os/wm'

type Tool = 'pencil' | 'brush' | 'eraser' | 'fill' | 'line' | 'rect' | 'ellipse' | 'spray' | 'picker'
const W = 640, H = 420
const palette = ['#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040']

const toolIcons: Record<Tool, React.ReactNode> = {
  pencil: <path d="M3 13l8-8 2 2-8 8H3z M11 5l1-1 2 2-1 1" fill="#ff0" stroke="#000" />,
  brush: <><path d="M10 2l4 4-5 5-4-4z" fill="#a52" stroke="#000" /><path d="M5 7l4 4-3 3c-2 1-4 0-4-2z" fill="#000" /></>,
  eraser: <path d="M2 10l6-6 6 6-4 4H6z" fill="#ffc0e0" stroke="#000" />,
  fill: <><path d="M3 8l5-5 5 5-5 5z" fill="#fff" stroke="#000" /><path d="M13 9c1 2 2 3 1 4s-2 0-1-4z" fill="#00f" /></>,
  line: <path d="M2 14L14 2" stroke="#000" strokeWidth="1.5" />,
  rect: <rect x="2.5" y="4.5" width="11" height="8" fill="none" stroke="#000" />,
  ellipse: <ellipse cx="8" cy="8" rx="6" ry="4.5" fill="none" stroke="#000" />,
  spray: <><path d="M6 6h5v8H6z" fill="#888" stroke="#000" /><path d="M7 4h3v2H7z" fill="#000" />{[[2, 2], [4, 1], [3, 4], [1, 5]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" />)}</>,
  picker: <path d="M3 13l7-7 2 2-7 7H3zM10 4l2-2 2 2-2 2z" fill="#fff" stroke="#000" />,
}

export function Paint() {
  const wm = useWM()
  const { close } = useWin()
  const canvas = useRef<HTMLCanvasElement>(null)
  const overlay = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pencil')
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [size, setSize] = useState(2)
  const [pos, setPos] = useState<string>('')
  const undo = useRef<ImageData[]>([])
  const drawing = useRef<{ x: number; y: number; color: string; lx: number; ly: number } | null>(null)

  useEffect(() => {
    const g = canvas.current!.getContext('2d', { willReadFrequently: true })!
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H)
    // A friendly starting doodle.
    g.font = 'bold 28px "Comic Sans MS", "Comic Neue", cursive'
    g.fillStyle = '#000080'; g.fillText('Draw something!', 200, 200)
    g.font = '14px "Comic Sans MS", cursive'; g.fillStyle = '#808080'; g.fillText('(File > Save As... downloads a PNG)', 210, 228)
  }, [])

  const ctx = () => canvas.current!.getContext('2d', { willReadFrequently: true })!
  const pt = (e: RPE) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: Math.round((e.clientX - r.left) * (W / r.width)), y: Math.round((e.clientY - r.top) * (H / r.height)) }
  }
  const snapshot = () => { undo.current.push(ctx().getImageData(0, 0, W, H)); if (undo.current.length > 25) undo.current.shift() }
  const doUndo = () => { const s = undo.current.pop(); if (s) ctx().putImageData(s, 0, 0) }

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && document.activeElement?.closest('.paint')) { e.preventDefault(); doUndo() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const stroke = (x0: number, y0: number, x1: number, y1: number, color: string, w: number) => {
    const g = ctx()
    g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'
    g.beginPath(); g.moveTo(x0 + .5, y0 + .5); g.lineTo(x1 + .5, y1 + .5); g.stroke()
  }

  const flood = (x: number, y: number, hex: string) => {
    const g = ctx()
    const img = g.getImageData(0, 0, W, H), d = img.data
    const i0 = (y * W + x) * 4
    const target = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]]
    const c = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255]
    if (target.every((v, k) => v === c[k])) return
    const same = (i: number) => Math.abs(d[i] - target[0]) < 8 && Math.abs(d[i + 1] - target[1]) < 8 && Math.abs(d[i + 2] - target[2]) < 8 && Math.abs(d[i + 3] - target[3]) < 8
    const stack = [[x, y]]
    while (stack.length) {
      const [px, py] = stack.pop()!
      let lx = px
      while (lx >= 0 && same((py * W + lx) * 4)) lx--
      let up = false, down = false
      for (let cx = lx + 1; cx < W && same((py * W + cx) * 4); cx++) {
        const i = (py * W + cx) * 4
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255
        if (py > 0) { const u = same(((py - 1) * W + cx) * 4); if (u && !up) stack.push([cx, py - 1]); up = u }
        if (py < H - 1) { const dn = same(((py + 1) * W + cx) * 4); if (dn && !down) stack.push([cx, py + 1]); down = dn }
      }
    }
    g.putImageData(img, 0, 0)
  }

  const shape = (g: CanvasRenderingContext2D, t: Tool, x0: number, y0: number, x1: number, y1: number, color: string) => {
    g.strokeStyle = color; g.lineWidth = size; g.beginPath()
    if (t === 'line') { g.moveTo(x0, y0); g.lineTo(x1, y1) }
    if (t === 'rect') g.rect(Math.min(x0, x1) + .5, Math.min(y0, y1) + .5, Math.abs(x1 - x0), Math.abs(y1 - y0))
    if (t === 'ellipse') g.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2)
    g.stroke()
  }

  const down = (e: RPE<HTMLCanvasElement>) => {
    e.preventDefault()
    const { x, y } = pt(e)
    const color = e.button === 2 ? bg : fg
    if (tool === 'picker') {
      const [r, g, b] = ctx().getImageData(x, y, 1, 1).data
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
      if (e.button === 2) setBg(hex); else setFg(hex)
      setTool('pencil'); return
    }
    snapshot()
    if (tool === 'fill') { flood(x, y, color); return }
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = { x, y, color, lx: x, ly: y }
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') stroke(x, y, x, y, tool === 'eraser' ? bg : color, tool === 'pencil' ? 1 : tool === 'brush' ? size * 2 : size * 4)
  }
  const move = (e: RPE<HTMLCanvasElement>) => {
    const { x, y } = pt(e)
    setPos(`${x},${y}`)
    const d = drawing.current
    if (!d) return
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      stroke(d.lx, d.ly, x, y, tool === 'eraser' ? bg : d.color, tool === 'pencil' ? 1 : tool === 'brush' ? size * 2 : size * 4)
      d.lx = x; d.ly = y
    } else if (tool === 'spray') {
      const g = ctx(); g.fillStyle = d.color
      for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * size * 5; g.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1, 1) }
    } else {
      const o = overlay.current!.getContext('2d')!
      o.clearRect(0, 0, W, H)
      shape(o, tool, d.x, d.y, x, y, d.color)
    }
  }
  const up = (e: RPE<HTMLCanvasElement>) => {
    const d = drawing.current
    drawing.current = null
    if (!d) return
    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      const { x, y } = pt(e)
      overlay.current!.getContext('2d')!.clearRect(0, 0, W, H)
      shape(ctx(), tool, d.x, d.y, x, y, d.color)
    }
  }

  const save = () => {
    canvas.current!.toBlob((b) => {
      if (!b) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(b); a.download = 'untitled.png'; a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    })
  }
  const clear = () => { snapshot(); const g = ctx(); g.fillStyle = bg; g.fillRect(0, 0, W, H) }

  return (
    <div className="paint" tabIndex={-1}>
      <MenuBar menus={[
        { label: '&File', items: [{ label: '&New', onClick: () => { snapshot(); const g = ctx(); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H) } }, { label: 'Save &As...', onClick: save }, { sep: true }, { label: 'E&xit', onClick: close }] },
        { label: '&Edit', items: [{ label: '&Undo', shortcut: 'Ctrl+Z', onClick: doUndo }] },
        { label: '&Image', items: [{ label: '&Clear Image', onClick: clear }, { label: '&Invert Colors', onClick: () => { snapshot(); const g = ctx(); const im = g.getImageData(0, 0, W, H); for (let i = 0; i < im.data.length; i += 4) { im.data[i] = 255 - im.data[i]; im.data[i + 1] = 255 - im.data[i + 1]; im.data[i + 2] = 255 - im.data[i + 2] } g.putImageData(im, 0, 0) } }] },
        { label: '&Help', items: [{ label: '&About Paint', onClick: () => wm.alert({ title: 'About Paint', icon: 'info', message: 'Paint for Nehad 98\n\nLeft-click uses the foreground colour, right-click the background colour.' }) }] },
      ]} />
      <div className="paint-main">
        <div className="paint-tools">
          <div className="tool-grid">
            {(Object.keys(toolIcons) as Tool[]).map((t) => (
              <button key={t} className={`ptool ${tool === t ? 'on' : ''}`} title={t[0].toUpperCase() + t.slice(1)} onClick={() => setTool(t)}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">{toolIcons[t]}</svg>
              </button>
            ))}
          </div>
          <div className="sizes sunken">
            {[1, 2, 4, 6].map((s) => <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(s)} aria-label={`Size ${s}`}><span style={{ height: s }} /></button>)}
          </div>
        </div>
        <div className="paint-canvas-wrap sunken">
          <div className="paint-stack">
            <canvas ref={canvas} width={W} height={H} className="paint-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onContextMenu={(e) => e.preventDefault()} onPointerLeave={() => setPos('')} />
            <canvas ref={overlay} width={W} height={H} className="paint-overlay" />
          </div>
        </div>
      </div>
      <div className="paint-palette">
        <div className="pal-current sunken"><span className="pal-bg" style={{ background: bg }} /><span className="pal-fg" style={{ background: fg }} /></div>
        <div className="pal-grid">
          {palette.map((c) => <button key={c} style={{ background: c }} aria-label={c} onClick={() => setFg(c)} onContextMenu={(e) => { e.preventDefault(); setBg(c) }} />)}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">For Help, click Help Topics on the Help Menu.</p>
        <p className="status-bar-field sb-narrow">{pos}</p>
      </div>
    </div>
  )
}
