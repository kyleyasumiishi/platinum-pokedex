/**
 * BottomNav.jsx — Fixed bottom tab bar.
 *
 * Tab targets are gen-namespaced: each tab points to /gen{activeGen}/...
 * NavLink applies its active style when the URL prefix matches.
 *
 * The first tab uses `end` to only match the exact /gen{N} path, otherwise
 * every gen-namespaced URL would highlight the Pokédex tab.
 */
import { NavLink } from 'react-router-dom'
import { useGenerationContext } from '../../context/GenerationContext'

export default function BottomNav() {
  const { activeGen } = useGenerationContext()
  const prefix = `/gen${activeGen}`

  const tabs = [
    { to: prefix,             label: 'Pokédex',  icon: '📋', end: true  },
    { to: `${prefix}/routes`, label: 'Routes',   icon: '🗺️', end: false },
    { to: `${prefix}/moves`,  label: 'Moves',    icon: '⚡',  end: false },
    { to: `${prefix}/types`,  label: 'Types',    icon: '🔥',  end: false },
    { to: '/settings',        label: 'Settings', icon: '⚙️',  end: true  },
  ]

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
      {tabs.map(tab => (
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
              fontSize: '0.5rem',
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
