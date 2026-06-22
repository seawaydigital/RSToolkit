# Dual-Use Research Guide — Design Spec

**Date:** 2026-06-19 (updated 2026-06-22)
**Status:** Implemented — shipped on branch `claude/silly-boyd-891b37` ([PR #14](https://github.com/seawaydigital/RSToolkit/pull/14))
**Author:** Andrew Austin (with Claude Code)

> **Changelog (2026-06-22):** This spec was reconciled with the as-built tool. Two changes
> landed after the original design: (1) the Self-Assessment question tree was simplified to four
> conceptual questions (see §4 — the "what transfers" / "touches STRA" themes were not built as
> questions; the tool routes to those tools instead); (2) an always-visible "How this assessment
> works" logic disclosure was added to the Self-Assessment tab (§4). The Research Security Centre
> external URL was also corrected (the publicsafety.gc.ca path 404s — now points to the live
> canada.ca page).

---

## 1. Purpose

A new toolkit tool that helps Canadian researchers and research administrators **identify
dual-use research, vet collaborators, and run due diligence** — translating the concepts from
Public Safety Canada's *Safeguarding Science* dual-use workshop into an interactive, self-serve
tool.

The tool is a **combined hub**: education + triage + next-steps. It is the connective tissue
between the existing tools (STRA Lookup, NRO Lookup, Export Control, Risk Checklist, and the
STRAC/NSGRP flowcharts) — it explains the *concept* of dual-use and then hands users off to the
authoritative tools for the actual determinations.

**Workshop arc it mirrors:** *Know Your Research → Know Your Partners → Assess the Risk.*

### Non-goals (YAGNI)

- **Not** a STRA-category classifier — STRA Lookup already does that; the self-assessment hands
  off to it.
- **Not** a stateful, persisted checklist — Risk Checklist already owns that pattern; the Due
  Diligence tab is a static, cross-linked action list.
- **Not** legal advice or a "you're cleared" verdict — the tool flags and routes only, always
  deferring to the user's Research Security office.

---

## 2. Placement & Naming

| Property | Value |
|---|---|
| Tool name | **Dual-Use Research Guide** |
| Slug / id | `dual-use` |
| Category | **Compliance Tools** (alongside STRA Lookup, NRO Lookup, Risk Checklist, Risk Mitigation) |
| Component | `src/tools/compliance/DualUseGuide.jsx` |
| CSS prefix | `dual-` |
| Layout | 4-tab tool, following the existing `CybersecurityGuide` (4-tab) / `TriAgencyGuide` (3-tab) pattern |
| `related` tools | `stra-lookup`, `nro-lookup`, `export-control` |

---

## 3. Architecture

Follows the established "Adding a New Tool" recipe in `CLAUDE.md`:

1. **Data** — `src/data/dualUseData.js` (reference content) + `src/data/dualUseWizard.js`
   (assessment question tree).
2. **Component** — `src/tools/compliance/DualUseGuide.jsx`, accepts `{ onNavigate }`.
3. **Registry** — add a `dual-use` entry under the `compliance-tools` category in
   `src/data/toolRegistry.js`.
4. **Lazy import** — add to `TOOL_COMPONENTS` in `src/App.jsx`.
5. **Styles** — add `dual-`-prefixed classes to `src/styles/global.css`.

### Component shape

```
DualUseGuide ({ onNavigate })
├─ tab state: 'assess' | 'areas' | 'vetting' | 'diligence'   (default 'assess')
├─ <div className="tool-page">
│  ├─ tool-page-header (title, description, meta: lastUpdated + hyperlinked source)
│  ├─ tab bar (real <button>s, aria-selected / role="tab"; reuse existing tab pattern)
│  └─ tab panels (role="tabpanel"):
│     ├─ AssessmentTab   — guided wizard, renders dualUseWizard
│     ├─ AreasTab        — civilian-vs-military cards from dualUseData.areas
│     ├─ VettingTab      — red flags + MICE + myths + scenario lessons
│     └─ DiligenceTab    — static action list with cross-link buttons
```

The Assessment tab manages its own wizard state internally (current node id + a back-stack +
the set of accumulated flags), mirroring `FlowchartGuidedMode`'s back-stack approach and the
`StraLookup` wizard renderer. No router params; cross-tool navigation uses the `onNavigate(slug)`
prop.

---

## 4. Tab 1 — Self-Assessment (guided wizard)

**Data file:** `src/data/dualUseWizard.js`, reusing the `straWizard` node shape:

```js
export const dualUseWizard = {
  startQuestion: "q1",
  questions: {
    q1: { text, type: "yesno" | "choice", yes/no | options[] },
    // ...
    "result-...": {
      type: "result",
      title,
      description,
      signal: "likely" | "possible" | "low",   // dual-use signal read (NOT a STRA risk level)
      flags: [ "string indicator", ... ],        // the indicators that fired
      nextSteps: [
        { label, tool?: "<slug>", url?: "<external>" }  // tool => onNavigate; url => external link
      ],
    },
  },
};
```

**As-built question logic** (kept distinct from STRA Lookup's category-enumeration wizard;
4 question nodes → 4 result nodes — the authoritative tree is `src/data/dualUseWizard.js`):

1. **q1** — Could the outputs **advance a military, defence, intelligence, security, or weapons
   capability**, even unintentionally? *Yes → q-partner (step 3); No → q1b (step 2).*
2. **q1b** — Could the outputs **surveil, target, manipulate, or identify vulnerabilities in a
   population** (incl. health, behavioural, or social-science data)? *Yes → q-partner; No → q-stra
   (step 4).*
3. **q-partner** (reached only when q1 or q1b was Yes) — **Partner/funding exposure**:
   international collaborators, foreign funding, or any team member affiliated with / funded by an
   NRO / entity of concern? *Yes → `result-likely-partner`; No → `result-likely-solo`.*
4. **q-stra** (reached only when q1 and q1b were both No) — Does the work develop/advance an
   **emerging technology** (AI, quantum, advanced materials, biotech, advanced sensing, robotics,
   aerospace)? *Yes → `result-possible`; No → `result-low`.*

Note the wizard does **not** ask a "what transfers" or a direct "does this touch STRA/export
controls" question (those were exploratory themes during design); instead it routes users to STRA
Lookup / Export Control for those determinations.

**Result nodes** produce:
- A **signal read** — *Likely dual-use* (two variants: with / without partner exposure) /
  *Possible dual-use — verify* / *Low signal* (with explicit "this is a prompt to do due diligence,
  not a determination or legal advice" hedge).
- A **flag list** — the indicators that fired along the path.
- **Tailored next-steps** — deep-link buttons to STRA Lookup, NRO Lookup, Export Control,
  Risk Checklist, STRAC/NSGRP flowcharts, as relevant.

**Always-visible logic disclosure** (`.dual-howitworks`): the tab opens with a permanently-visible
"How this assessment works" `<section>` (not a collapsed `<details>` — the logic is shared openly to
build user trust). Its content lives in `dualUseData.assessmentLogic` and plainly describes the
intro, the four questions and their routing, what each signal means, and the assessment's
limitations. It **must be kept in sync with `dualUseWizard.js`** whenever the question tree changes.

**Wizard controls:** Yes / No / choice buttons (real `<button>`s), a **Back** button (pops the
back-stack), and a **Start over** reset.

**Print / export:** a **Print summary** button reusing the RiskChecklist `window.print()` +
print-CSS pattern. Printed output is a dated record: the questions answered, the resulting signal,
the flag list, and the recommended next steps — so a researcher can file it as evidence of due
diligence (the workshop's "document your decisions" point). Screen-hidden `.dual-print-*` helpers
become visible under `@media print`, following the `checklist-print-state` convention.

---

## 5. Tab 2 — Dual-Use Areas (explorer)

**Data:** `dualUseData.areas` — an array of cards, each:

```js
{ id, name, civilian: [ ... ], military: [ ... ], note? }
```

Seed areas (from the workshop notes): Computational Fluid Dynamics, Combustion Research,
Materials Science, Medical Research, Chemical/Biological Research, Earth Monitoring,
AI & Big Data, Social Sciences, Quantum Technologies, Life Sciences.

Each card shows **Civilian uses** vs **Military / misuse applications** side-by-side (two-column
on desktop, stacked on mobile).

**Framing callouts** (rendered above/within the grid):
- *"Even well-intentioned research can be weaponized"* — the Australian mousepox example.
- *Myth-buster:* published papers omit failed experiments, detailed methodology, and tacit
  technique — open publication ≠ full transfer.
- Dual-use is **not just STEM** — health data, social sciences, and behavioural studies too.

Cross-link: a button to **STRA Lookup** ("Check your specific area against the STRA list").

---

## 6. Tab 3 — Vetting Collaborators

**Data:** `dualUseData.redFlags`, `dualUseData.mice`, `dualUseData.myths`,
`dualUseData.scenarioLessons`.

Content:
- **Red flags when vetting collaborators** — publications with military/intelligence
  applications; co-authors affiliated with defence/intelligence organizations; publication gaps
  or incomplete records; modified/obscured publication titles hiding military connections;
  affiliation with an entity on Canada's NRO / entities-of-concern list.
- **MICE motivations** — Money, Ideology, Coercion, Ego (counters the "only bad people misuse
  technology" myth).
- **Three research-security myths** — the visa myth, the "only bad people" myth, the
  "it'll be published anyway" myth.
- **Scenario lessons** (from the workshop takeaways doc):
  - An NRO-*funded* grad student counts as a STRAC **affiliation** regardless of intent — and can
    jeopardize the PI's federal-funding eligibility for the whole project. Mitigations: sever
    ties, swap the team member, or restructure so they have no access to federally-funded
    components.
  - Accepting NRO support is **not illegal but is disqualifying** under STRAC — even if outputs
    stay in Canada; past/pre-policy affiliations can still surface.
  - PIs aren't investigators but have a **due-diligence obligation**: check the NRO list, get
    references, have a direct conversation, escalate to the Research Security office.

Cross-links: **NRO Lookup** (primary). External reference: **OpenSanctions** (aggregates 120+
sources) as a screening aid, plus the Global Affairs Canada sanctions index.

---

## 7. Tab 4 — Due Diligence (action list)

**Data:** `dualUseData.diligence` — grouped action items mirroring the workshop's
*Before You Apply / Ongoing Obligations / Collaborations & Partnerships / Mindset* structure.
Each item may carry a cross-link (`tool` slug or external `url`).

Representative actions and their links:
- Assess your research area against STRA → **STRA Lookup** / **STRAC Flowchart**.
- Screen **every** team member (incl. grad students & postdocs) against the NRO list →
  **NRO Lookup**.
- Determine whether STRAC and NSGRP apply → **STRAC / NSGRP Flowcharts**, **Risk Checklist**.
- Check export controls / controlled goods / sanctions → **Export Control**.
- Ensure NRO-affiliated members complete an attestation form (link to official NSGRP RAF page).
- Define IP ownership before any international collaboration; disclose conflicts of interest.
- Document due-diligence decisions and mitigations → can print from the Self-Assessment tab.

**Authoritative regimes referenced** (all hyperlinked):
- Export Controls — Global Affairs Canada (EIPA / Export Control List).
- Controlled Goods Program — Public Services and Procurement Canada.
- Human Pathogens and Toxins Act — Public Health Agency of Canada.
- Sanctions — Global Affairs Canada index.
- **Public Safety Canada Research Security Centre** (Ontario & Nunavut contact for Lakehead).

Static, cross-linked list (no persisted state — defers to Risk Checklist for that).

---

## 8. Data Currency (verified 2026-06-19)

| Figure | Verified value | Source |
|---|---|---|
| STRA top-level categories | **11** | science.gc.ca STRA page, *Date modified 2025-05-07* |
| STRA subcategories | ~80+ (do not hard-cite a count; link the list) | same |
| STRAC policy effective | **2024-05-01** | STRAC policy |
| NRO list | ~100+ PRC, ~10 Iran, ~5–6 Russia (toolkit carries 126; link the live list, don't hard-cite) | science.gc.ca NRO page, *Date modified 2024-04-18* |

**Decision:** Drop the stale "11 areas / **74 subcategories** / **356 entities of concern**"
figures from the workshop notes. Cite **11 STRA categories** (consistent with the toolkit's
`straData.js`) and link the live NRO list + the existing **NRO Lookup** instead of citing a count.

`dualUseData.lastUpdated = "2026-06-19"`; `sourceUrl` → the *Safeguarding Your Research* portal.

---

## 9. Sourcing, Safety & Conventions

- **Attribution:** Public Safety Canada's *Safeguarding Science* program and Government of Canada
  research-security guidance. **Not** attributed to UBC or any single institution.
- **All policy sources hyperlinked** with `var(--link)` (sky-blue) — never plain text, never
  `var(--accent)` (Blaze, reserved for interactive UI).
- **Safety hedge** on every assessment output: prompt for due diligence, not a determination or
  legal advice; consult your Research Security office.
- **Accessibility (WCAG 2.0 AA / AODA):** tabs use `role="tab"`/`role="tabpanel"` with
  `aria-selected` and arrow-key support consistent with existing tabbed tools; all wizard/accordion
  controls are real `<button>`s with `aria-expanded` where applicable; rely on the global
  `:focus-visible` outline; honour `prefers-reduced-motion`. Must pass `npm run lint`
  (`eslint-plugin-jsx-a11y`).
- **Design system:** Lakehead Cobalt + Blaze palette, Archivo/Inter fonts, existing CSS variables.

---

## 10. Source URLs (to hyperlink in the tool)

| Document | URL |
|---|---|
| Safeguarding Your Research portal | https://science.gc.ca/site/science/en/safeguarding-your-research |
| STRAC Policy | https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/policy-sensitive-technology-research-and-affiliations-concern |
| Sensitive Technology Research Areas | https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/sensitive-technology-research-areas |
| Named Research Organizations | https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations |
| NSGRP | https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships |
| NSGRP Risk Assessment Form | https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form |
| Export Controls — Global Affairs Canada | https://www.international.gc.ca/controls-controles/index.aspx |
| Controlled Goods Program — PSPC | https://www.canada.ca/en/public-services-procurement/services/controlled-goods.html |
| Human Pathogens and Toxins Act — PHAC | https://laws-lois.justice.gc.ca/eng/acts/h-5.67/ |
| Global Affairs sanctions index | https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx |
| OpenSanctions | https://www.opensanctions.org/ |
| Research Security Centre (Government of Canada) | https://www.canada.ca/en/services/defence/researchsecurity/about.html |

(External URLs were confirmed during implementation. The original publicsafety.gc.ca Research
Security Centre path returned 404 and was replaced with the live canada.ca page above. The
canada.ca controlled-goods page returns 403/000 to automated fetchers but is live in a browser.)

---

## 11. Files Touched

| File | Change |
|---|---|
| `src/data/dualUseData.js` | **new** — assessmentLogic (the "how it works" disclosure), areas, areaCallouts, redFlags, mice, myths, scenarioLessons, diligence, lastUpdated, sourceUrl |
| `src/data/dualUseWizard.js` | **new** — guided assessment question tree |
| `src/tools/compliance/DualUseGuide.jsx` | **new** — 4-tab component |
| `src/data/toolRegistry.js` | add `dual-use` entry under `compliance-tools` |
| `src/App.jsx` | lazy import into `TOOL_COMPONENTS` |
| `src/styles/global.css` | `dual-`-prefixed styles + print rules |
| `CLAUDE.md` | update Tools Inventory, Directory Structure, Key Decisions |

---

## 12. Testing & Verification

- `npm run lint` passes (a11y gate).
- `npm run build` succeeds.
- Manual: each tab renders; wizard branches + Back + Start over work; print summary reflects
  answers; every cross-link navigates to the right tool; external links open in a new tab with
  `rel="noopener noreferrer"`; keyboard-only tab navigation and focus indicators work.
