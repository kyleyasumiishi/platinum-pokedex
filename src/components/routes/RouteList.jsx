/**
 * RouteList.jsx — Searchable list of all 154 Sinnoh locations.
 *
 * Sorted alphabetically. Search matches on the location's display name.
 */
import { useState, useMemo } from 'react'
import { useDataset } from '../../utils/dataLoader'
import RouteCard from './RouteCard'

export default function RouteList() {
  const [query, setQuery] = useState('')
  const { locationList } = useDataset()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locationList
    return locationList.filter(([, loc]) => loc.name.toLowerCase().includes(q))
  }, [locationList, query])

  return (
    <div>
      <div
        className="sticky top-0 z-10 px-3 pt-3 pb-2"
        style={{ backgroundColor: 'var(--screen-bg-alt)' }}
      >
        <input
          type="search"
          placeholder="Search locations..."
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
        <div className="mt-1 screen-text-dim" style={{ fontSize: '0.65rem', textAlign: 'right' }}>
          {filtered.length} / {locationList.length}
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="screen p-6 text-center screen-text" style={{ fontSize: '0.75rem' }}>
            No locations found.
          </div>
        ) : (
          filtered.map(([id, loc]) => (
            <RouteCard key={id} locationId={id} location={loc} />
          ))
        )}
      </div>
    </div>
  )
}
