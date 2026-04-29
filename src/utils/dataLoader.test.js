import { describe, it, expect } from 'vitest'
import {
  pokemon,
  pokemonByRegionalDex,
  pokemonByName,
  moves,
  locations,
  typeChart,
  getTypeMultiplier,
} from './dataLoader'

describe('dataLoader (gen 4)', () => {
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
