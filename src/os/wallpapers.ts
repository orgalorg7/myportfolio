import type { CSSProperties } from 'react'

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`

export const wallpapers: { id: string; name: string; style: CSSProperties }[] = [
  { id: 'none', name: '(None)', style: {} },
  {
    id: 'clouds', name: 'Clouds', style: {
      backgroundColor: '#3a78d8',
      backgroundImage: [
        'radial-gradient(ellipse 18% 9% at 18% 22%, #fff 0%, #fff8 45%, transparent 70%)',
        'radial-gradient(ellipse 12% 7% at 26% 26%, #fff 0%, #fff6 50%, transparent 72%)',
        'radial-gradient(ellipse 22% 10% at 70% 18%, #fff 0%, #fff7 45%, transparent 70%)',
        'radial-gradient(ellipse 14% 7% at 78% 24%, #fffe 0%, #fff5 50%, transparent 72%)',
        'radial-gradient(ellipse 25% 11% at 40% 62%, #fff 0%, #fff6 45%, transparent 70%)',
        'radial-gradient(ellipse 15% 8% at 52% 66%, #fffd 0%, #fff4 50%, transparent 72%)',
        'radial-gradient(ellipse 20% 9% at 88% 72%, #fff 0%, #fff6 45%, transparent 70%)',
        'linear-gradient(#2a5fc8, #6aa4ee 70%, #9cc8f6)',
      ].join(','),
    },
  },
  {
    id: 'circuit', name: 'Circuit Board', style: {
      backgroundColor: '#004040',
      backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' shape-rendering='crispEdges'><g stroke='#0a7a6a' stroke-width='2' fill='none'><path d='M0 16h20v20h24V8h20M32 64V44h-12M44 36h20M8 64V48'/></g><g fill='#30c0a0'><rect x='18' y='14' width='4' height='4'/><rect x='42' y='34' width='4' height='4'/><rect x='30' y='42' width='4' height='4'/><rect x='6' y='46' width='4' height='4'/></g></svg>`),
    },
  },
  {
    id: 'bricks', name: 'Red Blocks', style: {
      backgroundColor: '#800000',
      backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='16' shape-rendering='crispEdges'><rect width='32' height='16' fill='#a02020'/><path d='M0 0h32M0 8h32M8 0v8M24 8v8' stroke='#600000' stroke-width='2'/><path d='M1 1h6M17 9h6' stroke='#c04040'/></svg>`),
    },
  },
  {
    id: 'tiles', name: 'Nehad Tiles', style: {
      backgroundColor: '#008080',
      backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' shape-rendering='crispEdges'><g transform='translate(16 16)'><path d='M8 0l8 8-8 8-8-8z' fill='#006060'/><path d='M8 3l2 2-2 3-2-3z' fill='#00a0a0'/><path d='M13 8l-2 2-3-2 3-2z' fill='#00a0a0'/><path d='M8 13l-2-2 2-3 2 3z' fill='#00a0a0'/><path d='M3 8l2-2 3 2-3 2z' fill='#00a0a0'/></g></svg>`),
    },
  },
  {
    id: 'setup', name: 'Setup Blue', style: { backgroundColor: '#0000a8', backgroundImage: 'linear-gradient(180deg, #000060 0%, #0000c8 100%)' },
  },
  {
    id: 'night', name: 'Starry Night', style: {
      backgroundColor: '#05051a',
      backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' shape-rendering='crispEdges'><g fill='#fff'><rect x='10' y='14' width='1' height='1'/><rect x='52' y='40' width='2' height='2'/><rect x='90' y='8' width='1' height='1'/><rect x='30' y='80' width='1' height='1'/><rect x='75' y='95' width='1' height='1'/><rect x='110' y='60' width='2' height='2' fill='#ffd'/><rect x='6' y='110' width='1' height='1'/></g></svg>`) + ', radial-gradient(ellipse at 70% 120%, #203060, transparent 60%)',
    },
  },
]

export function wallpaperStyle(id: string): CSSProperties {
  return wallpapers.find((w) => w.id === id)?.style ?? {}
}

// Colour schemes map to CSS variables (see os.css).
export const schemes = [
  { id: 'standard', name: 'Windows Standard' },
  { id: 'eggplant', name: 'Eggplant' },
  { id: 'marine', name: 'Marine (high color)' },
  { id: 'desert', name: 'Desert' },
  { id: 'rainy', name: 'Rainy Day' },
  { id: 'contrast', name: 'High Contrast Black' },
]
