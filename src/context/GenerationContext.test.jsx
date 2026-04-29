import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  GenerationProvider,
  useGenerationContext,
} from './GenerationContext'

const STORAGE_KEY = 'platinum-pokedex-active-gen'

function Probe() {
  const { activeGen, setActiveGen } = useGenerationContext()
  return (
    <div>
      <span data-testid="gen">{activeGen}</span>
      <button onClick={() => setActiveGen(5)}>set5</button>
      <button onClick={() => setActiveGen(4)}>set4</button>
    </div>
  )
}

describe('GenerationContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to gen 4 when localStorage is empty', () => {
    render(<GenerationProvider><Probe /></GenerationProvider>)
    expect(screen.getByTestId('gen').textContent).toBe('4')
  })

  it('reads activeGen from localStorage on initial render', () => {
    localStorage.setItem(STORAGE_KEY, '5')
    render(<GenerationProvider><Probe /></GenerationProvider>)
    expect(screen.getByTestId('gen').textContent).toBe('5')
  })

  it('falls back to 4 if localStorage has invalid value', () => {
    localStorage.setItem(STORAGE_KEY, 'banana')
    render(<GenerationProvider><Probe /></GenerationProvider>)
    expect(screen.getByTestId('gen').textContent).toBe('4')
  })

  it('falls back to 4 if localStorage has unsupported gen', () => {
    localStorage.setItem(STORAGE_KEY, '99')
    render(<GenerationProvider><Probe /></GenerationProvider>)
    expect(screen.getByTestId('gen').textContent).toBe('4')
  })

  it('setActiveGen updates state and writes to localStorage', async () => {
    const user = userEvent.setup()
    render(<GenerationProvider><Probe /></GenerationProvider>)
    await user.click(screen.getByText('set5'))
    expect(screen.getByTestId('gen').textContent).toBe('5')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('5')
  })

  it('multiple consumers all see the updated value after setActiveGen', async () => {
    const user = userEvent.setup()
    render(
      <GenerationProvider>
        <Probe />
        <Probe />
      </GenerationProvider>
    )
    await user.click(screen.getAllByText('set5')[0])
    const probes = screen.getAllByTestId('gen')
    expect(probes[0].textContent).toBe('5')
    expect(probes[1].textContent).toBe('5')
  })

  it('throws when used outside the provider', () => {
    // Suppress React's expected error log
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/GenerationProvider/)
    spy.mockRestore()
  })
})
