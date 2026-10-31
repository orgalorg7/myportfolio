// 20x20 toolbar glyphs for Explorer and Internet Explorer.
const paths: Record<string, React.ReactNode> = {
  back: <path d="M2 10l7-7v4h9v6H9v4z" fill="#3a9a3a" stroke="#000" />,
  fwd: <path d="M18 10l-7-7v4H2v6h9v4z" fill="#3a9a3a" stroke="#000" />,
  up: <><path d="M2.5 6.5h6l1 1.5h8v9.5h-15z" fill="#ffff80" stroke="#000" /><path d="M10 9l3.5 3.5h-2V16h-3v-3.5h-2z" fill="#000" /></>,
  cut: <><circle cx="6" cy="15" r="2.5" fill="none" stroke="#000" strokeWidth="1.5" /><circle cx="14" cy="15" r="2.5" fill="none" stroke="#000" strokeWidth="1.5" /><path d="M7 13l7-10M13 13L6 3" stroke="#000" strokeWidth="1.5" /></>,
  copy: <><path d="M3.5 2.5h8v11h-8z" fill="#fff" stroke="#000" /><path d="M8.5 6.5h8v11h-8z" fill="#fff" stroke="#000" /></>,
  props: <><path d="M3.5 3.5h13v14h-13z" fill="#fff" stroke="#000" /><path d="M3.5 3.5h13v3h-13z" fill="#000080" /><path d="M6 9h8M6 12h8M6 15h5" stroke="#808080" /></>,
  views: <><path d="M2.5 3.5h6v6h-6zM11.5 3.5h6v6h-6zM2.5 11.5h6v6h-6zM11.5 11.5h6v6h-6z" fill="#ffff80" stroke="#000" /></>,
  stop: <><path d="M6.5 2.5h7l4 4v7l-4 4h-7l-4-4v-7z" fill="#e02020" stroke="#000" /><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="2" /></>,
  refresh: <><path d="M15 6a6 6 0 1 0 1.5 5" fill="none" stroke="#2a8a2a" strokeWidth="2.5" /><path d="M12 2l5 4-6 2z" fill="#2a8a2a" /></>,
  home: <><path d="M10 2.5L2.5 9.5h2v8h11v-8h2z" fill="#fff" stroke="#000" /><path d="M8.5 12.5h3v5h-3z" fill="#800000" /><path d="M10 2.5L2.5 9.5M10 2.5l7.5 7" stroke="#c00000" strokeWidth="1.5" /></>,
  search: <><circle cx="8" cy="8" r="5" fill="#c0f0ff" stroke="#000" strokeWidth="1.5" /><path d="M12 12l6 6" stroke="#000" strokeWidth="2.5" /></>,
  fav: <path d="M10 2l2.4 5.3 5.6.6-4.2 3.8 1.2 5.6-5-2.9-5 2.9 1.2-5.6L2 7.9l5.6-.6z" fill="#ffd800" stroke="#000" />,
  mail: <><path d="M2.5 5.5h15v10h-15z" fill="#fff" stroke="#000" /><path d="M2.5 5.5L10 11l7.5-5.5" fill="none" stroke="#000" /></>,
  print: <><path d="M5.5 2.5h9v5h-9z" fill="#fff" stroke="#000" /><path d="M2.5 7.5h15v7h-15z" fill="#c0c0c0" stroke="#000" /><path d="M5.5 12.5h9v5h-9z" fill="#fff" stroke="#000" /></>,
  history: <><circle cx="10" cy="10" r="7.5" fill="#fff" stroke="#000" /><path d="M10 5v5l3 3" stroke="#000" strokeWidth="1.5" fill="none" /></>,
}

export function NavIcon({ kind }: { kind: keyof typeof paths | string }) {
  return <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">{paths[kind]}</svg>
}
