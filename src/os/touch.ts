// Phones fire a synthetic dblclick after two quick taps. Because a tap already opens things,
// that dblclick would land on whatever just appeared under the finger, so we ignore it.
let lastTouch = -Infinity
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') lastTouch = performance.now() }, { capture: true, passive: true })
}
export const recentTouch = () => performance.now() - lastTouch < 800

// A tap that opens a window fires on finger-up; the browser then sends a "click" to whatever is
// under the finger by then, which is the new window. Call this when a tap opens something.
let swallowUntil = 0
if (typeof window !== 'undefined') {
  // The stray mousedown would also focus (and visibly press) a button in the new window.
  window.addEventListener('mousedown', (e) => { if (performance.now() < swallowUntil) { e.stopPropagation(); e.preventDefault() } }, { capture: true })
  window.addEventListener('click', (e) => {
    if (performance.now() < swallowUntil) { swallowUntil = 0; e.stopPropagation(); e.preventDefault() }
  }, { capture: true })
}
export const openedByTap = () => { swallowUntil = performance.now() + 500 }
