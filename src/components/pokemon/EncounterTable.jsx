/**
 * EncounterTable.jsx — Where to find this Pokémon in Platinum.
 *
 * Location names are Links to /routes/:locationId.
 *
 * Props:
 *   encounters (array) — from pokemon.json encounters array
 */
import { Link } from 'react-router-dom'

const METHOD_LABELS = {
  'walk':           'Grass',
  'tall-grass':     'Tall Grass',
  'surf':           'Surfing',
  'old-rod':        'Old Rod',
  'good-rod':       'Good Rod',
  'super-rod':      'Super Rod',
  'rock-smash':     'Rock Smash',
  'headbutt':       'Headbutt',
  'gift':           'Gift',
  'pokeradar':      'PokéRadar',
}

function formatMethod(method) {
  return METHOD_LABELS[method] ?? method.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatLocation(locationId) {
  return locationId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function EncounterTable({ encounters }) {
  if (!encounters || encounters.length === 0) {
    return (
      <p style={{ color: 'var(--screen-green-dim)', fontSize: '0.75rem', textAlign: 'center', padding: '8px' }}>
        Not found in the wild in Platinum.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Share Tech Mono", monospace' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--screen-green-dim)' }}>
            <th style={{ padding: '4px 6px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'left' }}>Location</th>
            <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'left' }}>Method</th>
            <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>Lvl</th>
            <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>%</th>
            <th style={{ padding: '4px 4px', fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {encounters.map((enc, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--dex-border)' }}>
              <td style={{ padding: '5px 6px' }}>
                <Link
                  to={`/routes/${enc.location}`}
                  style={{ color: 'var(--screen-green)', fontSize: '0.7rem', textDecoration: 'none' }}
                >
                  {formatLocation(enc.location)}
                </Link>
                {enc.special && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--dex-red-light)', marginLeft: 4 }}>
                    [{enc.special}]
                  </span>
                )}
              </td>
              <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem' }}>
                {formatMethod(enc.method)}
              </td>
              <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {enc.level_range[0] === enc.level_range[1]
                  ? enc.level_range[0]
                  : `${enc.level_range[0]}–${enc.level_range[1]}`}
              </td>
              <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center' }}>
                {enc.rate_percent != null ? `${enc.rate_percent}%` : '—'}
              </td>
              <td style={{ padding: '5px 4px', color: 'var(--screen-green-dim)', fontSize: '0.7rem', textAlign: 'center', textTransform: 'capitalize' }}>
                {enc.time_of_day === 'all' ? '—' : enc.time_of_day}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
