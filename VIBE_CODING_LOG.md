# Vibe Coding Log: Building the Platinum Pokédex with Claude Code

A retrospective on building a full-featured Sinnoh Pokédex web app across two sessions using Claude Code as an AI pair programmer.

## The Numbers

- **Sessions**: 2 (April 1–2, 2026)
- **Commits**: 11
- **Source files**: 34 (JSX, JS, CSS)
- **Lines of app code**: ~2,970
- **Lines of data**: ~3.3MB of static JSON (210 Pokémon, 426 moves, 154 locations, 95 evolution chains)
- **Sprites**: 210 Pokémon sprites + Master Ball, committed locally for offline use
- **Phases completed**: 7 (Data Pipeline → Scaffolding → Pokédex Browser → Move Browser → Route Browser → Type Chart → Team Favorites)
- **Features shipped**: Full Pokédex with search/filter/sort, move browser, route browser, interactive type chart, persistent team with localStorage

---

## How the Project Unfolded

### Pre-Session: Writing the Project Plan

Before writing a single line of code, I built a detailed project plan document with Claude Opus 4.6 (`pokedex-project-plan.md`) that covered:
- The full tech stack (React + Vite + Tailwind + PokeAPI)
- Visual design direction (Gen 1 anime Pokédex aesthetic, CRT green screen areas, retro fonts)
- Every view and its data requirements
- The data pipeline architecture (pre-fetched static JSON, no runtime API calls)
- A phased build plan with 7 phases
- Explicit guidance for Claude on how I wanted to learn as we built

This upfront investment paid off across the whole project. Having a detailed spec meant Claude could make good architectural decisions early that held up without revisiting. It also meant every session started with full context — I could say "read this plan, let's do Phase 3" and be immediately productive. I also thought using Opus 4.6 to write the project plan as effectively as possible would allow me to use Sonnet to code the app.

**Key decision made here**: Pre-fetching all data from PokeAPI into static JSON rather than making live API calls. This kept the app fast, offline-capable, and simple to deploy.

---

### Session 1 (April 1): Phases 1–2

#### Phase 1 — Data Pipeline

The first thing I asked was to set up git before anything else. Having a clean repo from the start made the whole project more organized, and I could always revert to prior versions if I messed up any phase.

I had Claude write a Python script (`scripts/fetch_pokeapi.py`) that fetched all 210 Sinnoh Pokémon, 426 moves, 154 locations, and 95 evolution chains from PokeAPI, with disk caching so re-runs were instant. Before running it, I asked "how can we check this code is correct?" — Claude caught a potential bug (the wrong Pokédex endpoint) by checking against the live API before running the full pipeline. 

One thing I added that wasn't in the original plan: **downloading all 210 sprites locally** instead of relying on the PokeAPI CDN. My reasoning was offline use. Claude made the tradeoff clear (2MB in the repo vs. no external dependency) and I made the call. This proved to be the right choice for GitHub Pages deployment.

I also asked Claude to generate a visual preview HTML file so I could verify all 210 sprites loaded correctly before moving to the React app. Simple sanity check that caught nothing, allowed me to confirm the Python script pulled all Pokemon before moving on.

#### Phase 2 — App Scaffolding

The key decisions here were architectural:
- **CSS variables + Tailwind hybrid**: Custom CSS variables for the Pokédex theme (colors, CRT effects) with Tailwind for layout utilities. This separation meant the visual identity was centralized in one file.
- **`dataLoader.js` with Map indexes**: Rather than scanning the 210-item array on every render, Claude built O(1) lookup indexes at import time. I didn't ask for this — Claude added it proactively and explained why.
- **`import.meta.env.BASE_URL` for sprites**: A Vite-specific pattern that made sprite paths work both locally and on GitHub Pages. Claude flagged this as a "common GitHub Pages gotcha" before I ran into it.

The CSS `@import` ordering bug (Tailwind directives must come after `@import`) was caught immediately on first dev server start and fixed in one line.

---

### Session 2 (April 2): Phases 3–7

#### Phase 3 — Pokédex Browser

The most complex phase. Before building, I reviewed Claude's plan step-by-step and aligned on the approach.

Two React patterns worth noting here:
- **`useMemo`** for the filtered/sorted Pokémon list — only recomputes when search/filter/sort state changes, not on every render
- **`useParams()`** returning strings, not numbers — a subtle gotcha Claude flagged proactively: `Number(sinnohDex)` before the Map lookup

Mid-phase I asked for a small UX addition: **reverse sort on second click of a sort button**. Claude added it cleanly — a `sortDir` state alongside `sortBy`, with a `handleSort` function that toggles direction if clicking the active button or resets to the new button's default direction. I also specified that BST should default to descending (strongest first), which required per-option default directions. A small but satisfying interaction detail.

#### Phase 4 — Move Browser

One notable data quality bug I caught here: move descriptions containing `$effect_chance%` placeholders (e.g., "Has a $effect_chance% chance to paralyze"). This is a PokeAPI quirk — their effect text uses a placeholder instead of the actual number. The fix was one line in the Python script, a re-run (using cache, so instant), and regenerated JSON. No React changes needed.

**What this illustrates**: The value of separating data pipeline from the app. A data issue was fixed entirely in the pipeline without touching the frontend.

#### Phase 5 — Route Browser

Added sortable table columns to the encounter table — same click-to-sort-then-reverse pattern from Phase 3. The pattern was already established so implementation was straightforward.

#### Phase 6 — Type Chart

The existing Phase 2 placeholder already had a working 17×17 grid. Phase 6 was about making it interactive. I chose Option A (tap-to-highlight the full row and column) over a simpler single-type lookup panel — I wanted the full chart visible at once.

The highlight implementation uses opacity transitions: selected row/column stays at 100%, everything else dims to 15%. Simple and effective on mobile.

#### Phase 7 — Team Favorites

The most architecturally interesting phase. The team state needed to be shared across three components that aren't related in the tree (PokemonCard, PokemonDetail, TeamTray). Claude introduced **React Context** — a pattern I hadn't seen in this project yet — and explained clearly why prop drilling would have been messy here.

The `useTeam` hook and `TeamContext` are clean examples of how to separate state logic from UI:
- `useTeam.js` — pure state logic with localStorage sync
- `TeamContext.jsx` — makes that state available app-wide via context
- Components just call `useTeamContext()` to read/update

One UX decision I made: hide the floating Master Ball button entirely when the team is empty. Cleaner than showing a greyed-out button for something with no content yet.

---

## My Prompting Patterns

### 1. Detailed Upfront Plan
The project plan document was the single biggest productivity lever. Every session started with "read this plan" and Claude had all the context it needed to make good decisions. I didn't have to re-explain the architecture or design direction.

### 2. Plan Before Build
For every phase, I asked Claude to walk through the approach before writing code. "Let's align on steps, then proceed." This let me catch misunderstandings early and gave me a mental model of what was being built before I had to review it.

### 3. Asking "Why" Proactively
The project plan explicitly told Claude to explain key decisions, patterns, and gotchas as it built. This made every phase educational, not just productive. I now understand `useMemo`, React Context, `useParams`, and localStorage in the context of actual code I wrote — not abstract tutorials.

### 4. Small Targeted Feedback
> "I prefer BST to default to descending (strongest first)"
> "Can we make the team tray only visible when there's Pokémon in your party?"
> "Can we make the columns sortable?"

Short, specific, behavioral feedback. Claude translated it cleanly each time.

### 5. Verification Before Running
Before running the data pipeline, I asked Claude to verify the script looked correct. Claude checked the PokeAPI endpoint and the version group name against the live API before a 20-minute script run. Saved potential wasted time.

### 6. Deferring on Tech Decisions
> "Whatever is easiest, fine if you make this design choice"
> "I'm good with your recommendation"
> "Option A"

I reserved my opinions for user-facing decisions (how it looks, how it feels) and deferred to Claude on implementation details. This kept the pace high without sacrificing quality.

---

## What Went Well

- **The project plan paid for itself immediately.** Spending time upfront writing a detailed spec meant zero time was wasted explaining context mid-build. Claude could make good architectural decisions (CSS variables, data indexes, base path handling) on the first pass.
- **Static data pipeline was the right architecture.** All data issues were fixable in the pipeline without touching the app. The `$effect_chance` bug and sprite URL changes were isolated entirely to the data layer.
- **Learning React in context.** Because I asked Claude to explain as it built, I came away understanding `useMemo`, `useContext`, `useParams`, React Router patterns, and localStorage — all in the context of real code, not toy examples.
- **Mobile-first from the start.** Specifying iPhone 14 Pro in Firefox as the primary target in the project plan meant responsive design was never bolted on. The fixed header + bottom nav + `100dvh` layout was designed for mobile from Phase 2.
- **Committing phase by phase.** Clean commit history that maps directly to phases. Easy to see what changed and why.

---

## What I'd Do Differently

- **Test on the actual device earlier.** I didn't check the app in Firefox on iPhone until late. Some layout and font-size decisions might have been different if I'd been looking at the real target device throughout.
- **Verify data accuracy earlier.** I ran validation checks at the end of the data pipeline, but didn't manually spot-check the data against a real Pokémon resource (like Bulbapedia) until later. A few minutes of spot-checking after Phase 1 would have caught any data issues before they became part of the app.
- **Ask for data quality checks on edge cases.** Things like branching evolution chains (Ralts → Gardevoir/Gallade), Pokémon with no wild encounters (legendaries), and moves with no power (status moves) required special handling. I could have asked "what edge cases in the data should we handle?" upfront rather than discovering them during build.
- **Establish the color palette even more explicitly.** The CRT theme was defined in Phase 2 and held up well, but I made some color decisions by saying "looks good" without fully thinking through whether they'd read well on OLED vs. LCD screens or in direct sunlight on iPhone.

---

## Tech Decisions

| Decision | Reasoning |
|----------|-----------|
| React + Vite | Component-based, fast builds, straightforward GitHub Pages deployment |
| Tailwind + custom CSS variables | Tailwind for layout, CSS variables for the Pokédex theme — separation kept the aesthetic centralized |
| Pre-fetched static JSON | No backend, instant loads, works offline, all data issues fixable in one place |
| Sprites committed to repo | Offline-capable, no CDN dependency, ~2MB is negligible for GitHub Pages |
| React Context for team state | Three unrelated components needed shared state — prop drilling would have been messy |
| localStorage for team | Persists across sessions without needing auth or a backend |
| Map indexes in dataLoader | O(1) lookups on 210 Pokémon instead of array scans on every render |
| GitHub Actions for deploy | Push to main → build → deploy, zero manual steps after initial Pages setup |

---

## Session Stats

- **Commits**: 11
- **Source files created**: 34
- **Lines of app code**: ~2,970
- **Data files**: 5 JSON files, ~3.3MB total
- **Sprites committed**: 211 (210 Pokémon + Master Ball)
- **Phases**: 7
- **Data pipeline re-runs**: 1 (to fix `$effect_chance` placeholders)
- **Times I said "let's proceed"**: many
- **Times I asked to review the plan first**: every phase
- **Bugs caught before running code**: 1 (wrong PokeAPI endpoint)
- **Bugs caught after running**: 1 (`$effect_chance` placeholder in move descriptions)
- **UX tweaks after seeing it working**: ~4 (reverse sort, BST default direction, team tray visibility, hide/show filters)

---

## April 29 Update: Gen 5 (Pokémon Black) Expansion

A third session, ~4 weeks after shipping the Sinnoh app. Goal: extend the Pokédex to also support Pokémon Black (Unova, 156 Pokémon) without breaking anything Sinnoh-side. The user toggles between gens in a Settings tab; the active gen is sticky in localStorage.

### Pre-session: GEN5_SPEC.md

Same pattern as the original project plan — wrote a detailed spec (`GEN5_SPEC.md`) with Opus 4.6 before any code. The spec covered the URL namespacing strategy, per-gen data layout, localStorage migration plan, version-exclusive handling, a 5-phase build order with checkpoints, and a "Future Generations" section so adding Gen 6+ is mechanical. As before, the upfront investment paid for itself — every phase started with "read GEN5_SPEC, proceed to phase N" and Claude had full context immediately.

### The 5 Phases

#### Phase 1 — Schema migration + Vitest setup
Renamed `sinnoh_dex` → `regional_dex` across 25+ files and the JSON itself, then relocated existing data to `src/data/gen4/`. Wide-touch refactor went cleanly thanks to the codebase already being well-organized.

This phase also introduced **Vitest + React Testing Library** — the original project had no tests. Wrote a 6-test smoke suite for the data loader as a foundation; subsequent phases added their own tests inline.

#### Phase 2 — Gen 5 data pipeline
Extended `fetch_pokeapi.py` with a `--gen` flag and parameterized the pokedex/version-group/version. Added a hardcoded `WHITE_EXCLUSIVES` set (Zekrom, Solosis line, Rufflet line, Vanillite line, Petilil line, etc.) since PokeAPI doesn't expose version-exclusivity cleanly. Wrote a separate `download_sprites.py` script and pulled all 156 Unova sprites locally. Same caching, same offline-first philosophy as the original pipeline.

#### Phase 3 — GenerationContext + URL namespacing
The architectural keystone of the expansion. Routes migrated from gen-implicit (`/pokemon/:dex`) to gen-namespaced (`/gen4/pokemon/:dex`, `/gen5/pokemon/:dex`). A new `GenerationContext` holds the active gen; `useDataset()` reads it and returns the active gen's bundle. A `<GenSyncRoute>` wrapper closes the loop — deep-linking to `/gen5/...` while the active gen is 4 silently switches the active gen via `useEffect`.

The pattern that worked best: every gen-aware piece (BottomNav links, NavLink targets, Header subtitle) reads from one source of truth (`useGenerationContext()`), so flipping the gen propagates everywhere automatically.

#### Phase 4 — Settings tab + per-gen team
Added a fifth Settings tab to the bottom nav with a Gen 4 ↔ Gen 5 toggle. The team became per-gen (independent Sinnoh team and Unova team) — `TeamContext` now holds two `useTeam` instances and exposes whichever matches the active gen.

The interesting bit: a **legacy localStorage migration**. The old `platinum-pokedex-team` key got copied into `platinum-pokedex-team-gen4` on first mount, then deleted. So my pre-existing Sinnoh team carried over without manual intervention. The migration is idempotent (only runs if legacy key exists AND gen-4 key is empty) so it can't clobber later updates.

#### Phase 5 — Version-exclusive labels + 404 + future-proofing
Added a `⚠ WHITE EXCLUSIVE · TRADE ONLY` badge on the detail view for the 12 White-exclusive Pokémon. Caught and fixed an oversight from Phase 4: the dex-number prefix on Pokémon detail still hardcoded "SINNOH" — now reads "SINNOH"/"UNOVA" based on active gen.

For future gens, refactored `App.jsx` to be data-driven: a `SUPPORTED_GENS` array is exported from `dataLoader.js` and the routes are generated by mapping over it. Adding Gen 6 is now a one-line change in `dataLoader.js` (plus the data files); routes appear automatically. Invalid gens like `/gen99/*` fall through to the `*` route and render `NotFoundPage`.

Also extracted an `AppContent` component (router-less) so integration tests can wrap it in `<MemoryRouter>` instead of mocking `BrowserRouter`.

---

### What I Learned This Session

- **Adding tests retroactively is fine.** I'd skipped tests in the original project. Vitest + RTL slot in cleanly with Vite, and writing tests *only* for new logic (not backfilling existing components) kept the scope sane.
- **`<MemoryRouter>` vs `<BrowserRouter>` for testability.** I now know to write the root component in two layers: a router-less inner shell and a thin wrapper that picks the router. Tests get the shell with `<MemoryRouter>`; production gets the shell with `<BrowserRouter>`.
- **Idempotent migrations.** The team-storage migration runs on every mount, but only does anything once. This is the right shape for any "upgrade once" logic — guard with a check, don't rely on a one-shot script.
- **Data-driven routes.** Mapping over a constant beats hardcoding routes per gen. The `SUPPORTED_GENS` pattern is small but compounds: adding Gen 6 doesn't touch `App.jsx` at all.
- **Schema rename is cheap if the codebase is clean.** The `sinnoh_dex` → `regional_dex` rename touched ~25 files and finished in minutes because the original code had clear naming conventions and one source of truth (`dataLoader.js`).

### Session Stats (Apr 29)

- **Commits**: 6 (1 spec + 5 phases)
- **Tests added**: 60 (across 9 test files)
- **New Pokémon**: 156 (Unova)
- **New sprites**: 155
- **New JSON files**: 5 (`src/data/gen5/`)
- **Routes added**: 7 gen-5 routes + Settings + 404
- **Phases gated by checkpoint**: 5 / 5
- **Times Gen 4 broke**: 0 (every phase ran the regression check `/gen4` → list renders)

