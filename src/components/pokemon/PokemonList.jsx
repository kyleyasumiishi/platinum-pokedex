/**
 * PokemonList.jsx — Searchable, filterable, sortable list of all 210 Pokémon.
 *
 * STATE:
 *   query      — the text in the search box
 *   typeFilter — array of type strings the user has toggled on (e.g. ['Fire', 'Flying'])
 *   sortBy     — one of 'dex' | 'alpha' | 'bst'
 *
 * FILTERING LOGIC:
 *   1. Search: show Pokémon whose name contains the query (case-insensitive),
 *      OR whose Sinnoh dex number starts with the query (so "1" shows #1, #10-19, #100-119, etc.)
 *   2. Type filter: if any types are selected, only show Pokémon that have ALL
 *      selected types. (Multi-select = AND logic, not OR.)
 *
 * DERIVED STATE with useMemo:
 *   The filtered+sorted list is computed with useMemo. This means it only
 *   recalculates when query, typeFilter, or sortBy actually change — not on
 *   every render. With 210 items it's not critical, but it's good practice.
 */
import { useState, useMemo } from 'react'
import { pokemon } from '../../utils/dataLoader'
import PokemonCard from './PokemonCard'

const ALL_TYPES = [
  'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
  'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel',
]

const SORT_OPTIONS = [
  { value: 'dex',   label: 'Dex #', defaultDir: 'asc'  },
  { value: 'alpha', label: 'A–Z',   defaultDir: 'asc'  },
  { value: 'bst',   label: 'BST',   defaultDir: 'desc' },
]

export default function PokemonList() {
  const [query, setQuery]             = useState('')
  const [typeFilter, setTypeFilter]   = useState([])
  const [sortBy, setSortBy]           = useState('dex')
  const [sortDir, setSortDir]         = useState('asc')  // 'asc' or 'desc'
  const [showFilters, setShowFilters] = useState(false)

  // Toggle a type in/out of the filter array
  function toggleType(type) {
    setTypeFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  // Clicking the active sort button reverses direction.
  // Clicking a different button switches to it in ascending order.
  function handleSort(value) {
    if (value === sortBy) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      const opt = SORT_OPTIONS.find(o => o.value === value)
      setSortBy(value)
      setSortDir(opt.defaultDir)
    }
  }

  // Compute filtered + sorted list — only recalculates when dependencies change
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    let list = pokemon.filter(p => {
      // Search match: name or dex number
      if (q) {
        const nameMatch = p.name.toLowerCase().includes(q)
        const numMatch  = String(p.sinnoh_dex).startsWith(q)
        if (!nameMatch && !numMatch) return false
      }
      // Type filter: Pokémon must have ALL selected types
      if (typeFilter.length > 0) {
        const pokemonTypes = p.types.map(t => t.toLowerCase())
        if (!typeFilter.every(t => pokemonTypes.includes(t.toLowerCase()))) return false
      }
      return true
    })

    // Sort — for each option, 'asc' is the natural order, 'desc' reverses it
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'dex')   list = [...list].sort((a, b) => (a.sinnoh_dex - b.sinnoh_dex) * dir)
    if (sortBy === 'alpha') list = [...list].sort((a, b) => a.name.localeCompare(b.name) * dir)
    if (sortBy === 'bst')   list = [...list].sort((a, b) => (b.base_stat_total - a.base_stat_total) * dir)

    return list
  }, [query, typeFilter, sortBy, sortDir])

  return (
    <div>
      {/* Search bar */}
      <div
        className="sticky top-0 z-10 px-3 pt-3 pb-2"
        style={{ backgroundColor: 'var(--screen-bg-alt)' }}
      >
        <input
          type="search"
          placeholder="Search name or #..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-lg px-3 py-2 outline-none"
          style={{
            backgroundColor: 'var(--screen-bg)',
            border: '1px solid var(--screen-green-dim)',
            color: 'var(--screen-green)',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.9rem',
          }}
        />

        {/* Sort + Filter toggle row */}
        <div className="flex items-center gap-2 mt-2">
          {/* Sort buttons */}
          <div className="flex gap-1 flex-1">
            {SORT_OPTIONS.map(opt => {
              const isActive = sortBy === opt.value
              const arrow = isActive ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: '"Share Tech Mono", monospace',
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--dex-red)' : 'var(--screen-bg)',
                    color: isActive ? 'white' : 'var(--screen-green-dim)',
                  }}
                >
                  {opt.label}{arrow}
                </button>
              )
            })}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              fontSize: '0.65rem',
              fontFamily: '"Share Tech Mono", monospace',
              padding: '3px 10px',
              borderRadius: 4,
              border: `1px solid ${typeFilter.length > 0 ? 'var(--dex-red)' : 'var(--screen-green-dim)'}`,
              backgroundColor: typeFilter.length > 0 ? 'var(--dex-red)' : 'transparent',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Filter {typeFilter.length > 0 ? `(${typeFilter.length})` : '▾'}
          </button>
        </div>

        {/* Type filter chips — visible when showFilters is true */}
        {showFilters && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ALL_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`type-badge type-${type.toLowerCase()}`}
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  opacity: typeFilter.includes(type) ? 1 : 0.45,
                  outline: typeFilter.includes(type) ? '2px solid white' : 'none',
                  fontSize: '0.62rem',
                }}
              >
                {type}
              </button>
            ))}
            {typeFilter.length > 0 && (
              <button
                onClick={() => setTypeFilter([])}
                style={{
                  fontSize: '0.62rem',
                  fontFamily: '"Share Tech Mono", monospace',
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid #666',
                  backgroundColor: 'transparent',
                  color: '#aaa',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <div
          className="mt-1 screen-text-dim"
          style={{ fontSize: '0.65rem', textAlign: 'right' }}
        >
          {filtered.length} / 210
        </div>
      </div>

      {/* Pokémon list */}
      <div className="flex flex-col gap-2 px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="screen p-6 text-center screen-text" style={{ fontSize: '0.75rem' }}>
            No Pokémon found.
          </div>
        ) : (
          filtered.map(p => <PokemonCard key={p.sinnoh_dex} pokemon={p} />)
        )}
      </div>
    </div>
  )
}
