import { moves } from '../utils/dataLoader'

const moveList = Object.entries(moves).sort((a, b) => a[1].name.localeCompare(b[1].name))

export default function MovesPage() {
  return (
    <div className="p-4">
      <div className="screen p-3 mb-4">
        <p className="screen-text pixel-text" style={{ fontSize: '0.5rem' }}>
          MOVES — {moveList.length} MOVES
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {moveList.map(([id, move]) => (
          <div key={id} className="dex-card p-3 flex items-center gap-3">
            <span
              className={`type-badge type-${move.type.toLowerCase()}`}
              style={{ minWidth: 60, textAlign: 'center' }}
            >
              {move.type}
            </span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                {move.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>
                {move.category} · PWR {move.power ?? '—'} · ACC {move.accuracy ?? '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
