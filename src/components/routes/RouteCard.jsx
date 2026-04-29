/**
 * RouteCard.jsx — A single row in the route list.
 *
 * Shows the location name, total encounter count, and a summary of
 * encounter methods available (e.g. "Grass · Surf · Good Rod").
 *
 * Props:
 *   locationId (string) — the location's key in locations.json
 *   location   (object) — { name, encounters: [...] }
 */
import { Link } from 'react-router-dom'
import { useGenerationContext } from '../../context/GenerationContext'

function summarizeMethods(encounters) {
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
  const seen = new Set()
  encounters.forEach(e => {
    const label = METHOD_LABELS[e.method] ?? e.method.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    seen.add(label)
  })
  return [...seen].join(' · ')
}

export default function RouteCard({ locationId, location }) {
  const { activeGen } = useGenerationContext()
  const uniquePokemon = new Set(location.encounters.map(e => e.pokemon_id)).size

  return (
    <Link to={`/gen${activeGen}/routes/${locationId}`} style={{ textDecoration: 'none' }}>
      <div className="dex-card flex items-center gap-3 px-3 py-2" style={{ minHeight: 56 }}>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a2e' }}>
            {location.name}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: '"Share Tech Mono", monospace', marginTop: 2 }}>
            {summarizeMethods(location.encounters)}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: '"Share Tech Mono", monospace' }}>Pokémon</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1a1a2e', fontFamily: '"Share Tech Mono", monospace' }}>
            {uniquePokemon}
          </div>
        </div>

        <span style={{ color: '#ccc', fontSize: '0.8rem', flexShrink: 0 }}>›</span>
      </div>
    </Link>
  )
}
