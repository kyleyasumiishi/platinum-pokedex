/**
 * dataLoader.js — Imports static JSON data and builds fast lookup indexes.
 *
 * WHY INDEXES?
 * pokemon.json is an array of 210 objects. If we want to find Garchomp by name
 * every time we render a link, we'd have to scan the whole array each time.
 * Instead, we build Maps (key → value dictionaries) once at startup so any
 * lookup is O(1) — instant no matter how many Pokémon there are.
 *
 * import.meta.env.BASE_URL is a Vite feature that returns '/' in dev and
 * '/platinum-pokedex/' in production. We use it to prefix sprite paths so
 * they resolve correctly both locally and on GitHub Pages.
 */

import pokemonRaw    from '../data/gen4/pokemon.json'
import movesRaw      from '../data/gen4/moves.json'
import locationsRaw  from '../data/gen4/locations.json'
import evolutionsRaw from '../data/gen4/evolutions.json'
import typeChartRaw  from '../data/gen4/type_chart.json'

const BASE = import.meta.env.BASE_URL  // e.g. '/platinum-pokedex/'

// ---------------------------------------------------------------------------
// Sprite URL helper
// ---------------------------------------------------------------------------
// Sprites are stored in public/sprites/{nationalDex}.png.
// In the JSON the path is 'sprites/387.png' (no leading slash).
// We prepend BASE so it works in both dev and production.
export function spriteUrl(nationalDex) {
  return `${BASE}sprites/${nationalDex}.png`
}

// ---------------------------------------------------------------------------
// Pokémon data + indexes
// ---------------------------------------------------------------------------

// The raw array — 210 objects sorted by regional dex number
export const pokemon = pokemonRaw

// Look up any Pokémon by regional dex number in O(1)
// e.g. pokemonByRegionalDex.get(1) → Turtwig's data object
export const pokemonByRegionalDex = new Map(
  pokemon.map(p => [p.regional_dex, p])
)

// Look up any Pokémon by lowercase name in O(1)
// e.g. pokemonByName.get('garchomp') → Garchomp's data object
export const pokemonByName = new Map(
  pokemon.map(p => [p.name.toLowerCase(), p])
)

// ---------------------------------------------------------------------------
// Move data
// ---------------------------------------------------------------------------

// movesRaw is already an object keyed by move ID, so we just export it directly.
// e.g. moves['dragon-claw'] → { name, type, category, power, ... }
export const moves = movesRaw

// ---------------------------------------------------------------------------
// Location data
// ---------------------------------------------------------------------------

// locationsRaw is keyed by location ID string.
// e.g. locations['route-201'] → { name, encounters: [...] }
export const locations = locationsRaw

// Sorted array of location entries for the list view
// Each entry: [locationId, locationData]
export const locationList = Object.entries(locationsRaw).sort((a, b) =>
  a[1].name.localeCompare(b[1].name)
)

// ---------------------------------------------------------------------------
// Evolution chains
// ---------------------------------------------------------------------------

// Array of chain objects. Each has chain_id and a nested stages tree.
export const evolutions = evolutionsRaw

// Look up an evolution chain by ID in O(1)
export const evolutionById = new Map(
  evolutions.map(chain => [chain.chain_id, chain])
)

// ---------------------------------------------------------------------------
// Type chart
// ---------------------------------------------------------------------------

export const typeChart = typeChartRaw

// Convenience: get the multiplier for attackingType → defendingType
// e.g. getTypeMultiplier('Fire', 'Grass') → 2
export function getTypeMultiplier(attackingType, defendingType) {
  return typeChart.matrix?.[attackingType]?.[defendingType] ?? 1
}
