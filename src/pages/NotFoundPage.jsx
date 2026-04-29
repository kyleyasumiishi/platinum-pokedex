import { Link } from 'react-router-dom'
import { useGenerationContext } from '../context/GenerationContext'

export default function NotFoundPage() {
  const { activeGen } = useGenerationContext()
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: 32, gap: 16, minHeight: '60vh' }}>
      <div className="screen p-6 text-center" style={{ maxWidth: 320 }}>
        <h1 className="pixel-text text-white mb-3" style={{ fontSize: '0.7rem' }}>
          PAGE NOT FOUND
        </h1>
        <p className="screen-text" style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist.
        </p>
      </div>
      <Link
        to={`/gen${activeGen}`}
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '0.75rem',
          color: 'var(--screen-green)',
          padding: '8px 16px',
          border: '1px solid var(--screen-green-dim)',
          borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        ‹ Back to Pokédex
      </Link>
    </div>
  )
}
