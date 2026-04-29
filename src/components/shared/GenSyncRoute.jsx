/**
 * GenSyncRoute.jsx — Keeps the URL gen and the active gen in sync.
 *
 * Wrap each gen-namespaced route in <GenSyncRoute gen={N}>. If the URL says
 * /gen5/... but activeGen is 4, this calls setActiveGen(5) on mount so the
 * dataset switches to match the URL. It does NOT navigate — that's the
 * SettingsPage's job. Navigation here would risk an infinite loop.
 */
import { useEffect } from 'react'
import { useGenerationContext } from '../../context/GenerationContext'

export default function GenSyncRoute({ gen, children }) {
  const { activeGen, setActiveGen } = useGenerationContext()

  useEffect(() => {
    if (activeGen !== gen) {
      setActiveGen(gen)
    }
  }, [gen, activeGen, setActiveGen])

  return children
}
