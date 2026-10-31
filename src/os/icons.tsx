import type { ReactNode } from 'react'

// Hand-drawn 32x32 pixel-style icons in the classic 16-colour palette.
const K = '#000000', W = '#ffffff', G = '#c0c0c0', D = '#808080', N = '#000080',
  T = '#008080', Y = '#ffff00', O = '#808000', B = '#0000ff', R = '#ff0000',
  M = '#800000', E = '#008000', L = '#00ff00', C = '#00ffff', P = '#800080', F = '#ff00ff'

const s = { stroke: K, strokeWidth: 1 }

const folderShape = (front: string, back: string) => (
  <>
    <path d="M2.5 7.5h10l2 2h15v19h-27z" fill={back} {...s} />
    <path d="M2.5 12.5h27v16h-27z" fill={front} {...s} />
    <path d="M3 13h26v1H3z" fill={W} opacity=".7" />
  </>
)

const page = (fill = W) => (
  <>
    <path d="M6.5 2.5h14l6 6v21h-20z" fill={fill} {...s} />
    <path d="M20.5 2.5v6h6" fill={G} {...s} />
  </>
)

const shortcutArrow = (
  <g>
    <rect x="0.5" y="21.5" width="10" height="10" fill={W} {...s} />
    <path d="M3 29v-3c0-2 1-3 3-3h1v-2l3 3-3 3v-2H6c-1 0-1 1-1 2v2z" fill={K} />
  </g>
)

const icons: Record<string, ReactNode> = {
  computer: (
    <>
      <rect x="5.5" y="2.5" width="21" height="17" fill={G} {...s} />
      <path d="M6 3h20v1H6zM6 3h1v16H6z" fill={W} />
      <rect x="8.5" y="5.5" width="15" height="11" fill={T} {...s} />
      <path d="M10 7h5v1h-5zM10 8h2v2h-2z" fill={C} />
      <rect x="11" y="20" width="10" height="2" fill={D} />
      <rect x="2.5" y="22.5" width="27" height="7" fill={G} {...s} />
      <path d="M3 23h26v1H3z" fill={W} />
      {[5, 9, 13, 17, 21, 25].map((x) => <rect key={x} x={x} y="25" width="2" height="1" fill={D} />)}
      {[7, 11, 15, 19, 23].map((x) => <rect key={x} x={x} y="27" width="2" height="1" fill={D} />)}
      <rect x="21" y="18" width="3" height="1" fill={L} />
    </>
  ),
  folder: folderShape('#ffff80', '#c0c040'),
  folderOpen: (
    <>
      <path d="M2.5 7.5h10l2 2h12v19h-24z" fill="#c0c040" {...s} />
      <path d="M6.5 13.5h25l-4 15h-25z" fill="#ffff80" {...s} />
    </>
  ),
  documents: (
    <>
      {folderShape('#ffff80', '#c0c040')}
      <path d="M9.5 4.5h12v12h-12z" fill={W} {...s} />
      <path d="M11 7h8v1h-8zM11 9h8v1h-8zM11 11h6v1h-6z" fill={B} />
      <path d="M2.5 14.5h27v14h-27z" fill="#ffff80" {...s} />
    </>
  ),
  recycle: (
    <>
      <path d="M6.5 7.5h19l-2 22h-15z" fill={G} {...s} />
      <path d="M5.5 5.5h21v3h-21z" fill={D} {...s} />
      {[10, 14, 18, 22].map((x) => <path key={x} d={`M${x} 9v19`} stroke={D} strokeWidth="1" />)}
      <path d="M8 13h16M8 18h16M9 23h14" stroke={D} />
      <path d="M13 15l3-3 3 3h-2v4h-2v-4z" fill={E} />
    </>
  ),
  recycleFull: (
    <>
      <path d="M6.5 9.5h19l-2 20h-15z" fill={G} {...s} />
      <path d="M8 3.5l6 2 4-3 6 3 1 4h-19z" fill={W} {...s} />
      <path d="M12 4l3 4M19 3l1 5" stroke={B} />
      <path d="M5.5 8.5h21v3h-21z" fill={D} {...s} />
      {[10, 14, 18, 22].map((x) => <path key={x} d={`M${x} 12v16`} stroke={D} />)}
      <path d="M13 17l3-3 3 3h-2v4h-2v-4z" fill={E} />
    </>
  ),
  notepad: (
    <>
      <path d="M6.5 4.5h19v25h-19z" fill={W} {...s} />
      <path d="M6.5 4.5h19v4h-19z" fill={B} {...s} />
      {[7, 11, 15, 19, 23].map((x) => <rect key={x} x={x} y="2" width="1" height="5" fill={D} />)}
      {[12, 15, 18, 21, 24].map((y) => <rect key={y} x="9" y={y} width="14" height="1" fill={D} />)}
    </>
  ),
  txt: (
    <>
      {page()}
      {[11, 14, 17, 20, 23, 26].map((y, i) => <rect key={y} x="9" y={y} width={i % 2 ? 12 : 15} height="1" fill={K} />)}
    </>
  ),
  dos: (
    <>
      <rect x="2.5" y="4.5" width="27" height="23" fill={G} {...s} />
      <rect x="3" y="5" width="26" height="4" fill={N} />
      <rect x="4.5" y="10.5" width="23" height="15" fill={K} {...s} />
      <path d="M6 13h2v1H6zM6 14h1v2H6zM6 16h2v1H6zM9 14h1v1H9zM9 16h1v1H9zM11 13h1v1h-1zM12 14h1v1h-1zM13 15h1v1h-1zM14 16h1v1h-1zM16 13h1v1h-1zM17 14h1v1h-1zM18 15h-1v1h-1v1h-1v-1h1v-1h1z" fill={W} />
      <rect x="20" y="16" width="3" height="1" fill={W} />
      <text x="16" y="23" fontSize="5" fill={G} textAnchor="middle" fontFamily="monospace">MS-DOS</text>
    </>
  ),
  browser: (
    <>
      <circle cx="16" cy="16" r="12.5" fill="#3a6ee8" {...s} />
      <path d="M9 8c3 0 4 2 3 4s-4 1-4 4 3 3 3 6-2 3-3 2c-2-2-3-5-3-8 0-3 2-6 4-8zM19 5c2 1 4 3 5 5-2 0-3 1-4 3s1 4 3 4 3 2 2 4c-1 2-3 4-5 5 0-3 1-5-1-6s-3-3-1-5 2-4 1-6z" fill={E} />
      <path d="M10 6c2-1 4-1 6-1" stroke={W} />
      <ellipse cx="16" cy="16" rx="15.5" ry="5" fill="none" stroke={Y} strokeWidth="2" transform="rotate(-25 16 16)" />
    </>
  ),
  paint: (
    <>
      <path d="M4.5 10.5c0-5 6-8 12-8s12 4 12 9-4 5-7 5-3 3-1 5-1 6-6 6c-6 0-10-6-10-11 0-3 0-4 0-6z" fill="#f0e0b0" {...s} />
      <circle cx="10" cy="11" r="2" fill={R} /><circle cx="15" cy="7" r="2" fill={B} />
      <circle cx="21" cy="8" r="2" fill={E} /><circle cx="9" cy="18" r="2" fill={Y} />
      <circle cx="14" cy="23" r="2" fill={F} />
      <path d="M30 4L19 20l-2 2 1-3L28 2z" fill={M} {...s} />
    </>
  ),
  cd: (
    <>
      <circle cx="16" cy="16" r="13.5" fill="#d8d8e8" {...s} />
      <path d="M16 3a13 13 0 0 1 12 8l-9 4z" fill="#a0e0ff" />
      <path d="M4 22a13 13 0 0 0 8 6l3-10z" fill="#ffc0f0" />
      <path d="M28 20a13 13 0 0 1-6 7l-4-9z" fill="#ffffa0" />
      <circle cx="16" cy="16" r="4.5" fill={G} {...s} />
      <circle cx="16" cy="16" r="1.5" fill={W} {...s} />
    </>
  ),
  music: (
    <>
      <path d="M12.5 5.5l14-3v20" fill="none" stroke={K} strokeWidth="2" />
      <path d="M12.5 5.5v19" stroke={K} strokeWidth="2" />
      <ellipse cx="9" cy="25" rx="4.5" ry="3.5" fill={B} {...s} />
      <ellipse cx="23" cy="23" rx="4.5" ry="3.5" fill={B} {...s} />
      <path d="M13 6l13-3v3l-13 3z" fill={K} />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="7.5" width="27" height="18" fill={W} {...s} />
      <path d="M2.5 7.5l13.5 10 13.5-10" fill="none" {...s} />
      <path d="M2.5 25.5l10-9M29.5 25.5l-10-9" {...s} />
      <rect x="23" y="9" width="5" height="6" fill={R} />
    </>
  ),
  control: (
    <>
      {folderShape('#ffff80', '#c0c040')}
      <rect x="6.5" y="15.5" width="19" height="10" fill={G} {...s} />
      <path d="M9 18h6v1H9zM9 22h4v1H9z" fill={K} />
      <rect x="17" y="17" width="2" height="3" fill={R} /><rect x="21" y="21" width="2" height="3" fill={B} />
      <path d="M17 18h6M17 22h6" stroke={D} />
    </>
  ),
  display: (
    <>
      <rect x="4.5" y="3.5" width="23" height="18" fill={G} {...s} />
      <rect x="7.5" y="6.5" width="17" height="12" fill={W} {...s} />
      <rect x="8" y="7" width="4" height="11" fill={R} /><rect x="12" y="7" width="4" height="11" fill={Y} />
      <rect x="16" y="7" width="4" height="11" fill={L} /><rect x="20" y="7" width="4" height="11" fill={B} />
      <rect x="12" y="22" width="8" height="3" fill={D} />
      <rect x="8.5" y="25.5" width="15" height="3" fill={G} {...s} />
    </>
  ),
  defrag: (
    <>
      <rect x="2.5" y="8.5" width="27" height="16" fill={G} {...s} />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={5 + (i % 6) * 4} y={11 + Math.floor(i / 6) * 4} width="3" height="3"
          fill={i < 8 ? B : i < 11 ? R : i % 3 ? W : C} stroke={K} strokeWidth=".5" />
      ))}
      <rect x="22" y="26" width="6" height="2" fill={L} />
    </>
  ),
  help: (
    <>
      <path d="M6.5 4.5h17l3 3v22h-20z" fill="#2050c0" {...s} />
      <path d="M8.5 6.5h14v21h-14z" fill="#3070f0" />
      <path d="M13 11c0-3 6-3 6 0 0 3-3 3-3 6M16 20v2" fill="none" stroke={Y} strokeWidth="2" />
    </>
  ),
  find: (
    <>
      {page()}
      <circle cx="14" cy="17" r="6.5" fill="#c0f0ff" stroke={K} strokeWidth="2" />
      <path d="M19 22l7 7" stroke={K} strokeWidth="3" />
    </>
  ),
  run: (
    <>
      <rect x="2.5" y="6.5" width="27" height="20" fill={G} {...s} />
      <rect x="3" y="7" width="26" height="4" fill={N} />
      <rect x="6.5" y="15.5" width="19" height="5" fill={W} {...s} />
      <path d="M20 13l6 5-6 5v-3h-3v-4h3z" fill={E} {...s} />
    </>
  ),
  shutdown: (
    <>
      <rect x="5.5" y="3.5" width="21" height="16" fill={G} {...s} />
      <rect x="8.5" y="6.5" width="15" height="10" fill={N} {...s} />
      <path d="M17 8a4 4 0 1 0 3 6 3 3 0 1 1-3-6z" fill={Y} />
      <rect x="11" y="20" width="10" height="2" fill={D} />
      <rect x="3.5" y="22.5" width="25" height="6" fill={G} {...s} />
      <circle cx="24" cy="25.5" r="1" fill={R} />
    </>
  ),
  exe: (
    <>
      <rect x="3.5" y="5.5" width="25" height="21" fill={W} {...s} />
      <rect x="4" y="6" width="24" height="4" fill={N} />
      <rect x="24" y="7" width="3" height="2" fill={G} />
      <rect x="6.5" y="12.5" width="8" height="11" fill={G} {...s} />
      <path d="M17 13h9v1h-9zM17 16h9v1h-9zM17 19h6v1h-6zM17 22h8v1h-8z" fill={D} />
    </>
  ),
  user: (
    <>
      <circle cx="16" cy="11" r="6.5" fill="#f0c090" {...s} />
      <path d="M9 9c0-5 4-6 7-6s7 2 7 6c-2-1-4-2-7-2s-5 1-7 2z" fill="#402010" />
      <path d="M4.5 29.5c0-7 5-10 11.5-10s11.5 3 11.5 10z" fill={N} {...s} />
      <path d="M14 20l2 4 2-4z" fill={W} />
    </>
  ),
  drive: (
    <>
      <path d="M3.5 12.5l4-5h17l4 5v10h-25z" fill={G} {...s} />
      <path d="M3.5 12.5h25" {...s} />
      <rect x="6" y="17" width="12" height="2" fill={D} />
      <rect x="23" y="17" width="3" height="2" fill={L} />
      <path d="M4 22h24v1H4z" fill={D} />
    </>
  ),
  cdrom: (
    <>
      <path d="M3.5 16.5l3-4h19l3 4v8h-25z" fill={G} {...s} />
      <rect x="6" y="20" width="14" height="2" fill={K} />
      <rect x="23" y="20" width="3" height="1" fill={L} />
      <ellipse cx="16" cy="9" rx="9.5" ry="5" fill="#d8d8e8" {...s} />
      <ellipse cx="16" cy="9" rx="2.5" ry="1.3" fill={W} {...s} />
      <path d="M18 5c3 0 6 1 7 3" stroke="#a0e0ff" strokeWidth="2" fill="none" />
    </>
  ),
  network: (
    <>
      <circle cx="16" cy="16" r="12.5" fill="#3a6ee8" {...s} />
      <path d="M3.5 16h25M16 3.5v25M6 9h20M6 23h20" stroke="#a0c8ff" fill="none" />
      <ellipse cx="16" cy="16" rx="6" ry="12.5" fill="none" stroke="#a0c8ff" />
    </>
  ),
  github: (
    <>
      <rect x="3.5" y="3.5" width="25" height="25" fill={K} {...s} />
      <path d="M9 22l-4-6 4-6M23 22l4-6-4-6" fill="none" stroke={L} strokeWidth="2" />
      <path d="M18 8l-4 16" stroke={W} strokeWidth="2" />
    </>
  ),
  warning: (
    <>
      <path d="M16 2.5l13.5 26h-27z" fill={Y} {...s} />
      <rect x="14.5" y="10" width="3" height="10" fill={K} />
      <rect x="14.5" y="22" width="3" height="3" fill={K} />
    </>
  ),
  info: (
    <>
      <circle cx="16" cy="15" r="12.5" fill={W} {...s} />
      <path d="M8 26l-3 5 8-4" fill={W} {...s} />
      <rect x="14.5" y="6" width="3" height="3" fill={B} />
      <path d="M13 12h4.5v9H19v2h-6v-2h1.5v-7H13z" fill={B} />
    </>
  ),
  error: (
    <>
      <circle cx="16" cy="16" r="13.5" fill={R} {...s} />
      <path d="M10 10l12 12M22 10L10 22" stroke={W} strokeWidth="3.5" />
    </>
  ),
  question: (
    <>
      <circle cx="16" cy="15" r="12.5" fill={W} {...s} />
      <path d="M8 26l-3 5 8-4" fill={W} {...s} />
      <path d="M12 11c0-4 8-4 8 0 0 3-4 3-4 6M16 19.5v2.5" fill="none" stroke={B} strokeWidth="3" />
    </>
  ),
  html: (
    <>
      {page()}
      <circle cx="16" cy="19" r="6.5" fill="#3a6ee8" {...s} />
      <path d="M13 15c2 0 2 2 1 3s-2 1-1 3M19 14c1 2 0 3-1 4s1 3 2 3" stroke={E} strokeWidth="2" fill="none" />
    </>
  ),
  image: (
    <>
      {page()}
      <rect x="9.5" y="12.5" width="13" height="13" fill={C} {...s} />
      <path d="M10 25l4-6 3 4 2-2 3 4z" fill={E} />
      <circle cx="19" cy="16" r="1.5" fill={Y} />
    </>
  ),
  star: (
    <>
      <path d="M16 2.5l4 9 9.5 1-7 6.5 2 9.5-8.5-5-8.5 5 2-9.5-7-6.5 9.5-1z" fill={Y} {...s} />
    </>
  ),
  book: (
    <>
      <path d="M3.5 6.5c4-2 9-2 12.5 1 3.5-3 8.5-3 12.5-1v20c-4-2-9-2-12.5 1-3.5-3-8.5-3-12.5-1z" fill={W} {...s} />
      <path d="M16 7.5v20" {...s} />
      <path d="M6 11h7M6 14h7M6 17h6M19 11h7M19 14h7M19 17h5" stroke={D} />
    </>
  ),
  // project icons
  chip: (
    <>
      <rect x="7.5" y="7.5" width="17" height="17" fill="#303030" {...s} />
      {[10, 14, 18, 22].map((v) => (
        <g key={v} fill={G}>
          <rect x={v - 1} y="3" width="2" height="4" /><rect x={v - 1} y="25" width="2" height="4" />
          <rect x="3" y={v - 1} width="4" height="2" /><rect x="25" y={v - 1} width="4" height="2" />
        </g>
      ))}
      <rect x="11" y="11" width="10" height="10" fill={E} />
      <text x="16" y="19" fontSize="7" fill={L} textAnchor="middle" fontFamily="monospace" fontWeight="bold">AI</text>
    </>
  ),
  potato: (
    <>
      <path d="M8 6.5c5-3 13-2 17 3s4 13-1 17-14 4-18-1-4-15 2-19z" fill="#c8964c" {...s} />
      <circle cx="12" cy="13" r="1.5" fill={K} /><circle cx="20" cy="13" r="1.5" fill={K} />
      <path d="M12 19c2 2 6 2 8 0" stroke={K} fill="none" />
      <circle cx="9" cy="22" r="1" fill="#8a5a2a" /><circle cx="23" cy="9" r="1" fill="#8a5a2a" />
    </>
  ),
  map: (
    <>
      <path d="M2.5 6.5l9-3 9 3 9-3v22l-9 3-9-3-9 3z" fill="#e8f0c0" {...s} />
      <path d="M11.5 3.5v22M20.5 6.5v22" {...s} />
      <path d="M5 20c4-1 6-6 10-6s5 4 9 3 3-6 3-6" stroke={R} strokeWidth="1.5" fill="none" strokeDasharray="2 1" />
      <circle cx="24" cy="10" r="2" fill={R} {...s} />
    </>
  ),
  blocks: (
    <>
      <rect x="4.5" y="16.5" width="6" height="6" fill={C} {...s} /><rect x="10.5" y="16.5" width="6" height="6" fill={C} {...s} />
      <rect x="10.5" y="10.5" width="6" height="6" fill={C} {...s} /><rect x="16.5" y="22.5" width="6" height="6" fill={R} {...s} />
      <rect x="22.5" y="22.5" width="6" height="6" fill={R} {...s} /><rect x="4.5" y="22.5" width="6" height="6" fill={Y} {...s} />
      <rect x="10.5" y="22.5" width="6" height="6" fill={Y} {...s} /><rect x="22.5" y="16.5" width="6" height="6" fill={R} {...s} />
      <rect x="16.5" y="3.5" width="6" height="6" fill={P} {...s} /><rect x="22.5" y="3.5" width="6" height="6" fill={P} {...s} />
    </>
  ),
  shield: (
    <>
      <path d="M16 2.5l12.5 4v8c0 8-5 13-12.5 16-7.5-3-12.5-8-12.5-16v-8z" fill={N} {...s} />
      <path d="M16 5l10 3v6c0 6-4 11-10 13z" fill="#3060d0" />
      <rect x="11.5" y="14.5" width="9" height="8" fill={Y} {...s} />
      <path d="M13.5 14.5v-3a2.5 2.5 0 0 1 5 0v3" fill="none" stroke={Y} strokeWidth="2" />
    </>
  ),
  cart: (
    <>
      <path d="M2 5h5l4 15h15l3-11H9" fill="none" stroke={K} strokeWidth="2" />
      <path d="M9.5 9.5h19l-3 10h-13z" fill="#ffc0e0" />
      <circle cx="13" cy="25" r="2.5" fill={D} {...s} /><circle cx="24" cy="25" r="2.5" fill={D} {...s} />
      <rect x="14" y="5" width="6" height="7" fill={R} {...s} />
    </>
  ),
  gold: (
    <>
      <path d="M3.5 22.5l4-8h9l4 8z" fill="#f0c020" {...s} />
      <path d="M11.5 22.5l4-8h9l4 8z" fill="#ffd840" {...s} />
      <path d="M7.5 14.5l4-8h9l4 8z" fill="#ffe060" {...s} />
      <path d="M10 9h5" stroke={W} strokeWidth="1.5" />
      <rect x="2" y="23" width="28" height="5" fill={O} />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="25" height="25" fill={W} {...s} />
      {[[5, 5], [20, 5], [5, 20]].map(([x, y]) => (
        <g key={`${x}${y}`}><rect x={x} y={y} width="7" height="7" fill={K} /><rect x={x + 1} y={y + 1} width="5" height="5" fill={W} /><rect x={x + 2} y={y + 2} width="3" height="3" fill={K} /></g>
      ))}
      {[[14, 6], [15, 9], [14, 14], [17, 15], [20, 14], [24, 16], [14, 19], [16, 22], [20, 20], [23, 23], [26, 20], [14, 25], [19, 25]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill={K} />
      ))}
    </>
  ),
  snow: (
    <>
      <rect x="4.5" y="4.5" width="23" height="23" fill="#d0f0ff" {...s} />
      <path d="M16 7v18M8 11.5l16 9M8 20.5l16-9" stroke={B} strokeWidth="2" />
      <path d="M14 8l2 2 2-2M14 24l2-2 2 2" stroke={B} fill="none" />
    </>
  ),
  scales: (
    <>
      <path d="M16 4v22M7 8h18" stroke={K} strokeWidth="2" />
      <path d="M3.5 17.5l3.5-9 3.5 9z" fill="none" {...s} /><path d="M21.5 17.5l3.5-9 3.5 9z" fill="none" {...s} />
      <path d="M2.5 17.5h9a4.5 3 0 0 1-9 0zM20.5 17.5h9a4.5 3 0 0 1-9 0z" fill={Y} {...s} />
      <rect x="10.5" y="25.5" width="11" height="3" fill={O} {...s} />
      <circle cx="16" cy="5" r="2" fill={Y} {...s} />
    </>
  ),
  chart: (
    <>
      <rect x="3.5" y="3.5" width="25" height="25" fill={W} {...s} />
      <rect x="7.5" y="16.5" width="4" height="9" fill={B} {...s} />
      <rect x="14.5" y="10.5" width="4" height="15" fill={R} {...s} />
      <rect x="21.5" y="6.5" width="4" height="19" fill={E} {...s} />
    </>
  ),
  gear: (
    <>
      <path d="M14 2.5h4l1 4 3 1.5 3.5-2 3 3-2 3.5 1.5 3 4 1v4l-4 1-1.5 3 2 3.5-3 3-3.5-2-3 1.5-1 4h-4l-1-4-3-1.5-3.5 2-3-3 2-3.5-1.5-3-4-1v-4l4-1 1.5-3-2-3.5 3-3 3.5 2 3-1.5z" fill={G} {...s} />
      <circle cx="16" cy="16" r="4.5" fill={W} {...s} />
    </>
  ),
  router: (
    <>
      <rect x="2.5" y="17.5" width="27" height="9" fill={G} {...s} />
      <path d="M3 18h26v1H3z" fill={W} />
      {[6, 10, 14].map((x) => <rect key={x} x={x} y="21" width="2" height="2" fill={L} />)}
      <rect x="19" y="21" width="8" height="3" fill={K} />
      <path d="M8 17V8M24 17V8" stroke={K} strokeWidth="2" />
      <path d="M12 9a6 6 0 0 1 8 0M10 6a9 9 0 0 1 12 0" stroke={B} strokeWidth="1.5" fill="none" />
    </>
  ),
  cube: (
    <>
      <path d="M16 2.5l12.5 7v13l-12.5 7-12.5-7v-13z" fill="#90b0ff" {...s} />
      <path d="M3.5 9.5l12.5 7 12.5-7M16 16.5v13" {...s} />
      <path d="M16 17l12-7v12l-12 7z" fill="#4060c0" />
      <path d="M16 17L4 10v12l12 7z" fill="#6080e0" />
    </>
  ),
  rocket: (
    <>
      <path d="M16 2.5c5 4 7 10 5 17h-10c-2-7 0-13 5-17z" fill={W} {...s} />
      <circle cx="16" cy="11" r="2.5" fill={C} {...s} />
      <path d="M11 15.5l-4 5v4l4-3zM21 15.5l4 5v4l-4-3z" fill={R} {...s} />
      <path d="M12.5 20.5h7l-1 3h-5z" fill={D} {...s} />
      <path d="M13 24l3 6 3-6z" fill={Y} />
    </>
  ),
  bug: (
    <>
      <path d="M8 12l-5-3M8 17H2M8 22l-5 4M24 12l5-3M24 17h6M24 22l5 4M13 6l-2-4M19 6l2-4" stroke={K} strokeWidth="1.5" />
      <ellipse cx="16" cy="18" rx="8.5" ry="10.5" fill={M} {...s} />
      <path d="M16 8v20" stroke={K} />
      <circle cx="16" cy="8" r="4.5" fill={K} />
      <circle cx="12" cy="16" r="1.5" fill={K} /><circle cx="20" cy="21" r="1.5" fill={K} /><circle cx="12" cy="23" r="1" fill={K} />
    </>
  ),
  coffee: (
    <>
      <path d="M5.5 12.5h17v9c0 4-3 7-8.5 7s-8.5-3-8.5-7z" fill={W} {...s} />
      <path d="M22.5 14.5h3a3 3 0 0 1 0 6h-3" fill="none" stroke={K} strokeWidth="2" />
      <path d="M6 13h16v2H6z" fill="#603010" />
      <path d="M10 10c-2-2 2-3 0-6M15 10c-2-2 2-3 0-6" stroke={D} fill="none" />
    </>
  ),
  village: (
    <>
      <path d="M2.5 16.5l7-7 7 7v12h-14z" fill="#f0e0c0" {...s} />
      <path d="M1.5 17.5l8-9 8 9" fill="none" stroke={M} strokeWidth="2" />
      <path d="M14.5 14.5l7-9 9 9v14h-16z" fill={W} {...s} />
      <rect x="18.5" y="17.5" width="4" height="4" fill={C} {...s} /><rect x="24.5" y="17.5" width="3" height="4" fill={C} {...s} />
      <rect x="7.5" y="21.5" width="4" height="7" fill={M} />
    </>
  ),
  megaphone: (
    <>
      <path d="M4.5 12.5h5l14-8v24l-14-8h-5z" fill={R} {...s} />
      <rect x="4.5" y="12.5" width="5" height="8" fill={G} {...s} />
      <path d="M8.5 20.5l2 8h4l-2-8" fill={D} {...s} />
      <path d="M26 12c2 2 2 6 0 8" stroke={K} strokeWidth="1.5" fill="none" />
    </>
  ),
  crm: (
    <>
      <rect x="3.5" y="5.5" width="25" height="22" fill={W} {...s} />
      <rect x="4" y="6" width="24" height="4" fill={T} />
      <circle cx="10" cy="16" r="3" fill="#f0c090" {...s} />
      <path d="M5 25c0-4 2-5 5-5s5 1 5 5" fill={N} />
      <path d="M17 14h9M17 17h9M17 20h6M17 23h8" stroke={D} />
    </>
  ),
  key: (
    <>
      <circle cx="10" cy="12" r="6.5" fill={Y} {...s} />
      <circle cx="9" cy="11" r="2" fill={W} {...s} />
      <path d="M14.5 15.5l13 13M22 23l3-3M25 26l2-2" stroke={K} strokeWidth="3" />
    </>
  ),
}

export type IconName = keyof typeof icons | string

export function Icon({ name, size = 32, shortcut = false, className }: { name: IconName; size?: number; shortcut?: boolean; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
      {icons[name] ?? icons.exe}
      {shortcut && shortcutArrow}
    </svg>
  )
}

// A smaller logo used on the Start button, boot splash and banner.
export function Logo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M8 0l8 8-8 8-8-8z" fill={K} />
      <path d="M8 1.5L14.5 8 8 14.5 1.5 8z" fill={W} />
      <path d="M8 2.5l2.75 2.75L8 8 5.25 5.25z" fill="#ff3020" />
      <path d="M13.5 8l-2.75 2.75L8 8l2.75-2.75z" fill="#20b020" />
      <path d="M8 13.5l-2.75-2.75L8 8l2.75 2.75z" fill="#ffc000" />
      <path d="M2.5 8l2.75-2.75L8 8l-2.75 2.75z" fill="#2050ff" />
    </svg>
  )
}
