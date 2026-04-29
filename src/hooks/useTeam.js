/**
 * useTeam.js — Custom hook for managing the pinned Pokémon team.
 *
 * Stores up to 6 regional dex numbers in localStorage so the team persists
 * across sessions (closing and reopening the browser).
 *
 * HOW localStorage WORKS:
 *   localStorage is a simple key-value store in the browser. Values must be
 *   strings, so we JSON.stringify the array when saving and JSON.parse when
 *   reading. It survives page refreshes and browser restarts, but not clearing
 *   browser data.
 *
 * HOW THIS HOOK WORKS:
 *   useState is initialized with a function (lazy initializer) — the function
 *   runs only once on first render to read from localStorage. After that,
 *   React manages the state in memory and we sync to localStorage on changes.
 *
 * RETURNS:
 *   team         — array of regional_dex numbers currently on the team (max 6)
 *   isOnTeam(n)  — returns true if regional_dex n is on the team
 *   toggleTeam(n)— adds n if not present (if room), removes it if present
 */
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'platinum-pokedex-team'
const MAX_TEAM = 6

export function useTeam() {
  const [team, setTeam] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sync to localStorage whenever team changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team))
  }, [team])

  function isOnTeam(regionalDex) {
    return team.includes(regionalDex)
  }

  function toggleTeam(regionalDex) {
    setTeam(prev => {
      if (prev.includes(regionalDex)) {
        // Remove from team
        return prev.filter(n => n !== regionalDex)
      }
      if (prev.length >= MAX_TEAM) {
        // Team is full — don't add, return unchanged
        return prev
      }
      return [...prev, regionalDex]
    })
  }

  return { team, isOnTeam, toggleTeam }
}
