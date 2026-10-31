import type { IconName } from '../os/icons'
import { categories, projectsIn, projects } from './projects'
import { aboutTxt, playlist, profile, type Favorite } from './profile'

export type Action =
  | { app: string; args?: Record<string, unknown> }
  | { url: string }
  | { special: 'bsod' | 'shutdown' | 'bugs' | 'coffee' }

export type FsNode = {
  name: string
  icon: IconName
  kind: 'folder' | 'drive' | 'file' | 'app' | 'project' | 'link'
  type: string
  description?: string
  size?: string
  children?: FsNode[]
  content?: string
  action?: Action
  projectId?: string
}

// Favourites with an official embeddable upload play in the Media Player; the rest are links.
export const favoriteAction = (f: Favorite): Action =>
  f.youtube ? { app: 'mediaplayer', args: { youtube: f.youtube } } : { url: f.url }

const playlistFiles: FsNode[] = [
  { name: "Nehad's Playlist.m3u", icon: 'cd', kind: 'link', type: 'Playlist', size: '1 KB', description: `${playlist.length} tracks: rock, hip hop, soul & funk, jazz and 70s Japanese jazz.`, action: { app: 'mediaplayer' } },
  ...playlist.map((t, i): FsNode => ({
    name: `${String(i + 1).padStart(2, '0')} ${t.artist} - ${t.title}.wma`, icon: 'music', kind: 'link', type: 'Media file (plays here)',
    description: `${t.title} by ${t.artist}, from ${t.album} (${t.year}).`, action: { app: 'mediaplayer', args: { youtube: t.youtube } },
  })),
]

const folder = (name: string, children: FsNode[], description?: string, icon: IconName = 'folder'): FsNode =>
  ({ name, icon, kind: 'folder', type: 'File Folder', children, description })

const app = (name: string, icon: IconName, appId: string, description: string, args?: Record<string, unknown>): FsNode =>
  ({ name, icon, kind: 'app', type: 'Application', description, action: { app: appId, args } })

const winIni = `[windows]
load=
run=coffee.exe
NullPort=None
device=Imagination,Laser,LPT1:

[Desktop]
Wallpaper=(None)
TileWallpaper=0
Hire=1

[boot]
shell=nehad.exe
sleep=optional
`

const autoexec = `@ECHO OFF
PROMPT $P$G
PATH C:\\WINDOWS;C:\\WINDOWS\\COMMAND;C:\\NEHAD\\BIN
SET BLASTER=A220 I5 D1 T4
SET CAFFEINE=MAX
LH C:\\WINDOWS\\COMMAND\\MSCDEX.EXE /D:NEHADCD
WIN
`

const projectsFolder = folder('Projects', categories.map((c) =>
  folder(c.name, projectsIn(c.id).map((p) => ({
    name: p.file,
    icon: p.icon,
    kind: 'project' as const,
    type: p.file.endsWith('.TXT') ? 'Text Document' : p.file.endsWith('.EXE') || p.file.endsWith('.COM') ? 'Application' : 'Project File',
    description: p.tagline,
    size: `${(p.description.length / 9).toFixed(0)} KB`,
    projectId: p.id,
    action: { app: 'browser', args: { url: `nehad://projects/${p.id}` } },
  })), c.blurb),
), `${projects.length} projects in ${categories.length} folders. Pick a folder, or open one to look inside.`)

export const recycleBin: FsNode[] = [
  { name: 'old_portfolio_final_FINAL_v3.zip', icon: 'exe', kind: 'file', type: 'Compressed Folder', size: '4,096 KB', description: 'Replaced by this one. It had a parallax hero section. We don\'t talk about it.', content: 'PK\u0003\u0004 ... (this archive is mostly regret)' },
  { name: 'jquery-1.2.6.min.js', icon: 'txt', kind: 'file', type: 'JScript File', size: '54 KB', description: 'Served faithfully. Rest in peace.', content: '/* jQuery 1.2.6 - thank you for your service */' },
  { name: 'sleep_schedule.dat', icon: 'txt', kind: 'file', type: 'DAT File', size: '0 KB', description: 'Corrupted beyond repair.', content: '' },
  { name: 'works_on_my_machine.txt', icon: 'txt', kind: 'file', type: 'Text Document', size: '1 KB', description: 'Moved to Docker.', content: 'It works on my machine.\n\n-- Fine. Then we ship your machine.\n\n(This is how Docker happened.)' },
  { name: 'TODO_fix_later.txt', icon: 'txt', kind: 'file', type: 'Text Document', size: '1 KB', description: 'Later never came.', content: 'TODO:\n - fix later\n - fix the fix\n - write tests (lol)\n\nUpdate: wrote the tests. 61 of them, in assembly. You\'re welcome.' },
  { name: 'DO_NOT_OPEN.EXE', icon: 'warning', kind: 'app', type: 'Application', size: '13 KB', description: 'Seriously. Don\'t.', action: { special: 'bsod' } },
]

export const myDocuments = folder('My Documents', [
  { name: 'About Me.html', icon: 'html', kind: 'link', type: 'HTML Document', size: '8 KB', description: 'The serious and the silly version of me, with a photo from 2005.', action: { app: 'browser', args: { url: 'nehad://about' } } },
  { name: 'About Me.txt', icon: 'txt', kind: 'file', type: 'Text Document', size: '2 KB', description: 'Who I am, what I build and how to reach me.', content: aboutTxt },
  { name: 'My CV.pdf', icon: 'txt', kind: 'link', type: 'PDF Document', size: '54 KB', description: 'My CV: 2 pages. Double-click to read or download.', action: { app: 'pdf' } },
  { name: 'Resume.html', icon: 'html', kind: 'link', type: 'HTML Document', size: '6 KB', description: 'My résumé as a web page.', action: { app: 'browser', args: { url: 'nehad://resume' } } },
  { name: 'Guestbook.html', icon: 'html', kind: 'link', type: 'HTML Document', size: '3 KB', description: 'Sign my guestbook!', action: { app: 'browser', args: { url: 'nehad://guestbook' } } },
  folder('My Pictures', [{ name: 'little_me_2005.jpg', icon: 'image', kind: 'file', type: 'JPEG Image', size: '92 KB', description: 'Me in 2005, already typing with great authority.', action: { app: 'imageview', args: { src: '/me/little-me.jpg', name: 'little_me_2005.jpg' } } } as FsNode, ...projects.filter((p) => p.shots?.length).map((p) => ({
    name: `${p.id}${p.shots![0].endsWith('.gif') ? '.gif' : '.jpg'}`, icon: 'image' as const, kind: 'file' as const, type: 'Image', description: `Screenshot of ${p.name}.`,
    action: { app: 'imageview', args: { src: p.shots![0], name: p.name } },
  }))], 'Me in 2005, plus screenshots from my projects.'),
  folder('My Music', [...playlistFiles, ...profile.favorites.filter((f) => !f.youtube).map((f) => ({
    name: f.youtube ? `${f.title}.wma` : `${f.title}.lnk`, icon: 'music' as const, kind: 'link' as const, type: f.youtube ? 'Media file (plays here)' : 'Internet Shortcut', description: `${f.kind}: ${f.title} by ${f.by} (${f.year}).${f.youtube ? ' Double-click to play.' : ''}`, action: favoriteAction(f),
  }))], 'My playlist, plus a few favourites. Double-click a track to play it.'),
], 'Personal files: about, résumé, pictures, music.', 'documents')

export const programs: FsNode[] = [
  app('MS-DOS Prompt', 'dos', 'terminal', 'A real-ish command line. Type HELP.'),
  app('Internet Explorer', 'browser', 'browser', 'Browse my corner of the 1998 web.', { url: 'nehad://home' }),
  app('Notepad', 'notepad', 'notepad', 'Simple text editor.'),
  app('Paint', 'paint', 'paint', 'Draw something. Save it as PNG.'),
  app('CD Player', 'cd', 'cdplayer', 'Original chiptunes, synthesised live.'),
  app('Disk Defragmenter', 'defrag', 'defrag', 'Watch the blocks line up. Very calming.'),
  app('Bug Hunt', 'bug', 'bughunt', 'Bugs are escaping onto the desktop. Squash them.'),
  app('Outlook Express', 'mail', 'outlook', 'My blog, as a 1998 newsgroup. You can also write to me from here.'),
]

export const controlPanel = folder('Control Panel', [
  app('Display', 'display', 'display', 'Change the wallpaper, screen saver, colours and effects.'),
  app('Sounds', 'cd', 'display', 'Toggle system sounds.', { tab: 'Effects' }),
  app('System', 'computer', 'system', 'View system properties.'),
], 'Personalise this computer.', 'control')

export const root: FsNode = folder('My Computer', [
  {
    name: '(C:) NEHAD98', icon: 'drive', kind: 'drive', type: 'Local Disk', description: 'Capacity: 2.1 GB (mostly node_modules)',
    children: [
      myDocuments,
      projectsFolder,
      folder('Program Files', programs, 'Applications installed on this computer.'),
      folder('Windows', [
        { name: 'WIN.INI', icon: 'txt', kind: 'file', type: 'Configuration Settings', size: '1 KB', content: winIni, description: 'Hire=1 has been set.' },
        { name: 'AUTOEXEC.BAT', icon: 'txt', kind: 'file', type: 'MS-DOS Batch File', size: '1 KB', content: autoexec, description: 'Runs at startup.' },
        { name: 'COFFEE.EXE', icon: 'coffee', kind: 'app', type: 'Application', size: '64 KB', description: 'Critical system process.', action: { special: 'coffee' } },
      ], 'These files run your computer. You should not modify them.'),
    ],
  },
  {
    name: '(D:) FAVORITES', icon: 'cdrom', kind: 'drive', type: 'CD-ROM Disc', description: 'Audio CD',
    children: profile.favorites.map((f) => ({ name: f.youtube ? `${f.title}.wma` : `${f.title}.lnk`, icon: 'music' as const, kind: 'link' as const, type: f.youtube ? 'Media file (plays here)' : 'Internet Shortcut', description: `${f.kind}: ${f.title}, ${f.by}, ${f.year}`, action: favoriteAction(f) })),
  },
  controlPanel,
  { name: 'GitHub', icon: 'network', kind: 'link', type: 'Network Place', description: `github.com/${profile.handle}`, action: { url: profile.github } },
])

// Resolve an Explorer-style path such as "C:\\Projects\\Client Work".
export function resolvePath(path: string): FsNode | null {
  let p = path.replace(/\\+$/, '')
  if (!p || p === 'My Computer') return root
  if (p === 'Recycle Bin') return folder('Recycle Bin', recycleBin, 'Things that didn\'t make it.', 'recycleFull')
  if (p === 'Control Panel') return controlPanel
  if (p.startsWith('My Documents')) p = `C:\\${p}`
  const [drive, ...rest] = p.split('\\')
  let node: FsNode | undefined = root.children!.find((c) => c.name.startsWith(`(${drive.toUpperCase()})`)) ?? root.children!.find((c) => c.name.toLowerCase() === drive.toLowerCase())
  for (const seg of rest) {
    node = node?.children?.find((c) => c.name.toLowerCase() === seg.toLowerCase())
    if (!node) return null
  }
  return node ?? null
}

export const driveLetter = (n: FsNode) => n.name.match(/^\((\w:)\)/)?.[1]

export function childPath(parent: string, child: FsNode) {
  const d = driveLetter(child)
  if (d) return d
  if (parent === 'My Computer') return child.name
  return `${parent}\\${child.name}`
}

export function parentPath(path: string) {
  if (path === 'My Computer' || ['Recycle Bin', 'Control Panel', 'My Documents'].includes(path)) return path === 'My Computer' ? null : 'My Computer'
  const i = path.lastIndexOf('\\')
  return i === -1 ? 'My Computer' : path.slice(0, i)
}

export const documentsPath = 'C:\\My Documents'
