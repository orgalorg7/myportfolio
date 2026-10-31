import { createElement, lazy, Suspense } from 'react'
import { projectById } from '../data/projects'
import { appRegistry, type AppDef } from '../os/wm'
import { BugHunt } from './BugHunt'
import { Browser } from './Browser'
import { CDPlayer } from './CDPlayer'
import { Defrag } from './Defrag'
import { FindDialog, ImageView, MsgBox, ProjectProps, RunDialog, ShutdownDialog, SystemProps, Welcome } from './dialogs'
import { DisplayProps } from './Display'
import { Explorer } from './Explorer'
import { Mail } from './Mail'
import { Outlook } from './Outlook'
import { MediaPlayer } from './MediaPlayer'
import { Notepad } from './Notepad'
import { Paint } from './Paint'
import { PdfViewer } from './PdfViewer'
import { Terminal } from './Terminal'

// The emulator and terminal are big, so they only load when ASTRA is opened.
const AstraLazy = lazy(() => import('./Astra').then((m) => ({ default: m.Astra })))
const AstraApp = () => createElement(Suspense, { fallback: createElement('div', { className: 'astra-loading' }, 'Loading ASTRA.COM...') }, createElement(AstraLazy))
const PotatoLazy = lazy(() => import('./Potato').then((m) => ({ default: m.Potato })))
const PotatoApp = () => createElement(Suspense, { fallback: createElement('div', { className: 'astra-loading' }, 'Loading POTATO.EXE...') }, createElement(PotatoLazy))

const defs: Record<string, AppDef> = {
  potato: { title: 'POTATO.EXE - PotatoLM chat', icon: 'potato', component: PotatoApp, size: { w: 900, h: 620 }, bodyClass: 'flush' },
  astra: { title: 'ASTRA.COM', icon: 'blocks', component: AstraApp, size: { w: 940, h: 660 }, bodyClass: 'flush' },
  explorer: { title: 'My Computer', icon: 'computer', component: Explorer, size: { w: 760, h: 500 }, key: (a) => a?.path ?? 'My Computer', bodyClass: 'flush' },
  browser: { title: 'Internet Explorer', icon: 'browser', component: Browser, size: { w: 1000, h: 760 }, key: (a) => (a?._n ? String(a._n) : 'main'), bodyClass: 'flush' },
  notepad: { title: (a) => `${a?.title ?? 'Untitled'} - Notepad`, icon: 'notepad', component: Notepad, size: { w: 580, h: 440 }, key: (a) => a?.title ?? 'untitled', bodyClass: 'flush' },
  terminal: { title: 'MS-DOS Prompt', icon: 'dos', component: Terminal, size: { w: 680, h: 420 }, multi: true, bodyClass: 'flush' },
  paint: { title: 'untitled - Paint', icon: 'paint', component: Paint, size: { w: 780, h: 580 }, bodyClass: 'flush' },
  cdplayer: { title: 'CD Player', icon: 'cd', component: CDPlayer, size: { w: 360, h: 340 }, resizable: false, bodyClass: 'flush' },
  defrag: { title: 'Defragmenting Drive C', icon: 'defrag', component: Defrag, size: { w: 470, h: 430 }, resizable: false },
  bughunt: { title: 'Bug Hunt', icon: 'bug', component: BugHunt, size: { w: 330, h: 330 }, resizable: false },
  mediaplayer: { title: 'Media Player', icon: 'cd', component: MediaPlayer, size: { w: 820, h: 560 }, key: () => 'media', bodyClass: 'flush' },
  outlook: { title: 'Outlook Express', icon: 'mail', component: Outlook, size: { w: 900, h: 600 }, bodyClass: 'flush' },
  pdf: { title: (a) => `${a?.name ?? 'Mohammad-Nehad-Moghrabi-CV.pdf'} - PDF Viewer`, icon: 'txt', component: PdfViewer, size: { w: 760, h: 760 }, bodyClass: 'flush' },
  mail: { title: 'New Message', icon: 'mail', component: Mail, size: { w: 560, h: 440 }, bodyClass: 'flush' },
  display: { title: 'Display Properties', icon: 'display', component: DisplayProps, size: { w: 400, h: 470 }, dialog: true },
  system: { title: 'System Properties', icon: 'computer', component: SystemProps, size: { w: 400, h: 450 }, dialog: true },
  properties: { title: (a) => `${projectById(a.projectId)?.file ?? ''} Properties`, icon: 'exe', component: ProjectProps, size: { w: 380, h: 470 }, key: (a) => a.projectId, dialog: true },
  run: { title: 'Run', icon: 'run', component: RunDialog, size: { w: 380, h: 190 }, dialog: true },
  shutdown: { title: 'Shut Down Windows', icon: 'shutdown', component: ShutdownDialog, size: { w: 340, h: 230 }, dialog: true },
  find: { title: 'Find: All Files', icon: 'find', component: FindDialog, size: { w: 560, h: 420 }, bodyClass: 'flush' },
  welcome: { title: 'Welcome', icon: 'help', component: Welcome, size: { w: 600, h: 400 }, dialog: true, bodyClass: 'flush' },
  imageview: { title: (a) => `${a.name} - Imaging`, icon: 'image', component: ImageView, size: { w: 700, h: 500 }, key: (a) => a.src, bodyClass: 'flush' },
  msgbox: { title: (a) => a.title, icon: 'info', component: MsgBox, size: { w: 380, h: 170 }, multi: true, dialog: true },
}

Object.assign(appRegistry, defs)
