/**
 * PokemonDetail.jsx — Full detail view for a single Pokémon.
 *
 * URL: /pokemon/:sinnohDex
 *
 * useParams() is a React Router hook that reads the :sinnohDex segment
 * from the URL. So if the URL is /pokemon/111, params.sinnohDex is "111".
 * We convert it to a number to look up in our Map index.
 *
 * useNavigate() gives us a function to navigate programmatically —
 * used here for the back button.
 *
 * Above-fold content (visible without scrolling on iPhone 14 Pro):
 *   sprite, name, dex numbers, types, flavor text
 *
 * Below: 6 collapsible sections, all closed by default.
 */
import { useParams, useNavigate } from 'react-router-dom'
import { pokemonBySinnohDex, spriteUrl } from '../../utils/dataLoader'
import { useTeamContext } from '../../context/TeamContext'
import TypeBadge from '../shared/TypeBadge'
import CollapsibleSection from '../shared/CollapsibleSection'
import StatsChart from './StatsChart'
import MoveTable from './MoveTable'
import EncounterTable from './EncounterTable'
import EvolutionChain from './EvolutionChain'
import TypeMatchups from './TypeMatchups'

const MASTER_BALL_URL = `${import.meta.env.BASE_URL}sprites/items/master-ball.png`

export default function PokemonDetail() {
  const { sinnohDex } = useParams()
  const navigate = useNavigate()
  const { isOnTeam, toggleTeam } = useTeamContext()
  const p = pokemonBySinnohDex.get(Number(sinnohDex))

  if (!p) {
    return (
      <div className="p-6 text-center screen-text" style={{ fontSize: '0.8rem' }}>
        Pokémon #{sinnohDex} not found.
      </div>
    )
  }

  return (
    <div>
      {/* Back button + Master Ball toggle row */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            color: 'var(--screen-green-dim)',
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          ‹ Back
        </button>

        <button
          onClick={() => toggleTeam(p.sinnoh_dex)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            opacity: isOnTeam(p.sinnoh_dex) ? 1 : 0.3,
            transition: 'opacity 0.15s, transform 0.1s',
            transform: isOnTeam(p.sinnoh_dex) ? 'scale(1.1)' : 'scale(1)',
          }}
          title={isOnTeam(p.sinnoh_dex) ? 'Remove from team' : 'Add to team'}
        >
          <img src={MASTER_BALL_URL} alt="Master Ball" style={{ width: 32, height: 32 }} />
        </button>
      </div>

      {/* ── Above-fold content ───────────────────────────────────────── */}
      <div className="px-4 pb-4">
        {/* Sprite + name row */}
        <div className="flex items-center gap-4">
          <div className="screen flex-shrink-0 p-2" style={{ background: 'var(--screen-bg)' }}>
            <img
              src={spriteUrl(p.national_dex)}
              alt={p.name}
              className="sprite"
              style={{ width: 120, height: 120 }}
            />
          </div>

          <div className="flex-1">
            {/* Dex numbers */}
            <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.65rem' }}>
              <span style={{ color: 'var(--screen-green-dim)' }}>
                SINNOH #{String(p.sinnoh_dex).padStart(3, '0')}
              </span>
              <span style={{ color: '#555', margin: '0 6px' }}>·</span>
              <span style={{ color: '#666' }}>
                NAT #{String(p.national_dex).padStart(3, '0')}
              </span>
            </div>

            {/* Name */}
            <h2
              className="pixel-text"
              style={{ fontSize: '0.7rem', color: 'white', margin: '6px 0' }}
            >
              {p.name.toUpperCase()}
            </h2>

            {/* Type badges */}
            <div className="flex gap-2 flex-wrap">
              {p.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </div>

        {/* Flavor text */}
        <div
          className="screen mt-3 p-3 screen-text"
          style={{ fontSize: '0.75rem', lineHeight: 1.6 }}
        >
          {p.description || 'No description available.'}
        </div>
      </div>

      {/* ── Collapsible sections ─────────────────────────────────────── */}
      <div className="px-4 pb-4">

        {/* 1. Moves */}
        <CollapsibleSection title="MOVES">
          <MoveTable pokemonMoves={p.moves} />
        </CollapsibleSection>

        {/* 2. Locations */}
        <CollapsibleSection title="LOCATIONS">
          <EncounterTable encounters={p.encounters} />
        </CollapsibleSection>

        {/* 3. Evolution */}
        <CollapsibleSection title="EVOLUTION">
          <EvolutionChain chainId={p.evolution_chain_id} currentName={p.name} />
        </CollapsibleSection>

        {/* 4. Stats */}
        <CollapsibleSection title="BASE STATS">
          <StatsChart stats={p.base_stats} total={p.base_stat_total} />
        </CollapsibleSection>

        {/* 5. Details */}
        <CollapsibleSection title="DETAILS">
          <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.75rem' }}>
            {[
              ['Abilities',    [
                ...p.abilities.regular,
                ...(p.abilities.hidden ? [`${p.abilities.hidden} (Hidden)`] : []),
              ].join(', ')],
              ['Height',       `${p.height} m`],
              ['Weight',       `${p.weight} kg`],
              ['Catch Rate',   p.catch_rate],
              ['Gender',       p.gender_ratio?.genderless
                ? 'Genderless'
                : `♂ ${p.gender_ratio?.male}% / ♀ ${p.gender_ratio?.female}%`],
              ['Egg Groups',   p.egg_groups?.join(', ') ?? '—'],
              ['Hatch Steps',  p.hatch_steps?.toLocaleString() ?? '—'],
              ['Held Items',   p.held_items?.length
                ? p.held_items.map(h => `${h.item} (${h.rarity}%)`).join(', ')
                : 'None'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-1"
                style={{ borderBottom: '1px solid var(--dex-border)' }}
              >
                <span style={{ color: 'var(--screen-green-dim)' }}>{label}</span>
                <span style={{ color: 'var(--screen-green)', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* 6. Type Matchups */}
        <CollapsibleSection title="TYPE MATCHUPS">
          <TypeMatchups matchups={p.type_matchups} />
        </CollapsibleSection>

      </div>
    </div>
  )
}
