import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import { GenerationProvider } from '../../context/GenerationContext'
import { TeamProvider } from '../../context/TeamContext'
import PokemonDetail from './PokemonDetail'

const BADGE_TEXT = /WHITE EXCLUSIVE · TRADE ONLY/i

function renderDetail({ gen, regionalDex }) {
  localStorage.setItem('platinum-pokedex-active-gen', String(gen))
  return render(
    <MemoryRouter initialEntries={[`/pokemon/${regionalDex}`]}>
      <GenerationProvider>
        <TeamProvider>
          <Routes>
            <Route path="/pokemon/:regionalDex" element={<PokemonDetail />} />
          </Routes>
        </TeamProvider>
      </GenerationProvider>
    </MemoryRouter>
  )
}

describe('PokemonDetail — version-exclusive badge', () => {
  it('does not render the badge for a Gen 4 (null) Pokémon', () => {
    renderDetail({ gen: 4, regionalDex: 1 }) // Turtwig
    expect(screen.queryByText(BADGE_TEXT)).toBeNull()
  })

  it('does not render the badge for a Black-exclusive Pokémon (Reshiram)', () => {
    renderDetail({ gen: 5, regionalDex: 149 }) // Reshiram — version_exclusive: "black"
    expect(screen.queryByText(BADGE_TEXT)).toBeNull()
  })

  it('renders the WHITE EXCLUSIVE badge for Zekrom', () => {
    renderDetail({ gen: 5, regionalDex: 150 }) // Zekrom — version_exclusive: "white"
    expect(screen.getByText(BADGE_TEXT)).toBeDefined()
  })

  it('badge uses role="alert" for accessibility', () => {
    renderDetail({ gen: 5, regionalDex: 150 })
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toMatch(BADGE_TEXT)
  })
})

describe('PokemonDetail — region label', () => {
  it('shows SINNOH on Gen 4 detail', () => {
    renderDetail({ gen: 4, regionalDex: 1 })
    expect(screen.getByText(/SINNOH #001/)).toBeDefined()
  })

  it('shows UNOVA on Gen 5 detail', () => {
    renderDetail({ gen: 5, regionalDex: 1 })
    expect(screen.getByText(/UNOVA #001/)).toBeDefined()
  })
})
