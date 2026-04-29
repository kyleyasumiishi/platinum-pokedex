import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GenerationProvider } from '../../context/GenerationContext'
import BottomNav from './BottomNav'

function renderNav(initialGen = 4) {
  localStorage.setItem('platinum-pokedex-active-gen', String(initialGen))
  return render(
    <MemoryRouter initialEntries={[`/gen${initialGen}`]}>
      <GenerationProvider>
        <BottomNav />
      </GenerationProvider>
    </MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders 5 tabs including Settings', () => {
    renderNav(4)
    expect(screen.getByText('Pokédex')).toBeDefined()
    expect(screen.getByText('Routes')).toBeDefined()
    expect(screen.getByText('Moves')).toBeDefined()
    expect(screen.getByText('Types')).toBeDefined()
    expect(screen.getByText('Settings')).toBeDefined()
  })

  it('Pokédex tab links to /gen4 when activeGen is 4', () => {
    renderNav(4)
    const link = screen.getByText('Pokédex').closest('a')
    expect(link.getAttribute('href')).toBe('/gen4')
  })

  it('Pokédex tab links to /gen5 when activeGen is 5', () => {
    renderNav(5)
    const link = screen.getByText('Pokédex').closest('a')
    expect(link.getAttribute('href')).toBe('/gen5')
  })

  it('Settings tab links to /settings (no gen prefix)', () => {
    renderNav(4)
    const link = screen.getByText('Settings').closest('a')
    expect(link.getAttribute('href')).toBe('/settings')
  })
})
