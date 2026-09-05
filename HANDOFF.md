# Handoff Guide

Everything needed to build, host, configure, and maintain the Research Security Toolkit.

**Last updated: 2026-09-05**

---

## 1. What this is

A static website. React + Vite compile to a folder of HTML, CSS, JS, and images.

- **No backend.** No server-side code, no database, no API, no environment secrets.
- **No accounts, no login, no analytics, no tracking.** The only data stored about a user is their own checklist progress, in their own browser's `localStorage`.
- **All content is compiled in at build time.** Updating policy content means editing a file in `src/data/` and redeploying.

---

## 2. Build and deploy

```bash
npm ci          # install exactly the locked dependency versions
npm run build   # → dist/
```

Serve the contents of `dist/` from any static host: Apache, nginx, IIS, S3, GitHub Pages, or a university web server. Node is needed to *build*, not to *serve*.

**No URL rewrite rules are required.** Routing is hash-based (`/#nro-lookup`), so the browser only ever requests `/`. The usual SPA "every route must fall back to index.html" configuration does not apply here.

### Hosting under a subdirectory

To serve from e.g. `https://lakeheadu.ca/research-security/`:

```bash
BASE_PATH=/research-security/ npm run build
```

Both slashes matter. This rewrites every asset URL in the output; it has been verified working.

### Build requirements

Node 20 or newer. The current GitHub Actions workflow (`.github/workflows/deploy.yml`) pins Node 20 and is a working reference even if you deploy differently.

---

## 3. Configure before going live

### 3a. `src/siteConfig.js` — three values

| Value | Change it to | Why it matters |
|---|---|---|
| `ACCESSIBILITY_CONTACT` | **An address your organization monitors** | AODA's Information and Communications standard expects a public Ontario site to offer a feedback process and accessible formats on request. This address is the *only* route the footer gives a user who hits a barrier. It currently points at the original author. |
| `SITE_URL` | Your public URL, no trailing slash | Used for canonical and Open Graph tags |
| `SHOW_SISTER_SITE_CARD` | `false` if you don't want an off-site link | Controls the "RDM Toolkit" card at the bottom of the sidebar, which links to rdmtoolkit.ca — a separate project by the original author |

### 3b. `index.html` — canonical and Open Graph URLs

Static meta tags can't read JS config, so if you change `SITE_URL` you must also update the matching `<link rel="canonical">`, `og:url`, `og:image`, and `twitter:image` values in `index.html`. There are four.

### 3c. Ownership and branding

The site uses a Cobalt + Blaze palette aligned with Lakehead University branding, but **it makes no ownership claim anywhere in the UI** — no logo, no "published by", no institutional footer. That was deliberate: it is your decision, not ours. If you want attribution, `src/components/layout/SiteFooter.jsx` is the place, and it is a deliberately slim persistent bar (35px desktop / 61px mobile), so keep additions short.

---

## 4. Security headers — action required

`index.html` carries a **Content-Security-Policy** meta tag. Most CSP directives work that way, so what is left in the file is genuinely in effect.

**Three protections cannot be delivered from HTML and must be configured on your web server.** All three were previously in the HTML looking like protection while doing nothing:

- `X-Content-Type-Options` and `Referrer-Policy` were `<meta http-equiv>` tags. Browsers ignore both in that form — they were never in effect.
- CSP's **`frame-ancestors`** (the anti-clickjacking directive) was in the meta CSP. Browsers explicitly ignore it outside an HTTP header, and it was logging a console error on every single page load.

They have been removed from the HTML rather than left as false assurance. **Set them as HTTP response headers:**

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`frame-ancestors 'none'` is what stops the site being framed by another origin. If your stack does not let you add a CSP header, `X-Frame-Options: DENY` is the older equivalent and is honoured by every browser you care about — but do not set both to conflicting values.

You may also prefer to move the whole CSP to a response header — a real header takes precedence over the meta tag, is easier to audit, and lets `frame-ancestors` live with the rest of the policy. The current policy, for reference (add `frame-ancestors 'none'` to it if you do this, and then drop the meta tag from `index.html`):

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com;
connect-src 'self' https://nominatim.openstreetmap.org;
font-src 'self' https://fonts.gstatic.com;
object-src 'none';
base-uri 'self';
form-action 'none';
```

`'unsafe-inline'` on `script-src` is required by the current Vite output. Removing it means adopting a nonce or hash strategy — worth doing if your policy demands it, but it is a build change, not a config change.

### One CSP error you will see in development, and should ignore

Running `npm run dev` and opening the console shows:

```
Creating a worker from 'blob:...' violates the following Content Security
Policy directive: "script-src 'self' 'unsafe-inline'" ... has been blocked.
```

This is **Vite's dev-server HMR client** (`node_modules/vite/dist/client/client.mjs`), not application code. The production bundle contains zero `new Worker` calls — verified — so it cannot occur in a deployed build. Do not loosen `script-src` or add `worker-src` to silence it; you would be widening the shipped policy to accommodate a dev-only tool. Check the console against `npm run build` output rather than the dev server if you want a clean read.

---

## 5. Third-party services the site calls at runtime

Three external dependencies. If your institution restricts third-party resource loading, these are the ones to review.

| Service | Used for | If you must remove it |
|---|---|---|
| **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) | Archivo, Inter, JetBrains Mono | Self-host the font files and update the `<link>` in `index.html` plus `font-src`/`style-src` in the CSP. Straightforward. |
| **CartoDB basemap tiles** (`*.basemaps.cartocdn.com`) | The NRO map background | The map needs a tile source. Swap the `TileLayer` URL in `NroLookup.jsx` for another provider. CartoDB Voyager was chosen specifically because its labels are English. |
| **Nominatim** (`nominatim.openstreetmap.org`) | Geocoding in the NRO "Check proximity to NROs" panel | See the note below. |

**About Nominatim:** it is a free, volunteer-run OpenStreetMap service with a published usage policy that asks for an identifying User-Agent and discourages heavy or automated use. Current usage is interactive and low-volume — a user typing an institution name — which is within the spirit of that policy. But it is a community service with no availability guarantee, and if it is unreachable the proximity panel is the only thing that breaks; the rest of the NRO tool works. If your institution needs a guaranteed geocoder, that panel is the single place to swap one in.

---

## 6. Accessibility — what you are inheriting

The site targets **WCAG 2.0 AA**, the level AODA's IASR references.

- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** is the full record: what was remediated and why, the equivalent-alternative decisions, and the manual test checklist.
- `npm run lint` runs `eslint-plugin-jsx-a11y` as an automated regression gate. **Keep it at 0 errors.** It catches roughly 30% of WCAG issues — the checklist in ACCESSIBILITY.md §3 covers the rest and should be re-run after any significant UI change.
- Two deliberate equivalent-alternative decisions you should not undo without providing a replacement:
  - The **NRO data table** is the keyboard/screen-reader equivalent of the Leaflet map. Keep it complete and in sync with the map data.
  - **Guided Mode** is the keyboard/AT-accessible equivalent of the visual flowchart SVG. If Full View ever becomes the only route to node detail, those nodes must become real focusable controls.
- Manual keyboard and screen-reader testing was completed 2026-09-02. A formal third-party AODA audit is being carried out separately.

---

## 7. Maintaining the content

This is the part that needs a human who understands the policy, not just a developer.

Every tool displays a `lastUpdated` date from its data file in `src/data/`. Those dates are shown to users, so a stale one visibly undercuts the guidance.

**Current status:**

| Data file | `lastUpdated` | Verified? |
|---|---|---|
| `nroData.js` | 2024-04-18 | ✅ Diffed against the federal list 2026-09-02 — matches, no revision since |
| `straData.js` | 2026-07-30 | ✅ All 11 categories / 74 subcategories diffed clean 2026-09-02 |
| `reportConcernData.js`, `travelSecurityData.js` | 2026-09-02 | ✅ Current |
| `dualUseData.js` | 2026-06-19 | ✅ Current |
| `cybersecurityData.js` | 2026-04-16 | ⚠️ Review |
| `faqData.js`, `glossaryData.js`, `riskMitigationData.js`, `triAgencyData.js` | 2026-03-31 | ⚠️ Review |
| `exportControlData.js` | 2025-01-24 | ⚠️ **Needs verification** |
| `riskChecklist.js` | 2025-01-24 | ⚠️ **Needs verification** |
| `flowcharts/stracFlow.js`, `nsgrpFlow.js`, `ontarioFlow.js` | 2025-01-24 | ⚠️ **Needs verification** |

The five marked **Needs verification** derive from policy *documents* rather than published lists, so checking them means reading the current policy rather than diffing a web page. They were deliberately out of scope for the last data pass.

**When you re-verify:** update `lastUpdated` only on evidence, and leave a comment next to it recording what you checked, the way `nroData.js` and `straData.js` do. A date bumped on assumption is worse than an honestly old one.

Sanctions and the NRO list move fastest. Cross-check against the [Global Affairs Canada sanctions index](https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx).

---

## 8. Known gaps and deliberate omissions

Honest inventory of what is not finished.

- **No automated test suite.** There is no unit or integration test framework. The quality gates are `npm run lint` (including the a11y rules), a clean production build, and the manual accessibility checklist. Adding tests would be a genuine improvement.
- **NRO map pin highlight is not wired.** Clicking a row in the NRO table highlights the row but not the corresponding map pin. Implementing it means holding refs to individual markers inside the cluster group and opening the popup programmatically. The dead prop that half-suggested this was removed; the idea is recorded here instead.
- **Three NRO city labels are known to be imprecise** (coordinates are correct in all three cases):
  - `33rd-tsnii` — labelled Moscow; actually in Shikhany-2, Saratov Oblast.
  - `peac-institute-of-multiscale-sciences` — labelled Mianyang; headquartered at Sichuan University, Chengdu.
  - `48th-central-scientific-research-institute` — has three branches (Sergiev Posad-6, Yekaterinburg, Kirov); the federal list carries one entry.
- **22 CAEP sub-institutes have approximate coordinates.** They sit inside the ~5 km² Mianyang Science City compound at deterministic offsets from `31.4974, 104.7589`. They render correctly but could be tightened with better public address data.
- **Flowchart Full View nodes are not keyboard-focusable.** This is the conforming-alternate-version route, not an oversight — Guided Mode is the accessible equivalent. See ACCESSIBILITY.md §4.

---

## 9. Where to look next

| Document | Contents |
|---|---|
| [README.md](README.md) | Tool inventory, tech stack, local development |
| [CLAUDE.md](CLAUDE.md) | Full architecture reference — conventions, design tokens, per-tool decisions, data shapes. The most detailed document here. |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | WCAG/AODA remediation record and the manual test checklist |
| [`src/data/toolRegistry.js`](src/data/toolRegistry.js) | Single source of truth for navigation and the home page |
| [`src/siteConfig.js`](src/siteConfig.js) | The three values you need to change |
