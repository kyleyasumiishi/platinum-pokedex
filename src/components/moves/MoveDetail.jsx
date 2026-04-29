/**
 * MoveDetail.jsx — Full detail view for a single move.
 *
 * URL: /moves/:moveId
 *
 * The "Learned by" section groups Pokémon by learn method.
 * We cross-reference with pokemonByName to get each Pokémon's regional_dex
 * so we can build the link to /pokemon/:regionalDex.
 */
import { useParams, useNavigate, Link } from 'react-router-dom'
import { moves, pokemonByName, spriteUrl } from '../../utils/dataLoader'
import TypeBadge from '../shared/TypeBadge'

const CATEGORY_ICONS = {
  Physical: '⚔️',
  Special:  '✨',
  Status:   '💫',
}

const LEARN_METHOD_LABELS = {
  level_up: 'Level Up',
  tm_hm:    'TM / HM',
  tutor:    'Move Tutor',
  egg:      'Egg Move',
}

function LearnedByGroup({ label, entries, showLevel }) {
  if (!entries || Object.keys(entries).length === 0) return null

  // Sort by level (for level-up), then alphabetically
  const sorted = Object.entries(entries).sort((a, b) => {
    if (showLevel) return (a[1] - b[1]) || a[0].localeCompare(b[0])
    return a[0].localeCompare(b[0])
  })

  return (
    <div className="mb-4">
      <div
        style={{
          fontSize: '0.65rem',
          color: 'var(--screen-green-dim)',
          fontFamily: '"Share Tech Mono", monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 6,
          borderBottom: '1px solid var(--dex-border)',
          paddingBottom: 4,
        }}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([name, levelOrTrue]) => {
          const poke = pokemonByName.get(name)
          if (!poke) return null
          return (
            <Link
              key={name}
              to={`/pokemon/${poke.regional_dex}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="dex-card flex flex-col items-center p-2"
                style={{ minWidth: 64 }}
              >
                <img
                  src={spriteUrl(poke.national_dex)}
                  alt={poke.name}
                  className="sprite"
                  style={{ width: 40, height: 40 }}
                  loading="lazy"
                />
                {showLevel && (
                  <div style={{ fontSize: '0.55rem', color: '#888', fontFamily: '"Share Tech Mono", monospace' }}>
                    Lv {levelOrTrue}
                  </div>
                )}
                <div style={{ fontSize: '0.6rem', color: '#1a1a2e', textAlign: 'center', lineHeight: 1.2 }}>
                  {poke.name}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function MoveDetail() {
  const { moveId } = useParams()
  const navigate   = useNavigate()
  const move       = moves[moveId]

  if (!move) {
    return (
      <div className="p-6 text-center screen-text" style={{ fontSize: '0.8rem' }}>
        Move "{moveId}" not found.
      </div>
    )
  }

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

      {/* Move header */}
      <div className="px-4 pb-4">
        <div className="screen p-4 mb-3">
          <h2 className="pixel-text text-white mb-3" style={{ fontSize: '0.65rem' }}>
            {move.name.toUpperCase()}
          </h2>

          {/* Type + category row */}
          <div className="flex items-center gap-3 mb-3">
            <TypeBadge type={move.type} />
            <span style={{ fontSize: '0.75rem', color: 'var(--screen-green-dim)', fontFamily: '"Share Tech Mono", monospace' }}>
              {CATEGORY_ICONS[move.category]} {move.category}
            </span>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              fontFamily: '"Share Tech Mono", monospace',
            }}
          >
            {[
              ['PWR',  move.power    ?? '—'],
              ['ACC',  move.accuracy ?? '—'],
              ['PP',   move.pp       ?? '—'],
              ['PRI',  move.priority === 0 ? '0' : (move.priority > 0 ? `+${move.priority}` : move.priority)],
            ].map(([label, value]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--screen-green-dim)' }}>{label}</div>
                <div style={{ fontSize: '1rem', color: 'var(--screen-green)', fontWeight: 'bold' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Effect description */}
        {move.description && (
          <div
            className="screen p-3 mb-4 screen-text"
            style={{ fontSize: '0.75rem', lineHeight: 1.6 }}
          >
            {move.description}
          </div>
        )}

        {/* Learned by */}
        <div
          className="section-header"
          style={{ marginBottom: 10, cursor: 'default' }}
        >
          LEARNED BY
        </div>

        <LearnedByGroup
          label={LEARN_METHOD_LABELS.level_up}
          entries={move.learned_by.level_up}
          showLevel
        />
        <LearnedByGroup
          label={LEARN_METHOD_LABELS.tm_hm}
          entries={move.learned_by.tm_hm}
          showLevel={false}
        />
        <LearnedByGroup
          label={LEARN_METHOD_LABELS.tutor}
          entries={move.learned_by.tutor}
          showLevel={false}
        />
        <LearnedByGroup
          label={LEARN_METHOD_LABELS.egg}
          entries={move.learned_by.egg}
          showLevel={false}
        />

        {Object.values(move.learned_by).every(g => Object.keys(g).length === 0) && (
          <p style={{ color: 'var(--screen-green-dim)', fontSize: '0.75rem', textAlign: 'center' }}>
            No Sinnoh dex Pokémon learn this move.
          </p>
        )}
      </div>
    </div>
  )
}
