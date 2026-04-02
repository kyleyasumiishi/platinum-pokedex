# Sinnoh Pokédex App — Project Plan

## Overview

Build a static, mobile-first Pokédex web app for **Pokémon Platinum (Gen 4)** covering the **Sinnoh regional dex (210 Pokémon)**. The app's visual identity is inspired by the **Gen 1 anime Pokédex** — red/cream color palette, green-on-dark "screen" areas for data display, and a retro-tech aesthetic. It is a personal gameplay companion tool, primarily used on an **iPhone 14 Pro via Firefox**, but must also work well on iPad and desktop. Hosted on **GitHub Pages**.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React (with React Router) | Component-based, good fit for cross-linked data views |
| Build Tool | Vite | Fast builds, simple GitHub Pages deployment |
| Styling | Tailwind CSS + custom CSS theme file | Tailwind for layout/utilities, custom CSS for the Pokédex aesthetic |
| Data Source | PokeAPI (pokeapi.co) — pre-fetched at build time | Python script fetches all data, outputs static JSON files |
| Persistence | localStorage | Team/favorites pins, no auth needed |
| Deployment | GitHub Pages via GitHub Actions | Push to main → build → deploy |
| Target Browser | Firefox on iOS (iPhone 14 Pro primary), Safari, Chrome | Responsive: iPhone 14 Pro → iPad → desktop |

---

## Visual Design Direction

**Aesthetic: Gen 1 Anime Pokédex — Retro Tech Device**

NOT a literal hardware frame around the screen (to preserve usable space across devices), but the look and feel conveyed through color palette, typography, and UI styling:

**Color Palette:**
- Primary: Pokédex red (#CC0000 range) for headers, navigation, accents
- Secondary: Cream/off-white for card backgrounds and content areas
- Screen areas: Dark background (#1a1a2e or similar dark blue-black) with green-tinted text/data (#00ff41 or similar CRT green) for the "digital readout" feel
- Use the green-on-dark screen treatment for data-heavy sections (stats, move tables, encounter tables)
- Subtle scan-line or CRT texture overlay on screen areas for authenticity

**Typography:**
- Monospace or pixel/retro font for data in "screen" areas (stats, numbers, move data)
- Clean but slightly retro sans-serif for headers and navigation
- Avoid generic fonts (no Inter, Roboto, Arial) — lean into the tech/device aesthetic

**UI Patterns:**
- Rounded-rectangle "screen" insets for content areas (like the Pokédex display screen)
- Subtle LED indicator dots or light accents as decorative elements
- Pokémon type badges with official type colors
- Collapsible sections feel like toggling device panels open/closed
- Smooth but snappy transitions — this is a device, not a website
- Bottom tab bar (mobile) or sidebar (desktop) for navigation

**Sprites/Images:**
- Official game sprites from PokeAPI sprite URLs
- Use `image-rendering: pixelated` for clean pixel art upscaling
- Consider green tint or CRT filter on sprites in "screen" areas

---

## App Structure

### Navigation
Bottom tab bar with four tabs:
1. **Pokédex** (Pokémon browser — default/home view)
2. **Routes** (location browser)
3. **Moves** (move browser)
4. **Types** (type effectiveness chart)

Plus a persistent **Team** button for quick access to pinned favorites (localStorage).

---

### View 1: Pokédex Browser

**List View:**
- Scrollable list of all 210 Sinnoh dex Pokémon
- Each card shows: Sinnoh dex #, sprite thumbnail, name, type badge(s)
- **Search:** Fuzzy/partial text match on name (type "gib" → Gible). Also search by dex number.
- **Filters:** Type (multi-select), evolution method (level, stone, trade, friendship)
- **Sort:** Sinnoh dex # (default), alphabetical, base stat total

**Detail View (tap a Pokémon):**

*Visible by default (no scroll needed on iPhone 14 Pro):*
- Sprite (~120px, pixelated rendering)
- Name, Sinnoh dex #, National dex #
- Type badge(s)
- Flavor text / description (Platinum version)

*Collapsible sections (all collapsed by default):*

1. **Moves** — Sub-tabs: Level-Up | TM/HM | Tutor | Egg Moves
   - Level-Up: Level, Move Name (tappable link to Move detail), Type badge, Category (Physical/Special/Status), Power, Accuracy, PP
   - TM/HM: TM# , Move Name, Type, Category, Power, Accuracy, PP
   - Tutor: Move Name, Type, Category, Power, Accuracy, PP
   - Egg: Move Name, Type, Category, Power, Accuracy, PP

2. **Locations** — Where to find this Pokémon in Platinum
   - Route/Area (tappable link to Route detail), Method (grass/surf/fishing/etc.), Level range, Encounter rate %, Time of day (Morning/Day/Night/All)
   - Special encounters labeled: Swarm, Trophy Garden, etc.

3. **Evolution** — Visual evolution chain
   - Sprite → method label → Sprite (e.g., Turtwig →Lv18→ Grotle →Lv32→ Torterra)
   - Methods: level, stone (specify which), trade, trade with item, friendship, friendship + time of day, etc.
   - Each Pokémon in the chain is tappable to navigate to its detail page

4. **Stats** — Base stats display
   - HP, Attack, Defense, Sp. Atk, Sp. Def, Speed
   - Horizontal bar chart with stat values (color-coded: green for high, red for low)
   - Base stat total shown

5. **Details** — Miscellaneous info
   - Abilities (regular + hidden ability, labeled)
   - Height and weight
   - Catch rate
   - Gender ratio (% male / % female / genderless)
   - Egg groups
   - Hatch steps (egg cycles)
   - Wild held items (common / rare with % chances)

6. **Type Matchups** — Defensive matchups for this Pokémon
   - Weak to (2x, 4x)
   - Resistant to (0.5x, 0.25x)
   - Immune to (0x)
   - Displayed as type badges grouped by multiplier

---

### View 2: Route Browser

**List View:**
- All Platinum routes/areas/caves/cities with encounters
- Grouped by region progression (early game → late game → post-game)
- Search by route name/number

**Detail View (tap a route):**
- Route name and description
- Encounter table showing all available Pokémon:
  - Pokémon name + sprite (tappable to Pokédex detail)
  - Method (tall grass, surfing, old rod, good rod, super rod, etc.)
  - Level range
  - Encounter rate %
  - Time of day (Morning / Day / Night / All)
- Separate sections for special encounter types: Swarm Pokémon, Trophy Garden daily rotations
- Filterable by method and time of day

---

### View 3: Move Browser

**List View:**
- All moves learnable by Sinnoh dex Pokémon
- Each row: Move name, type badge, category icon (Physical/Special/Status), power
- **Search:** Fuzzy match on move name
- **Filters:** Type, category (Physical/Special/Status), learn method
- **Sort:** Alphabetical (default), by power, by type

**Detail View (tap a move):**
- Move name
- Type badge
- Category (Physical / Special / Status) with icon
- Power (or "—" for status)
- Accuracy (or "—" if always hits)
- PP
- Priority (if non-zero, e.g., Quick Attack = +1)
- Effect/description text (e.g., "May cause the target to flinch." or "Raises user's Attack by one stage.")
- **"Learned by" section:** List of all Sinnoh dex Pokémon that learn this move, grouped by method (level-up with level shown, TM/HM, tutor, egg). Each Pokémon tappable to its detail page.

---

### View 4: Type Effectiveness Chart

- Interactive 17x17 grid (Gen 4 types — no Fairy type)
- Types: Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel
- Rows = attacking type, Columns = defending type
- Cells colored: green (2x super effective), red (0.5x not very effective), black/dark (0x immune), neutral (1x)
- Tap a type header to highlight its full row (offensive) and column (defensive)
- Clear, readable on mobile — may need horizontal scroll or a tap-to-focus interaction

---

### Team / Favorites Feature

- **Master Ball icon** as the favorite/pin toggle on each Pokémon card and detail view (use the Master Ball sprite from PokeAPI's item sprites: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png`). Greyed out when not favorited, full color when pinned. This replaces a generic heart/star — it's thematically perfect.
- Pinned Pokémon stored in localStorage (persists across sessions, no login)
- Team tray accessible from any view via a persistent button (Master Ball icon in the nav or floating)
- Shows up to 6 pinned Pokémon with sprites, tappable to their detail pages
- Easy remove from team (tap the Master Ball again to unpin)
- Max 6 for a "party" feel, or unlimited favorites with the top 6 displayed as the active team

---

## Data Pipeline

### Architecture
A Python script (`scripts/fetch_pokeapi.py`) runs locally to pre-fetch all data from PokeAPI and output clean, Platinum-specific JSON files. These JSON files are committed to the repo and ship as static assets with the built app. No runtime API calls.

### Output Files (committed to repo under `src/data/`)

**`pokemon.json`** — Array of 210 objects, one per Sinnoh dex Pokémon:
```json
{
  "sinnoh_dex": 1,
  "national_dex": 387,
  "name": "Turtwig",
  "types": ["Grass"],
  "description": "Platinum flavor text here...",
  "sprite_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/387.png",
  "base_stats": { "hp": 55, "attack": 68, "defense": 64, "sp_atk": 45, "sp_def": 55, "speed": 31 },
  "base_stat_total": 318,
  "abilities": { "regular": ["Overgrow"], "hidden": "Shell Armor" },
  "height": 0.4,
  "weight": 10.2,
  "catch_rate": 45,
  "gender_ratio": { "male": 87.5, "female": 12.5 },
  "egg_groups": ["Monster", "Grass"],
  "hatch_steps": 5140,
  "held_items": [],
  "evolution_chain_id": 1,
  "moves": {
    "level_up": [
      { "level": 1, "move_id": "tackle" },
      { "level": 5, "move_id": "withdraw" }
    ],
    "tm_hm": ["tm86-grass-knot", "hm01-cut"],
    "tutor": ["earth-power"],
    "egg": ["seed-bomb", "worry-seed"]
  },
  "encounters": [
    {
      "location": "route-201",
      "method": "tall-grass",
      "level_range": [5, 5],
      "rate_percent": 10,
      "time_of_day": "all",
      "special": null
    }
  ],
  "type_matchups": {
    "weak_to_4x": [],
    "weak_to_2x": ["Fire", "Ice", "Poison", "Flying", "Bug"],
    "resistant_0_5x": ["Water", "Electric", "Grass", "Ground"],
    "resistant_0_25x": [],
    "immune_to": []
  }
}
```

**`moves.json`** — Object keyed by move ID:
```json
{
  "tackle": {
    "name": "Tackle",
    "type": "Normal",
    "category": "Physical",
    "power": 40,
    "accuracy": 100,
    "pp": 35,
    "priority": 0,
    "description": "A physical attack in which the user charges and slams into the target with its whole body.",
    "learned_by": {
      "level_up": { "turtwig": 1, "grotle": 1, "bidoof": 1 },
      "tm_hm": {},
      "tutor": {},
      "egg": {}
    }
  }
}
```

**`locations.json`** — Object keyed by location ID:
```json
{
  "route-201": {
    "name": "Route 201",
    "encounters": [
      {
        "pokemon_id": "starly",
        "pokemon_name": "Starly",
        "sinnoh_dex": 10,
        "method": "tall-grass",
        "level_range": [2, 3],
        "rate_percent": 50,
        "time_of_day": "all",
        "special": null
      }
    ]
  }
}
```

**`evolutions.json`** — Array of evolution chains:
```json
{
  "chain_id": 1,
  "stages": [
    { "pokemon_id": "turtwig", "name": "Turtwig", "sinnoh_dex": 1, "sprite_url": "..." },
    { "pokemon_id": "grotle", "name": "Grotle", "sinnoh_dex": 2, "sprite_url": "...", "method": "level", "level": 18 },
    { "pokemon_id": "torterra", "name": "Torterra", "sinnoh_dex": 3, "sprite_url": "...", "method": "level", "level": 32 }
  ]
}
```

**`type_chart.json`** — 17x17 effectiveness matrix:
```json
{
  "types": ["Normal", "Fire", "Water", ...],
  "matrix": {
    "Normal": { "Normal": 1, "Fire": 1, "Rock": 0.5, "Ghost": 0, ... },
    "Fire": { "Grass": 2, "Water": 0.5, "Fire": 0.5, ... }
  }
}
```

### Script Details
- Uses `requests` with rate limiting (respect PokeAPI's fair use — ~1 req/sec or use their bulk data)
- Caches raw API responses to `scripts/cache/` (gitignored) so re-runs are fast
- Filters everything for Platinum version specifically (version_group: platinum for moves, encounters, flavor text)
- Maps Sinnoh dex numbers using the `pokedex/6` endpoint (Sinnoh updated/Platinum dex)
- Computes type matchups from the type chart rather than storing redundantly per Pokémon (but pre-computes for convenience)

### .gitignore additions
```
scripts/cache/
scripts/__pycache__/
node_modules/
dist/
```

---

## Project Structure

```
sinnoh-pokedex/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build + deploy to Pages
├── scripts/
│   ├── fetch_pokeapi.py        # Data pipeline script
│   ├── requirements.txt        # Python deps (requests)
│   └── cache/                  # Raw API responses (gitignored)
├── public/
│   └── favicon.ico             # Pokéball favicon
├── src/
│   ├── data/
│   │   ├── pokemon.json
│   │   ├── moves.json
│   │   ├── locations.json
│   │   ├── evolutions.json
│   │   └── type_chart.json
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.jsx       # Tab bar navigation
│   │   │   ├── TeamTray.jsx        # Floating team/favorites tray
│   │   │   └── Header.jsx          # App header with Pokédex styling
│   │   ├── pokemon/
│   │   │   ├── PokemonList.jsx     # Filterable/sortable list
│   │   │   ├── PokemonCard.jsx     # List item card
│   │   │   ├── PokemonDetail.jsx   # Full detail view
│   │   │   ├── StatsChart.jsx      # Base stats bar chart
│   │   │   ├── EvolutionChain.jsx  # Visual evolution chain
│   │   │   ├── MoveTable.jsx       # Moves sub-section (reused in Move detail)
│   │   │   ├── EncounterTable.jsx  # Encounter sub-section
│   │   │   └── TypeMatchups.jsx    # Defensive type matchups
│   │   ├── moves/
│   │   │   ├── MoveList.jsx        # Filterable/sortable move list
│   │   │   ├── MoveCard.jsx        # List item card
│   │   │   └── MoveDetail.jsx      # Full move detail + learned-by
│   │   ├── routes/
│   │   │   ├── RouteList.jsx       # Route/location list
│   │   │   ├── RouteCard.jsx       # List item
│   │   │   └── RouteDetail.jsx     # Route detail with encounter table
│   │   ├── types/
│   │   │   └── TypeChart.jsx       # Interactive 17x17 grid
│   │   └── shared/
│   │       ├── TypeBadge.jsx       # Colored type pill/badge
│   │       ├── SearchBar.jsx       # Reusable search input
│   │       ├── FilterPanel.jsx     # Reusable filter controls
│   │       ├── CollapsibleSection.jsx  # Expand/collapse wrapper
│   │       └── SpriteImage.jsx     # Sprite with pixelated rendering
│   ├── hooks/
│   │   ├── useTeam.js              # localStorage team management
│   │   ├── useSearch.js            # Fuzzy search logic
│   │   └── useFilters.js           # Filter/sort state management
│   ├── styles/
│   │   ├── pokedex-theme.css       # Custom Pokédex aesthetic (colors, CRT, screen effects)
│   │   └── type-colors.css         # Official type color definitions
│   ├── utils/
│   │   ├── dataLoader.js           # Load and index JSON data
│   │   └── typeUtils.js            # Type effectiveness helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                   # Tailwind imports + base styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## Build Phases

### Phase 1: Data Pipeline
**Goal:** Fetch all Platinum-specific data from PokeAPI, output clean JSON files.

Tasks:
1. Set up `scripts/` folder with `requirements.txt` (requests library)
2. Write `fetch_pokeapi.py` that:
   - Fetches the Sinnoh Platinum dex (pokedex/6) to get the 210 Pokémon list with Sinnoh dex numbers
   - For each Pokémon: fetch species data (description, gender ratio, catch rate, egg groups, hatch steps), pokemon data (stats, types, abilities, height, weight, sprites, held items), and Platinum-specific move learnsets
   - Fetch all Platinum encounter data (version=platinum) per Pokémon
   - Fetch evolution chain data for each unique chain
   - Fetch all move details for every move referenced
   - Build the type effectiveness chart from the type endpoints
   - Cache all raw API responses to `scripts/cache/` for fast re-runs
   - Output the 5 JSON files to `src/data/`
3. Run the script, manually spot-check 5-10 Pokémon for accuracy
4. Commit the JSON files to the repo

**Validation checks:**
- Exactly 210 Pokémon in the output
- Sinnoh dex numbers range from 1-210 with no gaps
- Every Pokémon has at least one level-up move
- Starter Pokémon (Turtwig/Chimchar/Piplup) have correct evolution chains
- Type chart is 17x17 with no missing entries

### Phase 2: App Scaffolding
**Goal:** Working React app with routing, layout, and the Pokédex visual theme.

Tasks:
1. Initialize Vite + React project
2. Install dependencies: react-router-dom, tailwindcss
3. Set up Tailwind config with custom Pokédex colors
4. Create `pokedex-theme.css` with:
   - CSS variables for all theme colors
   - CRT/scanline effect styles
   - Retro font imports (Google Fonts — find a good monospace/pixel font)
   - Screen inset styling
   - Type badge color classes
5. Build layout components: Header, BottomNav, basic page shells
6. Set up React Router with 4 routes: `/`, `/routes`, `/moves`, `/types`
7. Write `dataLoader.js` to import and index the JSON data
8. Verify the app loads, navigates between tabs, and displays on iPhone 14 Pro viewport

### Phase 3: Pokédex Browser
**Goal:** Fully functional Pokémon list + detail view.

Tasks:
1. Build PokemonList with PokemonCard grid/list
2. Implement SearchBar with fuzzy matching (can use a simple substring match or a lightweight library like fuse.js)
3. Implement filter panel: type filter, evolution method filter
4. Implement sort toggle: dex #, alphabetical, BST
5. Build PokemonDetail with the collapsed-by-default sections
6. Build each collapsible sub-component: MoveTable (with sub-tabs for learn method), EncounterTable, EvolutionChain, StatsChart, Details section, TypeMatchups
7. Wire up cross-links: tapping a move name navigates to `/moves/:moveId`, tapping a location navigates to `/routes/:locationId`
8. Test on iPhone 14 Pro viewport — detail view above-the-fold content should show sprite, name, number, types, description without scrolling

### Phase 4: Move Browser
**Goal:** Fully functional move list + detail view.

Tasks:
1. Build MoveList with MoveCard rows
2. Implement search (fuzzy match on move name)
3. Implement filters: type, category (Physical/Special/Status)
4. Implement sort: alphabetical, by power, by type
5. Build MoveDetail showing all move info + "learned by" section grouped by method
6. Wire cross-links: tapping a Pokémon in the "learned by" list navigates to that Pokémon's detail page

### Phase 5: Route Browser
**Goal:** Fully functional location list + detail view.

Tasks:
1. Build RouteList grouped by game progression (early/mid/late/post-game)
2. Implement search by route name
3. Build RouteDetail with encounter table
4. Add time-of-day filter on route detail
5. Add method filter (grass/surf/fishing/etc.)
6. Label special encounters (Swarm, Trophy Garden)
7. Wire cross-links: tapping a Pokémon navigates to its detail page

### Phase 6: Type Chart
**Goal:** Interactive type effectiveness chart.

Tasks:
1. Build the 17x17 grid component
2. Color-code cells: green (2x), red (0.5x), black (0x), neutral (1x)
3. Implement tap-to-highlight: tap a type header to highlight its offensive row and defensive column
4. Ensure readability on mobile — may need pinch-to-zoom support or a focused single-type view as alternative
5. Use official type colors for headers

### Phase 7: Team Favorites + Polish
**Goal:** localStorage team feature, UI polish, deployment.

Tasks:
1. Build `useTeam` hook managing localStorage (add/remove/reorder, max 6 active team + unlimited favorites)
2. Add Master Ball favorite toggle to PokemonCard and PokemonDetail (greyed out = not favorited, full color = pinned)
3. Build TeamTray component (Master Ball icon button that expands to show team)
4. UI polish pass:
   - Refine CRT/scanline effects
   - Animation for collapsible sections
   - Loading states / skeleton screens
   - Transition animations between views
   - Ensure all type badges are consistent
5. Responsive testing: iPhone 14 Pro (primary), iPad, desktop
6. Set up GitHub Actions deploy workflow
7. Deploy to GitHub Pages
8. Test the live site in Firefox on iPhone

### Phase 8 (Future Enhancements — not in v1)
- Team Matchup Rater: select two teams of 6, see type coverage analysis and matchup breakdown
- Literal Pokédex device frame as optional visual mode
- Move effectiveness preview on Pokémon detail (show offensive coverage of their moveset)
- Compare mode (side-by-side two Pokémon)
- Dark/light mode toggle (though the default theme IS already dark-screen based)

---

## Claude Code Implementation Guidance

### Developer Context — READ THIS FIRST

The developer building this project (Kyle) has strong conceptual and technical understanding (Python, JavaScript/React, SQL) but is building this project primarily through AI-assisted "vibe coding" and wants to **learn as he goes**. This means:

- **Do NOT just silently generate code.** After building each component or meaningful chunk of logic, pause and explain:
  - **What you built** — a plain-English summary of what the code does
  - **Why you made key decisions** — e.g., "I used `useMemo` here because the filtered list would re-compute on every render otherwise, and with 210 Pokémon that's wasteful"
  - **Key patterns to understand** — e.g., "This is the React Router `useParams` hook — it reads the `:pokemonId` from the URL so the detail page knows which Pokémon to display"
  - **What to review** — flag the 2-3 most important files or functions from each phase that are worth reading through carefully to understand the architecture
- **Call out React concepts as they appear:** hooks (useState, useEffect, useMemo, useContext), component composition, props vs state, conditional rendering, React Router patterns, localStorage interaction. Explain them in the context of what they're actually doing in this app, not abstractly.
- **Call out CSS/styling decisions:** when applying the Pokédex theme, explain how CSS variables work, what the CRT scanline effect is doing, how Tailwind utility classes map to CSS properties, and how responsive breakpoints work.
- **Call out data flow:** explain how the JSON data gets loaded, passed through components as props, filtered/sorted, and rendered. This is the core architecture of the whole app.
- **Flag things that could break:** if there's a common gotcha (e.g., "localStorage only stores strings, so we JSON.stringify before saving and JSON.parse when reading"), call it out proactively.
- **Suggest what to Google/read more about:** if a concept is too deep to explain inline (e.g., React reconciliation, CSS specificity), give a one-sentence summary and suggest what to search for to learn more.

The goal is not just a working Pokédex — it's for Kyle to finish this project understanding how React apps are structured and why the code works, so he can modify and extend it confidently.

### How to feed this plan to Claude Code

This project should be built phase by phase in Claude Code (VS Code). Do NOT ask Claude Code to build the entire app in one shot. Instead, work through it like this:

**For every session, start with this framing:**
> "I'm building a Sinnoh Pokédex app. Here's the full project plan [paste plan or reference it if already in context]. I'm a beginner coder learning as I build — after you write code, explain what you did, why you made key decisions, and what I should review to understand the architecture. Let's work on Phase [X]."

**Session 1 — Phase 1 (Data Pipeline):**
Open Claude Code and paste Phase 1's tasks. Ask it to create the Python script. You'll need to run the script yourself locally since Claude Code can't make external API calls to PokeAPI. Review the output JSON files, spot-check the data. **Learning focus:** how Python scripts fetch and transform API data, JSON structure, and file I/O.

**Session 2 — Phase 2 (Scaffolding):**
Tell Claude Code: "I have a Vite + React project to set up. Here's the full project structure [paste the project structure section]. Here's the visual design direction [paste the visual design section]. Set up the project scaffolding with routing, layout components, and the Pokédex theme. The JSON data files already exist in src/data/." **Learning focus:** project structure, React Router, CSS theming, component layout basics.

**Session 3 — Phase 3 (Pokédex Browser):**
Tell Claude Code: "Here's the spec for the Pokédex Browser view [paste View 1 section and the detail view spec]. The data is loaded from src/data/pokemon.json. Build the list view, search, filters, sorts, and the full detail view with collapsible sections." **Learning focus:** state management (useState), filtering/sorting logic, component composition, props flow.

**Sessions 4-7 — Phases 4-7:**
Same pattern. Paste the relevant spec section, reference what already exists, and let Claude Code build incrementally. Each session can reference the full project plan for context on cross-linking and shared components. **Learning focus shifts** toward reuse patterns, localStorage, and deployment.

### Tips for working with Claude Code on this project:
- **Keep JSON data files in context.** When working on a view, make sure Claude Code can see the relevant JSON structure so it builds components that match the actual data shape.
- **Test on mobile early and often.** After Phase 2, start checking the app in Firefox on your iPhone. Catch layout issues before they compound.
- **Commit after each phase.** Git commit after each working phase so you have clean rollback points.
- **Reference shared components.** When building Phase 4+, remind Claude Code that shared components (TypeBadge, SearchBar, CollapsibleSection, SpriteImage) already exist from Phase 3.
- **The data pipeline script is a one-time run.** You probably won't need to re-run it unless you find data issues. The JSON files are the source of truth for the app.
- **Ask "why" liberally.** If Claude Code generates something you don't understand, ask it to explain. That's the whole point — don't let anything be a black box.
- **Read the files Claude Code flags for review.** Even if the app works, spending 10 minutes reading through a key component builds the intuition you need to modify things later.

---

## Key PokeAPI Endpoints Reference (for the data pipeline script)

- Sinnoh Platinum dex: `https://pokeapi.co/api/v2/pokedex/6/`
- Pokémon species (description, egg, gender): `https://pokeapi.co/api/v2/pokemon-species/{id}/`
- Pokémon data (stats, types, abilities, sprites): `https://pokeapi.co/api/v2/pokemon/{id}/`
- Moves: `https://pokeapi.co/api/v2/move/{id}/`
- Evolution chains: `https://pokeapi.co/api/v2/evolution-chain/{id}/`
- Encounter locations: `https://pokeapi.co/api/v2/pokemon/{id}/encounters`
- Type data: `https://pokeapi.co/api/v2/type/{id}/`
- Platinum version group: `platinum` (for filtering version-specific data)
- Sprites: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{national_dex_id}.png`
