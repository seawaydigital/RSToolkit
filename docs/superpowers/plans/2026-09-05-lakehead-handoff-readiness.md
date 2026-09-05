# Lakehead Handoff Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Research Security Toolkit repository host-neutral, self-documenting, and free of placeholder/third-party artifacts so the Lakehead University Web Development team can build and host it on their own domain without needing to ask questions.

**Architecture:** The site stays exactly what it is — a client-side React + Vite static bundle with hash routing. Nothing about the application's behaviour changes. The work is: (1) clear the toolchain gates a receiving team will run on day one (`npm run lint`, `npm audit`, `npm run build`), (2) strip deployment details and third-party template assets that are ours-or-nobody's rather than Lakehead's, (3) funnel every value Lakehead must change into a single `src/siteConfig.js` file, and (4) rewrite the documentation so it describes the repository as it actually is.

**Tech Stack:** React 19, Vite 8, ESLint 9 (flat config) with `eslint-plugin-jsx-a11y`, Python 3 + Pillow 12 (one-off icon generation only — not a project dependency), GitHub Actions.

---

## A Note On Verification (read before starting)

**This project has no test framework and this plan does not add one.** There is no `vitest`, no `jest`, no `test` script in `package.json`. Adding a test harness is real work with real value, but it is not handoff-readiness work and would expand this plan well past what was asked for.

So instead of TDD's red/green cycle, **every task below has a concrete verification step with an exact command and its exact expected output.** Treat those the way you would treat a test: run the command *before* the change to see the current (bad) output, make the change, run it again to see the expected (good) output. Several tasks make this explicit. Do not skip verification steps because a change "obviously" works — three of the issues this plan fixes were things that obviously worked and didn't.

The three project-wide gates, which must all pass before the final commit:

```bash
npm run lint     # must exit 0 with no errors
npm run build    # must exit 0
npm audit        # must report 0 vulnerabilities
```

---

## Decisions Lakehead Must Make (parameterized, not blocking)

Three values genuinely belong to Lakehead, not to us. This plan does **not** guess at them and does **not** block on them. Task 4 creates `src/siteConfig.js` as the single place they live, seeded with today's values and clearly marked. Task 15's handoff document tells Lakehead to change exactly these three things:

| Value | Current | Who decides |
|---|---|---|
| `ACCESSIBILITY_CONTACT` | `andrew@seawaydigital.ca` | Lakehead — AODA requires a monitored address |
| `SITE_URL` | `https://rs.rdmtoolkit.ca` | Lakehead — final hosting URL, used for the canonical tag |
| `SHOW_SISTER_SITE_CARD` | `true` | Lakehead — whether the RDM Toolkit card stays in the sidebar |

Everything else in this plan is ours to finish.

---

## File Structure

**Created:**
| Path | Responsibility |
|---|---|
| `src/siteConfig.js` | Single source of truth for the three deployment-specific values above. The only file Lakehead must edit. |
| `LICENSE` | MIT license text. Makes the "open-source" claim in the README actionable. |
| `public/robots.txt` | Crawler directives. |
| `public/apple-touch-icon.png` | 180×180 iOS home-screen icon (generated). |
| `public/favicon.ico` | 16/32/48 multi-size ICO fallback (generated). |
| `public/og-image.png` | 1200×630 social share card (generated). |
| `HANDOFF.md` | The document Lakehead actually reads. Build, host, configure, maintain. |
| `scripts/generate-icons.py` | Reproducible icon generation, so regenerating at a new size isn't archaeology. |

**Modified:**
| Path | Change |
|---|---|
| `eslint.config.js` | Add a Node-globals block for config files so `process` stops erroring. |
| `package.json` | Real name, version, description, license, repository. |
| `index.html` | Description/OG/Twitter/canonical meta, icon links, CSP cleanup, remove inert headers. |
| `src/components/layout/SiteFooter.jsx` | Read contact from `siteConfig`. |
| `src/components/layout/Sidebar.jsx` | Gate the sister-site card on `siteConfig`. |
| `src/tools/compliance/NroLookup.jsx` | Remove dead `activeId` prop; drop unused `onNavigate`. |
| `src/tools/compliance/RiskChecklist.jsx`, `StraLookup.jsx`, `src/tools/reference/ExportControl.jsx`, `Glossary.jsx` | Drop unused `onNavigate` param. |
| `.github/workflows/deploy.yml` | Write the CNAME at deploy time instead of carrying it in the source tree. |
| `README.md` | Full rewrite — current tool inventory, live links, deployment section. |
| `CLAUDE.md` | Fix the flowchart directory paths; update CNAME, audit, and favicon entries. |

**Deleted:**
| Path | Why |
|---|---|
| `public/CNAME` | Hard-codes our domain into Lakehead's build artifact. |
| `public/icons.svg` | Unreferenced social-icon sprite (Bluesky/Discord/X/GitHub) from a starter template. |
| `public/favicon.svg` | Off-brand purple mark from the same template. |
| `src/assets/vite.svg` | Unused scaffolding. |
| `.claude/HANDOFF.md` | Stale session notes from 2026-04-15 that read like *the* handoff doc. |

---

## Phase 1 — Toolchain gates

### Task 1: Make `npm run lint` exit clean

The a11y gate is genuinely passing (0 `jsx-a11y` errors), but 10 unrelated errors mean the receiving team cannot wire lint into CI without it going red immediately. Six are unused parameters; four are `process` in a Node config file that ESLint is checking with browser globals.

**Files:**
- Modify: `eslint.config.js`
- Modify: `src/tools/compliance/NroLookup.jsx:65`, `:195`, `:445`
- Modify: `src/tools/compliance/RiskChecklist.jsx:25`
- Modify: `src/tools/compliance/StraLookup.jsx:22`
- Modify: `src/tools/reference/ExportControl.jsx:32`
- Modify: `src/tools/reference/Glossary.jsx:13`

- [ ] **Step 1: Observe the current failure**

Run:
```bash
npm run lint
```

Expected: exits non-zero, ending with `✖ 13 problems (10 errors, 3 warnings)`. Confirm you see 4 `'process' is not defined` errors in `vite.config.js` and 6 `no-unused-vars` errors across the five tool files. The 3 warnings are `react-hooks/set-state-in-effect` and are deliberately left as warnings (see CLAUDE.md) — do not "fix" them.

- [ ] **Step 2: Give config files Node globals**

`vite.config.js` runs in Node, not the browser, so `process` is legitimately defined there. Add a second config block scoped to the config files rather than polluting the browser globals for all of `src/`.

In `eslint.config.js`, replace the final `])` closing the `defineConfig` array with a new block plus the closing:

```js
  {
    // Config files execute in Node, not the browser — `process` is defined there.
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
```

The full file after the edit:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Pre-existing intentional state-sync effects; surfaced (not silenced) by a
      // newer react-hooks plugin. Kept visible as warnings so the a11y errors are signal.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Config files execute in Node, not the browser — `process` is defined there.
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
```

- [ ] **Step 3: Remove the five unused `onNavigate` params**

All five tools declare `{ onNavigate }` and never use it. `App.jsx` passes the prop to every tool unconditionally, which is fine — an unused prop costs nothing. Removing the *parameter* is the correct fix; do **not** stop passing the prop in `App.jsx`, because a future cross-link in any of these tools should just re-add the param.

`src/tools/compliance/NroLookup.jsx:195` — change:
```jsx
export default function NroLookup({ onNavigate }) {
```
to:
```jsx
export default function NroLookup() {
```

`src/tools/compliance/RiskChecklist.jsx:25` — change:
```jsx
export default function RiskChecklist({ onNavigate }) {
```
to:
```jsx
export default function RiskChecklist() {
```

`src/tools/compliance/StraLookup.jsx:22` — change:
```jsx
export default function StraLookup({ onNavigate }) {
```
to:
```jsx
export default function StraLookup() {
```

`src/tools/reference/ExportControl.jsx:32` — change:
```jsx
export default function ExportControl({ onNavigate }) {
```
to:
```jsx
export default function ExportControl() {
```

`src/tools/reference/Glossary.jsx:13` — change:
```jsx
export default function Glossary({ onNavigate }) {
```
to:
```jsx
export default function Glossary() {
```

- [ ] **Step 4: Remove the dead `activeId` prop on MarkerCluster**

`.claude/HANDOFF.md` flagged this in April 2026: `activeId` is passed to `MarkerCluster` but never read, so clicking a table row highlights the row but not the map pin. Wiring it up means holding refs to individual markers inside the cluster group and programmatically opening popups — a real feature, not a lint fix, and out of scope here. Remove the dead prop; the feature idea is preserved in Task 15's handoff document under "known gaps".

`src/tools/compliance/NroLookup.jsx:65` — change:
```jsx
function MarkerCluster({ markers, onMarkerClick, activeId }) {
```
to:
```jsx
function MarkerCluster({ markers, onMarkerClick }) {
```

`src/tools/compliance/NroLookup.jsx:442-446` — change:
```jsx
          <MarkerCluster
            markers={markers}
            onMarkerClick={handleMarkerClick}
            activeId={activeRowId}
          />
```
to:
```jsx
          <MarkerCluster
            markers={markers}
            onMarkerClick={handleMarkerClick}
          />
```

**Do not remove the `activeRowId` state itself** — it is still used at `NroLookup.jsx:636` to apply the `nro-row--active` class to the table row. Only the prop passing is dead.

- [ ] **Step 5: Verify lint is clean**

Run:
```bash
npm run lint
```

Expected: exits 0. Output shows `✖ 3 problems (0 errors, 3 warnings)` — the three `react-hooks/set-state-in-effect` warnings, which are intentional. **Zero errors.**

- [ ] **Step 6: Verify the app still builds and the NRO map still works**

Run:
```bash
npm run build
```

Expected: `✓ built in <n>s`, exit 0.

Then start the dev server and confirm the NRO tool — the only file with a structural change — still renders and its table row highlighting still works:

```bash
npm run dev
```

Open `http://localhost:5173/#nro-lookup`. Confirm: the map renders with clustered pins, the table below it lists organizations, and clicking a table row applies a visible highlight to that row. Check the browser console — expected: **no errors**. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add eslint.config.js src/tools/compliance/NroLookup.jsx src/tools/compliance/RiskChecklist.jsx src/tools/compliance/StraLookup.jsx src/tools/reference/ExportControl.jsx src/tools/reference/Glossary.jsx
git commit -m "$(cat <<'EOF'
fix(lint): clear the 10 non-a11y lint errors so the gate is usable

The jsx-a11y gate was already clean, but 10 unrelated errors meant the
receiving team could not wire `npm run lint` into CI without it going red.

- vite.config.js was linted with browser globals, so `process` read as
  undefined 4 times. Added a Node-globals block scoped to config files.
- 5 tools declared an `onNavigate` prop they never used. App.jsx still
  passes it; only the unused parameter is removed.
- MarkerCluster took an `activeId` prop it never read (flagged in the
  April 2026 handoff notes). Removed the dead prop. `activeRowId` state
  stays — it still drives the table row highlight.

npm run lint now exits 0 with 3 intentional warnings and 0 errors.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Patch the dependency advisories

Six advisories, all **devDependencies only** — `eslint → @eslint/eslintrc → js-yaml`, and `vite → postcss → nanoid`. None of these ship in the production bundle, so this is build-toolchain hygiene rather than a live exposure. It still has to be fixed: an institutional web team runs `npm audit` on day one, and CLAUDE.md currently claims zero vulnerabilities, which is now wrong.

**Files:**
- Modify: `package-lock.json`
- Modify: `CLAUDE.md` (the npm audit entry)

- [ ] **Step 1: Record the current state**

Run:
```bash
npm audit
```

Expected: `6 vulnerabilities (1 moderate, 5 high)`, listing `js-yaml`, `nanoid`, and `postcss`.

- [ ] **Step 2: Apply the fixes**

```bash
npm audit fix
```

This resolves all six within existing semver ranges — no major-version bumps, no `--force` needed.

- [ ] **Step 3: Verify zero vulnerabilities**

```bash
npm audit
```

Expected: `found 0 vulnerabilities`.

- [ ] **Step 4: Verify the toolchain still works after the bumps**

Both gates, because `npm audit fix` touched the packages that *are* the toolchain:

```bash
npm run lint
```
Expected: exit 0, `0 errors`.

```bash
npm run build
```
Expected: `✓ built in <n>s`, exit 0.

- [ ] **Step 5: Update the stale claim in CLAUDE.md**

In `CLAUDE.md`, find the `**npm audit**` bullet under Key Decisions & Conventions:

```markdown
- **npm audit**: Run `npm audit fix` after any dependency changes. As of 2026-06-17 the project has 0 known vulnerabilities (Vite/Babel/PostCSS/js-yaml advisories were patched via `npm audit fix`).
```

Replace with:

```markdown
- **npm audit**: Run `npm audit fix` after any dependency changes. As of 2026-09-05 the project has 0 known vulnerabilities. Note that every advisory seen so far has been in **devDependencies** (`eslint → js-yaml`, `vite → postcss → nanoid`) — they affect the build toolchain, not the shipped bundle, which has no runtime dependencies beyond React/Leaflet/Fuse/dagre/lucide. Re-check before any handoff or release; advisories accumulate on their own schedule, not ours.
```

- [ ] **Step 6: Commit**

```bash
git add package-lock.json CLAUDE.md
git commit -m "$(cat <<'EOF'
chore(deps): patch 6 advisories (js-yaml, nanoid, postcss)

All six are devDependencies — eslint pulls js-yaml, vite pulls postcss
which pulls nanoid. None ship in the production bundle, so this is build
toolchain hygiene rather than a live exposure. Fixed within existing
semver ranges; no --force, no major bumps. Lint and build both re-verified.

CLAUDE.md claimed 0 vulnerabilities as of 2026-06-17, which had gone
stale. Corrected, and noted the devDependency distinction so the next
reader can judge severity rather than just seeing a number.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Give the package a real identity and a license

`package.json` still carries Vite scaffolding defaults: `"name": "rs-temp"`, `"version": "0.0.0"`, no description, no license, no repository. And there is no `LICENSE` file at all, while `README.md` describes the project as "free, open-source". Handing a codebase to another institution to host with no stated terms leaves ownership genuinely ambiguous — this is the kind of thing a university's legal or IT review stops on.

**Files:**
- Modify: `package.json`
- Create: `LICENSE`

- [ ] **Step 1: Rewrite package.json metadata**

Replace the top of `package.json` — the first five lines:

```json
{
  "name": "rs-temp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
```

with:

```json
{
  "name": "research-security-toolkit",
  "private": true,
  "version": "1.0.0",
  "description": "A client-side web toolkit helping Canadian researchers and research administrators navigate federal research security policy — STRAC, NSGRP, NROs, STRAs, and export controls.",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/seawaydigital/RSToolkit.git"
  },
  "type": "module",
```

`"private": true` stays — this is a deployed site, not an npm package, and it prevents accidental publication.

- [ ] **Step 2: Create the LICENSE file**

Create `LICENSE` with the MIT text. Replace nothing — this is a new file:

```
MIT License

Copyright (c) 2026 Seaway Digital

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> **Note for the person running this task:** MIT is the assumption here because the README already advertises the project as open-source and MIT is the least restrictive option consistent with that claim — it lets Lakehead host, modify, and adapt without asking. If Andrew wants different terms (e.g. CC BY 4.0 for the policy *content* while keeping MIT for the *code*, which is a common and defensible split for a guidance site), that is a decision to make before this commit lands, not after. Ask if unsure — relicensing after handoff is much harder than choosing correctly now.

- [ ] **Step 3: Verify the package still installs and builds under the new name**

```bash
npm install
```
Expected: completes without error. `package-lock.json` updates its root `"name"` field to `research-security-toolkit`.

```bash
npm run build
```
Expected: `✓ built in <n>s`, exit 0.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json LICENSE
git commit -m "$(cat <<'EOF'
chore: replace scaffolding metadata and add an explicit license

package.json still carried Vite defaults — name "rs-temp", version
0.0.0, no description, license, or repository. Set a real identity at
1.0.0, the version this is actually at going into handoff.

Added MIT LICENSE. The README has described this as open-source since
the start with nothing declaring terms, which leaves ownership ambiguous
exactly when another institution needs to know where it stands.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2 — Host-neutrality and foreign assets

### Task 4: Funnel deployment-specific values into `src/siteConfig.js`

Three values currently sit hard-coded in component source: the accessibility contact address, the site URL, and the decision to show the RDM Toolkit sister-site card. All three belong to whoever hosts the site. Right now changing them means knowing which three files to open. After this task, it means editing one.

This directly fixes the AODA contact problem: under the Information and Communications standard, the feedback address must be one the hosting organization actually monitors. Once Lakehead hosts this, `andrew@seawaydigital.ca` is the wrong address — and it is currently the *only* thing the accessibility statement offers a user who hits a barrier.

**Files:**
- Create: `src/siteConfig.js`
- Modify: `src/components/layout/SiteFooter.jsx`
- Modify: `src/components/layout/Sidebar.jsx:80-95`

- [ ] **Step 1: Create the config module**

Create `src/siteConfig.js`:

```js
// ---------------------------------------------------------------------------
// DEPLOYMENT CONFIGURATION
//
// These three values belong to whoever hosts this site. If you are taking
// this repository over, these are the only values you need to change — and
// you should change all three. Everything else in src/ is host-neutral.
//
// See HANDOFF.md for the full deployment guide.
// ---------------------------------------------------------------------------

/**
 * Where accessibility barrier reports and alternate-format requests go.
 *
 * AODA's Information and Communications standard expects a public-facing
 * Ontario site to provide a feedback process and accessible formats on
 * request. This address is what the footer offers users, so it MUST be an
 * address the hosting organization actively monitors. It is not decorative.
 */
export const ACCESSIBILITY_CONTACT = 'andrew@seawaydigital.ca';

/**
 * The site's canonical public URL, no trailing slash.
 *
 * Used for the <link rel="canonical"> and Open Graph tags in index.html.
 * Update this to the real hosting URL before going live, or search engines
 * and social previews will point at the previous host.
 */
export const SITE_URL = 'https://rs.rdmtoolkit.ca';

/**
 * Whether to show the RDM Toolkit sister-site card at the bottom of the
 * sidebar.
 *
 * This links to rdmtoolkit.ca, a separate project by the original author.
 * It is a peer-brand affordance, not an advertisement — but a new host may
 * reasonably not want to link off-site from their own domain. Set to false
 * to remove the card entirely; no other change is needed.
 */
export const SHOW_SISTER_SITE_CARD = true;
```

- [ ] **Step 2: Read the contact from config in the footer**

Replace the whole of `src/components/layout/SiteFooter.jsx` with:

```jsx
import { ACCESSIBILITY_CONTACT } from '../../siteConfig';

// Sits outside <main> deliberately: a <footer> nested inside main does not map
// to the contentinfo landmark, so placing it here is what makes it one.
export default function SiteFooter() {
  const mailto =
    `mailto:${ACCESSIBILITY_CONTACT}` +
    '?subject=Research%20Security%20Toolkit%20%E2%80%94%20accessibility';

  return (
    <footer className="site-footer">
      <p className="site-footer-disclaimer">
        Guidance only &mdash; not legal advice.
      </p>
      <p className="site-footer-a11y">
        <span className="site-footer-a11y-label">Accessibility:</span> this site targets WCAG 2.0 AA.{' '}
        <a href={mailto}>
          Report a barrier or request another format
        </a>
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: Gate the sister-site card**

Open `src/components/layout/Sidebar.jsx`. Add the import after the existing `CATEGORIES` import at the top of the file:

```jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../data/toolRegistry';
import { SHOW_SISTER_SITE_CARD } from '../../siteConfig';
```

Then wrap the sister-site card in a conditional. It is the `<a className="sidebar-sister">` element near the end of the file, sitting directly inside `<nav>` after the `.sidebar-scroll` div closes. Replace:

```jsx
        <a
          className="sidebar-sister"
          href="https://rdmtoolkit.ca"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit our sister site: RDM Toolkit"
          aria-label="Sister site: RDM Toolkit (opens in new tab)"
        >
          <ArrowUpRight className="sidebar-sister-arrow" size={16} aria-hidden="true" />
          <span className="sidebar-sister-logo">
            <span className="sidebar-sister-mark">RDM</span>
            <span className="sidebar-sister-word">Toolkit</span>
          </span>
          <span className="sidebar-sister-tagline">Research Data Management</span>
        </a>
```

with:

```jsx
        {SHOW_SISTER_SITE_CARD && (
          <a
            className="sidebar-sister"
            href="https://rdmtoolkit.ca"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit our sister site: RDM Toolkit"
            aria-label="Sister site: RDM Toolkit (opens in new tab)"
          >
            <ArrowUpRight className="sidebar-sister-arrow" size={16} aria-hidden="true" />
            <span className="sidebar-sister-logo">
              <span className="sidebar-sister-mark">RDM</span>
              <span className="sidebar-sister-word">Toolkit</span>
            </span>
            <span className="sidebar-sister-tagline">Research Data Management</span>
          </a>
        )}
```

Nothing but the conditional wrapper and the resulting indentation changes. Every class, attribute, and child stays identical — the RDM wordmark keeps its own gold `#facc15` + white colors per the peer-brand rule in CLAUDE.md.

Conditional rendering rather than a CSS `display: none` is deliberate: a hidden link still ships in the markup and remains reachable by some assistive technology.

- [ ] **Step 4: Verify both consumers render correctly**

```bash
npm run dev
```

Open `http://localhost:5173`. Confirm:
1. The footer still shows "Accessibility: this site targets WCAG 2.0 AA. Report a barrier or request another format", and the link's `href` is `mailto:andrew@seawaydigital.ca?subject=...` (hover it, or inspect the element).
2. The RDM Toolkit card is still visible at the bottom of the sidebar.
3. The browser console has **no errors**.

Now prove the toggle actually works. Temporarily set `SHOW_SISTER_SITE_CARD = false` in `src/siteConfig.js`, save, and confirm the card disappears from the sidebar entirely (not just visually — check the DOM). **Then set it back to `true`** before committing. A config switch that was never exercised is a config switch that doesn't work.

Stop the dev server.

- [ ] **Step 5: Verify lint and build**

```bash
npm run lint
```
Expected: exit 0, `0 errors`.

```bash
npm run build
```
Expected: `✓ built in <n>s`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/siteConfig.js src/components/layout/SiteFooter.jsx src/components/layout/Sidebar.jsx
git commit -m "$(cat <<'EOF'
refactor(config): funnel host-specific values into src/siteConfig.js

Three values belong to whoever hosts the site, not to the codebase: the
AODA accessibility contact, the canonical URL, and whether the RDM
Toolkit sister-site card appears. All three were hard-coded across
different component files.

The contact one matters most. AODA expects the feedback address on a
public Ontario site to be monitored by the hosting organization, and the
footer's mailto is currently the only route a user with a barrier has.
Once Lakehead hosts this, it has to be their address — so it needs to be
somewhere they can find it, not buried in a component.

Sister-site card is gated on a boolean rather than CSS-hidden, so
disabling it removes it from the DOM instead of leaving a link that
assistive tech can still reach.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Remove the starter-template branding

**This is the finding with the least obvious symptom and the worst consequence.** `public/favicon.svg` is not the RS Toolkit's mark. It is a purple/violet logo (`fill:#863bff`, accents `#47bfff`) carrying Figma export artifacts (`effect1_foregroundBlur_2002_17158`) — it came from whatever starter template the project was scaffolded from. Its companion, `public/icons.svg`, is a social-icon sprite containing **Bluesky, Discord, GitHub, X, documentation, and generic social symbols**, and **nothing in the codebase references it** — but it is in `public/`, so Vite copies it into `dist/` on every single deploy.

Two problems. The site's whole design system is Lakehead Cobalt `#061727` + Blaze `#FFC20E`; a purple mark is the one thing users see in their browser tab and bookmarks, and it is off-brand. More seriously, publishing an unknown third party's logo and a sprite of trademarked social-platform icons on a university domain is a licensing question nobody wants to answer after the fact.

Replacement: a mark that matches the topbar's existing `RS` logo — Blaze `RS` on a rounded Cobalt ground.

**Files:**
- Delete: `public/favicon.svg`, `public/icons.svg`, `src/assets/vite.svg`
- Create: `scripts/generate-icons.py`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/og-image.png`
- (Icon `<link>` tags land in Task 7, which rewrites the whole `<head>` at once.)

- [ ] **Step 1: Confirm the assets really are unreferenced before deleting**

Never delete an asset on the strength of a description. Verify:

```bash
grep -rn "icons.svg\|vite.svg" src index.html public
```
Expected: **no output.** Both files are orphans.

```bash
grep -rn "favicon" src index.html
```
Expected: exactly one hit — `index.html:5`, the `<link rel="icon">`. That link is replaced in Task 7.

- [ ] **Step 2: Write the icon generator**

Icons get regenerated (new sizes, tweaks, a rebrand). Committing three binaries with no way to reproduce them is how assets rot. Create `scripts/generate-icons.py`:

```python
"""Generate the toolkit's favicon, touch icon, and social card.

Run:  python scripts/generate-icons.py

Requires Pillow (pip install Pillow). Pillow is NOT a project dependency —
this is a one-off generator, not part of the build. Output goes to public/.

The mark deliberately matches the topbar logo: Blaze "RS" on a rounded
Cobalt ground. Colors are the design-system tokens from global.css; if the
palette changes there, change it here too.
"""

import os

from PIL import Image, ImageDraw, ImageFont

# Design tokens — keep in sync with src/styles/global.css
COBALT = (6, 23, 39, 255)      # --bg-primary #061727
BLAZE = (255, 194, 14, 255)    # --accent    #FFC20E

# A bold grotesque stands in for Archivo, which isn't installed system-wide.
# At favicon sizes the difference is invisible. Falls back across platforms.
FONT_CANDIDATES = [
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")

# 8x supersample, then downsample with LANCZOS — keeps the glyph edges clean
# at 16px, where naive rendering turns to mush.
SUPERSAMPLE = 8


def _font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit(
        "No bold font found. Add one to FONT_CANDIDATES for your platform."
    )


def _centered_text(draw, text, font, box_size):
    """Center by the glyph's actual ink bounds, not its font metrics."""
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (box_size - (bbox[2] - bbox[0])) / 2 - bbox[0]
    y = (box_size - (bbox[3] - bbox[1])) / 2 - bbox[1]
    return x, y


def square_mark(size):
    """Rounded Cobalt square with Blaze 'RS'."""
    s = size * SUPERSAMPLE
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.18), fill=COBALT)
    font = _font(int(s * 0.52))
    draw.text(_centered_text(draw, "RS", font, s), "RS", font=font, fill=BLAZE)
    return img.resize((size, size), Image.LANCZOS)


def social_card():
    """1200x630 Open Graph card."""
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), COBALT)
    draw = ImageDraw.Draw(img)

    mark = square_mark(140)
    img.paste(mark, (90, 150), mark)

    title_font = _font(78)
    sub_font = _font(36)
    draw.text((90, 330), "Research Security Toolkit", font=title_font, fill=BLAZE)
    draw.text(
        (90, 430),
        "Canadian research security, without the guesswork.",
        font=sub_font,
        fill=(255, 255, 255, 255),
    )
    return img.convert("RGB")


def main():
    out = os.path.abspath(PUBLIC)
    os.makedirs(out, exist_ok=True)

    square_mark(180).save(os.path.join(out, "apple-touch-icon.png"))
    # Multi-size ICO so 16px tab rendering doesn't downscale a 48px bitmap.
    square_mark(48).save(
        os.path.join(out, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)]
    )
    social_card().save(os.path.join(out, "og-image.png"))

    print("Wrote apple-touch-icon.png, favicon.ico, og-image.png to", out)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Generate the icons**

```bash
python scripts/generate-icons.py
```

Expected: `Wrote apple-touch-icon.png, favicon.ico, og-image.png to <...>/public`

If Pillow is missing: `pip install Pillow`.

- [ ] **Step 4: Look at what you generated**

Open `public/apple-touch-icon.png` and `public/og-image.png` in an image viewer. Confirm:
- The icon is a **dark navy rounded square with yellow "RS"** — no purple anywhere.
- The "RS" is centered and not clipped at any edge.
- The social card reads "Research Security Toolkit" in Blaze with the tagline in white below it.

This is a visual check and it needs human eyes; a script that runs successfully can still produce a misaligned or clipped glyph.

- [ ] **Step 5: Delete the template assets**

```bash
git rm public/favicon.svg public/icons.svg src/assets/vite.svg
```

Expected: three `rm '...'` confirmation lines.

- [ ] **Step 6: Verify the build carries the new icons and none of the old ones**

```bash
npm run build
ls dist
```

Expected in `dist/`: `apple-touch-icon.png`, `favicon.ico`, `og-image.png`, `index.html`, `assets/`, and — until Task 6 — `CNAME`.
Expected **absent**: `favicon.svg`, `icons.svg`.

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-icons.py public/favicon.ico public/apple-touch-icon.png public/og-image.png
git commit -m "$(cat <<'EOF'
feat(brand): replace starter-template icons with the toolkit's own mark

public/favicon.svg was never this project's logo — it is a purple
(#863bff) Figma-exported mark left over from the scaffolding template,
which is what has been showing in browser tabs and bookmarks against a
Cobalt-and-Blaze design system.

public/icons.svg was worse: an unreferenced sprite of Bluesky, Discord,
X, and GitHub icons from the same template. Nothing imports it, but it
lives in public/ so Vite copied it into every deploy. Publishing an
unknown third party's logo and a set of trademarked platform icons on a
university domain is not a question worth leaving open.

Replaced with a mark matching the existing topbar logo — Blaze RS on
rounded Cobalt — as .ico (16/32/48) and a 180px touch icon, plus a
1200x630 social card. scripts/generate-icons.py reproduces all three so
the next size change isn't archaeology.

Also removed the unused src/assets/vite.svg scaffold.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Stop shipping our domain in the build artifact

`public/CNAME` contains `rs.rdmtoolkit.ca`, and everything in `public/` is copied verbatim into `dist/`. If Lakehead builds this repository and deploys the output to GitHub Pages, that file hijacks the custom-domain binding. On their own web server it is merely a confusing stray file — but either way, our hosting arrangement should not be baked into their build.

The fix keeps our deploy working: write the CNAME during the GitHub Actions run instead of carrying it in source.

**Files:**
- Delete: `public/CNAME`
- Modify: `.github/workflows/deploy.yml`
- Modify: `CLAUDE.md` (Project Overview + Base path rows)

- [ ] **Step 1: Remove it from the source tree**

```bash
git rm public/CNAME
```

- [ ] **Step 2: Write it at deploy time instead**

In `.github/workflows/deploy.yml`, find the build job's steps:

```yaml
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

Replace with:

```yaml
      - run: npm ci
      - run: npm run build
      # The custom domain belongs to this deployment, not to the source tree.
      # Anyone else building this repo gets a clean dist/ with no CNAME.
      - name: Write CNAME for the rs.rdmtoolkit.ca deployment
        run: echo "rs.rdmtoolkit.ca" > dist/CNAME
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

- [ ] **Step 3: Verify a local build now produces no CNAME**

```bash
npm run build
ls dist/CNAME
```

Expected: `ls: cannot access 'dist/CNAME': No such file or directory`.

This is the actual assertion of this task — a local build must be domain-free. (The GitHub Actions deploy still gets its CNAME from the new step; that only runs in CI.)

- [ ] **Step 4: Update CLAUDE.md**

Two places reference the old arrangement.

In **Project Overview**, replace:
```markdown
**Purpose**: A React + Vite static site helping Canadian researchers and institutions navigate federal research security policies. Deployed to GitHub Pages at the `rs.rdmtoolkit.ca` custom subdomain (CNAME file in `public/` is copied into the build artifact). No backend — 100% client-side.
```
with:
```markdown
**Purpose**: A React + Vite static site helping Canadian researchers and institutions navigate federal research security policies. No backend — 100% client-side. The build output is host-neutral: the `rs.rdmtoolkit.ca` CNAME is written by `.github/workflows/deploy.yml` at deploy time, **not** carried in `public/`, so any other host gets a clean `dist/`.
```

In the **Tech Stack** table, replace the Base path row:
```markdown
| Base path | `/` by default (for the custom subdomain); override with `BASE_PATH=/RSToolkit/` for the legacy project-pages URL. See `vite.config.js`. |
```
with:
```markdown
| Base path | `/` by default (root/subdomain hosting); set `BASE_PATH=/subdir/` to host under a subdirectory — verified working, rewrites every asset URL. See `vite.config.js` and HANDOFF.md. |
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml CLAUDE.md
git commit -m "$(cat <<'EOF'
build: write CNAME at deploy time instead of shipping it in public/

public/CNAME held rs.rdmtoolkit.ca, and everything in public/ is copied
verbatim into dist/. Anyone else building this repo and deploying to
GitHub Pages would have hijacked the domain binding; on any other host
it was just a confusing stray file. Our hosting arrangement should not
be compiled into someone else's artifact.

The GitHub Actions workflow now writes dist/CNAME after the build, so
the existing deploy is unchanged while a local or third-party build
produces a clean, domain-free dist/.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Rewrite the document head — metadata, icons, and honest security headers

Three separate issues live in `index.html`, and fixing them in one pass avoids three churning rewrites of the same twelve lines.

1. **No page metadata.** No `<meta name="description">`, no Open Graph, no Twitter card, no canonical. A link shared into Teams, email, or social currently previews as a bare URL — for a site whose entire purpose is to be forwarded to researchers, that is a real loss.
2. **Icon links point at the deleted `favicon.svg`.**
3. **Three security protections in the head do nothing.** `X-Content-Type-Options` and `Referrer-Policy` are set via `<meta http-equiv>` — **browsers ignore both in that form**, honouring them only as real HTTP response headers, so they have never been in effect. And CSP's `frame-ancestors 'none'` — the anti-clickjacking directive — is likewise ignored inside a meta CSP; the browser logs `The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element` on **every page load**, which is how this one was caught. The rest of the CSP *is* valid via meta and genuinely works. Leaving inert protections in place is worse than having none, because it reads as protection to anyone reviewing the file.

Also: CSP's `style-src` allows `https://unpkg.com` and `https://cdnjs.cloudflare.com`, but nothing loads from either — Leaflet's CSS is bundled from npm (`import 'leaflet/dist/leaflet.css'` in `NroLookup.jsx`). Dead allowances invite exactly the question you don't want in a security review.

**Files:**
- Modify: `index.html`
- Modify: `CLAUDE.md` (Security headers entry)

- [ ] **Step 1: Confirm the CDN allowances really are dead**

```bash
grep -rn "unpkg\|cdnjs" src index.html
```
Expected: only the two hits inside the CSP meta tag in `index.html` — no `import` or `<link>` anywhere in `src/`.

- [ ] **Step 2: Replace the `<head>`**

Replace everything in `index.html` from `<head>` to `</head>` with:

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Research Security Toolkit</title>
    <meta name="description" content="Free, plain-language tools for Canadian researchers and research administrators navigating federal research security policy — STRAC, NSGRP, Named Research Organizations, Sensitive Technology Research Areas, and export controls. No account required." />

    <!-- Update SITE_URL in src/siteConfig.js and mirror it here when the
         hosting domain changes: static meta tags can't read JS config. -->
    <link rel="canonical" href="https://rs.rdmtoolkit.ca/" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Research Security Toolkit" />
    <meta property="og:title" content="Research Security Toolkit" />
    <meta property="og:description" content="Free, plain-language tools for Canadian researchers navigating federal research security policy — STRAC, NSGRP, NROs, STRAs, and export controls." />
    <meta property="og:url" content="https://rs.rdmtoolkit.ca/" />
    <meta property="og:image" content="https://rs.rdmtoolkit.ca/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Research Security Toolkit — Canadian research security, without the guesswork." />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Research Security Toolkit" />
    <meta name="twitter:description" content="Free, plain-language tools for Canadian researchers navigating federal research security policy." />
    <meta name="twitter:image" content="https://rs.rdmtoolkit.ca/og-image.png" />

    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#061727" />

    <!-- CSP mostly works via a meta tag, so what remains here is real.
         Three things do NOT work this way and have been moved to the web
         server: X-Content-Type-Options and Referrer-Policy (previously inert
         meta tags), and CSP's own frame-ancestors directive, which browsers
         explicitly ignore outside an HTTP header — it was logging a console
         error on every page load. See the "Security headers" section of
         HANDOFF.md for the config the hosting team must apply. -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self' 'unsafe-inline';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com;
      connect-src 'self' https://nominatim.openstreetmap.org;
      font-src 'self' https://fonts.gstatic.com;
      object-src 'none';
      base-uri 'self';
      form-action 'none';
    " />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Inter:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:wght@400;500&display=swap" />
  </head>
```

Note what changed in CSP: `style-src` drops `https://unpkg.com` and `https://cdnjs.cloudflare.com` and keeps `https://fonts.googleapis.com`, which is genuinely used. Everything else is unchanged.

- [ ] **Step 3: Verify the app still runs under the tightened CSP**

This is the step that matters. A too-strict CSP fails *silently* — resources just don't load — so check the console, not just the page.

```bash
npm run dev
```

Open `http://localhost:5173/#nro-lookup` — the heaviest page, and the only one that exercises map tiles, Leaflet's bundled CSS, and the Nominatim geocoding endpoint.

Confirm:
1. Map tiles render (CartoDB, `img-src`).
2. Map controls and markers are correctly styled — proves Leaflet's bundled CSS loaded and the removed CDN allowances were genuinely unused.
3. Fonts render as Archivo/Inter, not a fallback serif (`style-src` + `font-src`).
4. The browser console shows **no `Content Security Policy` violation messages** and no errors.
5. Specifically confirm the console no longer logs `The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element`. That error fired on every page load before this task and is the reason `frame-ancestors` was moved to the server-header list.

Then visit `http://localhost:5173/` and confirm the tab icon is the new Blaze "RS" mark, not a purple logo. Hard-refresh if the old icon is cached.

Stop the dev server.

- [ ] **Step 4: Verify production build and its head**

```bash
npm run build
for tag in 'name="description"' 'rel="canonical"' 'og:title' 'og:image' 'twitter:card' 'apple-touch-icon' 'rel="icon"' 'theme-color'; do
  grep -q "$tag" dist/index.html && echo "OK       $tag" || echo "MISSING  $tag"
done
```
Expected: `OK` on all eight.

Then confirm the removals actually took. Match the *tag and directive forms*, not the bare names — the explanatory comment in the new head deliberately names all three removed protections, so a plain substring grep returns hits from the prose and looks like a failure:

```bash
grep -cE "http-equiv=\"(X-Content-Type-Options|Referrer-Policy)\"|frame-ancestors '|unpkg\.com|cdnjs\.cloudflare\.com|favicon\.svg" dist/index.html
```
Expected: `0`.

The strongest check is the running page, not the file. Load it and read the console: before this task the browser logged `The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element` on every load. Afterwards a **freshly opened tab** must show no errors at all. Use a new tab rather than reloading — the console buffer retains history across reloads and will keep replaying the old error, which reads as a failed fix when it isn't.

- [ ] **Step 5: Update the CLAUDE.md security headers entry**

Replace the `**Security headers**` bullet:

```markdown
- **Security headers**: `index.html` includes a `Content-Security-Policy` meta tag restricting scripts to `self + unsafe-inline`, images to self + CartoDB tile domains. `connect-src` allows `'self'` plus `https://nominatim.openstreetmap.org` (required for the NRO proximity search geocoding panel). Also includes `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.
```

with:

```markdown
- **Security headers**: `index.html` carries a `Content-Security-Policy` meta tag — scripts `self + unsafe-inline`, images self + CartoDB tiles, `connect-src` self + `https://nominatim.openstreetmap.org` (NRO proximity geocoding), fonts + styles + Google Fonts. Most CSP directives are honoured via `<meta http-equiv>`, so what remains there is genuinely in effect. **Three things were not and have been moved to the web server config**: `X-Content-Type-Options` and `Referrer-Policy` (browsers only honour those as real HTTP response headers — as meta tags they did nothing at all), and CSP's own **`frame-ancestors`**, which browsers explicitly ignore outside an HTTP header and which was logging `The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element` to the console on every page load. See the Security headers section of HANDOFF.md for what the hosting team must set (including HSTS). **Do not re-add any of the three as meta tags** — they cannot work there. `style-src` lists only what is actually loaded: Leaflet's CSS is bundled from npm, so the old `unpkg.com` / `cdnjs.cloudflare.com` allowances were removed as dead.
```

- [ ] **Step 6: Commit**

```bash
git add index.html CLAUDE.md
git commit -m "$(cat <<'EOF'
feat(head): add page metadata, wire new icons, drop inert security headers

Three things, all in the same twelve lines of <head>.

Metadata: there was no description, no Open Graph, no Twitter card, no
canonical. A link to this site previewed as a bare URL — poor for a tool
whose whole distribution model is being forwarded to researchers.

Security headers: three protections in the head were doing nothing.
X-Content-Type-Options and Referrer-Policy were <meta http-equiv> tags,
which browsers ignore in that form. CSP's frame-ancestors — the
anti-clickjacking directive — is likewise ignored inside a meta CSP, and
was logging a console error on every page load, which is how it surfaced.
None of the three has ever been in effect. Removed rather than left
looking like protection; HANDOFF.md now tells the hosting team to set all
three (plus HSTS) as real HTTP response headers. The rest of the CSP
stays as meta — those directives browsers do honour.

Also dropped unpkg.com and cdnjs.cloudflare.com from style-src. Nothing
loads from either; Leaflet's CSS is bundled from npm. Verified the map,
its controls, and the fonts all still render clean under the tightened
policy with no CSP violations in console.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Add robots.txt

Trivial, expected on any public site, and its absence is the kind of thing that shows up in a hosting team's pre-launch checklist. No sitemap: hash routing means every tool lives at the same real URL (`/`), so a sitemap would list exactly one entry and mislead more than it helps.

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create the file**

Create `public/robots.txt`:

```
# Research Security Toolkit
# Public reference content — crawling is welcome.
#
# No sitemap: the site uses hash-based routing, so every tool is served
# from the same URL (/#tool-slug). A sitemap would list one entry.

User-agent: *
Allow: /
```

- [ ] **Step 2: Verify it lands in the build**

```bash
npm run build
cat dist/robots.txt
```
Expected: the file contents printed above.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "$(cat <<'EOF'
feat: add robots.txt

Expected on any public site and cheap. Deliberately no sitemap.xml —
hash routing means every tool is served from /, so a sitemap would carry
a single entry and imply structure that isn't there.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3 — Documentation

> Docs come last on purpose: they describe the repository's final state, so writing them earlier means rewriting them.

### Task 9: Rewrite the README

The current README misleads in four ways. Its live-site link points at the legacy `seawaydigital.github.io/RSToolkit` URL. Its tool inventory is missing three tools shipped since it was written — Dual-Use Research Guide, Research Travel Security, and Report a Concern — so it advertises 12 tools when there are 15. **Three of its data-source links are dead** (verified 404: the STRAC, NRO, and STRA `guidelines-and-tools-universities-researchers-and-sponsors` paths, which science.gc.ca moved to `guidelines-and-tools-implement-research-security`); the app's copies were fixed during the accessibility pass and the README's were missed. And it has no deployment section beyond `npm run build`, which is precisely what the receiving team needs most.

**Files:**
- Modify: `README.md` (full replacement)

- [ ] **Step 1: Confirm the dead links before fixing them**

```bash
for u in \
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-and-affiliations-concern" \
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/named-research-organizations" \
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-areas"; do
  printf '%s  %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' -L --max-time 25 -A 'Mozilla/5.0' "$u")" "$u"
done
```
Expected: `404` on all three.

- [ ] **Step 2: Replace README.md entirely**

```markdown
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
```

- [ ] **Step 3: Verify every link in the new README resolves**

```bash
grep -oE 'https?://[^)]+' README.md | sort -u | while read -r u; do
  printf '%s  %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' -L --max-time 25 -A 'Mozilla/5.0' "$u")" "$u"
done
```

Expected: `200` for every URL. If any `www.canada.ca` URL reports `000`, that is the network blocking curl, not a dead link — confirm those in a browser instead.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): correct the inventory, the links, and add deployment

Four problems, all of which would have reached the receiving team:

- Live-site link still pointed at the legacy github.io project-pages URL
- Inventory listed 12 tools; there are 15. Dual-Use Research Guide,
  Research Travel Security, and Report a Concern were all missing
- Three data-source links were dead (verified 404). science.gc.ca moved
  guidelines-and-tools-universities-researchers-and-sponsors to
  guidelines-and-tools-implement-research-security; the app's copies were
  fixed during the accessibility pass and the README's were missed
- No deployment guidance at all, which is what a hosting team needs most

Added deployment and configuration sections, and verified every link in
the rewritten file resolves.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Correct CLAUDE.md's directory structure

CLAUDE.md's Directory Structure lists the three flowchart wrappers under `src/tools/policy-guides/`. They are actually in `src/tools/flowcharts/` — as `App.jsx:13-15` imports confirm. CLAUDE.md is loaded at the start of every session and calls itself "the authoritative project reference", so a wrong path there sends every future contributor to a directory that doesn't contain the file.

**Files:**
- Modify: `CLAUDE.md` (Directory Structure block)

- [ ] **Step 1: Confirm the real locations**

```bash
ls src/tools/policy-guides src/tools/flowcharts
```
Expected: `policy-guides/` contains only `TriAgencyGuide.jsx`; `flowcharts/` contains `NsgrpFlowchart.jsx`, `OntarioFlowchart.jsx`, `StracFlowchart.jsx`.

- [ ] **Step 2: Fix the structure block**

In `CLAUDE.md`, inside the Directory Structure code block, replace:

```
    policy-guides/
      TriAgencyGuide.jsx         # 3-tab: Overview / 10 Principles / Key Policies
      StracFlowchart.jsx         # FlowchartViewer wrapper
      NsgrpFlowchart.jsx         # FlowchartViewer wrapper
      OntarioFlowchart.jsx       # FlowchartViewer wrapper
```

with:

```
    policy-guides/
      TriAgencyGuide.jsx         # 3-tab: Overview / 10 Principles / Key Policies
    flowcharts/                  # Nav category is "Policy Guides"; the files live here
      StracFlowchart.jsx         # FlowchartViewer wrapper
      NsgrpFlowchart.jsx         # FlowchartViewer wrapper
      OntarioFlowchart.jsx       # FlowchartViewer wrapper
```

- [ ] **Step 3: Add a note about the split**

The mismatch exists because the *navigation category* ("Policy Guides") and the *directory* (`flowcharts/`) legitimately differ. Say so, so nobody "fixes" it by moving files. Add to Key Decisions & Conventions, immediately after the `**No backend**` bullet:

```markdown
- **Nav category ≠ directory for flowcharts**: the three flowchart tools appear under the **Policy Guides** category in `toolRegistry.js` but their components live in `src/tools/flowcharts/`, not `src/tools/policy-guides/`. This is deliberate — they share `FlowchartViewer` and are grouped by implementation, while the sidebar groups by what a user is looking for. Don't "fix" it by moving the files.
```

- [ ] **Step 4: Verify no other stale paths**

```bash
grep -n "policy-guides/" CLAUDE.md README.md
```
Expected: only the corrected `policy-guides/` line in CLAUDE.md's structure block, containing just `TriAgencyGuide.jsx`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(claude): fix the flowchart directory paths

CLAUDE.md listed StracFlowchart, NsgrpFlowchart, and OntarioFlowchart
under src/tools/policy-guides/. They are in src/tools/flowcharts/ — see
the App.jsx lazy imports. This file is loaded at the start of every
session and calls itself the authoritative reference, so the wrong path
sends every future contributor to the wrong directory.

Also documented why nav category and directory differ here, so nobody
resolves the mismatch by moving files: the sidebar groups by what a user
is looking for, the directory groups by shared FlowchartViewer usage.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Replace the stale handoff notes with a real handoff document

`.claude/HANDOFF.md` is committed, dated **2026-04-15**, and describes the session that built NRO proximity search. It reads like *the* handoff document and isn't one — it will be the first thing a curious engineer opens and the last thing that helps them. Its two pieces of durable value (the NRO data caveats, the unwired map highlight) get carried forward rather than lost.

**Files:**
- Delete: `.claude/HANDOFF.md`
- Create: `HANDOFF.md` (repository root, where a receiving team will actually look)

- [ ] **Step 1: Remove the stale file**

```bash
git rm .claude/HANDOFF.md
```

- [ ] **Step 2: Create the real handoff document**

Create `HANDOFF.md` at the repository root:

```markdown
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
```

- [ ] **Step 3: Verify the internal links resolve to real files**

```bash
for f in README.md CLAUDE.md ACCESSIBILITY.md src/data/toolRegistry.js src/siteConfig.js src/components/layout/SiteFooter.jsx .github/workflows/deploy.yml; do
  test -f "$f" && echo "OK   $f" || echo "MISSING  $f"
done
```
Expected: `OK` for all seven.

- [ ] **Step 4: Commit**

```bash
git add HANDOFF.md
git commit -m "$(cat <<'EOF'
docs: replace stale session notes with a real handoff guide

.claude/HANDOFF.md was dated 2026-04-15 and described the session that
built NRO proximity search. It read like the handoff document and was
not one — the first thing a new engineer would open and the least
helpful. Removed, with its two durable pieces (the NRO data caveats and
the unwired map-pin highlight) carried into the new document's known-gaps
section rather than lost.

The new HANDOFF.md is at the repo root where a receiving team will look,
and covers build, subdirectory hosting, the three config values, the
security headers that must be set server-side, the three third-party
runtime services and how to remove each, what the accessibility work
guarantees, per-file content currency with five files honestly flagged
as needing verification, and an inventory of known gaps.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4 — Final verification

### Task 12: Full-site regression pass

Every preceding task verified its own change. This task verifies they didn't interact badly — and it is the last chance to catch something before the repository leaves your hands.

**Files:** none modified (unless a defect is found)

- [ ] **Step 1: Clean-room install and build**

Prove the repository builds from nothing but what's committed — not from a `node_modules` that accumulated state during the plan.

```bash
rm -rf node_modules dist
npm ci
npm run build
```
Expected: `npm ci` completes, `✓ built in <n>s`, exit 0.

- [ ] **Step 2: All three gates**

```bash
npm run lint
```
Expected: exit 0, `0 errors` (3 intentional warnings).

```bash
npm audit
```
Expected: `found 0 vulnerabilities`.

```bash
ls dist
```
Expected: `index.html`, `assets/`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png`, `robots.txt`.
Expected **absent**: `CNAME`, `favicon.svg`, `icons.svg`.

- [ ] **Step 3: Walk every route in a browser**

```bash
npm run dev
```

Visit all 15 routes and confirm each renders with **no console errors**:

```
#tri-agency-guide   #strac-flowchart    #nsgrp-flowchart    #ontario-flowchart
#stra-lookup        #nro-lookup         #risk-checklist     #risk-mitigation
#dual-use           #export-control     #glossary           #faq
#cybersecurity-guide #travel-security   #report-concern
```

Plus `/` (home) and one nonexistent route (`#does-not-exist`) — the latter should fall back to the home page without error.

While you're there, confirm the things this plan actually changed:
- Browser tab icon is the Blaze "RS" mark on navy (hard-refresh if a purple icon is cached)
- Tab title changes per route — e.g. `NRO Lookup & Map — Research Security Toolkit`
- Footer shows the accessibility statement with a working `mailto:`
- Map renders tiles and styled controls on `#nro-lookup`
- Fonts are Archivo/Inter, not fallback serif

- [ ] **Step 4: Verify the subdirectory build one more time**

The most likely thing to break silently under all these `<head>` changes.

Windows PowerShell:
```powershell
$env:BASE_PATH = '/research-security/'; npx vite build --outDir dist-subdir; $env:BASE_PATH = $null
```

macOS/Linux:
```bash
BASE_PATH=/research-security/ npx vite build --outDir dist-subdir
```

Then:
```bash
grep -oE '(src|href)="/[^"]*"' dist-subdir/index.html
```
Expected: every local path prefixed `/research-security/` — the JS bundle, the CSS, `favicon.ico`, `apple-touch-icon.png`. External URLs (Google Fonts, the absolute `og:image`) are correctly untouched.

Clean up:
```bash
rm -rf dist-subdir
```

- [ ] **Step 5: Confirm nothing host-specific survives in source**

```bash
grep -rn "seawaydigital\|rdmtoolkit" src/ index.html public/ 2>/dev/null
```

Expected — exactly three hits, all intentional:
1. `src/siteConfig.js` — `ACCESSIBILITY_CONTACT` (documented, Lakehead changes it)
2. `src/siteConfig.js` — `SITE_URL` (documented, Lakehead changes it)
3. `src/components/layout/Sidebar.jsx` — the sister-site `href`, gated behind `SHOW_SISTER_SITE_CARD`

Plus the canonical/`og:` URLs in `index.html`, which HANDOFF.md §3b explicitly tells them to update. **Any other hit is a leak — fix it before finishing.**

- [ ] **Step 6: Commit anything the pass turned up**

If Steps 1–5 were clean, there is nothing to commit and this plan is done.

If you found and fixed a defect:

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix: <what the regression pass found>

Found during the full-site verification pass.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Out of Scope

Named explicitly so nobody has to guess whether they were forgotten.

| Not doing | Why |
|---|---|
| **Adding a test framework** | Real value, but it is not handoff-readiness work and would dwarf this plan. Recorded in HANDOFF.md §8 as a known gap. |
| **Re-verifying the five stale content files** | `exportControlData`, `riskChecklist`, and the three flowcharts (all `2025-01-24`) derive from policy documents, so verification means reading current policy — subject-matter work, not engineering. Their status is honestly recorded in HANDOFF.md §7 rather than papered over with a bumped date. |
| **Wiring the NRO map pin highlight** | A feature, not a fix. Recorded in HANDOFF.md §8. |
| **Self-hosting Google Fonts** | Only needed if Lakehead's policy forbids third-party CDNs. HANDOFF.md §5 documents how. |
| **Moving CSP to an HTTP header** | Requires their server config, which we don't have. HANDOFF.md §4 gives them the policy to apply. |
| **Adding Lakehead branding to the UI** | Genuinely their decision. HANDOFF.md §3c points at the right file. |
| **Correcting the three NRO city labels** | Coordinates are already correct; labels are cosmetic. Recorded in HANDOFF.md §8. |

---

## Task Summary

| # | Task | Gate |
|---|---|---|
| 1 | Make `npm run lint` exit clean | `npm run lint` → 0 errors |
| 2 | Patch the 6 dependency advisories | `npm audit` → 0 vulnerabilities |
| 3 | Package identity + LICENSE | `npm run build` passes |
| 4 | Create `src/siteConfig.js` | Toggle exercised both ways |
| 5 | Replace starter-template icons | New icons in `dist/`, old ones gone |
| 6 | CNAME written at deploy time | `dist/CNAME` absent locally |
| 7 | Head metadata + honest security headers | No CSP violations in console |
| 8 | robots.txt | Present in `dist/` |
| 9 | Rewrite README | Every link returns 200 |
| 10 | Fix CLAUDE.md paths | Paths match `ls` |
| 11 | Real HANDOFF.md | All internal links resolve |
| 12 | Full regression pass | All three gates + 15 routes clean |
