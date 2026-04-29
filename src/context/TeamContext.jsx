/**
 * TeamContext.jsx — Makes team state available to any component in the tree.
 *
 * Maintains one useTeam instance per generation so switching gens swaps the
 * visible team instantly without losing either gen's team. The TeamTray and
 * detail pages always read the active gen's team.
 */
import { createContext, useContext } from 'react'
import { useTeam } from '../hooks/useTeam'
import { useGenerationContext } from './GenerationContext'

const TeamContext = createContext(null)

export function TeamProvider({ children }) {
  const { activeGen } = useGenerationContext()
  const gen4Team = useTeam(4)
  const gen5Team = useTeam(5)
  const activeTeam = activeGen === 5 ? gen5Team : gen4Team

  return (
    <TeamContext.Provider value={activeTeam}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeamContext() {
  return useContext(TeamContext)
}
