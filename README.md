# Research Security Toolkit

A free, open-source web toolkit helping Canadian researchers and research administrators navigate federal research security policy. No login, no backend, no tracking — 100% client-side.

**Live site → [rs.rdmtoolkit.ca](https://rs.rdmtoolkit.ca)**

> **Hosting this yourself?** Start with **[HANDOFF.md](HANDOFF.md)** — build, deploy, configure, and maintain.

---

## What's Inside

15 tools across four categories.

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
| Dual-Use Research Guide | Self-assessment wizard, dual-use research areas, collaborator vetting, and due-diligence actions |

### 📖 Reference
| Tool | Description |
|---|---|
| Export Control Quick Reference | Searchable reference for EIPA, Controlled Goods List, Defence Production Act, sanctions, and the UN Act |
| Glossary / Jargon Decoder | Official definitions for 12 key research security terms from Canadian and Ontario Government sources |
| Research Security FAQ | 24 answers to common questions about STRAC, NRO, NSGRP, export controls, and compliance |

### 🔒 Operational Security
| Tool | Description |
|---|---|
| Cybersecurity Best Practices | Day-to-day security hygiene — 2FA, device encryption, password managers, AI tool risks, backup rules, sensitive data storage |
| Research Travel Security | Three-phase travel checklist (before / during / after) with emergency contacts |
| Report a Concern | Incident scenarios mapped to what to do now and who to contact, institutional first |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | Hash-based, no router library |
| Search | Fuse.js (fuzzy, threshold 0.35) |
| Map | Leaflet + react-leaflet + leaflet.markercluster |
| Icons | lucide-react |
| Flowcharts | dagre layout engine |
| Styling | Single CSS file with CSS custom properties |
| Output | Static files — no server-side runtime of any kind |

---

## Local Development

```bash
npm install     # install dependencies
npm run dev     # dev server at localhost:5173
npm run lint    # ESLint incl. jsx-a11y accessibility gate — must stay at 0 errors
npm run build   # production build to dist/
npm run preview # serve the production build locally
```

---

## Deployment

The build output is a folder of static files. There is no backend, no database, no server-side rendering, and no environment secrets.

**Any static host works** — Apache, nginx, IIS, S3, GitHub Pages, a university web server.

```bash
npm ci && npm run build   # → dist/
```

Then serve `dist/` at your document root.

**No URL rewrite rules are needed.** Routing is hash-based (`/#nro-lookup`), so the browser only ever requests `/`. This is the usual SPA deployment headache and this site doesn't have it.

**Hosting under a subdirectory?** Set `BASE_PATH` at build time:

```bash
BASE_PATH=/research-security/ npm run build
```

Every asset URL is rewritten accordingly. Include both leading and trailing slashes.

Full details — configuration, security headers, external services, maintenance — are in **[HANDOFF.md](HANDOFF.md)**.

---

## Configuration

Three values are deployment-specific and live in **[`src/siteConfig.js`](src/siteConfig.js)**:

| Value | What it controls |
|---|---|
| `ACCESSIBILITY_CONTACT` | Where AODA barrier reports and alternate-format requests go. **Must be an address your organization monitors.** |
| `SITE_URL` | Canonical public URL, used for the canonical + Open Graph tags |
| `SHOW_SISTER_SITE_CARD` | Whether the RDM Toolkit card appears in the sidebar |

Changing the hosting domain also means updating the canonical and `og:` URLs in `index.html` — static meta tags can't read JS config.

---

## Accessibility

The site targets **WCAG 2.0 AA**, the level AODA references for web content. `npm run lint` runs `eslint-plugin-jsx-a11y` as a regression gate and must stay at **0 errors**.

See **[ACCESSIBILITY.md](ACCESSIBILITY.md)** for the full remediation record, the equivalent-alternative decisions (the NRO data table for the map; flowchart Guided Mode for the SVG), and the manual keyboard/screen-reader checklist to re-run after significant UI changes.

---

## Adding a New Tool

1. Create `src/data/<toolData>.js` — export a named const with `lastUpdated`, `sourceUrl`, and content
2. Create `src/tools/<category>/<ToolName>.jsx`
3. Register in `src/data/toolRegistry.js` under the appropriate `CATEGORIES` entry
4. Add a lazy import to `TOOL_COMPONENTS` in `src/App.jsx`
5. Add CSS to `src/styles/global.css` (use a consistent prefix for the new tool)
6. Update `CLAUDE.md` with the new tool, data file, and any new conventions

See [CLAUDE.md](CLAUDE.md) for full architecture details and conventions.

---

## Data Sources

All policy content is drawn from official Canadian Government sources:

- [Safeguarding Your Research](https://science.gc.ca/site/science/en/safeguarding-your-research) — Government of Canada
- [STRAC Policy](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/policy-sensitive-technology-research-and-affiliations-concern) — Government of Canada
- [NSGRP](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships) — Government of Canada
- [NRO List](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/named-research-organizations) — Government of Canada
- [STRA List](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-areas) — Government of Canada
- [Ontario RS Guidelines](https://forms.mgcs.gov.on.ca/en/dataset/on00708) — Government of Ontario
- [Tri-Agency RS Guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-guidance-research-security) — NSERC/CIHR/SSHRC
- [Safeguarding Science](https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/cntr-prlfrtn/sfgrdng-scnc/index-en.aspx) — Public Safety Canada
- [Cybersecurity guidance](https://www.lakeheadu.ca/research-and-innovation/research-services/resources/safeguarding-research-resources/cybersecurity) — Lakehead University

Policy content carries a `lastUpdated` date shown on each tool page. See HANDOFF.md for how to re-verify against the federal sources.

---

## License

[MIT](LICENSE).

---

## Disclaimer

This toolkit is provided for informational purposes only. It is not legal advice. Always consult your institution's Research Security or Research Ethics office and refer to official Government of Canada sources for authoritative policy guidance.
