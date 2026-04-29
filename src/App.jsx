/**
 * App.jsx — Root component. Sets up routing and the persistent layout shell.
 *
 * Routes are namespaced by generation: /gen4/* or /gen5/*. The bare "/" path
 * redirects to the active gen (read from GenerationContext / localStorage).
 *
 * Each gen-namespaced route is wrapped in <GenSyncRoute gen={N}> so that
 * deep-linking to /gen5/... while activeGen is 4 transparently switches the
 * active gen to match the URL.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { GenerationProvider, useGenerationContext } from './context/GenerationContext'
import { TeamProvider } from './context/TeamContext'
import GenSyncRoute from './components/shared/GenSyncRoute'

import Header    from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import TeamTray  from './components/layout/TeamTray'

import PokedexPage        from './pages/PokedexPage'
import PokemonDetailPage  from './pages/PokemonDetailPage'
import RoutesPage         from './pages/RoutesPage'
import RouteDetailPage    from './pages/RouteDetailPage'
import MovesPage          from './pages/MovesPage'
import MoveDetailPage     from './pages/MoveDetailPage'
import TypesPage          from './pages/TypesPage'
import NotFoundPage       from './pages/NotFoundPage'

function RedirectToActiveGen() {
  const { activeGen } = useGenerationContext()
  return <Navigate to={`/gen${activeGen}`} replace />
}

function GenRoutes({ gen }) {
  return (
    <GenSyncRoute gen={gen}>
      <Routes>
        <Route index                                element={<PokedexPage />}        />
        <Route path="pokemon/:regionalDex"          element={<PokemonDetailPage />}  />
        <Route path="routes"                        element={<RoutesPage />}         />
        <Route path="routes/:locationId"            element={<RouteDetailPage />}    />
        <Route path="moves"                         element={<MovesPage />}          />
        <Route path="moves/:moveId"                 element={<MoveDetailPage />}     />
        <Route path="types"                         element={<TypesPage />}          />
        <Route path="*"                             element={<NotFoundPage />}       />
      </Routes>
    </GenSyncRoute>
  )
}

export default function App() {
  return (
    <GenerationProvider>
      <TeamProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="flex flex-col" style={{ minHeight: '100dvh' }}>

            <Header />

            <main
              className="flex-1 overflow-y-auto"
              style={{
                paddingTop:    'var(--header-height)',
                paddingBottom: 'var(--nav-height)',
                backgroundColor: 'var(--screen-bg-alt)',
              }}
            >
              <Routes>
                <Route path="/"           element={<RedirectToActiveGen />} />
                <Route path="/gen4/*"     element={<GenRoutes gen={4} />}   />
                <Route path="/gen5/*"     element={<GenRoutes gen={5} />}   />
                <Route path="*"           element={<NotFoundPage />}        />
              </Routes>
            </main>

            <BottomNav />
            <TeamTray />

          </div>
        </BrowserRouter>
      </TeamProvider>
    </GenerationProvider>
  )
}
