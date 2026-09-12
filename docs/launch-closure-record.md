# Launch closure record

Candidate: 0.1.0-rc.2. Content: 2026-09-12.1. Prepared 12 September 2026.
Operator confirmed by the user: Andrew Austin at Lakehead University.
Contact confirmed by the user: security.research@lakeheadu.ca.
Implementation/source reviewer: Codex, with self-review and automated verification. No outside specialist, institutional endorsement or independent certification is asserted.

**State: implementation and local verification complete; publication remains separate.** The owner explicitly chose to prepare another host and select it at release. The owner acceptance walkthrough and real-host verification remain open. The draft pull request's required verify check supplies remote CI results for its current revision.

## Scope and integration

The audit baseline was 9fa4db4. Implementation began in commit 16dad66 on codex/launch-safety. Newer master 3a44e38 was integrated before release preparation. Its license, assets, handoff history and additional tool sources were preserved; overlapping application changes use the reviewed candidate implementations.

The launch exposes the 12 tools from the agreed plan plus About. The master-only dual-use, travel-security and report-concern tools are preserved but disabled, omitted from navigation and absent from built chunks. Their original content/classifier was not validated by this project. Their routes return a clear unavailable state. This is an explicit scope difference from newer master, not an accidental merge omission.

The owner explicitly approved restoring visual flowcharts and the NRO map after RC1. RC2 provides diagrams from corrected shared policy branches and a new attributed location snapshot, with local defaults, campus confirmation and separate optional Wikipedia/OSM consent. Geographic risk inference and the legacy coordinates remain unvalidated and absent. See visual-tools-restoration.md for evidence and limits. The old STRA classifier is replaced, not validated. The dark forest/copper visual system of the audited checkout is retained.

## Findings

“Resolved for scope” means the reported behavior was corrected, replaced or removed within this bounded candidate. It does not satisfy historical demands for independent human certification. Original audit evidence remains in launch-safety-review.md.

| ID | Resolution and evidence | State / practical limit |
| --- | --- | --- |
| B01 | Program/private-partner RAF rule; no-risk still requires form; separate STRAC flow. policy.test.js P01/P02 and browser path | Resolved for scope |
| B02 | All three connection types, agency-specific named roles, trainee duties and applicable list versions reconciled across flow/FAQ/guide | Resolved for scope; unsupported historical/extension facts require actual instructions |
| B03 | Full Ontario Relevant Period, unrelated/co-publication definitions and NRO-specific Option B branch | Resolved for scope; no automated form assignment for every role |
| B04 | Canadian exports, domestic controlled goods and foreign-origin restrictions separated; nationality-only lab access rule removed | Replaced by scoped source reference |
| B05 | Sanctions country tiers/blanket prohibitions removed; applicable activity/regulations and indirect dealings explained | Replaced by scoped source reference |
| B06 | Weak password-ZIP recipe removed; managed procedures and exact Apple instructions linked | Replaced; no claim of a tested physical Mac procedure |
| B07 | Universal residency/retention claims removed; institution/ethics/account/community context and First Nations-specific OCAP attribution | Resolved for scope |
| B08 | Likelihood wizard deleted from active source; official category explorer and explicit user assessment | Replaced; 11 categories/74 named subcategories reconciled |
| B09 | 103 official entries/252 aliases, source anchors/hash, exact/alias/candidate distinctions; 55 separately sourced points for 54 entries | Resolved for scope; 49 unmapped; no historical list archive, campus-boundary or relationship verification |
| B10 | Restored map uses DOM textContent for popups/tooltips; remote responses are validated and fixed-host source links constructed | Replaced; malicious-label, malformed-response and CSP browser checks |
| B11 | Bundled overview/local comparisons; Wikipedia search and OSM tiles off by default with separate opt-ins, revocation and no fallback | Replaced; external disclosure remains explicit and optional; no analytics or remote fonts |
| B12 | Unique blank worksheets, explicit resume/undo/clear, validated opt-in persistence, unknown/unanswered/risk counts | Resolved for scope; unencrypted browser storage remains opt-in |
| B13 | Native dialog/controls and diagram step buttons, complete text alternatives, keyboard flow/map/source-list controls, contrast and reflow | Technical checks below; equivalent large text controls for overlapping map pins; owner assistive-technology acceptance open |
| R01 | Source register, 107 attributed content/path records, dated rule matrix, review deadline, overdue/visibility safeguards, disable/containment controls | Implemented; owner must maintain or withdraw |
| R02 | Separate Lakehead/general context and verified public research/RDM/IT/REB links | Resolved for scope; links do not imply institutional approval |
| R03 | Neutral worksheet prompts, evidence/identity verification, mistaken-name and proportionality guidance; demographic/geographic scoring absent | Resolved for scope |
| R04 | Published managed-IT boundaries and account-specific AI/online-service instructions replace assumed entitlements | Replaced; no administrative changes to institutional systems |
| R05 | Complete print DOM independent of filters/open sections; worksheet state, IDs, content/release dates and limits | Implemented and PDF-inspected; owner printer/device check open |
| R06 | Guided history and mode retained in session; coherent path completion, route title/focus, missing-route/chunk and stale-source recovery | Resolved for scope through browser journeys |
| R07 | Restrictive client CSP, tested local response configuration, portable _headers and Apache candidate; existing HTTPS enforcement enabled | Production custom headers/TLS/DNS host verification deferred by owner |
| R08 | Node 24.21.0, clean npm ci, dependency updates/audit, gated pinned CI, protected master, secret-scanning protection and Dependabot security fixes | Local checks and repository settings verified; require the current revision's verify check before promotion |
| R09 | Source-derived policy cases, state/search failures, three browser engines, axe, keyboard/reflow, print and containment suite | Technical verification; owner acceptance open; no representative-user study claimed |
| R10 | Private reporting contact, public About correction record, containment build/suite, rollback and retirement runbook | Local containment rehearsal passed; chosen-host rollback/promotion remains a release check |
| R11 | Explicit English/federal/Ontario/Lakehead scope and French policy search terms/official French links | Resolved for bounded English release; not a bilingual service |
| R12 | User-confirmed operator/contact, retained existing MIT license, generated dependency/font licenses and notices, single-maintainer operation/retirement plan | Ownership presentation complete; mailbox/operating acceptance remains with owner |

## Verification evidence

- Clean npm ci under Node 24.21.0 completed; dependency audit reported zero vulnerabilities. Advisory results are point-in-time dependency evidence, not a security certificate.
- Lint, 37 policy/state/search/diagram/geography unit tests, data checks and production build pass. RC2 adds nine unit cases and 30 browser cases for restored visual tools.
- 21 source records; 76 reference/worksheet items plus 31 path records in claim-register.json.
- Official STRA name reconciliation: zero missing/extra among 74 named subcategories. NRO data reconciliation and source hashes are described in policy-rule-matrix.md.
- Source availability: 20 direct HTTP 200 responses; FNIGC bot-protection 403 documented with official-page content inspection through the research browser. See evidence/source-availability-2026-09-12.json.
- RC1 passed 87/87 browser cases across Chromium, Firefox and WebKit. RC2's first expanded run passed 114/117; the three failures exposed a test assumption that BUAA returned one record, when it correctly includes an exact alias plus a separately labelled possible candidate. The print assertion was corrected to require both. All 45 affected visual, print, map, policy-history and accessibility cases passed after the final changes. CI runs the complete 117-case suite for the proposed revision; use that revision's verify result before promotion.
- Dedicated containment: 3/3 browser-engine checks passed again for RC2. Its separate local build is retained under artifacts/containment-rc2; the RC1 fallback remains under artifacts/containment. The normal candidate was rebuilt after the rehearsal.
- PDF inspection: A4 and Letter mitigation guides and a Letter worksheet were rendered; sampled pages were inspected for completeness, source/version metadata, visible unanswered states, grayscale legibility and clipping. Focus outlines in print and split worksheet blocks were corrected. Native PDF tagging/reader order is not certified.
- Production headers were read after enabling HTTPS. The HTTP redirect works. The existing Pages site still lacks the required custom response headers; the production checker correctly fails it.
- Repository master protection was read back: strict required verify status, enforce_admins enabled, force pushes/deletion disabled. Dependabot security fixes, secret scanning and push protection are enabled. Account MFA/recovery and registrar domain-verification state were not established from the available API responses.
- The preferred browser skill bridge failed initialization on this device. Reproducible Playwright tests and rendered artifacts supplied regression evidence; the available CUA fallback also verified the visible RC2 map, a live public Wikipedia search and a confirmed library-to-NRO distance comparison. Automated OSM tile tests use fixtures, with real-provider street-detail acceptance reserved for release. Letter flowchart and filtered-map PDFs were rendered and sampled for metadata, complete source records and clipping.
- No actual grant, confidential query, personal allegation, external message or public deployment was performed. Live source maintenance and the single public-institution search used public information only.

## Known limits and remaining owner release steps

1. Complete owner-acceptance.md, including actual comprehension/keyboard/assistive-technology checks that are available on your device and mailbox/maintenance confirmation. Record unperformed checks honestly.
2. Select the new host and supply/operate its access. Test response headers, TLS, caching, the real domain and rollback in that actual environment.
3. Review the exact candidate artifact/revision and authorize publication. After publication repeat critical journeys and the production header checker.

No external human reviewer is required by the agreed plan. These remaining steps belong to Andrew and Codex. Old specialist-signoff requirements are preserved as unperformed certification limits, not silently marked complete.

Next content review deadline: 12 October 2026, or immediately after a material source change. If maintenance cannot continue, withdraw preparation tools using the tested fallback.
