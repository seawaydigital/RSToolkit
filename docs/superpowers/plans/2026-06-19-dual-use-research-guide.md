# Dual-Use Research Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Dual-Use Research Guide" tool — a 4-tab hub (self-assessment wizard, dual-use areas explorer, collaborator vetting, due-diligence action list) — to the Compliance Tools category.

**Architecture:** A single lazy-loaded React component (`DualUseGuide.jsx`) driven by two data modules (`dualUseData.js`, `dualUseWizard.js`). Tabs follow the existing `CybersecurityGuide` plain-`<button>` toggle pattern; the assessment wizard reuses the `StraLookup` back-stack pattern (`wizardHistory` array of node ids) but renders inline (not in a modal) and ends with a printable summary using the existing `window.print()` + global print-CSS approach.

**Tech Stack:** React 19, Vite 8, lucide-react icons, plain CSS in `global.css`. **No unit-test runner exists** in this project — per-task verification is `npm run lint` (the `eslint-plugin-jsx-a11y` gate) + `npm run build`, with a final manual check in `npm run dev`. Adding a test framework would be scope creep and is explicitly out of scope.

**Spec:** `docs/superpowers/specs/2026-06-19-dual-use-research-guide-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/data/dualUseData.js` | **new** — static content: `areas`, `redFlags`, `mice`, `myths`, `scenarioLessons`, `diligence`, plus `lastUpdated`/`sourceUrl`/`sourceLabel` |
| `src/data/dualUseWizard.js` | **new** — guided self-assessment question tree (`startQuestion` + `questions{}`) |
| `src/tools/compliance/DualUseGuide.jsx` | **new** — 4-tab component, accepts `{ onNavigate }` |
| `src/styles/global.css` | **modify** — append `dual-`-prefixed styles + print rules |
| `src/data/toolRegistry.js` | **modify** — add `dual-use` tool under `compliance-tools` |
| `src/App.jsx` | **modify** — add `dual-use` lazy import to `TOOL_COMPONENTS` |
| `CLAUDE.md` | **modify** — Tools Inventory, Directory Structure, Key Decisions |

**Build-safe ordering:** data → wizard → component → CSS → registry/App wiring → docs → verify. The component file exists before the lazy import references it, so the build never breaks.

---

## Task 1: Dual-use content data module

**Files:**
- Create: `src/data/dualUseData.js`

- [ ] **Step 1: Create the data module with full content**

Create `src/data/dualUseData.js` with exactly this content:

```js
/**
 * Dual-Use Research Guide content.
 * Sourced from Public Safety Canada's Safeguarding Science dual-use workshop
 * and Government of Canada research-security guidance. Not attributed to any
 * single institution. All policy figures verified 2026-06-19 (see spec).
 */

export const dualUseData = {
  lastUpdated: "2026-06-19",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research",
  sourceLabel: "Safeguarding Your Research (Government of Canada) & Public Safety Canada Safeguarding Science",

  // ── Tab 2: Dual-Use Areas (civilian vs. military/misuse) ──
  areas: [
    {
      id: "cfd",
      name: "Computational Fluid Dynamics (CFD)",
      civilian: ["Bridge design", "Vehicle aerodynamics", "Fuel efficiency"],
      military: ["Naval vessel design", "Fighter jets", "Hypersonic vehicles"],
    },
    {
      id: "combustion",
      name: "Combustion Research",
      civilian: ["Industrial furnaces", "Heating systems"],
      military: ["Jet engines", "Rocket propulsion systems"],
    },
    {
      id: "materials",
      name: "Materials Science",
      civilian: ["Automotive lightweight alloys", "Wind turbine blades"],
      military: ["Aerospace alloys for extended missile range", "Ballistic armour"],
    },
    {
      id: "medical",
      name: "Medical Research",
      civilian: ["Bone scaffolding for medical repairs"],
      military: ["Flexible concrete for hardened bunkers", "Composite armour"],
    },
    {
      id: "chem-bio",
      name: "Chemical / Biological Research",
      civilian: ["Pesticides and herbicides for agriculture"],
      military: ["Chemical warfare agents (similar chemical structures)"],
    },
    {
      id: "earth-monitoring",
      name: "Earth Monitoring",
      civilian: ["Deforestation tracking", "Water management"],
      military: ["Nuclear test-site monitoring", "Missile targeting systems"],
    },
    {
      id: "ai-big-data",
      name: "AI & Big Data",
      civilian: ["Personalized content", "Social analysis"],
      military: ["Targeted misinformation campaigns", "Surveillance"],
    },
    {
      id: "social-sciences",
      name: "Social Sciences",
      civilian: ["PTSD prevention", "Stress management"],
      military: ["Combat training", "Psychological warfare"],
    },
    {
      id: "quantum",
      name: "Quantum Technologies",
      civilian: ["Secure banking", "Precision measurements"],
      military: ["Military communications", "Submarine detection"],
    },
    {
      id: "life-sciences",
      name: "Life Sciences",
      civilian: ["Genetic testing", "Personalized medicine"],
      military: ["Identifying genetic vulnerabilities in populations"],
    },
  ],

  // Framing callouts shown on the Areas tab
  areaCallouts: [
    {
      id: "weaponized",
      title: "Even well-intentioned research can be weaponized",
      body: "Australian researchers studying mouse contraception accidentally engineered a far more lethal variant of the mousepox virus. Intent does not control outcome — the same result could guide misuse of related human pathogens.",
    },
    {
      id: "published-anyway",
      title: "“It will be published openly anyway” is a myth",
      body: "Published papers leave out the parts that make research reproducible: failed experiments, detailed methodology, tacit expertise, and the small techniques that actually make it work. Open publication is not full knowledge transfer.",
    },
    {
      id: "beyond-stem",
      title: "Dual-use is not just STEM",
      body: "Health data, social sciences, and behavioural studies can also be misused — for example, to profile populations, refine psychological operations, or identify vulnerabilities.",
    },
  ],

  // ── Tab 3: Vetting Collaborators ──
  redFlags: [
    "Publications with military or intelligence applications.",
    "Co-authors affiliated with defence or intelligence organizations.",
    "Publication gaps or incomplete publication records.",
    "Modified or incomplete publication titles that obscure military connections.",
    "Affiliation with an organization on Canada's Named Research Organizations / entities-of-concern list.",
  ],

  mice: [
    { letter: "M", label: "Money", body: "Financial incentives." },
    { letter: "I", label: "Ideology", body: "Patriotism or allegiance to another country." },
    { letter: "C", label: "Coercion", body: "Threats to the person or their family." },
    { letter: "E", label: "Ego", body: "Personal satisfaction, recognition, or the thrill of it." },
  ],

  myths: [
    {
      myth: "If a student or researcher has a visa, they aren't a security risk.",
      reality: "Research security requires vigilance from everyone — especially the people who know the field best. A visa is not a vetting outcome.",
    },
    {
      myth: "Only “bad people” misappropriate technology.",
      reality: "Motivations vary (see MICE). Ordinary people can be pressured, incentivized, or ideologically driven without being “bad.”",
    },
    {
      myth: "The information will be published openly anyway.",
      reality: "Papers omit failed experiments, detailed methods, and tacit know-how. The hardest-won knowledge rarely reaches print.",
    },
  ],

  scenarioLessons: [
    {
      id: "nro-student",
      title: "A grad student funded by a Named Research Organization",
      body: "A student receiving funding from an NRO is considered “affiliated” under STRAC — regardless of personal intent or work quality — and that affiliation can jeopardize the PI's federal-funding eligibility for the entire project.",
      mitigations: [
        "Ask the student to sever ties with the NRO.",
        "Select a different team member for the sensitive-area work.",
        "Restructure so the student has no access to federally-funded components.",
      ],
    },
    {
      id: "nro-support",
      title: "Receiving direct support from an NRO",
      body: "Accepting NRO funding is not illegal, but it constitutes a STRAC affiliation that makes the researcher ineligible for federal funding on additional sensitive-area projects — even if the NRO agrees outputs stay in Canada. Past affiliations that predate the policy can still surface in future applications.",
      mitigations: [
        "Evaluate any NRO arrangement with your institution before committing — not after.",
        "Disclose past and present affiliations early.",
      ],
    },
    {
      id: "pi-duty",
      title: "PIs are not investigators — but they have a due-diligence duty",
      body: "A PI's obligation is reasonable diligence, not espionage. Check the NRO list, get references, and have a direct conversation about a collaborator's long-term goals. Escalate to your Research Security office when you need deeper screening.",
      mitigations: [],
    },
  ],

  // ── Tab 4: Due Diligence (grouped action list) ──
  // Each action may carry { tool: "<slug>" } (internal nav) or { url: "<href>" } (external link).
  diligence: [
    {
      id: "before-apply",
      group: "Before You Apply",
      actions: [
        { text: "Assess whether your research area is sensitive or dual-use.", link: { tool: "stra-lookup", label: "STRA Lookup" } },
        { text: "Screen every team member — including grad students and postdocs — against the NRO list.", link: { tool: "nro-lookup", label: "NRO Lookup & Map" } },
        { text: "Determine whether STRAC and NSGRP apply to your project and team.", link: { tool: "strac-flowchart", label: "STRAC Flowchart" } },
        { text: "Run the grant-application risk assessment.", link: { tool: "risk-checklist", label: "Risk Assessment Checklist" } },
        { text: "Ensure anyone with an NRO affiliation completes the NSGRP attestation / Risk Assessment Form.", link: { url: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form", label: "NSGRP Risk Assessment Form" } },
      ],
    },
    {
      id: "ongoing",
      group: "Ongoing Obligations",
      actions: [
        { text: "Disclose conflicts of interest whenever signing agreements with foreign institutions.", link: null },
        { text: "Monitor team affiliations throughout the project — not just at submission.", link: { tool: "nro-lookup", label: "NRO Lookup & Map" } },
        { text: "Track updates to export controls and sanctions lists.", link: { tool: "export-control", label: "Export Control Quick Reference" } },
      ],
    },
    {
      id: "partnerships",
      group: "Collaborations & Partnerships",
      actions: [
        { text: "Define intellectual-property ownership before any international collaboration begins.", link: null },
        { text: "Understand your bilateral context — Canada's relationship with a collaborator's country matters.", link: null },
        { text: "Apply consistent evaluation standards to all collaborators, regardless of country (“agnostic but not ignorant”).", link: null },
        { text: "Seek guidance early — arranging mitigation before submission is far easier than fixing problems after.", link: null },
      ],
    },
    {
      id: "regimes",
      group: "Know the Regulatory Regimes",
      actions: [
        { text: "Export Controls regulate goods, services, and technology (including data on cloud platforms and temporary transfers) leaving Canada — Global Affairs Canada.", link: { url: "https://www.international.gc.ca/controls-controles/index.aspx", label: "Global Affairs Canada — Export Controls" } },
        { text: "The Controlled Goods Program regulates examination, possession, and transfer of certain goods within Canada — Public Services and Procurement Canada.", link: { url: "https://www.canada.ca/en/public-services-procurement/services/controlled-goods.html", label: "Controlled Goods Program (PSPC)" } },
        { text: "The Human Pathogens and Toxins Act governs activities involving human pathogens and toxins — Public Health Agency of Canada.", link: { url: "https://laws-lois.justice.gc.ca/eng/acts/h-5.67/", label: "Human Pathogens and Toxins Act" } },
        { text: "Check sanctions before partnering — Global Affairs Canada sanctions index, and OpenSanctions (aggregates 120+ sources; verify matches against official sources).", link: { url: "https://www.opensanctions.org/", label: "OpenSanctions" } },
      ],
    },
    {
      id: "mindset",
      group: "Mindset & Support",
      actions: [
        { text: "Treat research security as a shared responsibility — not one person's job. Educate your team about dual-use risks.", link: null },
        { text: "Document your due-diligence steps and any mitigations (you can print a record from the Self-Assessment tab).", link: null },
        { text: "When something feels uncertain, contact your Research Security office or Public Safety Canada's Research Security Centre.", link: { url: "https://www.publicsafety.gc.ca/cnt/ntnl-scrt/rsrch-scrt-cntr-en.aspx", label: "Public Safety Canada — Research Security Centre" } },
      ],
    },
  ],
};
```

- [ ] **Step 2: Lint the new file**

Run: `npm run lint`
Expected: PASS (no new errors). If `eslint` reports the file is not yet imported anywhere, that is fine — it lints all files.

- [ ] **Step 3: Commit**

```bash
git add src/data/dualUseData.js
git commit -m "feat(dual-use): add dual-use content data module"
```

---

## Task 2: Self-assessment wizard data module

**Files:**
- Create: `src/data/dualUseWizard.js`

- [ ] **Step 1: Create the wizard question tree**

Create `src/data/dualUseWizard.js` with exactly this content:

```js
/**
 * Dual-Use Research self-assessment question tree.
 * Same node shape as straWizard.js, but deliberately CONCEPTUAL: it probes
 * intent/use, knowledge transfer, and partner exposure — and hands off to
 * STRA Lookup / NRO Lookup / Export Control rather than enumerating STRA
 * categories itself.
 *
 * Question nodes: { text, type: "yesno"|"choice", yes/no | options[] }
 * Result nodes:   { type:"result", signal:"likely"|"possible"|"low", title,
 *                   description, flags:[...], nextSteps:[{label, tool?|url?}] }
 */

export const dualUseWizard = {
  startQuestion: "q1",
  questions: {
    q1: {
      text: "Could the knowledge, data, or technology your research produces meaningfully advance a military, defence, intelligence, security, or weapons capability — even if that is not your intent?",
      type: "yesno",
      yes: "q-partner",
      no: "q1b",
    },
    q1b: {
      text: "Could your research outputs be used to surveil, target, manipulate, or identify vulnerabilities in a population or group — including through health, behavioural, or social-science data?",
      type: "yesno",
      yes: "q-partner",
      no: "q-stra",
    },
    "q-partner": {
      text: "Will the research involve international collaborators, foreign funding, or any team member affiliated with — or funded by — an organization on Canada's Named Research Organizations / entities-of-concern list?",
      type: "yesno",
      yes: "result-likely-partner",
      no: "result-likely-solo",
    },
    "q-stra": {
      text: "Even so, does your research develop or advance an emerging technology — for example AI, quantum, advanced materials, biotechnology, advanced sensing, robotics, or aerospace?",
      type: "yesno",
      yes: "result-possible",
      no: "result-low",
    },

    // ── RESULT NODES ──
    "result-likely-partner": {
      type: "result",
      signal: "likely",
      title: "Likely dual-use, with partner exposure",
      description:
        "Your research could advance a military, intelligence, or population-targeting capability, and your team or funding has potential affiliation exposure. Run the full due-diligence chain before applying for funding or signing agreements.",
      flags: [
        "Potential military / intelligence / population-targeting application",
        "International collaborators, foreign funding, or possible NRO / entity-of-concern affiliation",
      ],
      nextSteps: [
        { label: "Screen your team against the NRO list", tool: "nro-lookup" },
        { label: "Check your area against the STRA list", tool: "stra-lookup" },
        { label: "Check export controls & sanctions", tool: "export-control" },
        { label: "Walk the STRAC policy flow", tool: "strac-flowchart" },
        { label: "Run the grant risk checklist", tool: "risk-checklist" },
      ],
    },
    "result-likely-solo": {
      type: "result",
      signal: "likely",
      title: "Likely dual-use",
      description:
        "Your research could advance a military, intelligence, or population-targeting capability. No collaborator or funding exposure is flagged right now, but re-run this assessment if your team or partners change.",
      flags: [
        "Potential military / intelligence / population-targeting application",
        "No current collaborator or funding exposure identified",
      ],
      nextSteps: [
        { label: "Check your area against the STRA list", tool: "stra-lookup" },
        { label: "Check export controls & sanctions", tool: "export-control" },
        { label: "Run the grant risk checklist", tool: "risk-checklist" },
      ],
    },
    "result-possible": {
      type: "result",
      signal: "possible",
      title: "Possible dual-use — verify",
      description:
        "No obvious military, intelligence, or targeting application surfaced, but your work advances an emerging technology that may still fall under a Sensitive Technology Research Area or export controls. Verify against the authoritative lists.",
      flags: [
        "Emerging-technology research",
        "No obvious military / intelligence use identified in this assessment",
      ],
      nextSteps: [
        { label: "Check your area against the STRA list", tool: "stra-lookup" },
        { label: "Browse the Dual-Use Areas examples", tool: null },
      ],
    },
    "result-low": {
      type: "result",
      signal: "low",
      title: "Low dual-use signal",
      description:
        "Based on your answers, no clear dual-use indicators surfaced. Dual-use concerns are context-dependent and can change — review the Dual-Use Areas examples and consult your Research Security office if anything is uncertain.",
      flags: ["No dual-use indicators identified in this assessment"],
      nextSteps: [
        { label: "Browse the Dual-Use Areas examples", tool: null },
      ],
    },
  },
};
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/data/dualUseWizard.js
git commit -m "feat(dual-use): add self-assessment wizard question tree"
```

---

## Task 3: DualUseGuide component

**Files:**
- Create: `src/tools/compliance/DualUseGuide.jsx`

- [ ] **Step 1: Create the component**

Create `src/tools/compliance/DualUseGuide.jsx` with exactly this content:

```jsx
import { useState } from 'react';
import { dualUseData } from '../../data/dualUseData';
import { dualUseWizard } from '../../data/dualUseWizard';

const TABS = [
  { id: 'assess', label: 'Self-Assessment' },
  { id: 'areas', label: 'Dual-Use Areas' },
  { id: 'vetting', label: 'Vetting Collaborators' },
  { id: 'diligence', label: 'Due Diligence' },
];

const SIGNAL_META = {
  likely: { label: 'Likely dual-use', className: 'dual-signal--likely', glyph: '!' },
  possible: { label: 'Possible dual-use', className: 'dual-signal--possible', glyph: '?' },
  low: { label: 'Low signal', className: 'dual-signal--low', glyph: '✓' },
};

// Given a question node id and the next node id chosen, return the human label
// of the answer the user picked (for the printable trail).
function answerLabelFor(qId, nextId) {
  const q = dualUseWizard.questions[qId];
  if (!q) return '';
  if (q.type === 'yesno') return nextId === q.yes ? 'Yes' : 'No';
  if (q.type === 'choice') {
    const opt = q.options.find(o => o.next === nextId);
    return opt ? opt.label : '';
  }
  return '';
}

export default function DualUseGuide({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('assess');
  const [history, setHistory] = useState([dualUseWizard.startQuestion]);

  const currentId = history[history.length - 1];
  const currentNode = dualUseWizard.questions[currentId];

  function go(nextId) {
    if (!nextId) return;
    setHistory(prev => [...prev, nextId]);
  }
  function back() {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }
  function restart() {
    setHistory([dualUseWizard.startQuestion]);
  }

  // Build the answered-question trail (everything except the final result node)
  const trail = history.slice(0, -1).map((qId, i) => ({
    question: dualUseWizard.questions[qId].text,
    answer: answerLabelFor(qId, history[i + 1]),
  }));

  function renderNextStep(step, i) {
    if (step.tool) {
      return (
        <button key={i} className="dual-nextstep-btn" onClick={() => onNavigate(step.tool)}>
          {step.label} →
        </button>
      );
    }
    // No tool: route to the Areas tab within this guide
    return (
      <button key={i} className="dual-nextstep-btn" onClick={() => setActiveTab('areas')}>
        {step.label} →
      </button>
    );
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Dual-Use Research Guide</h1>
        <p>Identify dual-use research, vet collaborators, and run due diligence — Know Your Research, Know Your Partners, Assess the Risk.</p>
        <div className="tool-page-meta">
          <span>Last updated: {dualUseData.lastUpdated}</span>
          <a href={dualUseData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {dualUseData.sourceLabel}
          </a>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="dual-tabs dual-no-print">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`dual-tab${activeTab === tab.id ? ' dual-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Self-Assessment ── */}
      {activeTab === 'assess' && (
        <div className="dual-tab-content">
          {currentNode.type !== 'result' ? (
            <div className="dual-wizard">
              <div className="dual-wizard-progress dual-no-print">Step {history.length}</div>
              <h2 className="dual-wizard-question">{currentNode.text}</h2>
              <div className="guided-buttons dual-no-print">
                {history.length > 1 && (
                  <button className="guided-btn guided-btn--back" onClick={back}>Back</button>
                )}
                {currentNode.type === 'yesno' && (
                  <>
                    <button className="guided-btn guided-btn--yes" onClick={() => go(currentNode.yes)}>Yes</button>
                    <button className="guided-btn guided-btn--no" onClick={() => go(currentNode.no)}>No</button>
                  </>
                )}
                {currentNode.type === 'choice' && (
                  <div className="dual-choice-list">
                    {currentNode.options.map((opt, i) => (
                      <button key={i} className="dual-choice-btn" onClick={() => go(opt.next)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="dual-result">
              <div className={`dual-signal ${SIGNAL_META[currentNode.signal].className}`}>
                <span className="dual-signal-glyph">{SIGNAL_META[currentNode.signal].glyph}</span>
                <span>{SIGNAL_META[currentNode.signal].label}</span>
              </div>
              <h2 className="dual-result-title">{currentNode.title}</h2>
              <p className="dual-result-desc">{currentNode.description}</p>

              <h3 className="dual-result-subhead">Indicators flagged</h3>
              <ul className="dual-flag-list">
                {currentNode.flags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>

              <h3 className="dual-result-subhead">Recommended next steps</h3>
              <div className="dual-nextsteps">
                {currentNode.nextSteps.map((s, i) => renderNextStep(s, i))}
              </div>

              <p className="dual-disclaimer">
                This is a prompt to do due diligence — not a determination or legal advice.
                Always consult your institution's Research Security office.
              </p>

              {/* Printable summary (hidden on screen, shown when printing) */}
              <div className="dual-print-summary dual-print-only">
                <h2>Dual-Use Self-Assessment Record</h2>
                <p>Generated: {new Date().toLocaleDateString('en-CA')}</p>
                <h3>Your answers</h3>
                <ol>
                  {trail.map((t, i) => (
                    <li key={i}><strong>{t.question}</strong> — {t.answer}</li>
                  ))}
                </ol>
                <h3>Result: {currentNode.title} ({SIGNAL_META[currentNode.signal].label})</h3>
                <p>{currentNode.description}</p>
                <h3>Indicators flagged</h3>
                <ul>{currentNode.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
                <h3>Recommended next steps</h3>
                <ul>{currentNode.nextSteps.map((s, i) => <li key={i}>{s.label}</li>)}</ul>
                <p><em>Prompt to do due diligence — not a determination or legal advice. Consult your Research Security office.</em></p>
              </div>

              <div className="guided-buttons dual-no-print">
                <button className="guided-btn guided-btn--back" onClick={back}>Back</button>
                <button className="guided-btn guided-btn--continue" onClick={restart}>Start over</button>
                <button className="dual-print-btn" onClick={() => window.print()}>Print summary</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Dual-Use Areas ── */}
      {activeTab === 'areas' && (
        <div className="dual-tab-content">
          <div className="dual-callouts">
            {dualUseData.areaCallouts.map(c => (
              <div key={c.id} className="dual-callout">
                <strong>{c.title}</strong>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
          <div className="dual-area-grid">
            {dualUseData.areas.map(area => (
              <div key={area.id} className="dual-area-card">
                <h3 className="dual-area-name">{area.name}</h3>
                <div className="dual-area-cols">
                  <div className="dual-area-col dual-area-col--civ">
                    <span className="dual-area-col-label">Civilian uses</span>
                    <ul>{area.civilian.map((u, i) => <li key={i}>{u}</li>)}</ul>
                  </div>
                  <div className="dual-area-col dual-area-col--mil">
                    <span className="dual-area-col-label">Military / misuse</span>
                    <ul>{area.military.map((u, i) => <li key={i}>{u}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="dual-nextstep-btn" onClick={() => onNavigate('stra-lookup')}>
            Check your specific area against the STRA list →
          </button>
        </div>
      )}

      {/* ── Tab: Vetting Collaborators ── */}
      {activeTab === 'vetting' && (
        <div className="dual-tab-content">
          <h2 className="dual-section-title">Red flags when vetting collaborators</h2>
          <ul className="dual-redflag-list">
            {dualUseData.redFlags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>

          <h2 className="dual-section-title">Why people misuse research — MICE</h2>
          <div className="dual-mice-grid">
            {dualUseData.mice.map(m => (
              <div key={m.letter} className="dual-mice-card">
                <span className="dual-mice-letter">{m.letter}</span>
                <strong>{m.label}</strong>
                <p>{m.body}</p>
              </div>
            ))}
          </div>

          <h2 className="dual-section-title">Common myths</h2>
          <div className="dual-myth-list">
            {dualUseData.myths.map((m, i) => (
              <div key={i} className="dual-myth">
                <p className="dual-myth-claim"><strong>Myth:</strong> {m.myth}</p>
                <p className="dual-myth-reality"><strong>Reality:</strong> {m.reality}</p>
              </div>
            ))}
          </div>

          <h2 className="dual-section-title">Scenario lessons</h2>
          <div className="dual-scenario-list">
            {dualUseData.scenarioLessons.map(s => (
              <div key={s.id} className="dual-scenario">
                <h3 className="dual-scenario-title">{s.title}</h3>
                <p>{s.body}</p>
                {s.mitigations.length > 0 && (
                  <>
                    <span className="dual-scenario-sublabel">Mitigation options</span>
                    <ul>{s.mitigations.map((mit, i) => <li key={i}>{mit}</li>)}</ul>
                  </>
                )}
              </div>
            ))}
          </div>

          <button className="dual-nextstep-btn" onClick={() => onNavigate('nro-lookup')}>
            Screen names against the NRO list →
          </button>
        </div>
      )}

      {/* ── Tab: Due Diligence ── */}
      {activeTab === 'diligence' && (
        <div className="dual-tab-content">
          {dualUseData.diligence.map(group => (
            <div key={group.id} className="dual-diligence-group">
              <h2 className="dual-section-title">{group.group}</h2>
              <ul className="dual-diligence-list">
                {group.actions.map((a, i) => (
                  <li key={i} className="dual-diligence-item">
                    <span>{a.text}</span>
                    {a.link && a.link.tool && (
                      <button className="dual-diligence-link" onClick={() => onNavigate(a.link.tool)}>
                        {a.link.label} →
                      </button>
                    )}
                    {a.link && a.link.url && (
                      <a className="dual-diligence-link" href={a.link.url} target="_blank" rel="noopener noreferrer">
                        {a.link.label} ↗
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

> **Note for the implementer:** the `→` / `↗` / `✓` sequences above are shown as escapes for clarity. Write them as the literal characters (→, ↗, ✓) in JSX text, matching how `CybersecurityGuide.jsx` and `StraLookup.jsx` use literal Unicode. In the `SIGNAL_META`/`answerLabelFor` JS string literals, `✓` as an escape is also fine.

- [ ] **Step 2: Lint (a11y gate)**

Run: `npm run lint`
Expected: PASS. The component uses only real `<button>`/`<a>` elements, so `eslint-plugin-jsx-a11y` should not flag it. If it reports the unused `onNavigate` prop pattern, note that this matches the documented pre-existing `no-unused-vars` exceptions — but here `onNavigate` IS used, so there should be no error.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS — `vite build` completes. (The component isn't reachable from the UI yet; that's Task 5.)

- [ ] **Step 4: Commit**

```bash
git add src/tools/compliance/DualUseGuide.jsx
git commit -m "feat(dual-use): add DualUseGuide 4-tab component"
```

---

## Task 4: Styles

**Files:**
- Modify: `src/styles/global.css` (append at end of file)

- [ ] **Step 1: Append the `dual-` styles**

Append the following to the end of `src/styles/global.css`:

```css
/* ───────────────────────── Dual-Use Research Guide ───────────────────────── */
.dual-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}
.dual-tab {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.dual-tab:hover { color: var(--text-primary); }
.dual-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.dual-tab-content { animation: fadeIn 0.2s ease; }

/* Wizard */
.dual-wizard {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px 24px;
}
.dual-wizard-progress { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
.dual-wizard-question { font-size: 18px; line-height: 1.5; margin-bottom: 24px; }
.dual-choice-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.dual-choice-btn {
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}
.dual-choice-btn:hover { border-color: var(--accent); }

/* Result */
.dual-result {
  max-width: 640px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px 24px;
}
.dual-signal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}
.dual-signal-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-weight: 700;
}
.dual-signal--likely { color: var(--red); background: var(--red-subtle); }
.dual-signal--likely .dual-signal-glyph { background: var(--red); color: var(--bg-primary); }
.dual-signal--possible { color: var(--amber); background: var(--amber-subtle); }
.dual-signal--possible .dual-signal-glyph { background: var(--amber); color: var(--bg-primary); }
.dual-signal--low { color: var(--green); background: var(--green-subtle); }
.dual-signal--low .dual-signal-glyph { background: var(--green); color: var(--bg-primary); }
.dual-result-title { font-size: 20px; margin-bottom: 8px; }
.dual-result-desc { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
.dual-result-subhead { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); margin: 20px 0 8px; }
.dual-flag-list { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; }
.dual-nextsteps { display: flex; flex-direction: column; gap: 8px; }
.dual-nextstep-btn {
  display: inline-block;
  padding: 10px 16px;
  background: var(--accent-subtle);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  color: var(--accent);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}
.dual-nextstep-btn:hover { background: var(--accent); color: var(--bg-primary); }
.dual-print-btn {
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}
.dual-disclaimer { font-size: 12px; color: var(--text-muted); margin: 20px 0; line-height: 1.5; }

/* Areas */
.dual-callouts { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.dual-callout {
  background: var(--bg-secondary);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.dual-callout strong { display: block; margin-bottom: 4px; }
.dual-callout p { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.dual-area-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.dual-area-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.dual-area-name { font-size: 15px; margin: 0 0 12px; }
.dual-area-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dual-area-col-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  font-weight: 600;
}
.dual-area-col--civ .dual-area-col-label { color: var(--green); }
.dual-area-col--mil .dual-area-col-label { color: var(--red); }
.dual-area-col ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: var(--text-secondary); }

/* Vetting */
.dual-section-title { font-size: 18px; margin: 28px 0 12px; }
.dual-redflag-list { margin: 0; padding-left: 20px; line-height: 1.7; }
.dual-mice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.dual-mice-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}
.dual-mice-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--accent-subtle);
  color: var(--accent);
  font-family: var(--font-mono);
  font-weight: 700;
  margin-bottom: 8px;
}
.dual-mice-card strong { display: block; }
.dual-mice-card p { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
.dual-myth-list { display: flex; flex-direction: column; gap: 12px; }
.dual-myth {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.dual-myth-claim { margin: 0 0 6px; font-size: 14px; }
.dual-myth-reality { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.dual-scenario-list { display: flex; flex-direction: column; gap: 16px; }
.dual-scenario {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.dual-scenario-title { font-size: 15px; margin: 0 0 8px; }
.dual-scenario p { margin: 0 0 8px; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.dual-scenario-sublabel {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.dual-scenario ul { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; }

/* Due diligence */
.dual-diligence-group { margin-bottom: 8px; }
.dual-diligence-list { list-style: none; margin: 0; padding: 0; }
.dual-diligence-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  line-height: 1.6;
}
.dual-diligence-item > span { flex: 1; min-width: 240px; }
.dual-diligence-link {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px 12px;
  color: var(--link);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
}
.dual-diligence-link:hover { border-color: var(--accent); color: var(--link-hover); }

/* Print: show the summary, hide interactive chrome */
.dual-print-only { display: none; }
@media print {
  .dual-no-print { display: none !important; }
  .dual-print-only { display: block !important; }
  .dual-print-summary h2 { font-size: 16pt; }
  .dual-print-summary h3 { font-size: 12pt; margin-top: 12pt; }
}

/* Responsive */
@media (max-width: 640px) {
  .dual-area-cols { grid-template-columns: 1fr; }
}
```

> **Implementer check:** the styles reference existing tokens (`--accent`, `--accent-subtle`, `--red`, `--red-subtle`, `--amber`, `--amber-subtle`, `--green`, `--green-subtle`, `--bg-primary/secondary/tertiary`, `--border`, `--text-*`, `--link`, `--link-hover`, `--radius`, and the `fadeIn` keyframe). All of these were confirmed to exist in `global.css` at planning time (the keyframe is `fadeIn`, camelCase — not `fade-in`). If you change any class and a token turns up missing, substitute the nearest existing one rather than inventing a new variable, and note the substitution in the commit message.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(dual-use): add dual- styles and print rules"
```

---

## Task 5: Register the tool in nav + routing

**Files:**
- Modify: `src/data/toolRegistry.js` (the `compliance-tools` category `tools` array)
- Modify: `src/App.jsx` (`TOOL_COMPONENTS`)

- [ ] **Step 1: Add the registry entry**

In `src/data/toolRegistry.js`, inside the `compliance-tools` category's `tools` array, add this object as the **last** entry (after the `risk-mitigation` object, keeping its trailing comma):

```js
      {
        id: 'dual-use',
        name: 'Dual-Use Research Guide',
        slug: 'dual-use',
        description: 'Identify dual-use research, vet collaborators, and run due diligence — self-assessment, civilian-vs-military examples, red flags, and action steps',
        tags: ['dual-use', 'dual use', 'military', 'vetting', 'collaborators', 'due diligence', 'assessment', 'mice'],
        related: ['stra-lookup', 'nro-lookup', 'export-control'],
      },
```

- [ ] **Step 2: Add the lazy import**

In `src/App.jsx`, add this line to the `TOOL_COMPONENTS` map (after the `'risk-mitigation'` line):

```js
  'dual-use': lazy(() => import('./tools/compliance/DualUseGuide')),
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`, open the printed local URL, and verify:
- "Dual-Use Research Guide" appears in the sidebar under **Compliance Tools** and on the Home all-tools grid.
- Clicking it loads the tool; all four tabs switch.
- Self-Assessment: answer through to each of the four results; **Back** and **Start over** work; next-step buttons navigate to the right tools (STRA Lookup, NRO Lookup, Export Control, etc.); the "Browse the Dual-Use Areas" next-step switches to the Areas tab.
- **Print summary** (from a result) opens the print dialog showing the dated record (answers, signal, flags, next steps) and hides the tab bar/buttons.
- Areas: 10 cards render with civilian vs. military columns; callouts show.
- Vetting: red flags, MICE, myths, scenarios all render; NRO button navigates.
- Due Diligence: five groups render; internal links navigate, external links open in a new tab.

Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/data/toolRegistry.js src/App.jsx
git commit -m "feat(dual-use): register Dual-Use Research Guide in nav and routing"
```

---

## Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Directory Structure** — under `tools/compliance/`, add a line after the `RiskMitigation.jsx` entry:

```
      DualUseGuide.jsx           # 4-tab: Self-Assessment wizard / Dual-Use Areas / Vetting Collaborators / Due Diligence
```

- [ ] **Step 2: Directory Structure (data)** — under `data/`, add after the `riskMitigationData.js` line:

```
    dualUseData.js               # Dual-use areas (civ vs mil), red flags, MICE, myths, scenarios, due-diligence actions
    dualUseWizard.js             # Guided "Is my research dual-use?" question tree
```

- [ ] **Step 3: Tools Inventory** — in the **Compliance Tools** table, add a row:

```
| `dual-use` | Dual-Use Research Guide | `dualUseData.js` + `dualUseWizard.js` |
```

- [ ] **Step 4: Key Decisions** — add this bullet to the Key Decisions list:

```
- **Dual-Use Research Guide**: A combined hub (CSS prefix `dual-`) in Compliance Tools, structured on the workshop arc *Know Your Research → Know Your Partners → Assess the Risk*. The Self-Assessment wizard is deliberately **conceptual** (intent/use, knowledge transfer, partner exposure) and hands off to STRA Lookup / NRO Lookup / Export Control rather than re-deriving STRA categories — it does not duplicate the STRA wizard. Results give a **signal read** (Likely / Possible / Low), never a "cleared" verdict or legal advice, and offer a Print summary (reuses the global print CSS + `.dual-print-only`/`.dual-no-print` toggles). Content is attributed to Public Safety Canada's Safeguarding Science program + Government of Canada guidance (not UBC). The stale workshop figures (74 subcategories / 356 entities) were dropped; cite "11 STRA categories" and link the live NRO list instead.
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(dual-use): document Dual-Use Research Guide in CLAUDE.md"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full lint**

Run: `npm run lint`
Expected: PASS with no new errors (pre-existing `no-unused-vars` on other tools' `onNavigate` may remain — unrelated).

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Confirm external links resolve**

Manually open each external URL used in `dualUseData.js` (Export Controls, Controlled Goods Program, Human Pathogens and Toxins Act, OpenSanctions, Public Safety Research Security Centre, NSGRP RAF). If any returns a 404, replace it with the nearest canonical Government of Canada page and re-commit the data file. (URLs were specified from the spec but not all live-verified at planning time.)

- [ ] **Step 4: Final commit (if any URL fixes were needed)**

```bash
git add src/data/dualUseData.js
git commit -m "fix(dual-use): correct external reference URLs"
```

---

## Self-Review Notes (author)

- **Spec coverage:** Tab 1 (Task 2 + Task 3 assess panel + print) ✓; Tab 2 areas + callouts (Task 1 + Task 3) ✓; Tab 3 red flags/MICE/myths/scenarios (Task 1 + Task 3) ✓; Tab 4 diligence groups + regimes (Task 1 + Task 3) ✓; placement/registry (Task 5) ✓; CSS + print (Task 4) ✓; sourcing/safety hedge (data + component) ✓; data-currency decision (dropped stale figures) ✓ in Task 1 comment + CLAUDE.md; CLAUDE.md updates (Task 6) ✓; a11y via real buttons + lint gate (every task) ✓.
- **Cross-task type consistency:** node fields `signal`/`flags`/`nextSteps`/`title`/`description` defined in Task 2 are exactly the fields read in Task 3; `link.tool`/`link.url`/`link.label` defined in Task 1 match Task 3's diligence render; `SIGNAL_META` keys (`likely`/`possible`/`low`) match the wizard's `signal` values.
- **No placeholders:** all code blocks are complete; the only deferred item is live-verifying external URLs (Task 7 Step 3), which is a real verification action, not a code placeholder.
