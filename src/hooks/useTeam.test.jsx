import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTeam } from './useTeam'

const LEGACY_KEY = 'platinum-pokedex-team'
const GEN4_KEY = 'platinum-pokedex-team-gen4'
const GEN5_KEY = 'platinum-pokedex-team-gen5'

function Probe({ gen }) {
  const { team, isOnTeam, toggleTeam } = useTeam(gen)
  return (
    <div>
      <span data-testid="team">{JSON.stringify(team)}</span>
      <span data-testid="count">{team.length}</span>
      <button onClick={() => toggleTeam(1)}>toggle1</button>
      <button onClick={() => toggleTeam(2)}>toggle2</button>
    </div>
  )
}

describe('useTeam', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initial state is empty array', () => {
    render(<Probe gen={4} />)
    expect(screen.getByTestId('team').textContent).toBe('[]')
  })

  it('toggleTeam adds a regional_dex', async () => {
    const user = userEvent.setup()
    render(<Probe gen={4} />)
    await user.click(screen.getByText('toggle1'))
    expect(JSON.parse(screen.getByTestId('team').textContent)).toContain(1)
  })

  it('toggleTeam removes if already present', async () => {
    const user = userEvent.setup()
    render(<Probe gen={4} />)
    await user.click(screen.getByText('toggle1'))
    await user.click(screen.getByText('toggle1'))
    expect(JSON.parse(screen.getByTestId('team').textContent)).toHaveLength(0)
  })

  it('toggleTeam respects MAX_TEAM of 6', async () => {
    function Full({ gen }) {
      const { team, toggleTeam } = useTeam(gen)
      const ids = [1, 2, 3, 4, 5, 6, 7]
      return (
        <div>
          <span data-testid="count">{team.length}</span>
          {ids.map(i => <button key={i} onClick={() => toggleTeam(i)}>t{i}</button>)}
        </div>
      )
    }
    const user = userEvent.setup()
    render(<Full gen={4} />)
    for (const label of ['t1', 't2', 't3', 't4', 't5', 't6', 't7']) {
      await user.click(screen.getByText(label))
    }
    expect(screen.getByTestId('count').textContent).toBe('6')
  })

  it('persists to gen-specific localStorage key', async () => {
    const user = userEvent.setup()
    render(<Probe gen={4} />)
    await user.click(screen.getByText('toggle1'))
    expect(JSON.parse(localStorage.getItem(GEN4_KEY))).toContain(1)
    expect(localStorage.getItem(GEN5_KEY)).toBeNull()
  })

  it('different gens have independent team arrays', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Probe gen={4} />)
    await user.click(screen.getByText('toggle1'))
    unmount()
    render(<Probe gen={5} />)
    expect(screen.getByTestId('team').textContent).toBe('[]')
  })

  it('legacy migration: copies platinum-pokedex-team → gen4 on first mount', () => {
    localStorage.setItem(LEGACY_KEY, '[42, 7]')
    render(<Probe gen={4} />)
    expect(JSON.parse(screen.getByTestId('team').textContent)).toEqual([42, 7])
    expect(JSON.parse(localStorage.getItem(GEN4_KEY))).toEqual([42, 7])
  })

  it('legacy migration: deletes the legacy key after copying', () => {
    localStorage.setItem(LEGACY_KEY, '[42]')
    render(<Probe gen={4} />)
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })

  it('legacy migration: no-op if gen4 key already populated', () => {
    localStorage.setItem(LEGACY_KEY, '[99]')
    localStorage.setItem(GEN4_KEY, '[1, 2, 3]')
    render(<Probe gen={4} />)
    // gen4 key should not be overwritten
    expect(JSON.parse(localStorage.getItem(GEN4_KEY))).toEqual([1, 2, 3])
    // legacy key still removed
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })
})
