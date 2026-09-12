# Research Security Toolkit: two-person launch plan

Updated: 12 September 2026. Current application baseline: `9fa4db4`.
Execution update: the plan has been implemented as candidate 0.1.0-rc.1 on codex/launch-safety, integrated with master 3a44e38. The historical checkboxes below describe the approved plan, not current completion evidence. Use [launch-closure-record.md](launch-closure-record.md) for actual results, exclusions and remaining owner/hosting steps.

**Objective:** you and I will address all 25 findings in the [safety review](launch-safety-review.md) and prepare a tested public release with claims and features that the available evidence supports.

This supersedes the [10 September implementation plan](launch-remediation-plan.md). No outside reviewer, consultant, institutional committee, translation service or user-recruitment exercise is a prerequisite in this plan. The old staffing assumptions and 26–43-day estimate do not apply. The sections below preserve the plan as approved; the execution update and closure record above describe subsequent implementation.

## 1. What we will launch

The product will be a source-backed research-security reference, document-preparation aid and set of bounded policy walkthroughs. It can be useful to Lakehead researchers and research security professionals across Canada without claiming to make institutional decisions.

The lack of additional reviewers changes what we can responsibly assert. We will correct defects, directly verify explicit rules, and replace unsupported judgments with useful reference workflows. We will record any lost functionality and remaining uncertainty. Repeated reviews by the same assistant are self-review, not independent validation.

| Existing capability | Launch implementation |
| --- | --- |
| NSGRP, STRAC and Ontario flowcharts | Retain and correct. Each supported branch follows an identifiable official requirement, with program/date scope and a specific result. Unknown or unsupported circumstances end with the exact missing information and relevant official instructions. |
| STRA search and wizard | Retain searchable official categories. Replace the likelihood classifier with a guided category explorer that helps the user inspect relevant subcategories and record their own assessment. No automatic sensitivity determination or confidence score. |
| NRO search and map | Retain a reconciled local name/alias lookup with source/version information. Remove the map, proximity inference and external geocoding from the first release. Keep useful country/parent-organization context as sourced text. |
| Risk checklist | Retain as a temporary, clearly scoped worksheet. Add explicit unknown/unanswered states, safe project separation and optional validated device persistence. |
| Mitigation, export, sanctions and cybersecurity references | Retain practical source-backed information. Remove blanket legal conclusions and instructions we cannot verify for the stated environment. Link to the precise authoritative procedure where reproducing it would introduce unsupported assumptions. |
| FAQ, glossary, tri-agency guide and printing | Reconcile with the same source records and rule definitions. Make outputs complete, dated, versioned and clear about unresolved matters. |
| Lakehead and Canadian context | Provide verified public Lakehead links and clearly separate federal, Ontario and local scope. Default to independently operated unless you can substantiate institutional status. |
| Language/accessibility | Launch an explicitly English interface with official French resources and bilingual policy terminology. Implement and test accessible core journeys; publish the actual testing scope rather than an unsupported conformance certification. |

Removing the map from this release resolves its exposure and misleading inference problems; it does not establish that the old coordinates were accurate. The original STRA classifier will likewise be recorded as replaced, not validated. We can reconsider such features later with a separate evidence-based design.

## 2. Our responsibilities

**I will own the implementation and evidence preparation:** inspect and amend code; research primary sources; maintain claim/rule records; reconcile data; write and run tests; inspect browser behavior and printed output; prepare hosting changes; document limitations; and produce a concrete release candidate and rollback procedure.

**Your involvement will be limited to decisions and checks I cannot supply:**

- Confirm the public operator/contact, what branding and institutional status you can truthfully claim, and the rights needed to license your original code/content. The default is an independent resource with no invented endorsements or software entitlements.
- Provide or operate your existing repository/hosting/domain access when an account action cannot be completed through available tools. Do not send credentials in chat; use the appropriate local authentication or settings interface.
- Walk through a short, prepared acceptance script using synthetic cases. This is a practical comprehension and interaction check, not a request to certify law, policy or accessibility.
- Inspect the final candidate, evidence summary and proposed production changes, then make the release decision.

I will batch unresolved ownership/access questions and present concrete defaults. We do not need to answer them before independent implementation begins. If you cannot substantiate a local claim, we will omit it or link to the published institutional information rather than wait for another person.

Existing institutional/funder contact links remain useful to end users whose actual cases need an authoritative decision. Including those links does not require those offices to help build, approve or endorse this update. The toolkit must remain useful for understanding requirements even when a particular case cannot be resolved within it.

## 3. Evidence rules for policy and professional content

Every consequential claim will receive one of these dispositions:

| Evidence class | Treatment |
| --- | --- |
| Explicit official requirement for a stated program, date and role | Implement a narrowly scoped rule with its source, section, effective conditions and test cases. |
| Clearly supported explanation or good practice | Publish as an explanation/recommendation with attribution and its limits. Do not relabel it as a mandatory institutional rule. |
| Local setting or entitlement that can be established from published instructions or evidence you provide | Describe only the supported environment. Preserve the source/date and distinguish an existing institutional approval from our implementation checks. |
| Ambiguous, conflicting, historical, inaccessible or unsupported claim | Exclude the definitive conclusion. Show the relevant source and what must be established; remove the feature if a useful bounded result cannot be provided. |

For each rule I will record: source ID/URL, publisher, precise location, source version, effective scope, retrieval date, verification date, next review date, interpretation, exceptions and expected outcomes. An HTTP 200 response or matching keyword is not verification. A second official document is useful when it supplies additional evidence, but two pages copying the same statement are not independent confirmation.

Where sources disagree, I will compare the governing program instructions, effective periods and document authority, and record the resolution. A newer general page will not silently replace a program-specific rule. If the conflict remains, the affected branch becomes unavailable for a definitive answer. An unknown answer will never be converted automatically into either clearance or a prohibition.

For example, the official [NSGRP implementation guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance) gives an explicit program/partnership basis for RAF submission. We can correct the current sensitivity-based exemption against that text. The [official STRAC FAQ](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/frequently-asked-questions-faq-policy-sensitive-technology-research-and-affiliations-concern) distinguishes roles and funding agencies; the revised tool must preserve those distinctions rather than generalize from one example.

## 4. Implementation sequence

Each work package will produce an isolated, reviewable change with its relevant tests and documentation. Use `codex/` branch names when implementation starts. Retain React, Vite, JavaScript, hash routing and the existing visual language. The changes do not require a backend, accounts, AI-generated classifications or a framework migration.

### W01. Baseline, containment and developer instructions

**Covers:** immediate containment of the blockers; R01, R10, R12.

- [ ] Recheck the working tree, actual public release and current source/dependency state. Preserve unrelated work. Record the starting commit and a reproducible baseline.
- [ ] Prepare a containment candidate for the already-public site. Remove or gate known incorrect decision results, proximity screening and weak encryption recipes until replacements pass their checks. Apply gating to direct hash routes, related links, search, Home scenarios and printed content.
- [ ] Correct `CLAUDE.md` entries that explicitly preserve the wrong NSGRP logic, overstate coordinate accuracy, imply ineffective meta headers are enforced, or assume public geocoding is suitable. Update README and tool descriptions alongside affected changes.
- [ ] Add a small release/content-status configuration checked at rendering boundaries. A disabled tool must explain its status and offer official information. Remove the unsafe feature's external requests and shipped implementation when it is permanently excluded.
- [ ] Create a 25-item closure tracker. States: Open, Implemented pending checks, Verified for stated scope, Replaced/removed with verification, and Unresolved. Do not prefill approvals or mark an item complete because the UI was hidden.

**Files:** `src/App.jsx`, `src/data/toolRegistry.js`, Home/search/navigation components, `CLAUDE.md`, `README.md`, proposed `src/data/releaseStatus.js` and `docs/launch-closure-record.md`.

**Done when:** direct-route and navigation checks show no bypass to the removed/gated behavior; the baseline and each finding's disposition are recorded. No publication is performed as part of planning.

### W02. Reliable build, dependency and regression checks

**Covers:** R08, R09.

- [ ] Fix the lint exclusions for generated files and nested worktrees, then fix actual source/configuration errors without globally disabling useful checks.
- [ ] Re-run dependency audits, distinguish build/runtime exposure, update compatible packages, inspect the lockfile and document any remaining advisory with applicability and an expiry. Do not equate zero audit findings with proof of security.
- [ ] Select and pin a currently supported Node/tool combination after checking engine requirements. Align local development and CI. The old Node 20 workflow and previously reported advisory counts must be rechecked, not copied forward as current facts.
- [ ] Add a small Vitest suite for rules/data/state and Playwright journeys for the built app. Add automated accessibility checks as one input. Use official installation documentation and the existing JavaScript conventions.
- [ ] Add proposed `test`, `test:policy`, `test:e2e` and `check:data` commands. Require lint, deterministic tests and build before deployment; add browser regression checks for consequential changes.
- [ ] Establish failing cases for the known RAF exemption, malformed saved state and focus escape before fixing them. Add a test proving the removed map/geocoder is unreachable. Test any HTML-rendering sink that remains after removal.

**Files:** `package.json`, lockfile, `eslint.config.js`, `.github/workflows/`, proposed test configs and `tests/`.

**Done when:** a clean checkout has a reproducible check sequence and the first substantive regressions are exercised. External policy/provider outages do not make deterministic tests flaky; real-source checks have separate evidence.

### W03. Source registry and a consistent rule model

**Covers:** R01; supports B01–B08 and data/reference accuracy.

- [ ] Inventory all consequential content across the twelve tools, rather than fixing only the quoted audit examples.
- [ ] Add a small `src/data/policySources.js` registry and `docs/policy-rule-matrix.md`. Separate source date, effective period, retrieval, verification and toolkit revision. Keep unsupported section labels out of the UI.
- [ ] Extend the existing flow data only as needed for program/date questions, explicit unknown paths and scoped results. Both flowchart modes must render the same branches. Use simple pure functions/data rather than a general rules engine.
- [ ] Give repeated rules stable references so FAQs, glossary definitions, checklists and summaries cannot quietly contradict one another. Reuse shared facts and reference the canonical explanation where duplication adds risk.
- [ ] Add validators for source IDs, required metadata, program coverage, node/edge references, unreachable nodes, cycles where inappropriate and unhandled answers.
- [ ] Set review deadlines for consequential content. Expired/changed sources must visibly limit affected conclusions. Enforce this in release checks and runtime presentation; a browser clock alone is not authoritative evidence of currency.

**Done when:** each retained consequential claim has an evidence disposition, and each supported result has a traceable source and testable conditions. All excluded/uncertain claims have an explicit treatment.

### W04. Correct the three policy flows and their related explanations

**Covers:** B01, B02, B03; R03, R06.

- [ ] **NSGRP:** replace blanket federal applicability and sensitivity-based RAF exemption with supported program/competition and qualifying-partner questions. Separate submission requirements, mitigation, risk review and the eventual funding decision. Check CFI separately or link to its dedicated instructions without pretending the tri-agency rule covers it.
- [ ] **STRAC:** account for affiliation, funding and in-kind support; the applicable named roles by agency; team compliance; source/list versions; and supported historical-award/extension/change cases. Remove unsupported annual-attestation, retroactive and section-reference claims.
- [ ] **Ontario:** encode the full published disclosure period, future/past connections, its collaboration definition, supported form/signatory instructions and the distinction between NRO and other concerns.
- [ ] Replace terminal “proceed” or “compliant” language with a result scoped to the rule just evaluated and a concrete next action. A “not required under this rule” outcome remains possible when clearly supported; it must not imply all other obligations disappear.
- [ ] Reconcile related FAQ, glossary, tri-agency, checklist, mitigation and developer-documentation claims in the same change sequence.

**Files:** `src/data/flowcharts/`, `faqData.js`, `glossaryData.js`, `triAgencyData.js`, `riskChecklist.js`, `riskMitigationData.js`; `src/components/ui/Flowchart*.jsx` and wrappers in `src/tools/flowcharts/`.

**Done when:** independently specified source-derived expected results pass in pure tests and the browser, including program/partner distinctions, role differences, date boundaries, funding-only/in-kind-only connections and unknown inputs. Self-review includes a deliberate search for counterexamples and contradictions.

### W05. Replace unsupported legal, security and data-governance advice

**Covers:** B04–B07; R03, R04, R10.

- [ ] Use current government guidance to distinguish Canadian export/transfer rules, domestic controlled-goods requirements, applicable foreign-origin controls and sanctions. Remove the Canadian-lab deemed-export generalization, universal partnership-permit statement and categorical country-level research prohibitions. Provide examples only to the extent their conditions are directly supported.
- [ ] Keep NRO listing, sanctions designation, institutional identity and an individual's relationships distinct. Remove nationality-based shortcuts and blanket background-check recommendations. Describe proportionate evidence gathering, corroboration, mistaken identity and appropriate records handling without generating allegations or automated legal clearance.
- [ ] Replace unsupported legal-protection assurances and “document first” incident advice. Provide a private toolkit correction route and separate links to published institutional incident instructions.
- [ ] Remove `zip -er` and unverified encryption recipes. Where the relevant system is available, test a supported procedure end to end with synthetic files, including opening and recovery. Otherwise link to the vendor's exact procedure and published institutional guidance; do not publish an untested institution-specific tutorial or imply IT approval.
- [ ] Verify Lakehead account/service claims against published information, including MFA, password managers, managed-device recovery, backup and AI-service conditions. Remove unsupported entitlements and personal-account defaults. Broader Canadian guidance must identify institution-dependent choices.
- [ ] Replace universal residency/retention rules with a concise explanation of the applicable sources and commitments to check. Do not encode case-specific legal, ethics or contract conclusions. Use [Lakehead's published RDM resources](https://www.lakeheadu.ca/research-and-innovation/research-services/resources/research-data-management) for the local route.
- [ ] Correct First Nations OCAP scope using FNIGC material and provide appropriate official First Nations, Inuit and Métis references where available. Remove any implication that our checklist provides community consent or determines a Nation's governance requirements.

**Files:** `src/data/exportControlData.js`, `cybersecurityData.js`, `faqData.js`, `glossaryData.js`, `riskMitigationData.js`, `triAgencyData.js` and the corresponding reference/security renderers.

**Done when:** each consequential instruction is supported and scoped, transformed into a reference/checklist question, or removed. No external legal/IT/REB approval is invented or required to complete this narrower content work. The closure record states that case-specific specialist validation remains unavailable.

### W06. Turn STRA classification into a useful guided reference

**Covers:** B08.

- [ ] Preserve the official category/subcategory hierarchy, definitions and source versions. Reconcile the local data with the authoritative list.
- [ ] Replace the current Likely/Unlikely classifier with a topic-led explorer: users choose research themes, inspect potentially relevant official subcategories and record whether they think their work advances one, with “not sure” always available.
- [ ] Explain using technology versus advancing it with directly supported official examples. Never infer absence of STRA coverage from a keyword mismatch or from themes the user did not choose. Always offer the complete list.
- [ ] Remove risk/confidence badges and automatic transfer of a generated classification into other tools. A user's explicit assessment may be carried forward with its provenance and uncertainty visible.
- [ ] Test every category, navigation path, unmatched search, multidisciplinary selection and uncertainty state. An ambiguous case must remain unresolved while still showing useful reference material.

**Files:** `src/data/straData.js`, `src/data/straWizard.js`, `src/tools/compliance/StraLookup.jsx`.

**Done when:** the explorer performs verifiable content navigation and records user choices without claiming validated scientific classification. The original classifier is explicitly recorded as replaced.

### W07. Local NRO lookup and a minimal network surface

**Covers:** B09, B10, B11; R03 and R07.

- [ ] Reconcile every official list entry and nested organization with local rows. Store source/version and parent/alias provenance, distinguishing official aliases from locally added search aids. Preserve valid IDs and verify both missing entries and extras.
- [ ] Rank exact official names/aliases separately from possible fuzzy candidates. Explain active filters, incomplete information and “no result.” Matching a list entry does not prove a real-world affiliation; absence from a search does not establish clearance.
- [ ] Remove the map, proximity panel, external geocoder requests, provider fallback and dependent UI from the public release. Remove unused Leaflet/cluster packages and corresponding CSP allowances after verifying they have no remaining callers. Do not retain unused unsafe popup code in the shipped bundle.
- [ ] Retain sourced textual country/organization context where useful. Old coordinate data is not evidence for institutional identity and need not be certified to release the text-only lookup.
- [ ] Self-host licensed fonts/assets or use system fallbacks. Default journeys must use only the site's required first-party resources. State hosting/CDN access logging accurately; do not equate no analytics with zero data processing.
- [ ] Rename the global palette “Find a tool.” Keep organization search in the clearly identified NRO tool, avoiding a second incomplete entity-search surface.
- [ ] Inventory every remaining URL, external link and request. Plain official links may leave the site when clicked, but must not carry worksheet answers or search queries. Tests should deny unexpected request destinations.

**Files:** `src/data/nroData.js`, `src/tools/compliance/NroLookup.jsx`, global search/Home/registry components, `index.html`, font/assets, styles and dependencies.

**Done when:** name/alias/homonym/parent/filter tests pass; record reconciliation is documented; removed endpoints and map code are absent from network/build checks; remaining untrusted text stays inert. The no-third-party-request claim is limited to tested default app use, not external links the user intentionally opens.

### W08. Safe worksheet state and optional persistence

**Covers:** B12; R05 and R06 foundations.

- [ ] Use in-memory assessment state above tool components, keyed by opaque assessment ID and content/schema version. A non-sensitive local label can be optional. Avoid required project titles or researcher names.
- [ ] Provide New assessment, explicit Resume, Clear saved data and an undoable reset. New assessments start blank. Preserve answer semantics separately from risk interpretation and completion counts.
- [ ] Add unanswered, unknown and not-applicable states with explicit meanings. Ensure all-risk or all-unknown answers can never look like a passed assessment. Normalize mixed question polarity or encode its interpretation per item.
- [ ] Make device persistence opt-in, labelled and schema-validated. Display save failures. Explain shared-device and reload/close behavior. Never claim localStorage is encrypted or an institutional records system.
- [ ] Handle `rs-toolkit-checklist-v1` as an unverified legacy worksheet. Offer explicit inspection/reset, do not silently merge it, and require re-answering where question meaning changed. Clear all relevant obsolete keys when the user chooses to clear saved data.
- [ ] Keep answers, queries and identifiers out of URL parameters, analytics, error reports and test artifacts. Use synthetic data throughout verification.

**Files:** `src/App.jsx`, `RiskChecklist.jsx`, `riskChecklist.js`, proposed assessment context and small storage/answer utilities.

**Done when:** two-project, legacy/corrupt/blocked storage, optional save, explicit resume, clear/reset and all-risk/unknown tests pass. A progress indicator reports work recorded, never institutional acceptability.

### W09. Accessible interaction, navigation and recovery

**Covers:** B13, R06; supports R09.

- [ ] Repair the search dialog's name, field label, focus entry/trap, Escape, result announcements and focus restoration.
- [ ] Use native buttons/radios/links for consequential controls. Provide keyboard/text access to every flowchart node's content. Expose selected states, headings, landmarks, visible focus and changed-step/result messages.
- [ ] Preserve valid guided history and mode across cross-tool lookups and Back/Forward navigation. Invalidate outdated paths visibly when content versions change.
- [ ] Replace total-graph-node percentages with understandable path/step status and explicit completed results. Unknown routes, lazy-load failures and unavailable content need recoverable states with useful official links.
- [ ] Target WCAG 2.2 AA in implementation. Check contrast, target size, narrow viewports, high zoom/reflow and reduced-motion behavior in the existing design. Record tested criteria and remaining gaps without claiming formal conformance from a partial check.
- [ ] Run automated accessibility checks, keyboard journeys and accessibility-tree inspection. Prepare a short real screen-reader walkthrough for you using an available supported combination, such as NVDA with a Windows browser. I will handle the reproducible failures and provide exact expected states; you are not being asked to certify conformance.

**Files:** `SearchBar.jsx`, `FlowchartViewer.jsx`, `FlowchartGuidedMode.jsx`, `FlowchartFullView.jsx`, layout/App, checklist/NRO controls and `global.css`.

**Done when:** known barriers are fixed, all core journeys work by keyboard, and available assistive-technology checks and limitations are recorded. We will not label automated or simulated checks as real screen-reader testing. If a consequential interaction cannot be made accessible, replace it with an accessible text/native-control workflow. W3C recommends combining evaluation methods; tools alone cannot determine accessibility. [W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/).

### W10. Complete outputs and honest institutional context

**Covers:** R02, R05, R11 and R12 interface claims.

- [ ] Render print documents directly from data/state, independently of collapsed accordions and active filters. Label deliberate subsets and show unanswered/unknown items. Include generation date, content/rule version, scope, relevant sources and unresolved next steps.
- [ ] Inspect A4 and Letter PDFs for pagination, clipping, long content, grayscale and partial/risk-heavy assessments. No percentage or result should resemble a certificate.
- [ ] Add lightweight About/Scope, Privacy, Sources/Updates and Help views. Use your confirmed operator/contact, truthful institutional status and the actual data-flow inventory.
- [ ] Provide published Lakehead research-security/RDM/IT/REB routes without claiming those offices approved our update. For other institutions, use official/funder references and a clearly labelled local-support route. Do not introduce a sensitive intake form.
- [ ] Label federal, Ontario and Lakehead content separately. Keep the English launch explicit; provide official French resources and searchable bilingual policy names. Remove any assertion that the interface is fully bilingual or covers every provincial, institutional or contractual requirement.

**Files:** `RiskChecklist.jsx`, `RiskMitigation.jsx`, shared print/source/context components, registry/layout, proposed institution profiles and `global.css`.

**Done when:** output contents and pagination are verified, support links work, and someone outside Lakehead can understand which material applies to them. You verify ownership/contact details on the concrete candidate.

### W11. Hosting, release controls and sustainable operation

**Covers:** R07, R08, R10, R12 and ongoing R01.

- [ ] Inspect actual host responses and settings using available authenticated tools. Implement enforceable response headers, including a restrictive script policy, framing/MIME/referrer protections and verified HTTPS behavior. Removing maps/fonts from third-party delivery simplifies this configuration.
- [ ] If the existing host cannot provide required controls, prepare a specific compatible host/edge configuration and test it before asking you to approve its cost/domain changes. You and I can carry out the setup; no separate administrator is assumed. If account access is unavailable, complete the candidate and identify the exact remaining account action rather than mark hosting verified.
- [ ] Align pull-request checks and deployment authority, limit token permissions, review/pin third-party Actions, and inspect actual branch/environment protections. No deployment secrets go to untrusted pull-request code. Use your normal authentication and recovery methods.
- [ ] Build once and verify the artifact that will be published. Record commit, content versions, lockfile/runtime and artifact identity. Check canonical and any supported legacy URL/base path, including deep links, asset caching and a stale open tab.
- [ ] Prepare and rehearse a rollback to a known reviewed artifact. A rollback must not restore a previously known unsafe tool; maintain a minimal containment artifact with official links as the emergency fallback. Static changes cannot recall downloaded printouts or already-open tabs, so material corrections need visible dated notices.
- [ ] Add a private vulnerability/content-error channel and a short incident/correction runbook. Avoid soliciting confidential allegations in public issues. Qualify response times to what you can actually maintain.
- [ ] Audit third-party code/content/data/font attribution. Propose a license for material you control and obtain your ownership/license decision on the completed inventory. Remove or replace material with unresolved reuse rights rather than assume a license grants rights we do not have.
- [ ] Document a single-maintainer operating model with you as owner. I can run maintenance when invoked, but this plan does not establish continuous monitoring. Prepare repeatable source/link/dependency checks and review deadlines; do not silently auto-publish policy changes. If maintenance stops, expire definitive rules and show official references visibly.

**Files/artifacts:** `index.html`, build/runtime/config files, `.github/workflows/`, `README.md`, `CLAUDE.md`, `SECURITY.md`, attribution/license material, `docs/operations-runbook.md` and host configuration.

**Done when:** observed responses and account-setting evidence support the claimed controls; the exact artifact and fallback work; ownership, reporting and maintenance are workable for one human operator. Publication still requires the actual account capabilities and your release decision.

### W12. Challenge the result, complete your walkthrough and release

**Covers:** R09 and final disposition of every finding.

- [ ] Expand the audit's 19 scenario families into stable cases with source-derived expected results. Cover all reachable policy branches, date/role/program differences, unknowns, inconsistent inputs, source changes, NRO aliases/homonyms, state corruption and failure recovery.
- [ ] Conduct a separate self-review pass that searches for counterexamples, mismatched explanations and hidden assumptions. Keep expected results separate from implementation. Agreement between two runs is not evidence by itself; the relevant source and observed behavior are.
- [ ] Run unit/data/graph tests and browser journeys against the built candidate. Test Chromium, Firefox and WebKit where available and record any actual platform gaps rather than equate browser-engine emulation with testing every device.
- [ ] Inspect default network requests, persistence, external links, accessibility states, printed PDFs and production-like headers. Confirm removed features are unavailable through direct routes, search or shipped code.
- [ ] Give you a short acceptance script and expected results for: an in-scope NSGRP partnership with no identified risk, a STRAC support/role case, an uncertain STRA topic, an NRO alias/no-result, a new/resumed worksheet, printing and keyboard/screen-reader use. Use synthetic cases only. Present a compact evidence summary so you need not review every code line.
- [ ] Fix misunderstandings or failures exposed by the walkthrough and repeat affected checks. There is no mandatory outside-user study or fixed two-week pilot. Our limited walkthrough does not establish representative usability across all researchers.
- [ ] Recheck consequential sources and actual dependency/hosting state immediately before release. Complete the 25-item closure record, recording what was corrected, replaced, removed and not independently validated.
- [ ] Present the exact candidate, scope/limitations, production changes, fallback and ownership details for your release decision. After authorized publication, smoke-test real-domain critical flows, assets, headers and default network behavior. Use the tested containment fallback if a consequential regression appears.

**Done when:** the release criteria below are met and no unverified claim is being used to imply approval, legal clearance or independent certification.

## 5. Definition of ready for this launch

All of these must be evidenced, not merely asserted:

- [ ] Every exposed consequential rule has a current, traceable official basis and passes its supported scenarios. Unknown/unsupported cases do not produce a definitive conclusion.
- [ ] Every audit item has a verified fix or a verified replacement/removal that eliminates the affected behavior. The closure record distinguishes those outcomes and preserves unmet original independent-review criteria as limitations.
- [ ] Default journeys do not send searches/answers to unapproved external services; saved data handling and clearing are correct; no known unsafe rendering sink remains.
- [ ] Core journeys work with keyboard/native controls, and actual accessibility checks and platform limits are disclosed. Known consequential access barriers are fixed or the interaction is replaced.
- [ ] Printed outputs accurately reflect intended content, state, uncertainty and version.
- [ ] Required build, policy, data, browser and production checks pass on the candidate. Advisory applicability and test coverage gaps are explicit; a known exploitable or consequential unfixed defect cannot be waived by a disclaimer.
- [ ] Operator, contact, institutional status, language/jurisdiction scope and permitted reuse are truthful.
- [ ] We can publish, verify and roll back using your actual accounts, and you can operate the documented reporting/maintenance process.
- [ ] You complete the prepared acceptance walkthrough and authorize the concrete release.

The resulting release is a tested, bounded independent resource unless you substantiate a different institutional status. It is not a legal opinion, independent security audit, formal accessibility certification or guarantee of correctness in every research case. Those absences remain visible limitations; they are not prerequisites that silently send this plan back to unavailable reviewers.

## 6. Coverage of all 25 findings

| Audit item | Work package | How we resolve it with only us |
| --- | --- | --- |
| B01 NSGRP logic | W03/W04 | Source-derived submission rules, program/partner scope and regression cases |
| B02 STRAC consistency | W03/W04 | Role/connection/version distinctions, shared references and counterexample tests |
| B03 Ontario disclosure | W04 | Exact published period/definitions/forms; unknown cases remain explicit |
| B04 Export advice | W05 | Correct scoped references; remove unsupported case-specific legal conclusions |
| B05 Sanctions | W05/W07 | Remove categorical tiers/clearance; distinguish regimes and sourced context |
| B06 Encryption | W05 | Remove weak recipe; test available procedures or link exact authoritative instructions |
| B07 Data governance | W05 | Remove universal rules; accurately attribute frameworks and case-dependent requirements |
| B08 STRA classifier | W06 | Replace it with a verifiable guided category explorer and user-recorded assessment |
| B09 NRO identity | W07 | Reconcile names/aliases; remove geographic inference and unverified map claims |
| B10 Popup injection | W07 | Remove map/popup code and dependencies; test any remaining untrusted rendering |
| B11 External disclosure | W07/W10 | Remove geocoders/maps, self-host assets, verify default requests and accurate notice |
| B12 Checklist | W08 | Explicit assessment identity, uncertainty, version handling and validated optional persistence |
| B13 Accessibility | W09/W12 | Native/keyboard workflows, automated/manual checks and your scripted assistive-technology pass |
| R01 Provenance/freshness | W03/W11 | Claim registry, sources, deadlines, change checks and bounded stale states |
| R02 Lakehead/national routes | W10 | Public authoritative links and truthful institutional scope, with no invented endorsement |
| R03 Fairness | W04/W05/W07 | Remove demographic/proximity shortcuts; require corroboration and preserve uncertainty |
| R04 Institutional IT | W05 | Published supported instructions only; no unverifiable entitlement or approval claims |
| R05 Print | W10/W12 | Dedicated complete print rendering and inspected A4/Letter PDFs |
| R06 Navigation | W08/W09 | Preserved valid context, coherent steps and explicit recovery |
| R07 Hosting | W11 | Implement and observe real headers/settings with your account access |
| R08 Build/supply chain | W02/W11 | Reproducible gated checks, reviewed advisories and actual access protections |
| R09 Verification | W02/W12 | Source-derived cases, adversarial self-review, browser evidence and your walkthrough |
| R10 Incident/correction | W05/W11 | Correct reporting text, private contact, dated notices and rehearsed containment/rollback |
| R11 Canadian/language scope | W10/W12 | Explicit English/federal/Ontario/local scope, French sources and honest test coverage |
| R12 Ownership/operations | W10/W11/W12 | Your ownership/license/status decisions and a feasible single-maintainer runbook |

No item is currently closed. Where the original audit asked for unavailable independent specialists, this plan changes the exposed feature/claim or testing claim and records that scope change. It does not manufacture the missing review.

## 7. Progress and release evidence

I will keep a concise record per finding:

```text
Audit ID and affected behavior:
Resolution: corrected / replaced / removed
Source basis and scope:
Implementation commit/artifact:
Scenario IDs and observed results:
Actual manual checks and who performed them:
Unperformed checks and remaining limits:
User decision, if required:
Closure date, release version and next review deadline:
```

The delivery checkpoints are:

1. **W01–W03:** containment candidate, test foundation and source/rule inventory.
2. **W04–W07:** corrected policy/reference content, STRA explorer and local NRO lookup.
3. **W08–W10:** dependable assessments, accessible workflows, print and institutional context.
4. **W11–W12:** verified hosting/operations, your short acceptance pass and a reviewable release candidate.

I will report actual passing checks, remaining failures and scope decisions at each checkpoint. We will estimate remaining execution from that progress rather than reuse a staffing-based calendar. No external review queue or fixed pilot waiting period is on the critical path.
