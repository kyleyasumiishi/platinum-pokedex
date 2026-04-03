/**
 * TeamContext.jsx — Makes team state available to any component in the app.
 *
 * WHY CONTEXT?
 *   The team state needs to be read and updated by PokemonCard (in the list),
 *   PokemonDetail (in the detail view), and TeamTray (floating overlay).
 *   These components are far apart in the tree, so passing props down through
 *   every level ("prop drilling") would be messy.
 *
 *   React Context solves this: we put the state at the top of the tree and
 *   any component can access it directly with useContext(), no matter how
 *   deeply nested it is.
 *
 * HOW TO USE IN A COMPONENT:
 *   import { useTeamContext } from '../context/TeamContext'
 *   const { team, isOnTeam, toggleTeam } = useTeamContext()
 */
import { createContext, useContext } from 'react'
import { useTeam } from '../hooks/useTeam'

const TeamContext = createContext(null)

export function TeamProvider({ children }) {
  const teamState = useTeam()
  return (
    <TeamContext.Provider value={teamState}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeamContext() {
  return useContext(TeamContext)
}
