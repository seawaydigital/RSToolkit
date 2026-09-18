# Content Accuracy Fixes & Launch Close-out Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct every content-accuracy defect confirmed on the live site (six, all sourced from draft PR #21's audit and re-verified against official sources on 2026-09-18), add a flowchart-integrity test so the corrected decision flows cannot silently break, and close out the launch: document the header fix, schedule the content re-check, and retire PR #21.

**Architecture:** The site is a static React + Vite bundle; all policy content lives in plain data modules under `src/data/`, so every fix here is a data edit plus, for the NSGRP flow, a restructured node graph. A new `node --test` suite validates every flowchart graph (targets exist, all nodes reachable, decisions have both branches) and runs inside the existing `verify` CI job. No new runtime dependencies.

**Tech Stack:** React 19, Vite 8, Node 24 built-in test runner (`node:test`), GitHub CLI (`gh`) for the issue and PR housekeeping.

**Decision recorded:** Draft PR #21 (`codex/launch-safety`) is treated as a *source of fixes*, not as the product. It disables three tools, replaces the map with 55 approximate points, removes the Pages deploy, and conflicts with master in 19 files. Its audit findings B01–B07 were re-checked against primary sources for this plan; B08/B09/B12/B13 either do not apply to master (B09's "Match" heuristic exists only on that branch) or are product changes out of scope here.

**Branch:** `claude/content-accuracy-fixes` off `master` (`ae2e10b` or later). Master requires the `verify` status check; the workflow already provides it.

---

## Source facts this plan relies on (verified 2026-09-18)

| # | Fact | Source |
|---|---|---|
| F1 | An NSGRP Risk Assessment Form (RAF) is required when an application to a **listed funding opportunity** includes **one or more private-sector partner organizations**. Listed: NSERC Alliance (incl. special calls/joint), NSERC Idea to Innovation Phase II, CIHR Project Grant Program (Fall 2024+), SSHRC Partnership Grants Stage 2 (2025+), SSHRC Partnership Development Grants (Nov 2025+), SSHRC Partnership Engage Grants (Mar 2026+), Canada Biomedical Research Fund Stage 2, Eddie Goldenberg Research Chairs of Canada, Canada Impact+ Emerging Leaders. Private sector = for-profit organizations (excluding Canadian Crown corporations) and bodies representing for-profits (industry associations, consortia), excluding producer groups. Every RAF is reviewed case-by-case; outcomes are fund / fund with conditions / decline. | https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance (modified 2026-03-27) |
| F2 | Annex A (sensitive research areas) and Annex B (partner risk factors) are the NSGRP's *risk-identification* aids. Nothing in the guidelines says a negative Annex A finding waives a required RAF. | https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships |
| F3 | The named-researcher attestation belongs to the **STRAC Policy**, not the NSGRP. | STRAC policy page (see CLAUDE.md Source URLs) |
| F4 | `zip -er` on macOS produces ZipCrypto (weak). Apple's Disk Utility creates AES-encrypted disk images. | https://support.apple.com/guide/disk-utility/create-a-disk-image-dskutl11888/mac |
| F5 | The Tri-Agency RCR Framework sets **no** retention period; it requires records kept "in accordance with the applicable funding agreement, institutional policies, laws, regulations, and professional or disciplinary standards" (s. 2.1.2). | https://rcr.ethics.gc.ca/eng/framework-cadre-2021.html |
| F6 | OCAP® (Ownership, Control, Access, Possession) is the **First Nations** Information Governance Centre's framework. Inuit and Métis governance is separate. | https://fnigc.ca/ocap-training/ (bot-protected; content confirmed via browser) |
| F7 | Global Affairs Canada: sanctions prohibit dealings with listed persons (even indirectly) and the supply of many goods/technologies and services "including market research, research and development, scientific and technical assistance". Research collaboration is **not categorically prohibited**; institutions must determine whether the specific activity is permitted and can contact the Sanctions Bureau. | https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng |
| F8 | Canada's export permit process applies to controlled items "regardless of their means of delivery (including… electronic transfer or transmission of information, provision of technical or consulting services)". The handbook has **no** "deemed export" rule for foreign nationals inside Canada; that concept is US law. Domestic access to controlled goods is governed by the Controlled Goods Program. | https://www.international.gc.ca/trade-commerce/controls-controles/reports-rapports/ebc_handbook-cce_manuel.aspx?lang=eng ; https://www.canada.ca/en/public-services-procurement/services/industrial-security/controlled-goods.html |
| F9 | Ontario "Relevant Period": two years before the Named Researcher signs the Application Attestation Form **through to the anticipated completion date of the proposed project**; disclosure covers Collaborations "whether related to the proposed project or any other project". Named Researchers = PI and co-investigators named in the application. | ON00708E (2024/06) p. 3, https://forms.mgcs.gov.on.ca/dataset/875d7629-9ddc-4545-a1c3-881ece0cb3a3/resource/6219fff3-aa2e-49ae-955c-0ebbd21059f1/download/on00708e.pdf |
| F10 | STRAC is not retroactive (CLAUDE.md, verified 2026-09-18), so a later NRO listing affects **new applications and renewals**, not an existing award automatically. | STRAC policy page |

---

## File map

| File | Change |
|---|---|
| `tests/flowcharts.test.mjs` | **Create.** Graph-integrity test for all three flowcharts. |
| `package.json` | Add `"test": "node --test \"tests/**/*.test.mjs\""`. |
| `.github/workflows/deploy.yml` | Add `npm test` to the `verify` job. |
| `src/data/flowcharts/nsgrpFlow.js` | Restructure: program + private-partner trigger; Annex A/B inform mitigation only; STRAC attestation removed from this flow. |
| `src/data/triAgencyData.js` | NSGRP `when` / `what` / keyPoints reflect F1. |
| `src/data/faqData.js` | `nsgrp-what`, `ec-apply-universities`, `ec-international-student` rewritten. |
| `src/data/cybersecurityData.js` | Mac encryption steps; retention wording (x2); sensitive-data intro; health + Indigenous entries. |
| `src/tools/compliance/NroLookup.jsx` | Tier 1 / Tier 2 sanctions wording; note links GAC academic guidance. |
| `src/data/riskMitigationData.js` | `dd-1` and `mon-1` wording. |
| `src/data/exportControlData.js` | Area Control List wording. |
| `src/data/flowcharts/ontarioFlow.js` | Relevant Period in `check-collaborations`, Option A/B. |
| `CLAUDE.md` | NSGRP accuracy bullet rewritten; content-verification bullet extended; test gate documented. |
| `HANDOFF.md` | §4 gains Cloudflare step-by-step for response headers. |

---

### Task 1: Flowchart integrity test (safety net before touching graphs)

**Files:**
- Create: `tests/flowcharts.test.mjs`
- Modify: `package.json` (scripts)
- Modify: `.github/workflows/deploy.yml:36-38`

- [ ] **Step 1: Create the branch**

```bash
git checkout master && git pull -q origin master
git checkout -b claude/content-accuracy-fixes
```

- [ ] **Step 2: Write the test**

Create `tests/flowcharts.test.mjs`:

```js
// Graph-integrity checks for every flowchart data module. The flows are the
// site's decision logic; a dangling `yes:` target or an unreachable node is a
// content bug that renders as a dead end for a researcher.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stracFlow } from '../src/data/flowcharts/stracFlow.js';
import { nsgrpFlow } from '../src/data/flowcharts/nsgrpFlow.js';
import { ontarioFlow } from '../src/data/flowcharts/ontarioFlow.js';

const FLOWS = { stracFlow, nsgrpFlow, ontarioFlow };

for (const [name, flow] of Object.entries(FLOWS)) {
  test(`${name}: node ids are unique`, () => {
    const ids = flow.nodes.map((n) => n.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${name}`);
  });

  test(`${name}: exactly one start node`, () => {
    assert.equal(flow.nodes.filter((n) => n.type === 'start').length, 1);
  });

  test(`${name}: every branch target exists`, () => {
    const ids = new Set(flow.nodes.map((n) => n.id));
    for (const n of flow.nodes) {
      for (const key of ['next', 'yes', 'no']) {
        if (n[key] !== undefined) {
          assert.ok(ids.has(n[key]), `${name}: ${n.id}.${key} -> "${n[key]}" does not exist`);
        }
      }
    }
  });

  test(`${name}: decisions have yes and no; ends have no outgoing edge; others have next`, () => {
    for (const n of flow.nodes) {
      if (n.type === 'decision') {
        assert.ok(n.yes && n.no, `${name}: decision ${n.id} needs yes and no`);
        assert.equal(n.next, undefined, `${name}: decision ${n.id} must not have next`);
      } else if (n.type === 'end') {
        assert.ok(!n.next && !n.yes && !n.no, `${name}: end ${n.id} must have no outgoing edge`);
      } else {
        assert.ok(n.next, `${name}: ${n.type} ${n.id} needs next`);
      }
    }
  });

  test(`${name}: every node is reachable from start`, () => {
    const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
    const start = flow.nodes.find((n) => n.type === 'start');
    const seen = new Set();
    const stack = [start.id];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      const n = byId[id];
      for (const key of ['next', 'yes', 'no']) if (n[key]) stack.push(n[key]);
    }
    const unreachable = flow.nodes.map((n) => n.id).filter((id) => !seen.has(id));
    assert.deepEqual(unreachable, [], `${name}: unreachable nodes`);
  });

  test(`${name}: every path from start reaches an end`, () => {
    const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
    const start = flow.nodes.find((n) => n.type === 'start');
    const memo = new Map();
    const reachesEnd = (id, trail) => {
      if (memo.has(id)) return memo.get(id);
      if (trail.has(id)) return false; // cycle without an end
      const n = byId[id];
      if (n.type === 'end') return true;
      const next = new Set(trail).add(id);
      const out = ['next', 'yes', 'no'].filter((k) => n[k]).map((k) => reachesEnd(n[k], next));
      const ok = out.length > 0 && out.every(Boolean);
      memo.set(id, ok);
      return ok;
    };
    assert.ok(reachesEnd(start.id, new Set()), `${name}: a path from start never reaches an end node`);
  });
}
```

- [ ] **Step 3: Add the npm script**

In `package.json`, change the `scripts` block to:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "test": "node --test \"tests/**/*.test.mjs\"",
    "preview": "vite preview"
  },
```

- [ ] **Step 4: Run the tests — expect PASS on current data (all three current graphs are well-formed)**

Run: `npm test`
Expected: `# pass 18` / `# fail 0` (6 tests × 3 flows).

If any test fails here, the failure is a pre-existing data bug: fix the data, not the test.

- [ ] **Step 5: Add the test to the CI gate**

In `.github/workflows/deploy.yml`, the `verify` job's run steps become:

```yaml
      - run: npm ci
      # Fail only on high/critical: every advisory so far has been a
      # dev-only toolchain package, and a low-severity one should not block
      # shipping a content fix. Re-check `npm audit` by hand periodically.
      - run: npm audit --audit-level=high
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

- [ ] **Step 6: Lint (the test file is ESM under the repo's flat config; confirm no new errors)**

Run: `npm run lint`
Expected: `0 errors` (3 pre-existing warnings).

- [ ] **Step 7: Commit**

```bash
git add tests/flowcharts.test.mjs package.json .github/workflows/deploy.yml
git commit -m "test: add flowchart graph-integrity suite and run it in verify" \
  -m "Validates every flow's targets, reachability, decision branches and end-reachability with node:test. No new dependencies." \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: NSGRP flowchart — RAF is triggered by program + private-sector partner, never waived by Annex A

**Files:**
- Modify: `src/data/flowcharts/nsgrpFlow.js` (whole `nodes` array + header comment + `lastUpdated`)

Why: the current flow ends at "Document due diligence and proceed — the mandatory RAF requirement does not apply" whenever Annex A is answered No. Under F1 the form is mandatory for a listed program with a private-sector partner regardless of Annex A/B. The current flow also inserts a named-researcher attestation that belongs to STRAC (F3).

- [ ] **Step 1: Write the failing assertion (temporary, in the same test file)**

Append to `tests/flowcharts.test.mjs`:

```js
test('nsgrpFlow: a required RAF is never waived by the Annex A / Annex B answers', () => {
  const byId = Object.fromEntries(nsgrpFlow.nodes.map((n) => [n.id, n]));
  // Once raf-required is reached, every downstream path must pass through submit-raf.
  const start = 'raf-required';
  assert.ok(byId[start], 'raf-required node must exist');
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    const n = byId[id];
    if (n.type === 'end') {
      assert.notEqual(id, 'recommend-voluntary', 'a required RAF must not route to the no-RAF terminal');
    }
    for (const key of ['next', 'yes', 'no']) if (n[key]) stack.push(n[key]);
  }
  assert.ok(seen.has('submit-raf'), 'submit-raf must be reachable from raf-required');
  assert.ok(!nsgrpFlow.nodes.some((n) => n.id === 'attest'), 'STRAC attestation does not belong in the NSGRP flow');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL with `raf-required node must exist`.

- [ ] **Step 3: Replace the node graph**

Replace the entire contents of `src/data/flowcharts/nsgrpFlow.js` with:

```js
export const nsgrpFlow = {
  id: "nsgrp",
  title: "NSGRP Research Partnership Decision Flow",
  // Restructured 2026-09-18. The Risk Assessment Form (RAF) is required when
  // an application to a LISTED funding opportunity includes one or more
  // PRIVATE-SECTOR partner organizations (tri-agency implementation guidance,
  // modified 2026-03-27). Annex A (sensitive areas) and Annex B (partner risk)
  // help identify and mitigate risk; a "No" on either never waives a required
  // form. The named-researcher attestation is a STRAC Policy requirement and
  // is deliberately not part of this flow — see stracFlow.js.
  lastUpdated: "2026-09-18",
  policySource: "National Security Guidelines for Research Partnerships",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships",
  nodes: [
    {
      id: "start",
      type: "start",
      label: "New Research Partnership Opportunity",
      description: "You are preparing a federal grant application that involves a partner organization — a company, industry association, non-profit, public body, or another institution.",
      next: "check-program"
    },
    {
      id: "check-program",
      type: "decision",
      label: "Is this a funding opportunity that requires a Risk Assessment Form?",
      description: "The tri-agency guidance names the opportunities: NSERC Alliance (including special calls and joint opportunities) and Idea to Innovation Phase II; CIHR Project Grant Program (Fall 2024 onward); SSHRC Partnership Grants Stage 2 (2025 onward), Partnership Development Grants (November 2025 onward) and Partnership Engage Grants (March 2026 onward); Canada Biomedical Research Fund Stage 2; Eddie Goldenberg Research Chairs of Canada; and Canada Impact+ Emerging Leaders. The list grows — check the current page before answering.",
      policyRef: "Tri-agency guidance — Funding opportunities subject to the RAF",
      whyItMatters: "The form is tied to specific programs. Answering from memory is the most common way to miss a required document.",
      resourceLink: { url: "https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance", label: "Check the current program list" },
      yes: "check-private-partner",
      no: "recommend-voluntary"
    },
    {
      id: "check-private-partner",
      type: "decision",
      label: "Does the application include a private-sector partner organization?",
      description: "Private-sector partner organizations are for-profit organizations (excluding Canadian Crown corporations) and bodies that represent for-profit organizations, such as an industry association or a formal or informal consortium — but not producer groups. A foreign company counts. Partnerships whose only partners are universities, hospitals, governments or non-profits do not trigger the form.",
      policyRef: "Tri-agency guidance — Private sector partner organizations subject to the RAF",
      whyItMatters: "This is the second half of the trigger. Program plus private-sector partner means the form is mandatory, whatever you believe the risk to be.",
      yes: "raf-required",
      no: "recommend-voluntary"
    },
    {
      id: "recommend-voluntary",
      type: "end",
      label: "No Risk Assessment Form required for this application",
      description: "This application does not require the form. The Government of Canada still encourages every researcher to apply the NSGRP with any partner or funder: review Annex A (sensitive research areas) and Annex B (partner risk factors), document what you found, and manage any risks through your institution's research security office. If your research is in a Sensitive Technology Research Area, the STRAC Policy applies separately.",
      policyRef: "NSGRP — Implementation",
      crossLink: { tool: "strac-flowchart", label: "Check the STRAC Policy" }
    },
    {
      id: "raf-required",
      type: "action",
      label: "A Risk Assessment Form is required",
      description: "The form is an integral part of the application and is reviewed case by case. \"No risks identified\" is a legitimate answer — but the completed form must still be submitted. The steps below help you fill it in well; none of them removes the requirement.",
      policyRef: "Tri-agency guidance — Application requirements",
      next: "check-sensitive-area"
    },
    {
      id: "check-sensitive-area",
      type: "decision",
      label: "Does the research involve a sensitive area (Annex A)?",
      description: "Annex A lists research areas covered by export controls, the Sensitive Technology Research Areas, and additional areas that can be sensitive: critical minerals, critical infrastructure, large datasets, and sensitive personal data.",
      policyRef: "NSGRP — Annex A",
      whyItMatters: "Sensitivity of the research determines how much mitigation the form should describe. It does not decide whether the form is needed.",
      crossLink: { tool: "stra-lookup", label: "Open STRA Lookup" },
      yes: "check-partner-risk",
      no: "document-no-risk"
    },
    {
      id: "check-partner-risk",
      type: "decision",
      label: "Does the partner present risk factors (Annex B)?",
      description: "Consider whether the partner is state-owned or state-influenced, lacks institutional autonomy, operates under laws that compel knowledge transfer to a foreign government, has personnel with military or state-security ties, or has been sanctioned.",
      policyRef: "NSGRP — Annex B",
      whyItMatters: "Risk factors in the partner, combined with sensitive research, are what the reviewers will look at hardest. Naming them and mitigating them is far better than leaving them for the reviewers to find.",
      crossLink: { tool: "risk-checklist", label: "Open Risk Checklist" },
      yes: "develop-mitigation",
      no: "document-no-risk"
    },
    {
      id: "document-no-risk",
      type: "action",
      label: "Record why no significant risk was identified",
      description: "Write down what you checked — the Annex A areas you considered, the due diligence on the partner, and the sources you used. That record is what you draw on for the form, and what your institution can stand behind later.",
      policyRef: "NSGRP — Identify potential risks",
      next: "submit-raf"
    },
    {
      id: "develop-mitigation",
      type: "action",
      label: "Develop a risk mitigation plan",
      description: "Address each identified risk: team composition and training, cybersecurity and data management, controls on access to results, clear agreements on intellectual property and intended use, and how the partnership will be monitored. The Risk Mitigation Guide in this toolkit lists concrete measures.",
      policyRef: "NSGRP — Mitigation measures",
      crossLink: { tool: "risk-mitigation", label: "Open Risk Mitigation Guide" },
      next: "submit-raf"
    },
    {
      id: "submit-raf",
      type: "action",
      label: "Submit the Risk Assessment Form with the application",
      description: "Complete the form, including any mitigation measures, and submit it as part of the grant application. The funding organization reviews every form, consulting national security departments and agencies where appropriate. If the research is in a Sensitive Technology Research Area, the STRAC Policy's named-researcher attestation applies separately.",
      policyRef: "NSGRP — Implementation",
      resourceLink: { url: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form", label: "Open the Risk Assessment Form" },
      crossLink: { tool: "strac-flowchart", label: "Check the STRAC Policy" },
      next: "agency-review"
    },
    {
      id: "agency-review",
      type: "decision",
      label: "Does the funding organization accept the risk?",
      description: "The funding organization decides, in consultation with national security partners where needed. It may fund the project as proposed, fund it on condition of additional mitigation, or decline it where risks cannot be mitigated. The institution does not make this determination.",
      policyRef: "NSGRP — Implementation",
      yes: "end-proceed",
      no: "end-declined"
    },
    {
      id: "end-proceed",
      type: "end",
      label: "Partnership funded",
      description: "The funding organization has accepted the partnership, possibly with conditions. Keep monitoring the partner and the risk factors for the life of the project, and re-check the NRO list before any renewal or new application."
    },
    {
      id: "end-declined",
      type: "end",
      label: "Application not funded",
      description: "The funding organization assessed the partnership as posing national security risks that could not be mitigated. Restructuring the partnership or choosing a different partner may make a future application viable."
    }
  ]
};
```

- [ ] **Step 4: Run the tests — expect PASS**

Run: `npm test`
Expected: `# fail 0`, including the new `raf-required` assertion.

- [ ] **Step 5: Browser check the layout (the graph has one more column at the top; confirm it still fits)**

Run: preview_start `rs-toolkit-dev`, open `#nsgrp-flowchart`, Full View: confirm no node text overflows its shape and the YES/NO pills sit on their edges; Guided Mode: walk *Yes → No* and confirm it ends at "No Risk Assessment Form required"; walk *Yes → Yes → No → No* and confirm it reaches "Submit the Risk Assessment Form". Screenshot both.

- [ ] **Step 6: Commit**

```bash
git add src/data/flowcharts/nsgrpFlow.js tests/flowcharts.test.mjs
git commit -m "fix(nsgrp): RAF is triggered by listed program + private-sector partner; Annex A/B never waive it" \
  -m "The flow previously exited with 'the mandatory RAF requirement does not apply' whenever Annex A was answered No, and inserted STRAC's named-researcher attestation as an NSGRP step. Both corrected against the tri-agency implementation guidance (modified 2026-03-27). Adds a regression test that a required RAF can never route to the no-RAF terminal." \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: NSGRP wording in the Tri-Agency guide and FAQ

**Files:**
- Modify: `src/data/triAgencyData.js` (the `nsgrp` policy object, currently ~lines 121-139)
- Modify: `src/data/faqData.js` (`nsgrp-what` answer)

- [ ] **Step 1: Tri-Agency guide — NSGRP `when`, `what`, keyPoints**

In `src/data/triAgencyData.js`, replace these three fields of the `nsgrp` policy:

```js
      when: 'When you apply to one of the federal funding opportunities that require a Risk Assessment Form — NSERC Alliance and Idea to Innovation Phase II, CIHR Project Grants, SSHRC Partnership, Partnership Development and Partnership Engage Grants, and the newer opportunities on the tri-agency list — AND the application includes a private-sector partner organization. The guidelines themselves are recommended with any partner or funder.',
      what: 'Requires a completed Risk Assessment Form (RAF) as part of the application. The funding organization reviews every form case by case, consulting national security departments and agencies where appropriate, and may fund the project as proposed, fund it with additional mitigation measures, or decline it where the risks cannot be mitigated.',
      keyPoints: [
        'Trigger = listed funding opportunity + at least one private-sector partner (for-profit, or a body representing for-profits; Canadian Crown corporations and producer groups excluded)',
        'The form is mandatory even if you identify no risks — "no risks identified" is an answer, not an exemption',
        'Annex A (sensitive areas) and Annex B (partner risk) guide what to write; they never waive the form',
        'Every RAF is reviewed by the funding organization, with national security agencies consulted as needed',
        'Outcomes: funded, funded with conditions, or declined where risks cannot be mitigated',
        'Partnerships with only universities, hospitals, governments or non-profits do not require the form — applying the guidelines is still recommended',
      ],
```

- [ ] **Step 2: FAQ — `nsgrp-what`**

In `src/data/faqData.js`, replace the `nsgrp-what` answer with:

```js
            'The National Security Guidelines for Research Partnerships (NSGRP) set out how national security considerations are assessed in federally funded research partnerships. A Risk Assessment Form (RAF) is mandatory when two things are true: you are applying to one of the funding opportunities the tri-agency has listed (NSERC Alliance and Idea to Innovation Phase II, CIHR Project Grants, SSHRC Partnership, Partnership Development and Partnership Engage Grants, and newer opportunities added to the list), and the application includes at least one private-sector partner organization — a for-profit company or a body representing for-profits, but not a Canadian Crown corporation or a producer group. The form is required even if you believe there are no risks. The funding organization reviews every form, consulting national security departments and agencies where appropriate, and may fund the project as proposed, fund it with conditions, or decline it. Partnerships whose only partners are universities, hospitals, governments or non-profits do not require the form, but the Government of Canada encourages every researcher to apply the guidelines to any partnership.',
```

- [ ] **Step 3: Verify no stale phrasing remains**

Run: `grep -rnE "Annex A AND Annex B|Both Annex A|dual-trigger|does not apply" src/data/ CLAUDE.md`
Expected: no matches in `src/data/`. (CLAUDE.md is updated in Task 9.)

- [ ] **Step 4: Run lint + tests, then commit**

Run: `npm run lint && npm test`
Expected: 0 errors, all tests pass.

```bash
git add src/data/triAgencyData.js src/data/faqData.js
git commit -m "content(nsgrp): state the program + private-sector-partner trigger in the guide and FAQ" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Cybersecurity guide — encryption recipe, retention, storage-location and Indigenous data claims

**Files:**
- Modify: `src/data/cybersecurityData.js` (lines 3, 48, 76-85, 156, 174-197)

- [ ] **Step 1: Replace the macOS `zip -er` block (lines ~76-85)**

Replace the object whose `id` is `'mac'` with:

```js
      {
        id: 'mac',
        label: 'Mac — Disk Utility',
        bestFor: 'Encrypting a folder for cloud storage or for another Mac user. Uses AES-256; no extra software.',
        steps: [
          { text: 'Open Disk Utility (Applications → Utilities)' },
          { text: 'Choose File → New Image → Image from Folder…, then select the folder' },
          { text: 'Set Encryption to 256-bit AES and enter a strong passphrase (12+ characters)' },
          { text: 'Leave "Remember password in my keychain" unticked if you will share the image, then Save' },
          { text: 'Upload the resulting .dmg file to cloud storage' },
          { text: 'Apple\'s instructions:', linkUrl: 'https://support.apple.com/guide/disk-utility/create-a-disk-image-dskutl11888/mac', linkLabel: 'Create a disk image using Disk Utility' },
        ],
        tip: 'Do not use the Terminal command zip -e / zip -er: it applies ZipCrypto, which is weak and not an AES alternative. A .dmg opens only on a Mac — for a Windows recipient use 7-Zip or VeraCrypt.',
      },
```

- [ ] **Step 2: Fix the two retention claims**

Line ~48 (`backup` action body), replace the sentence "Many collective agreements and granting agency policies require research data to be retained for at least 7 years." with:

```
Retention periods are set by your funding agreement, institutional records policy, ethics approval and any data-sharing agreement — check those before deleting anything.
```

Line ~156 (`backup.note`), replace the whole `note` value with:

```js
      note: 'There is no single national retention period: the Tri-Agency Framework: Responsible Conduct of Research requires complete and accurate records kept in accordance with your funding agreement, institutional policies, applicable laws and disciplinary standards. Find out which applies to your project. Backups are not optional.',
```

- [ ] **Step 3: Fix the storage-location intro and the health and Indigenous entries (lines ~174-197)**

Replace `sensitiveData.intro` with:

```js
    intro: 'Some categories of research data carry storage-location, custody or governance obligations that can rule out a given cloud service. Before storing sensitive data on any cloud service — including Google Drive, Dropbox, or OneDrive — confirm the specific obligation that applies if your project involves:',
```

Replace the `health` entry's `detail` with:

```js
        detail: 'Ontario\'s PHIPA and any data-sharing agreement set the terms — confirm with the data custodian and your REB',
```

Replace the `indigenous` entry with:

```js
      {
        id: 'indigenous',
        label: 'Indigenous research data',
        detail: 'Governance is set by the community or Nation. The First Nations principles of OCAP® (Ownership, Control, Access, Possession) apply to First Nations data; Inuit and Métis communities have their own frameworks. Agree storage and access terms with the community before collecting',
      },
```

- [ ] **Step 4: Bump `lastUpdated`**

Line 3: `lastUpdated: '2026-09-18',` stays (already today); if executing on a later date, set it to that date — every change here was verified against its source.

- [ ] **Step 5: Confirm nothing else asserts a fixed retention period or Canadian-only hosting**

Run: `grep -rniE "7 years|seven years|Canadian-hosted servers only|must be stored on Canadian" src/data/`
Expected: no matches.

- [ ] **Step 6: Browser check** — open `#cybersecurity-guide`, Encryption tab, Mac sub-tab: the six steps render and the Apple link opens in a new tab. AI & Sensitive Data tab: the Indigenous entry wraps cleanly on mobile width (375px).

- [ ] **Step 7: Lint, test, commit**

```bash
npm run lint && npm test
git add src/data/cybersecurityData.js
git commit -m "content(cybersecurity): AES disk image instead of zip -er; retention and storage obligations tied to their actual sources; OCAP scoped to First Nations" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Sanctions wording — banner and risk-mitigation measure

**Files:**
- Modify: `src/tools/compliance/NroLookup.jsx` (lines ~428, 435-439, 464, 471-479, 496-501)
- Modify: `src/data/riskMitigationData.js` (`dd-1` and `mon-1`)

- [ ] **Step 1: Tier 1 title and body**

Replace the Tier 1 title text:

```jsx
            ⛔ Tier 1 — Comprehensive sanctions (collaboration almost certainly prohibited)
```

Replace the Tier 1 `<p className="nro-sanctioned-body">` content:

```jsx
            <p className="nro-sanctioned-body">
              Canadian sanctions on these destinations prohibit dealings with listed persons —
              even indirectly through a third party — and the supply of a wide range of goods,
              technology and services, including research and development and scientific or
              technical assistance. Almost any research collaboration would involve a prohibited
              activity. Treat it as off the table unless Global Affairs Canada&rsquo;s Sanctions
              Bureau has confirmed that the specific activity is permitted. This applies whether
              or not an organization appears on the NRO list.
            </p>
```

- [ ] **Step 2: Tier 2 title and body**

Replace the Tier 2 title text:

```jsx
            ⚠️ Tier 2 — Broad sanctions (check the specific activity before engaging)
```

Replace the Tier 2 body content:

```jsx
            <p className="nro-sanctioned-body">
              Sanctions on these destinations are extensive but activity-specific: they
              prohibit dealings with listed persons and entities, and restrict named sectors,
              goods, technology and services. Research collaboration is not categorically
              banned, but you must confirm that no listed person, controlled item, restricted
              sector or prohibited service is involved — and that the partner is not owned or
              controlled by a listed entity. Your institution&rsquo;s research security or legal
              office should review any proposed partnership; some Canadian institutions have
              paused new collaborations in these jurisdictions.
            </p>
```

- [ ] **Step 3: Footer note — add the GAC academic guidance link**

Replace the `<p className="nro-sanctioned-note">` block with:

```jsx
        <p className="nro-sanctioned-note">
          This is a high-level summary for research collaboration decisions, not legal advice.
          Global Affairs Canada publishes{' '}
          <a href="https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng" target="_blank" rel="noopener noreferrer">guidance for academic and research institutions</a>
          {' '}and the authoritative, frequently-updated{' '}
          <a href="https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx" target="_blank" rel="noopener noreferrer">sanctions index</a>.
          Always confirm with your institution&rsquo;s research security or legal office before engaging.
        </p>
```

- [ ] **Step 4: Risk Mitigation `dd-1` — separate Canadian obligations from foreign lists**

Replace the `dd-1` measure's `why` and `how`:

```js
          why: 'Contravening Canadian sanctions regulations is an offence, and the prohibition on dealings with a listed person applies even when the dealing is indirect, through a third party. Sanctions apply to individuals as well as organizations, and to an organization owned or controlled by a listed person.',
          how: 'Check the Consolidated Canadian Autonomous Sanctions List (Global Affairs Canada) for the organization, its owners and its named personnel — that is the list that creates Canadian obligations. US (OFAC) and EU lists are worth checking as intelligence, and become binding where a US or EU legal nexus applies (US-origin technology, EU partners or funding). Aggregators such as OpenSanctions search several lists at once. A clear search does not clear the activity: the regulations also restrict goods, technology and services by sector.',
```

- [ ] **Step 5: Risk Mitigation `mon-1` — a later listing affects new applications, not an award automatically**

Replace the `mon-1` measure's `why`:

```js
          why: 'The NRO list is updated periodically. The STRAC Policy is not retroactive — an existing award is not reassessed when a partner is added — but any new application, renewal or extension is assessed against the list as it stands on submission, and the agencies reserve the right to consider affiliations of concern if a risk is identified. Knowing early gives you time to restructure before the next application.',
```

- [ ] **Step 6: Bump the file dates**

`src/data/riskMitigationData.js` line 2 → today's date. `NroLookup.jsx` has no date field.

- [ ] **Step 7: Check for other "criminal offence" / "no research engagement" phrasing**

Run: `grep -rniE "no research engagement|functionally prohibit|criminal offence" src/`
Expected: no matches.

- [ ] **Step 8: Browser check** — open `#nro-lookup`, expand both tiers: text renders, links open in new tabs, the `aria-expanded` toggles still work with the keyboard (Tab to the button, press Enter).

- [ ] **Step 9: Lint, test, commit**

```bash
npm run lint && npm test
git add src/tools/compliance/NroLookup.jsx src/data/riskMitigationData.js
git commit -m "content(sanctions): activity-specific wording per GAC academic guidance; separate Canadian obligations from foreign lists; NRO re-check reflects non-retroactive STRAC" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Export controls — no Canadian "deemed export"; Area Control List scope

**Files:**
- Modify: `src/data/faqData.js` (`ec-apply-universities`, `ec-international-student`)
- Modify: `src/data/exportControlData.js` (`area-control-list` description and its entry)

- [ ] **Step 1: FAQ `ec-apply-universities`**

Replace the answer with:

```js
            'Yes. Canadian export controls apply to university research just as they apply to commercial activity; the Export and Import Permits Act (EIPA) does not exempt academic institutions. If your research involves goods or technology on the Export Control List (ECL), transferring that technology to a person outside Canada may need an export permit — and the permit requirement applies regardless of the means of delivery, so an email, a shared cloud folder, remote access to a server, or technical assistance given over a call all count. Separately, examining, possessing or transferring goods on the Controlled Goods List inside Canada is regulated by the Controlled Goods Program, which requires the institution to be registered and the people with access to be security-assessed. Many universities have export control compliance programs; contact your institution\'s research compliance or legal office for guidance.',
```

Replace its `relatedTool` line with `relatedTool: 'export-control',` (unchanged) and its tags with:

```js
          tags: ['export', 'controls', 'universities', 'intangible transfer', 'controlled goods'],
```

- [ ] **Step 2: FAQ `ec-international-student`**

Replace the answer with:

```js
            'Usually yes. Canada does not have a "deemed export" rule — that is a US concept. Under Canadian law, sharing controlled technology with a foreign national who is physically in Canada is not an export. Two things still need checking. First, if the data is on the Export Control List and the student will access it from outside Canada, or you will send it to them abroad, that is an export by intangible means and may need a permit. Second, if the material is a controlled good under the Defence Production Act, domestic access is governed by the Controlled Goods Program, and the student may need a security assessment before being given access. Third, if the technology is of US origin, US export rules — including the US deemed-export rule — may travel with it. For most academic research that is published or publishable and does not involve controlled technology, none of this applies. When it might, consult your institution\'s export compliance office before sharing.',
```

Replace its tags with:

```js
          tags: ['export', 'controls', 'students', 'intangible transfer', 'controlled goods', 'US-origin'],
```

- [ ] **Step 3: Area Control List wording**

In `src/data/exportControlData.js`, replace the `area-control-list` section's `description` with:

```js
      description: "The Area Control List under the EIPA names countries to which the export of any goods or technology requires an export permit from the Minister of Foreign Affairs, regardless of the nature of the item. For researchers, this means that sending or transmitting any technology, data or technical assistance to a person in a listed country — even non-sensitive material — requires a permit. It does not, by itself, prohibit corresponding with a researcher there or co-authoring on the basis of published work.",
```

and the `acl-listed-countries` entry's `description` with:

```js
          description: "Any transfer of goods or technology — physical shipment, electronic transmission, remote access, or technical assistance — to a person or institution located in a country on the Area Control List requires an export permit, whatever the subject matter. Check the current list before any collaboration that would involve sending material there.",
```

- [ ] **Step 4: Confirm the phrase "deemed export" now appears only as a US concept**

Run: `grep -rn "deemed export" src/data/`
Expected: matches only inside the two rewritten FAQ answers, each qualified as US law.

- [ ] **Step 5: Lint, test, commit**

```bash
npm run lint && npm test
git add src/data/faqData.js src/data/exportControlData.js
git commit -m "content(export-control): drop the Canadian 'deemed export' framing; separate EIPA intangible transfers, the Controlled Goods Program and US-origin rules; ACL wording scoped to transfers" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Ontario flow — the Relevant Period runs to project completion and covers other projects

**Files:**
- Modify: `src/data/flowcharts/ontarioFlow.js` (nodes `check-collaborations`, `complete-attestation-a`, `complete-attestation-b`; `lastUpdated`)

- [ ] **Step 1: Replace the three node objects**

```js
    { id: "check-collaborations", type: "decision", label: "Any NRO connection during the Relevant Period?", description: "The Relevant Period runs from two years before the Named Researcher signs the Application Attestation Form through to the anticipated completion date of the proposed project — so planned and continuing connections count, not only past ones. Check whether any Named Researcher (the PI and every co-investigator named in the application) has a Collaboration with, affiliation with, or receipt of funding or in-kind support from an entity on the Named Research Organizations list — whether or not it relates to this project. \"Collaboration\" is broad: co-authorship, co-publication, joint research or funding, MOUs, joint degree or exchange programs, graduate supervision, visiting-scholar arrangements, and participation in foreign-funded programs.", policyRef: "Ontario RS Guidelines — Definitions (Relevant Period, Collaboration, Named Researchers); 2. Application Stage, a) Application Attestation Form", whyItMatters: "Ontario requires an attestation from every Named Researcher on every application, and the disclosure window is wider than the federal policies: it looks forward to project completion and across all of a researcher's projects.", crossLink: { tool: "nro-lookup", label: "Open NRO Lookup" }, yes: "complete-attestation-b", no: "complete-attestation-a" },
    { id: "complete-attestation-a", type: "action", label: "Complete Application Attestation Form (Option A)", description: "Every Named Researcher completes and signs their own Application Attestation Form. Option A states that the researcher has no Collaboration, affiliation, funding or in-kind support with an NRO during the Relevant Period — past, current or planned, on any project.", policyRef: "Ontario RS Guidelines — 2. Application Stage, a) Application Attestation Form", next: "complete-checklist" },
    { id: "complete-attestation-b", type: "action", label: "Complete Application Attestation Form (Option B)", description: "A Named Researcher with any NRO connection during the Relevant Period selects Option B and provides clarifying details of the association. Connections to other entities of concern that are not on the NRO list are addressed through the PI's risk assessment in the Checklist rather than through Option B. The PI must then set out mitigation measures for every Option B disclosure in the Checklist, and the researchers agree to go through the Ministry's risk mitigation process.", policyRef: "Ontario RS Guidelines — 2. Application Stage, a) Application Attestation Form", next: "complete-checklist" },
```

- [ ] **Step 2: Bump `lastUpdated`** to today's date on line 8.

- [ ] **Step 3: Run tests (graph shape unchanged; confirms no typo in ids)**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Browser check** — `#ontario-flowchart` Full View: the longer decision label wraps inside its diamond (the sizing code wraps by width; confirm no overflow). If it overflows, shorten the `label` to "Any NRO connection in the Relevant Period?" — the detail stays in `description`.

- [ ] **Step 5: Commit**

```bash
git add src/data/flowcharts/ontarioFlow.js
git commit -m "content(ontario): Relevant Period runs to project completion and covers all projects; Option B is NRO-specific" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: HANDOFF.md — Cloudflare steps for the response headers (owner action, documented)

**Files:**
- Modify: `HANDOFF.md` §4 (after the header block that ends with `Strict-Transport-Security: max-age=31536000; includeSubDomains`)

- [ ] **Step 1: Insert the subsection**

After the fenced block containing the three headers, insert:

```markdown
### Applying the headers on GitHub Pages: put Cloudflare in front

GitHub Pages cannot set response headers. The lowest-effort way to add them is Cloudflare's free plan as a proxy in front of `rs.rdmtoolkit.ca`. About an hour, no code change.

1. **Add the domain to Cloudflare** (free plan) and change the domain's nameservers at the registrar to the two Cloudflare gives you. Wait for the zone to show *Active*.
2. **DNS**: keep the existing record for `rs` (a CNAME to `seawaydigital.github.io`) and set it to *Proxied* (orange cloud).
3. **SSL/TLS → Overview**: set the mode to *Full (strict)*. GitHub Pages already serves a valid certificate.
4. **SSL/TLS → Edge Certificates**: turn on *Always Use HTTPS* and *HTTP Strict Transport Security (HSTS)* with max-age 12 months, include subdomains, no preload (preload is irreversible — decide separately).
5. **Rules → Transform Rules → Modify Response Header**: create one rule, expression `(http.host eq "rs.rdmtoolkit.ca")`, with three *Set static* headers:
   - `X-Content-Type-Options` = `nosniff`
   - `Content-Security-Policy` = `frame-ancestors 'none'`
   - `Permissions-Policy` = `camera=(), microphone=(), geolocation=()`
6. **Verify**: `curl -sI https://rs.rdmtoolkit.ca/ | grep -iE "strict-transport|x-content-type|content-security"` should print all three. Then load the site and the NRO map once; nothing else should change.

Do **not** enable Cloudflare's "Auto Minify", "Rocket Loader" or email obfuscation: they inject inline scripts, which the page's CSP (`script-src 'self'`) blocks, and they would break the site. Leave caching at the defaults; the Vite build already uses hashed asset filenames.
```

- [ ] **Step 2: Commit**

```bash
git add HANDOFF.md
git commit -m "docs(handoff): step-by-step Cloudflare setup for the response headers GitHub Pages cannot send" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: CLAUDE.md — record the corrected facts and the test gate

**Files:**
- Modify: `CLAUDE.md` (Key Decisions: "NSGRP flowchart accuracy" bullet; "Content verification" bullet; Deployment "Workflow" bullet)

- [ ] **Step 1: Replace the NSGRP accuracy bullet**

Find the bullet beginning `- **NSGRP flowchart accuracy**:` and replace it with:

```markdown
- **NSGRP flowchart accuracy (restructured 2026-09-18)**: the Risk Assessment Form trigger is **listed funding opportunity + at least one private-sector partner** (tri-agency implementation guidance, modified 2026-03-27) — not "Annex A AND Annex B". Annex A/B decide how much mitigation to describe; a "No" on either **never** routes to the no-RAF terminal, and `tests/flowcharts.test.mjs` asserts that. The named-researcher attestation is STRAC's, not NSGRP's, and is cross-linked rather than inlined. The program list in `check-program` is the guidance page's list as of 2026-09-18; re-check it when re-verifying content (F1 in `docs/superpowers/plans/2026-09-18-content-accuracy-and-launch-closeout.md`).
```

- [ ] **Step 2: Extend the content-verification bullet**

Append to the end of the bullet beginning `- **Content verification (2026-09-18)**:`

```markdown
 **Second pass (same date, from draft PR #21's audit, each re-verified against its primary source):** Canada has **no "deemed export"** rule (US concept) — EIPA covers intangible transfers *out of* Canada, the Controlled Goods Program covers domestic access; the RCR Framework sets **no retention period** (it defers to the funding agreement / institutional policy / law) so never state "7 years"; **OCAP® is First Nations**, not Indigenous-wide; sanctions are **activity-specific** (GAC academic guidance) — never "no research engagement" or "criminal offence" as a blanket; macOS `zip -er` is ZipCrypto — the guide uses Disk Utility AES images; Ontario's **Relevant Period** runs two years before signing through anticipated project completion and covers all of a researcher's projects.
```

- [ ] **Step 3: Deployment "Workflow" bullet — add the test**

In the bullet beginning `- **Workflow**:`, change `(npm ci, \`npm audit --audit-level=high\`, lint, build; …` to `(npm ci, \`npm audit --audit-level=high\`, lint, \`npm test\` — the flowchart graph-integrity suite in \`tests/\` — build; …`.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): record NSGRP trigger, second content-verification pass, and the test gate" \
  -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Full verification and pull request

- [ ] **Step 1: Clean build, lint, tests**

Run: `npm run lint && npm test && npm run build`
Expected: 0 lint errors; `# fail 0`; `✓ built`.

- [ ] **Step 2: Production preview walk-through**

Run: preview_start `rs-toolkit-preview` (serves `dist/`). Check, with console open and no errors:
- `#nsgrp-flowchart` Guided Mode: paths *Yes→No*, *No*, *Yes→Yes→No→No*, *Yes→Yes→Yes→Yes→Yes* each reach a sensible end.
- `#ontario-flowchart` Full View renders without overflow.
- `#cybersecurity-guide` Encryption → Mac shows Disk Utility steps.
- `#nro-lookup` both sanctions tiers expand.
- `#faq` search "deemed" opens the two export answers.
- Mobile (375px): `#nsgrp-flowchart` Guided Mode and `#cybersecurity-guide` have no horizontal scroll.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin claude/content-accuracy-fixes
gh pr create --base master --title "Content accuracy fixes from the PR #21 audit; flowchart integrity tests" --body-file - <<'EOF'
## Summary

Corrects six content defects on the live site, each re-verified against its primary source (facts table in `docs/superpowers/plans/2026-09-18-content-accuracy-and-launch-closeout.md`):

- **NSGRP flowchart**: the Risk Assessment Form is triggered by *listed program + private-sector partner*; Annex A/B no longer waive it, and STRAC's attestation is no longer presented as an NSGRP step. Guide and FAQ wording aligned.
- **Cybersecurity guide**: `zip -er` (ZipCrypto) replaced with Disk Utility AES-256; "7 years" retention removed in favour of the actual governing sources; storage-location and OCAP® claims scoped correctly.
- **Sanctions**: banner and risk-mitigation wording made activity-specific per Global Affairs Canada's academic guidance; Canadian obligations separated from US/EU lists; NRO re-check reflects non-retroactive STRAC.
- **Export controls**: Canadian "deemed export" framing removed; EIPA intangible transfers, the Controlled Goods Program and US-origin rules distinguished; Area Control List scoped to transfers.
- **Ontario flow**: Relevant Period runs to project completion and across all projects; Option B is NRO-specific.

Adds `tests/flowcharts.test.mjs` (node:test, no dependencies) to the `verify` gate: targets exist, all nodes reachable, decisions have both branches, every path ends, and a required RAF can never reach the no-RAF terminal.

HANDOFF.md gains Cloudflare steps for the response headers GitHub Pages cannot send.

Source: draft PR #21's audit (B01–B07), re-verified 2026-09-18.

## Verification
- `npm run lint` 0 errors · `npm test` pass · `npm run build` clean
- Production preview: all four NSGRP paths, Ontario Full View, Mac encryption steps, sanctions tiers, FAQ search, 375px width.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

- [ ] **Step 4: Wait for `verify` to pass, then hand to the owner to merge**

Run: `gh pr checks --watch`
Expected: `verify pass`. Do not merge; the owner merges (branch protection allows it once `verify` is green).

---

### Task 11: Launch close-out housekeeping (after the PR above is merged)

- [ ] **Step 1: Confirm the deploy**

Run: `gh run list --branch master --limit 1` → `success`. Then `curl -s https://rs.rdmtoolkit.ca/ | grep -c "script-src 'self'"` → `1`.

- [ ] **Step 2: Open the December content re-check issue**

```bash
gh issue create --title "Content re-verification due 2026-12-01" --body "Re-read these live sources and bump each file's lastUpdated only if it still matches:
- STRA list (11 categories) → straData.js, glossaryData.js, faqData.js
- NRO list (103 orgs, modified 2024-04-18) → nroData.js; FAQ nro-what count
- STRAC policy → stracFlow.js, triAgencyData.js, glossaryData.js, faqData.js
- Tri-agency NSGRP implementation guidance program list → nsgrpFlow.js check-program, triAgencyData.js, faqData.js nsgrp-what
- Ontario ON00708 → ontarioFlow.js
- GAC academic sanctions guidance → NroLookup.jsx banner, riskMitigationData.js dd-1
- Lakehead cybersecurity page → cybersecurityData.js
Procedure and the verified-facts table: docs/superpowers/plans/2026-09-18-content-accuracy-and-launch-closeout.md. Record the outcome in CLAUDE.md's Content verification bullet."
```

- [ ] **Step 3: Close draft PR #21 with a record of what was taken from it**

```bash
gh pr comment 21 --body "Closing as superseded. Master stays the product; this branch was mined for its audit. Taken and re-verified against primary sources: B01 (NSGRP RAF trigger), B02 (STRAC attestation/retroactivity — shipped in #22), B03 (Ontario Relevant Period), B04 (export-control deemed-export framing), B05 (sanctions wording), B06 (zip -er), B07 (retention/OCAP), B09's 'hundreds' count (#22), B10 (popup escaping — #22), B11 (external-request disclosure — How This Site Works page, #22). Not taken: the tool disablements, the 55-point map snapshot, the removal of the Pages deploy, and B08/B12/B13 product changes. Its verify-job idea became the verify gate on master. Thank you — the audit was the valuable part."
gh pr close 21
```

- [ ] **Step 4: Delete merged branches and this worktree**

```bash
git push origin --delete claude/site-security-audit-2633ee claude/content-accuracy-fixes
git worktree remove "C:/Users/ajaustin/Documents/Claude Code/RSToolkit/.claude/worktrees/nro-map-api-key-fix-af5385"
```

- [ ] **Step 5: Owner action, outside the repo**: apply the Cloudflare steps in HANDOFF.md §4, then run the `curl` verification line there.

---

## Out of scope (deliberately)

- **STRA wizard likelihood labels (B08)** and **risk-checklist persistence semantics (B12)**: product changes to two tools; each deserves its own brainstorm and plan.
- **Self-hosting fonts (B11 remainder)**: a privacy nicety, not a defect; the How This Site Works page discloses the Google Fonts request.
- **Pinning GitHub Actions to SHAs**: optional hardening; adds maintenance.
- **Adopting PR #21's Playwright suite**: 117 browser cases written against a different UI; porting is a project in itself.
