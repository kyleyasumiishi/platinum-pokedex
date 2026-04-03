/**
 * CollapsibleSection.jsx — Expand/collapse wrapper for Pokémon detail sections.
 *
 * Uses React's useState hook to track whether the section is open or closed.
 * All sections start collapsed by default (isOpen starts as false).
 *
 * The chevron (▼/▲) rotates to indicate state — this is done with an inline
 * style transition rather than CSS classes to keep it self-contained.
 *
 * Props:
 *   title    (string)    — section header label
 *   children (ReactNode) — the content to show/hide
 *   defaultOpen (bool)   — optionally start expanded
 */
import { useState } from 'react'

export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-2">
      <button
        className="section-header w-full text-left"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.7rem',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className="section-content"
          style={{ backgroundColor: 'var(--screen-bg-alt)', padding: '12px' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
