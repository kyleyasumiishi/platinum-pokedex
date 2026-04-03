/**
 * StatsChart.jsx — Horizontal bar chart for a Pokémon's base stats.
 *
 * Each stat bar is a div whose width is set as a percentage of 255
 * (the maximum possible base stat in Gen 4). Color goes from red
 * (low stats) to yellow (mid) to green (high), using a CSS linear
 * interpolation trick via the hsl color model.
 *
 * Props:
 *   stats (object) — { hp, attack, defense, sp_atk, sp_def, speed }
 *   total (number) — base stat total
 */

const STAT_LABELS = {
  hp:      'HP',
  attack:  'ATK',
  defense: 'DEF',
  sp_atk:  'SpA',
  sp_def:  'SpD',
  speed:   'SPE',
}

const MAX_STAT = 255

function statColor(value) {
  // hsl: 0° = red, 60° = yellow, 120° = green
  // Map 0–255 to 0°–120°
  const hue = Math.round((value / MAX_STAT) * 120)
  return `hsl(${hue}, 80%, 45%)`
}

export default function StatsChart({ stats, total }) {
  return (
    <div style={{ fontFamily: '"Share Tech Mono", monospace' }}>
      {Object.entries(STAT_LABELS).map(([key, label]) => {
        const value = stats[key] ?? 0
        const pct   = Math.round((value / MAX_STAT) * 100)
        return (
          <div key={key} className="flex items-center gap-2 mb-1">
            {/* Stat label */}
            <span style={{ width: 30, fontSize: '0.65rem', color: 'var(--screen-green-dim)', flexShrink: 0 }}>
              {label}
            </span>
            {/* Stat value */}
            <span style={{ width: 28, fontSize: '0.75rem', color: 'var(--screen-green)', textAlign: 'right', flexShrink: 0 }}>
              {value}
            </span>
            {/* Bar track */}
            <div
              style={{
                flex: 1,
                height: 8,
                backgroundColor: 'var(--screen-bg)',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid var(--dex-border)',
              }}
            >
              {/* Bar fill */}
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: statColor(value),
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        )
      })}
      {/* Base stat total */}
      <div
        className="flex justify-end mt-2 pt-2"
        style={{ borderTop: '1px solid var(--dex-border)', fontSize: '0.7rem' }}
      >
        <span style={{ color: 'var(--screen-green-dim)' }}>TOTAL&nbsp;</span>
        <span style={{ color: 'var(--screen-green)', fontWeight: 'bold' }}>{total}</span>
      </div>
    </div>
  )
}
