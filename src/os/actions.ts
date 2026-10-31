import { useCallback } from 'react'
import { favoriteAction, type Action, type FsNode } from '../data/fs'
import type { Favorite } from '../data/profile'
import { useSystem } from './system'
import { useWM } from './wm'
import { sfx } from './sound'

/** Open a favourite: in the Media Player when it has an official embed, otherwise as a link. */
export function useOpenFavorite() {
  const run = useRunAction()
  return useCallback((f: Favorite) => run(favoriteAction(f)), [run])
}

export function useRunAction() {
  const wm = useWM()
  const sys = useSystem()

  return useCallback((a: Action | undefined, node?: FsNode, path?: string) => {
    if (!a) {
      if (node?.children && path) return wm.open('explorer', { path })
      if (node?.content !== undefined) return wm.open('notepad', { title: node.name, content: node.content })
      return
    }
    if ('url' in a) { window.open(a.url, '_blank', 'noopener'); return }
    if ('app' in a) { wm.open(a.app, a.args); return }
    switch (a.special) {
      case 'bsod': sys.setPhase('bsod'); break
      case 'shutdown': wm.open('shutdown'); break
      case 'bugs': wm.open('bughunt'); break
      case 'coffee':
        sfx.hdd()
        wm.alert({ title: 'COFFEE.EXE', icon: 'info', message: 'Brewing... ☕\n\nCoffee is ready. Productivity +40%.\nSleep schedule: still corrupted.' })
        break
    }
  }, [wm, sys])
}
