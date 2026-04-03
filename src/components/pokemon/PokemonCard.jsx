/**
 * PokemonCard.jsx — A single Pokémon list item card.
 *
 * Tapping navigates to the detail view via React Router's Link component.
 * Link renders an <a> tag under the hood but intercepts the click to do
 * client-side navigation (no full page reload).
 *
 * Props:
 *   pokemon (object) — one entry from pokemon.json
 */
import { Link } from 'react-router-dom'
import TypeBadge from '../shared/TypeBadge'
import { spriteUrl } from '../../utils/dataLoader'

export default function PokemonCard({ pokemon: p }) {
  return (
    <Link
      to={`/pokemon/${p.sinnoh_dex}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="dex-card flex items-center gap-3 px-3 py-2"
        style={{ minHeight: 64 }}
      >
        {/* Sprite */}
        <img
          src={spriteUrl(p.national_dex)}
          alt={p.name}
          className="sprite flex-shrink-0"
          style={{ width: 52, height: 52 }}
          loading="lazy"
        />

        {/* Dex number + name */}
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: '"Share Tech Mono", monospace' }}>
            #{String(p.sinnoh_dex).padStart(3, '0')}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1a1a2e', lineHeight: 1.2 }}>
            {p.name}
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {p.types.map(t => (
              <TypeBadge key={t} type={t} small />
            ))}
          </div>
        </div>

        {/* Arrow hint */}
        <span style={{ color: '#ccc', fontSize: '0.8rem', flexShrink: 0 }}>›</span>
      </div>
    </Link>
  )
}
