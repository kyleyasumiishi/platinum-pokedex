/**
 * TypeBadge.jsx — Colored type pill used everywhere a Pokémon type appears.
 *
 * Props:
 *   type (string) — e.g. "Fire", "Water", "Dragon"
 *   small (bool)  — slightly smaller variant for tight spaces
 */
export default function TypeBadge({ type, small = false }) {
  if (!type) return null
  return (
    <span
      className={`type-badge type-${type.toLowerCase()}`}
      style={small ? { fontSize: '0.6rem', padding: '1px 6px' } : {}}
    >
      {type}
    </span>
  )
}
