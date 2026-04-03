/**
 * MoveTable.jsx — Pokémon's moves, organized into 4 sub-tabs.
 *
 * The active tab is tracked with a single useState string.
 * We look up full move details from the moves index in dataLoader.
 * Move names are Links to /moves/:moveId for cross-navigation.
 *
 * Props:
 *   pokemonMoves (object) — { level_up: [...], tm_hm: [...], tutor: [...], egg: [...] }
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { moves } from '../../utils/dataLoader'
import TypeBadge from '../shared/TypeBadge'

const TABS = [
  { key: 'level_up', label: 'Level Up' },
  { key: 'tm_hm',    label: 'TM/HM'    },
  { key: 'tutor',    label: 'Tutor'     },
  { key: 'egg',      label: 'Egg'       },
]

const CATEGORY_ICONS = {
  Physical: '⚔️',
  Special:  '✨',
  Status:   '💫',
}

function MoveRow({ moveId, level }) {
  const move = moves[moveId]
  if (!move) return null

  return (
    <tr style={{ borderBottom: '1px solid var(--dex-border)' }}>
      {level !== undefined && (
        <td style={{ padding: '5px 6px', color: 'var(--screen-green)', fontSize: '0.7rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
          {level === 0 ? '—' : level}
        </td>
      )}
      <td style={{ padding: '5px 6px' }}>
        <Link
          to={`/moves/${moveId}`}
          style={{ color: 'var(--screen-green)', fontSize: '0.75rem', textDecoration: 'none' }}
        >
          {move.name}
        </Link>
      </td>
      <td style={{ padding: '5px 4px' }}>
        <TypeBadge type={move.type} small />
      </td>
      <td style={{ padding: '5px 4px', fontSize: '0.7rem', color: '#aaa', textAlign: 'center' }}>
        {CATEGORY_ICONS[move.category] ?? ''}
      </td>
      <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center' }}>
        {move.power ?? '—'}
      </td>
      <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center' }}>
        {move.accuracy ?? '—'}
      </td>
      <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center' }}>
        {move.pp ?? '—'}
      </td>
    </tr>
  )
}

export default function MoveTable({ pokemonMoves }) {
  const [activeTab, setActiveTab] = useState('level_up')

  const tabCounts = {
    level_up: pokemonMoves.level_up.length,
    tm_hm:    pokemonMoves.tm_hm.length,
    tutor:    pokemonMoves.tutor.length,
    egg:      pokemonMoves.egg.length,
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              fontSize: '0.6rem',
              fontFamily: '"Share Tech Mono", monospace',
              padding: '4px 2px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.key ? 'var(--dex-red)' : 'var(--screen-bg)',
              color: activeTab === tab.key ? 'white' : 'var(--screen-green-dim)',
            }}
          >
            {tab.label} ({tabCounts[tab.key]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Share Tech Mono", monospace' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--screen-green-dim)' }}>
              {activeTab === 'level_up' && (
                <th style={{ padding: '4px 6px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>LV</th>
              )}
              <th style={{ padding: '4px 6px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'left' }}>Move</th>
              <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)' }}>Type</th>
              <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>Cat</th>
              <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>Pwr</th>
              <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>Acc</th>
              <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>PP</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'level_up' && pokemonMoves.level_up.map(entry => (
              <MoveRow key={entry.move_id} moveId={entry.move_id} level={entry.level} />
            ))}
            {activeTab === 'tm_hm' && pokemonMoves.tm_hm.map(id => (
              <MoveRow key={id} moveId={id} />
            ))}
            {activeTab === 'tutor' && pokemonMoves.tutor.map(id => (
              <MoveRow key={id} moveId={id} />
            ))}
            {activeTab === 'egg' && pokemonMoves.egg.map(id => (
              <MoveRow key={id} moveId={id} />
            ))}
          </tbody>
        </table>
        {tabCounts[activeTab] === 0 && (
          <p style={{ color: 'var(--screen-green-dim)', fontSize: '0.75rem', textAlign: 'center', padding: '12px' }}>
            None
          </p>
        )}
      </div>
    </div>
  )
}
