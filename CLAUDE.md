# Research Security Toolkit — CLAUDE.md

> This file is the authoritative project reference for Claude Code. Update it whenever tools, data files, architecture, or conventions change.

---

## Project Overview

**Purpose**: A React + Vite static site helping Canadian researchers and institutions navigate federal research security policies. Deployed to GitHub Pages at `/RSToolkit/`. No backend — 100% client-side.

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
| Base path | `/RSToolkit/` (configured in `vite.config.js`) |

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
      Topbar.jsx                 # Title, hamburger (mobile), Ctrl+K search trigger
      Sidebar.jsx                # Category/tool nav, collapsible on mobile (<768px)
      MainContent.jsx            # Scroll container for tool pages
    ui/
      SearchBar.jsx              # GlobalSearchModal (Ctrl+K command palette)
      FlowchartViewer.jsx        # Wrapper: Full View / Guided Mode toggle
      FlowchartFullView.jsx      # SVG flowchart using dagre layout
      FlowchartGuidedMode.jsx    # Card stepper: Yes/No/Continue, back stack
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
    triAgencyData.js             # Tri-Agency RS guidance: principles, policies, agencies
    cybersecurityData.js         # 7 essential actions, file/device encryption, passwords, AI warning, sensitive data
    flowcharts/
      stracFlow.js               # STRAC policy decision nodes
      nsgrpFlow.js               # NSGRP partnership risk assessment nodes
      ontarioFlow.js             # Ontario RS Guidelines decision nodes
  styles/
    global.css                   # All styles; CSS variables for design system
  tools/
    policy-guides/
      TriAgencyGuide.jsx         # 3-tab: Overview / 10 Principles / Key Policies
      StracFlowchart.jsx         # FlowchartViewer wrapper
      NsgrpFlowchart.jsx         # FlowchartViewer wrapper
      OntarioFlowchart.jsx       # FlowchartViewer wrapper
    compliance/
      StraLookup.jsx             # STRA search + guided wizard
      NroLookup.jsx              # Map + table; CartoDB tiles; sanctioned countries banner
      RiskChecklist.jsx          # 3-state toggle; localStorage persistence; progress bar
      RiskMitigation.jsx         # Category + measure accordion; tag filter chips
    reference/
      ExportControl.jsx          # Searchable accordion reference
      Glossary.jsx               # 12-term expandable cards with category filter
      Faq.jsx                    # Accordion; auto-expands matched results when searching
    operational-security/
      CybersecurityGuide.jsx     # 4-tab guide: Quick Start / Encryption / Passwords & 2FA / AI & Sensitive Data
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
- **localStorage key**: `rs-toolkit-checklist-v1` — stores checklist item states as a flat object keyed by item ID.
- **Map tiles**: CartoDB Voyager (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`) — chosen specifically for English-language place name labels.
- **Design system (v2 — 2026-04)**: The toolkit uses an editorial/serif aesthetic with a deep forest-slate base and terracotta-copper accent — deliberately distinct from generic dark-navy + blue/gold SaaS looks. Key tokens in `global.css`:
  - `--bg-primary: #0a1411` (forest-slate base; `body` has a subtle radial-gradient overlay for warmth)
  - `--accent: #e76f51` (terracotta-copper — primary interactive color and brand accent)
  - `--link: #f4a58f` (warm peach — inline links; hover `#ffe2d2`)
  - `--font-serif: 'Fraunces'` (hero, `.home-section-title`, `.home-scenario-label`, `.tool-page-header h1`, topbar `RS` mark — uses `font-variation-settings` with `SOFT` + `opsz` axes for characterful italics)
  - `--font-sans: 'Geist'` (body text)
  - `--font-mono: 'JetBrains Mono'` (counts, kbd)
  - Fonts load from Google Fonts via `<link>` in `index.html`. CSP `style-src` allows `https://fonts.googleapis.com`; `font-src` allows `https://fonts.gstatic.com`.
- **Source links**: All policy sources must be hyperlinked, never plain text. Inline hyperlinks across the site use `var(--link)` (`#f4a58f`) — warm peach readable on the dark forest-slate base. Hover state uses `var(--link-hover)` (`#ffe2d2`). Do not use `var(--accent)` for plain text links; that color is reserved for interactive UI elements (buttons, active states, borders).
- **UBC attribution**: Do not attribute any content to UBC specifically. Use "Canadian university research security programs" for the Risk Mitigation tool sourcing.
- **Sanctioned countries**: NRO Lookup shows a banner for comprehensively sanctioned countries (North Korea/DPRK, Belarus). Russia and Iran appear in the NRO list and are noted as also comprehensively sanctioned.
- **NRO map cluster colors**: `MarkerCluster` in `NroLookup.jsx` uses a custom `iconCreateFunction` — do NOT rely on Leaflet's default cluster icons. Clusters tally their children by `fillColor` and render as a solid `divIcon` in the **dominant** country color (Russia `#ef4444`, China `#3b82f6`, Iran `#22c55e`), matching the legend. Leaflet's default green/yellow/orange cluster colors (which scale with count, not country) must not be reintroduced. If adding a new country, update `COUNTRY_COLORS` at the top of `NroLookup.jsx` and the legend will pick it up automatically.
- **NRO per-institution coordinates**: `nroData.js` stores real per-campus coordinates (4 decimal places, ~11m precision), not city centers. This was a deliberate fix because city-center coordinates caused every org in the same city to stack on one pin (e.g., 28 Beijing orgs at 39.9042, 116.4074). When adding a new NRO, always look up the institution's actual campus coordinates rather than using the city center. All 126 current entries have unique coordinates. Known caveats: (1) 33rd TsNII has `city: "Moscow"` but its coordinates point to Shikhany-2 in Saratov Oblast where it actually sits. (2) PEAC Institute of Multiscale Sciences is labeled Mianyang but is actually headquartered at Sichuan University in Chengdu — current coords still match the Mianyang city label; the `city` field may want updating.
- **Glossary scope**: Exactly 12 terms — STRA, STRAC Policy, NSGRP, Dual-Use, Controlled Goods, Export Controls, Due Diligence, NRO, Research Security, Risk Assessment, Risk Mitigation, Sanctions.
- **Print support**: RiskChecklist and RiskMitigation both have print buttons (`window.print()`); print CSS is in `global.css`. Print uses `@page { size: A4 portrait; margin: 1.5cm }` and explicitly overrides `height`/`overflow`/`flex` on every layout container (`.app`, `.app-body`, `.main-content`, etc.) individually — required because `height: 100vh; overflow: hidden` on `.app` would otherwise clip all content to one page.
- **Checklist print state**: Each checklist item renders a `<div className="checklist-print-state">` element showing the current state (✓ No Risk / ⚠ Risk Identified / — N/A). It is `display: none` on screen and `display: block` in `@media print`, so the printed output reflects the user's selections.
- **Security headers**: `index.html` includes a `Content-Security-Policy` meta tag restricting scripts to `self + unsafe-inline`, images to self + CartoDB tile domains. `connect-src` allows `'self'` plus `https://nominatim.openstreetmap.org` (required for the NRO proximity search geocoding panel). Also includes `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.
- **NRO proximity search**: `NroLookup.jsx` includes a "Check proximity to NROs" panel. It geocodes arbitrary institution names via `https://nominatim.openstreetmap.org/search` (free, no API key, rate-limited to ~1 req/s — fine for interactive use). The user picks from up to 5 suggestions; a gold `★` `divIcon` (class `.nro-my-institution-icon`) is placed on the map and the 5 nearest NROs are listed with distances computed by Haversine formula (pure JS, no external calls). Clicking a nearest-NRO row highlights it in the main table and flies the map to it. `FlyToHandler` accepts an optional `zoom` field — institution placement uses zoom 7 so nearby NROs are visible; row clicks use zoom 10.
- **Flowchart node detail panel**: Clicking a flowchart node in Full View mode opens a sticky side panel to the **right** of the SVG container (not an absolute overlay). Layout: `.flowchart-outer` is `display: flex; flex-direction: row; gap: 12px`. The panel (`.flowchart-node-panel`) is `position: sticky; top: 16px; width: 240px; flex-shrink: 0`, so it stays in view while scrolling tall flowcharts. On mobile (<640px) it falls back to `column` direction and `position: static` below the SVG. `resourceLink` in node data renders as a green button linking to an external resource (PDF, form, etc.).
- **Flowchart visual style**: Decision diamonds: dark fill `#111827` + gold stroke `#eab308`. All edges/arrowheads: green `#16a34a`. Yes/No labels: SVG pill badges (`<rect rx=10>` + `<text>`) — YES in green (`#14532d` fill, `#22c55e` stroke), NO in red (`#450a0a` fill, `#ef4444` stroke). Selected node: white stroke + `drop-shadow` glow. Node text uses `dominantBaseline="central"` on tspans for precise vertical centering.
- **Flowchart layout constants** (in `FlowchartFullView.jsx`): `NODE_WIDTH=190`, `NODE_HEIGHT_ACTION=58`, `NODE_HEIGHT_DECISION=84`, `NODE_HEIGHT_TERMINAL=42`, `PADDING=36`, `ranksep=55`, `nodesep=30`. Tuned so the widest flowchart (NSGRP, 3-column branching) fits within its container at typical desktop widths with the side panel open.
- **NSGRP flowchart accuracy**: Flow reflects dual-trigger logic (both Annex A AND Annex B required for mandatory RAF). Non-federal partnerships exit to a terminal at step 1. Annex A "No" branch exits to "Document due diligence and proceed" terminal. Attestation step added before RAF submission. Agency review node clarifies funding agency (not institution) makes final determination. RAF node links to official Risk Assessment Form page via `resourceLink`.
- **npm audit**: Run `npm audit fix` after any dependency changes. As of 2026-04-08 the project has 0 known vulnerabilities.
- **Git worktrees**: Feature branches use `.worktrees/<branch-name>/` (already in `.gitignore`). Create with `git worktree add .worktrees/<name> -b <branch>`, remove with `git worktree remove .worktrees/<name>` after merging.
- **Cybersecurity guide placement**: Added as its own "Operational Security" category (🔒) rather than under Reference, because the content is action-oriented (what to DO) rather than regulatory reference. CSS prefix is `csec-`. Source attribution goes to Lakehead University's cybersecurity researcher guidance, treated as representative of Canadian university best practices (same pattern as Risk Mitigation guide attribution).

---

## Source URLs (Policy Documents)

| Document | URL |
|---|---|
| STRAC Policy | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-and-affiliations-concern` |
| NSGRP | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/national-security-guidelines-research-partnerships` |
| NSGRP Risk Assessment Form | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form` |
| Ontario RS Guidelines | `https://forms.mgcs.gov.on.ca/en/dataset/on00708` |
| Tri-Agency RS Guidance | `https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-guidance-research-security` |
| NRO List | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/named-research-organizations` |
| STRA List | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-areas` |
| Safeguarding Your Research | `https://science.gc.ca/site/science/en/safeguarding-your-research` |
| Global Affairs Sanctions | `https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx` |

---

## Deployment

- **Branch**: `master` — every push triggers the GitHub Actions workflow
- **Workflow**: `.github/workflows/deploy.yml` — builds with Node 20, uploads `dist/`, deploys to GitHub Pages
- **Build command**: `npm run build` → `vite build`
- **Preview locally**: `npm run dev` (Vite dev server — defaults to port 5173)
- **Dev port override**: `vite.config.js` reads `process.env.PORT` when set and enables `strictPort` in that case. This lets the Claude Code preview tool assign its own port without Vite drifting to 5174. Production builds are unaffected.

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
