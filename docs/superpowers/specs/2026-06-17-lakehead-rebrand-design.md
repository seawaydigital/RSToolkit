# Lakehead "Cobalt Dark" UI Refresh — Design

**Date:** 2026-06-17
**Status:** Approved (design), pending spec review
**Scope:** Site-wide visual refresh of the Research Security Toolkit to align with Lakehead University branding (Cobalt + Blaze). Palette + typography + polish only — no layout, component, copy, or data-structure changes.

## Goal

Make the UI look more professional and on-brand for Lakehead University. Keep the existing dark theme, layout, and component structure; swap the forest-slate/terracotta design system for a cobalt-based dark palette with Blaze as the primary accent, and replace the editorial serif typography with a clean grotesque sans.

**Brand colors (confirmed by user):**
- Cobalt: `#00427A`
- Blaze: `#FFC20E`

## Color System

Replace the `:root` tokens in `src/styles/global.css`.

| Token | New value | Role |
|---|---|---|
| `--bg-primary` | `#061727` | deep cobalt-navy base |
| `--bg-secondary` | `#0b2238` | secondary surface |
| `--bg-tertiary` | `#0f2c49` | raised/hover surface |
| `--bg-card` | `#0b2238` | cards, sidebar |
| `--bg-card-hover` | `#0f2c49` | card hover |
| `--bg-elevated` | `#143a5e` | modals, popovers |
| `--cobalt` (new) | `#00427A` | brand cobalt: active nav item, focus field bg |
| `--accent` | `#FFC20E` (Blaze) | primary interactive: buttons, active states, borders-on-hover, focus rings |
| `--accent-hover` | `#ffce3a` | accent hover |
| `--accent-soft` | `#ffd866` | softened accent |
| `--accent-subtle` | `rgba(255, 194, 14, 0.12)` | accent wash |
| `--accent-glow` | `rgba(255, 194, 14, 0.22)` | glow ring |
| `--gold` | `#FFC20E` | folded into Blaze (brand mark) |
| `--link` | `#6fb2e8` | inline text links (sky-blue) |
| `--link-hover` | `#a9d4f8` | link hover |
| `--text-primary` | `#eef3f8` | primary text (cool near-white) |
| `--text-secondary` | `#9fb4c9` | secondary text |
| `--text-muted` | `#6b8197` | muted text |
| `--border` | `#143052` | default border (cobalt-tinted) |
| `--border-light` | `#1d456f` | lighter border |
| `--border-strong` | `#2a5a8c` | strong border |
| `--green` | `#5cb87a` (status, semantic) | tuned for cobalt |
| `--amber` | `#f0a836` (status, semantic) | nudged orange so it ≠ Blaze button |
| `--red` | `#e05a44` (status, semantic) | tuned for cobalt |

**Key convention (retained from existing codebase):** `--accent` (Blaze) is for interactive UI only; inline text links use `--link` (sky-blue). Yellow text links read like warnings and hurt legibility, so links stay blue.

**Background overlay:** retune the `body` radial-gradient overlays from terracotta/green tints to subtle Blaze + Cobalt tints (low alpha, e.g. `rgba(255,194,14,0.05)` and `rgba(0,66,122,0.08)`).

**Shadows:** `--shadow-glow` updates automatically (references `--accent`/`--accent-glow`).

### Explicitly NOT rebranded
- **NRO map country colors** (`COUNTRY_COLORS` in `NroLookup.jsx`: Russia red, China blue, Iran green) and the cluster `iconCreateFunction` — these are data identity, per CLAUDE.md.
- **Status semantics** (green/amber/red) stay meaningful; only tuned for the cobalt base.
- **RDM Toolkit sister-site card** keeps its own gold (`#facc15`) + white wordmark — peer brand, not Lakehead. Its hover border references `--accent` and will pick up Blaze automatically; that is acceptable.
- **Flowchart node visual style** (decision diamonds, green edges, Yes/No pills) — semantic flowchart coloring, unchanged. (No terracotta/Fraunces present there per grep.)

## Typography — clean sans throughout

Lakehead brand font is Trade Gothic (licensed, not free). Use free stand-ins:
- `--font-display` (new): `'Archivo'` — grotesque, Trade-Gothic-adjacent. Applies everywhere `--font-serif` (Fraunces) is currently used: hero, `.home-section-title`, `.home-scenario-label`, `.tool-page-header h1`, topbar `RS` mark.
- `--font-sans`: `'Inter'` (replaces Geist) for body/UI.
- `--font-mono`: `'JetBrains Mono'` unchanged.
- Remove all `font-variation-settings` Fraunces italic axes (`SOFT`, `opsz`) and any `font-style: italic` tied to the old serif display treatment.

**index.html:** replace the Google Fonts `<link>` (Fraunces + Geist) with Archivo + Inter. CSP `style-src`/`font-src` already allow `fonts.googleapis.com` / `fonts.gstatic.com` — no CSP change needed.

## Polish pass ("professional cleanup")

Within the token swap, tighten consistency (no structural change):
- Unify focus-ring / active-state treatment across buttons, chips, accordion headers, search modal, and the topbar `RS` mark so they all use the Blaze accent consistently.
- Ensure borders use the new cobalt-tinted ladder consistently.
- Verify text contrast on the new cobalt surfaces meets a reasonable bar (WCAG AA for body text).

## Files Touched

- `src/styles/global.css` — all `:root` tokens, `body` gradient, `--font-serif`→`--font-display` references, remove Fraunces variation settings.
- `index.html` — Google Fonts link.
- `CLAUDE.md` — update design-system section (v2 → v3): new tokens, fonts, Blaze/link conventions.

Grep confirms Fraunces / terracotta / `--gold` / forest-slate references exist only in `global.css`, `index.html`, and `CLAUDE.md` — no JSX component hardcodes the old brand colors, so the token swap propagates cleanly.

## Out of Scope
Layout changes, new components, copy changes, map/flowchart structure, data files.

## Success Criteria
- `npm run build` succeeds.
- No forest-slate / terracotta / Fraunces references remain in shipped code (`global.css`, `index.html`).
- Site renders with cobalt surfaces, Blaze interactive accents, sky-blue links, Archivo headings, Inter body.
- Map country colors, status semantics, and the RDM sister-site wordmark are visually unchanged in meaning.
- CLAUDE.md design-system section reflects the new system.
