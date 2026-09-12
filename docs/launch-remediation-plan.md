# Research Security Toolkit: launch remediation plan

**Superseded on 12 September 2026 by the [two-person launch plan](two-person-launch-plan.md).** This document is retained as the earlier proposal. Its external staffing, independent-review dependencies and calendar estimate are no longer the implementation plan.

Prepared: 10 September 2026. Application baseline: `9fa4db4`.

**Objective:** resolve every item in the [launch safety review](launch-safety-review.md), then release a maintainable, accessible research-security reference and decision aid with verified policy boundaries and institutional escalation.

**Status: planning only.** This document does not mark any finding fixed, authorize publication, or record institutional approval. The existing audit remains the evidence baseline. All work packages below start open.

## 1. Scope and working decisions

The first release will support Lakehead researchers and research security professionals, with clearly scoped federal and Ontario guidance usable by readers at other Canadian institutions. Other institutions must be able to find their own support route without receiving Lakehead-specific operational instructions as universal requirements.

Use these implementation defaults unless a concrete requirement changes them:

1. Retain React, Vite, JavaScript modules, hash routing, static deployment and the current visual language. Introduce small shared utilities where they prevent inconsistent decisions. A framework rewrite, accounts, a case-management database and AI classification are outside this remediation.
2. Make NRO name/alias search entirely local. Remove the proximity-based identity/risk inference and arbitrary external geocoding from the first release. An optional map may show verified or explicitly approximate locations as reference information after an explicit user action. Removing a misleading feature is a valid permanent resolution; merely hiding its navigation link is insufficient.
3. Keep assessments in application memory by default. Offer explicit, labelled device persistence only after validation and migration work is complete. Retain no researcher names, confidential narratives or investigation targets in URLs, telemetry, fixtures or default browser storage.
4. Present policy scope, supporting sources, uncertainty and next steps alongside outcomes. Do not turn sensitivity, identity similarity, worksheet completion or a missing search result into a general clearance.
5. Use one reviewed set of rule definitions and source references across guided flowcharts, diagrams and related explanations. Keep authoritative policy, institutional procedure and recommended practice distinguishable.
6. Release an explicitly English interface initially, with official French links, bilingual policy terminology and honest coverage statements. A bilingual release requires a separately reviewed French interface/content pass and equivalent tests. Do not claim nationwide institutional or bilingual endorsement.
7. Treat external policy pages and data updates as review inputs. Automated checks may propose changes; they must not silently rewrite published eligibility rules.

The plan covers all 25 audit items. Some require a human determination before the affected advice can be enabled. Engineering and draft preparation can proceed while those determinations are pending.

## 2. Owners and review responsibilities

Assign people to these roles during Phase 0. Names and approvals are currently unassigned.

| Role | Accountable for | Concrete review package |
| --- | --- | --- |
| Release owner / product owner | Audience, feature scope, ownership, maintenance resources and release decision | Scope statement, unresolved items, release record and rollback plan |
| Developer | Code, data schemas, tests, accessible interaction, build and release artifacts | Reviewable changes, reproducible test reports and before/after scenarios |
| Research security / grants policy lead | NSGRP, STRAC, applicable competitions, Ontario forms, STRA and NRO guidance | Rule matrix, source references, expected outcomes and unresolved interpretations |
| Legal / export-control / sanctions specialist | Legal boundaries, foreign-origin controls, sanctions, disclosure and reporting assurances | Claim-by-claim revisions and realistic synthetic cases |
| Lakehead TSC / information security | Approved accounts, encryption, recovery, device guidance and technical security | Tested procedures, network inventory, vulnerability disposition and hosting configuration |
| Privacy, REB and RDM reviewers | Data collection, storage, retention, participant commitments and provider use | Data-flow inventory, persistence behavior and storage/retention decision examples |
| Appropriate Indigenous governance advisers | Community-specific applicability and correct treatment of First Nations, Inuit and Métis governance | Revised governance text, scope and escalation routes |
| Accessibility reviewer and representative users | Keyboard, assistive technology, comprehension and task completion | Core journeys, print samples and observed failures |
| Repository / domain administrator | Access controls, deployment restrictions, DNS, hosting and recovery | Actual settings evidence and rollback rehearsal |

Prepare concrete wording, implementation and test evidence before seeking a final review. A developer can prepare a revision; that does not constitute specialist or institutional endorsement. No outreach is performed as part of this planning task.

## 3. Sequence and dependencies

| Phase | Deliverable | Depends on | Indicative implementation effort |
| --- | --- | --- | --- |
| 0 | Containment candidate and assigned review responsibilities | Audit | 1–2 days |
| 1 | Reliable checks, source registry and rule contract | Phase 0 | 3–5 days |
| 2 | Corrected policy, legal and operational guidance | Phase 1; specialist input | 6–10 days |
| 3 | Local, evidence-based NRO lookup and safe optional map | Phase 1; NRO review | 3–5 days |
| 4 | Safe worksheet state and accessible core interactions | Phase 1; reviewed question semantics | 4–6 days |
| 5 | Navigation, complete printouts and institutional context | Phases 2 and 4 | 3–5 days |
| 6 | Production protections and operating procedures | Starts in Phase 1; final network scope from Phase 3 | 3–5 days |
| 7 | Independent validation, pilot and release record | Phases 2–6 | 3–5 active days, plus pilot elapsed time |

These are rough planning estimates for one experienced implementer, including content preparation, tests and documentation: **26–43 working days**, excluding specialist turnaround, a proposed two-week pilot, substantial hosting migration and a full French translation. Re-estimate after Phase 1. The current scope does not support a dependable fixed launch date.

The critical dependency is: **reviewed rule/source contract → corrected outcomes → scenario verification → institutional/user review → release**. NRO, accessibility, build and hosting work can progress while policy questions are with reviewers.

## 4. Phase 0: contain known problems and establish the baseline

**Audit coverage:** immediate containment for B01–B13; foundations for R01, R10 and R12.

- [ ] Inventory the actual public release and compare its version with the local baseline. The site already responds publicly, so treat containment as a possible corrective release rather than assuming nobody can access it.
- [ ] Prepare a small containment change: gate unreviewed decision tools and misleading proximity screening; replace known incorrect legal/encryption passages with scoped official-source links and a support route until replacements are reviewed. Preserve existing hash routes with an explanatory unavailable state. Cover direct links, Home scenarios, related links and search.
- [ ] Add a simple feature/content status configuration, for example `src/data/releaseStatus.js`, checked at routing and rendering boundaries. Exclude disabled features' external requests and misleading instructions from the public build where feasible. Document that a build-time switch requires a deploy and cannot recall already printed or cached material.
- [ ] Record the 25 findings in a work tracker with status, proposed owner, resolution, verification evidence and reviewer. Statuses: Open, In progress, Ready for review, Verified, or Removed from release. Containment alone does not mean Verified.
- [ ] Correct the obsolete project instructions as part of the containment work. `CLAUDE.md` currently instructs developers to preserve the wrong NSGRP RAF trigger and makes unsupported claims about geocoding suitability and effective security headers. Mark those entries superseded by the audit until reviewed replacements exist. Update inaccurate inventory paths and coordinate-confidence claims when their corresponding implementation changes land.
- [ ] Establish a known baseline artifact and document existing unrelated/untracked work. Keep remediation changes isolated and avoid changing unrelated design or content.

**Completion evidence:** every known affected route has a reviewed containment disposition; no gated route still renders the old advice through a direct URL; owners and unresolved questions are recorded. Prepare the candidate locally before any publication decision.

## 5. Phase 1: establish source provenance and meaningful checks

**Audit coverage:** R01, R08, R09; supports all policy findings.

### 1A. Build and test foundation

- [ ] Fix ESLint scope so generated files and nested worktrees are excluded, while application, configuration, scripts and new tests remain checked. Resolve the actual scoped errors rather than suppressing the rule set globally.
- [ ] Review dependency advisories, update the smallest compatible set, inspect the lockfile diff and repeat the applicable checks. Record remaining advisories by affected environment and reachability, with an owner and expiry for any exception. Avoid using a forced major upgrade as a substitute for analysis.
- [ ] Align local development and CI on a supported Node version compatible with Vite and the chosen test tools. The workflow currently specifies Node 20; do not install current test tooling without checking its engine requirements. Pin and document the selected version.
- [ ] Add Vitest for pure rules, graph validation, data and persistence tests; add Playwright for browser journeys. Keep their configuration and tests in JavaScript to match the repository. Use a narrow automated accessibility check alongside manual review, not as a conformance certificate. See [Vitest setup and runtime requirements](https://vitest.dev/guide/) and [Playwright setup and supported environments](https://playwright.dev/docs/intro).
- [ ] Add proposed scripts `test`, `test:policy`, `test:e2e` and `check:data`. Run lint, deterministic tests and build in pull-request CI before allowing deploy. Browser tests should run against the built app. External services are mocked in routine tests; the real network checks belong to explicit release verification.
- [ ] Start with regressions for the known RAF exemption, malformed saved state, popup markup and modal focus escape. Add the remaining acceptance cases with their respective fixes. Expectations must come from reviewed policy examples, not be copied from the existing flowchart.

### 1B. Source and outcome contract

- [ ] Add a small `src/data/policySources.js` registry with stable source IDs, publisher, official URL, document/version date, effective period where relevant, retrieval date, verified date, review due date and review status. Unknown fields remain unknown; retrieval must not imply verification.
- [ ] Give consequential claims and rules stable IDs linked to sources and a precise section/question/page. Store review rationale and unresolved questions in `docs/policy-rule-matrix.md`; keep unnecessary reviewer personal information out of the public bundle.
- [ ] Extend the existing flowchart data minimally to represent unknown/unsupported answers and scoped outcomes. Guided mode and Full View must read the same transitions, including uncertainty branches. Prefer simple pure evaluation helpers over a generic rules engine or new framework.
- [ ] Standardize outcome information: policy/program scope, information supplied, relevant source/version, result, unresolved questions and next action. A policy-specific result must not imply overall funding, sanctions or export clearance.
- [ ] Validate source references, dates, claim IDs, node IDs, transitions, reachability and terminal states. Mark overdue sources visibly; decide and encode a review deadline per source. A confirmed material change or expired review for a consequential rule disables that rule's definitive result until review.

**Completion evidence:** a clean checkout can run the checks; representative failing cases are established and fixed as changes land; the rule matrix can be reviewed without reading React; source dates and approval states are truthful.

## 6. Phase 2: correct policy and professional guidance

**Audit coverage:** B01–B08; R01, R03 and R04; reporting content in R10.

### 2A. NSGRP, STRAC and Ontario

- [ ] **NSGRP:** replace the blanket federal-funding question with program/competition applicability and qualifying partner questions. Separate RAF submission from research sensitivity, partner findings, mitigation and agency referral. Include an unknown-program route. Review applicable partner definitions and CFI separately. Remove the unrelated blanket attestation step. The current [official NSGRP guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance) distinguishes mandatory RAF submission for in-scope partnerships from subsequent risk review.
- [ ] **STRAC:** encode the reviewed treatment of affiliation, funding and in-kind support; attesting named roles versus compliance across funded work; applicable competition/list versions; historical awards, extensions and changes. Remove unsourced annual-attestation and automatic-retroactivity claims. Review against the [official STRAC implementation guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-0).
- [ ] **Ontario:** show the complete disclosure period, planned and unrelated-project connections, provincial collaboration definitions, correct forms/signatories and separate treatment of other concerns. Preserve the distinct provincial process.
- [ ] Sweep every related FAQ, glossary definition, checklist item, mitigation measure, Home description and project instruction for contradictions. Reuse source/rule references and link to the canonical explanation where repeating detailed rules would cause drift.

**Files:** `src/data/flowcharts/nsgrpFlow.js`, `stracFlow.js`, `ontarioFlow.js`; `src/data/faqData.js`, `glossaryData.js`, `triAgencyData.js`, `riskChecklist.js`, `riskMitigationData.js`; `src/components/ui/FlowchartGuidedMode.jsx`, `FlowchartFullView.jsx` and `FlowchartViewer.jsx`; actual wrappers are in `src/tools/flowcharts/`.

**Evidence:** approved positive, negative and uncertain scenarios; funding-only/in-kind-only cases; temporal/list-version cases; exact agreement between both flowchart modes and the related reference text. The NSGRP no-risk partnership regression must pass.

### 2B. STRA wizard

- [ ] Review all questions in `src/data/straWizard.js` against `src/data/straData.js` and official subcategories. Replace broad technology-use shortcuts with questions about the actual research contribution, including fundamental and multidisciplinary work.
- [ ] Add a meaningful uncertain route wherever the user may lack enough information. Replace ambiguous likelihood/risk badges with the reviewed outcome vocabulary. Explain the candidate subcategory and which answer led there.
- [ ] Create independent positive, negative and ambiguous examples across all local categories, with extra cases for mere use versus advancement and mixed projects. Review both false inclusion and false exclusion.
- [ ] Keep the wizard disabled until those examples and labels are approved; retain the reviewed searchable STRA reference in the meantime. Validation must cover all reachable branches, not only a sample happy path.

**Files:** `src/data/straWizard.js`, `src/data/straData.js`, `src/tools/compliance/StraLookup.jsx`.

### 2C. Export controls, sanctions and fairness

- [ ] Prepare specialist-reviewed replacements distinguishing Canadian exports, domestic controlled-goods access, applicable foreign-origin controls and sanctions. Use Canadian-lab, overseas-access and US-origin examples. Remove blanket nationality-based implications and broad country-level research prohibitions.
- [ ] Remove the sanctions tier system from NRO identity results unless each retained statement can be justified precisely. Provide a separate, scoped official-sanctions reference and institutional escalation route. Do not make NRO status stand in for sanctions status.
- [ ] Replace blanket background-check recommendations with proportionate, evidence-based due diligence. Explain mistaken identity, corroboration, appropriate record handling, correction and review of consequential findings. Remove the presumption that a Canadian company is automatically lower risk.
- [ ] Correct the unsourced reporting-protection assurance and wording that could delay urgent reporting. Clearly distinguish an urgent institutional incident from an ordinary toolkit content correction.

**Files:** `src/data/exportControlData.js`, `faqData.js`, `glossaryData.js`, `riskMitigationData.js`, `triAgencyData.js`; `src/tools/compliance/NroLookup.jsx` and relevant reference renderers.

**Evidence:** legal reviewer disposition for each consequential claim; no country, citizenship, language or fuzzy name match alone produces a person-level accusation or clearance. Any legal use of nationality or jurisdiction must be tied to the applicable regime and reviewed process.

### 2D. Cybersecurity, privacy and Indigenous governance

- [ ] Replace weak archive-encryption instructions. Have TSC demonstrate the chosen methods, supported recipients, recovery, backups and recovery-key handling using synthetic files.
- [ ] Verify institutional MFA, password manager availability, account types, managed-device recovery and VPN instructions. Remove unsupported entitlements and personal-account defaults. Cover patching, phishing reporting and incident response through approved Lakehead procedures.
- [ ] Rewrite storage and retention guidance as scoped questions about applicable policy, data classification, consent/REB commitments, agreements, funder and community requirements. Remove universal geography and duration claims.
- [ ] Have appropriate advisers correct Indigenous governance scope and escalation. Avoid treating a general checklist or a single framework as community consent.
- [ ] Review AI guidance by approved service/account and data classification; make uncertainty route to IT/REB/RDM review.

**Files:** `src/data/cybersecurityData.js`, `src/tools/operational-security/CybersecurityGuide.jsx`, plus related FAQ and mitigation entries.

**Phase 2 completion evidence:** a coherent reviewed content set, with exact sources and scenario outcomes. Unresolved interpretations remain visibly unavailable or refer to a qualified reviewer; they are not resolved by inventing conservative-sounding restrictions.

## 7. Phase 3: rebuild NRO lookup around verifiable local evidence

**Audit coverage:** B09–B11; privacy aspects of R03 and R07.

- [ ] Reconcile every local NRO entry with the official list, including aliases, parent/sub-organization relationships and version. Preserve stable local IDs. Record provenance for added aliases and distinguish official aliases from locally curated search aids. Do not infer missing records from the difference between nested official headings and flattened local rows.
- [ ] Define separately exact-name/alias results and possible search candidates. Show source, applicable list version, distinguishing context, active filters and coverage limits. Provide an explicit reset when filters hide results. Do not claim verification of a real-world relationship from a name match alone.
- [ ] Remove proximity-based identity/risk matching, arbitrary institution geocoding and automatic provider fallback from the release. Retain curated location display only if useful after review. Unverified coordinates are omitted or plainly approximate, never manufactured for a cleaner map.
- [ ] Replace all Leaflet popup HTML interpolation with safe DOM text construction. Validate any retained external response and coordinate values. Check other rendering sinks and external URLs too.
- [ ] Load an optional map only after a clear explanation and affirmative action. Self-host licensed fonts and necessary assets, or use system fallbacks. The default home, policy, worksheet and NRO search journeys must make no unapproved third-party requests. Describe hosting/CDN logs accurately; local-only search does not mean the host receives no connection information.
- [ ] Rename global search to “Find a tool” for the first release and remove promises of organization/content search. Entity searches belong to the clearly labelled local NRO search. This is smaller and less ambiguous than introducing a second comprehensive entity index.
- [ ] If external geocoding is later proposed, require a separate provider/privacy design covering permitted inputs, aggregate application limits, service identification, cancellation, timeouts, 429 handling, logging, jurisdiction and disclosure. A per-browser debounce cannot establish compliance with an application-wide limit. Do not add a proxy just to retain this feature in the first release.

**Files:** `src/data/nroData.js`, `src/tools/compliance/NroLookup.jsx`, `src/components/ui/SearchBar.jsx`, `src/components/layout/Topbar.jsx`, `src/components/home/Home.jsx`, `index.html`, `public/` and source/style metadata. Add small NRO search/validation utilities only where they allow direct testing.

**Completion evidence:** reconciled records; name/alias/homonym and filter cases; inert markup tests; an observed network allowlist for default and opt-in states; failed tile loading leaves the complete text search usable. Tests confirm removed geocoding endpoints are never contacted.

## 8. Phase 4: make worksheets and core interactions dependable

**Audit coverage:** B12, B13; state foundations for R05 and R06.

### 4A. Worksheet state and privacy

- [ ] Add a lightweight assessment context above tool components. Give each working assessment an opaque local ID, creation/update dates and a content/schema version. A non-sensitive label may be optional; never require a project title or researcher identity.
- [ ] Use memory by default. Make “Remember on this device” explicit with a shared-device notice and visible save/failure status. Explain reload/close behavior in each mode. A new assessment starts blank; resuming saved data requires an explicit choice.
- [ ] Validate allowed question IDs, answer values, schema and content version. Treat legacy `rs-toolkit-checklist-v1` data as an unverified previous worksheet. Do not silently merge, reinterpret or discard it: explain its limitations and offer an explicit review/reset path. Changed question semantics require re-answering.
- [ ] Keep answer values distinct from interpretation. Preserve unanswered, unknown and not applicable states; use consistently worded questions or explicit per-item meaning. Count “answered” separately from risks and unresolved questions. Avoid implying “no risk” beyond the information considered.
- [ ] Provide New assessment, Resume, Clear saved data and an undoable reset with understandable consequences. Clearing saved data must not leave a hidden copy under an obsolete storage key. Never claim browser storage is an institutional records repository or securely encrypted merely because it is local.
- [ ] Do not put answers or organization queries in hash parameters, document titles, errors or analytics. Limit reports and fixtures to synthetic cases.

### 4B. Accessible controls and feedback

- [ ] Repair the global search dialog with a name, input label, focus entry/trap, Escape and restoration. Handle empty results and loading/error announcements.
- [ ] Replace mouse-only rows/suggestions with native keyboard controls. Make flowchart node details available through an equivalent keyboard/text view; make mode switching and checklist selections programmatically understandable.
- [ ] Test visible focus, headings, landmarks, target size, contrast, zoom/reflow and status messages across the existing design. Keep map and SVG alternatives useful rather than decorative fallbacks.
- [ ] Use the audit's WCAG 2.2 AA engineering target and have accessibility staff determine the applicable institutional/legal requirements.

**Files:** `src/App.jsx`, `src/tools/compliance/RiskChecklist.jsx`, `src/data/riskChecklist.js`, `src/components/ui/SearchBar.jsx`, flowchart UI components, NRO controls and `src/styles/global.css`. Proposed additions: `src/state/AssessmentContext.jsx` and narrowly scoped storage/answer utilities.

**Completion evidence:** separate project A/B journeys; corrupt, old and blocked storage; explicit resume; reset/clear; all-risk/all-unknown completion; keyboard and screen-reader completion. No unreviewed legacy answer becomes a verified current answer.

## 9. Phase 5: preserve context and produce trustworthy outputs

**Audit coverage:** R02, R05, R06 and R11.

- [ ] Lift guided history/mode state into the assessment context where needed, keyed by tool and content version. Cross-tool lookup, Back/Forward and view switching must preserve valid work. A content change invalidates affected paths visibly.
- [ ] Replace the total-graph-node progress calculation with a meaningful path-based status, such as the current step and an explicit completed result. Do not promise a total before the branch is known. Add a reviewed summary and next actions.
- [ ] Give unknown routes, lazy-chunk failures and stale content a clear recovery state with official links. Avoid exposing raw internal error text or presenting Home as if a requested assessment had succeeded.
- [ ] Build dedicated print rendering from the data and assessment state, independent of collapsed accordions and filters. Default to complete intended output; any subset must be labelled. Include scope, unanswered/unknown items, relevant sources, content version, generation date and institutional-review limits.
- [ ] Test A4/Letter, page breaks, long content, grayscale and no-result/partial/risk-heavy states. Browser print preview and actual PDF inspection are required; DOM assertions alone do not show pagination.
- [ ] Add a lightweight institution context with a clearly labelled Lakehead option and an “Other institution” route. Include reviewed research security, grants, TSC, REB/privacy and RDM contact links beside uncertain outcomes. Avoid a sensitive intake form.
- [ ] Add About/Scope, Privacy, Sources/Updates and Help content reachable throughout the app. Label federal, Ontario and institution-specific coverage. Prepare bilingual terminology/official French links; record a separate translation and parity-test backlog before any bilingual launch claim.

**Files:** `src/App.jsx`, flowchart UI and wrappers, `RiskChecklist.jsx`, `RiskMitigation.jsx`, layout components, `toolRegistry.js` and `global.css`. Proposed additions: small shared source/context/output components and `src/data/institutionProfiles.js`; keep hash routes and existing styling conventions.

**Completion evidence:** a researcher can pause a flow, check a source/entity, return and print a complete, intelligible result. A reader outside Lakehead receives an appropriate institutional route and accurate coverage limits.

## 10. Phase 6: production controls and maintenance

**Audit coverage:** R07, R08, R10 and R12; continuing R01.

- [ ] Inventory actual production responses and remaining external destinations. Configure CSP and other headers through a host or edge that supports them. Remove unnecessary inline script allowance; handle Leaflet/React style requirements deliberately rather than breaking the map to obtain a nominally strict policy. Verify anti-framing through a response policy, MIME-type protection, referrer behavior and HTTPS. Review HSTS scope with the domain owner before applying it to subdomains.
- [ ] Prefer a minimal hosting change if existing infrastructure can enforce the controls. If it cannot, prepare a concrete host/edge migration with cost, data handling, domain/asset behavior and rollback for the owner to review. Test the candidate before changing DNS or production deployment.
- [ ] Separate pull-request checks from deployment authority. Restrict permissions, review third-party Actions and pin them appropriately, inspect dependency changes, and verify branch/environment protections in actual settings. Never expose deployment credentials to untrusted pull-request code. Confirm maintainer MFA/recovery and domain ownership with administrators.
- [ ] Build once, verify the artifact, and promote that exact artifact. Record the commit, content versions, runtime and dependency lockfile. Verify both the canonical custom domain and any supported legacy base path. Confirm the output contains no secrets, local worktrees or confidential fixtures.
- [ ] Add `SECURITY.md`, a private report route, and an incident/correction runbook. Define how to triage an incorrect rule, disable it, issue a material correction, and recover a previous reviewed release. Do not send security reports to a public issue by default.
- [ ] Establish source review deadlines, a policy-change intake process and a dependency-review cadence. A proposed starting practice is a monthly review of dynamic sources and a full pre-release review, adjusted by the responsible reviewers. Any material change is reviewed promptly rather than waiting for the calendar. Automated link/source checks create review evidence, not automatic approval.
- [ ] Document ownership and institutional endorsement accurately. Have the owner choose a code license after checking content, data, fonts and map attribution; do not assign a license to third-party material without authority. Correct README and `CLAUDE.md` claims and source URLs.
- [ ] Set a backup maintainer, response responsibilities, support limits and retirement behavior. When maintained decision guidance cannot be provided, make the limitation visible and route readers to official sources.

**Files/artifacts:** `index.html`, `vite.config.js`, `package.json`, lockfile, `eslint.config.js`, `.github/workflows/`, `README.md`, `CLAUDE.md`, `SECURITY.md`, attribution/license material and `docs/operations-runbook.md`. Host settings and organizational approvals require evidence outside repository files.

**Completion evidence:** observed production-like headers and network behavior, passing required checks, settings review, known artifact identity, documented maintenance ownership, and a successful rollback/correction rehearsal.

## 11. Phase 7: acceptance, pilot and release

**Audit coverage:** closure of B01–B13 and R01–R12; especially R09.

- [ ] Implement and review all 19 scenario families in the audit. Expand them for program definitions, dates, question polarity, aliases, French terminology and the supported browser matrix. Record expected outcomes independently of the implementation.
- [ ] Run rule/data tests and browser tests against the candidate build. Include Chromium, Firefox and WebKit, narrow/mobile layouts, keyboard and zoom. Manually validate representative supported assistive-technology combinations, such as NVDA with a Windows browser and VoiceOver with Safari, with appropriate reviewers.
- [ ] Inspect local persistence, request destinations, optional map failure, safe popup rendering and direct-route gating. If geocoding is removed, record that its failure scenarios are resolved by removal and prove no corresponding requests remain.
- [ ] Inspect printed PDFs and complete the live/candidate host controls review. Record which checks use the exact release artifact and which require a production smoke check.
- [ ] Run synthetic walkthroughs with researchers, a research security/grants professional, accessibility expertise and a reviewer from another Canadian institution. Evaluate comprehension and harmful interpretations, not merely whether buttons work. Do not collect real investigations or identifiable research cases in test tools.
- [ ] Conduct a proposed two-week limited pilot of the approved candidate. Keep its audience, scope and support route explicit. Provide private feedback without sending case details to general analytics. A limited reference pilot may precede full decision-tool readiness, but cannot close deferred decision-tool findings.
- [ ] Triage pilot failures against the audit, fix consequential misunderstandings and retest affected journeys. Revalidate authoritative sources before release; do not assume a review from the start of the project is still current.
- [ ] Complete a release record listing each audit item's disposition, evidence, actual reviewer, version, dates, remaining limitations and next review deadline. Obtain scoped institutional reviews of the concrete candidate and the release owner's final decision.
- [ ] After authorized publication, verify critical policy routes, local search, no unexpected third-party requests, support links and response headers on the real domain. Run the documented rollback or containment procedure if a consequential regression appears.

**Release rule:** every exposed launch blocker must be Verified or explicitly Removed from release, and all release requirements must be satisfied for the advertised scope. An unresolved legal/policy interpretation, missing institutional approval claimed by the UI, or unverified consequential outcome prevents that claim/function from launching. Passing a build, an audit with zero advisories, or an automated accessibility scan is insufficient alone.

## 12. Suggested change packages

Keep each package reviewable; split it further if necessary. These are proposed pull requests, not requests already created. Use `codex/` branch names when implementation begins.

| Package | Change | Dependency |
| --- | --- | --- |
| P01 | Containment, route gating and superseded project instructions | Baseline |
| P02 | Lint scope, runtime/dependencies, test harness and PR checks | P01 |
| P03 | Source registry, rule contract and review matrix | P02 |
| P04 | NSGRP correction and regression cases | P03; policy review |
| P05 | STRAC and Ontario corrections with cross-content reconciliation | P03; policy review |
| P06 | STRA question/outcome validation | P03; subject-matter review |
| P07 | Export, sanctions, fairness and reporting corrections | P03; specialist review |
| P08 | Cybersecurity, retention, residency and governance corrections | P03; TSC/REB/RDM/governance review |
| P09 | NRO reconciliation, local search, removed proximity/geocoding, safe optional map | P03; data review |
| P10 | Assessment state, explicit persistence and legacy handling | P03; question semantics |
| P11 | Keyboard, dialog, selection and accessible alternatives | P09/P10 where affected |
| P12 | Flow continuity, result summaries and complete print views | P04–P06, P10 |
| P13 | Lakehead/national context, Help/About/Privacy and language scope | P07/P08; contact review |
| P14 | Hosting controls, release access, artifact verification and rollback | P02/P09; administrator access |
| P15 | Licensing/attribution, maintenance and source-change procedures | P03/P13/P14; owner decisions |
| P16 | Complete acceptance evidence, pilot corrections and release record | P04–P15 |

Every package includes its relevant tests and source/documentation updates. P16 integrates and independently verifies the work; it must not be the first time safety scenarios are exercised. Updating `CLAUDE.md` is part of changes to tools, architecture, data and conventions.

## 13. Coverage of every audit finding

| Audit item | Primary package(s) | Closure evidence |
| --- | --- | --- |
| B01 NSGRP | P04 | Reviewed RAF/program/partner cases and no-risk regression |
| B02 STRAC | P05 | Connection, role, temporal and cross-content cases |
| B03 Ontario | P05 | Relevant-period, collaboration and form examples |
| B04 Export controls | P07 | Specialist-reviewed domestic/overseas/foreign-origin examples |
| B05 Sanctions | P07/P09 | Scoped claims; removed unsupported tier/clearance behavior |
| B06 Encryption | P08 | Approved creation, transfer, opening and recovery demonstration |
| B07 Data governance | P08 | Scoped retention/residency/community-governance review |
| B08 STRA wizard | P06 | All branches and category examples reviewed, or wizard withheld |
| B09 NRO identity | P09 | Reconciled records and alias/homonym/filter tests; removed proximity inference |
| B10 Popup injection | P09 | All popup values inert; validation and sink review |
| B11 External disclosure | P09/P13 | Default network inventory, opt-in map behavior and accurate notice |
| B12 Checklist safety | P10 | Explicit project/resume/version/state handling and failure cases |
| B13 Accessibility | P11/P16 | Keyboard and assistive-technology journey evidence |
| R01 Provenance/freshness | P03/P15 | Claim/source links, reviewers, deadlines and stale-rule behavior |
| R02 Institutional routes | P13 | Verified Lakehead contacts and other-institution route |
| R03 Fairness | P07/P09/P16 | Proportionate screening and comprehension/correction scenarios |
| R04 Managed IT guidance | P08 | TSC-reviewed accounts, entitlement and device instructions |
| R05 Print reliability | P12/P16 | Inspected complete/versioned A4 and Letter outputs |
| R06 Navigation/context | P12 | Cross-tool, Back/Forward, mode and recovery cases |
| R07 Hosting protections | P14 | Actual response/browser tests and host-owner disposition |
| R08 Build/supply chain | P02/P14 | Reproducible checks, advisory dispositions and settings evidence |
| R09 Meaningful testing | P02/P16 | Reviewed scenario suite and independent walkthroughs |
| R10 Incident/correction | P07/P15/P16 | Corrected reporting advice and rehearsed private correction/rollback process |
| R11 National/language scope | P13/P16 | Honest jurisdiction/language coverage, French resource access and outside-institution review |
| R12 Ownership/reuse/operations | P15/P16 | Operator/license/maintenance decisions and completed release record |

## 14. Evidence and closeout format

Use this record for each audit item. Do not prefill approval names or dates.

```text
Audit item:
Resolution: fixed / removed from release
Implementation package and commit:
Official source and version, where applicable:
Scenario IDs and observed outcomes:
Automated evidence:
Manual / specialist evidence:
Reviewer and scoped decision:
Remaining limits:
Release version and closure date:
Owner and next review date:
```

Separate evidence of an implemented change from evidence of a reviewed policy interpretation. Keep confidential comments and internal security configuration in an institution-approved restricted location; the repository can contain sanitized findings and references. Record only actual completed checks.

The implementation can begin with P01–P03 while policy and institutional review packages are prepared. Full launch remains dependent on verified behavior and the documented scope-specific reviews.
