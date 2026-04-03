/**
 * TypeMatchups.jsx — Defensive type matchups for a Pokémon.
 *
 * Groups types by damage multiplier: 4x, 2x, 0.5x, 0.25x, 0x.
 * Only shows groups that have at least one type in them.
 *
 * Props:
 *   matchups (object) — from pokemon.json type_matchups field
 *     { weak_to_4x, weak_to_2x, resistant_0_5x, resistant_0_25x, immune_to }
 */
import TypeBadge from '../shared/TypeBadge'

const GROUPS = [
  { key: 'weak_to_4x',      label: '4× Weak',     color: '#ff4444' },
  { key: 'weak_to_2x',      label: '2× Weak',     color: '#ff8844' },
  { key: 'resistant_0_5x',  label: '½× Resist',   color: '#4488ff' },
  { key: 'resistant_0_25x', label: '¼× Resist',   color: '#2266cc' },
  { key: 'immune_to',       label: '0× Immune',   color: '#666'    },
]

export default function TypeMatchups({ matchups }) {
  if (!matchups) return null

  const hasAny = GROUPS.some(g => matchups[g.key]?.length > 0)
  if (!hasAny) return (
    <p style={{ color: 'var(--screen-green-dim)', fontSize: '0.75rem', textAlign: 'center' }}>
      No notable weaknesses or resistances.
    </p>
  )

  return (
    <div style={{ fontFamily: '"Share Tech Mono", monospace' }}>
      {GROUPS.map(group => {
        const types = matchups[group.key]
        if (!types || types.length === 0) return null
        return (
          <div key={group.key} className="flex items-start gap-2 mb-2">
            <span style={{ fontSize: '0.6rem', color: group.color, minWidth: 72, flexShrink: 0, paddingTop: 2 }}>
              {group.label}
            </span>
            <div className="flex flex-wrap gap-1">
              {types.map(t => <TypeBadge key={t} type={t} small />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
