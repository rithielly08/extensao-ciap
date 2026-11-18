/** `browser` (Firefox) ou `chrome` (Chromium): ambos expõem APIs com Promise no MV3. */
export const browser: typeof chrome =
  (globalThis as { browser?: typeof chrome }).browser ?? globalThis.chrome;
