# Lakehead "Cobalt Dark" UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the Research Security Toolkit's dark theme to Lakehead University colors (Cobalt `#00427A` + Blaze `#FFC20E`) with a clean grotesque-sans typography, keeping all layout and component structure unchanged.

**Architecture:** Pure design-system swap. All brand colors and fonts live in CSS custom properties in `src/styles/global.css` plus the Google Fonts `<link>` in `index.html`. No JSX component hardcodes the old brand colors (verified by grep), so editing the `:root` tokens propagates site-wide. Verification is by `npm run build` + grep assertions (no unit tests apply to pure styling) plus a manual visual check via `npm run dev`.

**Tech Stack:** React 19 + Vite 8, single CSS file with custom properties, Google Fonts.

---

### Task 1: Swap web fonts (Archivo + Inter)

**Files:**
- Modify: `index.html:23`

- [ ] **Step 1: Replace the Google Fonts stylesheet link**

Replace line 23 (the `<link rel="stylesheet" ...>` for Fraunces + Geist + JetBrains Mono) with:

```html
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap" />
```

No CSP change needed — `style-src` and `font-src` already allow `fonts.googleapis.com` / `fonts.gstatic.com`.

- [ ] **Step 2: Verify no Fraunces/Geist reference remains in index.html**

Run: `grep -nE "Fraunces|Geist" index.html`
Expected: no output (exit 1).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "style(brand): load Archivo + Inter web fonts"
```

---

### Task 2: Replace `:root` color and font tokens

**Files:**
- Modify: `src/styles/global.css:8-66` (the `:root` block)

- [ ] **Step 1: Replace the entire `:root` block (lines 8–66)**

Replace the existing `:root { ... }` block with:

```css
:root {
  /* Surfaces — deep cobalt-navy base (Lakehead Cobalt #00427A derived) */
  --bg-primary: #061727;
  --bg-secondary: #0b2238;
  --bg-tertiary: #0f2c49;
  --bg-card: #0b2238;
  --bg-card-hover: #0f2c49;
  --bg-elevated: #143a5e;

  /* Brand cobalt — active nav, focus field backgrounds */
  --cobalt: #00427A;

  /* Text — cool near-white on cobalt */
  --text-primary: #eef3f8;
  --text-secondary: #9fb4c9;
  --text-muted: #6b8197;

  /* Accent — Blaze. Primary interactive color and brand accent */
  --accent: #FFC20E;
  --accent-hover: #ffce3a;
  --accent-soft: #ffd866;
  --accent-subtle: rgba(255, 194, 14, 0.12);
  --accent-glow: rgba(255, 194, 14, 0.22);

  /* Gold — folded into Blaze (brand mark) */
  --gold: #FFC20E;

  /* Link — sky-blue for inline links on dark cobalt (Blaze reserved for UI) */
  --link: #6fb2e8;
  --link-hover: #a9d4f8;

  /* Status — semantic (map legend, banners), tuned for cobalt; amber kept
     orange-leaning so it never reads as a Blaze button */
  --green: #5cb87a;
  --green-subtle: rgba(92, 184, 122, 0.15);
  --amber: #f0a836;
  --amber-subtle: rgba(240, 168, 54, 0.15);
  --red: #e05a44;
  --red-subtle: rgba(224, 90, 68, 0.15);
  --purple: #a892c4;

  /* Borders — cobalt-tinted to match the base */
  --border: #143052;
  --border-light: #1d456f;
  --border-strong: #2a5a8c;

  /* Shape & motion */
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.25);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.35);
  --shadow-glow: 0 0 0 1px var(--accent-glow), 0 8px 24px rgba(255,194,14,0.18);

  --topbar-height: 60px;
  --sidebar-width: 268px;

  /* Typography — Archivo grotesque display (Trade Gothic stand-in) + Inter body */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Archivo', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, monospace;
}
```

Note: `--font-serif` is intentionally renamed to `--font-display`; its references are updated in Task 3.

- [ ] **Step 2: Verify old brand tokens are gone from `:root`**

Run: `grep -nE "forest-slate|#e76f51|#d65d3f|Fraunces|Geist" src/styles/global.css`
Expected: line 63's `--font-serif`/Fraunces fallback is now removed; remaining matches (if any) are only the `var(--font-serif)` *usages* fixed in Task 3. There should be NO match for `#e76f51`, `#d65d3f`, `forest-slate`, or `Geist`.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style(brand): swap root tokens to cobalt + blaze palette"
```

---

### Task 3: Update body gradient + font-display references

**Files:**
- Modify: `src/styles/global.css:72-75` (body gradient), and the 6 `var(--font-serif)` usages + 7 `font-variation-settings` lines

- [ ] **Step 1: Retune the `body` radial-gradient overlay (lines ~72–75)**

Replace the `background:` value in the `html, body` rule with:

```css
  background:
    radial-gradient(ellipse 1200px 600px at 80% -10%, rgba(255, 194, 14, 0.05), transparent 60%),
    radial-gradient(ellipse 900px 500px at 10% 100%, rgba(0, 66, 122, 0.10), transparent 60%),
    var(--bg-primary);
```

- [ ] **Step 2: Replace all `var(--font-serif)` with `var(--font-display)`**

There are 6 occurrences (lines ~142, 529, 624, 710, 904, 981). Replace each `font-family: var(--font-serif);` with `font-family: var(--font-display);`.

- [ ] **Step 3: Remove all Fraunces-specific `font-variation-settings` lines**

Archivo does not support the `SOFT`/`opsz` axes. Delete these 7 lines (they are dead once Fraunces is gone):
`font-variation-settings: 'SOFT' 80, 'opsz' 48;` (~148),
`'SOFT' 50, 'opsz' 36;` (~536),
`'SOFT' 30, 'opsz' 96;` (~632),
`'SOFT' 100, 'opsz' 144;` (~639),
`'SOFT' 20, 'opsz' 48;` (~715),
`'SOFT' 20, 'opsz' 36;` (~910),
`'SOFT' 20, 'opsz' 48;` (~986).

Keep all `font-style: italic;` declarations — Archivo has a true italic, and they drive emphasis (e.g. the accented hero word `.home-hero-title em`, `.ec-guide-cta-body em`).

- [ ] **Step 4: Verify no Fraunces remnants remain**

Run: `grep -nE "font-serif|font-variation-settings|Fraunces" src/styles/global.css`
Expected: no output (exit 1).

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "style(brand): point display type at Archivo, retune gradient overlay"
```

---

### Task 4: Build and visual verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build completes with no errors, `dist/` produced.

- [ ] **Step 2: Assert old brand identity is fully gone from shipped source**

Run: `grep -rnE "forest-slate|terracotta|#e76f51|Fraunces|Geist" src/styles/global.css index.html`
Expected: no output (exit 1).

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open the local URL. Confirm:
- Surfaces are deep cobalt-navy; sidebar/cards read cobalt, not green.
- Buttons, active sidebar item, focus rings, accordion toggles, topbar `RS` mark are Blaze yellow.
- Inline text links are sky-blue (not yellow), readable on cobalt.
- Headings render in Archivo; body in Inter (no serif anywhere).
- NRO map: Russia/China/Iran legend + cluster colors UNCHANGED (red/blue/green).
- Checklist/banners: green/amber/red status colors still legible and distinct from Blaze.
- RDM Toolkit sister-site card (bottom-left): gold "RDM" + white "Toolkit" wordmark unchanged.

If any item fails, fix in `global.css` and re-run Steps 1–3.

- [ ] **Step 4: Commit any visual fixes**

```bash
git add src/styles/global.css
git commit -m "style(brand): visual polish fixes from review"
```

(Skip if no fixes were needed.)

---

### Task 5: Update CLAUDE.md design-system docs

**Files:**
- Modify: `CLAUDE.md` (the "Design system (v2 — 2026-04)" bullet under Key Decisions, plus the "Source links" bullet describing `--link`)

- [ ] **Step 1: Replace the design-system bullet**

Update the `**Design system (v2 — 2026-04)**` bullet to `**Design system (v3 — 2026-06)**` and rewrite its token list to describe:
- `--bg-primary: #061727` (deep cobalt-navy base; `body` has subtle Blaze + Cobalt radial-gradient overlays)
- `--cobalt: #00427A` (Lakehead Cobalt — active nav, focus fields)
- `--accent: #FFC20E` (Lakehead Blaze — primary interactive color and brand accent)
- `--link: #6fb2e8` (sky-blue inline links; hover `#a9d4f8`)
- `--font-display: 'Archivo'` (headings/hero/topbar RS mark — Trade Gothic stand-in, replaces Fraunces)
- `--font-sans: 'Inter'` (body, replaces Geist)
- `--font-mono: 'JetBrains Mono'`
- Note fonts load from Google Fonts via `<link>` in `index.html`; CSP already allows the hosts.

- [ ] **Step 2: Update the "Source links" convention bullet**

Change the inline-link guidance: links use `var(--link)` (`#6fb2e8`, sky-blue) with hover `var(--link-hover)` (`#a9d4f8`); `var(--accent)` (Blaze) is reserved for interactive UI (buttons, active states, borders), never plain text links.

- [ ] **Step 3: Verify and commit**

Run: `grep -nE "v3 — 2026-06|#00427A|FFC20E|Archivo|Inter" CLAUDE.md`
Expected: matches present.

```bash
git add CLAUDE.md
git commit -m "docs(claude): update design system to v3 Lakehead cobalt + blaze"
```

---

## Self-Review Notes

- **Spec coverage:** color tokens (T2), gradient (T3-S1), fonts (T1, T2, T3-S2/3), NotRebranded items verified visually (T4-S3), docs (T5). All spec sections covered.
- **No unit tests:** pure styling change; verification is build + grep + manual visual, which is the appropriate test design here.
- **Token naming consistency:** `--font-display` defined in T2, referenced in T3; `--accent`/`--accent-glow` used in `--shadow-glow` both defined in T2.
