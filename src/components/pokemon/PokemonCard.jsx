/**
 * PokemonCard.jsx — A single Pokémon list item card.
 *
 * The Master Ball button sits outside the Link so tapping it doesn't
 * navigate to the detail page — it just toggles the team. We stop the
 * click event from bubbling up to the Link with e.stopPropagation()
 * (otherwise the tap would both toggle AND navigate).
 */
import { Link } from 'react-router-dom'
import TypeBadge from '../shared/TypeBadge'
import { spriteUrl } from '../../utils/dataLoader'
import { useTeamContext } from '../../context/TeamContext'

const MASTER_BALL_URL = `${import.meta.env.BASE_URL}sprites/items/master-ball.png`

export default function PokemonCard({ pokemon: p }) {
  const { isOnTeam, toggleTeam } = useTeamContext()
  const pinned = isOnTeam(p.regional_dex)

  return (
    <div className="dex-card flex items-center gap-3 px-3 py-2" style={{ minHeight: 64 }}>
      <Link to={`/pokemon/${p.regional_dex}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Sprite */}
        <img
          src={spriteUrl(p.national_dex)}
          alt={p.name}
          className="sprite flex-shrink-0"
          style={{ width: 52, height: 52 }}
          loading="lazy"
        />

        {/* Dex number + name + types */}
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: '"Share Tech Mono", monospace' }}>
            #{String(p.regional_dex).padStart(3, '0')}
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
      </Link>

      {/* Master Ball toggle — outside Link so it doesn't navigate */}
      <button
        onClick={e => { e.stopPropagation(); toggleTeam(p.regional_dex) }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
          opacity: pinned ? 1 : 0.25,
          transition: 'opacity 0.15s',
        }}
        title={pinned ? 'Remove from team' : 'Add to team'}
      >
        <img src={MASTER_BALL_URL} alt="Master Ball" style={{ width: 24, height: 24 }} />
      </button>
    </div>
  )
}
