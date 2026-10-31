// Posts for the Outlook Express "newsgroup" blog. Body format: blank-line paragraphs,
// "- " bullets, ``` code fences, and `inline code`.
export type Post = { id: string; subject: string; date: string; group: string; summary: string; body: string }

export const blogGroup = 'nehad98.dev.blog'

export const posts: Post[] = [
  {
    id: 'emulator',
    group: blogGroup,
    subject: 'How a 95 KB assembly game runs in your browser',
    date: '2026-10-31',
    summary: 'ASTRA and PotatoLM are real x86-64 Linux binaries. Here is how they run unchanged on this site.',
    body: `ASTRA (my falling-block game) and PotatoLM (my language model) are written in x86-64 assembly. They run in Linux terminals. And now they also run on this website, unchanged. Here's how.

The plan: emulate the CPU, fake the kernel.

- The CPU is Unicorn, which is QEMU's x86-64 core compiled to WebAssembly. It executes the real machine code.
- The "kernel" is about 300 lines of TypeScript. Every time the program executes \`syscall\`, Unicorn stops and my code answers instead of Linux.
- A Web Worker runs it all, so the desktop never freezes.
- xterm.js draws the output, because both programs speak ANSI escape codes.

ASTRA only needs 14 system calls: read, write, poll, ioctl (terminal size and raw mode), clock_gettime, clock_nanosleep, getrandom, and a few file calls for the high-score file, which ends up in localStorage.

The trick that makes it smooth is clock_nanosleep. ASTRA sleeps until its next frame deadline, 25 ms later. When it asks to sleep, I stop the emulator and schedule a setTimeout for the remaining time. The browser stays responsive and the game holds its own 40 fps.

\`\`\`
case SYS.clock_nanosleep:
  const delay = deadline - now()
  if (delay > 0) this.block('sleep', delay)   // emu_stop + setTimeout
\`\`\`

The bug that took longest to find: PotatoLM refused to load its model. The loader read a variable that should have been zero, and it contained the text "ANSI_X3.4-1968". It turns out Unicorn.js doesn't zero the memory it maps, so it can hand back recycled heap. Linux promises zeroed pages, and every program's .bss section depends on that. ASTRA only worked by luck. Now every mapping is zeroed explicitly.

The honest part: emulated x86 runs about 300 times slower than native. Solo ASTRA doesn't care, because it uses about 1% of a frame. The copilot's search does care, so AI modes pause about 0.3 s per piece. PotatoLM needed a small change for the web build (see the next post).

Try it: double-click "Play ASTRA" or "Chat PotatoLM" on the desktop.`,
  },
  {
    id: 'potatolm',
    group: blogGroup,
    subject: 'Writing a language model in x86-64 assembly',
    date: '2026-10-31',
    summary: 'PotatoLM: tokenizer, attention, matrix kernels, training and a chat UI, all in NASM.',
    body: `PotatoLM is a small transformer whose inference, training and chat interface are written in NASM. Python only exists as a reference implementation and to check the assembly's answers.

What's in the assembly:

- A byte tokenizer, and my own BPE tokenizer: 8,192 tokens, about 57% fewer tokens than raw bytes on held-out text.
- Attention, layer norm, matrix-vector kernels, sampling and decoding.
- AVX2/FMA kernels with a scalar SSE fallback, chosen at runtime with \`cpuid\`.
- A per-layer KV cache. AVX2 plus the cache took generation from 13.4 s to 0.043 s on my laptop.
- A native trainer for the tiny 44K-parameter byte model: forward and backward passes, Adam, gradient clipping and resumable checkpoints.
- A terminal chat with a pixel potato, streamed replies and Unicode line editing.

Keeping hand-written maths honest takes tests: gradient checks, scalar-vs-AVX2 agreement, tokenizer parity with Python. There are 61 of them.

The web version taught me something new. The chat model has a 64-token window and learned absolute positions. When the window is full, the native build slides it by one token, and that forces a rebuild of the KV cache for every new token. Natively you never notice. Under a 300x-slower emulator, one long answer would take minutes.

The web build slides by 4 tokens instead, so the cache is rebuilt once every 4 tokens. Short replies arrive in under a second, and the long ones stream in like someone typing. I first tried 16, which was twice as fast but cut too much context at once: one answer stopped making sense halfway. With 4, every single-question answer I tested matched the native build, and in long conversations the only difference was one sensible answer swapped for another. It's still the real binary, just built with a different window policy.

Ask it who created it. It knows.`,
  },
  {
    id: 'money',
    group: blogGroup,
    subject: 'Money is an integer: lessons from building commerce in Egypt',
    date: '2026-10-31',
    summary: 'Piastres, idempotency keys, expiry dates and records you never delete.',
    body: `I've worked on a cosmetics store (BioReza), a clothing brand's store (ORIALANCE) and a point of sale for a gold shop, mostly as part of a small team. The interfaces differ completely. The lessons underneath are the same.

1. Money is an integer. BioReza stores every amount in piastres, never as a float. The gold POS uses decimal.js with one central rounding policy, because weights and prices per gram don't fit in integers.

2. Every money write is idempotent. Customers double-tap, networks retry, workers restart. Order changes carry an idempotency key that is enforced twice: in Redis for speed, and by a uniqueness constraint in PostgreSQL for truth.

3. Never delete a financial record. You reverse it. Gold-shop invoices are numbered without gaps and can't be edited, and corrections become new documents.

4. Inventory is a ledger, not a number. BioReza tracks stock in batches with expiry dates. Reservations take the batch that expires first, and every movement is appended to a ledger instead of overwriting a count.

5. Contracts belong to the backend. The API owns its schemas and syncs them into each frontend. CI fails if a frontend drifts.

6. Arabic is not a translation layer. Right-to-left layout, Arabic numerals in the right places, and error messages written for people, not stack traces.

None of this shows up in a screenshot. All of it shows up the first time a payment provider retries a webhook at 3 a.m.`,
  },
  {
    id: 'why98',
    group: blogGroup,
    subject: 'Why my portfolio is a Windows 98 desktop',
    date: '2026-10-31',
    summary: 'A portfolio you can poke at says more than one you scroll past.',
    body: `Most portfolios are a hero section, three cards and a contact form. You scroll, you forget.

I wanted one you could poke at. So it boots: a power button, a BIOS screen whose "drives" are my projects, and a startup chime I synthesised from scratch. Everything after that is a working little operating system:

- Projects are .EXE files in C:\\Projects, and Explorer describes the one you click.
- The DOS prompt has real commands. Try \`neofetch\`, \`projects\` or \`sudo make coffee\`.
- The CD Player's four chiptunes are generated live with WebAudio, so there are no audio files.
- ASTRA and PotatoLM are the real binaries running on an x86-64 emulator.
- The icons are hand-drawn SVG. No Microsoft files were harmed.

It's also a test of the things I care about at work: a window manager is state management, an emulator is systems programming, and every easter egg is attention to detail.

And honestly? It's what I wanted computers to feel like when I was the kid in the About Me photo.`,
  },
]

export const welcomeMail = {
  subject: 'Welcome to Outlook Express',
  from: 'Nehad 98',
  date: '2026-10-31',
  body: `Thanks for stopping by!

This is my blog, dressed up as a 1998 newsreader. Click "${blogGroup}" on the left to read the posts.

Want to say hi? Click "New Mail" in the toolbar.

Mohammed`,
}
