/**
 * GenerationContext.jsx — Tracks the active generation (4 or 5).
 *
 * The active gen is sticky: it persists in localStorage across reloads.
 * Components anywhere in the tree read it via `useGenerationContext()`,
 * and writing to it (via `setActiveGen`) updates both state and storage.
 */
import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'platinum-pokedex-active-gen'
const SUPPORTED_GENS = [4, 5]
const DEFAULT_GEN = 4

function loadActiveGen() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const n = Number(stored)
    if (SUPPORTED_GENS.includes(n)) return n
  } catch {
    // ignore — fall through to default
  }
  return DEFAULT_GEN
}

const GenerationContext = createContext(null)

export function GenerationProvider({ children }) {
  // Lazy initializer — runs once on first render, not on every render.
  const [activeGen, setActiveGen] = useState(() => loadActiveGen())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(activeGen))
    } catch {
      // localStorage unavailable (private mode, SSR) — skip silently
    }
  }, [activeGen])

  return (
    <GenerationContext.Provider value={{ activeGen, setActiveGen }}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGenerationContext() {
  const ctx = useContext(GenerationContext)
  if (!ctx) {
    throw new Error('useGenerationContext must be used inside <GenerationProvider>')
  }
  return ctx
}
