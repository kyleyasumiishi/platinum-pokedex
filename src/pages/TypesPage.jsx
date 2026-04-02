import { typeChart } from '../utils/dataLoader'

const TYPES = typeChart.types

const CELL_COLORS = {
  2:   { bg: '#1a5c1a', text: '#00ff41' },   // super effective — green
  0.5: { bg: '#5c1a1a', text: '#ff6666' },   // not very effective — red
  0:   { bg: '#111',    text: '#555'     },   // immune — dark
  1:   { bg: 'transparent', text: '#aaa' },  // neutral
}

export default function TypesPage() {
  return (
    <div className="p-4">
      <div className="screen p-3 mb-4">
        <p className="screen-text pixel-text" style={{ fontSize: '0.5rem' }}>
          TYPE CHART — GEN 4
        </p>
      </div>
      <p className="screen-text-dim mb-3" style={{ fontSize: '0.7rem' }}>
        Row = attacking · Column = defending
      </p>
      <div className="screen overflow-auto">
        <table style={{ borderCollapse: 'collapse', fontSize: '0.55rem', fontFamily: '"Share Tech Mono", monospace' }}>
          <thead>
            <tr>
              <th style={{ width: 36, padding: '4px 2px', color: '#666' }}>ATK↓</th>
              {TYPES.map(t => (
                <th
                  key={t}
                  className={`type-badge type-${t.toLowerCase()}`}
                  style={{ padding: '4px 3px', writingMode: 'vertical-rl', textOrientation: 'mixed', minWidth: 24 }}
                >
                  {t.slice(0, 3).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPES.map(atk => (
              <tr key={atk}>
                <td
                  className={`type-badge type-${atk.toLowerCase()}`}
                  style={{ padding: '3px 4px', whiteSpace: 'nowrap' }}
                >
                  {atk.slice(0, 3).toUpperCase()}
                </td>
                {TYPES.map(def => {
                  const val = typeChart.matrix[atk][def]
                  const style = CELL_COLORS[val] ?? CELL_COLORS[1]
                  return (
                    <td
                      key={def}
                      style={{
                        textAlign: 'center',
                        padding: '3px 2px',
                        backgroundColor: style.bg,
                        color: style.text,
                        border: '1px solid #222',
                      }}
                    >
                      {val === 1 ? '' : val === 0 ? '0' : val === 2 ? '2' : '½'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
