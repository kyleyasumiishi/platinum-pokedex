/**
 * BottomNav.jsx — Fixed bottom tab bar with 4 navigation tabs.
 *
 * Uses React Router's NavLink component, which automatically adds an
 * 'active' class when the current URL matches the link's `to` prop.
 * We use this to highlight the active tab.
 *
 * The `end` prop on the first tab means it only matches exactly '/',
 * not any route that starts with '/'. Without it, the Pokédex tab would
 * always appear active since every route starts with '/'.
 */

import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',       label: 'Pokédex', icon: '📋', end: true  },
  { to: '/routes', label: 'Routes',  icon: '🗺️', end: false },
  { to: '/moves',  label: 'Moves',   icon: '⚡',  end: false },
  { to: '/types',  label: 'Types',   icon: '🔥',  end: false },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        height: 'var(--nav-height)',
        backgroundColor: 'var(--dex-red-dark)',
        borderTop: '3px solid var(--dex-red)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.5)',
      }}
    >
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className="flex-1 flex flex-col items-center justify-center gap-1 no-underline transition-colors"
          style={({ isActive }) => ({
            color: isActive ? '#00ff41' : 'rgba(255,255,255,0.6)',
            backgroundColor: isActive ? 'rgba(0,0,0,0.3)' : 'transparent',
            borderTop: isActive ? '2px solid #00ff41' : '2px solid transparent',
          })}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{tab.icon}</span>
          <span
            style={{
              fontSize: '0.55rem',
              fontFamily: '"Share Tech Mono", monospace',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {tab.label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
