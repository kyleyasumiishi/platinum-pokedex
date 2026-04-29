/**
 * EvolutionChain.jsx — Visual evolution chain with sprites and method labels.
 *
 * The evolution data is a nested tree (each node has an optional evolves_to array).
 * This component renders it recursively. For branching chains (e.g. Ralts →
 * Gardevoir OR Gallade), the branches are stacked vertically.
 *
 * Each Pokémon in the chain is a Link to its detail page (by regional dex number).
 * If the Pokémon is not in the regional dex (regional_dex is null), we show the
 * sprite and name but don't link — it's for context only.
 *
 * Props:
 *   chainId     (number) — the evolution_chain_id from the Pokémon's data
 *   currentName (string) — lowercased name of the Pokémon being viewed
 *                          (used to highlight the current Pokémon in the chain)
 */
import { Link } from 'react-router-dom'
import { evolutionById } from '../../utils/dataLoader'
import { spriteUrl } from '../../utils/dataLoader'

function methodLabel(method) {
  if (!method) return null
  const { trigger, level, item, held_item, happiness, time_of_day, known_move, location } = method

  if (trigger === 'level-up') {
    let parts = []
    if (level)       parts.push(`Lv ${level}`)
    if (happiness)   parts.push(`Friendship`)
    if (time_of_day) parts.push(time_of_day.charAt(0).toUpperCase() + time_of_day.slice(1))
    if (known_move)  parts.push(`Know ${known_move.replace(/-/g, ' ')}`)
    if (location)    parts.push(`at ${location.replace(/-/g, ' ')}`)
    return parts.length ? parts.join(' + ') : 'Level Up'
  }
  if (trigger === 'use-item') return item ?? 'Use Item'
  if (trigger === 'trade')    return held_item ? `Trade w/ ${held_item}` : 'Trade'
  return trigger.replace(/-/g, ' ')
}

function ChainNode({ node, currentName }) {
  const isCurrentPokemon = node.pokemon_id === currentName
  const hasRegionalDex = node.regional_dex != null

  const sprite = (
    <img
      src={spriteUrl(node.national_dex)}
      alt={node.name}
      className="sprite"
      style={{ width: 56, height: 56 }}
    />
  )

  const label = (
    <div style={{ fontSize: '0.65rem', color: isCurrentPokemon ? 'var(--screen-green)' : 'var(--screen-green-dim)', textAlign: 'center' }}>
      {node.name}
    </div>
  )

  const pokemonNode = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {hasRegionalDex ? (
        <Link to={`/pokemon/${node.regional_dex}`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              padding: 4,
              borderRadius: 8,
              border: isCurrentPokemon ? '2px solid var(--screen-green)' : '2px solid transparent',
              backgroundColor: isCurrentPokemon ? 'rgba(0,255,65,0.08)' : 'transparent',
            }}
          >
            {sprite}
          </div>
          {label}
        </Link>
      ) : (
        <>
          <div style={{ padding: 4 }}>{sprite}</div>
          {label}
        </>
      )}
    </div>
  )

  const nextNodes = node.evolves_to ?? []

  if (nextNodes.length === 0) return pokemonNode

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {pokemonNode}

      {/* For each branch (usually 1, but Eevee/Ralts etc. have multiple) */}
      {nextNodes.map((next, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Arrow + method label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60 }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--screen-green-dim)', textAlign: 'center', maxWidth: 80 }}>
              {methodLabel(next.method)}
            </div>
            <div style={{ color: 'var(--screen-green-dim)', fontSize: '1rem' }}>→</div>
          </div>

          {/* Recursive next stage */}
          <ChainNode node={next} currentName={currentName} />
        </div>
      ))}
    </div>
  )
}

export default function EvolutionChain({ chainId, currentName }) {
  const chain = evolutionById.get(chainId)
  if (!chain) return (
    <p style={{ color: 'var(--screen-green-dim)', fontSize: '0.75rem' }}>No evolution data.</p>
  )

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'inline-flex', minWidth: '100%', justifyContent: 'center' }}>
        <ChainNode node={chain.stages} currentName={currentName.toLowerCase()} />
      </div>
    </div>
  )
}
