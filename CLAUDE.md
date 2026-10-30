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
| Map tiles | Provider-swappable, see `src/data/mapTiles.js`. CARTO Voyager + free key recommended (Latin labels at every zoom); keyless Esri fallback if no key is set |
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
  main.jsx                       # Mounts App; imports the self-hosted @fontsource fonts
  routing.js                     # parseHashRoute(): #tool or #tool/sub → { route, subRoute }
  siteConfig.js                  # Host-owned values: contacts, SITE_URL, WEB_HOST, ENABLE_PROXIMITY_SEARCH, sister-site card, ENABLE_DEFENCE_TRACKER
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
      map/                       # Shared by NRO Lookup and the tracker's map view
        MarkerCluster.jsx        # Clustered circle markers; cluster colour from colorFor (default: dominant fill)
        FlyToHandler.jsx         # Imperative map fly-to
        clusterColor.js          # dominantColor(): most common fill, optional tie priority
        escapeHtml.js            # Escapes every value going into a Leaflet popup (innerHTML)
  data/
    toolRegistry.js              # CATEGORIES + ALL_TOOLS — single source of truth for nav/home
    nroData.js                   # 126 NROs with per-institution lat/lng (see Key Decisions)
    mapTiles.js                  # Basemap tile providers + env-var key selection (see Key Decisions)
    straData.js                  # STRA categories and subcategories
    straWizard.js                # Guided STRA assessment question tree
    riskChecklist.js             # 4 sections, ~24 items; NSGRP-sourced
    exportControlData.js         # 5 sections: EIPA, Defence Production Act, ACL, SEMA, UN Act
    glossaryData.js              # 12 terms with official Canadian/Ontario Gov definitions
    faqData.js                   # 25 FAQs across 6 categories (26 with the Defence Institution Tracker switched on)
    howItWorksData.js            # "How this site works": complete outbound-request list, localStorage keys, alternatives comparison, safeguards
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
    defenceTracker/              # Tracker dataset, CC BY 4.0 (© 2026 Andrew Austin); README.md has the schema rules
      institutions/<id>.json     # One record per institution; the id is its permanent permalink
      listings/                  # Official-list snapshots: us-csl, ca-sanctions (generated), us-1286, jp-meti-eul (by hand)
      meta.json, changelog.json  # Dataset version (YYYY.MM), rubric version, licence, list check dates; dataset changes
      index.js                   # getTrackerData(): import.meta.glob → buildDataset + match index (browser)
      enabled.js                 # TRACKER_ENABLED, compiled from __TRACKER_ENABLED__ (browser only)
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
      NroLookup.jsx              # Map + table; tiles from mapTiles.js; sanctioned countries banner
      RiskChecklist.jsx          # 3-state toggle; localStorage persistence; progress bar
      RiskMitigation.jsx         # Category + measure accordion; tag filter chips
      DualUseGuide.jsx           # 4-tab: Self-Assessment wizard / Dual-Use Areas / Vetting Collaborators / Due Diligence
      defence-tracker/           # Defence Institution Tracker (CSS prefix dit-), hidden until launch
        DefenceTracker.jsx       # View switch by sub-route; keeps search + batch state in memory
        TrackerSearch.jsx        # Search, filters, List · Map switch; rows carry list chips and what-it-means notes
        TrackerMap.jsx           # Lazy-loaded map view, markers coloured by rating
        InstitutionProfile.jsx   # Profile: rating + "Why this rating" with list evidence, listings, Annex B evidence, sources; copy record for file
        BatchCheck.jsx           # Paste affiliations → match table, copy / CSV / print
        TrackerMethodology.jsx   # Rubric and signals rendered from code, list dates, licence, downloads
        RatingBadge.jsx, ListChips.jsx, TrackerSection.jsx, download.js  # Badge (+ "from official lists"), list chips, accessible accordion section, in-browser file save
        lib/                     # Plain ESM (Node-tested): constants, rubric, normalize, places, matcher, schema, dataset, recordText, mapMarkers, views
    reference/
      ExportControl.jsx          # Searchable accordion reference
      Glossary.jsx               # 12-term expandable cards with category filter
      Faq.jsx                    # Accordion; auto-expands matched results when searching
      HowItWorks.jsx             # Single scrolling privacy/architecture explainer + "clear saved data" button
    operational-security/
      CybersecurityGuide.jsx     # 4-tab guide: Quick Start / Encryption / Passwords & 2FA / AI & Sensitive Data
      TravelSecurity.jsx         # 3-phase travel checklist + emergency contacts
      ReportConcern.jsx          # Scenario accordion -> what to do now + who to contact
scripts/tracker/                 # Tracker upkeep (Node): sync-listings, watch, check-sources, archive-sources, next, import-misp; lib/
  research/                      # Research helpers (README): patch-record, new-record, rating, try-match (Node); html-text, pdf-text, casi-entry (Python)
docs/tracker/research-playbook.md  # How profiles are researched, archived and verified; the monthly routine
.claude/skills/tracker-research/   # Project skill for Claude research sessions (same rules as the playbook)
.github/workflows/tracker-watch.yml  # Monthly watch: opens a "Tracker watch — YYYY-MM" issue, never writes to the repo
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
| `defence-tracker` | Defence Institution Tracker (hidden until launch: `ENABLE_DEFENCE_TRACKER`) | `defenceTracker/` + `nroData.js` |

### Reference
| Slug | Tool Name | Data File |
|---|---|---|
| `export-control` | Export Control Quick Reference | `exportControlData.js` |
| `glossary` | Glossary / Jargon Decoder | `glossaryData.js` |
| `faq` | Research Security FAQ | `faqData.js` |
| `how-it-works` | How This Site Works | `howItWorksData.js` |

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

- Hash-based: `window.location.hash = 'tool-slug'` to navigate. `parseHashRoute()` in `src/routing.js` reads `#tool` or `#tool/sub` (a leading `#/` is still accepted for old links)
- Sub-routes: only the Defence Institution Tracker uses one (`#defence-tracker/<institution-id>`, `/batch`, `/methodology`), for citable permalinks. Every tool receives `subRoute` and `onPageTitle`; the others ignore them. No query parameters, and never put user-typed text in the hash
- `onNavigate(slug)` prop passed to all tool components for cross-tool linking (it accepts `tool/sub`)
- App composes `document.title` from a tool's `onPageTitle(title)`. A tool must not set `document.title` itself: React runs child effects before the parent's, so App's effect would overwrite it

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
- **`SITE_URL` is the single source for the domain**: `index.html` uses `%SITE_URL%` placeholders (canonical, `og:url`, `og:image`, `twitter:image`) that the `siteUrlPlugin` in `vite.config.js` fills from `SITE_URL` in `src/siteConfig.js` (or a `SITE_URL` env var for one-off builds). The build throws unless it is an absolute `https://` URL. Never hard-code the domain back into `index.html`.
- **Map tiles**: Configured in `src/data/mapTiles.js`, not inline in the component. The hard requirement is **English place labels** — the map plots Chinese, Russian and Iranian institutions, and the standard OpenStreetMap basemap renders those in local script (Hanzi / Cyrillic / Perso-Arabic), which would make the map unreadable for its audience. Any replacement provider must be checked against that.
  - **Label coverage was verified tile-by-tile over Beijing / Moscow / Tehran.** CARTO Voyager and Stadia Alidade are Latin at *every* zoom. Esri is Latin through **z10** and then switches to local script — a z12 tile over Beijing comes back with Hanzi street names. The UI only drives you to z3 (overview), z7 (proximity placement) and z10 (table-row fly-to), so the keyless default is correct everywhere the tool actually takes you, and degrades only if a user deliberately zooms past z10.
  - **Recommended production setup**: CARTO Voyager with a free key — the only option that is Latin at every zoom, and it restores the site's original appearance exactly.
  - **Fallback default (no key)**: Esri World Street Map (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}`). Note the **`{z}/{y}/{x}` ordering** — Esri is y-before-x, unlike the OSM-style `{z}/{x}/{y}` providers. No key, no signup, no watermark.
  - **Why not CARTO Voyager any more**: CARTO began enforcing API keys on `basemaps.cartocdn.com` in **August 2026**. Unkeyed requests still return HTTP 200 tiles, so nothing appears broken in the network tab — but every tile is stamped with a repeating "API KEY REQUIRED" watermark. CARTO has also put raster basemaps on a deprecation path in favour of vector. Do **not** reinstate the unkeyed CARTO URL.
  - **Switching providers**: set `VITE_CARTO_API_KEY` (free, 5M tiles/month, restores the original Voyager look) or `VITE_STADIA_API_KEY` (Alidade Smooth; key is domain-lockable so it is safe in a public bundle) at build time. A key wins over the default; CARTO is checked first. See `.env.example`; the deploy workflow passes both through from repo secrets. Never commit a real key. Any key that is set ships in the public bundle (verified with dummy keys: both ship if both secrets are set, not just the active one), so set only one, and restrict the CARTO key to the production domain if CARTO offers that — otherwise anyone can spend its quota (2026-10-22 security audit).
  - Adding a provider means adding its host to the CSP `img-src` in `index.html`.
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
  - Fonts are **self-hosted** from npm — `@fontsource-variable/inter`, `@fontsource-variable/archivo` (both `wght` + `wght-italic`) and `@fontsource/jetbrains-mono` (400, 500) — imported in `src/main.jsx`. Fontsource registers the variable fonts as `'Inter Variable'` / `'Archivo Variable'`, so the `--font-*` tokens list those first. **Do not reintroduce Google Fonts**: it sent every visitor's IP to Google on every page load (removed in the 2026-10-03 security audit), and CSP `style-src`/`font-src` are now `'self'` only. `build.assetsInlineLimit` in `vite.config.js` refuses to inline font files, because Vite would otherwise turn the smallest subsets into `data:` URIs that `font-src 'self'` blocks.
- **Brand icons**: `public/favicon.ico`, `public/apple-touch-icon.png` and `public/og-image.png` are **generated**, not hand-drawn — run `python scripts/generate-icons.py` (needs Pillow; it is a dev-time one-off, deliberately **not** an npm dependency). Output is deterministic, so regenerating produces a byte-identical result unless you changed the script. The mark mirrors the topbar logo: Blaze `RS` on Cobalt. **If `--accent` or `--bg-primary` change in `global.css`, update `COBALT`/`BLAZE` at the top of the script too** — the coupling is by convention, not by import. Two shape rules that are not interchangeable: the **favicon** is a rounded square with transparent corners (browsers composite it over varied backgrounds), while the **apple-touch-icon is full-bleed and fully opaque with no alpha** — iOS applies its own corner mask, and alpha in the corners renders as black corners in Reading List, pinned tabs, and the share sheet. Do not "unify" them by reusing one shape for both. The previous `favicon.svg` (a purple `#863bff` Figma export) and `icons.svg` (a Bluesky/Discord/X/GitHub sprite) were starter-template leftovers of unknown provenance and were removed; do not reintroduce third-party marks.
- **Source links**: All policy sources must be hyperlinked, never plain text. Inline hyperlinks across the site use `var(--link)` (`#6fb2e8`, sky-blue) — readable on the dark cobalt base. Hover state uses `var(--link-hover)` (`#a9d4f8`). Do not use `var(--accent)` (Blaze) for plain text links; that color is reserved for interactive UI elements (buttons, active states, borders) and yellow text links read like warnings.
- **UBC attribution**: Do not attribute any content to UBC specifically. Use "Canadian university research security programs" for the Risk Mitigation tool sourcing.
- **Sanctioned countries banner (NRO Lookup)**: The banner above the map is a **two-tier, collapsible** summary tuned for research-collaboration decisions (not legal advice). Both tiers are **collapsed by default**; each header is a `<button>` showing a destination count and chevron, with `aria-expanded` / `aria-controls` wiring. State: `tier1Open`, `tier2Open` in `NroLookup.jsx`.
  - **Tier 1 — Comprehensive sanctions (collaboration almost certainly prohibited)** (red, `.nro-sanctioned-title--tier1`): North Korea (DPRK); Occupied regions of Ukraine (Crimea, Donetsk, Luhansk, Zaporizhzhia, Kherson). Framed as "off the table unless GAC's Sanctions Bureau confirms the specific activity is permitted" — **not** "no research engagement", which overstated the law.
  - **Tier 2 — Broad sanctions (check the specific activity before engaging)** (amber, `.nro-sanctioned-title--tier2`): Russia, Belarus, Iran, Myanmar (Burma). Scope varies — Russia/Belarus/Iran are sweeping sectoral + list; Myanmar is narrower (targeted designations + arms embargo + technical-data prohibition). Body text says collaboration is not categorically banned and names the checks: listed persons, controlled items, restricted sectors/services, and ownership or control **directly or indirectly** by a listed entity.
  - Wording follows Global Affairs Canada's academic/research sanctions guidance (`.../sanctions/academic-research-universitaire-recherche.aspx?lang=eng`, linked in the banner note beside the sanctions index): prohibitions are **activity-specific** (dealings with listed persons, even indirect; supply of listed goods, technology and services incl. R&D and technical assistance). Never state a blanket country ban or call every breach a "criminal offence".
  - **Do not re-add Syria** to this banner without re-checking the source: Canada repealed broad sectoral Syria sanctions on 2026-02-13; the remaining regime is targeted at former Assad-regime figures and no longer belongs alongside Russia/Iran for research-partnership purposes.
  - When revising the list, always cross-check against the Global Affairs Canada sanctions index (linked in the footer note) since the policy landscape moves fast.
- **NRO map cluster colors**: `MarkerCluster` (`src/components/ui/map/MarkerCluster.jsx`, shared with the Defence Institution Tracker's map view) uses a custom `iconCreateFunction` — do NOT rely on Leaflet's default cluster icons. Clusters tally their children by `fillColor` and render as a solid `divIcon` in the **dominant** country color (Russia `#ef4444`, China `#3b82f6`, Iran `#22c55e`), matching the legend. Leaflet's default green/yellow/orange cluster colors (which scale with count, not country) must not be reintroduced. If adding a new country, update `COUNTRY_COLORS` at the top of `NroLookup.jsx` and the legend will pick it up automatically.
- **NRO per-institution coordinates**: `nroData.js` stores real per-campus coordinates (4 decimal places, ~11m precision), not city centers. This was a deliberate fix because city-center coordinates caused every org in the same city to stack on one pin (e.g., 28 Beijing orgs at 39.9042, 116.4074). When adding a new NRO, always look up the institution's actual campus coordinates rather than using the city center. All 126 current entries have unique coordinates. Known caveats: (1) 33rd TsNII has `city: "Moscow"` but its coordinates point to Shikhany-2 in Saratov Oblast where it actually sits. (2) PEAC Institute of Multiscale Sciences is labeled Mianyang but is actually headquartered at Sichuan University in Chengdu — current coords still match the Mianyang city label; the `city` field may want updating.
- **Glossary scope**: Exactly 12 terms — STRA, STRAC Policy, NSGRP, Dual-Use, Controlled Goods, Export Controls, Due Diligence, NRO, Research Security, Risk Assessment, Risk Mitigation, Sanctions.
- **Print support**: RiskChecklist and RiskMitigation both have print buttons (`window.print()`); print CSS is in `global.css`. Print uses `@page { size: A4 portrait; margin: 1.5cm }` and explicitly overrides `height`/`overflow`/`flex` on every layout container (`.app`, `.app-body`, `.main-content`, etc.) individually — required because `height: 100vh; overflow: hidden` on `.app` would otherwise clip all content to one page.
- **Checklist print state**: Each checklist item renders a `<div className="checklist-print-state">` element showing the current state (✓ No Risk / ⚠ Risk Identified / — N/A). It is `display: none` on screen and `display: block` in `@media print`, so the printed output reflects the user's selections.
- **Security headers**: `index.html` includes a `Content-Security-Policy` meta tag restricting scripts to `'self'` only (**no `'unsafe-inline'`** — the production build has no inline scripts or handlers, and that allowance is exactly what a DOM-injected `onerror=` would need; verified 2026-09-18 with zero CSP violations on the map page), images to self + `data:` (inlined Leaflet marker PNGs; `blob:` was removed as unused) + the basemap tile hosts (CartoDB, Esri `server.arcgisonline.com`, Stadia `tiles.stadiamaps.com`) — a new tile provider needs its host added to `img-src`. `connect-src` allows `'self'` plus `https://nominatim.openstreetmap.org` and `https://en.wikipedia.org` (both required for the NRO proximity search geocoding panel). The CSP meta tag **is** enforced — it actively blocks violations.
  - **What a `<meta>` tag cannot do**: the valid `http-equiv` pragma directives are a closed list — `content-language`, `content-type`, `content-security-policy`, `default-style`, `refresh`, `set-cookie`, `x-ua-compatible`. `frame-ancestors` is additionally ignored by the CSP spec when delivered in `<meta>` (browsers log a console error for it, which is how it was caught). `X-Content-Type-Options` is not a pragma directive at all. Both were previously declared and inert. MDN warns directly against this: *"Do not set other security headers using `<meta http-equiv=`, as this can lead to a false sense of security!"* GitHub Pages sends neither header itself and gives no way to set response headers, so they are now **omitted with an explanatory comment** rather than left in to imply protection that is not in force. Restoring them requires fronting the site with something that can set headers (e.g. Cloudflare).
  - **Referrer policy must use `<meta name="referrer">`, not `http-equiv`** — `Referrer-Policy` is not a valid pragma directive. Do not "tidy" it back to `http-equiv`. (Note: modern browsers already default to `strict-origin-when-cross-origin`, so this is belt-and-braces rather than a behaviour change.)
  - **`style-src` and `img-src` list only what is actually loaded.** Leaflet's CSS is bundled from npm, so the old `unpkg.com` / `cdnjs.cloudflare.com` allowances were removed as dead. `img-src` likewise dropped `https://*.tile.openstreetmap.org`: no provider in `mapTiles.js` serves tiles from it (Esri, CARTO and Stadia are the three), and `openstreetmap.org` appears in the app only as the Nominatim endpoint under `connect-src` and as attribution `<a href>` links. Do not re-add a host "just in case" — a dead allowance is exactly what a security review will ask you to justify.
  - **Header CSP + meta CSP are both enforced** (a request must pass both), not "header wins". HANDOFF.md §4/§4a carries the header version (meta policy + `frame-ancestors 'none'`) and nginx/Apache/IIS configs — keep the host lists identical in both places. SECURITY.md is the audit record (2026-10-03, follow-up 2026-10-22) and the re-check list. Its **Assessment record** table states scope, dates and who did it: a developer self-assessment done with Claude Code, **not** independent. Keep it that way — Lakehead's web team rejected an earlier hosting request (2026-10) partly because a security-review section had unfilled placeholders, and any future review must name its scope, date and reviewer. Never describe the review as independent or third-party.
  - HANDOFF.md's "Security headers" section carries the response-header config the hosting team must apply (including HSTS), so keep the two in step if this changes.
- **NRO proximity search**: `NroLookup.jsx` includes a "Check proximity to NROs" panel. It is the **only feature that sends user input off the device**, so it carries a point-of-entry privacy notice (`#nro-proximity-privacy`, `.nro-proximity-privacy`, wired to the input via `aria-describedby`; the input has `autoComplete="off"`) and can be removed entirely with `ENABLE_PROXIMITY_SEARCH` in `src/siteConfig.js` — which also drops its row/limit on How This Site Works and its sentence in the FAQ `help-safe` answer. The user picks from up to 5 geocoded suggestions; a gold ★ `divIcon` (class `.nro-my-institution-icon`) is placed on the map and the 5 nearest NROs are listed with distances computed by Haversine formula (pure JS, no external calls). Clicking a nearest-NRO row highlights it in the main table and flies the map to it. `FlyToHandler` accepts an optional `zoom` field — institution placement uses zoom 7 so nearby NROs are visible; row clicks use zoom 10.
  - **Geocoding is a two-stage chain**: `https://nominatim.openstreetmap.org/search` first (free, no API key, rate-limited to ~1 req/s — fine for interactive use), then the **English Wikipedia API** (`en.wikipedia.org/w/api.php?action=query&generator=search&prop=coordinates&origin=*`, also keyless) only when Nominatim returns zero results.
  - **Why the fallback exists**: Nominatim only knows what is mapped in OpenStreetMap, and OSM's coverage of universities outside Western Europe / North America is patchy. Verified misses include **Minnan Normal University** (absent from OSM entirely — an Overpass query for 闽南师范 over the Zhangzhou bbox returns 0 elements, and Nominatim returns `[]` for the English name, the Chinese name, and the fully-qualified `…Zhangzhou Fujian China` form) and **Bauman Moscow State Technical University**. Both resolve correctly via Wikipedia. This is a data-coverage gap, not a query-formatting problem — do not "fix" it by reformatting the Nominatim query.
  - Wikipedia results are **article-level coordinates** (main-campus centroid), not street addresses — accurate enough for the tens-to-hundreds-of-km distances this panel reports. Every suggestion is labelled with its source (`via OpenStreetMap` / `via Wikipedia`, class `.nro-proximity-suggestion-source`) so the user knows which precision they are getting.
  - Wikipedia's own relevance ranking is loose (searching a specific university also surfaces the city and neighbouring institutions), so `geocodeWikipedia()` filters out coordinate-less pages and sorts exact/prefix title matches ahead of the API's `index` ordering.
  - Both geocoder hosts are live entries in the CSP `connect-src`; a further geocoder would need its host added there too.
- **Flowchart node detail panel**: Clicking a flowchart node in Full View mode opens a sticky side panel to the **right** of the SVG container (not an absolute overlay). Layout: `.flowchart-outer` is `display: flex; flex-direction: row; gap: 12px`. The panel (`.flowchart-node-panel`) is `position: sticky; top: 16px; width: 240px; flex-shrink: 0`, so it stays in view while scrolling tall flowcharts. On mobile (<640px) it falls back to `column` direction and `position: static` below the SVG. `resourceLink` in node data renders as a green button linking to an external resource (PDF, form, etc.).
- **Flowchart visual style**: Decision diamonds: dark fill `#111827` + gold stroke `#eab308`. Edges/arrowheads are colored per branch — the **"No" branch out of a decision is red `#ef4444`** (matching its NO pill), everything else (including "Yes") is green `#16a34a` (`edgeColor()` in `FlowchartFullView.jsx`; if an edge is both the yes and no target — a decision whose answers converge — Yes/green wins). Yes/No labels: SVG pill badges (`<rect rx=10>` + `<text>`) — YES in green (`#14532d` fill, `#22c55e` stroke), NO in red (`#450a0a` fill, `#ef4444` stroke). Selected node: white stroke + `drop-shadow` glow. Node text uses `dominantBaseline="central"` on tspans for precise vertical centering.
- **Flowchart node sizing**: Nodes are **sized to fit their wrapped label** (no fixed width), and those dimensions are fed into dagre so text never overflows. `computeNodeMeta()` wraps the label by estimated pixel width (`CHAR_W≈6.7` for Inter 12px/500, `LINE_H=16`) and computes per-shape dimensions: rects/pills grow by label width + padding; **diamonds** are sized via the inscribed-rectangle rule (`w/W + h/H ≤ DIAMOND_FILL=0.82`, with `DIAMOND_H_FACTOR=0.33` splitting the budget) so multi-line text stays inside the slanted edges. Floors: `NODE_HEIGHT_ACTION=58`, `NODE_HEIGHT_DECISION=84`, `NODE_HEIGHT_TERMINAL=42`, `MIN_WIDTH=150`.
- **Flowchart edge rendering**: Three SVG layers so nothing is clipped: edge **paths** (behind nodes) → nodes → **arrowheads + Yes/No pills** (on top). Arrowheads stop `ARROW_GAP=6`px short of the target shape (they used to point `ARROW_LEN=9`px *into* it) via `arrowGeometry()`. YES/NO pills are **centered on the branch's vertical descent** (the line runs straight down through the pill), anchored at the top of that run but kept below the source shape's bottom edge (`+12`) so they never overlap even short, wide diamonds. `EdgeLabel` computes that anchor inline by scanning the routed points for the first vertical run.
- **Flowchart layout constants** (in `FlowchartFullView.jsx`): `PADDING=36`, `ranksep=55`, `nodesep=36`. Tuned so the widest flowchart (NSGRP, 3-column branching) fits within its container at typical desktop widths with the side panel open.
- **NSGRP flowchart accuracy (restructured 2026-09-18)**: the Risk Assessment Form trigger is **listed funding opportunity + at least one private-sector partner** (tri-agency implementation guidance, modified 2026-03-27; listed programs are in the `check-program` node and in the Source URLs table) — **not** "Annex A AND Annex B". Annex A/B decide how much mitigation to describe; a "No" on either **never** routes to the no-RAF terminal, and `tests/flowcharts.test.mjs` proves it by removing `submit-raf` from the graph and asserting no end node is reachable from `raf-required` (mutation-checked). The named-researcher attestation is **STRAC's, not NSGRP's**, and is cross-linked rather than inlined — the same conflation was also removed from `dualUseData.js` and `riskChecklist.js`. Funding organization (not institution) makes the final determination. Re-check the program list whenever content is re-verified.
- **Flowchart graph-integrity tests**: `npm test` runs `node --test "tests/**/*.test.mjs"` (Node's built-in runner, zero dependencies; a bare directory argument fails on Node 22, so keep the quoted glob). For each flow it checks unique ids, one start node, every `next`/`yes`/`no` target exists, decision/end/action edge shape, reachability from start, and that every path reaches an end. It runs in the CI `verify` job, and ESLint covers `tests/**/*.mjs` with Node globals.
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
- **Content verification (2026-09-18)**: every `lastUpdated` date is a *verified-against-source* date, not an edit date — only bump it after re-reading the live source. The 2026-09-18 pass checked all 20 URLs in the five oldest files and the live STRA, NRO, STRAC, NSGRP, Tri-Agency and Lakehead cybersecurity pages. Facts that were wrong and are now corrected, do not reintroduce: STRAC attestation is **at application, maintained for the grant's duration** (not "annual"); STRAC applies to **new applications from 2024-05-01 and is not retroactive** (not "existing grants"); the STRA list has **11** categories (not "approximately 12"); the NRO list names **103** organizations (85 China / 12 Iran / 6 Russia, page modified 2024-04-18 — the toolkit's 126 pins are that list with CAEP sub-institutes split out), not "hundreds"; NSGRP uses a **Risk Assessment Form** reviewed by the **funding organization** (not a "questionnaire" reviewed by "program officers"), and its scope is "relevant federal partnership funding opportunities", not a fixed partner-type list. **science.gc.ca moved four pages** under `.../sensitive-technology-research-and-affiliations-concern/` (NRO list, STRA list, STRAC policy) and `.../mitigating-your-research-security-risks/` (travel guidance); the old URLs still meta-refresh but every citation now uses the new canonical path — the Source URLs table below is current. The Controlled Goods Program moved to `canada.ca/.../industrial-security/controlled-goods.html`. **Second pass (2026-09-18 to 2026-09-24, from draft PR #21's audit, each item re-verified against its primary source):** STRAC **applies whenever an application aims to advance a STRA** and every named researcher attests even with no NRO tie (STRAC FAQ Q2, Q5); merely *using* a technology is out of scope (Q13); co-authoring with someone at an NRO does **not** create an affiliation, but involving them in STRA-grant work can breach (Q19–20); foreign talent programs are not covered unless they create an NRO affiliation or funding (Q10). Canada has **no "deemed export"** rule (US concept) — EIPA covers intangible transfers *out of* Canada, the Controlled Goods Program covers domestic access, and US-origin technology can carry US rules. The RCR Framework sets **no retention period** (s. 2.1.2 defers to the funding agreement, institutional policy, law and disciplinary standards) — never state "7 years". **OCAP® is First Nations**, not Indigenous-wide. macOS `zip -er` is ZipCrypto — the guide uses a Disk Utility AES-256 image; recovery-key escrow defers to institutional IT on managed devices. Ontario's **Relevant Period** runs two years before signing through anticipated project completion and covers all of a researcher's projects; Option B is NRO-specific. `lastUpdated` was left at 2026-09-18 where only individual passages (not whole files) were re-checked later. **Pre-launch pass (2026-09-24):** all federal source pages unchanged since the 09-18 pass; the live NRO list (103) and STRA list (11 categories / 74 subcategories) were diffed name-by-name against `nroData.js`/`straData.js` and match. Corrected: STRAC attestation is by **named roles** only — HQP don't attest unless named, but must comply (STRAC FAQ Q3); STRAC considers **only current** affiliations, so never say past ones "surface later"; the NRO list does **not** automatically extend to unlisted subsidiaries; export-control enquiries go to GAC's export controls program, **not** the Trade Commissioner Service; there is no Ontario rule mandating a stand-alone institutional RS policy; reporting foreign interference is not "protected under Canadian law" — don't say so. Contacts verified: CSIS 1-800-267-7685 and 613-993-9620 (Public Safety FI page + CSIS contact page), RCMP NSIN 1-800-420-5805 (no public email — `NSIN_RISN@` was removed), GAC EWRC +1-613-996-8885 / sos@, PS Research Security Centre email. Ontario's ministry is now the **Ministry of Colleges, Universities, Research Excellence and Security**; ON00708E itself is still the 2024/06 edition.
- **npm audit**: Run `npm audit fix` after any dependency changes. As of 2026-10-27 the project has 0 known vulnerabilities (that day's `npm audit fix` moved `zod` 4.3.6 → 4.6.7 for GHSA-mrhx-c7xc-m3w5, a high-severity memory-exhaustion advisory in a package only `eslint-plugin-react-hooks` pulls in, which had started failing the CI audit gate on every new PR; the 2026-10-22 one moved `vite` 8.3.2 → 8.3.5 and `source-map-js` → 1.2.2 for the same reason; the 2026-10-03 audit fixed `brace-expansion` via `eslint-plugin-jsx-a11y → minimatch`). Note that every advisory seen so far has been in **devDependencies** (`eslint → js-yaml`, `vite → postcss → nanoid`, `eslint-plugin-react-hooks → zod`) — they affect the build toolchain, not the shipped bundle, which has no runtime dependencies beyond React/Leaflet/Fuse/dagre/lucide. Re-check before any handoff or release; advisories accumulate on their own schedule, not ours.
- **Git worktrees**: Feature branches use `.worktrees/<branch-name>/` (already in `.gitignore`). Create with `git worktree add .worktrees/<name> -b <branch>`, remove with `git worktree remove .worktrees/<name>` after merging.
- **Dual-Use Research Guide**: A combined hub (CSS prefix `dual-`) in Compliance Tools, structured on the workshop arc *Know Your Research → Know Your Partners → Assess the Risk*. The Self-Assessment wizard is deliberately **conceptual** (intent/use, knowledge transfer, partner exposure) and hands off to STRA Lookup / NRO Lookup / Export Control rather than re-deriving STRA categories — it does not duplicate the STRA wizard. Results give a **signal read** (Likely / Possible / Low), never a "cleared" verdict or legal advice, and offer a Print summary (reuses the global print CSS + `.dual-print-only`/`.dual-no-print` toggles). Content is attributed to Public Safety Canada's Safeguarding Science program + Government of Canada guidance (not UBC). The stale workshop figures (74 subcategories / 356 entities) were dropped; cite "11 STRA categories" and link the live NRO list instead. The guide reuses the `straWizard` node shape (`dualUseWizard.js`) and the tabbed-tool button pattern from `CybersecurityGuide`.
- **Defence Institution Tracker** (`defence-tracker`, Compliance Tools, CSS prefix `dit-`): a free, open replacement for ASPI's now-paywalled China Defence Universities Tracker, for NSGRP/STRAC partner and co-author checks. Design: `docs/superpowers/specs/2026-10-24-defence-tracker-design.md`.
  - **Launch flag**: `ENABLE_DEFENCE_TRACKER` (false) is compiled in as `__TRACKER_ENABLED__` by Vite `define`; it is on in `npm run dev:tracker` (`--mode tracker`) or with `VITE_ENABLE_DEFENCE_TRACKER=true`. Off removes the tool, its chunk and data, every cross-link (NRO Lookup's Profile column, Home's partner scenario, FAQ `help-tracker`, the How This Site Works sentences) and the downloads. Don't switch it to `import.meta.env`: that left an unreachable 666 KB chunk in flag-off builds. `enabled.js` is browser-only; Node scripts must not import it.
  - **Data**: one JSON per institution; the `id` is the permanent permalink (never rename; `RESERVED_SLUGS` are `batch`, `methodology`). Canadian NRO listings join from `nroData.js` through `ids.nro` (plus `ids.nroAlso`), so the NRO list has one source. An institution known only from a list snapshot gets a virtual `listing-only` record at load time. Statuses: `seed` (MISP structured fields in `seedNotes`, never displayed or exported), `listing-only`, `verified`. Only verified records carry evidence; the schema (`lib/schema.js`) is enforced by `tests/tracker-data.test.mjs`, which also checks that every `topics` value is a STRA category or subcategory id from `straData.js` (MISP's topic names in `seedNotes`, such as "Cyber", are not).
  - **Rubric 1.1** (`lib/rubric.js`): a verified profile is rated by the whole checklist (`basis: 'profile'`): the first matching rule wins, only evidence that cites a source counts, and an override moves one level at most with a written reason. A record not researched yet is rated by the official lists alone (`basis: 'lists'`, Andrew's decision 2026-10-25): High under rule `listed` when any checked list names it, never overridden; on no list, "Not yet rated", never Low. Every surface labels a list-based rating "from official lists" (badge caption, banner, copied record, batch rows, CSV `rating_basis`, map popup). `misconduct` evidence covers officially documented cyber operations, espionage, export-control or sanctions violations, and human-rights abuses (such as a government finding that an institution supported surveillance or repression); it shows under NSGRP 2.2 and never sets a rating on its own. The methodology page renders `RUBRIC_RULES` and `SIGNALS`, so it can't drift from the code; `RUBRIC_VERSION` (and `meta.json`'s `rubricVersion`, which a test keeps equal) goes into copied records. Sanctions notes follow the NRO sanctions-banner wording rules (activity-specific, never a blanket ban).
  - **List evidence** (`lib/recordText.js`): `listEvidence()` turns each listing entry into one plain sentence with its official source (Entity List and Military End-User entries link the Federal Register notice through `https://www.govinfo.gov/link/fr/{vol}/{page}`; SDN programme codes are spelled out), shown under "Why this rating" before the listings table and in the copied record, whose listing lines now give status only. `displayEntries()` tidies the US screening list for display: it repeats some entries once per address, and a copy's citation can carry the wrong Federal Register volume (84 FR 37423 for 83 FR 37423), so of entries sharing a name and date only those whose citation fits the date are kept (volume = year − 1935), and fragments like "88 FR" are dropped. The export keeps the entries as published. Search rows show list chips (`listChips`: NRO sky tint, sanctions red, others neutral; never Blaze) and one-line notes (`listNotes`: STRAC for an NRO, sanctions by jurisdiction with "check the activity", US export controls, listed units). Only a row's name is a link; its `::after` stretches over the row.
  - **Matcher** (`lib/matcher.js`, places in `lib/places.js`): email domain → full Chinese name → name phrase (longest span wins) → acronym (always "check") → similar name (different compass words never count as a typo). **A name confirms only when the affiliation places it**: the name itself names a place in the record's country ("Harbin Institute of Technology"), or the affiliation names that country or the record's city. Aliases (which include historical names now used by other institutions) need the record's own city; list-only records, which have no city, need the country and a specific alias. Generic names need the city. An affiliation placed abroad (country words) or in Taiwan is not matched, and Taiwan or traditional-script lines never confirm a mainland record. Shared names, generic unit parts ("Research Institute"), acronyms under 3 letters or parent abbreviations (CAS, RAS, PLA…) and Chinese short forms (no 大学/学院/… ending) give at most a check. A school's Chinese name (…学院) straight after a university's (…大学) is that university's school and matches only a record whose `parent` is that university: 北京大学国际关系学院 is Peking University's school, not the University of International Relations (国际关系学院). Bracketed codes ("(CETC 14)") are dropped when indexing names; bracketed places ("(Wuhan)") are kept. Each `;`-separated affiliation is judged on its own place. **Units**: a subunit marked `"match": true` (a named hospital or institute whose name alone identifies the parent, e.g. AFMU's Xijing Hospital, 西京医院) matches its parent with `matchedBy: 'unit'` and the unit's name (shown as "Unit: Xijing Hospital"); it is judged like an alias (parent's city to confirm), and its Chinese name like any Chinese name (医院 now counts as a full-name ending). Unmarked subunits, including campuses and generic names (口腔医院, 理学院), are never matched; the research skill says when to mark one. `tests/tracker-matcher-real.test.mjs` pins, against the real data, Western institutions that must never confirm (US NDU, Institut Pasteur, Northeastern in Boston…) and other universities' 国际关系学院 schools that must never match UIR. Search returns exact hits, then word-start hits, and falls back to Fuse only when nothing matched.
  - **One record per institution**: the lists name one body several ways (an Entity List spelling, an SDN legal name, a Canadian translation). Duplicates are merged by setting the snapshot entries' `institution` to one id, which the sync keeps by key; a merged record shows its first mixed-case name. `tests/tracker-data.test.mjs` fails when a sync adds a new duplicate (it compares names without legal forms or bracketed codes): merge it, or add the pair to `DISTINCT` if they really are different bodies.
  - **Listed units**: a list-only record named after another record gets it as `parent`, and the parent's profile, copied record and batch rows name its listed units. The name may set the parent off ("Sharif University of Technology, Department of Engineering") or just start with it ("Aviation Industry Corporation of China 612 Institute"), but not carry it on ("Shahid Beheshti University of Medical Sciences" is another university); the most specific parent wins (an academy's institute is the academy's unit), and a name made only of descriptive words ("Federal Scientific and Production Centre", a Russian status title; `production` is in `GENERIC_WORDS`) takes no units. The parent's own listing status does not change: a list that names a group's academy names the academy, not the group.
  - **Which list entries are loaded** (`scripts/tracker/lib/listings.mjs`): from the US screening lists, Canada's sanctions list and Japan's End User List, entries in China, Russia and Iran whose main name reads as a research body (`isResearchBody`; a company word rules a name out unless it says "university", "research institute", "academy of" or "institute of", or ends in "Institute", "Academy" or "Design Department", the form a group's units take), plus any entry whose main name is a body the tracker already holds, such as CAEP's trading companies from the NRO list, so no record reads "Not listed" for a list that names it. Only main names count (the US list gives CETC 38's subsidiary companies the institute's own aliases), and only records held apart from that rule count (`recordsHeldApart`: files, NRO organizations, hand-kept lists, entries that are research bodies), so an entry can't keep itself. Feed rows the eCFR shows are broken are skipped: two by id (`CSL_FEED_ERRORS`) and a copy whose name is cut short (`cutShortRows`; the feed lists CASC's 13th Research Institute again as plain "CASC", under an id that changes).
  - **Unverified records show names, listings and their list-based rating only**: no type (it comes from MISP's categories; also left out of the export and the Type filter) and no "Also known as". Lists not loaded yet are disabled in the "Listed on" filter. Fixture tests (`tests/fixtures/tracker-affiliations.json`) cover the confusable names: Northwestern vs NWPU, Beijing Institute vs University of Technology, NJU vs NJUST vs NUAA, USTC vs UESTC, and a bare "HIT", which only ever gives "check" because Holon Institute of Technology shares it.
  - **Ethics and copy**: institutions, never individuals; no ASPI text, ratings or paid data (MISP's structured fields only, as a hidden checklist); every claim sourced, every source archived (`archive.url`, or an `archive.unavailable` reason). "Not listed" never means low risk, and nothing is legal advice.
  - **Licence**: the dataset is CC BY 4.0, © 2026 Andrew Austin (`src/data/defenceTracker/LICENSE`); the code stays MIT © Seaway Digital. The notice appears only on the methodology page and in the downloads: a deliberate, limited exception to HANDOFF §3d's "no owner named in the UI", because CC BY requires naming the licensor.
  - **Privacy**: search and batch text stay in memory (never in the hash, never stored), and downloads are built in the browser. The map view is lazy (Leaflet loads only when it is opened) and never fits or flies to the results, so tile requests reveal nothing about a search. With the flag on, How This Site Works names the tracker's map view in its tile row. No CSP change.
  - **Map colours**: very high `#ef4444`, high `#f97316`, medium `#a78bfa`, low `#94a3b8`; not yet rated is hollow (`#f1f5f9` fill, `#64748b` outline), like its dashed badge. A cluster takes its most common rating (ties go to the higher one). Counts are dark `#061727` on every fill; `tests/tracker-map.test.mjs` checks ≥4.5:1 and no Blaze or green hue. Rating badges never use Blaze or green either.
  - **Open data**: `trackerDataPlugin` in `vite.config.js` emits `data/defence-tracker.json` and `.csv` (with BOM) only when the flag is on, from the same loader and rubric as the page. CSV cells are formula-neutralised (`csvCell`).
  - **Before launch**: verified, rated profiles live on the `tracker/content` branch until the Lakehead review; master carries code, seeds and official-list data only, plus the ratings computed from that data alone. The launch gates are in `docs/tracker/research-playbook.md`: Lakehead review, a host or redirect that keeps the `#…` part of addresses, an accessibility pass and a security review.
  - **Upkeep**: `npm run tracker:sync` (writes snapshots; review the diff), `tracker:check` (the watch report; writes nothing), `tracker:archive` (local only; Wayback Machine; it checks each capture as served (`id_`) and by visible text only, since justice.gov and some university sites give the crawler a blank or script-only challenge page, so a flagged source needs an earlier good capture, archive.today, or an `archive.unavailable` reason), `tracker:next` (priority queue). Research rules are in the playbook and the `tracker-research` project skill; the helpers it uses (record patcher, new-record creator, rating reader, matcher tryout, and HTML, PDF and CASI-directory readers; the PDF reader needs PyMuPDF, a dev-time tool like the icon script's Pillow) are in `scripts/tracker/research/`, run with `node`/`python` directly.
  - **Hand-kept lists**: the US Section 1286 list (FY2025 edition, published 2026-07-23 on cto.mil) and Japan's End User List (METI revision of 2025-09-29) come as PDFs and are entered by hand into `listings/us-1286.json` and `listings/jp-meti-eul.json`; the playbook's hand-check step says how. The 1286 list goes in whole: its "and affiliates" (AMMS, CAEP) and CAS "select affiliates" rows become one entry per named body, the affiliates named "Parent, Affiliate" as the Entity List names them so they map to the same records. From the End User List the same entries as from the other lists are entered (see "Which list entries are loaded"), without its Japanese-script names. Snapshot fields: `sourceUrl` (the list's page), `file` (the edition's PDF), `alternateFiles` (other copies of that edition on the page), `published`. The monthly check reports a file on the page that is neither (`unknownListFiles`). Typos and other name forms on the lists ("Xi'an Jiatong University", 空军勤务学院 for the Air Force Logistics University) are mapped by hand through `institution`, which the sync keeps by key. A group's listed academies and institutes have records of their own: no list names CASC, CASIC or AVIC themselves (checked against the eCFR), so they read "Not listed" and stay unrated until researched. The names a list gives a list-only body are its own; MISP's seeds had given them to the groups as aliases, and the import's `resolveNameCollisions` (fed by `listOnlyNames`, comparing names as the match index reads them, without bracketed notes) keeps a re-import from handing them back.
  - **Known gaps**: there is no main Chinese Academy of Sciences record yet; no profile is researched yet on this branch, so every rating comes from the official lists (655 of 725 records are High; the 70 on no list, including big defence groups such as AECC, CASC, CASIC and AVIC, are not rated until researched); common English names that no official list uses (e.g. "Ioffe Physical-Technical Institute") don't match until a profile adds them. Units named without their group (BAMTRI for AVIC, CAST for CASC) aren't linked to it. Some Russian bodies are on a US list only under a legal name that reads as a company and matches their record only through an alias (Concern Avrora, Kurganpribor, Plasma, Rastr, the Kartsev institute, Vektor), so they read "Not listed" on that list.
- **Cybersecurity guide placement**: Added as its own "Operational Security" category (🔒) rather than under Reference, because the content is action-oriented (what to DO) rather than regulatory reference. CSS prefix is `csec-`. Source attribution goes to Lakehead University's cybersecurity researcher guidance, treated as representative of Canadian university best practices (same pattern as Risk Mitigation guide attribution).
- **Site footer**: `SiteFooter.jsx` renders as a **sibling of `.app-body` inside `.app`** — deliberately *outside* `<main>`, because a `<footer>` nested in `main` does not map to the `contentinfo` landmark. It carries the AODA accessibility statement and the feedback contact address that a public-facing Ontario site is expected to provide. It is a persistent slim bar (35px desktop / 61px mobile), so keep the text short; hidden in `@media print`.
- **Research Travel Security**: Operational Security category, CSS prefix `trav-`. Structured on the federal three-phase guidance (Before You Go / While Away / When You Return) using the shared `Tabs.jsx`. Checklist state persists to localStorage key `rs-toolkit-travel-v1` (separate from the risk checklist's `rs-toolkit-checklist-v1`). The **emergency contacts block sits outside the tabs** — a traveller in trouble should not have to find the right tab first. Print CSS deliberately *reveals* the collapsed `.trav-item-detail` text, since a printed pre-trip checklist is more useful with the rationale included.
- **How This Site Works** (`how-it-works`, Reference, CSS prefix `hiw-`): the trust/privacy explainer. Its content is a **set of claims about the code**, so it must be kept true: `dataFlows.rows` in `howItWorksData.js` lists **every** outbound request the site makes (host, basemap tiles, geocoders — the host's name comes from `WEB_HOST` in `src/siteConfig.js`, and the geocoder row is conditional on `ENABLE_PROXIMITY_SEARCH`) and must match the CSP `connect-src`/`img-src`/`font-src` — add a row whenever a third-party service is added. `STORAGE_KEYS` in the same file lists **every** localStorage key the site writes (`rs-toolkit-checklist-v1`, `rs-toolkit-travel-v1`) and drives the page's "clear everything saved on this device" button — add a new key there too. The wording deliberately says "as safe as a website can be" and has an explicit "What this does not mean" section; do not escalate it to "100% safe" or make unverifiable comparative claims. Linked from the home hero (`.home-hero-privacy`), the site footer (plain `<a href="#how-it-works">`, routed by the hashchange listener), and the FAQ entry `help-safe`.
- **Report a Concern**: Operational Security, CSS prefix `rept-`. A single-open scenario accordion ("what happened?") rather than a wizard — people arriving here already know their situation and need an answer, not a questionnaire. The page leads with **"start with your own institution"**: for almost every scenario the institutional research security office is the correct first call, and sending researchers straight to CSIS or the RCMP would be actively unhelpful. Federal contacts (Public Safety Research Security Centre, Cyber Centre, CSIS, RCMP NSIN) are listed per scenario and again in a full directory. The `protections` block exists because fear of consequences is the main reason concerns go unreported. The institutional contact is **named**, not generic: `INSTITUTION_RS_CONTACT` in `src/siteConfig.js` (currently Andrew Austin, Lakehead Research Security and Data Management Specialist, `security.research@lakeheadu.ca`) feeds the `institution-rso` card here and a card in the Travel Security emergency block. Change it there, never inline, and keep the email a monitored office inbox.
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
| STRAC Policy | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/policy-sensitive-technology-research-and-affiliations-concern` |
| NSGRP | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships` |
| NSGRP Risk Assessment Form | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form` |
| NSGRP implementation — programs requiring the RAF | `https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance` |
| STRAC FAQ | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/frequently-asked-questions-faq-policy-sensitive-technology-research-and-affiliations-concern` |
| Ontario RS Guidelines | `https://forms.mgcs.gov.on.ca/en/dataset/on00708` |
| Tri-Agency RS Guidance | `https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-guidance-on-research` |
| NRO List | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations` |
| STRA List | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/sensitive-technology-research-areas` |
| Safeguarding Your Research | `https://science.gc.ca/site/science/en/safeguarding-your-research` |
| Research travel guidance | `https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/mitigating-your-research-security-risks/how-can-you-protect-your-research-during-travel` |
| Safeguarding Science workshops | `https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/cntr-prlfrtn/sfgrdng-scnc/sfgrdng-scnc-wrkshp-en.aspx` |
| Report a cyber incident (Cyber Centre) | `https://www.cyber.gc.ca/en/incident-management` |
| Foreign interference guidance | `https://www.publicsafety.gc.ca/cnt/ntnl-scrt/frgn-ntrfrnc/prtct-gnst-frgn-ntrfrnc-en.aspx` |
| Global Affairs Sanctions | `https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx` |
| GAC sanctions guidance for academic institutions | `https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng` |

---

## Deployment

- **Branch**: `master` — every push triggers the GitHub Actions workflow
- **Action versions**: **pinned to full commit SHAs** with a `# vX.Y.Z` comment (checkout v7.0.1, setup-node v7.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1); `.github/dependabot.yml` bumps SHA + comment together. Dependabot groups `react`/`react-dom`/their `@types` into one PR (they must never ship at different versions) and ignores ESLint majors: `eslint-plugin-jsx-a11y` 6.10.2 peers on `eslint` ≤9, so ESLint 10 breaks `npm ci` — lift that ignore once jsx-a11y supports 10. Checkout uses `persist-credentials: false`. Permissions are `contents: read` at workflow level; only the `deploy` job gets `pages: write` + `id-token: write` (the `verify` job runs PR code). All on majors that run on **Node 24** (v5+). Do not downgrade any of these: the `@v4`/`@v3` majors declare `using: node20` and GitHub annotates every run with a deprecation warning. Two non-obvious traps: (1) the `node-version:` input does **not** affect this — it sets the Node that runs `npm`, while the warning is about each action's own runtime, which is fixed by the action's version; (2) `upload-pages-artifact@v4` does **not** clear it either, because it still delegates to `upload-artifact@v4.6.2` (node20) — only `@v5` pulls `upload-artifact@v7` (node24).
- **Workflow**: `.github/workflows/deploy.yml` — three jobs: `verify` (npm ci, `npm audit --audit-level=high`, lint, `npm test` — the flowchart graph-integrity and tracker suites — build; runs on every PR and every push to master) → `build` (master only: skipped on PRs and on `workflow_dispatch` from any other branch; builds with the tile-key secrets and writes the CNAME) → `deploy` (GitHub Pages; same master-only `if:`, plus a fixed `pages` concurrency group so production deploys never overlap — the workflow-level group stays per-ref so PR runs don't queue). The in-file ref guard only protects the committed workflow: a branch or same-repo PR can edit its own copy, so the `github-pages` environment's "Deployment branches" rule must be set to master — that host setting is the binding control (2026-10-22 audit). **Branch protection on master requires a status check literally named `verify`, with `enforce_admins` on** — the job's `name:` must stay `verify` or no PR can merge, admins included. The requirement was originally created for draft PR #21's separate CI workflow; this job satisfies it on the master line. Audit level is `high` deliberately: every advisory to date has been a dev-only toolchain package and a low-severity one must not block a content fix.
- **Tracker watch**: `.github/workflows/tracker-watch.yml` runs monthly (`0 13 1 * *`) and on demand. Permissions are `contents: read` and `issues: write`, nothing else; checkout uses `persist-credentials: false`; `npm ci --ignore-scripts` because the job holds a token that can write issues; same SHA-pinned actions as `deploy.yml`. It runs `scripts/tracker/watch.mjs` (the list sync in check mode plus the source check) and opens or updates one "Tracker watch — YYYY-MM" issue. External names and error text go in code spans with `@` removed (`sanitizeForIssue`), so the issue can't mention anyone. **CI never writes to the repo**: the maintainer runs the sync locally and commits. The 1286 list's page (cto.mil) answers scripts, so the issue flags any linked file that is not the entered edition; METI's revision log answers 403, so every month's issue carries a hand-check item for Japan's list. The `gh` issue step is unverified until the first `workflow_dispatch` after merge.
- **Build command**: `npm run build` → `vite build`
- **Preview locally**: `npm run dev` (Vite dev server); `npm run dev:tracker` with the Defence Institution Tracker switched on

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
