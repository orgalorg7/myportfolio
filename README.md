# Nehad 98

Mohammed Nehad's portfolio, built as a working 1998-style desktop. It boots by itself through a short BIOS POST and startup splash (about 3 seconds, click to skip) and lands on a desktop where every project lives in a folder.

## What's inside

- **Desktop**: draggable icons, rubber-band selection, right-click menus, wallpapers, colour schemes, screen savers, CRT effect.
- **Window manager**: drag, resize from every edge, minimise with the caption-zoom animation, maximise, z-order, a taskbar with Quick Launch and a Cairo-time clock, and a Start menu with nested submenus.
- **Explorer**: `C:\Projects\<category>\<PROJECT>.EXE`, with the classic "web view" side panel describing whatever you select.
- **Internet Explorer**: a hand-made late-90s homepage, a case-study page per project, a résumé and a guestbook.
- **MS-DOS Prompt**: `DIR`, `CD`, `TYPE`, `OPEN`, `PROJECTS`, `TREE`, `NEOFETCH`, `HIRE`, tab completion, history... and some undocumented commands.
- **Accessories**: Paint (with flood fill, shapes and PNG export), Notepad, CD Player (four original chiptunes synthesised with WebAudio), Disk Defragmenter, Bug Hunt (bugs escape onto the desktop and you squash them), Outlook Express, Find, Run.
- **POTATO.EXE**: chat with PotatoLM. It's a static build of the real assembly binary (`public/potato/`) on the same emulator as ASTRA, built by `scripts/build-potatolm-web.sh`. The web build slides the 64-token chat window 4 tokens at a time instead of 1 (`scripts/potatolm-web.patch`), so the KV cache isn't rebuilt for every token. With 4, answers matched the native build in testing; 16 was faster but garbled some replies.
- **Live xray demo**: the real xray gallery opens inside Internet Explorer. Hosts allowed to render inside the browser window are listed in `EMBEDDABLE` in `src/apps/Browser.tsx`.
- **Blog**: Outlook Express is a newsreader for `nehad98.dev.blog`. Posts live in `src/data/blog.ts`.
- **Contact**: "Contact Me" sends through `profile.contactForm` (a Formspree-style endpoint) if set, otherwise opens `mailto:` to `profile.email`, otherwise copies the message and opens LinkedIn.
- **Link preview**: `public/og-image.png` (1200×630) comes from `scripts/og-image.sh`, which screenshots the staged `/?scene=og` desktop with headless Chrome. Run it against `vite preview` for the cleanest result.
- **Media Player**: "Nehad's Playlist" (Pink Floyd, Wu-Tang, A Tribe Called Quest, King Crimson and 70s Japanese jazz) plays inside the site through YouTube's privacy-enhanced embed, with a track list, next/previous, shuffle, repeat and auto-advance. Every track is an official upload (the artist's channel or YouTube's label-supplied "Topic" channel) that allows embedding. Edit the list in `playlist` in `src/data/profile.ts`.
- **Easter eggs**: check the Recycle Bin, `C:\WINDOWS`, and `sudo make coffee`.
- **ASTRA.COM**: the real ASTRA binary (`public/astra/astra.elf`, about 95 KB of x86-64 NASM, unchanged) runs in the browser. The Unicorn CPU emulator, compiled to WebAssembly, executes it in a Web Worker, and `src/astra/vm.ts` acts as the Linux kernel for its 14 syscalls (terminal I/O, timers, `getrandom`, and the high-score file in `localStorage`). xterm.js draws the output. Solo play runs at the game's own 40 fps. The copilot's search is slow under emulation, so AI modes pause about 0.3 s on each new piece.

To update the playable ASTRA after changing the game, rebuild it in `~/Desktop/tetries` with `make`, then copy `tetris` to `public/astra/astra.elf`.

Third-party code: [98.css](https://github.com/jdan/98.css) (MIT), [xterm.js](https://github.com/xtermjs/xterm.js) (MIT) and [Unicorn.js](https://github.com/AlexAltea/unicorn.js) (GPL-2.0, license in `public/licenses/`).

Everything else is original: the icons are hand-drawn SVG, every sound is synthesised at runtime, and the window chrome builds on [98.css](https://github.com/jdan/98.css) (MIT, vendored in `src/styles/vendor/` with one media-query fix so it minifies).

## Editing content

| What | Where |
| --- | --- |
| Projects (text, stack, links, screenshots, featured flag) | `src/data/projects.ts` |
| Bio, links, skills, favourites | `src/data/profile.ts` |
| Folder tree, Recycle Bin, system files | `src/data/fs.ts` |
| Screenshots | `public/shots/` |
| Homepage, project pages, résumé | `src/apps/pages.tsx` |

Set `profile.email` to make "Contact Me" open a real `mailto:`. While it's empty, the message is copied to the clipboard and LinkedIn opens instead.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview
```

It's a static Vite + React 19 + TypeScript site, so `dist/` deploys anywhere: Vercel, Netlify, GitHub Pages or Cloudflare Pages.
