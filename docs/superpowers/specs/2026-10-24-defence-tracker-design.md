# Defence Institution Tracker — design

**Status:** approved by Andrew Austin, 2026-10-24. Task-level plan: `docs/superpowers/plans/2026-10-24-defence-tracker.md`.

## Context

ASPI's China Defence Universities Tracker was the free reference research security offices used to check a Chinese institution's military and security ties. In September 2025 ASPI relaunched it (180+ institutions) behind a US$5,000/year subscription, citing other people republishing its work. The only free copy, the MISP galaxy cluster (`MISP/misp-galaxy` → `clusters/china-defence-universities.json`), is a one-time August 2020 import of ASPI's 2019 data: 159 institutions, no risk ratings, untouched since 2020-08-22, and every reference link points back to ASPI's now-paywalled site.

Andrew's own due-diligence workflow (his `grant-collaborator-check` skill) scores ASPI's Very high / High / Medium ratings directly (20 / 10 / 5 points; "Very high + STRA research" is an automatic high-risk override), so the paywall left a hole in real NSGRP and STRAC files. This project builds a free, open, citable replacement inside RS Toolkit that becomes his main source for grant partner and co-author checks.

## Decisions

**Made by Andrew**
- **Primary use:** checking grant partners and co-authors for NSGRP Risk Assessment Forms and STRAC files. He needs sourced evidence for the record.
- **Home:** a new tool in RS Toolkit (Compliance Tools).
- **Upkeep:** Andrew, a day or more a month, with automation and Claude-assisted research. No outside contributor program at launch, though the public can report errors.
- **Screens:** the institution page, batch check and search screens, as mocked up and approved.
- **Ratings, coverage, upkeep and launch:** as played back and approved (details below).
- **Before the Lakehead review**, rated profiles stay on a separate content branch. Only code and official-list data merge to master, with the page hidden.
- **Dataset rights holder:** Andrew Austin personally ("© 2026 Andrew Austin, CC BY 4.0"). The code stays MIT © Seaway Digital.

**Calls I made** (please check these while reading)
1. The tool is named **Defence Institution Tracker**, slug `defence-tracker`, hidden behind `ENABLE_DEFENCE_TRACKER` until launch.
2. The dataset license is **CC BY 4.0**. The notice appears only on the tracker's methodology page and in its downloads. That is a deliberate, limited exception to HANDOFF §3d's "no owner named in the UI".
3. **No ASPI prose is imported.** MISP's structured fields serve only as a hidden research checklist.
4. **Unverified profiles show official listings only,** labelled "Not yet rated". *Amended 2026-10-25, see below.*
5. **Canada's sanctions list and the US Treasury SDN list count as formal listings,** alongside NRO, the Entity List, the Military End-User list, the 1286 list and Japan's End User List. Confirmed at the rubric gate.
6. A source that can't be archived gets an explicit **"no archived copy: reason"** note instead of blocking the profile.
7. **Hosting move:** a copied record must stand on its own without its link. Launch also needs one of two things: the final host, or an old-host redirect that keeps the `#…` part of the address.
8. **CI never writes to the repo.** The monthly watcher only opens or updates an issue.
9. **The map comes in phase 2b,** after the list view.
10. **Rating badges never use Blaze yellow or green.**

**Amendment, 2026-10-25 (Andrew's decision, after seeing the preview)**
With no profile researched yet, every row read "Not yet rated", which made the list hard to use. Andrew asked for a rating on every listed institution, for the lists each one is on to be visible in each row with what they mean, and for the page to work like the old ASPI tracker: a rating plus the sourced evidence behind it. So:
- **Rubric 1.1:** an institution not researched yet is rated **High from the official lists** when any checked list names it (the `listed` rule, which needs no research), labelled "from official lists" everywhere it appears. Overrides never apply to it. On no list and not researched stays "Not yet rated", never Low. A researched profile is rated by the whole rubric, as before.
- **Evidence from the lists:** each listing becomes a plain-language, sourced statement under "Why this rating" (who listed it, when, under which regulation, programme or Federal Register notice, with a link to the official source), and in the copied record.
- **Search rows** show chips for the lists an institution is on and a one-line note on what each means (STRAC for an NRO; sanctions: check the activity with Global Affairs Canada; US export controls).
- **Branches:** these ratings are computed from public official-list data alone, so they ship on master with it. Researched profiles and their ratings still wait for the Lakehead review on the content branch.
- **Next:** "other noteworthy issues" (reported cyber operations, espionage or export-control cases, and similar) come from researching each profile, recorded as sourced `misconduct` evidence under NSGRP 2.2, which the rubric shows but never rates on.

## Goals, non-goals, anti-goals

**Goals**
- Free, public, **institution-level** reference with four rating levels (Very high / High / Medium / Low), so Andrew's scoring matrix works unchanged.
- Every fact cited, with an archived copy where one can be made. Every lookup produces a dated line for the file, including "not found" results.
- Batch matching of messy affiliation strings, Chinese names, acronyms and email domains.
- Stays current: official lists are watched monthly, and every profile shows when it was last verified.
- Open data: JSON and CSV downloads under CC BY 4.0.

**Non-goals for v1:** a contributor program, checks on individual people, full Russia/Iran profiles, the UN sanctions list, a live API, co-author network analysis.

**Anti-goals** (a failure even if it works):
- profiles or names of individual people
- copying ASPI's text, ratings or paid data, or accessing the paid site
- a rating presented as a legal ruling
- any suggestion that "not listed" means safe
- anything the user types leaving the browser or being saved

## Design

### Placement and names
- Category Compliance Tools, CSS prefix `dit-`.
- Views by sub-route:
  - `#defence-tracker`: search
  - `#defence-tracker/<slug>`: institution page (permanent slug)
  - `#defence-tracker/batch`
  - `#defence-tracker/methodology`
- Tests stop any slug from equalling a reserved view name.
- **`ENABLE_DEFENCE_TRACKER`** in `src/siteConfig.js` follows the `ENABLE_PROXIMITY_SEARCH` pattern and stays `false` until launch. While off, it hides the registry entry, the route, every cross-link and the data downloads.

### Data: `src/data/defenceTracker/`
```
README.md        schema, sourcing rules, how to add/verify a record
LICENSE          CC BY 4.0 (dataset only); README/meta carry "© 2026 Andrew Austin"
meta.json        dataset version (YYYY.MM), release date, rubric version, license holder, attributions
changelog.json   dataset-level changes
institutions/<slug>.json   one file per institution (slug = nroData id when it is an NRO)
listings/us-csl.json       generated: US Entity List, Military End-User and SDN entries for CN/RU/IR research bodies
listings/ca-sanctions.json generated: Consolidated Canadian Autonomous Sanctions List entities (CN/RU/IR research bodies)
listings/us-1286.json      hand-maintained from the DoD PDF (fiscal year, date, entries)
listings/jp-meti-eul.json  hand-maintained from Japan's annual End User List
index.js         Vite-side loader (import.meta.glob, eager) → joins listings + nroData, rates, caches
```
Record shape (abridged):
```json
{
  "id": "harbin-institute-of-technology",
  "name": "Harbin Institute of Technology",
  "zh": "哈尔滨工业大学", "aliases": ["Harbin Polytechnic University"], "acronyms": ["HIT"],
  "domains": ["hit.edu.cn"], "country": "CN",
  "location": { "city": "Harbin", "province": "Heilongjiang", "lat": 45.7416, "lng": 126.6256 },
  "type": "university", "supervisors": ["MIIT"],
  "ids": { "ror": "01yqg2h08", "wikidata": "Q632558", "nro": "harbin-institute-of-technology", "misp": "<uuid>" },
  "evidence": [
    { "signal": "seven-sons", "annexB": ["2.1","2.3"], "summary": "<our own words>", "sources": ["s1"] },
    { "signal": "defence-key-labs", "count": 8, "items": ["<lab name (中文)>"], "annexB": ["2.3"], "sources": ["s2","s3"] }
  ],
  "topics": ["<straData category/subcategory ids>"],
  "subunits": [{ "name": "…", "zh": "…", "kind": "campus|lab|institute" }],
  "sources": [{ "id": "s1", "title": "…", "publisher": "…", "url": "…", "accessed": "2026-10-24", "lang": "zh",
                "archive": { "url": "https://web.archive.org/…" } }],
  "rating": { "override": null, "overrideReason": null },
  "status": "seed | listing-only | verified", "verifiedOn": "2026-10-24",
  "history": [{ "date": "2026-10-24", "change": "Verified; rated Very high." }],
  "seedNotes": { "...": "MISP structured fields, never displayed" }
}
```
- **`archive`** is either `{ "url": … }` or `{ "unavailable": "<reason, e.g. site blocks archiving>" }`. Every source on a verified profile must have one of the two, and tests enforce it.
- **Listings are joined in, not stored per record:**
  - **Canada NRO:** from the existing `src/data/nroData.js` through `ids.nro`, so the NRO list has a single source of truth.
  - **US Entity List, Military End-User list and SDN:** from the free Consolidated Screening List download (`https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.json`, no key). Checked on 2026-10-24: 26,173 entries, including 181 Chinese academic-type Entity List entries with dates and Federal Register citations (HIT, for example, was added 2020-06-05 under 85 FR 34497), and 238 research-type SDN entries in CN/RU/IR, such as Iran's Malek Ashtar University of Technology.
  - **Canadian sanctions:** from GAC's XML (`…/sanctions/sema-lmes.xml`; checked 2026-10-24: 200 OK, last modified 2026-10-15).
  - **US 1286 list:** FY25 list published 2026-07-23, naming 130 institutions in China, Russia and Iran. It is maintained by hand because its PDF host blocks automated fetches.
- **Listing-only records:** every listed CN/RU/IR research body without a profile gets a minimal record, so a batch check never misses it.
- **ROR enrichment** (CC0) supplies the Chinese label, acronyms, email domains, website, Wikidata id and child units. All were confirmed for HIT.
- **MISP seed:** structured fields only go into `seedNotes`. **ASPI's description prose is never imported.**

### Rating checklist (rubric v1, approved in outline)
Implemented as a pure function in `lib/rubric.js`. The first rule that matches wins. **Only verified evidence with at least one source counts.**

| Rating | Rule |
|---|---|
| Very high | **Structural:** part of the PLA/PAP/CMC system, a security-agency institution (MSS/MPS), a state-owned defence conglomerate or one of its institutes, the nuclear-weapons complex, or one of the Seven Sons of National Defence. **Or:** formally listed **and** doing major defence research. |
| High | Formally listed (Canada NRO, Canada sanctions, US Entity List, US Military End-User, US SDN, US 1286, Japan End User List). **Or** major defence research: two or more national defence key labs, a weapons R&D secrecy qualification, or a weapons production licence. **Or** substantial defence research: SASTIND co-construction, one defence key lab, or defence-specialty disciplines. |
| Medium | Limited defence links: documented defence-industry partnerships, defence-funded projects, or research collaboration with PLA institutions. |
| Low | Verified profile with none of the above. |
| Not yet rated | `seed` or `listing-only` profiles. Listings are still shown. |

- **Overrides:** at most one level up or down. A written reason is required and shown; tests enforce this. Documented misconduct (cyber operations, espionage or export-control cases) appears under NSGRP 2.2 and can justify a +1 override.
- **Sanctions banner:** a sanctions listing (Canadian or SDN) also shows one on the page and in the copied record. The wording follows CLAUDE.md's sanctions conventions: prohibitions are activity-specific and cover direct or indirect dealings, so check the specific activity with Global Affairs Canada. Never write a blanket ban or "criminal offence".
- **Output:** `{ rating, rule, reasons[] }`. The methodology page renders the rules from this module, so it can't drift from the code. `RUBRIC_VERSION` appears in copied records.
- **NSGRP mapping:** each evidence item is tagged with Annex B questions: 2.1 state influence, 2.2 misconduct or lack of transparency, 2.3 military or government ties.

### Matcher: `lib/matcher.js` and `lib/normalize.js`
Plain ESM so Node tests can import it.

**Normalization:**
- NFKC, which turns full-width characters into ASCII
- lowercase, strip diacritics, punctuation becomes spaces
- spell-out map: univ, inst, tech, sci, eng, natl, acad, coll, sch, dept, lab, res, aeronaut, astronaut, polytech
- defence and defense treated as the same word

**Match tiers:**
1. Email/web domain with suffix match (`mail.nwpu.edu.cn` → `nwpu.edu.cn`). Confirmed match.
2. Chinese name or alias of four or more characters as a substring. Confirmed match.
3. English name or alias as a whole-token phrase. Confirmed match.
4. Acronym token alone. Always "check", because HIT is also Holon Institute of Technology.
5. Fuse.js fuzzy fallback on comma-separated segments, only when nothing else matched. Shown as "possible match, confirm".

**Span rules:**
- When matches overlap, the longest one wins, so "Nanjing University" inside "Nanjing University of Science and Technology" is dropped.
- One line can match several institutions (dual affiliations).

**Fixture tests must cover:**
- Northwestern University (US) vs Northwestern Polytechnical University
- Beijing Institute of Technology vs Beijing University of Technology
- Nanjing University vs NJUST vs NUAA
- USTC vs UESTC
- Zhejiang University vs Zhejiang University of Technology
- HIT vs Holon
- full-width text
- email subdomains
- Chinese names inside longer strings

### Screens (approved mockups)
**1. Search (`#defence-tracker`)**
- One box that takes any name form, run through the matcher plus Fuse.
- Filters for rating, type, list and province.
- A list/map switch. The map comes in phase 2b.
- Result rows show a rating badge or "Not yet rated" and a listing summary.
- Header buttons: Batch check, Methodology, Data.
- Footer: "Ratings follow the published checklist. Not being listed here doesn't mean low risk."

**2. Institution page (`#defence-tracker/<slug>`)**
- **Header:** names (English, Chinese, acronym, domain), type, oversight body, and a rating badge with the date it was verified and the dataset version.
- **Buttons:**
  - **Copy record for file:** plain text that stands on its own without the link. It includes the institution name and slug, the rating and rule, listings with citations, key evidence, the verified date, dataset and rubric versions, the retrieval date, the permalink and the institution-level disclaimer.
  - **Print**
  - **Report an error:** a `mailto:` to `INSTITUTION_RS_CONTACT.email` with the slug in the subject, plus a GitHub issue form (the repo is public).
- **Sections:**
  - **Formal listings:** every list checked, including "Not listed" rows. The NRO row carries the STRAC note, and sanctions rows carry the banner.
  - **Why this rating:** the rubric reasons plus the rule that matched.
  - **NSGRP Annex B evidence:** 2.1 / 2.2 / 2.3 accordions.
  - **Detail sections:** defence labs, research areas linked to STRA Lookup, campuses and subsidiaries, numbered sources with archived copies or the "no archived copy: reason" note, change history.
- **Unverified profiles:** a "Profile under review" banner. Only names and listings are shown.

**3. Batch check (`#defence-tracker/batch`)**
- A textarea for pasted affiliations, emails or co-author lists. It is never saved anywhere.
- After checking:
  - summary counts
  - a results table: Your text | Match | Matched by | Rating | NRO | Other lists
  - "check" rows for acronym and fuzzy matches
  - "Not in tracker. That doesn't mean low risk." rows
  - a dated search line for the file
- Actions: Copy table (pastes cleanly into Word), Download CSV (built in the browser), Print.

**4. Methodology (`#defence-tracker/methodology`)**
- Purpose, and what a rating means and doesn't. The rubric is rendered from code.
- Sources and when each list was last checked.
- Verification and archiving policy.
- **Ethics statement:** institutions, not individuals. Affiliation says nothing about a person's intentions, in line with Canadian guidance against profiling.
- Not legal advice; official lists prevail.
- License notice ("© 2026 Andrew Austin, CC BY 4.0"), how to cite, downloads, attributions, changelog, how to report a correction.

**UI constraints (from CLAUDE.md):**
- Rating badges always carry a text label and reach ≥4.5:1 contrast on their background. Re-run the contrast math.
- Accordions get `aria-expanded`, and `aria-controls` only while the panel is mounted.
- Table headers use `scope`.
- Batch results are announced through `aria-live`.
- Print CSS: buttons hidden, accordions expanded.

### Routing change: `src/App.jsx`
- `getHashRoute()` returns `{ route, subRoute }` by parsing `#/?tool(/rest)?`, with a safe `decodeURIComponent`. The `Object.hasOwn(TOOL_COMPONENTS, route)` guard stays.
- Tools receive a `subRoute` prop (others ignore it) and an `onPageTitle` callback. App composes the title as `<Institution> — Defence Institution Tracker — Research Security Toolkit`.
  - **Don't set `document.title` from the child.** React runs child effects before the parent's, so App's effect would overwrite it.
- The focus and title effect depends on both `route` and `subRoute`.
- The ErrorBoundary key uses the full path. Data is cached at module level, so remounting is cheap.
- Update CLAUDE.md's "No params" routing convention to match.

### Open data downloads
- A small `trackerDataPlugin()` in `vite.config.js` emits `data/defence-tracker.json` (the full joined dataset with computed ratings, sources, version and license) and `data/defence-tracker.csv`.
- It emits them only when `ENABLE_DEFENCE_TRACKER` is on.
- It uses the same `lib/rubric.js` as the UI.
- UI links use `import.meta.env.BASE_URL`, so `BASE_PATH` hosting keeps working.

### Keeping it current
- **`scripts/tracker/sync-listings.mjs`**
  - Fetches the CSL (Entity List, Military End-User, SDN) and GAC's sanctions XML, filtered to research bodies in CN/RU/IR.
  - Maps entries to records through the matcher plus preserved manual mappings, then writes the `listings/` files.
  - Reports added, removed, changed and unmapped entries.
  - Also detects a new 1286 PDF or a new METI list version, and diffs the live NRO page against the names in `nroData.js`, which helps NRO Lookup too.
  - `--check` prints a markdown report and writes nothing.
- **`scripts/tracker/check-sources.mjs`:** finds dead source links and sources with no `archive` entry.
- **`scripts/tracker/archive-sources.mjs`:** run locally by Andrew.
  - Submits unarchived sources to the Wayback Machine, politely rate-limited.
  - Flags captures that look empty or blocked by an anti-bot page (by status, size or markers) for a manual archive.today attempt.
  - If both fail, records `archive.unavailable` with the reason.
  - Optional keys come from environment variables and are never committed.
- **npm scripts:** `tracker:sync`, `tracker:check`, `tracker:archive`.
- **`.github/workflows/tracker-watch.yml`**
  - Runs monthly (cron) plus on `workflow_dispatch`.
  - Permissions: `contents: read` and `issues: write` only.
  - Actions are SHA-pinned to the same versions as `deploy.yml`, with `persist-credentials: false`.
  - Runs `--check` and the source check, then creates or updates one "Tracker watch — YYYY-MM" issue with `gh`.
  - Treats fetch failures as "couldn't check" items.
  - Puts external names inside code spans and strips `@` so the issue can't ping anyone.
  - **Never writes to the repo.**
- **Research workflow:**
  - `.claude/skills/tracker-research/SKILL.md` (project skill) plus `docs/tracker/research-playbook.md`.
  - **Source order:** official lists and government documents → the institution's own sites (Chinese and English) → Chinese government notices (SASTIND, MIIT, MOE) → court and indictment records → reputable research (cite, never copy) → news only to corroborate.
  - **Each claim:** one sentence in our own words, at least one source, and an archive entry.
  - **Never** copy ASPI text, name individuals, or use loaded wording. Allegations are worded as "reported by…".
  - **Finishing a profile:** set the signals, run the rubric, set `status: verified` and `verifiedOn`, append to history, run `npm test`, and write a short review note for Andrew.
- **Priority queue:**
  1. Chinese institutions on Canada's NRO list
  2. US-listed Chinese universities
  3. Structural institutions: PLA, security agencies, defence conglomerates, nuclear, Seven Sons. These need only one or two sources each.
  4. The rest of the MISP list
  5. New additions: CAS institutes, joint-venture universities, newly listed bodies
  6. Russia/Iran profiles
- **Monthly routine** (about a day):
  1. Work through the watch issue: `npm run tracker:sync`, review, commit.
  2. Verify or refresh 15–25 profiles on the content branch (after launch, master).
  3. **Publish.** This happens automatically on merge while the site is on GitHub Pages. If the site moves to the Lakehead/TSC server, it means a release bundle per HANDOFF §2a on `claude/server-deploy-procedure` (`scripts/build-release.sh` + `install-release.sh`).

### Branches before launch (Andrew's decision)
- **master**, behind the hidden flag, gets code, tests, rubric, listing snapshots, and seed and listing-only records. All of it is public official-list data, with no ratings or evidence summaries.
- **A long-lived content branch** (e.g. `tracker/content`) holds verified, rated profiles.
  - It touches only `src/data/defenceTracker/institutions/*.json` and the changelog, so conflicts stay rare.
  - Merge master into it regularly.
  - It merges to master only after the Lakehead review has looked at the method and a sample of profiles.

## Implementation phases

**Phase 0, on approval**
- Copy this design to `docs/superpowers/specs/2026-10-24-defence-tracker-design.md`.
- Expand phases 1–3 into a task-level plan in `docs/superpowers/plans/2026-10-24-defence-tracker.md` using superpowers:writing-plans.
- Execute inline, phase by phase, on branch `claude/defense-tracker-list-plan-acb855`. Inline rather than subagents, because the account has hit usage limits before.

**Phase 1: data foundation (tests first)**
- `src/data/defenceTracker/` (README, LICENSE, meta, schema) and `src/tools/compliance/defence-tracker/lib/`: `rubric.js`, `normalize.js`, `matcher.js`, `recordText.js` (copy-for-file and CSV text).
- `scripts/tracker/import-misp.mjs`: a one-off at a pinned MISP commit that creates seed records, maps them to nroData ids and enriches them from ROR, with a report of anything unmatched.
- `scripts/tracker/sync-listings.mjs`: the first CSL and Canadian sanctions snapshots plus listing-only records.
- Tests: `tests/tracker-data.test.mjs`, `tests/tracker-rubric.test.mjs`, `tests/tracker-matcher.test.mjs` (+ `tests/fixtures/tracker-affiliations.json`).
- **Gate:** Andrew approves rubric v1, meaning the signal definitions, the table above and the sanctions lists, before any content verification starts.

**Phase 2: tool UI and toolkit integration**
- `src/tools/compliance/defence-tracker/`: `DefenceTracker.jsx` (view switch), `TrackerSearch.jsx`, `InstitutionProfile.jsx`, `BatchCheck.jsx`, `TrackerMethodology.jsx`.
- `src/App.jsx`: routing change, lazy import and flag guard.
- `src/data/toolRegistry.js`: entry with tags like aspi, defence, universities, background check, due diligence, entity list, sanctions, partners, co-authors.
- `src/siteConfig.js`: the flag.
- `src/styles/global.css`: `dit-` classes and print rules.
- `vite.config.js`: `trackerDataPlugin()`.
- **Cross-links, all hidden while the flag is off:**
  - "Tracker profile" link on matching rows in `NroLookup.jsx`
  - a "checking a partner or co-author" scenario in `Home.jsx`
  - one FAQ entry in `faqData.js` (update the FAQ count in CLAUDE.md)
  - a sentence in `howItWorksData.js` saying tracker searches and batch checks stay in the browser and are never saved. `dataFlows` and `STORAGE_KEYS` stay unchanged, and there are **no CSP changes**.
- **Phase 2b:** the map. Extract `MarkerCluster` (with a colour-function prop), `FlyToHandler` and the HTML-escape helper from `NroLookup.jsx` into `src/components/ui/map/`. NRO Lookup's dominant-country cluster colours must stay identical. The tracker colours by rating, with dark `#061727` text on fills and `activeTileProvider` from `mapTiles.js`.

**Phase 3: upkeep tooling**
- `check-sources.mjs`, `archive-sources.mjs`, `--check` mode, `tracker-watch.yml`, `.github/ISSUE_TEMPLATE/tracker-correction.yml`, and the research skill, playbook and priority queue.

**Phase 4: content to launch** (Andrew plus Claude research sessions on the content branch; not code)
- Verify priority groups 1–3.
- **Launch gates:**
  1. **Lakehead review** of the methodology and a sample of profiles. Also confirm that holding the dataset personally fits Lakehead's IP policy if any of the work is done in your Lakehead role.
  2. **Hosting:** either the site is on its final host, or the old host's redirect keeps the `#…` part of the address for as long as files may cite it. A meta refresh drops it; a tiny script redirect page keeps it.
  3. **Accessibility pass** of the new pages using the ACCESSIBILITY.md checklist.
  4. **Security review** of the new workflow, plus `npm audit`.
- Then merge the content branch, flip `ENABLE_DEFENCE_TRACKER` and publish.

**Phase 5: rolling expansion** at about a day a month: the remaining profiles, new institutions, Russia/Iran profiles, the UN sanctions list, and re-verification.

**Docs updated alongside:**
- CLAUDE.md: Tools Inventory, Directory Structure, Key Decisions (routing sub-paths; tracker data, rubric, ethics, licensing and branching conventions; the §3d exception), Deployment (the new workflow and its permissions).
- SECURITY.md: the new scheduled workflow.
- HANDOFF.md: maintainer duties and the monthly routine.
- README tool list.

## Reuse (don't rebuild)
- `src/data/nroData.js`: Canada NRO listing, ids and per-campus coordinates.
- `NroLookup.jsx` → `buildFuse` config pattern, `MarkerCluster`, `FlyToHandler`, `HTML_ESCAPES` (extract in phase 2b).
- `src/data/mapTiles.js` → `activeTileProvider` (same tile hosts, so no CSP change).
- `src/data/straData.js` category and subcategory ids for topic → STRA Lookup links.
- `INSTITUTION_RS_CONTACT` in `src/siteConfig.js` for corrections.
- The print conventions from `RiskChecklist` and the global print CSS.
- The test style in `tests/flowcharts.test.mjs` (Node's built-in runner, no dependencies).
- The SHA-pinned action versions in `.github/workflows/deploy.yml`. Dependabot already covers workflows.

## Verification
- `npm test`, `npm run lint`, `npm run build` and `npm audit --audit-level=high` all pass, with the new tests picked up by CI's `verify` job through the existing glob.
- **Preview:** create `.claude/launch.json` (`npm run dev`, port 5173) if missing, then `preview_start`. With the flag on locally:
  - search for `哈尔滨工业大学`, `nwpu.edu.cn` and `HIT` (should show "check")
  - open `#defence-tracker/harbin-institute-of-technology` directly and confirm the title, focus and back button
  - run the fixture list through batch check and confirm the counts, "check" rows, CSV contents and pasted table
  - print preview both the profile and the batch results
  - confirm **zero CSP violations** in the console and **zero external requests** from tracker pages in the network panel
  - keyboard-only pass, plus a phone-width layout check
  - check that `#defence-tracker/methodology` renders the rubric from code
  - with the flag off, confirm the tool, its links and the downloads are all unreachable
- **Scripts:** `node scripts/tracker/sync-listings.mjs --check` runs locally against the live CSL and GAC feeds. After merging, dispatch `tracker-watch.yml` once and confirm the issue looks right.
- **Content spot-check before launch:** five random verified profiles, checking that each evidence sentence is supported by its source and that archive links resolve or carry a reason.

## Follow-ups outside this branch
- **On `claude/server-deploy-procedure`:** change the HANDOFF §2b cutover redirect so it keeps the `#…` part of the address, and keep it up as long as possible. This matters for every tool's links, not just the tracker's.
- **Andrew's `grant-collaborator-check` skill:**
  - point it at the tracker's JSON on the final host instead of ASPI
  - fix its STRA list, which names 12 categories that don't match the official 11 verified in this toolkit and misses "Advanced Weapons" and "Advanced Sensing and Surveillance"
