# Platinum Pokédex — Gen 5 Black Expansion Spec

## Overview

This spec extends the existing Sinnoh Platinum Pokédex (Gen 4) to also support **Pokémon Black (Gen 5, original Unova dex, 156 Pokémon)**. The user plays through one generation at a time, so the active generation is a sticky setting (persisted in localStorage), not a constantly-visible toggle. The Gen 4 experience stays bit-for-bit identical to today; Gen 5 is added alongside it via gen-namespaced routes (`/gen4/*`, `/gen5/*`) and per-generation data files (`src/data/gen4/`, `src/data/gen5/`). Black-version-exclusive encounter filtering is applied at pipeline time (all 156 dex entries kept; White-exclusive Pokémon labeled accordingly).

**Estimated scope:** ~6 new source files, ~25 modified files, ~600 new LoC + ~400 modified LoC, plus 156 new sprite PNGs and 5 new JSON data files.

---

## Tech Stack & Rationale

No new framework dependencies. New tooling for tests only.

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite + React Router 6 | Already in place. Gen-namespaced routes nest cleanly under React Router. |
| Styling | Tailwind 3 + custom CSS theme | Theme stays identical across gens; only labels change. |
| Data pipeline | Python `requests` (extend existing script) | Add a `--gen {4,5}` flag rather than forking. Reuse caching logic. |
| Persistence | localStorage (existing) | Active gen + per-gen team; one new key, one renamed key. |
| Testing | **Vitest + React Testing Library + jsdom** (NEW) | Industry standard for Vite/React. jsdom over happy-dom because RTL behaves more predictably under it. |
| User interactions in tests | `@testing-library/user-event` | Simulates full event sequence (focus → keydown → click), unlike `fireEvent`. |

---

## Scope

### In Scope
- Add a fifth tab "Settings" to the bottom nav with a Gen 4 ↔ Gen 5 toggle
- Persist the active generation in localStorage; reload restores it
- Migrate URLs to be gen-namespaced: `/gen4/pokemon/:dex`, `/gen5/routes/:loc`, etc.
- Refactor data layer to load per-gen JSON files at startup; expose a `useDataset()` hook returning the active gen's dataset
- Per-generation team storage (independent Sinnoh team and Unova team)
- Black-version data: pokedex/8 (Unova B/W dex, 156 entries), `version_group: black-white` for moves, `version: black` for encounters and flavor text
- White-exclusive Pokémon labeled "WHITE EXCLUSIVE · TRADE ONLY" in the detail view
- Dynamic Header subtitle: "SINNOH — PLATINUM" / "UNOVA — BLACK"
- Dynamic TypeChart label: "TYPE CHART — GEN 4" / "TYPE CHART — GEN 5" (data is identical, label only)
- 156 new sprite PNGs downloaded to `public/sprites/` (national #494–649)
- Vitest + RTL test setup; tests for new logic only (data loader, generation context, useTeam migration, deep-link redirects, version-exclusive labels)
- A "Future Generations" section at the end of the spec for adding Gen 6+

### Out of Scope
- Pokémon White exclusives' encounter data (correctly absent — White-exclusives only obtainable via trade in Black)
- Black 2 / White 2 (different dex, different version_group)
- Backfilling tests for existing Gen 4 components (existing untested code stays untested)
- Type chart UI redesign (Gen 5 still uses the 17-type chart, no Fairy)
- Gen 5 hidden grottos or season-based encounters (B2W2 features, not B/W)
- Move tutor data for B2W2-only tutors
- Migrating localStorage from old `platinum-pokedex-team` key without a fallback (we'll write a safe migration)
- Internationalization (still English-only)

---

## Critical Instructions for Claude Code

### Workflow Rules

1. **Phases are sequential and gated.** After each phase, stop at the `⏸️ CHECKPOINT` and wait for user review before starting the next. Do not chain phases together.
2. **Tests come with the code, not after.** Every phase has tests. Write the test file alongside the implementation file. A phase is not complete until tests pass.
3. **Never break Gen 4.** After every phase, confirm the Gen 4 path still works exactly as it did before. The Definition of Done for every phase includes "navigate to `/gen4/` and verify Pokédex list renders." This is the primary regression check.
4. **Commit after each phase.** Use the commit message format in each phase's Definition of Done. This gives clean rollback points.
5. **Follow existing patterns over inventing new ones.** The codebase already has clear patterns (`useTeam` hook, context provider, `dataLoader.js` indexes). Match them.
6. **Explain as you go.** Kyle is learning — after each meaningful chunk, surface the 1-2 things worth understanding (a hook pattern, a routing decision, a context migration).

### Common Mistakes to Avoid

These are stack-specific failure patterns to actively prevent.

1. **`createBrowserRouter` is the v6 idiom — but this project uses `<BrowserRouter>` already.** Don't migrate the router style. Add new routes inside the existing `<Routes>` block. Migrating to data routers is out of scope and would touch every page.

2. **Initialize localStorage state with a function.** `useState(() => loadActiveGen())`, not `useState(loadActiveGen())`. The former runs once on mount; the latter runs on every render and may throw under SSR/test environments.

3. **Always wrap `JSON.parse` of localStorage in try/catch.** Existing `useTeam.js` already does this — match the pattern. Bad localStorage data must fall back to defaults, not crash the app.

4. **localStorage versioning matters during this migration.** The old key `platinum-pokedex-team` must be migrated, not silently dropped. Read it once on first mount, copy its value into the new `platinum-pokedex-team-gen4` key, then delete the old key. If the user has a Gen 4 team, they shouldn't lose it.

5. **Self-closing tags in JSX.** `<img />`, `<input />`, `<br />` — the trailing slash is required. The existing code follows this; new code must too.

6. **Key prop on `.map()` must be stable.** Use `p.regional_dex` or `p.national_dex`, never the array index. Filtered/sorted lists with index keys produce ghost-row bugs.

7. **`useParams()` returns strings.** `useParams().regionalDex` is `"7"`, not `7`. Always coerce: `Number(regionalDex)`. The existing `PokemonDetail.jsx` does this — match it.

8. **Don't use `as` casts to silence type-ish errors.** This is a JS project, not TS, so this is mostly moot — but if you find yourself wanting to coerce a value to make a function call work, that's usually a sign your data shape assumption is wrong. Stop and re-check the JSON.

9. **Test queries: prefer `getByRole` and `getByText` over `getByTestId`.** Tests should resemble user behavior. Avoid querying by className entirely.

10. **Async UI updates need `findBy*` or `waitFor`.** After clicking a tab and expecting a route change, use `await screen.findByText(...)`, not `screen.getByText(...)`.

11. **`afterEach(() => localStorage.clear())` in test setup.** Without this, tests leak state into each other and produce flaky pass/fail patterns.

12. **PokeAPI rate limit and caching.** The existing pipeline caches every response to `scripts/cache/`. The new gen-5 calls must use the same cache. Don't introduce a parallel cache directory.

---

## File & Folder Structure

After this expansion, the structure looks like:

```
platinum-pokedex/
├── .github/workflows/deploy.yml
├── public/
│   └── sprites/
│       ├── 1.png ... 493.png      # Existing Gen 4 sprites
│       ├── 494.png ... 649.png    # NEW — Gen 5 sprites
│       └── items/master-ball.png
├── scripts/
│   ├── fetch_pokeapi.py           # MODIFIED — accepts --gen {4,5}
│   ├── download_sprites.py        # NEW — downloads sprite PNGs locally
│   ├── requirements.txt
│   └── cache/                     # gitignored
├── src/
│   ├── data/
│   │   ├── gen4/                  # NEW — relocated existing files
│   │   │   ├── pokemon.json
│   │   │   ├── moves.json
│   │   │   ├── locations.json
│   │   │   ├── evolutions.json
│   │   │   └── type_chart.json
│   │   └── gen5/                  # NEW
│   │       ├── pokemon.json
│   │       ├── moves.json
│   │       ├── locations.json
│   │       ├── evolutions.json
│   │       └── type_chart.json    # Identical to gen4's chart
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.jsx      # MODIFIED — adds Settings tab
│   │   │   ├── Header.jsx         # MODIFIED — dynamic gen subtitle
│   │   │   └── TeamTray.jsx       # MODIFIED — uses active gen team
│   │   ├── pokemon/               # All MODIFIED for regional_dex rename
│   │   │   ├── PokemonList.jsx
│   │   │   ├── PokemonCard.jsx
│   │   │   ├── PokemonDetail.jsx  # Adds version-exclusive label
│   │   │   ├── EvolutionChain.jsx
│   │   │   ├── EncounterTable.jsx
│   │   │   ├── MoveTable.jsx
│   │   │   ├── StatsChart.jsx
│   │   │   └── TypeMatchups.jsx
│   │   ├── moves/                 # MODIFIED for active-gen dataset
│   │   ├── routes/                # MODIFIED for active-gen dataset
│   │   ├── types/
│   │   │   └── TypeChart.jsx      # MODIFIED — dynamic gen label
│   │   └── shared/
│   ├── context/
│   │   ├── TeamContext.jsx        # MODIFIED — gen-aware
│   │   └── GenerationContext.jsx  # NEW
│   ├── hooks/
│   │   └── useTeam.js             # MODIFIED — per-gen storage, migration
│   ├── pages/
│   │   ├── PokedexPage.jsx
│   │   ├── PokemonDetailPage.jsx
│   │   ├── RoutesPage.jsx
│   │   ├── RouteDetailPage.jsx
│   │   ├── MovesPage.jsx
│   │   ├── MoveDetailPage.jsx
│   │   ├── TypesPage.jsx
│   │   └── SettingsPage.jsx       # NEW
│   ├── styles/
│   │   └── pokedex-theme.css      # MODIFIED — gen5 accent (optional minor)
│   ├── utils/
│   │   └── dataLoader.js          # MODIFIED — per-gen indexes
│   ├── test/                      # NEW
│   │   └── setup.js               # NEW — RTL setup, localStorage clear
│   ├── App.jsx                    # MODIFIED — gen-namespaced routes
│   ├── main.jsx
│   └── index.css
├── vite.config.js                 # MODIFIED — Vitest config
├── tailwind.config.js
├── package.json                   # MODIFIED — Vitest deps
├── .gitignore
└── GEN5_SPEC.md                   # this file
```

### .gitignore additions
None new — existing entries cover everything (`scripts/cache/`, `node_modules/`, `dist/`).

---

## Routing Plan

The router migrates from gen-implicit to gen-namespaced routes. The existing `<BrowserRouter>` API stays — only the path prefixes change.

| Path | Component | Description |
|---|---|---|
| `/` | redirect → `/gen{active}` | Reads active gen from localStorage, redirects |
| `/gen4` | `PokedexPage` | Gen 4 Pokémon list |
| `/gen4/pokemon/:regionalDex` | `PokemonDetailPage` | Gen 4 detail |
| `/gen4/routes` | `RoutesPage` | Gen 4 location list |
| `/gen4/routes/:locationId` | `RouteDetailPage` | Gen 4 location detail |
| `/gen4/moves` | `MovesPage` | Gen 4 moves list |
| `/gen4/moves/:moveId` | `MoveDetailPage` | Gen 4 move detail |
| `/gen4/types` | `TypesPage` | Gen 4 type chart |
| `/gen5/...` | (mirror of above) | Gen 5 equivalents |
| `/settings` | `SettingsPage` | Generation toggle, gen-agnostic |
| `*` | `NotFoundPage` (NEW, minimal) | 404 fallback |

**Deep-link behavior:** If a user navigates to `/gen5/pokemon/7` while their active gen is Gen 4, the page must (a) switch the active gen to Gen 5 in `GenerationContext` and (b) render the Pokémon. This is handled by a `<GenSyncRoute>` wrapper component on each gen-namespaced route — it reads the gen segment from `useParams()` and calls `setActiveGen(gen)` in a `useEffect`.

**BottomNav links:** Tabs link to `/gen{active}/...` — i.e., the link target depends on `activeGen`. `NavLink`'s active state is matched via the `gen{active}` prefix.

---

## State Management

Two contexts, both at the app root.

### `GenerationContext` (NEW)
```js
{
  activeGen: 4 | 5,
  setActiveGen: (gen: 4 | 5) => void,
}
```
- Persisted to localStorage under key `platinum-pokedex-active-gen` (value: `"4"` or `"5"`).
- Initial state: read from localStorage; default to `4` if missing or invalid.
- `setActiveGen` writes to localStorage on every change (matches `useTeam.js` pattern via `useEffect`).

### `TeamContext` (MODIFIED)
Wraps two `useTeam` instances — one per gen — and exposes the active one based on `GenerationContext`.

```js
{
  team: number[],            // active gen's team array
  isOnTeam: (dex) => boolean,
  toggleTeam: (dex) => void,
}
```

Storage keys:
- `platinum-pokedex-team-gen4` (value: JSON-stringified array of regional dex numbers)
- `platinum-pokedex-team-gen5` (same shape)

**Migration:** On first mount, `useTeam` checks if the legacy key `platinum-pokedex-team` exists. If yes, copies its value into `platinum-pokedex-team-gen4` (only if that key is empty) and deletes the legacy key. This preserves any in-progress Sinnoh team.

---

## Data & Content Layer

### Per-gen JSON files

All five files are produced for each gen and live in `src/data/gen4/` or `src/data/gen5/`. Schemas are identical between gens — only the field name `sinnoh_dex` is generalized to `regional_dex`.

### Schema rename: `sinnoh_dex` → `regional_dex`

Every Pokémon record across both gens uses `regional_dex`. Sinnoh Pokémon get values 1–210 (Sinnoh order), Unova Pokémon get 1–156 (Unova order). The field is unique within a gen but not across gens — that's why URLs are gen-namespaced.

### New field for Gen 5: `version_exclusive`

Added to Pokémon records to mark Black-version availability:
```json
{
  "version_exclusive": null  // or "black" or "white"
}
```
- `null` → catchable in Black normally
- `"black"` → Black-exclusive (e.g., Reshiram, Gothita, Vullaby line). Same as `null` for our purposes — fully playable.
- `"white"` → White-exclusive. The detail page shows "WHITE EXCLUSIVE · TRADE ONLY" banner. `encounters` array will be empty.

The pipeline determines this by inspecting the species' `pokedex_numbers` and known-version-exclusive lists baked into the script (a hardcoded constant — these don't change).

### Example Pokémon record (Gen 5, Snivy)

```json
{
  "regional_dex": 1,
  "national_dex": 495,
  "name": "Snivy",
  "types": ["Grass"],
  "description": "It is very intelligent and calm. Being hit by lots of sunlight makes its movements swifter.",
  "sprite_url": "sprites/495.png",
  "base_stats": { "hp": 45, "attack": 45, "defense": 55, "sp_atk": 45, "sp_def": 55, "speed": 63 },
  "base_stat_total": 308,
  "abilities": { "regular": ["Overgrow"], "hidden": "Contrary" },
  "height": 0.6,
  "weight": 8.1,
  "catch_rate": 45,
  "gender_ratio": { "male": 87.5, "female": 12.5 },
  "egg_groups": ["Field", "Grass"],
  "hatch_steps": 5120,
  "held_items": [],
  "version_exclusive": null,
  "evolution_chain_id": 197,
  "moves": {
    "level_up": [
      { "level": 1, "move_id": "tackle" },
      { "level": 4, "move_id": "vine-whip" }
    ],
    "tm_hm": ["tm75-swords-dance"],
    "tutor": [],
    "egg": ["mirror-coat", "leaf-storm"]
  },
  "encounters": [],
  "type_matchups": {
    "weak_to_4x": [],
    "weak_to_2x": ["Fire", "Ice", "Poison", "Flying", "Bug"],
    "resistant_0_5x": ["Water", "Electric", "Grass", "Ground"],
    "resistant_0_25x": [],
    "immune_to": []
  }
}
```

### Data pipeline endpoint mapping

| Gen | Pokedex endpoint | version_group | version | Type chart |
|---|---|---|---|---|
| 4 | `pokedex/6` (Sinnoh Platinum, 210) | `platinum` | `platinum` | 17 types (Gen 4 set) |
| 5 | `pokedex/8` (Unova B/W, 156) | `black-white` | `black` | 17 types (identical, no Fairy) |

---

## Component Inventory

Only listing **new** and **substantially modified** components. Components that just rename `sinnoh_dex` → `regional_dex` are noted but not enumerated.

### NEW Components

#### `GenerationContext.jsx`
Provides `activeGen` and `setActiveGen`. Reads from / writes to `localStorage[platinum-pokedex-active-gen]`. Default = 4.

#### `SettingsPage.jsx`
- Header: "SETTINGS" in pixel-text on red bar
- One section: "GENERATION" with two large buttons (Gen 4: "SINNOH — PLATINUM" / Gen 5: "UNOVA — BLACK")
- Active gen button has the green CRT-style outline; inactive button is dimmed
- Tapping a button calls `setActiveGen(n)` and navigates to `/gen{n}` so the user lands on the new gen's Pokédex
- Below: small "ABOUT" card with version + "Generation 4 (Platinum) and Generation 5 (Black) regional dex coverage."

Props: none. Reads `useGenerationContext()` and `useNavigate()`.

#### `GenSyncRoute.jsx` (wrapper)
A small wrapper used in `App.jsx` to ensure the URL gen and the active gen stay in sync. If the URL says `/gen5/...` but `activeGen === 4`, it calls `setActiveGen(5)`.

```jsx
function GenSyncRoute({ gen, children }) {
  const { activeGen, setActiveGen } = useGenerationContext()
  useEffect(() => {
    if (activeGen !== gen) setActiveGen(gen)
  }, [gen, activeGen, setActiveGen])
  return children
}
```

#### `NotFoundPage.jsx`
Minimal 404 — "PAGE NOT FOUND" in screen-text + a back-to-home link. Used for `*` route.

### MODIFIED Components (new behavior, not just renames)

#### `BottomNav.jsx`
- Adds 5th tab: `{ to: '/settings', label: 'Settings', icon: '⚙', end: false }`
- Tabs 1-4 now construct their `to` paths from active gen: `to: \`/gen${activeGen}\`` etc.
- Width adjusts (each tab is now 1/5 of the bar, not 1/4)
- Settings tab does NOT use the gen prefix (it's gen-agnostic)
- Reads `useGenerationContext()`

#### `Header.jsx`
- Subtitle reads from active gen: `"SINNOH — PLATINUM"` (gen 4) or `"UNOVA — BLACK"` (gen 5)
- LED dot color: green for Gen 4 (current), or a slight blue-tint for Gen 5 (`#41a7ff` — small visual distinction)
- Reads `useGenerationContext()`

#### `useTeam.js`
- Constructor takes `gen` as argument: `useTeam(gen)`
- Storage key derived from gen: `\`platinum-pokedex-team-gen${gen}\``
- On first mount: legacy migration — if `localStorage[platinum-pokedex-team]` exists AND `localStorage[platinum-pokedex-team-gen4]` is null, copy it over and delete the legacy key
- Otherwise unchanged

#### `TeamContext.jsx`
- Maintains both `useTeam(4)` and `useTeam(5)` instances
- Exposes whichever matches `activeGen`
- This means switching gens swaps the team in the tray instantly

#### `dataLoader.js`
- Imports both gens' JSON files at module load (both are in the bundle, but gzipped JSON is small)
- Exports per-gen indexes: `pokemonByRegionalDex.gen4`, `pokemonByRegionalDex.gen5`, `moves.gen4`, etc.
- Provides a `useDataset()` hook that reads `useGenerationContext()` and returns the active gen's data:
  ```js
  const { pokemon, pokemonByRegionalDex, pokemonByName, moves, locations, evolutionById, typeChart } = useDataset()
  ```
- Existing components are migrated to use `useDataset()` instead of importing top-level constants directly

#### `TypeChart.jsx`
- Heading reads `\`TYPE CHART — GEN ${activeGen}\``
- Data source: `useDataset().typeChart` (identical between gens, but conceptually gen-bound)

#### `PokemonDetail.jsx`
- After flavor text, if `p.version_exclusive === 'white'`, render a small badge: a red bar with white pixel-text "WHITE EXCLUSIVE · TRADE ONLY"
- All `p.sinnoh_dex` references become `p.regional_dex`

### MODIFIED for rename only (no new behavior)
`PokemonList.jsx`, `PokemonCard.jsx`, `EvolutionChain.jsx`, `EncounterTable.jsx`, `MoveTable.jsx`, `StatsChart.jsx`, `TypeMatchups.jsx`, `RouteList.jsx`, `RouteCard.jsx`, `RouteDetail.jsx`, `MoveList.jsx`, `MoveCard.jsx`, `MoveDetail.jsx`, `TeamTray.jsx`, all `pages/*.jsx` — every `sinnoh_dex` becomes `regional_dex`, every `sinnohDex` URL param becomes `regionalDex`, every `pokemonBySinnohDex` becomes `pokemonByRegionalDex`.

---

## UI/UX Direction

### The Settings tab
- Visual identity matches the existing screen + dex-card aesthetic. No new design vocabulary.
- The two gen buttons are large tap targets (full-width, ~80px tall each) — easy on a phone.
- Selected button: cream background, dex-red border, green LED-style indicator dot in the corner.
- Unselected: dark `--screen-bg-alt` background, dimmed text.
- Tapping the active gen does nothing (it's already selected).
- After tapping the inactive gen, navigate to `/gen{n}` so the user immediately sees the new dex.

### Header subtitle distinction
The subtitle ("SINNOH — PLATINUM" vs "UNOVA — BLACK") is the always-visible signal of which gen you're in. No need for additional color theming.

### Optional: subtle gen-5 accent
If desired, the Header LED dot could shift from green (Gen 4) to a slight blue-tint (Gen 5 = #41a7ff) as a non-intrusive visual cue. Keep this subtle — the app's identity is the CRT green and dex red, not a per-gen palette.

### Version-exclusive badge
For White-exclusives in Black, a small badge on the detail view between the flavor text and the collapsible sections:
```
┌──────────────────────────────────┐
│ ⚠ WHITE EXCLUSIVE · TRADE ONLY  │
└──────────────────────────────────┘
```
Style: full-width red bar (`--dex-red` background), white pixel-text, ~32px tall, ~0.6rem font. Visible always for these mons.

### Accessibility baseline
- All tab buttons remain `<NavLink>` with proper roles
- Settings buttons are `<button>` with descriptive labels (not divs)
- Settings page should be keyboard-navigable (tab through buttons; Enter/Space activates)
- Maintain existing focus-visible styles

### Responsive
No layout changes — this is an iPhone-first app, and the Settings tab fits the existing 4-tab layout pattern. The 5-tab nav still fits comfortably on iPhone 14 Pro (~75px per tab).

---

## Testing Strategy

### Setup

**`vite.config.js`** — add the test block:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/platinum-pokedex/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

**`src/test/setup.js`**:
```js
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})
```

**`package.json`** — add:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### Philosophy

- **Test new logic heavily.** GenerationContext, useTeam migration, data loader switching, deep-link gen sync.
- **Don't backfill tests for existing components.** They've been working; they're not in scope.
- **Test behavior, not implementation.** Query by role/text, not classNames.
- **One test file per source file under test.** Co-located: `GenerationContext.jsx` → `GenerationContext.test.jsx`.

### Patterns

For context providers:
```jsx
function renderWithProviders(ui, { initialGen = 4 } = {}) {
  localStorage.setItem('platinum-pokedex-active-gen', String(initialGen))
  return render(
    <GenerationProvider>
      <TeamProvider>{ui}</TeamProvider>
    </GenerationProvider>
  )
}
```

For routing:
```jsx
import { MemoryRouter } from 'react-router-dom'
render(
  <MemoryRouter initialEntries={['/gen5/pokemon/1']}>
    <App />
  </MemoryRouter>
)
```

---

## Build Phases

### Phase 1: Schema migration & Gen 4 data relocation

**Goal:** Existing app works exactly as before, but Gen 4 data lives in `src/data/gen4/` and every reference to `sinnoh_dex` is renamed `regional_dex`. Vitest is installed and one smoke test passes.

**Build:**
1. Install Vitest + RTL: `npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
2. Add `test` script to `package.json`; add `test` block to `vite.config.js`; create `src/test/setup.js`
3. Move JSON files: `src/data/*.json` → `src/data/gen4/*.json` (5 files)
4. Update `dataLoader.js` to import from `./gen4/*.json`. Rename all `sinnohDex` → `regionalDex`, `pokemonBySinnohDex` → `pokemonByRegionalDex`. Keep top-level exports for now (no `useDataset` yet).
5. Run a project-wide rename pass: every component file, every page, every `useParams` consumer. Find with `grep -r "sinnoh_dex\|sinnohDex\|pokemonBySinnohDex" src/`. Update each file.
6. Update the Python pipeline output field name: in `fetch_pokeapi.py`, change `"sinnoh_dex": sinnoh_num` to `"regional_dex": sinnoh_num`. (The script doesn't need re-running yet — we already moved the existing JSON.)
7. Manually edit the existing `src/data/gen4/pokemon.json` to globally rename `"sinnoh_dex"` → `"regional_dex"` (one find-replace). Same for `"national_dex"` adjacency in `locations.json` and `evolutions.json` if they reference sinnoh_dex (check and update).
8. Add a smoke test: `src/utils/dataLoader.test.js` verifying the dataset loads and indexes work.

**Tests:**
```
src/utils/dataLoader.test.js
├── pokemonByRegionalDex.get(1) returns Turtwig
├── pokemonByRegionalDex.get(210) returns the last Sinnoh entry
├── pokemonByName.get('garchomp') returns Garchomp with regional_dex set
├── moves['tackle'] exists and has expected shape
├── locations['route-201'] exists with encounters array
└── typeChart.matrix.Fire.Grass === 2
```

**Definition of Done:**
- [ ] `npm test` — smoke tests pass (0 failures)
- [ ] `npm run dev` starts at http://localhost:5173 with no console errors
- [ ] Manual: navigate to `/`, see the Pokémon list rendering as before
- [ ] Manual: tap Turtwig, detail view loads with all sections functional
- [ ] Manual: search for "garchomp", tap, see detail; tap evolution chain, navigate to Gible
- [ ] Manual: pin a Pokémon to team; reload page; team persists
- [ ] Behavioral: no references to `sinnoh_dex` remain in the codebase (`grep -r "sinnoh_dex" src` returns nothing)
- [ ] Git commit: `Phase 1: Schema migration to regional_dex + Gen 4 data relocation + Vitest setup`

**⏸️ CHECKPOINT:** Stop and ask Kyle to review.
- Summary: Schema is now gen-agnostic. All 210 Sinnoh Pokémon load from `src/data/gen4/`. Vitest installed; 6 smoke tests passing.
- Test instructions: navigate the existing app — list, detail, search, team. Everything should be identical to before. If anything is broken, this phase needs fixing before continuing.
- Known limitation: still no Gen 5; routes are still gen-implicit.

---

### Phase 2: Gen 5 data pipeline

**Goal:** `src/data/gen5/` exists with all 5 JSON files populated for the Unova B/W dex (156 Pokémon, Black-version-filtered). 156 new sprite PNGs are downloaded into `public/sprites/`. The app is not yet wired to use this data — it just exists on disk.

**Build:**
1. Modify `scripts/fetch_pokeapi.py`:
   - Add `argparse` for `--gen {4,5}` flag (default 4)
   - Parameterize the pokedex endpoint (gen 4: `pokedex/6`; gen 5: `pokedex/8`)
   - Parameterize `version_group` (`platinum` / `black-white`) and `version` (`platinum` / `black`)
   - Parameterize the output directory (`src/data/gen{N}/`)
   - Add a `WHITE_EXCLUSIVES` constant: hardcoded set of Pokémon names that are White-exclusive in Black/White (Zekrom, Thundurus, Solosis, Duosion, Reuniclus, Rufflet, Braviary, Vanillite, Vanillish, Vanilluxe, Reshiram[no — Black], Plus a couple more — accurate list goes in code)
   - For each Pokémon, set `version_exclusive`: `"white"` if in `WHITE_EXCLUSIVES`, else `null`
   - For White-exclusives, skip encounter fetching (the encounters list will be empty anyway since version=black)
2. Create `scripts/download_sprites.py`:
   - Reads `src/data/gen{N}/pokemon.json`
   - For each `national_dex` not already in `public/sprites/`, downloads from `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`
   - Saves to `public/sprites/{id}.png`
   - Skip files that already exist
   - Same 0.6s sleep as the main fetch script
3. Run `python scripts/fetch_pokeapi.py --gen 5` to produce `src/data/gen5/*.json`
4. Run `python scripts/download_sprites.py --gen 5` to download sprites #494–649
5. Manually spot-check the output:
   - 156 Pokémon, regional_dex 1–156 with no gaps
   - Snivy (#1), Tepig (#5), Oshawott (#9), Reshiram (~149), Zekrom (~150)
   - Reshiram has flavor text from Black version
   - Zekrom marked `version_exclusive: "white"`
   - Locations include "pinwheel-forest", "desert-resort", etc.
6. Verify all 156 sprites are in `public/sprites/`

**Tests:**
```
scripts/fetch_pokeapi.py — manual validation
├── Output has exactly 156 Pokémon (assert in script)
├── regional_dex values are 1–156 with no gaps (assert in script)
├── Every Pokémon has at least one level-up move (warn if not)
├── White-exclusives flagged: zekrom, thundurus, solosis line, rufflet line, vanillite line
├── Snivy, Tepig, Oshawott (starters) present at expected dex numbers
└── type_chart.json is identical to gen4's (17x17, no Fairy)

src/utils/dataLoader.test.js (extended — but loader not modified yet, so skip until Phase 3)
```

**Definition of Done:**
- [ ] `python scripts/fetch_pokeapi.py --gen 5` runs cleanly with the script's own assertions passing
- [ ] `python scripts/download_sprites.py --gen 5` completes; `ls public/sprites/ | wc -l` returns 367 (211 + 156)
- [ ] `src/data/gen5/pokemon.json` has 156 entries
- [ ] Spot-check: Reshiram has Black flavor text, Zekrom has `"version_exclusive": "white"`
- [ ] `src/data/gen5/type_chart.json` exists and matches gen4's structure
- [ ] App still works (`npm run dev` → `/`) — Gen 4 unaffected
- [ ] Git commit: `Phase 2: Gen 5 data pipeline + 156 Unova sprites`

**⏸️ CHECKPOINT:** Stop and ask Kyle to review.
- Summary: Gen 5 data files generated and committed. 156 new sprites downloaded. Pipeline now supports `--gen` flag.
- Test instructions: open `src/data/gen5/pokemon.json` and skim a few entries (Snivy, Reshiram, Zekrom). Confirm sprite for Snivy at `public/sprites/495.png` displays correctly when opened. The app itself shows no visible change yet.
- Known limitation: data exists but nothing in the UI uses it yet.

---

### Phase 3: Generation context + URL namespacing

**Goal:** Gen-namespaced routes work. Both `/gen4` and `/gen5` are reachable. Active generation is stored in localStorage. Deep-linking to a gen-5 URL switches the active gen automatically. The Pokédex/Routes/Moves/Types tabs all work correctly under `/gen5`. Settings tab is NOT yet built.

**Build:**
1. Create `src/context/GenerationContext.jsx`: provider, hook, localStorage persistence (key: `platinum-pokedex-active-gen`)
2. Create `src/components/routes/GenSyncRoute.jsx` (NEW — note: location should probably be `src/components/shared/` since it's not route-specific). The wrapper that syncs URL gen with context.
3. Modify `src/utils/dataLoader.js`:
   - Import both gens' files
   - Create per-gen indexes: `pokemonByRegionalDex = { 4: Map(...), 5: Map(...) }` etc.
   - Export a `useDataset()` hook: reads `useGenerationContext()`, returns the active gen's bundle
4. Modify `src/App.jsx`:
   - Wrap routes in `<GenerationProvider>` (outermost)
   - Restructure `<Routes>` to have a `/` redirect, two gen-namespaced groups, and a `*` fallback
   - Each gen-namespaced page wraps in `<GenSyncRoute gen={4 | 5}>`
5. Migrate every component reading top-level dataLoader exports to use `useDataset()`:
   - `PokemonList.jsx`, `PokemonDetail.jsx`, `MoveList.jsx`, `MoveDetail.jsx`, `RouteList.jsx`, `RouteDetail.jsx`, `EvolutionChain.jsx`, `TypeChart.jsx`
   - All `Link to=` paths become `to={\`/gen${activeGen}/...\`}` — most easily done by reading `useGenerationContext()` in those components
6. Modify `BottomNav.jsx`: tabs link to `/gen{activeGen}/...`. Settings tab NOT added yet (Phase 4).
7. Create a minimal `src/pages/NotFoundPage.jsx` for the `*` route.
8. Confirm Header still hardcodes "SINNOH — PLATINUM" — dynamic label is Phase 4.

**Tests:**
```
src/context/GenerationContext.test.jsx
├── default activeGen is 4 when localStorage is empty
├── reads activeGen from localStorage on initial render
├── falls back to 4 if localStorage has invalid value
├── setActiveGen updates state and writes to localStorage
└── multiple consumers all see the updated value after setActiveGen

src/utils/dataLoader.test.js (extended)
├── useDataset() returns gen 4 dataset when activeGen is 4
├── useDataset() returns gen 5 dataset when activeGen is 5
├── gen 5 dataset has exactly 156 Pokémon
└── gen 5 typeChart has 17 types

src/components/shared/GenSyncRoute.test.jsx
├── renders children when URL gen matches context gen
├── calls setActiveGen when URL gen differs from context gen
└── after setActiveGen, dataset switches to URL gen
```

**Definition of Done:**
- [ ] `npm test` — all tests pass
- [ ] `npm run dev` opens to `/` and redirects to `/gen4`
- [ ] Manual: navigate to `/gen4/pokemon/1` — Turtwig detail loads
- [ ] Manual: in URL bar type `/gen5/pokemon/1` — Snivy detail loads
- [ ] Manual: after the gen-5 deep link, the Pokédex tab now shows the Unova list (156 entries) — active gen switched
- [ ] Manual: tap a Pokémon in the Unova list, navigates to `/gen5/pokemon/:dex`
- [ ] Manual: tap Routes tab → `/gen5/routes` shows Unova locations (Pinwheel Forest etc.)
- [ ] Manual: navigate to `/garbage` — NotFoundPage displays
- [ ] Manual: localStorage `platinum-pokedex-active-gen` updates on each gen switch (DevTools → Application)
- [ ] Behavioral: refresh the page on `/gen5/...` — stays on gen 5
- [ ] Git commit: `Phase 3: GenerationContext + gen-namespaced routes + dataset switching`

**⏸️ CHECKPOINT:** Stop and ask Kyle to review.
- Summary: The app now serves both gens via URL prefix. Deep links work. Active gen is sticky.
- Test instructions: paste `/gen5/pokemon/1` into the URL bar — should land on Snivy. Then tap the Routes and Moves tabs to confirm gen-5 data loads. Type `/gen4/pokemon/1` — should switch back to Turtwig and Sinnoh data. Refresh while on gen-5 — should stay on gen-5.
- Known limitations: no Settings tab yet; Header still says "SINNOH — PLATINUM" even on gen-5 pages; team is still global (not yet per-gen); White-exclusive labeling not yet shown.

---

### Phase 4: Settings tab + per-gen team + dynamic UI labels

**Goal:** A Settings tab in the bottom nav lets the user toggle gens explicitly. The Header subtitle reflects the active gen. The team is per-gen, with safe migration of existing localStorage. The TypeChart label reflects the active gen.

**Build:**
1. Create `src/pages/SettingsPage.jsx` per Component Inventory spec
2. Modify `src/components/layout/BottomNav.jsx`:
   - Add 5th tab: Settings (icon: gear or similar; label: "Settings"; path: `/settings`; not gen-prefixed)
   - Adjust flex layout if needed (5 equal tabs)
   - Settings tab always shows regardless of gen
3. Modify `src/App.jsx`: add `<Route path="/settings" element={<SettingsPage />} />`
4. Modify `src/components/layout/Header.jsx`:
   - Read `useGenerationContext()`
   - Subtitle text: gen 4 → "SINNOH — PLATINUM"; gen 5 → "UNOVA — BLACK"
   - LED dot color: gen 5 uses a slight blue-tint (#41a7ff) (optional minor visual cue)
5. Modify `src/components/types/TypeChart.jsx`: heading reads `\`TYPE CHART — GEN ${activeGen}\``
6. Modify `src/hooks/useTeam.js`:
   - Accept `gen` parameter
   - Storage key: `\`platinum-pokedex-team-gen${gen}\``
   - Migration on first mount: if legacy `platinum-pokedex-team` exists AND new `gen4` key is empty/null, copy legacy → gen4 key, then `localStorage.removeItem('platinum-pokedex-team')`
7. Modify `src/context/TeamContext.jsx`:
   - Maintain both `useTeam(4)` and `useTeam(5)` instances
   - Expose the active one based on `useGenerationContext()`
   - When the user toggles gen, the team in `TeamTray` swaps automatically

**Tests:**
```
src/hooks/useTeam.test.js
├── initial state is empty array
├── toggleTeam adds a regional_dex
├── toggleTeam removes if already present
├── toggleTeam respects MAX_TEAM (6)
├── persists to gen-specific localStorage key
├── different gens have independent team arrays
├── legacy migration: copies platinum-pokedex-team → -gen4 on first mount
├── legacy migration: deletes legacy key after copying
└── legacy migration: no-op if -gen4 key already populated

src/pages/SettingsPage.test.jsx
├── renders both generation buttons
├── active gen button has visual selected state
├── tapping inactive gen button calls setActiveGen
├── tapping inactive gen button navigates to /gen{n}
└── tapping active gen button is a no-op (no navigation)

src/components/layout/Header.test.jsx
├── renders "SINNOH — PLATINUM" when activeGen is 4
└── renders "UNOVA — BLACK" when activeGen is 5

src/components/layout/BottomNav.test.jsx
├── renders 5 tabs including Settings
├── Pokédex tab links to /gen{activeGen}
├── Settings tab links to /settings (no gen prefix)
└── active tab gets the highlighted style
```

**Definition of Done:**
- [ ] `npm test` — all tests pass
- [ ] Manual: tap Settings tab — page renders with both gen buttons
- [ ] Manual: with gen 4 active, tap "UNOVA — BLACK" → navigates to `/gen5`, Pokédex shows Unova list, Header subtitle updates
- [ ] Manual: navigate to Types tab — heading reads "TYPE CHART — GEN 5"
- [ ] Manual: pin some Pokémon to gen-5 team. Switch to gen 4 via Settings. Team tray shows the (different) gen-4 team. Switch back — gen-5 team is still there.
- [ ] Manual: open DevTools → Application → localStorage. Confirm three keys exist: `platinum-pokedex-active-gen`, `platinum-pokedex-team-gen4`, `platinum-pokedex-team-gen5`. The legacy `platinum-pokedex-team` is gone.
- [ ] Behavioral: if Kyle had a team pre-migration, that team now appears as his gen-4 team
- [ ] Git commit: `Phase 4: Settings tab + per-gen team + dynamic UI labels`

**⏸️ CHECKPOINT:** Stop and ask Kyle to review.
- Summary: Full toggle UX in place. Header, type chart, and team all gen-aware. Legacy team data preserved.
- Test instructions: focus on the team migration. If you have a pre-existing team from before this work, confirm it's still there under gen 4. Switch to gen 5, build a different team, switch back — both teams should persist independently.
- Known limitations: White-exclusive Pokémon (Zekrom, Solosis line, Rufflet line, Vanillite line, Thundurus) don't yet show the "WHITE EXCLUSIVE" label.

---

### Phase 5: Black exclusives, polish, edge cases

**Goal:** White-exclusive Pokémon are clearly labeled in their detail views. Edge cases (404, invalid gen segments, missing sprites) are handled gracefully. Final responsive pass.

**Build:**
1. Modify `src/components/pokemon/PokemonDetail.jsx`:
   - After flavor text screen, if `p.version_exclusive === 'white'`, render the version-exclusive badge
   - Style per UI/UX section
2. Add CSS class `.version-exclusive-badge` to `pokedex-theme.css` (red bar, white pixel-text)
3. Modify `src/App.jsx`: add a route guard for invalid gen segments (`/gen6/*`, `/gen99/*` etc.) → render `NotFoundPage`. Easiest implementation: only `/gen4/*` and `/gen5/*` are matched explicitly; everything else falls to `*`.
4. Add a sprite fallback: in `dataLoader.js`'s `spriteUrl()`, if a sprite fails to load (handled via component-level `<img onError>`), show a placeholder. Implement minimal fallback in PokemonCard / detail (an `onError` handler that swaps to a generic missing-sprite gray box). Optional polish — skip if time-constrained.
5. Manual responsive sweep: Pokédex/Routes/Moves/Settings tabs on iPhone 14 Pro viewport (390×844), iPad (768×1024), and desktop (1440×900). Confirm the 5-tab nav fits without overflow.
6. Verify deep-link gen sync works for ALL gen-namespaced routes, not just Pokémon detail (Routes, Moves, Types).
7. Verify the type chart renders correctly when switched (it's the same data, but confirm).

**Tests:**
```
src/components/pokemon/PokemonDetail.test.jsx
├── no version-exclusive badge for null
├── no version-exclusive badge for "black"
├── shows "WHITE EXCLUSIVE · TRADE ONLY" badge for "white"
└── badge has red background and white text

src/App.test.jsx (integration)
├── / redirects to /gen{activeGen}
├── /gen4/pokemon/1 renders Turtwig detail
├── /gen5/pokemon/1 renders Snivy detail
├── /gen5/pokemon/zekrom (or /gen5/pokemon/{zekrom-dex}) shows the white-exclusive badge
├── /gen6/anything renders NotFoundPage
├── /garbage renders NotFoundPage
└── deep link to /gen5/routes from a fresh load (gen 4 active) switches to gen 5
```

**Definition of Done:**
- [ ] `npm test` — all tests pass
- [ ] Manual on iPhone viewport: Settings tab fits. All 5 tabs visible.
- [ ] Manual: navigate to Zekrom (gen 5) detail. "WHITE EXCLUSIVE · TRADE ONLY" badge visible.
- [ ] Manual: navigate to Reshiram (gen 5) detail. NO badge (Black-exclusive ≠ White-exclusive).
- [ ] Manual: navigate to Turtwig (gen 4) detail. NO badge.
- [ ] Manual: try `/gen6/pokemon/1` → 404 page renders
- [ ] Manual: try `/totally/garbage/path` → 404 page renders
- [ ] Manual: from gen 4 active, paste `/gen5/routes` — lands on Unova route list, active gen is now 5
- [ ] Behavioral: `npm run build && npm run preview` — production build works, all routes function
- [ ] Git commit: `Phase 5: Version-exclusive labels + 404 + edge case polish`

**⏸️ CHECKPOINT:** Stop and ask Kyle to review.
- Summary: Full Gen 5 expansion complete. White-exclusives labeled, edge cases handled, responsive on iPhone.
- Test instructions: full smoke test. Try every tab in both gens. Switch gens via Settings several times. Deep-link a gen-5 URL from a fresh tab. Build for production and preview. Anything broken is a regression to fix before merging.
- Known limitations (deferred to future): no B2W2 dex, no White-version mode, no Gen 6+ data.

---

## Dependency List

### `package.json` after Phase 1

```json
{
  "name": "platinum-pokedex",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4",
    "vitest": "^1.3.0"
  }
}
```

### `scripts/requirements.txt`
Unchanged (just `requests`).

---

## Tricky Parts — Notes for Claude Code

🔴 **Hard: Schema rename without breaking the running app.** The `sinnoh_dex` → `regional_dex` rename touches ~25 files and the JSON itself. Order of operations matters: rename in JSON first, then in `dataLoader.js`, then in every consumer. Use a single grep pass at the end (`grep -rn "sinnoh_dex\|sinnohDex" src`) to confirm zero references remain. URL params change from `:sinnohDex` to `:regionalDex` — easy to miss in a `useParams` destructure.

🔴 **Hard: Deep-link gen sync without infinite loops.** The `GenSyncRoute` wrapper calls `setActiveGen` in `useEffect` when URL gen ≠ context gen. If `setActiveGen` triggers a navigation, you can loop. Mitigation: only set, don't navigate, in `GenSyncRoute`. Navigation is `SettingsPage`'s job. Also: include `activeGen` in the effect's dependency array, but check the equality first — `if (activeGen !== gen) setActiveGen(gen)` — to avoid a no-op write triggering re-renders.

🟡 **Medium: localStorage migration must be idempotent.** The legacy-team migration runs every time `useTeam` mounts. If it ran on each mount unconditionally, it would clobber updates the user made after the first migration. The check must be: legacy key exists AND new gen-4 key is empty. Do this once in a `useEffect` with `[]` deps so it runs only on mount.

🟡 **Medium: White-exclusive list is hardcoded.** PokeAPI doesn't expose "this Pokémon is X-version exclusive" cleanly. The pipeline ships with a constant. Source from Bulbapedia for accuracy:
```python
WHITE_EXCLUSIVES = {
    "zekrom", "thundurus",
    "solosis", "duosion", "reuniclus",
    "rufflet", "braviary",
    "vanillite", "vanillish", "vanilluxe",
    "petilil", "lilligant",
    "purrloin", "liepard",  # Wait — confirm. These are Black-exclusive.
}
```
**Important:** Get this list right by cross-referencing Bulbapedia's Black/White version exclusives table. White exclusives (NOT in Black, only via trade): Tirtouga line, Throh, Petilil line, Vullaby line, Solosis line, Rufflet line, Vanillite line, Zekrom, Thundurus, Reshiram is BLACK-exclusive (so `null`), etc. Treat the constant as data, double-check against the source.

🟡 **Medium: BottomNav tab layout for 5 tabs.** Existing CSS uses `flex-1` for 4 equal tabs. Adding a 5th still works with `flex-1`, but each tab is now ~78px wide on iPhone 14 Pro instead of ~97px. Confirm the icon+label still fits without truncation. May need to shrink the label font from 0.55rem to 0.5rem.

🟢 **Easy: TypeChart label.** Just a string interpolation. The chart data is identical between gens.

🟢 **Easy: Header subtitle.** Same pattern as TypeChart — just a string interpolation from `useGenerationContext()`.

🟢 **Easy: Sprite downloads.** Reusable Python script. Just a loop with HTTP gets and a sleep.

---

## How to Update for Future Generations

This section makes it easy to add Gen 6, Gen 7, etc. once Black is shipped. **Paste the entire spec section below into a fresh Claude Code conversation along with this `GEN5_SPEC.md` for reference.**

### Adding a new generation — checklist

For a new generation N (e.g., Gen 6 X/Y, Gen 7 Sun/Moon):

1. **Identify the right PokeAPI endpoints:**
   - Find the regional pokedex ID at `https://pokeapi.co/api/v2/pokedex/`
   - Find the version_group name (`x-y`, `sun-moon`, `sword-shield`, etc.)
   - Find the version name (`x` / `y` / `sun` / `moon` — pick which version's data to use)

2. **Update the data pipeline** (`scripts/fetch_pokeapi.py`):
   - Add a new branch for `--gen N` mapping to the right pokedex ID, version_group, version
   - If the gen introduces new types (Gen 6 added Fairy!), the type chart must expand. Update `GEN_TYPES = { 4: [...], 5: [...], 6: [...18 with Fairy] }`. Type chart will be 18×18 from Gen 6 onward.
   - Add a `WHITE_EXCLUSIVES`-equivalent constant for the chosen version (e.g., `Y_EXCLUSIVES`) and apply the same logic
   - Run: `python scripts/fetch_pokeapi.py --gen N` and `python scripts/download_sprites.py --gen N`

3. **Update the data loader** (`src/utils/dataLoader.js`):
   - Import the new gen's JSON files
   - Add to per-gen indexes: `pokemonByRegionalDex[N] = ...`, etc.

4. **Update the routes** (`src/App.jsx`):
   - Add a `<Route path="/genN/...">` group mirroring the existing structure

5. **Update the gen toggle** (`src/pages/SettingsPage.jsx`):
   - Add a new button for the new gen with the appropriate region label (e.g., "KALOS — Y")

6. **Update the Header** (`src/components/layout/Header.jsx`):
   - Add the subtitle mapping for gen N

7. **Update useTeam migration logic if needed:**
   - The pattern for `platinum-pokedex-team-gen{N}` already supports any gen — just pass `useTeam(N)` in `TeamContext.jsx`

8. **Type chart caveat for Gen 6+:**
   - The Fairy type changes type matchups. The TypeChart component's `TYPES` array is currently from `typeChart.types`, which is gen-aware via `useDataset()`. So adding Fairy automatically expands the grid for Gen 6 — IF the pipeline outputs it.
   - The `TYPE_COLORS` constant in `TypeChart.jsx` will need a Fairy entry: `Fairy: '#EE99AC'`

9. **Visual cue (optional):**
   - Header LED dot color could shift per gen for distinguishability

### Files that always need to change for a new gen
- `scripts/fetch_pokeapi.py` (gen branching)
- `src/utils/dataLoader.js` (imports + indexes)
- `src/App.jsx` (routes)
- `src/pages/SettingsPage.jsx` (toggle button)
- `src/components/layout/Header.jsx` (subtitle)
- `src/context/TeamContext.jsx` (instantiate `useTeam(N)`)
- `src/data/genN/*.json` (5 new files)
- `public/sprites/*.png` (new sprite range)

### Files that rarely need to change
- Component logic (already gen-agnostic via `useDataset()`)
- `pokedex-theme.css` (theme is gen-neutral)
- `useTeam.js` (already parameterized)
- All `pages/*.jsx` (read from active gen)

### Common gotchas for future gens
- **Gen 6+ adds Fairy.** Type chart expands to 18×18. The `TYPES` constant in `TypeChart.jsx` is read from data, so this should "just work" — but verify.
- **Gen 7 introduces regional forms (Alolan).** The pipeline ignores forms by default; if you want them, that's an additional schema change.
- **Gen 8 introduces Galarian forms and dynamax.** Same concern as forms.
- **Mega evolutions (Gen 6).** Out of scope unless explicitly added — separate forms in PokeAPI.
- **National dex sprite numbering.** As of Gen 8, PokeAPI sprites for newer Pokémon may be in a different sub-folder. Verify the sprite URL pattern still resolves.

---

## Future Considerations (deferred, not in this spec)

- Pokémon White version mode (and B/W version toggle within Gen 5)
- Black 2 / White 2 (different pokedex, different exclusives, hidden grottos)
- Move tutor data for B2W2-only tutors
- Hidden grottos and seasonal encounters
- A "compare gens" mode (e.g., "show me all Pokémon that appear in both Sinnoh and Unova dexes")
- Shiny sprite toggle
- Shiny encounter rate display
