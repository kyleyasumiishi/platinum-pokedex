import { locationList } from '../utils/dataLoader'

export default function RoutesPage() {
  return (
    <div className="p-4">
      <div className="screen p-3 mb-4">
        <p className="screen-text pixel-text" style={{ fontSize: '0.5rem' }}>
          ROUTES — {locationList.length} LOCATIONS
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {locationList.map(([id, loc]) => (
          <div key={id} className="dex-card p-3">
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1a1a2e' }}>
              {loc.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>
              {loc.encounters.length} encounter{loc.encounters.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
