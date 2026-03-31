# Research Security Toolkit — Design Spec

## Context

Canadian researchers and institutional research security staff need a centralized, accessible toolkit to navigate the increasingly complex landscape of federal research security policies. Currently, understanding whether research falls under a Sensitive Technology Research Area (STRA), checking if a collaborator's institution is a Named Research Organization (NRO), or following the correct compliance process for STRAC/NSGRP/Ontario guidelines requires reading multiple dense policy PDFs. This toolkit consolidates these into interactive, user-friendly tools deployed as a free static site.

## Overview

A React + Vite single-page application deployed to GitHub Pages. Mirrors the architecture and visual style of the existing [RDM Toolkit](https://seawaydigital.github.io/RDM-Toolkit/). All data is embedded client-side (no backend). Serves both university researchers/PIs applying for grants and institutional research office staff performing compliance checks.

## Tech Stack

- **Framework**: React 18+ with Vite
- **Routing**: Hash-based (`/#/tool-slug`)
- **Styling**: CSS matching RDM Toolkit's design system
- **Map**: Leaflet.js + OpenStreetMap tiles (free, no API key)
- **Flowcharts**: Dagre layout engine + custom SVG/React components (decision diamonds, action boxes, connectors)
- **Search**: Client-side fuzzy search (Fuse.js)
- **Deployment**: GitHub Pages via GitHub Actions
- **Architecture**: Forked from RDM Toolkit's patterns — toolRegistry, lazy-loaded tool components, sidebar/topbar navigation

## Tool Categories & Tools

### Category 1: Policy Guides
| Tool | Slug | Description |
|------|------|-------------|
| STRAC Policy Flowchart | `strac-flowchart` | Interactive vertical flowchart explaining the STRAC compliance process |
| NSGRP Flowchart | `nsgrp-flowchart` | Interactive vertical flowchart for National Security Guidelines for Research Partnerships |
| Ontario RS Guidelines Flowchart | `ontario-flowchart` | Interactive vertical flowchart for Ontario's research security requirements |

### Category 2: Compliance Tools
| Tool | Slug | Description |
|------|------|-------------|
| STRA Lookup | `stra-lookup` | Searchable/browsable list of sensitive technology research areas + guided assessment wizard |
| NRO Lookup & Map | `nro-lookup` | Searchable NRO list with city-level interactive map and clustering |
| Risk Assessment Checklist | `risk-checklist` | Interactive grant application risk assessment walkthrough |

### Category 3: Reference
| Tool | Slug | Description |
|------|------|-------------|
| Export Control Quick Reference | `export-control` | Searchable reference for EIPA, Controlled Goods List, sanctions, and related regulations |

## Detailed Tool Designs

### STRA Lookup Tool

**Layout**: Unified single-page design.

**Components**:
- **Search bar** at top — fuzzy keyword search across STRA category names, descriptions, and subcategories
- **"Not sure? Take the guided assessment"** CTA button — opens a slideout/modal wizard
- **Expandable tree** below search — all STRA categories as collapsible sections, each with subcategories and plain-language descriptions
- **Guided Assessment Wizard** (slideout) — branching questions that narrow down whether research qualifies as STRA. Ends with a clear result: "Your research likely falls under [category]" or "Your research does not appear to fall under a STRA"

**Wizard questions** (stored in `src/data/straWizard.js`):
1. "Does your research involve developing or advancing any form of technology?" → No → "Not likely STRA"
2. "Does your research have potential military, intelligence, or dual-use applications?" → Yes → higher risk path
3. "Which broad area best describes your research?" → Multiple choice: Digital/Cyber, Materials/Manufacturing, Life Sciences/Biotech, Energy, Aerospace/Space, None of these
4. Based on selection, drill-down questions specific to that area (e.g., for Digital: "Does it involve AI/ML, quantum computing, advanced computing, or cybersecurity?")
5. Final question: "Could your research outputs be used to develop capabilities listed on Canada's Export Control List?" → contextual result
6. Result screen: matched STRA categories (if any) with links to the full descriptions in the browse tree, plus a disclaimer that this is guidance only and not a legal determination

**Data structure** (`src/data/straData.js`):
```js
{
  id: "advanced-digital",
  name: "Advanced Digital Infrastructure",
  subcategories: [
    { id: "ai-ml", name: "AI and Machine Learning", description: "...", keywords: [...] },
    { id: "quantum", name: "Quantum Science and Technology", description: "...", keywords: [...] }
  ]
}
```

### NRO Lookup & Map

**Layout**: Map-first vertical stack. Large map on top, search + filterable table below.

**Components**:
- **Interactive map** (Leaflet + OpenStreetMap) — city-level pins for each NRO, clustered when zoomed out. Country filter buttons (Russia, China, Iran) toggle pin visibility. Clicking a cluster zooms in. Clicking a pin shows a popup with org name, aliases, and city.
- **Search bar** — fuzzy search across org names, aliases, and cities
- **Country filter chips** — "All", "Russia", "China", "Iran" with counts
- **Filterable table** — sortable columns: Organization Name, Aliases, City, Country. Clicking a row flies the map to that location. Clicking a map pin highlights the row in the table.

**Data structure** (`src/data/nroData.js`):
```js
{
  id: "hit",
  name: "Harbin Institute of Technology",
  aliases: ["HIT"],
  country: "China",
  city: "Harbin",
  lat: 45.7500,
  lng: 126.6500,
  parentOrg: null,
  notes: "Also known as 哈尔滨工业大学"
}
```

**Map considerations**:
- ~200+ organizations need geocoding (lat/lng embedded in data file, not runtime geocoded)
- Marker clustering via Leaflet.markercluster plugin
- Mobile: map takes full width, table scrolls below
- Color-coded pins by country (e.g., red=Russia, blue=China, green=Iran)

### Policy Flowcharts (STRAC, NSGRP, Ontario)

**Layout**: Vertical flowchart with mode toggle.

**Shared flowchart component** used by all three, fed different data:

**Full View Mode** (default):
- Top-to-bottom flowchart rendered as SVG/React components
- Decision nodes: diamond shapes with yes/no branches
- Action nodes: rounded rectangles
- Terminal nodes: circles (start/end)
- Connectors: animated SVG lines with arrows
- Click any node: side panel or tooltip shows detailed explanation with policy references
- Zoom/pan controls for complex flowcharts

**Guided Mode** (toggle):
- Progress bar at top showing current position in the flow
- One node displayed at a time as a card
- Decision nodes show Yes/No buttons — clicking follows the appropriate branch
- Action nodes show "Continue" button
- Each step includes: plain-language explanation, relevant policy section reference, "Why this matters" context
- Back button to revisit previous steps
- Result summary at the end

**Layout engine**: Use Dagre (via `dagre` npm package) for automatic top-to-bottom layout computation. Nodes define connections; Dagre computes x/y positions. No manual coordinates needed. This handles branching and reconvergence automatically.

**Flowchart data structure** (`src/data/flowcharts/`):
```js
{
  id: "strac",
  title: "STRAC Policy Decision Flow",
  lastUpdated: "2025-01-24",
  policySource: "Policy on Sensitive Technology Research and Affiliations of Concern",
  nodes: [
    { id: "start", type: "start", label: "New Grant Application",
      description: "You are applying for funding from NSERC, SSHRC, CIHR, or CFI.",
      next: "check-stra" },
    { id: "check-stra", type: "decision", label: "Does research advance a STRA?",
      description: "Review the Sensitive Technology Research Areas list to determine if your research advances any listed area. Use the STRA Lookup tool for help.",
      policyRef: "STRAC Policy, Section 3",
      whyItMatters: "If your research advances a STRA, additional compliance steps apply to all researchers on the grant.",
      yes: "check-nro", no: "no-action" },
    { id: "no-action", type: "end", label: "No further action required",
      description: "Your research does not advance a STRA. Standard grant application process applies." },
    { id: "check-nro", type: "action", label: "Check all researcher affiliations against NRO list",
      description: "Every researcher (applicants, co-applicants, collaborators) must be checked against the Named Research Organizations list.",
      policyRef: "STRAC Policy, Section 4",
      crossLink: { tool: "nro-lookup", label: "Open NRO Lookup" },
      next: "nro-result" },
    { id: "nro-result", type: "decision", label: "Any researcher affiliated with an NRO?",
      description: "An affiliation means employed by, appointed at, or conducting research at a listed organization.",
      yes: "resolve-nro", no: "attest" },
    { id: "resolve-nro", type: "action", label: "Researcher must sever NRO connection OR leave the project",
      description: "The affiliated researcher must either terminate their connection with the NRO or be removed from the grant application.",
      policyRef: "STRAC Policy, Section 4.2",
      next: "attest" },
    { id: "attest", type: "action", label: "Complete attestation form",
      description: "All researchers must attest that they comply with the policy. Ongoing compliance is required for the duration of the grant.",
      policyRef: "STRAC Policy, Section 5",
      next: "end" },
    { id: "end", type: "end", label: "Grant application proceeds",
      description: "All compliance steps are complete. Submit your application." }
  ]
}
```

**Cross-tool deep linking**: Flowchart nodes with `crossLink` render a button that navigates to the linked tool (e.g., "Open NRO Lookup" navigates to `/#/nro-lookup`).

**Guided Mode navigation**: Follows graph edges (`next`, `yes`, `no` fields) directly. Nodes not on the user's chosen path are simply skipped. The back button maintains a visited-node stack.

**NSGRP Flowchart** (`flowcharts/nsgrpFlow.js`) — ~10 nodes:
Key decision points: Is research partnership federally funded? → Does research involve sensitive areas (Annex A)? → Does partner pose risk factors (Annex B)? → Develop risk mitigation plan → Submit Risk Assessment Form → Proceed with partnership. CrossLinks to STRA Lookup and Risk Assessment Checklist.

**Ontario RS Guidelines Flowchart** (`flowcharts/ontarioFlow.js`) — ~8 nodes:
Key decision points: Is research funded by Ontario Research Fund? → Does it involve dual-use or sensitive technology? → Are there international collaborations with higher-risk entities? → Complete Ontario-specific risk mitigation checklist → Submit to institutional research security office → Proceed. CrossLinks to NRO Lookup and Export Control Reference.

### Risk Assessment Checklist

**Layout**: Vertical checklist with sections.

**Sections and items** (stored in `src/data/riskChecklist.js`):

**1. Research Area Assessment** (from NSGRP Annex A):
- Does the research involve nuclear, chemical, biological, or radiological applications?
- Does the research relate to conventional weapons or items on the Export Control List?
- Does the research involve missile/rocket technology or space technology?
- Does the research involve critical minerals extraction, processing, or supply chains?
- Does the research involve critical infrastructure sectors (energy, transport, water, comms, finance)?
- Does the research involve large datasets with behavioral/interaction patterns?
- Does the research involve sensitive personal data (health, genetic, biometric, financial, geolocation)?

**2. Partner/Collaborator Assessment** (from NSGRP Annex B):
- Is the partner organization state-owned or state-influenced?
- Does the partner lack institutional autonomy or independence?
- Is the partner subject to government compulsion laws or practices?
- Does the partner have ties to a foreign military or government security apparatus?
- Are there potential conflicts of interest with the partnership?
- Has the partner been involved in IP theft, espionage, or sanctions violations?

**3. Export Control Check**:
- Are any research outputs controlled under the Export and Import Permits Act (EIPA)?
- Are any materials or technologies on the Controlled Goods List?
- Are any partners or collaborators located in Area Control List countries?
- Do any Special Economic Measures Act sanctions apply?
- Do any UN Security Council resolution restrictions apply?

**4. Mitigation Measures** (if risks identified):
- IP protection plan in place (agreements, data handling, publication review)?
- Data security measures adequate for sensitivity level?
- Personnel screening completed for team members with access?
- Reporting obligations understood and documented?
- Institutional research security office consulted?

**Each checklist item**:
- Three-state input: "No risk" (green check), "Risk identified" (amber flag), "N/A" (grey)
- Brief description
- Expandable "Learn More" with policy references and guidance

**Flagging logic**: Items marked "Risk identified" trigger the amber highlight. The result summary counts flagged items per section and overall.

**Features**:
- Progress tracker at top (% completion per section, overall)
- Result summary at bottom via `window.print()` with print-specific CSS — single-column layout, all sections expanded, flagged items in bold, timestamps, and a disclaimer that this is guidance only
- All client-side, no data saved to any server

**Data structure** (`src/data/riskChecklist.js`):
```js
{
  id: "research-area",
  title: "Research Area Assessment",
  policySource: "NSGRP, Annex A",
  items: [
    {
      id: "nuclear-cbrn",
      label: "Does the research involve nuclear, chemical, biological, or radiological applications?",
      learnMore: "This includes research with potential dual-use applications in CBRN domains...",
      policyRef: "NSGRP, Annex A, Item 1",
      defaultState: null  // null = unanswered, "no-risk" | "risk" | "na"
    },
    ...
  ]
}
```

### Export Control Quick Reference

**Layout**: Search bar + browsable sections.

**Sections**:
- **EIPA** (Export and Import Permits Act) — key provisions, how they apply to research
- **Defence Production Act / Controlled Goods List** — what's controlled, registration requirements
- **Area Control List** — countries subject to export restrictions
- **Special Economic Measures Act** — sanctions and their research implications
- **United Nations Act** — UN Security Council resolution obligations

**Each entry**: Plain-language description, applicability to research contexts, link to official Government of Canada source.

**Tags/badges**: "Dual-use", "Military", "Sanctions" for quick visual scanning.

**Search**: Keyword filtering across all sections.

**Data structure** (`src/data/exportControlData.js`):
```js
{
  id: "eipa",
  name: "Export and Import Permits Act (EIPA)",
  entries: [
    {
      id: "eipa-overview",
      title: "Overview",
      description: "Plain-language summary of how EIPA applies to research...",
      tags: ["dual-use"],
      officialUrl: "https://laws-lois.justice.gc.ca/eng/acts/e-19/",
      keywords: ["export", "permit", "controlled goods"]
    },
    ...
  ]
}
```

## Navigation & Layout

- **Topbar**: "Research Security Toolkit" title, global search (Ctrl+K)
- **Sidebar**: Collapsible on mobile (<768px). Shows categories with nested tool links. Icons per category.
- **Home page**: Welcome message explaining the toolkit's purpose. Card grid showing all tools grouped by category. Each card: icon, tool name, one-line description. Click navigates to tool.
- **Tool pages**: Lazy-loaded React components. Breadcrumb navigation. Consistent header pattern.

## Data Files

All data embedded as JS modules in `src/data/`:

| File | Content |
|------|---------|
| `toolRegistry.js` | Tool/category metadata for navigation and home page |
| `nroData.js` | Full NRO list with names, aliases, coordinates, country |
| `straData.js` | STRA categories, subcategories, descriptions, keywords |
| `flowcharts/stracFlow.js` | STRAC policy flowchart nodes and connections |
| `flowcharts/nsgrpFlow.js` | NSGRP flowchart nodes and connections |
| `flowcharts/ontarioFlow.js` | Ontario guidelines flowchart nodes and connections |
| `straWizard.js` | Guided assessment wizard questions and branching logic |
| `exportControlData.js` | Export control reference entries |
| `riskChecklist.js` | Risk assessment checklist items, sections, and learn-more content |

## Global Search (Ctrl+K)

A command-palette style modal (like RDM Toolkit's). Searches across:
- Tool names and descriptions (from toolRegistry)
- NRO organization names and aliases
- STRA category and subcategory names
- Export control entry titles

Results grouped by source ("Tools", "Organizations", "Technology Areas", "Export Controls"). Clicking a result navigates to the relevant tool page with the search term pre-filled in that tool's local search bar where applicable.

## Data Versioning

Each data file includes a `lastUpdated` date field and `sourceUrl` pointing to the official Government of Canada source. The home page and each tool page display "Data current as of [date]" in the footer. When government lists are updated, only the relevant data file needs to change.

Country filter chips on the NRO map are dynamically derived from the data (not hardcoded), so adding a new country requires only a data file update.

## Accessibility

Target WCAG 2.1 AA:
- All interactive elements keyboard-navigable (flowchart nodes, map controls, checklist items)
- NRO map pins: supplementary table provides equivalent non-visual access to all data
- Color-coded elements always paired with text labels or icons (not color alone)
- Flowchart Guided Mode is inherently screen-reader friendly (one card at a time with text)
- Aria labels on all interactive controls
- Focus management on modal/slideout open/close (STRA wizard)

## Error & Empty States

- **Zero search results**: "No matches found. Try different keywords or browse all categories."
- **Map tile load failure**: Grey placeholder with "Map unavailable — try refreshing" message; table still fully functional below
- **Invalid route**: Redirect to home page with toast notification
- **Flowchart node with no description**: Gracefully skip tooltip (shouldn't happen but defensive)

## Key Dependencies

- `react`, `react-dom` — UI framework
- `leaflet`, `react-leaflet` — Interactive map
- `leaflet.markercluster` — Map pin clustering
- `fuse.js` — Client-side fuzzy search
- `dagre` — Automatic graph layout for flowcharts
- `vite` — Build tool
- `gh-pages` or GitHub Actions — Deployment

## Verification Plan

1. **Build**: `npm run build` produces working static site
2. **All tools load**: Navigate to each tool via sidebar and verify rendering
3. **STRA search**: Type keywords, verify fuzzy matching and tree expansion
4. **STRA wizard**: Complete guided assessment, verify result output
5. **NRO search**: Search by name, alias, city — verify results
6. **NRO map**: Verify pins render at correct locations, clustering works, popups show org details, country filters work, table-map sync works
7. **Flowcharts**: Verify all three render correctly in Full View. Toggle to Guided Mode and step through each. Verify node click shows explanation.
8. **Risk checklist**: Complete all items, verify progress tracking, test download/print summary
9. **Export control**: Search keywords, verify filtering across sections
10. **Mobile**: Test responsive layout at 375px width — sidebar collapses, map stacks, tables scroll
11. **Deploy**: Push to GitHub Pages, verify live site loads and all tools function
