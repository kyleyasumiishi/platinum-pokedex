/**
 * TeamTray.jsx — Floating Master Ball button that expands to show your team.
 *
 * Positioned fixed at bottom-right, above the nav bar.
 * Tapping the Master Ball toggles the tray open/closed.
 * Each Pokémon in the tray is tappable and navigates to their detail page.
 * Tapping the X on a Pokémon removes them from the team.
 *
 * The tray slides up from the button using a CSS transform transition.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeamContext } from '../../context/TeamContext'
import { pokemonBySinnohDex, spriteUrl } from '../../utils/dataLoader'

const MASTER_BALL_URL = `${import.meta.env.BASE_URL}sprites/items/master-ball.png`

export default function TeamTray() {
  const [isOpen, setIsOpen] = useState(false)
  const { team, toggleTeam } = useTeamContext()

  if (team.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--nav-height) + 12px)',
        right: 12,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {/* Team tray panel — slides in/out */}
      {isOpen && (
        <div
          className="screen"
          style={{
            padding: 10,
            minWidth: 200,
            animation: 'slideUp 0.2s ease',
          }}
        >
          <div
            className="pixel-text screen-text mb-2"
            style={{ fontSize: '0.45rem' }}
          >
            MY TEAM ({team.length}/6)
          </div>

          {team.length === 0 ? (
            <p style={{ color: 'var(--screen-green-dim)', fontSize: '0.7rem', fontFamily: '"Share Tech Mono", monospace' }}>
              No Pokémon added yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {team.map(sinnohDex => {
                const p = pokemonBySinnohDex.get(sinnohDex)
                if (!p) return null
                return (
                  <div key={sinnohDex} style={{ position: 'relative' }}>
                    <Link
                      to={`/pokemon/${sinnohDex}`}
                      onClick={() => setIsOpen(false)}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="dex-card flex flex-col items-center p-1"
                        style={{ minWidth: 52 }}
                      >
                        <img
                          src={spriteUrl(p.national_dex)}
                          alt={p.name}
                          className="sprite"
                          style={{ width: 40, height: 40 }}
                        />
                        <div style={{ fontSize: '0.55rem', color: '#1a1a2e', textAlign: 'center' }}>
                          {p.name}
                        </div>
                      </div>
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => toggleTeam(sinnohDex)}
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: 'var(--dex-red)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.55rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {team.length === 6 && (
            <p style={{ color: 'var(--dex-red-light)', fontSize: '0.6rem', fontFamily: '"Share Tech Mono", monospace', marginTop: 6 }}>
              Team is full!
            </p>
          )}
        </div>
      )}

      {/* Master Ball toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          background: 'var(--screen-bg)',
          border: `2px solid ${isOpen ? 'var(--screen-green)' : 'var(--screen-green-dim)'}`,
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 10px rgba(0,255,65,0.4)' : '0 2px 8px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          padding: 0,
          position: 'relative',
        }}
        title="My Team"
      >
        <img src={MASTER_BALL_URL} alt="Team" style={{ width: 30, height: 30 }} />
        {/* Team count badge */}
        {team.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: 'var(--dex-red)',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: '0.6rem',
              fontFamily: '"Share Tech Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {team.length}
          </span>
        )}
      </button>

      {/* Slide-up keyframe */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  )
}
