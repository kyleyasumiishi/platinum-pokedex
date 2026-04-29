/**
 * App.jsx — Root component. Sets up routing and the persistent layout shell.
 *
 * React Router works like this:
 * - <BrowserRouter> wraps everything and gives components access to the URL.
 * - <Routes> is the "switch" — it looks at the current URL and renders the
 *   first <Route> that matches.
 * - <Route path="/" element={<PokedexPage />}> means "when the URL is exactly
 *   '/', render PokedexPage".
 *
 * Header and BottomNav are rendered outside <Routes> so they persist across
 * every page — they never unmount and remount as you navigate.
 *
 * The main content area has padding-top equal to the header height and
 * padding-bottom equal to the nav height so content is never hidden behind
 * the fixed bars.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { TeamProvider } from './context/TeamContext'
import Header    from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import TeamTray  from './components/layout/TeamTray'

import PokedexPage      from './pages/PokedexPage'
import PokemonDetailPage from './pages/PokemonDetailPage'
import RoutesPage        from './pages/RoutesPage'
import RouteDetailPage   from './pages/RouteDetailPage'
import MovesPage         from './pages/MovesPage'
import MoveDetailPage    from './pages/MoveDetailPage'
import TypesPage         from './pages/TypesPage'

export default function App() {
  return (
    <TeamProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex flex-col" style={{ minHeight: '100dvh' }}>

        <Header />

        {/* Scrollable content area — padded so it's not hidden behind fixed bars */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop:    'var(--header-height)',
            paddingBottom: 'var(--nav-height)',
            backgroundColor: 'var(--screen-bg-alt)',
          }}
        >
          <Routes>
            <Route path="/"                   element={<PokedexPage />}      />
            <Route path="/pokemon/:regionalDex" element={<PokemonDetailPage />} />
            <Route path="/routes"                  element={<RoutesPage />}       />
            <Route path="/routes/:locationId"     element={<RouteDetailPage />}  />
            <Route path="/moves"              element={<MovesPage />}         />
            <Route path="/moves/:moveId"      element={<MoveDetailPage />}    />
            <Route path="/types"              element={<TypesPage />}         />
          </Routes>
        </main>

        <BottomNav />
        <TeamTray />

      </div>
    </BrowserRouter>
    </TeamProvider>
  )
}
