import { pokemon } from '../utils/dataLoader'
import { spriteUrl } from '../utils/dataLoader'

export default function PokedexPage() {
  return (
    <div className="p-4">
      <div className="screen p-3 mb-4">
        <p className="screen-text pixel-text" style={{ fontSize: '0.5rem' }}>
          SINNOH DEX — {pokemon.length} POKÉMON
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {pokemon.map(p => (
          <div key={p.sinnoh_dex} className="dex-card p-2 text-center">
            <img
              src={spriteUrl(p.national_dex)}
              alt={p.name}
              className="sprite mx-auto"
              style={{ width: 64, height: 64 }}
              loading="lazy"
            />
            <div style={{ fontSize: '0.6rem', color: '#888' }}>#{String(p.sinnoh_dex).padStart(3, '0')}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1a1a2e' }}>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
