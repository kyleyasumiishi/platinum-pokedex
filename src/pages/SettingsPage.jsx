import { useGenerationContext } from '../context/GenerationContext'

const GENS = [
  { gen: 4, label: 'SINNOH — PLATINUM' },
  { gen: 5, label: 'UNOVA — BLACK'     },
]

export default function SettingsPage() {
  const { activeGen, setActiveGen } = useGenerationContext()

  function handleSelect(gen) {
    if (gen === activeGen) return
    setActiveGen(gen)
  }

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Page header */}
      <div
        className="section-header mb-4"
        style={{ cursor: 'default' }}
      >
        SETTINGS
      </div>

      {/* Generation picker */}
      <div
        className="pixel-text screen-text mb-2"
        style={{ fontSize: '0.5rem', marginBottom: 8 }}
      >
        GENERATION
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {GENS.map(({ gen, label }) => {
          const isActive = gen === activeGen
          return (
            <button
              key={gen}
              onClick={() => handleSelect(gen)}
              aria-pressed={isActive}
              style={{
                width: '100%',
                height: 80,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 16px',
                borderRadius: 8,
                border: `2px solid ${isActive ? 'var(--dex-red)' : 'var(--screen-green-dim)'}`,
                backgroundColor: isActive ? 'var(--screen-bg)' : 'var(--screen-bg-alt)',
                cursor: isActive ? 'default' : 'pointer',
                opacity: isActive ? 1 : 0.55,
                transition: 'opacity 0.15s, border-color 0.15s',
                textAlign: 'left',
              }}
            >
              {/* LED indicator */}
              {isActive && (
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: gen === 5 ? '#41a7ff' : '#00ff41',
                    boxShadow: `0 0 6px ${gen === 5 ? '#41a7ff' : '#00ff41'}`,
                  }}
                />
              )}
              {!isActive && (
                <span style={{ width: 10, height: 10, flexShrink: 0 }} />
              )}

              <span
                className="pixel-text text-white"
                style={{ fontSize: '0.55rem' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* About card */}
      <div className="screen p-4">
        <div
          className="pixel-text text-white mb-2"
          style={{ fontSize: '0.5rem' }}
        >
          ABOUT
        </div>
        <p
          className="screen-text"
          style={{ fontSize: '0.7rem', lineHeight: 1.6 }}
        >
          Generation 4 (Platinum) and Generation 5 (Black) regional dex coverage.
        </p>
      </div>
    </div>
  )
}
