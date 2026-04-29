import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Node 25 ships a `localStorage` global stub that lacks the standard methods,
// shadowing jsdom's window.localStorage. Replace it with a working in-memory
// implementation so tests can use the storage API normally.
function createMemoryStorage() {
  let store = new Map()
  return {
    get length() { return store.size },
    key(i)             { return [...store.keys()][i] ?? null },
    getItem(k)         { return store.has(k) ? store.get(k) : null },
    setItem(k, v)      { store.set(String(k), String(v)) },
    removeItem(k)      { store.delete(k) },
    clear()            { store.clear() },
  }
}

const mem = createMemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: mem, configurable: true })
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: mem, configurable: true })
}

afterEach(() => {
  cleanup()
  mem.clear()
})
