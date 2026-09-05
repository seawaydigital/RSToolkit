# Research Security Toolkit — CLAUDE.md

> This file is the authoritative project reference for Claude Code. Update it whenever tools, data files, architecture, or conventions change.

---

## Project Overview

**Purpose**: A React + Vite static site helping Canadian researchers and institutions navigate federal research security policies. No backend — 100% client-side. The build output is host-neutral: the `rs.rdmtoolkit.ca` CNAME is written by `.github/workflows/deploy.yml` at deploy time, **not** carried in `public/`, so any other host gets a clean `dist/`.

**Audience**: Canadian researchers, research security officers, grant administrators.

**Live site**: Deployed via GitHub Actions on every push to `master`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | Hash-based (`window.location.hash`), no router library |
| Search | Fuse.js 7 (threshold: 0.35, ignoreLocation: true) |
| Map | Leaflet 1.9 + react-leaflet 5 + leaflet.markercluster |
| Map tiles | CartoDB Voyager — always English labels |
| Icons | lucide-react |
| Graph layout | dagre (flowcharts) |
| Persistence | localStorage (checklist state only) |
| Styling | Single CSS file: `src/styles/global.css` with CSS variables |
| Deploy | GitHub Actions → GitHub Pages |
| Base path | `/` by default (root/subdomain hosting); set `BASE_PATH=/subdir/` to host under a subdirectory — verified working, rewrites every asset URL. See `vite.config.js` and HANDOFF.md. |

---

## Directory Structure

```
src/
  App.jsx                        # Root: routing, layout, lazy tool loading, ErrorBoundary
  main.jsx
  components/
    home/
      Home.jsx                   # Landing page: "Where do I start?" scenarios + all-tools grid
    layout/
      SiteFooter.jsx             # contentinfo landmark: AODA accessibility statement + feedback contact
      Topbar.jsx                 # Title, hamburger (mobile), Ctrl+K search trigger
      Sidebar.jsx                # Category/tool nav + RDM Toolkit sister-site card (bottom); collapsible on mobile (<768px)
      MainContent.jsx            # Scroll container for tool pages
    ui/
      SearchBar.jsx              # GlobalSearchModal (Ctrl+K command palette)
      FlowchartViewer.jsx        # Wrapper: Full View / Guided Mode toggle
      FlowchartFullView.jsx      # SVG flowchart using dagre layout
      FlowchartGuidedMode.jsx    # Card stepper: Yes/No/Continue, back stack
      Tabs.jsx                   # Shared accessible tablist/tabpanel (see Accessibility)
  data/
    toolRegistry.js              # CATEGORIES + ALL_TOOLS — single source of truth for nav/home
    nroData.js                   # 126 NROs with per-institution lat/lng (see Key Decisions)
    straData.js                  # STRA categories and subcategories
    straWizard.js                # Guided STRA assessment question tree
    riskChecklist.js             # 4 sections, ~24 items; NSGRP-sourced
    exportControlData.js         # 5 sections: EIPA, Defence Production Act, ACL, SEMA, UN Act
    glossaryData.js              # 12 terms with official Canadian/Ontario Gov definitions
    faqData.js                   # 24 FAQs across 6 categories
    riskMitigationData.js        # 22 measures across 5 categories
    dualUseData.js               # Dual-use areas (civ vs mil), red flags, MICE, myths, scenarios, due-diligence actions
    dualUseWizard.js             # Guided "Is my research dual-use?" question tree
    triAgencyData.js             # Tri-Agency RS guidance: principles, policies, agencies
    cybersecurityData.js         # 7 essential actions, file/device encryption, passwords, AI warning, sensitive data
    travelSecurityData.js        # 26 checklist items across before/during/after + emergency contacts
    reportConcernData.js         # 7 incident scenarios + federal/institutional contact directory
    flowcharts/
      stracFlow.js               # STRAC policy decision nodes
      nsgrpFlow.js               # NSGRP partnership risk assessment nodes
      ontarioFlow.js             # Ontario RS Guidelines decision nodes
  styles/
    global.css                   # All styles; CSS variables for design system
  tools/
    policy-guides/
      TriAgencyGuide.jsx         # 3-tab: Overview / 10 Principles / Key Policies
    flowcharts/                  # Nav category is "Policy Guides"; the files live here
      StracFlowchart.jsx         # FlowchartViewer wrapper
      NsgrpFlowchart.jsx         # FlowchartViewer wrapper
      OntarioFlowchart.jsx       # FlowchartViewer wrapper
    compliance/
      StraLookup.jsx             # STRA search + guided wizard
      NroLookup.jsx              # Map + table; CartoDB tiles; sanctioned countries banner
      RiskChecklist.jsx          # 3-state toggle; localStorage persistence; progress bar
      RiskMitigation.jsx         # Category + measure accordion; tag filter chips
      DualUseGuide.jsx           # 4-tab: Self-Assessment wizard / Dual-Use Areas / Vetting Collaborators / Due Diligence
    reference/
      ExportControl.jsx          # Searchable accordion reference
      Glossary.jsx               # 12-term expandable cards with category filter
      Faq.jsx                    # Accordion; auto-expands matched results when searching
    operational-security/
      CybersecurityGuide.jsx     # 4-tab guide: Quick Start / Encryption / Passwords & 2FA / AI & Sensitive Data
      TravelSecurity.jsx         # 3-phase travel checklist + emergency contacts
      ReportConcern.jsx          # Scenario accordion -> what to do now + who to contact
```

---

## Tools Inventory

### Policy Guides
| Slug | Tool Name | Data File |
|---|---|---|
| `tri-agency-guide` | Tri-Agency Research Security Guide | `triAgencyData.js` |
| `strac-flowchart` | STRAC Policy Flowchart | `flowcharts/stracFlow.js` |
| `nsgrp-flowchart` | NSGRP Flowchart | `flowcharts/nsgrpFlow.js` |
| `ontario-flowchart` | Ontario RS Guidelines | `flowcharts/ontarioFlow.js` |

### Compliance Tools
| Slug | Tool Name | Data File |
|---|---|---|
| `stra-lookup` | STRA Lookup | `straData.js` + `straWizard.js` |
| `nro-lookup` | NRO Lookup & Map | `nroData.js` |
| `risk-checklist` | Risk Assessment Checklist | `riskChecklist.js` |
| `risk-mitigation` | Risk Mitigation Guide | `riskMitigationData.js` |
| `dual-use` | Dual-Use Research Guide | `dualUseData.js` + `dualUseWizard.js` |

### Reference
| Slug | Tool Name | Data File |
|---|---|---|
| `export-control` | Export Control Quick Reference | `exportControlData.js` |
| `glossary` | Glossary / Jargon Decoder | `glossaryData.js` |
| `faq` | Research Security FAQ | `faqData.js` |

### Operational Security
| Slug | Tool Name | Data File |
|---|---|---|
| `cybersecurity-guide` | Cybersecurity Best Practices | `cybersecurityData.js` |
| `travel-security` | Research Travel Security | `travelSecurityData.js` |
| `report-concern` | Report a Concern | `reportConcernData.js` |

---

## Architecture Patterns

### Adding a New Tool

1. Create `src/data/<toolData>.js` — export a named const with `lastUpdated`, `sourceUrl`, and content
2. Create `src/tools/<category>/<ToolName>.jsx` — accepts `{ onNavigate }` prop
3. Register in `src/data/toolRegistry.js` under the appropriate `CATEGORIES` entry
4. Add lazy import to `TOOL_COMPONENTS` in `src/App.jsx`
5. Add CSS classes to `src/styles/global.css` (use existing naming conventions)

### Routing

- Hash-based: `window.location.hash = 'tool-slug'` to navigate
- No params — each tool manages its own state internally
- `onNavigate(slug)` prop passed to all tool components for cross-tool linking

### Flowchart Data Shape

```js
{
  id: string,
  title: string,
  lastUpdated: string,          // 'YYYY-MM-DD'
  policySource: string,         // Display name for source
  sourceUrl: string,            // Linked in FlowchartViewer header
  nodes: [
    {
      id: string,
      type: 'start' | 'end' | 'action' | 'decision',
      label: string,
      description: string,
      policyRef?: string,
      whyItMatters?: string,
      crossLink?: { tool: string, label: string },  // Button that navigates to another tool
      resourceLink?: { url: string, label: string }, // Button linking to external PDF/page
      next?: string,            // action/start nodes
      yes?: string,             // decision nodes
      no?: string,              // decision nodes
    }
  ]
}
```

### Tool Page Layout

Every tool page wraps content in `<div className="tool-page">`. Flowchart pages additionally use `<div className="tool-page tool-page--wide">` (no max-width constraint) to give the SVG + side panel enough horizontal room.

Header pattern:
```jsx
<div className="tool-page-header">
  <h1>Tool Name</h1>
  <p>Short description</p>
  <div className="tool-page-meta">
    <span>Last updated: {data.lastUpdated}</span>
    <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">Policy source</a>
  </div>
</div>
```

---

## Key Decisions & Conventions

- **No backend**: All data is compiled into the bundle at build time. Data updates require a new deploy.
- **Nav category ≠ directory for flowcharts**: the three flowchart tools appear under the **Policy Guides** category in `toolRegistry.js` but their components live in `src/tools/flowcharts/`, not `src/tools/policy-guides/`. This is deliberate — they share `FlowchartViewer` and are grouped by implementation, while the sidebar groups by what a user is looking for. Don't "fix" it by moving the files.
- **localStorage key**: `rs-toolkit-checklist-v1` — stores checklist item states as a flat object keyed by item ID.
- **Map tiles**: CartoDB Voyager (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`) — chosen specifically for English-language place name labels.
- **Design system (v3 — 2026-06, Lakehead brand)**: The toolkit uses a clean institutional aesthetic aligned with Lakehead University branding — a deep cobalt-navy base with a Blaze-yellow accent, deliberately on-brand (Cobalt + Blaze). Key tokens in `global.css`:
  - `--bg-primary: #061727` (deep cobalt-navy base; `body` has a subtle Blaze + Cobalt radial-gradient overlay). Surfaces ladder up `#0b2238` → `#0f2c49` → `#143a5e`.
  - `--cobalt: #00427A` (Lakehead Cobalt — brand cobalt for active nav / focus fields)
  - `--accent: #FFC20E` (Lakehead Blaze — primary interactive color and brand accent; hover `#ffce3a`). **Text on a Blaze background must be dark `#061727`, never white** (white on Blaze fails contrast ~1.6:1).
  - `--link: #6fb2e8` (sky-blue — inline links readable on cobalt; hover `#a9d4f8`)
  - `--font-display: 'Archivo'` (hero, `.home-section-title`, `.home-scenario-label`, `.tool-page-header h1`, topbar `RS` mark — a clean grotesque standing in for Lakehead's Trade Gothic; replaced Fraunces. No `font-variation-settings`.)
  - `--font-sans: 'Inter'` (body text; replaced Geist)
  - `--font-mono: 'JetBrains Mono'` (counts, kbd)
  - Status colors stay **semantic** (`--green`/`--amber`/`--red`), tuned for cobalt; `--amber: #f0a836` is kept orange-leaning so it never reads as a Blaze button. NRO map country colors (Russia red / China blue / Iran green) are data identity and are NOT part of this palette — but text drawn *on* those fills (the map cluster counts) must be dark `#061727`, since white measured 2.28:1 on the Iran green.
  - `--red: #f2998c` and `--purple: #b9a6d2` are set at the level required to clear 4.5:1 **including on their own `-subtle` tint backgrounds** (`--red-subtle` is the worst case at ~5.7:1). Do not darken either. `--red-subtle`'s rgb tracks `--red`; change them together.
  - Fonts load from Google Fonts via `<link>` in `index.html` (Archivo + Inter, both with italic axes). CSP `style-src` allows `https://fonts.googleapis.com`; `font-src` allows `https://fonts.gstatic.com`.
- **Brand icons**: `public/favicon.ico`, `public/apple-touch-icon.png` and `public/og-image.png` are **generated**, not hand-drawn — run `python scripts/generate-icons.py` (needs Pillow; it is a dev-time one-off, deliberately **not** an npm dependency). Output is deterministic, so regenerating produces a byte-identical result unless you changed the script. The mark mirrors the topbar logo: Blaze `RS` on Cobalt. **If `--accent` or `--bg-primary` change in `global.css`, update `COBALT`/`BLAZE` at the top of the script too** — the coupling is by convention, not by import. Two shape rules that are not interchangeable: the **favicon** is a rounded square with transparent corners (browsers composite it over varied backgrounds), while the **apple-touch-icon is full-bleed and fully opaque with no alpha** — iOS applies its own corner mask, and alpha in the corners renders as black corners in Reading List, pinned tabs, and the share sheet. Do not "unify" them by reusing one shape for both. The previous `favicon.svg` (a purple `#863bff` Figma export) and `icons.svg` (a Bluesky/Discord/X/GitHub sprite) were starter-template leftovers of unknown provenance and were removed; do not reintroduce third-party marks.
- **Source links**: All policy sources must be hyperlinked, never plain text. Inline hyperlinks across the site use `var(--link)` (`#6fb2e8`, sky-blue) — readable on the dark cobalt base. Hover state uses `var(--link-hover)` (`#a9d4f8`). Do not use `var(--accent)` (Blaze) for plain text links; that color is reserved for interactive UI elements (buttons, active states, borders) and yellow text links read like warnings.
- **UBC attribution**: Do not attribute any content to UBC specifically. Use "Canadian university research security programs" for the Risk Mitigation tool sourcing.
- **Sanctioned countries banner (NRO Lookup)**: The banner above the map is a **two-tier, collapsible** summary tuned for research-collaboration decisions (not legal advice). Both tiers are **collapsed by default**; each header is a `<button>` showing a destination count and chevron, with `aria-expanded` / `aria-controls` wiring. State: `tier1Open`, `tier2Open` in `NroLookup.jsx`.
  - **Tier 1 — Comprehensive prohibitions** (red, `.nro-sanctioned-title--tier1`): North Korea (DPRK); Occupied regions of Ukraine (Crimea, Donetsk, Luhansk, Zaporizhzhia, Kherson).
  - **Tier 2 — Broad sectoral / substantial sanctions** (amber, `.nro-sanctioned-title--tier2`): Russia, Belarus, Iran, Myanmar (Burma). Scope varies — Russia/Belarus/Iran are sweeping sectoral + list; Myanmar is narrower (targeted designations + arms embargo + technical-data prohibition).
  - **Do not re-add Syria** to this banner without re-checking the source: Canada repealed broad sectoral Syria sanctions on 2026-02-13; the remaining regime is targeted at former Assad-regime figures and no longer belongs alongside Russia/Iran for research-partnership purposes.
  - When revising the list, always cross-check against the Global Affairs Canada sanctions index (linked in the footer note) since the policy landscape moves fast.
- **NRO map cluster colors**: `MarkerCluster` in `NroLookup.jsx` uses a custom `iconCreateFunction` — do NOT rely on Leaflet's default cluster icons. Clusters tally their children by `fillColor` and render as a solid `divIcon` in the **dominant** country color (Russia `#ef4444`, China `#3b82f6`, Iran `#22c55e`), matching the legend. Leaflet's default green/yellow/orange cluster colors (which scale with count, not country) must not be reintroduced. If adding a new country, update `COUNTRY_COLORS` at the top of `NroLookup.jsx` and the legend will pick it up automatically.
- **NRO per-institution coordinates**: `nroData.js` stores real per-campus coordinates (4 decimal places, ~11m precision), not city centers. This was a deliberate fix because city-center coordinates caused every org in the same city to stack on one pin (e.g., 28 Beijing orgs at 39.9042, 116.4074). When adding a new NRO, always look up the institution's actual campus coordinates rather than using the city center. All 126 current entries have unique coordinates. Known caveats: (1) 33rd TsNII has `city: "Moscow"` but its coordinates point to Shikhany-2 in Saratov Oblast where it actually sits. (2) PEAC Institute of Multiscale Sciences is labeled Mianyang but is actually headquartered at Sichuan University in Chengdu — current coords still match the Mianyang city label; the `city` field may want updating.
- **Glossary scope**: Exactly 12 terms — STRA, STRAC Policy, NSGRP, Dual-Use, Controlled Goods, Export Controls, Due Diligence, NRO, Research Security, Risk Assessment, Risk Mitigation, Sanctions.
- **Print support**: RiskChecklist and RiskMitigation both have print buttons (`window.print()`); print CSS is in `global.css`. Print uses `@page { size: A4 portrait; margin: 1.5cm }` and explicitly overrides `height`/`overflow`/`flex` on every layout container (`.app`, `.app-body`, `.main-content`, etc.) individually — required because `height: 100vh; overflow: hidden` on `.app` would otherwise clip all content to one page.
- **Checklist print state**: Each checklist item renders a `<div className="checklist-print-state">` element showing the current state (✓ No Risk / ⚠ Risk Identified / — N/A). It is `display: none` on screen and `display: block` in `@media print`, so the printed output reflects the user's selections.
- **Security headers**: `index.html` carries a `Content-Security-Policy` meta tag — scripts `self + unsafe-inline`, images self + CartoDB tiles, `connect-src` self + `https://nominatim.openstreetmap.org` (NRO proximity geocoding), fonts + styles + Google Fonts. Most CSP directives are honoured via `<meta http-equiv>`, so what remains there is genuinely in effect. **Three things were not and have been moved to the web server config**: `X-Content-Type-Options` and `Referrer-Policy` (browsers only honour those as real HTTP response headers — as meta tags they did nothing at all), and CSP's own **`frame-ancestors`**, which browsers explicitly ignore outside an HTTP header and which was logging `The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element` to the console on every page load. See the Security headers section of HANDOFF.md for what the hosting team must set (including HSTS). **Do not re-add any of the three as meta tags** — they cannot work there. `style-src` lists only what is actually loaded: Leaflet's CSS is bundled from npm, so the old `unpkg.com` / `cdnjs.cloudflare.com` allowances were removed as dead.
- **NRO proximity search**: `NroLookup.jsx` includes a "Check proximity to NROs" panel. It geocodes arbitrary institution names via `https://nominatim.openstreetmap.org/search` (free, no API key, rate-limited to ~1 req/s — fine for interactive use). The user picks from up to 5 suggestions; a gold `★` `divIcon` (class `.nro-my-institution-icon`) is placed on the map and the 5 nearest NROs are listed with distances computed by Haversine formula (pure JS, no external calls). Clicking a nearest-NRO row highlights it in the main table and flies the map to it. `FlyToHandler` accepts an optional `zoom` field — institution placement uses zoom 7 so nearby NROs are visible; row clicks use zoom 10.
- **Flowchart node detail panel**: Clicking a flowchart node in Full View mode opens a sticky side panel to the **right** of the SVG container (not an absolute overlay). Layout: `.flowchart-outer` is `display: flex; flex-direction: row; gap: 12px`. The panel (`.flowchart-node-panel`) is `position: sticky; top: 16px; width: 240px; flex-shrink: 0`, so it stays in view while scrolling tall flowcharts. On mobile (<640px) it falls back to `column` direction and `position: static` below the SVG. `resourceLink` in node data renders as a green button linking to an external resource (PDF, form, etc.).
- **Flowchart visual style**: Decision diamonds: dark fill `#111827` + gold stroke `#eab308`. Edges/arrowheads are colored per branch — the **"No" branch out of a decision is red `#ef4444`** (matching its NO pill), everything else (including "Yes") is green `#16a34a` (`edgeColor()` in `FlowchartFullView.jsx`; if an edge is both the yes and no target — a decision whose answers converge — Yes/green wins). Yes/No labels: SVG pill badges (`<rect rx=10>` + `<text>`) — YES in green (`#14532d` fill, `#22c55e` stroke), NO in red (`#450a0a` fill, `#ef4444` stroke). Selected node: white stroke + `drop-shadow` glow. Node text uses `dominantBaseline="central"` on tspans for precise vertical centering.
- **Flowchart node sizing**: Nodes are **sized to fit their wrapped label** (no fixed width), and those dimensions are fed into dagre so text never overflows. `computeNodeMeta()` wraps the label by estimated pixel width (`CHAR_W≈6.7` for Inter 12px/500, `LINE_H=16`) and computes per-shape dimensions: rects/pills grow by label width + padding; **diamonds** are sized via the inscribed-rectangle rule (`w/W + h/H ≤ DIAMOND_FILL=0.82`, with `DIAMOND_H_FACTOR=0.33` splitting the budget) so multi-line text stays inside the slanted edges. Floors: `NODE_HEIGHT_ACTION=58`, `NODE_HEIGHT_DECISION=84`, `NODE_HEIGHT_TERMINAL=42`, `MIN_WIDTH=150`.
- **Flowchart edge rendering**: Three SVG layers so nothing is clipped: edge **paths** (behind nodes) → nodes → **arrowheads + Yes/No pills** (on top). Arrowheads stop `ARROW_GAP=6`px short of the target shape (they used to point `ARROW_LEN=9`px *into* it) via `arrowGeometry()`. YES/NO pills are **centered on the branch's vertical descent** (the line runs straight down through the pill), anchored at the top of that run but kept below the source shape's bottom edge (`+12`) so they never overlap even short, wide diamonds. `EdgeLabel` computes that anchor inline by scanning the routed points for the first vertical run.
- **Flowchart layout constants** (in `FlowchartFullView.jsx`): `PADDING=36`, `ranksep=55`, `nodesep=36`. Tuned so the widest flowchart (NSGRP, 3-column branching) fits within its container at typical desktop widths with the side panel open.
- **NSGRP flowchart accuracy**: Flow reflects dual-trigger logic (both Annex A AND Annex B required for mandatory RAF). Non-federal partnerships exit to a terminal at step 1. Annex A "No" branch exits to "Document due diligence and proceed" terminal. Attestation step added before RAF submission. Agency review node clarifies funding agency (not institution) makes final determination. RAF node links to official Risk Assessment Form page via `resourceLink`.
- **Accessibility (AODA / WCAG 2.0 AA)**: The site targets WCAG 2.0 AA. Full remediation record + the human manual-testing checklist live in [`ACCESSIBILITY.md`](ACCESSIBILITY.md). Conventions to preserve when editing:
  - **Focus indicators**: a global `:focus-visible { outline: 2px solid var(--accent) }` rule lives in `global.css`. Never add `outline: none` to an interactive element without pairing it with a visible `:focus`/`:focus-visible` style (2.4.7).
  - **Skip link**: `App.jsx` renders a `.skip-link` ("Skip to main content") as the first focusable element. It uses an `onClick`+`preventDefault` handler that focuses `#main-content` directly — a plain `href="#main-content"` would hijack the hash router and route to Home. `<main>` carries `id="main-content"` + `tabIndex={-1}`.
  - **`.sr-only`** utility class is the standard visually-hidden helper (used for the search modal's `aria-live` result count).
  - **Search modal** (`SearchBar.jsx`) is a real dialog: `role="dialog"` + `aria-modal`, labelled input, Tab focus trap, and focus return to the trigger on close. Keep these if refactoring.
  - **Interactive controls must be real elements**: use `<button>` (not `<span onClick>`) — e.g. the topbar logo is a `<button class="topbar-logo">`. Accordions expose `aria-expanded`.
  - **Flowchart Full View** SVG is `role="img"` with an `aria-label` pointing to Guided Mode as the keyboard-accessible equivalent; the NRO map's data table is the conformant alternative to the Leaflet map.
  - **Tabbed tools use the shared `Tabs.jsx`** (`TabList` / `TabPanel`), not bare `<button>`s. It supplies `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, tab↔panel `aria-controls`/`aria-labelledby`, and roving tabindex with Arrow/Home/End keys. Pass the tool's CSS prefix (`trag`, `csec`, `csec-os`, `dual`) — it generates `${prefix}-tab`, `${prefix}-tab--active`, `${prefix}-tabs`, so existing styles keep working. Any new tabbed tool must use it.
  - **Conditionally-rendered panels**: `aria-controls` is set **only while the panel is mounted** (tabs, and the NRO sanctions tiers). A dangling IDREF is an ARIA error, and these panels unmount when inactive.
  - **Page title + focus on navigation**: hash routing never reloads the document, so `App.jsx` sets `document.title` to `"<Tool name> — Research Security Toolkit"` on every route change (2.4.2, Level A) and moves focus to `#main-content` so the new view is announced instead of focus sitting on the link just clicked. The first render is skipped deliberately.
  - **Contrast**: `--text-muted` (`#93acc2`), `--red` (`#f2998c`) and `--purple` (`#b9a6d2`) are set at the minimum that clears 4.5:1 against **every** surface they render on — including the `-subtle` tint backgrounds, which are the binding constraint, not the surface ladder. Do not darken them back below AA. Re-run the contrast math (foreground vs. each surface *and* each tint composite) before changing any text token.
  - `prefers-reduced-motion: reduce` is honored globally in `global.css`.
  - **Lint gate**: `eslint-plugin-jsx-a11y` (flat `recommended` config) runs via `npm run lint` to catch a11y regressions — interactive elements must be real `<button>`/`<a>` (or carry a role + keyboard handler). Modal/drawer close-backdrops use the `e.target === e.currentTarget` click pattern with a documented `eslint-disable` line, since keyboard close is provided by Escape (search modal, STRA wizard) or a real `<button>` backdrop (mobile sidebar). `react-hooks/set-state-in-effect` is set to `warn` (not error) so the a11y errors stay the signal; pre-existing `no-unused-vars` (unused `onNavigate` props) remain and are unrelated to a11y.
- **npm audit**: Run `npm audit fix` after any dependency changes. As of 2026-09-05 the project has 0 known vulnerabilities. Note that every advisory seen so far has been in **devDependencies** (`eslint → js-yaml`, `vite → postcss → nanoid`) — they affect the build toolchain, not the shipped bundle, which has no runtime dependencies beyond React/Leaflet/Fuse/dagre/lucide. Re-check before any handoff or release; advisories accumulate on their own schedule, not ours.
- **Git worktrees**: Feature branches use `.worktrees/<branch-name>/` (already in `.gitignore`). Create with `git worktree add .worktrees/<name> -b <branch>`, remove with `git worktree remove .worktrees/<name>` after merging.
- **Dual-Use Research Guide**: A combined hub (CSS prefix `dual-`) in Compliance Tools, structured on the workshop arc *Know Your Research → Know Your Partners → Assess the Risk*. The Self-Assessment wizard is deliberately **conceptual** (intent/use, knowledge transfer, partner exposure) and hands off to STRA Lookup / NRO Lookup / Export Control rather than re-deriving STRA categories — it does not duplicate the STRA wizard. Results give a **signal read** (Likely / Possible / Low), never a "cleared" verdict or legal advice, and offer a Print summary (reuses the global print CSS + `.dual-print-only`/`.dual-no-print` toggles). Content is attributed to Public Safety Canada's Safeguarding Science program + Government of Canada guidance (not UBC). The stale workshop figures (74 subcategories / 356 entities) were dropped; cite "11 STRA categories" and link the live NRO list instead. The guide reuses the `straWizard` node shape (`dualUseWizard.js`) and the tabbed-tool button pattern from `CybersecurityGuide`.
- **Cybersecurity guide placement**: Added as its own "Operational Security" category (🔒) rather than under Reference, because the content is action-oriented (what to DO) rather than regulatory reference. CSS prefix is `csec-`. Source attribution goes to Lakehead University's cybersecurity researcher guidance, treated as representative of Canadian university best practices (same pattern as Risk Mitigation guide attribution).
- **Site footer**: `SiteFooter.jsx` renders as a **sibling of `.app-body` inside `.app`** — deliberately *outside* `<main>`, because a `<footer>` nested in `main` does not map to the `contentinfo` landmark. It carries the AODA accessibility statement and the feedback contact address that a public-facing Ontario site is expected to provide. It is a persistent slim bar (35px desktop / 61px mobile), so keep the text short; hidden in `@media print`.
- **Research Travel Security**: Operational Security category, CSS prefix `trav-`. Structured on the federal three-phase guidance (Before You Go / While Away / When You Return) using the shared `Tabs.jsx`. Checklist state persists to localStorage key `rs-toolkit-travel-v1` (separate from the risk checklist's `rs-toolkit-checklist-v1`). The **emergency contacts block sits outside the tabs** — a traveller in trouble should not have to find the right tab first. Print CSS deliberately *reveals* the collapsed `.trav-item-detail` text, since a printed pre-trip checklist is more useful with the rationale included.
- **Report a Concern**: Operational Security, CSS prefix `rept-`. A single-open scenario accordion ("what happened?") rather than a wizard — people arriving here already know their situation and need an answer, not a questionnaire. The page leads with **"start with your own institution"**: for almost every scenario the institutional research security office is the correct first call, and sending researchers straight to CSIS or the RCMP would be actively unhelpful. Federal contacts (Public Safety Research Security Centre, Cyber Centre, CSIS, RCMP NSIN) are listed per scenario and again in a full directory. The `protections` block exists because fear of consequences is the main reason concerns go unreported.
- **Sister-site sidebar card (RDM Toolkit)**: `Sidebar.jsx` pins a sister-site card at the bottom-left of the sidebar (below `.sidebar-scroll`, which is `flex: 1` — no `position: fixed`). It links to `https://rdmtoolkit.ca` in a new tab and uses the **RDM Toolkit brand wordmark** (do NOT mirror the RS Toolkit pairing here):
  - `.sidebar-sister-mark` ("RDM") — **Geist sans-serif, weight 800, upright, gold `#facc15`**
  - `.sidebar-sister-word` ("Toolkit") — **Fraunces serif, weight 700, upright (not italic), white `#ffffff`**
  - `.sidebar-sister-tagline` ("Research Data Management") — small uppercase letter-spaced muted text, reuses `.sidebar-eyebrow` typography pattern
  - `.sidebar-sister-arrow` — absolute-positioned `ArrowUpRight` (lucide, 16px) in the top-right; slides up-right and warms to `var(--accent)` on hover
  - Card: `#0a1e36` cobalt bg (hover `#0d2444`), `var(--border)` border that warms to Blaze on hover with a soft glow + 1px lift. The card chrome follows the Lakehead palette, but the **RDM wordmark itself keeps its own gold (`#facc15`) + white colors** — peer brand, do not recolor it. This is a peer-brand affordance, not an ad-hoc chip — treat it accordingly when editing.

---

## Source URLs (Policy Documents)

| Document | URL |
|---|---|
| STRAC Policy | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/policy-sensitive-technology-research-and-affiliations-concern` |
| NSGRP | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships` |
| NSGRP Risk Assessment Form | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form` |
| Ontario RS Guidelines | `https://forms.mgcs.gov.on.ca/en/dataset/on00708` |
| Tri-Agency RS Guidance | `https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-guidance-research-security` |
| NRO List | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/named-research-organizations` |
| STRA List | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-areas` |
| Safeguarding Your Research | `https://science.gc.ca/site/science/en/safeguarding-your-research` |
| Research travel guidance | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/how-can-you-protect-your-research-during-travel` |
| Safeguarding Science workshops | `https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/cntr-prlfrtn/sfgrdng-scnc/sfgrdng-scnc-wrkshp-en.aspx` |
| Report a cyber incident (Cyber Centre) | `https://www.cyber.gc.ca/en/incident-management` |
| Foreign interference guidance | `https://www.publicsafety.gc.ca/cnt/ntnl-scrt/frgn-ntrfrnc/prtct-gnst-frgn-ntrfrnc-en.aspx` |
| Global Affairs Sanctions | `https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx` |

---

## Deployment

- **Branch**: `master` — every push triggers the GitHub Actions workflow
- **Workflow**: `.github/workflows/deploy.yml` — builds with Node 20, uploads `dist/`, deploys to GitHub Pages
- **Build command**: `npm run build` → `vite build`
- **Preview locally**: `npm run dev` (Vite dev server)

---

## How to Update This File

Update this file whenever you:
- Add, remove, or rename a tool (update Tools Inventory + Directory Structure)
- Add a new data file (update Directory Structure)
- Change a policy source URL (update Source URLs table)
- Establish a new convention or make a key architectural decision (update Key Decisions)
- Add new CSS naming patterns (document in Key Decisions if non-obvious)
- Change any CSP directives in `index.html`

**Auto-update hook**: `.claude/settings.json` includes a `PreToolUse` hook on Bash that outputs a CLAUDE.md update reminder before every `git commit`. Claude sees this reminder in context and should update the file before the commit lands.

Keep entries concise — this file is loaded at the start of every session.
