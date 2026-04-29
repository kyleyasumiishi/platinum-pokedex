import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { GenerationProvider } from '../context/GenerationContext'
import SettingsPage from './SettingsPage'

function renderSettings(initialGen = 4) {
  localStorage.setItem('platinum-pokedex-active-gen', String(initialGen))
  return render(
    <MemoryRouter>
      <GenerationProvider>
        <SettingsPage />
      </GenerationProvider>
    </MemoryRouter>
  )
}

describe('SettingsPage', () => {
  it('renders both generation buttons', () => {
    renderSettings(4)
    expect(screen.getByText('SINNOH — PLATINUM')).toBeDefined()
    expect(screen.getByText('UNOVA — BLACK')).toBeDefined()
  })

  it('active gen button has aria-pressed=true', () => {
    renderSettings(4)
    const gen4Btn = screen.getByText('SINNOH — PLATINUM').closest('button')
    const gen5Btn = screen.getByText('UNOVA — BLACK').closest('button')
    expect(gen4Btn.getAttribute('aria-pressed')).toBe('true')
    expect(gen5Btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('tapping inactive gen button calls setActiveGen and stays on settings', async () => {
    const user = userEvent.setup()
    renderSettings(4)
    const gen5Btn = screen.getByText('UNOVA — BLACK').closest('button')
    await user.click(gen5Btn)
    expect(localStorage.getItem('platinum-pokedex-active-gen')).toBe('5')
    // Should still be on the settings page
    expect(screen.getByText('SINNOH — PLATINUM')).toBeDefined()
    expect(screen.getByText('UNOVA — BLACK')).toBeDefined()
  })

  it('tapping active gen button is a no-op (no nav, no state change)', async () => {
    const user = userEvent.setup()
    renderSettings(4)
    const gen4Btn = screen.getByText('SINNOH — PLATINUM').closest('button')
    await user.click(gen4Btn)
    // Still gen 4
    expect(localStorage.getItem('platinum-pokedex-active-gen')).toBe('4')
    expect(gen4Btn.getAttribute('aria-pressed')).toBe('true')
  })
})
