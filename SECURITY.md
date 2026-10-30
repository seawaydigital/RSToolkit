# Security

Security record for the Research Security Toolkit, prepared for handoff to Lakehead University IT.

## Assessment record

| | |
|---|---|
| **What this is** | A self-assessment by the developer. It is **not** an independent or third-party security assessment, and it has not been reviewed by Lakehead IT or TSC. |
| **Performed by** | Andrew Austin (Research Security and Data Management Specialist, Lakehead University), the site's developer, using Claude Code (Anthropic's AI coding assistant) to carry out the source review and the checks. Andrew Austin reviewed every finding and approved every change. |
| **Dates** | Main review **2026-10-03** (commit `16490c9`). Follow-up review of the deploy workflow and dependencies **2026-10-22** (commits `c45fb4d`, `aded64a`). |
| **In scope** | All application source in `src/`, `index.html` and its Content Security Policy, `vite.config.js`, the GitHub Actions workflow, the npm dependency tree (`npm audit`), and the production build loaded in a browser. Details in §3–§4. |
| **Not in scope** | Penetration testing or dynamic scanning of a live host; any server, VM or network configuration (no Lakehead host exists yet); the third-party tile and geocoder services; formal threat modelling against an institutional standard. |

An institutional host should run its own assessment against its own requirements before going live. Re-run the checks in [§6](#6-re-checking-after-a-change) after any change to code, dependencies or hosting.

---

## 1. Summary

The toolkit is a static site: HTML, JavaScript, CSS, fonts and images, built by Vite. It has no server-side code, database, accounts, cookies or analytics. **The site never receives anything a user types**, with one deliberate and disclosed exception: the NRO map's proximity search sends an institution name to a public geocoder, and it can be switched off (§3).

The Defence Institution Tracker, added in October 2026 and switched off until launch (`ENABLE_DEFENCE_TRACKER`), follows the same rule: its searches and batch checks never leave the browser. It also adds a monthly GitHub Actions workflow and local maintenance scripts (§3a). **The tracker postdates the 2026-10-03 audit and has not had a security review yet;** one is a launch gate.

The audit found **no vulnerabilities in the application code**. It made seven hardening and accuracy changes, all listed in §4. Two items are the host's responsibility and cannot be done from the code: response headers and a vulnerability-report contact (§5).

**"Safe for any kind of research data" — what that does and does not mean.** Nothing a researcher enters in the STRA lookup, NRO search, wizards, flowcharts or checklists leaves their browser, and the browser-enforced Content Security Policy would block it if code ever tried to send it. So the risk to research data from *using the site* is the same as the risk from reading a web page. No website can be "100% safe", though: the user's own device, browser extensions and network are outside the site's control. The site's How This Site Works page states the same limits publicly.

---

## 2. Architecture and threat model

| Asset | Where it lives | Exposure |
|---|---|---|
| Policy content (NRO list, STRA list, guidance) | Compiled into the JS bundle | Public by design |
| Search terms, wizard answers | Memory of the open tab | Never transmitted |
| Checklist ticks (2 tools) | `localStorage` on the user's device (`rs-toolkit-checklist-v1`, `rs-toolkit-travel-v1`) | Never transmitted. On a shared computer, readable by the next user of that browser until cleared; the site has a one-click clear button and tells users to use it |
| Institution name typed into the proximity search | Sent to `nominatim.openstreetmap.org`, then `en.wikipedia.org` if there is no match | Disclosed at the input and on How This Site Works. Can be switched off with `ENABLE_PROXIMITY_SEARCH` |
| Map area being viewed (NRO map; the tracker's map view when it is switched on) | Tile requests to the basemap provider (Esri by default) | Reveals map area and zoom level only. Disclosed. The tracker's map never moves to fit search results, so its tiles reveal nothing about a search |
| Tracker searches and batch-check text | Memory of the open tab | Never transmitted, never stored, never put in the address |
| Screening list and OpenSanctions API key | Memory of the open tab | Sent to `api.opensanctions.org` only when the user presses *Screen*, the key in the request's query string (the only form the API accepts from a browser). Never stored, never put in the address. Not in the build while `ENABLE_SANCTIONS_SCREENING` is false |
| Tracker dataset (ratings, listings, sources) | Compiled into the tracker's own chunk, and published at `data/defence-tracker.json` and `.csv` | Public by design (CC BY 4.0). None of it is in the build while `ENABLE_DEFENCE_TRACKER` is false |

**Threats considered:**
- **Script injection (XSS):** no HTML sink receives untrusted data unescaped, and the CSP's `script-src 'self'` with no `'unsafe-inline'` would block it anyway.
- **Tampered third-party data:** geocoder results are escaped before going into Leaflet popups.
- **Clickjacking:** prevented by `frame-ancestors` and `X-Frame-Options`, which the host must set (§5).
- **Data exfiltration by compromised code:** `connect-src` allows only the two geocoders (plus the OpenSanctions API in builds with `ENABLE_SANCTIONS_SCREENING`), and `form-action 'none'` blocks form submissions.
- **Supply-chain compromise:** controls are in §4.
- **Hosting misconfiguration:** covered in §5.

**Out of scope:** the user's device, OS, browser and extensions; network-level observers beyond what TLS hides; and the availability of the third-party geocoder and tile services.

---

## 3. Controls verified in the code

| Control | Evidence |
|---|---|
| No raw-HTML rendering of untrusted data | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write` or workers anywhere in `src/`. The only string-to-HTML sink is Leaflet's `bindPopup`, and every value going into it is escaped by `escapeHtml()` (`src/components/ui/map/escapeHtml.js`, used by NRO Lookup and the Defence Institution Tracker's map view). |
| Hash router can't be abused | User-controlled `#route` values are looked up with `Object.hasOwn`, so `#__proto__` / `#constructor` cannot resolve to a prototype member (`src/App.jsx`). |
| Strict CSP | `default-src 'self'`, `script-src 'self'` (no `'unsafe-inline'`, no `'unsafe-eval'`), `connect-src` limited to the two geocoders, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `font-src 'self'`. Every allowance is in use and none is spare (checked against the built bundle). |
| No inline scripts in the build | `dist/index.html` has one external module script and no inline handlers. The build emits no source maps. |
| External links | All 36 `target="_blank"` links carry `rel="noopener noreferrer"`. Every external URL is a hard-coded `https://` constant. None is built from user input. |
| Outbound requests carry no credentials | `fetch()` uses the default `credentials: 'same-origin'`, so no cookies go to the geocoders. Wikipedia is queried with `origin=*` (anonymous CORS). The referrer policy is `strict-origin-when-cross-origin`, so third parties see the origin only, never the `#tool` path. |
| No secrets in the repo | Scanned for API keys, tokens and passwords: none found. Map-provider keys (optional) are injected at build time from CI secrets (§5). |
| Tracker addresses are inert | `#defence-tracker/<id>` is split by `parseHashRoute()` (`src/routing.js`) with a guarded `decodeURIComponent`. The id is looked up in a `Map` of records and never rendered as HTML; an unknown or malformed id shows "not found". User-typed text is never put in the address. |
| Exports can't carry spreadsheet formulas | The batch-check CSV, the copied batch table (text and HTML) and the open-data CSV pass every cell through the same rule (`csvCell()`), which prefixes a `'` to any value starting with `=`, `+`, `-`, `@`, tab or carriage return. Files are built in the browser; nothing is uploaded. |
| No cookies, analytics or trackers | None in the code. The production build contacts only the host on page load. Confirmed in a browser: on the NRO map, the only other host contacted was the Esri tile server. |

### 3a. Maintenance automation (Defence Institution Tracker)

Added after the 2026-10-03 audit and not yet reviewed (a launch gate). How it is built:

| Control | Detail |
|---|---|
| The scheduled workflow can't change the repository | `.github/workflows/tracker-watch.yml` runs monthly and on demand with `permissions: contents: read, issues: write` and nothing else. It opens or updates one "Tracker watch — YYYY-MM" issue. The maintainer runs the sync locally and commits. |
| Hardened like the deploy workflow | Actions pinned to full commit SHAs (the same versions as `deploy.yml`, kept current by Dependabot); checkout with `persist-credentials: false`; `npm ci --ignore-scripts`, since this job holds a token that can write issues. Apart from checkout, which uses the token to fetch and doesn't keep it, only the final `gh` step receives it. The issue title reaches the shell through an environment variable, never interpolated into the script. |
| Outbound requests | `data.trade.gov` (US Consolidated Screening List), `www.international.gc.ca` (Canadian sanctions XML), `science.gc.ca` (the NRO page), `www.cto.mil` (the US Section 1286 list page) and `www.meti.go.jp` (METI's revision log; it currently refuses scripts), and each source address cited by a verified profile (status only; the page body is discarded). Requests carry an identifying user agent. |
| Issue text can't mention anyone | Names, page text and error messages from outside the repository go into code spans with `@` removed (`sanitizeForIssue()`), so they can't mention users or link other issues. Source addresses are the tracker's own reviewed citations. |
| Local-only scripts | `npm run tracker:sync` writes listing snapshots (review the diff before committing). `npm run tracker:archive` submits cited sources to the Wayback Machine; its optional `ARCHIVE_ORG_ACCESS_KEY` / `ARCHIVE_ORG_SECRET` are read from the environment and never written anywhere. `npm run tracker:import` was a one-off import pinned to a MISP commit. |
| Data is validated before it ships | Every record passes the schema checks in `npm test`, which the `verify` job runs before any deploy. |

---

## 4. Changes made in this audit (2026-10-03)

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | Medium (privacy) | Fonts loaded from Google Fonts on **every page view**, sending each visitor's IP address to Google. | Fonts are now self-hosted from npm (`@fontsource-*`) and bundled into `dist/assets/`. The Google hosts were removed from `style-src` and `font-src`. Vite was also stopped from inlining small font files as `data:` URIs, which `font-src 'self'` would have blocked. |
| 2 | Medium (hosting) | Clickjacking protection, `nosniff` and HSTS only exist as HTTP response headers, and the handoff docs covered only GitHub Pages behind Cloudflare. | Added ready-to-use **nginx, Apache and IIS** configs plus a `curl` and browser verification checklist in [HANDOFF.md §4a](HANDOFF.md). Also corrected the docs' claim that a header CSP "takes precedence over" the meta tag: when both are present, browsers enforce **both**. |
| 3 | Low (CI) | The workflow granted `pages: write` and `id-token: write` to every job, including `verify`, which runs `npm ci` on pull-request code. | Workflow default is now `contents: read`, and only the `deploy` job gets the Pages/OIDC scopes. |
| 4 | Low (supply chain) | GitHub Actions were referenced by movable tags (`@v5`), and checkout left the token in `.git/config`, where install scripts could read it. | All four actions are pinned to full commit SHAs, with `persist-credentials: false`. Added `.github/dependabot.yml` (npm + github-actions, weekly) so the pins stay current. |
| 5 | Low (privacy) | The proximity search sends typed text to OpenStreetMap and Wikipedia. This was disclosed only on a separate page. | Added a privacy notice directly above the input (linked to the input with `aria-describedby`) and turned off browser autocomplete history for that field. Added the `ENABLE_PROXIMITY_SEARCH` switch in `src/siteConfig.js`, which removes the panel and every mention of it on How This Site Works and in the FAQ. |
| 6 | Low (accuracy) | The privacy page hard-coded "GitHub Pages" as the host, and the canonical/OG URLs were hard-coded in `index.html` (`SITE_URL` in `siteConfig.js` was not used anywhere). | Added `WEB_HOST` in `siteConfig.js`, which feeds the privacy page. `index.html` now uses `%SITE_URL%` placeholders that a Vite plugin fills from `SITE_URL`. The build **fails** unless that value is an absolute `https://` URL. |
| 7 | High in tooling (dev only) | `npm audit`: `brace-expansion` ≤ 1.1.20 (CPU denial of service; it arrives via `eslint-plugin-jsx-a11y` → `minimatch`). It runs only during linting and never ships. It would still have failed the CI gate. | `npm audit fix` updated it to 1.1.21. `npm audit` now reports 0 vulnerabilities (all dependencies and runtime-only). |

Also removed: `blob:` from `img-src`, which nothing in the build uses.

**Verified after the changes:**
- `npm audit`: 0 vulnerabilities.
- `npm run lint`: 0 errors (3 warnings that predate this audit).
- `npm test`: 19/19 passing.
- `npm run build`: succeeds.
- Production build in a browser:
  - no console or CSP errors on the home page, NRO map or How This Site Works;
  - all six font faces load from the site itself;
  - the geocoder search still works under the CSP;
  - a build with `ENABLE_PROXIMITY_SEARCH = false` shows no panel and no mention of geocoders.

---

## 5. What the host must do (Lakehead IT)

1. **Serve the security headers.** Use the full set in [HANDOFF.md §4a](HANDOFF.md): CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP and CORP. Then run the verification checklist there.
2. **Use a dedicated subdomain**, not a path under a shared origin. Inject nothing into the pages: no analytics, tag managers or overlays. Either would break the CSP or make the privacy page false.
3. **Set `src/siteConfig.js` before building:**
   - `SITE_URL`: the new `https://` URL.
   - `WEB_HOST`: who serves the files, plus any CDN or proxy.
   - `ENABLE_PROXIMITY_SEARCH`: your policy call. If `false`, also trim `connect-src` in both the meta tag and the header.
   - `ENABLE_SANCTIONS_SCREENING`: your policy call (off by default). If `true`, add `https://api.opensanctions.org` to the header's `connect-src`; the meta tag gets it at build time.
4. **Designate a vulnerability-report contact.** Until you do, reports go to the address in §7. Consider publishing `/.well-known/security.txt` (RFC 9116) by adding it under `public/.well-known/`.
5. **If you set a map key (`VITE_CARTO_API_KEY` / `VITE_STADIA_API_KEY`), restrict it to your domain** in the provider's dashboard. Keys in a static bundle are public by design; a domain lock is what stops reuse.
6. **Keep the build pipeline gates.** If you build outside GitHub Actions, run the same gates before every deploy: `npm ci`, `npm audit --audit-level=high`, `npm run lint`, `npm test`, `npm run build`. Use `npm ci` (lockfile-exact), never `npm install`.

---

## 6. Re-checking after a change

| If you change… | Check |
|---|---|
| Anything that renders data from outside the bundle | It must go through React's text rendering or `escapeHtml()`. Never use `dangerouslySetInnerHTML`. |
| A third-party service (tiles, geocoder, fonts, anything) | Add its host to the CSP in `index.html` **and** to the server header. Add a row to `dataFlows` in `src/data/howItWorksData.js`. Add it to HANDOFF.md §5. |
| `localStorage` usage | Add the key to `STORAGE_KEYS` in `src/data/howItWorksData.js` (it drives the clear button and the privacy page). |
| Dependencies | `npm audit`. Review Dependabot PRs. Runtime dependencies currently have minor updates available (React 19.3, Fuse.js 7.5, lucide-react) with no security advisories; take them through Dependabot with normal testing. |
| The Defence Institution Tracker | `npm test`. Before switching `ENABLE_DEFENCE_TRACKER` on: build with it on and confirm zero CSP errors on `#defence-tracker` and its map view, and that tracker pages contact no host but the site and the basemap. Keep the watch workflow at `contents: read, issues: write` with no repository writes, and route any new external text in its issue through `sanitizeForIssue()`. |
| The CSP | Load the production build (`npm run build && npm run preview`), not the dev server, and confirm zero CSP errors on the home page and `#nro-lookup`. The dev server's HMR client trips `script-src` by design; see HANDOFF.md §4. |

---

## 7. Reporting a vulnerability

Email **security.research@lakeheadu.ca** (Lakehead Research Security and Data Management Services) with a description and steps to reproduce. Please don't open a public GitHub issue for a security problem. Lakehead IT may replace this contact with its own security team's address when it takes over hosting. If so, update it here and in any `security.txt`.
