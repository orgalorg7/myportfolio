declare module '@alexaltea/unicorn-js/x86' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MUnicorn: (opts?: Record<string, unknown>) => Promise<any>
  export default MUnicorn
}
