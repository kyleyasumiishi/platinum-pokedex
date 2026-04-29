/**
 * dataLoader.js — Imports static JSON for each generation and builds fast lookup
 * indexes. Components read the active gen's data through the `useDataset()` hook.
 *
 * WHY INDEXES?
 *   pokemon.json is an array of ~150-200 objects per gen. Looking up Garchomp
 *   by name on every render would be O(n). Building Maps once at module load
 *   makes any lookup O(1).
 *
 * import.meta.env.BASE_URL is a Vite feature that returns '/' in dev and
 * '/platinum-pokedex/' in production. We prefix sprite paths with it so they
 * resolve correctly both locally and on GitHub Pages.
 */

import gen4Pokemon    from '../data/gen4/pokemon.json'
import gen4Moves      from '../data/gen4/moves.json'
import gen4Locations  from '../data/gen4/locations.json'
import gen4Evolutions from '../data/gen4/evolutions.json'
import gen4TypeChart  from '../data/gen4/type_chart.json'

import gen5Pokemon    from '../data/gen5/pokemon.json'
import gen5Moves      from '../data/gen5/moves.json'
import gen5Locations  from '../data/gen5/locations.json'
import gen5Evolutions from '../data/gen5/evolutions.json'
import gen5TypeChart  from '../data/gen5/type_chart.json'

import { useGenerationContext } from '../context/GenerationContext'

const BASE = import.meta.env.BASE_URL  // '/platinum-pokedex/' in prod

// ---------------------------------------------------------------------------
// Sprite URL helper — gen-agnostic (national_dex IDs don't collide)
// ---------------------------------------------------------------------------
export function spriteUrl(nationalDex) {
  return `${BASE}sprites/${nationalDex}.png`
}

// ---------------------------------------------------------------------------
// Per-gen dataset construction
// ---------------------------------------------------------------------------

function buildDataset(pokemonRaw, movesRaw, locationsRaw, evolutionsRaw, typeChartRaw) {
  return {
    pokemon: pokemonRaw,
    pokemonByRegionalDex: new Map(pokemonRaw.map(p => [p.regional_dex, p])),
    pokemonByName:        new Map(pokemonRaw.map(p => [p.name.toLowerCase(), p])),
    moves: movesRaw,
    locations: locationsRaw,
    locationList: Object.entries(locationsRaw).sort((a, b) =>
      a[1].name.localeCompare(b[1].name)
    ),
    evolutions: evolutionsRaw,
    evolutionById: new Map(evolutionsRaw.map(c => [c.chain_id, c])),
    typeChart: typeChartRaw,
  }
}

const datasets = {
  4: buildDataset(gen4Pokemon, gen4Moves, gen4Locations, gen4Evolutions, gen4TypeChart),
  5: buildDataset(gen5Pokemon, gen5Moves, gen5Locations, gen5Evolutions, gen5TypeChart),
}

// ---------------------------------------------------------------------------
// useDataset() — components call this to get the active gen's data
// ---------------------------------------------------------------------------
//   const { pokemon, pokemonByRegionalDex, moves, locations, ... } = useDataset()
//
// The returned object is a stable reference per gen, so components don't
// re-render unnecessarily when other state changes.
export function useDataset() {
  const { activeGen } = useGenerationContext()
  return datasets[activeGen] ?? datasets[4]
}

// ---------------------------------------------------------------------------
// Direct accessors (used by tests; allow opting into a specific gen)
// ---------------------------------------------------------------------------
export function getDataset(gen) {
  return datasets[gen]
}

// ---------------------------------------------------------------------------
// Legacy top-level exports (Gen 4) — kept for any consumer not yet migrated
// to useDataset(). New code should prefer useDataset().
// ---------------------------------------------------------------------------
export const pokemon              = datasets[4].pokemon
export const pokemonByRegionalDex = datasets[4].pokemonByRegionalDex
export const pokemonByName        = datasets[4].pokemonByName
export const moves                = datasets[4].moves
export const locations            = datasets[4].locations
export const locationList         = datasets[4].locationList
export const evolutions           = datasets[4].evolutions
export const evolutionById        = datasets[4].evolutionById
export const typeChart            = datasets[4].typeChart

export function getTypeMultiplier(attackingType, defendingType) {
  return typeChart.matrix?.[attackingType]?.[defendingType] ?? 1
}
