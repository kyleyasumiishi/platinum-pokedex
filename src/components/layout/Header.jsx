/**
 * Header.jsx — Top bar of the app.
 *
 * Subtitle and LED colour reflect the active generation so there's always a
 * clear signal which dex you're browsing. Gen 4 uses the classic green LED;
 * Gen 5 uses a subtle blue tint (#41a7ff) as a non-intrusive visual cue.
 */
import { useGenerationContext } from '../../context/GenerationContext'

const GEN_META = {
  4: { subtitle: 'SINNOH — PLATINUM', ledColor: '#00ff41' },
  5: { subtitle: 'UNOVA — BLACK',     ledColor: '#41a7ff' },
}

export default function Header() {
  const { activeGen } = useGenerationContext()
  const { subtitle, ledColor } = GEN_META[activeGen] ?? GEN_META[4]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-4"
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--dex-red)',
        borderBottom: '3px solid var(--dex-red-dark)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      {/* LED indicator — gen-dependent colour */}
      <span
        className="mr-3 rounded-full flex-shrink-0"
        style={{
          width: 10,
          height: 10,
          backgroundColor: ledColor,
          boxShadow: `0 0 6px ${ledColor}`,
          transition: 'background-color 0.3s, box-shadow 0.3s',
        }}
      />

      <h1
        className="pixel-text text-white tracking-wide"
        style={{ fontSize: '0.6rem' }}
      >
        POKÉDEX
      </h1>

      <span
        className="ml-2 screen-text-dim"
        style={{ fontSize: '0.55rem', fontFamily: '"Share Tech Mono", monospace' }}
      >
        {subtitle}
      </span>
    </header>
  )
}
