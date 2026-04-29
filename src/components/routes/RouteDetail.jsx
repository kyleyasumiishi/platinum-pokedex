/**
 * RouteDetail.jsx — Full detail view for a single location.
 *
 * URL: /routes/:locationId
 *
 * Shows all Pokémon available at this location with method, level range,
 * encounter rate, and time of day. Filterable by method and time of day.
 * Each Pokémon name/sprite is a Link to its detail page.
 */
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { locations, pokemonByName, spriteUrl } from '../../utils/dataLoader'

const METHOD_LABELS = {
  'walk':       'Grass',
  'tall-grass': 'Grass',
  'surf':       'Surf',
  'old-rod':    'Old Rod',
  'good-rod':   'Good Rod',
  'super-rod':  'Super Rod',
  'rock-smash': 'Rock Smash',
  'gift':       'Gift',
  'pokeradar':  'PokéRadar',
}

function formatMethod(method) {
  return METHOD_LABELS[method] ?? method.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const SORT_COLS = [
  { key: 'name',   label: 'Pokémon' },
  { key: 'method', label: 'Method'  },
  { key: 'level',  label: 'Lvl'     },
  { key: 'rate',   label: '%'       },
  { key: 'time',   label: 'Time'    },
]

export default function RouteDetail() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const location = locations[locationId]

  const [methodFilter, setMethodFilter] = useState(null)
  const [timeFilter, setTimeFilter]     = useState(null)
  const [sortCol, setSortCol]           = useState(null)   // null = original order
  const [sortDir, setSortDir]           = useState('asc')

  function handleColSort(key) {
    if (key === sortCol) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(key)
      setSortDir('asc')
    }
  }

  if (!location) {
    return (
      <div className="p-6 text-center screen-text" style={{ fontSize: '0.8rem' }}>
        Location "{locationId}" not found.
      </div>
    )
  }

  // Collect unique methods present at this location for the filter buttons
  const availableMethods = useMemo(() => {
    const seen = new Set()
    location.encounters.forEach(e => seen.add(formatMethod(e.method)))
    return [...seen]
  }, [location])

  // Collect unique times of day (excluding 'all' entries which always show)
  const availableTimes = useMemo(() => {
    const seen = new Set()
    location.encounters.forEach(e => {
      if (e.time_of_day !== 'all') seen.add(e.time_of_day)
    })
    return [...seen]
  }, [location])

  const filtered = useMemo(() => {
    return location.encounters.filter(enc => {
      if (methodFilter && formatMethod(enc.method) !== methodFilter) return false
      if (timeFilter && enc.time_of_day !== 'all' && enc.time_of_day !== timeFilter) return false
      return true
    })
  }, [location, methodFilter, timeFilter])

  // Deduplicate then sort
  const deduped = useMemo(() => {
    const seen = new Set()
    let list = filtered.filter(enc => {
      const key = `${enc.pokemon_id}-${enc.method}-${enc.time_of_day}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    if (sortCol) {
      const dir = sortDir === 'asc' ? 1 : -1
      list = [...list].sort((a, b) => {
        switch (sortCol) {
          case 'name':   return a.pokemon_name.localeCompare(b.pokemon_name) * dir
          case 'method': return formatMethod(a.method).localeCompare(formatMethod(b.method)) * dir
          case 'level':  return ((a.level_range[0] ?? 0) - (b.level_range[0] ?? 0)) * dir
          case 'rate':   return ((a.rate_percent ?? 0) - (b.rate_percent ?? 0)) * dir
          case 'time':   return (a.time_of_day ?? '').localeCompare(b.time_of_day ?? '') * dir
          default:       return 0
        }
      })
    }

    return list
  }, [filtered, sortCol, sortDir])

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          color: 'var(--screen-green-dim)',
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
      >
        ‹ Back
      </button>

      <div className="px-4 pb-4">
        {/* Header */}
        <div className="screen p-3 mb-4">
          <h2 className="pixel-text text-white" style={{ fontSize: '0.6rem' }}>
            {location.name.toUpperCase()}
          </h2>
          <p className="screen-text-dim mt-1" style={{ fontSize: '0.7rem', fontFamily: '"Share Tech Mono", monospace' }}>
            {new Set(location.encounters.map(e => e.pokemon_id)).size} Pokémon available
          </p>
        </div>

        {/* Filters */}
        {(availableMethods.length > 1 || availableTimes.length > 0) && (
          <div className="mb-3">
            {/* Method filter */}
            {availableMethods.length > 1 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {availableMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => setMethodFilter(m => m === method ? null : method)}
                    style={{
                      fontSize: '0.62rem',
                      fontFamily: '"Share Tech Mono", monospace',
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: methodFilter === method ? 'var(--dex-red)' : 'var(--screen-bg)',
                      color: methodFilter === method ? 'white' : 'var(--screen-green-dim)',
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            )}

            {/* Time of day filter */}
            {availableTimes.length > 0 && (
              <div className="flex gap-1">
                {availableTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setTimeFilter(t => t === time ? null : time)}
                    style={{
                      fontSize: '0.62rem',
                      fontFamily: '"Share Tech Mono", monospace',
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      backgroundColor: timeFilter === time ? 'var(--dex-red)' : 'var(--screen-bg)',
                      color: timeFilter === time ? 'white' : 'var(--screen-green-dim)',
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Encounter table */}
        <div className="screen overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Share Tech Mono", monospace' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--screen-green-dim)' }}>
                {/* Sprite column — not sortable */}
                <th style={{ width: 36 }} />
                {SORT_COLS.map(col => {
                  const isActive = sortCol === col.key
                  const arrow = isActive ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
                  const isCenter = ['level', 'rate', 'time'].includes(col.key)
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleColSort(col.key)}
                      style={{
                        padding: '6px 4px',
                        fontSize: '0.6rem',
                        color: isActive ? 'var(--screen-green)' : 'var(--screen-green-dim)',
                        textAlign: isCenter ? 'center' : 'left',
                        cursor: 'pointer',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label}{arrow}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {deduped.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: 'center', color: 'var(--screen-green-dim)', fontSize: '0.75rem' }}>
                    No encounters match the selected filters.
                  </td>
                </tr>
              ) : (
                deduped.map((enc, i) => {
                  const poke = pokemonByName.get(enc.pokemon_id)
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dex-border)' }}>
                      {/* Sprite */}
                      <td style={{ padding: '4px 6px', width: 36 }}>
                        {poke && (
                          <Link to={`/pokemon/${poke.regional_dex}`}>
                            <img
                              src={spriteUrl(poke.national_dex)}
                              alt={enc.pokemon_name}
                              className="sprite"
                              style={{ width: 32, height: 32 }}
                              loading="lazy"
                            />
                          </Link>
                        )}
                      </td>
                      {/* Name */}
                      <td style={{ padding: '4px 4px' }}>
                        {poke ? (
                          <Link
                            to={`/pokemon/${poke.regional_dex}`}
                            style={{ color: 'var(--screen-green)', fontSize: '0.75rem', textDecoration: 'none' }}
                          >
                            {enc.pokemon_name}
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--screen-green)', fontSize: '0.75rem' }}>
                            {enc.pokemon_name}
                          </span>
                        )}
                        {enc.special && (
                          <div style={{ fontSize: '0.55rem', color: 'var(--dex-red-light)' }}>
                            [{enc.special}]
                          </div>
                        )}
                      </td>
                      {/* Method */}
                      <td style={{ padding: '4px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem' }}>
                        {formatMethod(enc.method)}
                      </td>
                      {/* Level range */}
                      <td style={{ padding: '4px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {enc.level_range[0] === enc.level_range[1]
                          ? enc.level_range[0]
                          : `${enc.level_range[0]}–${enc.level_range[1]}`}
                      </td>
                      {/* Encounter rate */}
                      <td style={{ padding: '4px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center' }}>
                        {enc.rate_percent != null ? `${enc.rate_percent}%` : '—'}
                      </td>
                      {/* Time of day */}
                      <td style={{ padding: '4px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center', textTransform: 'capitalize' }}>
                        {enc.time_of_day === 'all' ? '—' : enc.time_of_day}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
