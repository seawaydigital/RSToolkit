# Accessibility (AODA / WCAG 2.0 AA) — Handoff & Testing Guide

> Status as of 2026-08-14. This file records the WCAG 2.0 AA remediation work:
> the original pass (PR seawaydigital/RSToolkit#12) and the **second audit**
> below, which covered the tools added afterwards (Dual-Use Guide, Cybersecurity
> Guide, reworked flowcharts). For the durable engineering conventions, see the
> **Accessibility** entry in [CLAUDE.md](CLAUDE.md).

**AODA note**: Ontario's IASR requires **WCAG 2.0 Level AA**. Criteria cited as
2.1-only below (1.4.10 Reflow, 1.4.11 Non-text Contrast, 4.1.3 Status Messages)
are tracked as good practice, not as AODA obligations.

The Research Security Toolkit targets **WCAG 2.0 AA**, the conformance level the
Accessibility for Ontarians with Disabilities Act (AODA) references for web
content. This document records what was remediated, what is automatically
guarded against regression, and the manual checks a human still needs to run.

---

## 1. What was remediated (code-level, done)

| Area | Change | WCAG criterion |
|---|---|---|
| Topbar logo | `<span onClick>` → real `<button>` with accessible name | 2.1.1, 4.1.2 |
| Skip link | "Skip to main content" added as first focusable element; focuses `<main>` without disturbing the hash router | 2.4.1 |
| Focus indicators | Global `:focus-visible` outline; restored rings on the 3 inputs that had `outline: none` | 2.4.7 |
| Search modal | `role="dialog"` + `aria-modal`, labelled input, Tab focus trap, focus return to trigger, `aria-live` result count | 4.1.2, 2.4.3, 3.3.2, 2.1.2 |
| STRA wizard modal | `role="dialog"`, Escape-to-close, backdrop close via `target===currentTarget` | 4.1.2, 2.1.1 |
| NRO proximity suggestions | clickable `<li>` → real `<button>` | 2.1.1 |
| Mobile sidebar backdrop | clickable `<div>` → real `<button>` (Close menu) | 2.1.1 |
| Accordions | ExportControl exposes `aria-expanded` (others already did) | 4.1.2 |
| Flowchart SVG | `role="img"` + label pointing to Guided Mode (keyboard-accessible equivalent) | 1.1.1 |
| Colour contrast | `--text-muted` `#7d98b0`→`#93acc2`, `--red` `#e05a44`→`#e86a54` to clear 4.5:1 on the lightest surface | 1.4.3 |
| Motion | `prefers-reduced-motion: reduce` honored globally | 2.3.3 |
| Headings | Error page heading corrected `h2`→`h1`; per-page hierarchy verified | 1.3.1 |

## 1b. Second audit — 2026-08-14 (code-level, done)

Covers the tools that landed after the first pass. Contrast figures are
**measured from the rendered DOM** (computed colour vs. the real composited
background), not read off the stylesheet — which is how the `-subtle` tint
failures below were missed the first time.

| Area | Finding | Fix | WCAG |
|---|---|---|---|
| STRA Lookup "guided assessment" button | white on `--purple` — **2.77:1** | dark `#061727` text; `--purple` `#a892c4`→`#b9a6d2` | 1.4.3 |
| NO buttons, "Likely dual-use" badge | `--red` on `--red-subtle` — **4.28:1** | `--red` `#e86a54`→`#f2998c`, `--red-subtle` rgb tracks it | 1.4.3 |
| NRO map cluster counts | white on cluster fill — **2.28:1** (Iran green), 3.68:1 (China blue) | dark `#061727` count text + light text-shadow | 1.4.3 |
| `--red` / `--purple` tokens | 3.69:1 / 4.22:1 on `--bg-elevated` — the old CLAUDE.md claim that red cleared AA there was wrong | token values raised; claim corrected | 1.4.3 |
| Tri-Agency, Cybersecurity, Dual-Use tabs | plain `<button>`s — active state lived only in a CSS class, so AT could not tell which tab was current | shared `Tabs.jsx`: `role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, roving tabindex + Arrow/Home/End | 4.1.2, 2.1.1 |
| Every route | `document.title` never changed — all 13 tools reported "Research Security Toolkit" | title set per route in `App.jsx` | **2.4.2 (Level A)** |
| Every route | focus stayed on the activated sidebar link; no signal the view changed | focus moves to `#main-content` on navigation | 2.4.3 |
| NRO sanctions tiers | `aria-controls` pointed at unmounted panels (dangling IDREF) while collapsed | set only while expanded | 4.1.2 |

Also fixed in the same pass (not accessibility, found while verifying):
**5 dead external links** — three science.gc.ca policy pages (the site moved
`guidelines-and-tools-universities-researchers-and-sponsors` →
`guidelines-and-tools-implement-research-security`), the PSPC Controlled Goods
page, and the 2023 U15 guide PDF (replaced with the June 2026 edition). All 38
external links now resolve 200. Two inline text links used `var(--accent)`,
which CLAUDE.md reserves for interactive UI — switched to `var(--link)`.

## 1c. Accessibility statement + footer landmark — 2026-09-02

The site previously had **no `contentinfo` landmark at all** and no accessibility
statement or feedback contact. AODA's Information and Communications standards
expect an organisation to provide accessible formats and a feedback process on
request, so a public-facing Ontario site should say so and give people a way to
ask.

`SiteFooter.jsx` now renders as a sibling of `.app-body` — **outside `<main>`**,
which is what makes it a real `contentinfo` landmark (a `<footer>` nested inside
`main` maps to nothing). It states the WCAG 2.0 AA target and links a contact
address for reporting a barrier or requesting another format.

> **Confirm the contact address before launch.** It currently points at
> `andrew@seawaydigital.ca`, taken from git config. If accessibility requests
> should route somewhere else, change it in `SiteFooter.jsx`.

Landmark structure is now banner / navigation / main / contentinfo, one of each.

### Equivalent-alternative decisions
- **NRO Leaflet map**: the on-page **data table** is the conformant keyboard/
  screen-reader equivalent to the interactive map. Keep the table complete and
  in sync with the map data.
- **Flowcharts**: **Guided Mode** (card stepper) is the keyboard/AT-accessible
  equivalent of the visual Full View SVG.

---

## 2. Automated regression guard

`eslint-plugin-jsx-a11y` (flat `recommended`) runs via `npm run lint`. It fails
on new accessibility regressions (e.g. an interactive `<div>` without a role and
keyboard handler).

```bash
npm run lint
```

Expected: **0 `jsx-a11y` errors.** (There are 10 pre-existing, unrelated
`no-unused-vars` errors and a few `react-hooks/set-state-in-effect` *warnings* —
these are not accessibility issues and do not affect the a11y gate.)

Automated tooling catches roughly 30% of issues. The manual checks below cover
the rest and are required before declaring AODA conformance.

---

## 3. Manual testing checklist (human required)

Run these against a production build:

```bash
npm run build && npm run preview
# open the printed http://localhost:4173 URL
```

### 3a. Keyboard-only navigation (no mouse)
Unplug/ignore the mouse and use **Tab / Shift+Tab / Enter / Space / Esc / arrow keys**.

- [ ] On load, the **first Tab** reveals the "Skip to main content" link; pressing Enter moves focus into the main content.
- [ ] Every interactive element shows a **visible focus ring** (yellow outline) when focused.
- [ ] Tab order is logical top-to-bottom, left-to-right; nothing is reached that shouldn't be, nothing is skipped.
- [ ] The topbar **RS Toolkit** logo is focusable and Enter returns to Home.
- [ ] **Ctrl/Cmd+K** opens search. Focus lands in the input. Tab cycles **within** the dialog (does not escape to the page). **Esc** closes it and focus returns to the search button.
- [ ] Sidebar category headers expand/collapse with Enter/Space; tool links activate with Enter.
- [ ] On a narrow window (<768px), the hamburger opens the sidebar; the backdrop is focusable as a "Close menu" button and Enter closes it.
- [ ] **STRA Lookup** → "Start guided assessment": the wizard opens, is keyboard-operable, and **Esc** closes it.
- [ ] **Risk Checklist**: the 3-state toggles are reachable and operable by keyboard.
- [ ] **NRO Lookup**: the proximity "institution" suggestions are reachable as buttons and selectable by keyboard. The data table is fully keyboard-navigable (the map itself may not be — that's expected; the table is the equivalent).
- [ ] **Flowcharts**: switch to **Guided Mode** and confirm the full decision flow can be completed with the keyboard.
- [ ] **Tabbed tools** (Tri-Agency, Cybersecurity, Dual-Use, Travel Security): Tab reaches the tab strip **once**, then Left/Right arrows move between tabs, Home/End jump to first/last, and the panel below updates. Tab again moves *past* the strip into the panel content.

### 3b. Screen reader
Use **NVDA** (Windows, free — nvaccess.org) or **VoiceOver** (Mac: Cmd+F5).

- [ ] Page landmarks are announced: a banner/header, a navigation, a main region, and a contentinfo/footer.
- [ ] Navigating to a tool announces the new page (focus lands in `main`), and the browser tab/window title changes to that tool's name.
- [ ] Tabs announce as "tab, selected, N of M" and the panel is associated with its tab.
- [ ] The logo button announces as "Research Security Toolkit — go to home, button".
- [ ] Search dialog announces as a dialog; the input has a label; the result count is announced as results change.
- [ ] Accordion headers announce expanded/collapsed state.
- [ ] Flowchart SVG announces its label and points the user to Guided Mode.
- [ ] Icon-only buttons (hamburger, search, modal close) announce a meaningful name, not "button" alone.
- [ ] No meaningful content is silent or read as gibberish.

### 3c. Zoom & reflow (1.4.4 / 1.4.10)
In the browser, zoom to **200%**, then **400%** (Ctrl/Cmd + `+`).

- [ ] At 200%, all text and controls remain usable with no loss of content.
- [ ] At 400%, content reflows to a single column without horizontal scrolling (except genuinely 2-D content like the map and the wide flowchart SVG, which may scroll).
- [ ] The wide flowchart page (`tool-page--wide`) does not clip its side panel or controls.

### 3d. Colour contrast (spot check)
Use a contrast checker (browser DevTools "Inspect" shows contrast on text nodes, or WebAIM's checker).

- [ ] Body, secondary, and muted text all meet **4.5:1** against their background.
- [ ] Red status/error text meets 4.5:1 (it was tuned for this).
- [ ] Focus outlines and important borders meet **3:1** (non-text).
- [ ] Verify any **Blaze-yellow button** uses **dark `#061727`** text, never white.

### 3e. Reduced motion
Enable "Reduce motion" in your OS (Windows: Settings → Accessibility → Visual
effects → Animation effects off; Mac: System Settings → Accessibility → Display).

- [ ] Transitions/animations (sidebar slide, backdrop fade, skip-link) are suppressed or near-instant.

---

## 4. Known limitations / out of scope
- The Leaflet map markers are not individually keyboard-focusable by design; the data table is the equivalent (§1).
- **Flowchart Full View nodes** open their detail panel on click only — the SVG `<g>` wrappers are not keyboard-focusable. The SVG is `role="img"` and its label points to **Guided Mode**, which is the keyboard/AT-accessible equivalent of the same content. This is the conforming-alternate-version route, not an oversight; if Full View ever becomes the only way to reach node detail, the nodes must become real focusable controls.
- 10 pre-existing `no-unused-vars` lint errors (unused `onNavigate` props) plus 4 `no-undef` on `process` in `vite.config.js` are unrelated to accessibility and were left as-is.
- Automated colour-contrast checking covered every route and every tab/accordion/wizard state at desktop, 640px (≈200% zoom) and 375px, but cannot judge whether a colour *conveys meaning on its own* (1.4.1) — that stays a human check.
- A formal third-party AODA audit is recommended before any public conformance claim; this pass establishes the baseline and the regression guard.

---

## 5. Maintaining accessibility
- Run `npm run lint` before merging; keep `jsx-a11y` errors at **0**.
- New interactive elements must be real `<button>`/`<a>`, or carry an appropriate role **and** keyboard handler.
- New colours must be contrast-checked against every surface in the ladder
  (`#061727` → `#0b2238` → `#0f2c49` → `#143a5e`) before use.
- Re-run the §3 manual checklist after any significant UI change.
