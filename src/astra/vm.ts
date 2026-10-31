/*
 * Runs real static x86-64 Linux ELF binaries (ASTRA, and a static build of
 * PotatoLM) on the Unicorn CPU emulator. Unicorn executes the instructions; this
 * class plays the part of the Linux kernel: ASTRA's 14 system calls, plus the
 * handful glibc's startup code needs (brk, mmap, arch_prctl, fstat, lseek...).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Uc = any

const PAGE = 0x1000n
const STACK_TOP = 0x7fff_f000_0000n, STACK_SIZE = 0x100000n
const NS = 1_000_000_000n
const align = (v: bigint, a: bigint) => (v + a - 1n) & ~(a - 1n)
const ZERO_CHUNK = 64 * 1024
const zeros = Array.from({ length: ZERO_CHUNK }, () => 0)

const SYS = {
  read: 0, write: 1, close: 3, fstat: 5, poll: 7, lseek: 8, mmap: 9, mprotect: 10, munmap: 11, brk: 12,
  rt_sigaction: 13, rt_sigprocmask: 14, ioctl: 16, exit: 60, fcntl: 72, fsync: 74, readlink: 89,
  arch_prctl: 158, set_tid_address: 218, clock_gettime: 228, clock_nanosleep: 230, exit_group: 231,
  openat: 257, newfstatat: 262, readlinkat: 267, set_robust_list: 273, prlimit64: 302, getrandom: 318, rseq: 334,
}
const EAGAIN = -11, EBADF = -9, ENOENT = -2, ENOTTY = -25, ENOSYS = -38, ESPIPE = -29, ENOMEM = -12
const O_NONBLOCK = 0x800, POLLIN = 1, POLLOUT = 4, TIMER_ABSTIME = 1
const TCGETS = 0x5401, TCSETS = 0x5402, TCSETSF = 0x5404, TIOCGWINSZ = 0x5413
const TCGETS2 = 0x802c542a, TCSETS2 = 0x402c542b, TCSETSF2 = 0x402c542d
const ARCH_SET_FS = 0x1002, MAP_ANONYMOUS = 0x20, MMAP_BASE = 0x7f00_0000_0000n
const F_GETFL = 3, F_SETFL = 4

export type VmState = 'ready' | 'running' | 'sleep' | 'input' | 'exited'

type OpenFile = { path: string; writing: boolean; pos: number; data: Uint8Array; out: number[] }

export type VmOptions = {
  argv: string[]
  cols: number
  rows: number
  write: (bytes: Uint8Array) => void
  now: () => bigint
  files?: Record<string, Uint8Array>
  saveFile?: (path: string, data: Uint8Array) => void
}

export class AstraVM {
  state: VmState = 'ready'
  /** Milliseconds until the program wants to run again (sleep, or poll timeout). */
  wake: number | null = null
  exitCode: number | null = null
  error: string | null = null
  cols: number
  rows: number

  private e: any
  private rip: bigint
  private input: number[] = []
  private fds = new Map<number, OpenFile>()
  private nextFd = 3
  private flags = 2 // O_RDWR
  private brkStart = 0n
  private brkCur = 0n
  private mmapNext = MMAP_BASE

  private uc: Uc
  private elf: Uint8Array
  private o: VmOptions

  constructor(uc: Uc, elf: Uint8Array, o: VmOptions) {
    this.uc = uc
    this.elf = elf
    this.o = o
    this.cols = o.cols
    this.rows = o.rows
    this.e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64)
    this.rip = this.load()
    this.e.hook_add(uc.HOOK_INSN, () => this.syscall(), {}, 1, 0, uc.X86_INS_SYSCALL)
  }

  /** Execute until the program sleeps, waits for a key, or exits. */
  run() {
    if (this.state === 'exited') return
    this.state = 'running'
    this.wake = null
    try {
      this.e.emu_start(this.rip, 0, 0, 0)
    } catch (err) {
      this.state = 'exited'
      this.exitCode = -1
      this.error = String(err)
      return
    }
    this.rip = this.reg('RIP')
    if (this.state === 'running') this.state = 'ready'
  }

  pushInput(bytes: Uint8Array) {
    for (const b of bytes) this.input.push(b)
  }

  get hasInput() { return this.input.length > 0 }

  close() { try { this.e.close() } catch { /* already closed */ } }

  /* ---------- memory & registers ---------- */
  // Unicorn.js can hand back recycled heap for new mappings, but Linux promises zeroed pages.
  private mapZeroed(addr: bigint, len: number, perms: number) {
    this.e.mem_map(addr, len, perms)
    for (let o = 0; o < len; o += ZERO_CHUNK) {
      const n = Math.min(ZERO_CHUNK, len - o)
      this.e.mem_write(addr + BigInt(o), n === ZERO_CHUNK ? zeros : zeros.slice(0, n))
    }
  }

  private reg(name: string): bigint { return BigInt.asUintN(64, BigInt(this.e.reg_read_i64(this.uc[`X86_REG_${name}`]))) }
  private setReg(name: string, v: bigint | number) { this.e.reg_write_i64(this.uc[`X86_REG_${name}`], BigInt.asIntN(64, BigInt(v))) }
  private read(addr: bigint, n: number) { return Uint8Array.from(this.e.mem_read(addr, n) as ArrayLike<number>) }
  private writeMem(addr: bigint, bytes: ArrayLike<number>) { this.e.mem_write(addr, Array.from(bytes)) }
  private u64(v: bigint | number) { const b = new Uint8Array(8); new DataView(b.buffer).setBigUint64(0, BigInt.asUintN(64, BigInt(v)), true); return b }
  private cstr(addr: bigint) {
    const bytes = this.read(addr, 256)
    const end = bytes.indexOf(0)
    return new TextDecoder().decode(bytes.subarray(0, end < 0 ? bytes.length : end))
  }

  /* ---------- ELF loader + initial process stack ---------- */
  private load(): bigint {
    const { uc, elf } = this
    const dv = new DataView(elf.buffer, elf.byteOffset, elf.byteLength)
    if (dv.getUint32(0) !== 0x7f454c46) throw new Error('Not an ELF file')
    const phoff = Number(dv.getBigUint64(32, true)), phnum = dv.getUint16(56, true)
    for (let i = 0; i < phnum; i++) {
      const o = phoff + i * 56
      if (dv.getUint32(o, true) !== 1) continue // PT_LOAD
      const off = Number(dv.getBigUint64(o + 8, true)), va = dv.getBigUint64(o + 16, true)
      const filesz = Number(dv.getBigUint64(o + 32, true)), memsz = dv.getBigUint64(o + 40, true)
      const start = va & ~(PAGE - 1n), end = align(va + memsz, PAGE)
      this.mapZeroed(start, Number(end - start), uc.PROT_ALL)
      if (end > this.brkStart) this.brkStart = end
      if (filesz) this.writeMem(va, elf.subarray(off, off + filesz))
    }

    // argc, argv[], NULL, envp[], NULL, auxv (AT_PAGESZ, AT_RANDOM, AT_NULL), strings above.
    this.mapZeroed(STACK_TOP - STACK_SIZE, Number(STACK_SIZE), uc.PROT_READ | uc.PROT_WRITE)
    const enc = new TextEncoder()
    let sp = STACK_TOP - 0x1000n
    const push = (s: string) => { const b = enc.encode(`${s}\0`); sp -= BigInt(b.length); this.writeMem(sp, b); return sp }
    const env = ['TERM=xterm-256color', 'LANG=C.UTF-8', 'HOME=/home/guest']
    const argvP = this.o.argv.map(push), envP = env.map(push)
    sp -= 16n
    const random = sp
    this.writeMem(random, crypto.getRandomValues(new Uint8Array(16)))
    this.brkCur = this.brkStart
    sp &= ~15n
    const words = [BigInt(this.o.argv.length), ...argvP, 0n, ...envP, 0n, 6n, 4096n, 25n, random, 0n, 0n]
    if (words.length % 2) sp -= 8n
    sp -= BigInt(words.length * 8)
    words.forEach((v, i) => this.writeMem(sp + BigInt(i * 8), this.u64(v)))
    this.setReg('RSP', sp)
    return dv.getBigUint64(24, true)
  }

  /** Stop emulation; with `retry` the syscall instruction runs again on resume. */
  private block(state: VmState, ms: number | null, retry = false) {
    if (retry) this.setReg('RIP', this.reg('RIP') - 2n) // `syscall` is 2 bytes (0F 05)
    this.state = state
    this.wake = ms
    this.e.emu_stop()
  }

  /* ---------- the "kernel" ---------- */
  private syscall() {
    const nr = Number(this.reg('RAX'))
    const a0 = this.reg('RDI'), a1 = this.reg('RSI'), a2 = this.reg('RDX')
    const ret = (v: number | bigint) => this.setReg('RAX', v)

    switch (nr) {
      case SYS.read: {
        const fd = Number(a0), n = Number(a2)
        if (fd === 0) {
          if (!this.input.length) {
            if (this.flags & O_NONBLOCK) return ret(EAGAIN)
            return this.block('input', null, true)
          }
          const chunk = this.input.splice(0, n)
          this.writeMem(a1, chunk)
          return ret(chunk.length)
        }
        const f = this.fds.get(fd)
        if (!f) return ret(EBADF)
        const chunk = f.data.subarray(f.pos, f.pos + n)
        f.pos += chunk.length
        this.writeMem(a1, chunk)
        return ret(chunk.length)
      }
      case SYS.write: {
        const fd = Number(a0), n = Number(a2)
        const bytes = this.read(a1, n)
        if (fd === 1 || fd === 2) { this.o.write(bytes); return ret(n) }
        const f = this.fds.get(fd)
        if (!f) return ret(EBADF)
        f.out.push(...bytes)
        return ret(n)
      }
      case SYS.close: {
        const f = this.fds.get(Number(a0))
        if (f?.writing) this.o.saveFile?.(f.path, new Uint8Array(f.out))
        this.fds.delete(Number(a0))
        return ret(0)
      }
      case SYS.poll: {
        const nfds = Number(a1)
        const timeout = Number(BigInt.asIntN(32, a2))
        let ready = 0
        for (let i = 0; i < nfds; i++) {
          const p = a0 + BigInt(i * 8)
          const d = this.read(p, 8)
          const fd = d[0] | (d[1] << 8), events = d[4] | (d[5] << 8)
          let rev = 0
          if (fd === 0 && events & POLLIN && this.input.length) rev |= POLLIN
          if ((fd === 1 || fd === 2) && events & POLLOUT) rev |= POLLOUT
          this.writeMem(p + 6n, [rev & 0xff, rev >> 8])
          if (rev) ready++
        }
        if (ready || timeout === 0) return ret(ready)
        return this.block('input', timeout < 0 ? null : timeout, true)
      }
      case SYS.rt_sigaction: case SYS.rt_sigprocmask: case SYS.fsync:
        return ret(0)
      case SYS.ioctl: {
        const req = Number(a1)
        if (req === TCGETS) { this.writeMem(a2, new Uint8Array(60)); return ret(0) }
        if (req === TCGETS2) { this.writeMem(a2, new Uint8Array(44)); return ret(0) }
        if ((req >= TCSETS && req <= TCSETSF) || (req >= TCSETS2 && req <= TCSETSF2)) return ret(0)
        if (req === TIOCGWINSZ) {
          const b = new Uint8Array(8), v = new DataView(b.buffer)
          v.setUint16(0, this.rows, true)
          v.setUint16(2, this.cols, true)
          this.writeMem(a2, b)
          return ret(0)
        }
        return ret(ENOTTY)
      }
      case SYS.exit: case SYS.exit_group:
        this.exitCode = Number(BigInt.asIntN(32, a0))
        this.state = 'exited'
        this.e.emu_stop()
        return
      case SYS.fcntl: {
        if (Number(a1) === F_GETFL) return ret(this.flags)
        if (Number(a1) === F_SETFL) this.flags = Number(a2)
        return ret(0)
      }
      case SYS.clock_gettime: {
        const ns = this.o.now()
        this.writeMem(a1, [...this.u64(ns / NS), ...this.u64(ns % NS)])
        return ret(0)
      }
      case SYS.clock_nanosleep: {
        const t = new DataView(this.read(a2, 16).buffer)
        const req = t.getBigInt64(0, true) * NS + t.getBigInt64(8, true)
        const delay = Number(a1) & TIMER_ABSTIME ? req - this.o.now() : req
        ret(0)
        if (delay > 0n) this.block('sleep', Number(delay) / 1e6)
        return
      }
      case SYS.openat: {
        const path = this.cstr(a1)
        const writing = (Number(a2) & 3) !== 0
        const data = this.o.files?.[path]
        if (!writing && !data) return ret(ENOENT)
        const fd = this.nextFd++
        this.fds.set(fd, { path, writing, pos: 0, data: data ?? new Uint8Array(), out: [] })
        return ret(fd)
      }
      case SYS.getrandom: {
        const n = Math.min(Number(a1), 256)
        this.writeMem(a0, crypto.getRandomValues(new Uint8Array(n)))
        return ret(n)
      }
      /* ---- what glibc's startup and stdio need ---- */
      case SYS.brk: {
        if (a0 <= this.brkCur) return ret(this.brkCur)
        const have = align(this.brkCur, PAGE), want = align(a0, PAGE)
        if (want > have) {
          try { this.mapZeroed(have, Number(want - have), this.uc.PROT_ALL) } catch { return ret(this.brkCur) }
        }
        this.brkCur = a0
        return ret(a0)
      }
      case SYS.mmap: {
        const len = align(a1, PAGE)
        const flags = Number(this.reg('R10')), fd = Number(BigInt.asIntN(32, this.reg('R8')))
        const addr = this.mmapNext
        try { this.mapZeroed(addr, Number(len), this.uc.PROT_ALL) } catch { return ret(ENOMEM) }
        this.mmapNext += len + PAGE
        if (!(flags & MAP_ANONYMOUS) && fd >= 0) {
          const f = this.fds.get(fd)
          if (f) this.writeMem(addr, f.data.subarray(Number(this.reg('R9')), Number(this.reg('R9')) + Number(a1)))
        }
        return ret(addr)
      }
      case SYS.munmap: {
        try { this.e.mem_unmap(a0, Number(align(a1, PAGE))) } catch { /* already gone */ }
        return ret(0)
      }
      case SYS.mprotect: case SYS.set_robust_list:
        return ret(0)
      case SYS.arch_prctl:
        if (Number(a0) === ARCH_SET_FS) { this.setReg('FS_BASE', a1); return ret(0) }
        return ret(-22)
      case SYS.set_tid_address:
        return ret(1000)
      case SYS.prlimit64: {
        const old = this.reg('R10')
        if (old) this.writeMem(old, [...this.u64(8n << 20n), ...this.u64(-1n)])
        return ret(0)
      }
      case SYS.readlink: case SYS.readlinkat:
        return ret(ENOENT)
      case SYS.fstat: case SYS.newfstatat: {
        const fd = nr === SYS.fstat ? Number(a0) : Number(BigInt.asIntN(32, a0))
        const buf = nr === SYS.fstat ? a1 : a2
        const st = new Uint8Array(144), v = new DataView(st.buffer)
        const f = this.fds.get(fd)
        if (fd <= 2) v.setUint32(24, 0o20620, true) // character device (a terminal)
        else if (f) { v.setUint32(24, 0o100644, true); v.setBigInt64(48, BigInt(f.data.length), true) }
        else return ret(EBADF)
        v.setBigInt64(56, 4096n, true)
        this.writeMem(buf, st)
        return ret(0)
      }
      case SYS.lseek: {
        const f = this.fds.get(Number(a0))
        if (!f) return ret(ESPIPE)
        const off = Number(BigInt.asIntN(64, a1)), whence = Number(a2)
        f.pos = whence === 0 ? off : whence === 1 ? f.pos + off : f.data.length + off
        return ret(f.pos)
      }
      default:
        return ret(ENOSYS)
    }
  }
}
