/**
 * TypeChart.jsx — Interactive 17x17 Gen 4 type effectiveness grid.
 *
 * STATE:
 *   selectedType (string | null) — the type whose row+column is highlighted.
 *   Tapping a type header sets it; tapping it again clears it.
 *
 * HIGHLIGHT LOGIC:
 *   When a type is selected:
 *   - Its header cells (row label + column label) glow white
 *   - Cells in its row (attacking) and column (defending) are full opacity
 *   - All other cells are dimmed to 20% opacity
 *   This lets you see both offensive and defensive coverage at a glance.
 *
 * CELL COLORS:
 *   2x   → green background  (super effective)
 *   0.5x → red background    (not very effective)
 *   0x   → dark/gray         (immune)
 *   1x   → transparent       (neutral, no value shown)
 */
import { useState } from 'react'
import { useDataset } from '../../utils/dataLoader'
import { useGenerationContext } from '../../context/GenerationContext'

// Cell background and text colors by effectiveness multiplier
const CELL_STYLE = {
  2:   { bg: '#1a5c1a', text: '#00ff41', label: '2'  },
  0.5: { bg: '#5c1a1a', text: '#ff6666', label: '½'  },
  0:   { bg: '#111',    text: '#444',    label: '0'  },
  1:   { bg: 'transparent', text: 'transparent', label: '' },
}

// Official type colors for the header badges
const TYPE_COLORS = {
  Normal:   '#A8A878', Fire:     '#F08030', Water:    '#6890F0',
  Electric: '#F8D030', Grass:    '#78C850', Ice:      '#98D8D8',
  Fighting: '#C03028', Poison:   '#A040A0', Ground:   '#E0C068',
  Flying:   '#A890F0', Psychic:  '#F85888', Bug:      '#A8B820',
  Rock:     '#B8A038', Ghost:    '#705898', Dragon:   '#7038F8',
  Dark:     '#705848', Steel:    '#B8B8D0',
}

const LIGHT_TEXT_TYPES = new Set(['Electric', 'Ice', 'Ground', 'Steel'])

export default function TypeChart() {
  const [selectedType, setSelectedType] = useState(null)
  const { typeChart } = useDataset()
  const { activeGen } = useGenerationContext()
  const TYPES = typeChart.types

  function handleTypeClick(type) {
    setSelectedType(prev => prev === type ? null : type)
  }

  function cellOpacity(atkType, defType) {
    if (!selectedType) return 1
    return (atkType === selectedType || defType === selectedType) ? 1 : 0.15
  }

  function headerOpacity(type, role) {
    // role: 'atk' (row header) or 'def' (col header)
    if (!selectedType) return 1
    return type === selectedType ? 1 : 0.25
  }

  return (
    <div className="px-3 pb-4">
      {/* Instructions */}
      <div className="screen p-3 mb-3">
        <p className="screen-text pixel-text" style={{ fontSize: '0.45rem', lineHeight: 2 }}>
          TYPE CHART — GEN {activeGen}
        </p>
        <p className="screen-text-dim mt-1" style={{ fontSize: '0.65rem', fontFamily: '"Share Tech Mono", monospace' }}>
          Row = attacking · Col = defending
        </p>
        {selectedType ? (
          <p className="screen-text mt-1" style={{ fontSize: '0.65rem', fontFamily: '"Share Tech Mono", monospace' }}>
            Showing: <strong>{selectedType}</strong> — tap again to clear
          </p>
        ) : (
          <p className="screen-text-dim mt-1" style={{ fontSize: '0.65rem', fontFamily: '"Share Tech Mono", monospace' }}>
            Tap a type to highlight its row &amp; column
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-3 flex-wrap" style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.65rem' }}>
        {[
          { label: '2×  Super effective', bg: '#1a5c1a', text: '#00ff41' },
          { label: '½×  Not very effective', bg: '#5c1a1a', text: '#ff6666' },
          { label: '0×  Immune',           bg: '#111',    text: '#444'    },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span style={{
              display: 'inline-block', width: 16, height: 16,
              backgroundColor: item.bg, border: '1px solid #333', borderRadius: 2, flexShrink: 0,
            }} />
            <span style={{ color: 'var(--screen-green-dim)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.55rem',
          }}
        >
          <thead>
            <tr>
              {/* Top-left corner cell */}
              <th style={{ width: 28, minWidth: 28 }} />

              {/* Defending type column headers */}
              {TYPES.map(defType => {
                const isSelected = defType === selectedType
                return (
                  <th
                    key={defType}
                    onClick={() => handleTypeClick(defType)}
                    style={{
                      minWidth: 22,
                      padding: '3px 2px',
                      cursor: 'pointer',
                      opacity: headerOpacity(defType, 'def'),
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        backgroundColor: TYPE_COLORS[defType],
                        color: LIGHT_TEXT_TYPES.has(defType) ? '#333' : 'white',
                        padding: '4px 3px',
                        borderRadius: 3,
                        fontWeight: 'bold',
                        outline: isSelected ? '2px solid white' : 'none',
                        outlineOffset: 1,
                      }}
                    >
                      {defType.slice(0, 3).toUpperCase()}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {TYPES.map(atkType => {
              const isSelectedRow = atkType === selectedType
              return (
                <tr key={atkType}>
                  {/* Attacking type row header */}
                  <td
                    onClick={() => handleTypeClick(atkType)}
                    style={{
                      padding: '2px 4px',
                      cursor: 'pointer',
                      opacity: headerOpacity(atkType, 'atk'),
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: TYPE_COLORS[atkType],
                        color: LIGHT_TEXT_TYPES.has(atkType) ? '#333' : 'white',
                        padding: '2px 4px',
                        borderRadius: 3,
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        outline: isSelectedRow ? '2px solid white' : 'none',
                        outlineOffset: 1,
                      }}
                    >
                      {atkType.slice(0, 3).toUpperCase()}
                    </div>
                  </td>

                  {/* Effectiveness cells */}
                  {TYPES.map(defType => {
                    const val = typeChart.matrix[atkType][defType]
                    const style = CELL_STYLE[val] ?? CELL_STYLE[1]
                    return (
                      <td
                        key={defType}
                        style={{
                          textAlign: 'center',
                          padding: '2px',
                          backgroundColor: style.bg,
                          color: style.text,
                          border: '1px solid #1a1a2e',
                          fontWeight: 'bold',
                          opacity: cellOpacity(atkType, defType),
                          transition: 'opacity 0.15s',
                          minWidth: 22,
                          height: 22,
                        }}
                      >
                        {style.label}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
