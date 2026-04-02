# Platinum Pokédex — Session Context

Read this file at the start of a new session to get up to speed instantly.
Reference the full project plan in `pokedex-project-plan.md` for detailed specs.

---

## What this project is

A static, mobile-first Pokédex web app for Pokémon Platinum (Sinnoh regional dex,
210 Pokémon). Retro Gen 1 anime Pokédex aesthetic — red/cream palette, CRT green
screen areas. Primary target: iPhone 14 Pro in Firefox. Hosted on GitHub Pages.

**Repo:** https://github.com/kyleyasumiishi/platinum-pokedex.git

**Tech stack:** React 18 + Vite + React Router v6 + Tailwind CSS v3. No backend.
All data is pre-fetched static JSON. Sprites are committed to the repo (offline-capable).

---

## Current status: Phase 2 complete, Phase 3 is next

### Phase 1 — Data Pipeline ✅ DONE
- `scripts/fetch_pokeapi.py` fetches all data from PokeAPI (run once, outputs JSON)
- `scripts/cache/` — raw API response cache (gitignored, speeds up re-runs)
- `src/data/pokemon.json` — 210 Pokémon with stats, moves, encounters, type matchups
- `src/data/moves.json` — 426 moves with learned_by cross-references
- `src/data/locations.json` — 154 Sinnoh locations with encounter tables
- `src/data/evolutions.json` — 95 evolution chains (nested tree structure, handles branching)
- `src/data/type_chart.json` — 17×17 Gen 4 type effectiveness matrix
- `public/sprites/{nationalDexId}.png` — all 210 sprites committed locally (no CDN dependency)

### Phase 2 — App Scaffolding ✅ DONE
The React app is wired up and running. Dev server: `npm run dev` → http://localhost:5173/platinum-pokedex/

Key files created:
- `src/main.jsx` — entry point, mounts React into #root
- `src/App.jsx` — BrowserRouter with basename, Header + BottomNav always mounted, Routes swap content
- `src/index.css` — Tailwind imports + imports pokedex-theme.css
- `src/styles/pokedex-theme.css` — ALL visual identity: CSS variables, CRT scanline effect, type badge colors, screen insets, sprite pixelation
- `src/utils/dataLoader.js` — imports all JSON, builds Map indexes for O(1) lookup, exports spriteUrl() helper
- `src/components/layout/Header.jsx` — fixed top bar, Pokédex red, pixel font, LED dot
- `src/components/layout/BottomNav.jsx` — fixed bottom tab bar, 4 tabs, active state highlights green
- `src/pages/PokedexPage.jsx` — placeholder grid of all 210 Pokémon (will be replaced in Phase 3)
- `src/pages/RoutesPage.jsx` — placeholder list of locations
- `src/pages/MovesPage.jsx` — placeholder list of moves with type badges
- `src/pages/TypesPage.jsx` — working 17×17 type chart with color-coded cells

Config files:
- `vite.config.js` — base: '/platinum-pokedex/' for GitHub Pages
- `tailwind.config.js` — custom colors: dex-red, dex-cream, screen-bg, screen-green, etc.
- `postcss.config.js`
- `package.json`

### Phase 3 — Pokédex Browser 🔜 NEXT
Build the real Pokémon list and detail views. Per the project plan:

**List view (`/`):**
- Scrollable list of all 210 Pokémon
- Each card: Sinnoh dex #, sprite, name, type badge(s)
- Search: fuzzy/partial match on name and dex number
- Filters: type (multi-select), evolution method
- Sort: Sinnoh dex # (default), alphabetical, base stat total

**Detail view (`/pokemon/:sinnohDex`):**
Above-fold on iPhone 14 Pro (no scroll needed): sprite, name, Sinnoh #, national #, types, flavor text.

Collapsible sections (all collapsed by default):
1. Moves — sub-tabs: Level-Up | TM/HM | Tutor | Egg
2. Locations — where to find in Platinum, tappable links to route detail
3. Evolution — visual chain with sprites and method labels
4. Stats — horizontal bar chart, color-coded
5. Details — abilities, height/weight, catch rate, gender ratio, egg groups, hatch steps, held items
6. Type Matchups — weak/resistant/immune grouped by multiplier

Cross-links: move names → `/moves/:moveId`, location names → `/routes/:locationId`

---

## Key architectural decisions already made

- **Sprite URLs:** stored in JSON as `sprites/387.png` (no leading slash). The `spriteUrl(nationalDex)` helper in `dataLoader.js` prepends `import.meta.env.BASE_URL` so they resolve correctly in both dev (`/`) and GitHub Pages (`/platinum-pokedex/`).
- **Evolution chains:** nested tree structure in JSON (not flattened array). Branching chains (e.g. Ralts → Gardevoir/Gallade) are represented as arrays in `evolves_to`. The React component needs to handle both linear and branching cases.
- **Data indexes:** `dataLoader.js` builds Maps at import time. Use `pokemonByName.get('garchomp')` and `pokemonBySinnohDex.get(111)` — don't scan the array.
- **CSS classes to know:** `.screen` (CRT inset), `.screen-text` (green text), `.pixel-text` (Press Start 2P font), `.dex-card` (cream card), `.type-badge .type-fire` etc. (type colors), `.sprite` (pixelated rendering).
- **Fonts:** Press Start 2P (`font-pixel`) for headers/labels in screen areas. Share Tech Mono (`font-mono`) for data/body text in screen areas.

---

## How to run

```bash
npm run dev        # start dev server at http://localhost:5173/platinum-pokedex/
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

---

## What the developer wants

Kyle is learning React while building this. After writing code, explain:
- What you built (plain English)
- Why key decisions were made
- Key patterns to understand (hooks, props, Router, etc.)
- What files to read to understand the architecture

See `pokedex-project-plan.md` → "Claude Code Implementation Guidance" section for full details.
