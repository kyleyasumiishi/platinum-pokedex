import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import {
  pokemon,
  pokemonByRegionalDex,
  pokemonByName,
  moves,
  locations,
  typeChart,
  getTypeMultiplier,
  useDataset,
  getDataset,
} from './dataLoader'
import { GenerationProvider } from '../context/GenerationContext'

describe('dataLoader (gen 4 legacy exports)', () => {
  it('pokemonByRegionalDex.get(1) returns Turtwig', () => {
    const p = pokemonByRegionalDex.get(1)
    expect(p).toBeDefined()
    expect(p.name).toBe('Turtwig')
    expect(p.regional_dex).toBe(1)
  })

  it('pokemonByRegionalDex.get(210) returns the last Sinnoh entry', () => {
    const p = pokemonByRegionalDex.get(210)
    expect(p).toBeDefined()
    expect(p.regional_dex).toBe(210)
  })

  it('pokemonByName.get("garchomp") returns Garchomp with regional_dex set', () => {
    const p = pokemonByName.get('garchomp')
    expect(p).toBeDefined()
    expect(p.name).toBe('Garchomp')
    expect(typeof p.regional_dex).toBe('number')
  })

  it('moves["tackle"] exists with expected shape', () => {
    expect(moves.tackle).toBeDefined()
    expect(moves.tackle).toHaveProperty('name')
    expect(moves.tackle).toHaveProperty('type')
    expect(moves.tackle).toHaveProperty('power')
  })

  it('locations contains a Sinnoh route entry with encounters array', () => {
    const route = locations['sinnoh-route-201-area']
    expect(route).toBeDefined()
    expect(Array.isArray(route.encounters)).toBe(true)
  })

  it('typeChart.matrix.Fire.Grass === 2', () => {
    expect(typeChart.matrix.Fire.Grass).toBe(2)
    expect(getTypeMultiplier('Fire', 'Grass')).toBe(2)
  })

  it('all 210 Pokémon are loaded with no regional_dex gaps', () => {
    expect(pokemon).toHaveLength(210)
    const dexNums = pokemon.map(p => p.regional_dex).sort((a, b) => a - b)
    expect(dexNums[0]).toBe(1)
    expect(dexNums[209]).toBe(210)
  })
})

describe('getDataset() — direct per-gen accessor', () => {
  it('gen 4 dataset has 210 Pokémon', () => {
    const ds = getDataset(4)
    expect(ds.pokemon).toHaveLength(210)
    expect(ds.pokemonByRegionalDex.get(1).name).toBe('Turtwig')
  })

  it('gen 5 dataset has exactly 156 Pokémon', () => {
    const ds = getDataset(5)
    expect(ds.pokemon).toHaveLength(156)
  })

  it('gen 5 dataset includes Snivy at regional_dex=1', () => {
    const ds = getDataset(5)
    expect(ds.pokemonByRegionalDex.get(1).name).toBe('Snivy')
    expect(ds.pokemonByName.get('snivy').national_dex).toBe(495)
  })

  it('gen 5 typeChart has 17 types and no Fairy', () => {
    const ds = getDataset(5)
    expect(ds.typeChart.types).toHaveLength(17)
    expect(ds.typeChart.types).not.toContain('Fairy')
  })

  it('gen 5 evolutionById indexes the Snivy chain', () => {
    const ds = getDataset(5)
    const snivy = ds.pokemonByName.get('snivy')
    const chain = ds.evolutionById.get(snivy.evolution_chain_id)
    expect(chain).toBeDefined()
    expect(chain.stages.name).toBe('Snivy')
  })
})

describe('useDataset() — switches based on GenerationContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function Probe() {
    const ds = useDataset()
    return (
      <div>
        <span data-testid="count">{ds.pokemon.length}</span>
        <span data-testid="first">{ds.pokemonByRegionalDex.get(1).name}</span>
      </div>
    )
  }

  it('returns the gen 4 dataset when activeGen is 4', () => {
    const { getByTestId } = render(
      <GenerationProvider><Probe /></GenerationProvider>
    )
    expect(getByTestId('count').textContent).toBe('210')
    expect(getByTestId('first').textContent).toBe('Turtwig')
  })

  it('returns the gen 5 dataset when activeGen is 5', () => {
    localStorage.setItem('platinum-pokedex-active-gen', '5')
    const { getByTestId } = render(
      <GenerationProvider><Probe /></GenerationProvider>
    )
    expect(getByTestId('count').textContent).toBe('156')
    expect(getByTestId('first').textContent).toBe('Snivy')
  })
})
