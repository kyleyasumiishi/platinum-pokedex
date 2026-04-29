import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GenerationProvider, useGenerationContext } from '../../context/GenerationContext'
import GenSyncRoute from './GenSyncRoute'

const STORAGE_KEY = 'platinum-pokedex-active-gen'

function ActiveGenLabel() {
  const { activeGen } = useGenerationContext()
  return <span data-testid="active">{activeGen}</span>
}

describe('GenSyncRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders children when URL gen matches context gen', () => {
    render(
      <GenerationProvider>
        <GenSyncRoute gen={4}>
          <div data-testid="child">child content</div>
        </GenSyncRoute>
      </GenerationProvider>
    )
    expect(screen.getByTestId('child').textContent).toBe('child content')
  })

  it('calls setActiveGen when URL gen differs from context gen', async () => {
    // Default gen is 4; mounting with gen=5 should switch
    render(
      <GenerationProvider>
        <GenSyncRoute gen={5}>
          <ActiveGenLabel />
        </GenSyncRoute>
      </GenerationProvider>
    )
    // Effect runs after first render — find the updated value
    const label = await screen.findByTestId('active')
    expect(label.textContent).toBe('5')
  })

  it('does not change context when gens already match', async () => {
    localStorage.setItem(STORAGE_KEY, '5')
    render(
      <GenerationProvider>
        <GenSyncRoute gen={5}>
          <ActiveGenLabel />
        </GenSyncRoute>
      </GenerationProvider>
    )
    const label = await screen.findByTestId('active')
    expect(label.textContent).toBe('5')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('5')
  })

  it('persists the synced gen to localStorage', async () => {
    render(
      <GenerationProvider>
        <GenSyncRoute gen={5}>
          <ActiveGenLabel />
        </GenSyncRoute>
      </GenerationProvider>
    )
    await screen.findByTestId('active')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('5')
  })
})
