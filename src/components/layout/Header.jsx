/**
 * Header.jsx — Top bar of the app.
 *
 * Displays the app title in Pokédex red with a retro pixel font.
 * Fixed to the top so it's always visible while the page content scrolls.
 * Height is set via the --header-height CSS variable so other components
 * can offset their content by the same amount.
 */

export default function Header() {
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
      {/* LED indicator dot — purely decorative, gives it a device feel */}
      <span
        className="mr-3 rounded-full flex-shrink-0"
        style={{
          width: 10,
          height: 10,
          backgroundColor: '#00ff41',
          boxShadow: '0 0 6px #00ff41',
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
        SINNOH — PLATINUM
      </span>
    </header>
  )
}
