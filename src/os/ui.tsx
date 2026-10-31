import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from './icons'

/* "&File" -> F underlined, like a Win32 accelerator. */
export function Accel({ text }: { text: string }) {
  const i = text.indexOf('&')
  if (i === -1) return <>{text}</>
  return <>{text.slice(0, i)}<u>{text[i + 1]}</u>{text.slice(i + 2)}</>
}

export type MenuItem =
  | { sep: true }
  | { label: string; onClick?: () => void; disabled?: boolean; checked?: boolean; radio?: boolean; icon?: IconName; items?: MenuItem[]; bold?: boolean; shortcut?: string }

export function MenuList({ items, onDone, className = '' }: { items: MenuItem[]; onDone: () => void; className?: string }) {
  const [sub, setSub] = useState<number | null>(null)
  return (
    <ul className={`menu-list ${className}`} role="menu" onPointerDown={(e) => e.stopPropagation()}>
      {items.map((it, i) =>
        'sep' in it ? <li key={i} className="menu-sep" role="separator" /> : (
          <li key={i} role="menuitem" aria-disabled={it.disabled}
            className={`menu-item ${it.disabled ? 'disabled' : ''} ${sub === i ? 'open' : ''} ${it.bold ? 'bold' : ''}`}
            onPointerEnter={() => setSub(it.items ? i : null)}
            onClick={(e) => {
              e.stopPropagation()
              if (it.disabled) return
              if (it.items) { setSub(i); return }
              onDone(); it.onClick?.()
            }}>
            <span className="menu-check">{it.checked ? (it.radio ? '●' : '✓') : it.icon ? <Icon name={it.icon} size={16} /> : null}</span>
            <span className="menu-label"><Accel text={it.label} /></span>
            {it.shortcut && <span className="menu-shortcut">{it.shortcut}</span>}
            {it.items && <span className="menu-arrow">▶</span>}
            {it.items && sub === i && <MenuList items={it.items} onDone={onDone} className="submenu" />}
          </li>
        ))}
    </ul>
  )
}

export function MenuBar({ menus }: { menus: { label: string; items: MenuItem[] }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open === null) return
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(null) }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])
  return (
    <div className="menubar" ref={ref}>
      {menus.map((m, i) => (
        <div key={m.label} className={`menubar-item ${open === i ? 'open' : ''}`}
          onPointerDown={(e) => { e.stopPropagation(); setOpen(open === i ? null : i) }}
          onPointerEnter={() => open !== null && setOpen(i)}>
          <Accel text={m.label} />
          {open === i && <MenuList items={m.items} onDone={() => setOpen(null)} />}
        </div>
      ))}
    </div>
  )
}

export function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: MenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x, y })
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: Math.min(x, window.innerWidth - r.width - 2), y: Math.min(y, window.innerHeight - r.height - 2) })
  }, [x, y])
  useEffect(() => {
    const close = () => onClose()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', key)
    window.addEventListener('blur', close)
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', key); window.removeEventListener('blur', close) }
  }, [onClose])
  return (
    <div ref={ref} className="context-menu" style={{ left: pos.x, top: pos.y }} onContextMenu={(e) => e.preventDefault()}>
      <MenuList items={items} onDone={onClose} />
    </div>
  )
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>
}

export function ToolButton({ icon, label, onClick, disabled, title }: { icon?: IconName; label?: string; onClick?: () => void; disabled?: boolean; title?: string }) {
  return (
    <button className="tool-btn" onClick={onClick} disabled={disabled} title={title ?? label}>
      {icon && <Icon name={icon} size={20} />}
      {label && <span>{label}</span>}
    </button>
  )
}

export function Sunken({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`sunken ${className}`} {...rest}>{children}</div>
}
