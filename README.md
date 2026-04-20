# Research Security Toolkit

A free, open-source web toolkit helping Canadian researchers and research administrators navigate federal research security policies. No login, no backend — 100% client-side, deployed to GitHub Pages.

**Live site → [seawaydigital.github.io/RSToolkit](https://seawaydigital.github.io/RSToolkit/)**

---

## What's Inside

### 📜 Policy Guides
| Tool | Description |
|---|---|
| Tri-Agency Research Security Guide | Plain-language explainer of the federal granting agencies' research security framework, 10 guiding principles, NSGRP and STRAC policies |
| STRAC Policy Flowchart | Interactive decision flow for the Policy on Sensitive Technology Research and Affiliations of Concern |
| NSGRP Flowchart | National Security Guidelines for Research Partnerships — decision flow with cross-links to the Risk Assessment Form |
| Ontario RS Guidelines | Ontario Research Security Guidelines decision flow |

### ✅ Compliance Tools
| Tool | Description |
|---|---|
| STRA Lookup | Search and browse Sensitive Technology Research Areas; includes a guided assessment wizard |
| NRO Lookup & Map | Search all 126 Named Research Organizations with an interactive map, proximity search, and sanctioned-country flags |
| Risk Assessment Checklist | Interactive NSGRP-sourced grant risk checklist with 3-state toggles and print support |
| Risk Mitigation Guide | 22 practical measures across 5 categories — personnel, partners, data, legal, monitoring |

### 📖 Reference
| Tool | Description |
|---|---|
| Export Control Quick Reference | Searchable reference for EIPA, Controlled Goods List, Defence Production Act, sanctions, and the UN Act |
| Glossary / Jargon Decoder | Official definitions for 12 key research security terms from Canadian and Ontario Government sources |
| Research Security FAQ | 24 answers to common questions about STRAC, NRO, NSGRP, export controls, and compliance |

### 🔒 Operational Security
| Tool | Description |
|---|---|
| Cybersecurity Best Practices | Day-to-day security hygiene for researchers — 2FA, device encryption, password managers, AI tool risks, backup rules, and sensitive data storage guidance |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Routing | Hash-based, no router library |
| Search | Fuse.js (fuzzy, threshold 0.35) |
| Map | Leaflet + react-leaflet + leaflet.markercluster |
| Icons | lucide-react |
| Flowcharts | dagre layout engine |
| Styling | Single CSS file with CSS custom properties |
| Deployment | GitHub Actions → GitHub Pages |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Production build
npm run build
```

---

## Adding a New Tool

1. Create `src/data/<toolData>.js` — export a named const with `lastUpdated`, `sourceUrl`, and content
2. Create `src/tools/<category>/<ToolName>.jsx` — accepts `{ onNavigate }` prop
3. Register in `src/data/toolRegistry.js` under the appropriate `CATEGORIES` entry
4. Add lazy import to `TOOL_COMPONENTS` in `src/App.jsx`
5. Add CSS classes to `src/styles/global.css` (use a consistent `xx-` prefix for the new tool)
6. Update `CLAUDE.md` with the new tool, data file, and any new conventions

See `CLAUDE.md` for full architecture details and conventions.

---

## Data Sources

All policy content is drawn from official Canadian Government sources:

- [Safeguarding Your Research](https://science.gc.ca/site/science/en/safeguarding-your-research) — Government of Canada
- [STRAC Policy](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-and-affiliations-concern) — Government of Canada
- [NSGRP](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships) — Government of Canada
- [NRO List](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/named-research-organizations) — Government of Canada
- [STRA List](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-areas) — Government of Canada
- [Ontario RS Guidelines](https://forms.mgcs.gov.on.ca/en/dataset/on00708) — Government of Ontario
- [Tri-Agency RS Guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-guidance-research-security) — NSERC/CIHR/SSHRC
- [Cybersecurity guidance](https://www.lakeheadu.ca/research-and-innovation/research-services/resources/safeguarding-research-resources/cybersecurity) — Lakehead University

---

## Disclaimer

This toolkit is provided for informational purposes only. It is not legal advice. Always consult your institution's Research Security or Research Ethics office and refer to official Government of Canada sources for authoritative policy guidance.
