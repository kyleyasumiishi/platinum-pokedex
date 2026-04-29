/**
 * useTeam.js — Custom hook for managing a per-generation pinned team.
 *
 * useTeam(gen) accepts the active generation (4 or 5) and stores up to 6
 * regional dex numbers in a gen-specific localStorage key.
 *
 * STORAGE KEYS:
 *   platinum-pokedex-team-gen4  — Sinnoh team
 *   platinum-pokedex-team-gen5  — Unova team
 *
 * LEGACY MIGRATION (runs once on first mount, no-op thereafter):
 *   If the old key `platinum-pokedex-team` exists AND the new gen-4 key is
 *   empty, copy the old team into gen-4 and delete the old key. This preserves
 *   any in-progress Sinnoh team from before this migration.
 */
import { useState, useEffect } from 'react'

const LEGACY_KEY = 'platinum-pokedex-team'
const MAX_TEAM = 6

function storageKey(gen) {
  return `platinum-pokedex-team-gen${gen}`
}

function readTeam(gen) {
  try {
    const stored = localStorage.getItem(storageKey(gen))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function migrateLegacy() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (!legacy) return
    // Only copy if the new gen-4 key is still empty (idempotent)
    const gen4Key = storageKey(4)
    if (!localStorage.getItem(gen4Key)) {
      localStorage.setItem(gen4Key, legacy)
    }
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore — localStorage may be unavailable
  }
}

export function useTeam(gen) {
  const [team, setTeam] = useState(() => {
    migrateLegacy()          // runs once per hook instance on first mount
    return readTeam(gen)
  })

  // Sync to the gen-specific key whenever the team changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(gen), JSON.stringify(team))
    } catch {
      // ignore
    }
  }, [gen, team])

  function isOnTeam(regionalDex) {
    return team.includes(regionalDex)
  }

  function toggleTeam(regionalDex) {
    setTeam(prev => {
      if (prev.includes(regionalDex)) return prev.filter(n => n !== regionalDex)
      if (prev.length >= MAX_TEAM) return prev
      return [...prev, regionalDex]
    })
  }

  return { team, isOnTeam, toggleTeam }
}
