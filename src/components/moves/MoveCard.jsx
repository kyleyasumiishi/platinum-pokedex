/**
 * MoveCard.jsx — A single row in the move list.
 *
 * Props:
 *   moveId (string) — the move's key in moves.json (e.g. 'dragon-claw')
 *   move   (object) — the move's data object
 */
import { Link } from 'react-router-dom'
import TypeBadge from '../shared/TypeBadge'
import { useGenerationContext } from '../../context/GenerationContext'

const CATEGORY_ICONS = {
  Physical: '⚔️',
  Special:  '✨',
  Status:   '💫',
}

export default function MoveCard({ moveId, move }) {
  const { activeGen } = useGenerationContext()
  return (
    <Link to={`/gen${activeGen}/moves/${moveId}`} style={{ textDecoration: 'none' }}>
      <div
        className="dex-card flex items-center gap-3 px-3 py-2"
        style={{ minHeight: 52 }}
      >
        {/* Type badge */}
        <TypeBadge type={move.type} />

        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a2e' }}>
            {move.name}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: '"Share Tech Mono", monospace' }}>
            {CATEGORY_ICONS[move.category]} {move.category}
          </div>
        </div>

        {/* Power */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: '"Share Tech Mono", monospace' }}>PWR</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1a1a2e', fontFamily: '"Share Tech Mono", monospace' }}>
            {move.power ?? '—'}
          </div>
        </div>

        <span style={{ color: '#ccc', fontSize: '0.8rem', flexShrink: 0 }}>›</span>
      </div>
    </Link>
  )
}
