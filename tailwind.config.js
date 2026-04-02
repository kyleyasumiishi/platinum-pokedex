/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pokédex red palette
        'dex-red':          '#CC0000',
        'dex-red-dark':     '#990000',
        'dex-red-light':    '#FF3333',

        // Cream/off-white for card backgrounds
        'dex-cream':        '#F5F0E8',
        'dex-cream-dark':   '#E8E0D0',

        // CRT screen background
        'screen-bg':        '#0d0d1a',
        'screen-bg-alt':    '#1a1a2e',

        // CRT green text
        'screen-green':     '#00ff41',
        'screen-green-dim': '#00cc33',

        // UI neutrals
        'dex-gray':         '#4a4a5a',
        'dex-border':       '#2a2a3a',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'mono':  ['"Share Tech Mono"', 'monospace'],
        'sans':  ['"Share Tech Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

