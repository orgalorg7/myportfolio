// Phones fire a synthetic dblclick after two quick taps. Because a tap already opens things,
// that dblclick would land on whatever just appeared under the finger, so we ignore it.
let lastTouch = -Infinity
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') lastTouch = performance.now() }, { capture: true, passive: true })
}
export const recentTouch = () => performance.now() - lastTouch < 800
