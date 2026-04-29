import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AppContent } from './App'

function renderAt(initialEntry, initialGen = 4) {
  localStorage.setItem('platinum-pokedex-active-gen', String(initialGen))
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppContent />
    </MemoryRouter>
  )
}

describe('App routing — gen-namespaced URLs', () => {
  it('renders the Gen 4 Pokédex at /gen4', async () => {
    renderAt('/gen4')
    // Turtwig is the first Sinnoh entry
    expect(await screen.findByText(/Turtwig/i)).toBeDefined()
  })

  it('renders Turtwig at /gen4/pokemon/1', async () => {
    renderAt('/gen4/pokemon/1')
    expect(await screen.findByText(/SINNOH #001/)).toBeDefined()
    expect(screen.getByText('TURTWIG')).toBeDefined()
  })

  it('renders Snivy at /gen5/pokemon/1', async () => {
    renderAt('/gen5/pokemon/1', 5)
    expect(await screen.findByText(/UNOVA #001/)).toBeDefined()
    expect(screen.getByText('SNIVY')).toBeDefined()
  })

  it('shows the WHITE EXCLUSIVE badge on Zekrom (/gen5/pokemon/150)', async () => {
    renderAt('/gen5/pokemon/150', 5)
    expect(await screen.findByText(/WHITE EXCLUSIVE · TRADE ONLY/i)).toBeDefined()
  })

  it('does NOT show the WHITE EXCLUSIVE badge on Reshiram (/gen5/pokemon/149)', async () => {
    renderAt('/gen5/pokemon/149', 5)
    expect(await screen.findByText('RESHIRAM')).toBeDefined()
    expect(screen.queryByText(/WHITE EXCLUSIVE · TRADE ONLY/i)).toBeNull()
  })
})

describe('App routing — fallbacks', () => {
  it('redirects "/" to the active gen Pokédex', async () => {
    renderAt('/', 5)
    // After redirect, we land on /gen5 — Snivy should be in the list
    expect(await screen.findByText(/Snivy/i)).toBeDefined()
  })

  it('renders NotFoundPage for an invalid gen segment (/gen6/anything)', async () => {
    renderAt('/gen6/anything')
    expect(await screen.findByText(/PAGE NOT FOUND/i)).toBeDefined()
  })

  it('renders NotFoundPage for a totally garbage path', async () => {
    renderAt('/totally/garbage/path')
    expect(await screen.findByText(/PAGE NOT FOUND/i)).toBeDefined()
  })
})

describe('App routing — deep-link gen sync', () => {
  it('deep-linking to /gen5/routes from gen 4 active switches the active gen', async () => {
    renderAt('/gen5/routes', 4)
    // GenSyncRoute fires a useEffect that calls setActiveGen(5).
    // Wait for an Unova-only location to render before asserting on storage.
    await screen.findByText('Dreamyard Area')
    expect(localStorage.getItem('platinum-pokedex-active-gen')).toBe('5')
  })

  it('deep-linking to /gen5/pokemon/1 from gen 4 active switches the active gen', async () => {
    renderAt('/gen5/pokemon/1', 4)
    // After GenSyncRoute fires, dataset switches to gen 5 and Snivy renders.
    expect(await screen.findByText('SNIVY')).toBeDefined()
    expect(localStorage.getItem('platinum-pokedex-active-gen')).toBe('5')
  })
})
