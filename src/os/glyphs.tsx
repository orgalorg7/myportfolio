// Drawn transport/menu symbols. Characters like ▶ and ◀ render as colour emoji on iPhones,
// so buttons use these instead. They take the text colour and scale with the font size.
const paths = {
  play: <path d="M4 2.5v11l9-5.5z" />,
  pause: <path d="M3.5 2.5h3.2v11H3.5zM9.3 2.5h3.2v11H9.3z" />,
  stop: <path d="M3 3h10v10H3z" />,
  prev: <path d="M2.5 2.5h2v11h-2zM14 2.5v11L8.5 8zM8.5 2.5v11L3 8z" transform="translate(0.5 0)" />,
  next: <path d="M11.5 2.5h2v11h-2zM2 2.5v11L7.5 8zM7.5 2.5v11L13 8z" transform="translate(-0.5 0)" />,
  rewind: <path d="M8 2.5v11L1.5 8zM14.5 2.5v11L8 8z" />,
  forward: <path d="M1.5 2.5v11L8 8zM8 2.5v11L14.5 8z" />,
  arrow: <path d="M5 3v10l5-5z" />,
  shuffle: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"><path d="M1.5 4.5h3l6 7h3M1.5 11.5h3l6-7h3" /><path d="M11.5 2.5l2 2-2 2M11.5 9.5l2 2-2 2" /></g>,
  repeat: <g fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9V6.5A2 2 0 0 1 5 4.5h7.5M13 7v2.5a2 2 0 0 1-2 2H3.5" /><path d="M10.5 2.5l2 2-2 2M5.5 9.5l-2 2 2 2" strokeLinecap="square" /></g>,
}
export type GlyphName = keyof typeof paths

export function Glyph({ name, size = '1em' }: { name: GlyphName; size?: string | number }) {
  return <svg className="glyph" viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">{paths[name]}</svg>
}
