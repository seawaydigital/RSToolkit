# Research Security Toolkit: pre-launch safety review

Reviewed: 10 September 2026. Repository baseline: `9fa4db4`.

Implementation planning update, 12 September 2026: the [two-person launch plan](two-person-launch-plan.md) addresses these findings through fixes and a bounded release scope with only the project owner and Codex available. This audit remains the historical evidence record; no finding or original independent-review criterion is marked satisfied by that planning change.

**Recommendation: do not launch the current decision-support tools as an institutionally dependable compliance resource.** Correct or temporarily disable the blockers below, then complete the release requirements. The static architecture is appropriate; the principal risks are incorrect policy conclusions, unsupported legal generalizations, misleading screening results, disclosure to external services, and insufficient verification.

Safety here includes protecting research, participant information, funding eligibility, academic freedom, fair treatment, and access for people with disabilities. No review can guarantee a tool is completely safe. The practical target is bounded, evidence-based guidance, explicit uncertainty, and a reliable route to a qualified human.

This is a technical and content safety review, not institutional endorsement, a penetration-test certificate, or a legal opinion. No application code was changed. Suggested owners are roles to assign, not people who have already agreed to review the product.

## How to use this checklist

- **B01–B13: launch blockers.** Correct the issue and demonstrate the stated acceptance criteria, or remove the affected function and its promotional claims from the launch.
- **R01–R12: release requirements.** Complete these before promoting the toolkit for routine professional or institutional use. An explicitly scoped pilot may omit features, but must not expose known incorrect guidance.
- **Evidence labels:** Confirmed means observed in source, browser behavior, or the stated live check. Review required means an institution, specialist, or additional test must resolve the remaining uncertainty.
- Keep a record for each item: owner, resolution, reviewer, evidence, release version, and closure date. Every checkbox starts open.

## Launch blockers

### B01. Correct the NSGRP applicability and RAF submission logic

- [ ] **Owner:** research security policy lead and developer.
- **Confirmed:** `src/data/flowcharts/nsgrpFlow.js:38` and `:55` claim both Annex A sensitivity and Annex B partner risk are necessary to require a Risk Assessment Form (RAF). The browser path **Continue → federally funded: Yes → sensitive area: No** ends by saying no RAF is required. The same flow inserts an all-named-researcher attestation step without separately establishing STRAC applicability. FAQ and tri-agency summaries also overgeneralize NSGRP scope to non-academic/international partners.
- **Harm:** an applicant can omit a required document or complete the wrong attestation.
- **Required:** determine the funding opportunity, competition requirements, and qualifying partner type before determining RAF submission. Keep RAF submission, mitigation needs, national-security referral, and STRAC attestation separate. Annex A/B findings must not themselves waive a required RAF. The official tri-agency guidance makes the program/partner distinction explicit. [NSGRP implementation guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-guidance).
- **Accept when:** policy staff approve cases for an in-scope private-sector partnership with no identified risks, one with risks, a public/non-profit-only partnership, an out-of-scope opportunity, and an unknown program. No branch substitutes a research-security result for a funding award decision. Check CFI against its own implementation guidance.

### B02. Reconcile STRAC rules across every tool

- [ ] **Owner:** research security policy lead.
- **Confirmed:** `stracFlow.js:12` checks affiliation but omits funding/in-kind support from the branch; these appear later in the attestation text. `faqData.js:20` confuses policy applicability with having a disqualifying NRO connection. `triAgencyData.js:149` and `glossaryData.js:131` assert annual attestation; the guide also says the policy applies to existing grants without qualification. `riskMitigationData.js`, measure `mon-1`, implies later NRO additions automatically endanger current funding. The flowchart labels institutional confirmation as a specific federal requirement without adequate citation.
- **Harm:** missed obligations, unnecessary disruption of valid collaborations, or unsupported institutional demands.
- **Required:** use competition-specific applicability, all three connection types, named-role attestation versus whole-team compliance, and correct list versions. Remove the blanket annual-attestation claim unless a specific program or institutional rule supports it. Explain prospective list updates, existing-award treatment, funded extensions, and scope changes. [Tri-agency STRAC guidance](https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/research-security/tri-agency-0).
- **Accept when:** one approved rule matrix governs the flowchart, FAQ, glossary, checklist, and mitigation advice; tests cover funding-only and in-kind-only connections, trainees, new team members, old awards, and changed list versions.

### B03. Preserve Ontario's different definitions and disclosure period

- [ ] **Owner:** Ontario funding specialist.
- **Confirmed:** `src/data/flowcharts/ontarioFlow.js:11` describes current/recent connections within two years, but does not explain the prospective end of the Relevant Period. Its question combines NROs and other concerning entities, then sends all affirmative answers to an NRO-specific Option B instruction.
- **Harm:** incomplete disclosure of planned collaborations or incorrect form selection.
- **Required:** explain the period from two years before signing through anticipated project completion, including connections outside the proposed project. Preserve Ontario's broad collaboration definition and distinguish required NRO disclosures from other risk disclosures. Verify form signatories, current program instructions, submission packaging, and contractual obligations. [Ontario guidelines, definitions and application stage](https://forms.mgcs.gov.on.ca/dataset/875d7629-9ddc-4545-a1c3-881ece0cb3a3/resource/6219fff3-aa2e-49ae-955c-0ebbd21059f1/download/on00708e.pdf).
- **Accept when:** examples covering past, planned, unrelated-project, co-publication, and non-NRO relationships lead to staff-approved instructions. The user cannot carry federal definitions into the provincial process unnoticed.

### B04. Correct export-control advice about international students and domestic access

- [ ] **Owner:** institutional legal/export-control specialist.
- **Confirmed:** `src/data/faqData.js`, entries `ec-apply-universities` and `ec-international-student`, frame access by international students in a Canadian lab as a potential EIPA “deemed export” without distinguishing US law, Canadian exports, or domestic Controlled Goods requirements. `exportControlData.js` also describes an export permit as authorization for any partnership with an Area Control List destination, rather than analyzing the actual transfer/activity.
- **Harm:** inappropriate restrictions on students, or failure to identify the legal regime that actually applies.
- **Required:** distinguish Canadian export/transfer controls, domestic examination/possession/transfer of controlled goods, sanctions, and applicable foreign-origin controls. Avoid nationality-only rules and “publishable therefore exempt” shortcuts. Explain remote access and intangible transfers with qualified examples. [Canadian export and brokering controls handbook](https://www.international.gc.ca/trade-commerce/controls-controles/reports-rapports/ebc_handbook-cce_manuel.aspx?lang=eng), [Canadian guidance on US deemed exports](https://www.tradecommissioner.gc.ca/sell2usgov-vendreaugouvusa/procurement-marches/export-cont-export.aspx-eng), [Controlled Goods exemptions](https://www.canada.ca/en/public-services-procurement/services/industrial-security/controlled-goods/about-program/program-registration-exemptions.html).
- **Accept when:** counsel signs off a Canadian-lab example, overseas file/cloud access, US-origin technology, and controlled-goods access. The reference supplies escalation steps, not automated legal clearance.

### B05. Replace sanctions generalizations with activity-specific guidance

- [ ] **Owner:** sanctions/legal specialist.
- **Confirmed:** `src/tools/compliance/NroLookup.jsx:443` describes a tier as “no research engagement.” `riskMitigationData.js`, measure `dd-1`, combines Canadian, US, and EU screening with a categorical Canadian criminal-offence statement. The FAQ suggests a single Canadian list covers the regimes. These formulations are too broad for individual decisions.
- **Harm:** prohibited activity may be missed, while lawful study, employment, or collaboration may be unnecessarily restricted.
- **Required:** distinguish the NRO list from sanctions; identify the applicable law, listed parties, indirect dealings/ownership, goods/services restrictions, territorial scope, and exceptions/permits. Separate Canadian obligations from foreign lists used as intelligence or because a foreign legal nexus applies. Do not imply unlisted parties are cleared. [Global Affairs Canada's academic and research sanctions guidance](https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng).
- **Accept when:** each retained country statement has a dated, precise source and review owner; a country or nationality alone cannot produce a researcher-level accusation or clearance.

### B06. Remove weak encryption instructions and validate recovery procedures

- [ ] **Owner:** Lakehead TSC/information security and equivalent institutional IT reviewers.
- **Confirmed:** `src/data/cybersecurityData.js:80` recommends `zip -er` for sensitive files on macOS. Standard Info-ZIP encryption is weak and is not an AES-encrypted alternative to the adjacent 7-Zip recipe. [Info-ZIP's own warning](https://infozip.sourceforge.net/FAQ.html).
- **Required:** replace that recipe with an institution-approved method, such as an approved encrypted disk-image workflow where appropriate. Validate the actual encryption format, filename protection when needed, recipient compatibility, recovery-key escrow, backups, and recovery. Do not direct managed-device users to personal iCloud or assume a supported institutional Microsoft escrow arrangement. [Apple's encrypted disk-image instructions](https://support.apple.com/en-au/guide/disk-utility/dskutl11888/mac).
- **Accept when:** IT demonstrates creation, transfer, opening, and recovery using synthetic files on supported systems. Strong encryption must not become either weak protection or unrecoverable research loss.

### B07. Correct data residency, retention, and Indigenous data-governance claims

- [ ] **Owner:** privacy officer, REB/RDM lead, and appropriate Indigenous data-governance advisers.
- **Confirmed:** `cybersecurityData.js:174` groups health data, Indigenous data, and STRA collaborations beneath a Canadian-server requirement without stating each legal/contractual trigger. Lines `48` and `156` generalize a seven-year retention minimum. The Indigenous entry uses OCAP as an umbrella for Indigenous research.
- **Required:** tie storage and retention to the applicable institutional policy, ethics/consent terms, agreement, funder/program, jurisdiction, classification, and community governance. Canadian hosting alone is not compliance. PIPEDA does not itself prohibit foreign processing. OCAP is specifically First Nations; do not substitute it for Inuit, Métis, or a particular Nation's governance. [Privacy Commissioner guidance](https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/?wbdisable=true), [FNIGC OCAP explanation](https://fnigc.ca/wp-content/uploads/2022/10/OCAP_Brochure_20220927_web.pdf), [research ethics guidance on retention](https://ethics.gc.ca/eng/policy-politique_interpretations_review-evaluation.html).
- **Accept when:** no universal retention timer or geography-only storage conclusion remains; each scenario points to the responsible authority. Verify effective dates before adopting any proposed policy update.

### B08. Make the STRA wizard cautious without creating false alarms

- [ ] **Owner:** subject-matter reviewers and UX/developer.
- **Confirmed:** `src/data/straWizard.js` uses broad technology questions and domain choices, then emits qualitative likelihood labels. “Not sure” is not consistently available. The renderer maps an internal `riskLevel` to a likelihood badge, mixing research sensitivity, classification confidence, and security risk. A valid graph does not establish a valid classifier.
- **Required:** distinguish advancing a listed subcategory from merely using technology; handle foundational and multidisciplinary research; preserve an explicit uncertain outcome; show the matched subcategory and reasoning. An uncertain answer must not silently become “No.” Do not invent calibrated probabilities. [Official STRAC FAQ, questions 11–14](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/frequently-asked-questions-faq-policy-sensitive-technology-research-and-affiliations-concern).
- **Accept when:** reviewers evaluate synthetic positive, negative, ambiguous, and mixed-project cases across all 11 local categories. If validation cannot be completed, launch the cited browse/search reference and disable the wizard.

### B09. Make NRO identification evidence-based and qualify negative searches

- [ ] **Owner:** data curator and research security lead.
- **Confirmed:** `NroLookup.jsx:318` labels a result “Match” using at least 50% word overlap and less than 2 km distance. Coordinates and aliases lack per-record provenance. `CLAUDE.md` acknowledges location caveats. The FAQ says “hundreds” while the tool has 126 rows. Global search only indexes tool metadata; “Beihang” returned no result there in the browser.
- **Required:** prioritize official-name/alias lookup; label heuristic matches as candidates; show country, distinguishing identifiers, source and version. State that proximity neither proves affiliation nor establishes risk, and no result is not clearance. Explain parent/sub-organization relationships and what the row count means. Either rename global search “Find a tool” or index entity content with clearly identified result types. [Official NRO list and caveats](https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations).
- **Accept when:** curated cases cover aliases, transliteration, homonyms, parent/sub-organizations, active filters, and unknown entities. Official records are reconciled; each map coordinate is sourced or labelled approximate. Remove proximity screening from the launch if its benefit does not justify ambiguity and privacy cost.

### B10. Eliminate untrusted HTML in map popups

- [ ] **Owner:** developer and security reviewer.
- **Confirmed in source:** `NroLookup.jsx:237` inserts `institution.shortLabel` into HTML passed to Leaflet. That label can originate from geocoding results or the manually entered institution query. Organization popups also build HTML strings. The CSP permits inline scripts.
- **Harm:** a malicious label can alter trusted-looking popup content; script execution is a risk requiring testing. This review did not execute an exploit and does not claim a demonstrated remote compromise.
- **Required:** construct popup content with DOM nodes and `textContent`, or use a narrowly justified safe sanitizer for intentional markup. Validate response shape, finite coordinates and ranges, and render errors safely. Do not rely on CSP as the primary fix.
- **Accept when:** synthetic HTML, quotes, event-handler-like text, malformed coordinates, and unexpected response fields stay inert or fail safely. A reviewer confirms all popup sinks are covered.

### B11. Make external data transmission explicit and optional

- [ ] **Owner:** privacy/security lead and developer.
- **Confirmed:** institution queries go directly to Nominatim, sometimes then Photon. Google Fonts loads remotely; map tiles use CARTO. A Google Maps link embeds the query. The homepage says “Zero tracking,” but there is no clear distinction between absence of analytics and third-party requests. The core NRO text lookup itself can operate locally.
- **Harm:** confidential investigation targets or collaboration plans may be disclosed to an external provider without the researcher realizing it.
- **Required:** provide an intelligible data-flow notice before external search, restrict it to public institution/place information, and offer a local-only path. Review provider terms, logging, jurisdictions, fallback disclosures, and query minimization. Prefer self-hosted fonts and opt-in map loading. Nominatim prohibits confidential submissions and imposes a per-application rate limit; immediate retries and multi-user traffic need attention. [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/).
- **Accept when:** a network inspection of every workflow matches the notice; no confidential values appear in external requests or error reports. Failed geocoding never masquerades as a negative NRO search. Remove external geocoding if provider/privacy requirements cannot be met.

### B12. Prevent checklist completion from being mistaken for a valid assessment

- [ ] **Owner:** policy/UX lead and developer.
- **Confirmed:** `RiskChecklist.jsx` has one persistent browser-wide record, merges saved values without validating their schema, silently ignores storage failures, and counts any non-null value as completed. It has no project/version context, explicit “Unknown,” or explanation that all-risk answers can still produce 100% completion. Reset is immediate. Questions mix risk-positive and protection-positive wording.
- **Harm:** an officer may carry answers from one project to another, rely on stale responses, or misunderstand completion as clearance.
- **Required:** use an explicit temporary worksheet or clearly isolated assessments; distinguish unanswered, uncertain, not applicable, risk identified, and no risk identified from the information reviewed. Validate saved IDs/values/version, show storage failure, mark restored data, support safe reset/undo, and explain local persistence on shared devices. Keep sensitive case narratives out of browser storage by default.
- **Accept when:** project A cannot silently populate project B; malformed/stale data cannot count as assessed; 100% answered can visibly coexist with unresolved risks. Label the output as a working aid, not the official RAF or an approval.

### B13. Make the decision workflows usable without a mouse

- [ ] **Owner:** accessibility reviewer and developer.
- **Confirmed:** search is an unnamed generic modal container with an unnamed text field in the accessibility tree. With no results, Shift+Tab moved focus to the underlying flowchart's “Start Over” button. NRO suggestions/rows and SVG flowchart nodes use click handlers without equivalent native keyboard controls. Checklist selected states lack programmatic pressed/radio states.
- **Required:** labelled inputs; dialog naming and modal focus management; Escape and focus restoration; keyboard-operable search suggestions, map alternatives, flow nodes, and selection controls; announced results/errors and changing steps. Keep a usable text alternative to the map and diagram.
- **Accept when:** researchers can complete the core journeys with keyboard alone and a screen reader, with visible focus and understandable state. Include zoom/reflow and contrast checks. Use WCAG 2.2 AA as the engineering target while institutional accessibility staff determine the applicable legal baseline. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Release requirements

### R01. Establish accountable content review and freshness

- [ ] Assign a policy owner and backup. Require a named specialist review for decision rules and legal/technical instructions. Separate source publication/version, date verified, and toolkit revision; a date change alone is not verification.
- **Evidence:** `nroData.js` says March 2025 in a comment but April 2024 in metadata. Multiple tools show January 2025. FAQs and mitigation advice lack claim-level sources; some `policyRef` labels imply exact sections without traceable support.
- **Accept when:** every consequential claim has a precise source and scope, reviewer, review deadline, and correction history. Design a stale-content state and an immediate way to disable affected advice. Distinguish quoted policy, paraphrase, local requirement, and recommendation.

### R02. Provide a Lakehead route and a clearly separate national route

- [ ] Add verified contact/help links at decision and uncertainty points, not only generic footer language. For Lakehead, connect research security, RDM, TSC, REB/privacy, and institutional grants review. For other institutions, explain how to reach their equivalents.
- **Required Lakehead grounding:** reconcile operational guidance with the [Research Data Classification Guidelines and Standard](https://www.lakeheadu.ca/sites/default/files/profile-data/swright/Lakehead%20University%20-%20Research%20Data%20Classification%20Guidelines%20and%20Standard%20-%20Final%20%2827.03.2024%29.pdf), [2026 online research tools guidance](https://www.lakeheadu.ca/sites/default/files/uploads/111/Guideline%20-%20Use%20of%20online%20tools%20for%20research%20involving%20human%20participants%2C%20REVISED%202026.pdf), and [official support directory](https://www.lakeheadu.ca/research-and-innovation/support). The directory lists `security.research@lakeheadu.ca` and `rdm.research@lakeheadu.ca`; reconfirm before publication.
- **Accept when:** Lakehead reviewers approve local contacts and service instructions. Using Lakehead content must not imply endorsement or turn Lakehead's Duo/Google setup into a rule for most Canadian universities.

### R03. Put fairness and proportional due diligence into the actual workflows

- [ ] Put evidence-based screening, non-discrimination, data minimization, and correction/escalation instructions beside NRO, personnel, and sanctions tools.
- **Evidence:** the tri-agency guide contains a non-discrimination principle, but personnel guidance broadly recommends background checks for all projects; the FAQ presumes lower risk for Canadian companies; the map foregrounds countries and proximity.
- **Accept when:** ethnicity, citizenship, language, or foreign background alone cannot drive a risk label. Reviewers distinguish organizations, individuals, and activities; corroborate adverse findings; consider mistaken identity; restrict access and retention of due-diligence records; and route consequential decisions through institutional processes. Existing unrelated collaborations must not be automatically treated as a person's NRO affiliation. Do not replace evidence with geographic or demographic proxies.

### R04. Validate cybersecurity recommendations against managed institutional systems

- [ ] Have TSC approve account-specific MFA, approved password managers, device enrollment, VPN instructions, recovery practices, backups, and incident response. Add clear guidance on supported software/security updates and phishing reporting.
- **Evidence:** the toolkit generalizes Duo plus Google MFA, mentions institutional 1Password access without a Lakehead entitlement source, and mixes personal recovery options with institutional-device advice. AI advice includes a useful escalation route but needs account/service-specific treatment.
- **Accept when:** guidance prioritizes approved configurations and classifies data before naming storage/AI services. Do not imply enterprise agreements authorize every dataset, or that every AI product trains on every input. Lakehead's 2026 REB guidance explicitly distinguishes institutional agreements and account types. Do not copy contradictions from an institutional web page without resolving them with its owner.

### R05. Make printed outputs complete, identifiable and safe to share

- [ ] Add generation date, toolkit/content version, assessment scope, unresolved items, cited sources, and a visible “working aid, not institutional approval” statement to printed assessments. Explain whether printing exports all content or only a selected subset.
- **Confirmed in source:** mitigation details are conditionally absent from the DOM when collapsed (`RiskMitigation.jsx:169`). Print CSS cannot restore elements that were never rendered. Closed categories and active filters can also omit content. Unanswered checklist items have no explicit printed state.
- **Accept when:** all-open, all-closed, filtered, unanswered, N/A, and risk-heavy outputs are checked in print/PDF. Test A4 and Letter, page breaks, clipped text, grayscale meaning, and confidentiality handling. A printed percentage must not resemble certification.

### R06. Preserve orientation and assessment context during cross-tool navigation

- [ ] Retain the current guided step and answers in an appropriate session context, or explicitly warn/reset and offer a reliable return route. Scope completion messages to the particular policy. Provide a decision summary with next actions.
- **Confirmed in source:** navigation unmounts tool components; flow history lives inside `FlowchartGuidedMode`. Switching Full View/Guided Mode also unmounts that history. The progress indicator divides steps visited by every graph node, including mutually exclusive branches; the reproduced end state was step 4 of approximately 13.
- **Accept when:** users can consult STRA/NRO references and return without silently losing context; Back/Forward and mode changes are tested; terminal states say complete for that path. Unknown routes, chunk failures, and stale tabs provide recovery and authoritative links rather than a misleading normal result.

### R07. Verify real hosting protections, not just HTML meta tags

- [ ] Configure and test a restrictive production script policy, appropriate anti-framing policy, MIME-type protection, referrer policy, and HTTPS behavior through a host/edge that supports the required controls. Retest fonts, maps, and all tool chunks after tightening CSP.
- **Confirmed:** `index.html` allows inline scripts and attempts `frame-ancestors` in a meta CSP. A read-only GET to `https://rs.rdmtoolkit.ca/` returned 200 but no CSP, X-Content-Type-Options, Referrer-Policy, HSTS, or X-Frame-Options response headers. This does not mean all meta CSP protection is absent. `frame-ancestors` cannot be enforced from a meta policy. [W3C CSP specification](https://www.w3.org/TR/CSP3/#directive-frame-ancestors).
- **Accept when:** tests inspect actual responses and browser behavior. Use a proper referrer meta element where appropriate, not an unsupported `http-equiv` substitute. Have the host owner document any remaining platform limitations and eliminate unsupported security claims.

### R08. Repair build/dependency checks and protect the release pipeline

- [ ] Resolve or document applicability of dependency advisories, fix lint scope/errors, require review and checks before deployment, and verify access controls for repository, CI, Pages/domain ownership, and recovery.
- **Confirmed:** the full dependency audit reported 9 affected packages: 6 high, 2 moderate, 1 low; fixes were reported available. Production-only audit reported zero. The findings concern development/build tooling, including Vite on Windows; they are not evidence that static visitors face nine exploitable vulnerabilities. Prior same-baseline lint found 13 application/config errors; the broad lint command also scans nested worktrees/generated files and reported 1,017 errors. CI runs install/build without lint or tests.
- **Accept when:** a clean checkout has reproducible, passing relevant checks; advisories have a reviewed disposition; development servers stay private; deployments contain only intended artifacts. Verify branch/environment protections externally because repository files alone do not establish them.

### R09. Add tests for decisions and harmful failure modes

- [ ] Implement the minimum scenario matrix below and record the policy source, reviewer, and expected result for each case. Run it before releases and after source/rule changes.
- **Evidence:** there is no test script or committed automated test suite in the inspected main project. Graph/reference checks pass but cannot detect the NSGRP error.
- **Accept when:** policy scenarios, data validation, safe rendering, privacy network behavior, local persistence, navigation, keyboard/screen-reader journeys, mobile/zoom layouts, and print outputs are verified. At least one research administrator and one researcher complete realistic synthetic tasks without coaching; include accessibility expertise and a reviewer from outside Lakehead before claiming broad institutional suitability.

### R10. Prepare incident, correction and rollback procedures

- [ ] Publish an appropriate private channel for security reports and content errors. Define responsibility for urgent corrections, rollback, disabling tools, communicating material mistakes, and handling reported vulnerabilities without collecting sensitive research unnecessarily.
- **Confirmed:** FAQ entry `inst-report` says reporting is protected under Canadian law without specifying the protection, and tells users to document before reporting. Qualify legal assurances and avoid delaying urgent institutional response.
- **Accept when:** a tabletop exercise shows how a wrong eligibility rule or leaked query is handled. Provide a public correction notice mechanism consistent with having no user accounts. Security/incident contact links must be verified; do not ask users to post cases or researcher allegations in public issues.

### R11. Bound Canadian coverage and provide a language/accessibility plan

- [ ] Explicitly label federal, Ontario, and Lakehead content and their limits. Other provincial, institutional, contractual, sector-specific and ethics requirements may still apply. Make policy terminology searchable through common English/French names and aliases.
- **Accept when:** the launch audience and language coverage are honest. For a genuinely bilingual national rollout, have qualified humans review French guidance and test equivalent outcomes. An English pilot may link to authoritative French resources and offer an accessible human-support route; do not present that as a completed bilingual service. Institutional advisers should determine applicable accessibility/language obligations rather than assuming every federal rule binds an independent site identically.

### R12. Establish ownership, permitted reuse, and a sustainable operating commitment

- [ ] State who operates the toolkit and whether Lakehead has formally endorsed it. Review code/content/data/font/map licensing and attribution before describing it as open source or distributing adaptations. Set a maintenance owner, backup, scope, support route, and discontinuation plan.
- **Evidence:** the README calls the project open source; no top-level LICENSE was present. The independent-government disclaimer exists in a FAQ, but an easily reached About/Scope page and institutional status are needed. The tool registry, README and authoritative project notes contain separate claims that can drift.
- **Accept when:** operators and reviewers sign off the release record, permitted use is documented, the canonical URL works, and users can identify limitations and report concerns from any tool. Unmaintained tools must visibly retire or fall back to official sources instead of indefinitely appearing current.

## Minimum acceptance scenarios

These are proposed tests to implement and have reviewed, not tests that this audit has already passed.

| Scenario | Required property |
| --- | --- |
| In-scope NSGRP program, qualifying private partner, no sensitivity or partner risk identified | Required RAF is not waived; no unrelated attestation is invented. |
| Out-of-scope or unknown program; public/non-profit-only partnership | No blanket federal obligation; unknown scope leads to program/institutional verification. |
| STRA advancement, no affiliation, but NRO funding or in-kind support | Connection is detected and referred for resolution. |
| Named applicant versus unnamed trainee involved in funded work | Distinguish attestation documents from ongoing compliance duties. |
| Historical award, later NRO-list change, funded extension, scope change | Apply the approved temporal/version rules and escalation steps. |
| Merely using AI versus advancing AI; fundamental or mixed-project research | Explain the relevant subcategory and preserve uncertainty. |
| Ontario past, planned, co-publication and unrelated-project links | Apply the full Relevant Period and provincial definitions. |
| International student in Canada; remote overseas access; US-origin controlled item | Differentiate legal regimes without nationality-only conclusions. |
| Exact NRO name, alias, homonym, parent/sub-organization, no result | No false identity confirmation or clearance; retain source and version. |
| Near an NRO but unconnected | Proximity does not create an affiliation or risk conclusion. |
| Public institution query versus confidential case details | Local-only route exists; external transmission is explained and controlled. |
| Provider timeout, 429/500, malformed JSON, empty result, edited query during request | Distinct recoverable states; no stale result or false negative. |
| Markup-like popup label or invalid coordinates | Inert text or safe validation error; no executable content. |
| Shared computer, second project, old schema, corrupt saved state, blocked storage | No silent reuse, false completion, or false save assurance. |
| All questions answered with risks/uncertainties | Completion is visibly separate from acceptability or approval. |
| Leave a flowchart for a lookup and return; switch display modes | Context retained or explicit reset; coherent next step. |
| Closed/filtered mitigation guide; unanswered and risk-heavy checklist | Printed document includes intended content, states, scope and version. |
| Keyboard-only and screen-reader completion; narrow viewport and high zoom | All consequential controls and messages remain usable. |
| Source change or critical content error immediately before a deadline | Owner can correct/disable/roll back, and users see the change. |

## Evidence and limitations of this review

- Read the main application, decision data, FAQ, glossary, policy guide, checklist, mitigation and cybersecurity content, map/search logic, print CSS, deployment workflow, and project documentation.
- Checked current federal STRAC and NSGRP guidance, Ontario's published guidelines, Lakehead institutional sources, and the other primary sources linked beside the findings. This is not a complete legal audit of every sentence or funding opportunity.
- Prior review on the same unchanged application baseline: production build passed; scoped lint failed with 13 errors. Broad lint included worktrees/generated bundles and produced 1,017 errors. These are not 1,017 independent defects in the main application.
- Structural checks: three flowcharts had 9, 13 and 9 nodes; the STRA wizard had 84 nodes; no duplicate IDs, broken node references or unknown matched-category IDs were found. The local NRO data has 126 records with unique IDs/coordinate pairs and valid numeric coordinate ranges. None of these checks proves policy correctness or geographic accuracy.
- A lightweight official NRO HTML/name/alias comparison found broad coverage. The official page has nested organizations, while the local data flattens entries, so a raw primary-heading count is not a valid missing-record test. An alias spot check returned local search results for the sampled differently formatted aliases. Full record/alias/relationship reconciliation and coordinate validation remain required; this review does not allege a demonstrated missing official organization.
- Browser checks against the local production preview reproduced the NSGRP false exemption, the global-search failure for “Beihang,” and modal focus escape. Full cross-browser, mobile, assistive-technology and print testing remains outstanding.
- Fresh `npm audit`: 9 development/build dependency findings, fixes reported available. `npm audit --omit=dev`: 0 findings. This is an advisory database check, not proof that all dependencies are safe or that each advisory is reachable in this deployment.
- Five key policy-source URLs returned HTTP 200 and appropriate page titles after redirects. They should be normalized and monitored, but were not found broken in this check. The live-site header observation is a point-in-time read, not a complete hosting audit or a byte-for-byte comparison with the local release.
- No exploit, confidential geocoding request, actual grant assessment, external message, or publication was performed. Repository access protections, institutional approval, complete data provenance, provider contracts, recovery/rollback, and formal accessibility conformance were not verified.

## Release decision record

- [ ] All exposed B01–B13 functions corrected and verified, or removed from the release.
- [ ] R01–R12 completed for the claimed audience and scope; any pilot limitations are explicit.
- [ ] Policy lead approves the rule matrix, sources, version handling and user-facing outcomes.
- [ ] Legal/privacy, TSC/security, accessibility, and relevant Indigenous data-governance reviewers approve their scoped portions.
- [ ] Researchers and research security professionals pass the representative task walkthroughs.
- [ ] Release owner records version, reviewers, evidence, unresolved limitations, next review date and rollback owner.

The most defensible limited launch is a reviewed reference collection with authoritative links, explicit scope, and institutional escalation, while unvalidated decision engines, proximity matching, and external geocoding remain disabled. A disclaimer alone does not resolve the blockers.
