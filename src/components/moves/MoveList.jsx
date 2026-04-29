/**
 * MoveList.jsx — Searchable, filterable, sortable list of all moves.
 *
 * Very similar structure to PokemonList — same pattern of:
 *   1. useState for search/filter/sort state
 *   2. useMemo to compute the filtered+sorted list
 *   3. Render the results
 *
 * Filters:
 *   - Type: same 17 type chips as the Pokémon list (single-select here — a move
 *     only has one type, so multi-select wouldn't make sense)
 *   - Category: Physical / Special / Status toggle buttons
 *
 * Sort:
 *   - Alphabetical (default asc)
 *   - By power (default desc — highest power first)
 */
import { useState, useMemo } from 'react'
import { useDataset } from '../../utils/dataLoader'
import MoveCard from './MoveCard'

const ALL_TYPES = [
  'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
  'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel',
]

const CATEGORIES = ['Physical', 'Special', 'Status']

const SORT_OPTIONS = [
  { value: 'alpha', label: 'A–Z',   defaultDir: 'asc'  },
  { value: 'power', label: 'Power', defaultDir: 'desc' },
]

export default function MoveList() {
  const { moves } = useDataset()
  const moveEntries = useMemo(() => Object.entries(moves), [moves])
  const [query,          setQuery]          = useState('')
  const [typeFilter,     setTypeFilter]     = useState(null)   // single type or null
  const [categoryFilter, setCategoryFilter] = useState(null)   // single category or null
  const [sortBy,         setSortBy]         = useState('alpha')
  const [sortDir,        setSortDir]        = useState('asc')
  const [showFilters,    setShowFilters]    = useState(false)

  function handleSort(value) {
    if (value === sortBy) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      const opt = SORT_OPTIONS.find(o => o.value === value)
      setSortBy(value)
      setSortDir(opt.defaultDir)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    let list = moveEntries.filter(([, move]) => {
      if (q && !move.name.toLowerCase().includes(q)) return false
      if (typeFilter && move.type !== typeFilter) return false
      if (categoryFilter && move.category !== categoryFilter) return false
      return true
    })

    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'alpha') {
      list = [...list].sort(([, a], [, b]) => a.name.localeCompare(b.name) * dir)
    }
    if (sortBy === 'power') {
      // Moves with no power (status moves) sort to the end regardless of direction
      list = [...list].sort(([, a], [, b]) => {
        if (a.power == null && b.power == null) return 0
        if (a.power == null) return 1
        if (b.power == null) return -1
        return (b.power - a.power) * dir
      })
    }

    return list
  }, [moveEntries, query, typeFilter, categoryFilter, sortBy, sortDir])

  const hasActiveFilters = typeFilter || categoryFilter

  return (
    <div>
      {/* Search + controls */}
      <div
        className="sticky top-0 z-10 px-3 pt-3 pb-2"
        style={{ backgroundColor: 'var(--screen-bg-alt)' }}
      >
        <input
          type="search"
          placeholder="Search moves..."
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

        {/* Sort + Filter row */}
        <div className="flex items-center gap-2 mt-2">
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

          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              fontSize: '0.65rem',
              fontFamily: '"Share Tech Mono", monospace',
              padding: '3px 10px',
              borderRadius: 4,
              border: `1px solid ${hasActiveFilters ? 'var(--dex-red)' : 'var(--screen-green-dim)'}`,
              backgroundColor: hasActiveFilters ? 'var(--dex-red)' : 'transparent',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Filter {hasActiveFilters ? '●' : '▾'}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-2">
            {/* Category filter */}
            <div className="flex gap-1 mb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(c => c === cat ? null : cat)}
                  style={{
                    fontSize: '0.62rem',
                    fontFamily: '"Share Tech Mono", monospace',
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: categoryFilter === cat ? 'var(--dex-red)' : 'var(--screen-bg)',
                    color: categoryFilter === cat ? 'white' : 'var(--screen-green-dim)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-1">
              {ALL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(t => t === type ? null : type)}
                  className={`type-badge type-${type.toLowerCase()}`}
                  style={{
                    cursor: 'pointer',
                    border: 'none',
                    opacity: typeFilter === type ? 1 : 0.45,
                    outline: typeFilter === type ? '2px solid white' : 'none',
                    fontSize: '0.62rem',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => { setTypeFilter(null); setCategoryFilter(null) }}
                style={{
                  marginTop: 6,
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
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="mt-1 screen-text-dim" style={{ fontSize: '0.65rem', textAlign: 'right' }}>
          {filtered.length} / {moveEntries.length}
        </div>
      </div>

      {/* Move list */}
      <div className="flex flex-col gap-2 px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="screen p-6 text-center screen-text" style={{ fontSize: '0.75rem' }}>
            No moves found.
          </div>
        ) : (
          filtered.map(([id, move]) => <MoveCard key={id} moveId={id} move={move} />)
        )}
      </div>
    </div>
  )
}
