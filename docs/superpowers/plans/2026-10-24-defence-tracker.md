# Defence Institution Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **This plan is executed inline (superpowers:executing-plans)** — Andrew chose inline execution because the account has hit subagent usage limits.

**Goal:** Add a free, open, citable Defence Institution Tracker to RS Toolkit — sourced risk ratings, official listings and a batch affiliation check for grant partner and co-author due diligence — hidden behind a launch flag until the content and the Lakehead review are done.

**Architecture:** Pure, Node-testable library modules (`src/tools/compliance/defence-tracker/lib/`) hold the rubric, matcher, dataset assembly and text formatting; the same modules serve the React views, the Node maintenance scripts (`scripts/tracker/`) and the build-time download plugin. Data lives as one JSON file per institution plus generated listing snapshots in `src/data/defenceTracker/`; listing-only institutions are synthesized at load time from snapshot entries, so they need no files. Sub-routes (`#defence-tracker/<slug>`) give citable permalinks.

**Tech Stack:** React 19 + Vite 8, Fuse.js 7 (already a dependency), Leaflet/react-leaflet (phase 2b), Node ≥20 built-ins (`fetch`, `node:test`, `node:fs`), GitHub Actions. **No new npm dependencies.**

**Spec:** `docs/superpowers/specs/2026-10-24-defence-tracker-design.md`

## Global Constraints

- Tool name **Defence Institution Tracker**; slug `defence-tracker`; category `compliance-tools`; CSS prefix `dit-`.
- Sub-routes: `#defence-tracker` (search), `#defence-tracker/<slug>` (institution), `#defence-tracker/batch`, `#defence-tracker/methodology`. Reserved slugs: `batch`, `methodology`.
- `ENABLE_DEFENCE_TRACKER` in `src/siteConfig.js` is `false` until launch; local preview via `VITE_ENABLE_DEFENCE_TRACKER=true`. When off: no registry entry, no route, no cross-links, no downloads.
- Rating levels, in order: `low` → "Low", `medium` → "Medium", `high` → "High", `very-high` → "Very high". Unverified records (`seed`, `listing-only`) show **"Not yet rated"**.
- Dataset licence **CC BY 4.0**, holder **Andrew Austin**, year **2026** (shown only on the tracker's methodology page and in its downloads). Code stays MIT © Seaway Digital.
- Never import ASPI's description prose; records have no top-level `description` field. Never name individual people.
- Fixed copy: search footer "Ratings follow the published checklist. Not being listed here doesn't mean low risk."; batch no-match row "Not in tracker. That doesn't mean low risk."; unverified banner "Profile under review"; pending list status "Not checked yet".
- Sanctions wording follows CLAUDE.md: prohibitions are activity-specific and cover direct or indirect dealings; tell the reader to check the specific activity with Global Affairs Canada. Never a blanket ban, never "criminal offence".
- Nothing the user types leaves the browser or is written to storage: the tracker adds **no** `localStorage` keys, **no** outbound requests and **no** CSP changes.
- Rating badges always carry a text label, reach ≥4.5:1 contrast on their background, and never use `--accent` (Blaze) or `--green`. Text drawn on Blaze or on map fills is `#061727`.
- Tests use `node:test` + `node:assert/strict`, run by the existing `npm test` glob (`tests/**/*.test.mjs`); library modules must import cleanly in plain Node (no JSX, no `import.meta.glob`, no browser globals).
- New workflow: actions SHA-pinned to the versions in `.github/workflows/deploy.yml` (checkout v7.0.1, setup-node v7.0.0), `persist-credentials: false`, permissions `contents: read` + `issues: write` only. CI never writes to the repo.
- Commits: one per task, **only after Andrew has OK'd committing on this branch**. When a task adds a convention, update the matching CLAUDE.md section in the same commit (the repo's pre-commit hook reminds you).

## Review Focus

- **A list with no data yet (US 1286, Japan EUL start `coverage: "pending"`)** must read "Not checked yet" everywhere — never "Not listed". Test: Task 3 `a pending list never reports not-listed`.
- **Pasted cells that start with `=`, `+`, `-` or `@`** must not become live spreadsheet formulas in the downloaded CSV. Test: Task 4 `CSV neutralises formula-like cells`.
- **Very large pastes** must not freeze the tab: batch check caps at 2,000 non-blank lines and says so. Test: Task 2 `long pastes are capped at 2000 lines`.
- **Malformed or unknown permalinks** (`#defence-tracker/%E0%A4%A`, a slug that doesn't exist) show a not-found view instead of crashing. Tests: Task 8 `parseHashRoute` cases and `resolveTrackerView` cases.
- **A name that is a prefix of a different institution's name** (Zhejiang University inside "Zhejiang University of Technology", which is not in the data) must not produce a confirmed match. Test: Task 2 fixture cases 15 and 10.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/tools/compliance/defence-tracker/lib/constants.js` | **new** — rating order/labels, signal definitions, list definitions, institution types, Annex B labels, reserved slugs |
| `src/tools/compliance/defence-tracker/lib/rubric.js` | **new** — `RUBRIC_VERSION`, `RUBRIC_RULES`, `rateInstitution()` |
| `src/tools/compliance/defence-tracker/lib/normalize.js` | **new** — text normalization, segmenting, tokens, domains |
| `src/tools/compliance/defence-tracker/lib/matcher.js` | **new** — match index, `matchLine`, `matchLines`, `searchRecords` |
| `src/tools/compliance/defence-tracker/lib/schema.js` | **new** — `validateRecord`, `validateSnapshot`, key order, `slugify` |
| `src/tools/compliance/defence-tracker/lib/dataset.js` | **new** — `buildDataset()` joins files + snapshots + nroData, synthesizes listing-only records, rates |
| `src/tools/compliance/defence-tracker/lib/recordText.js` | **new** — copy-for-file text, batch CSV/TSV, search-log line, dataset export |
| `src/tools/compliance/defence-tracker/lib/views.js` | **new** — `resolveTrackerView()` |
| `src/tools/compliance/defence-tracker/*.jsx` | **new** — `DefenceTracker`, `TrackerSearch`, `InstitutionProfile`, `BatchCheck`, `TrackerMethodology`, `RatingBadge`, `TrackerMap` |
| `src/data/defenceTracker/` | **new** — `README.md`, `LICENSE`, `meta.json`, `changelog.json`, `index.js` (Vite loader), `enabled.js` (flag + preview override), `institutions/*.json`, `listings/*.json` |
| `src/routing.js` | **new** — `parseHashRoute()` |
| `src/components/ui/map/` | **new (2b)** — `MarkerCluster.jsx`, `FlyToHandler.jsx`, `escapeHtml.js` extracted from NroLookup |
| `scripts/tracker/lib/{loadData,http,listings,sources,watchReport,priority}.mjs` | **new** — Node-side loading/writing, fetch helper, pure listing/source/report/priority helpers |
| `scripts/tracker/{import-misp,sync-listings,check-sources,archive-sources,watch,next}.mjs` | **new** — maintenance commands |
| `tests/tracker-*.test.mjs`, `tests/fixtures/tracker-*.json` | **new** — rubric, matcher, dataset, record text, data integrity, import, listings, routing/views, upkeep helpers |
| `.github/workflows/tracker-watch.yml`, `.github/ISSUE_TEMPLATE/tracker-correction.yml` | **new** |
| `.claude/skills/tracker-research/SKILL.md`, `docs/tracker/research-playbook.md` | **new** |
| `src/App.jsx`, `src/siteConfig.js`, `src/data/toolRegistry.js`, `src/styles/global.css`, `vite.config.js`, `eslint.config.js`, `package.json` | **modify** |
| `src/tools/compliance/NroLookup.jsx`, `src/components/home/Home.jsx`, `src/data/faqData.js`, `src/data/howItWorksData.js` | **modify** — flag-gated cross-links |
| `CLAUDE.md`, `SECURITY.md`, `HANDOFF.md`, `README.md` | **modify** |

Build-safe ordering: library → data + scripts → routing/flag → views → integration → map → upkeep → docs. The flag stays off throughout, so master never exposes a half-built tool.

---

## Part A — Core library

### Task 1: Constants and rubric

**Files:**
- Create: `src/tools/compliance/defence-tracker/lib/constants.js`, `src/tools/compliance/defence-tracker/lib/rubric.js`
- Test: `tests/tracker-rubric.test.mjs`

**Interfaces:**
- Produces (constants.js):
  - `RATING_ORDER = ['low', 'medium', 'high', 'very-high']`
  - `RATING_LABELS = { low: 'Low', medium: 'Medium', high: 'High', 'very-high': 'Very high' }`, `NOT_RATED_LABEL = 'Not yet rated'`
  - `SIGNALS: Record<string, { group: 'structural'|'labs'|'major'|'substantial'|'limited'|'misconduct'|'info', label: string, description: string }>` with keys `pla`, `security-agency`, `defence-conglomerate`, `nuclear-weapons`, `seven-sons` (structural); `defence-key-labs` (labs; uses `count`); `secrecy-qualification`, `weapons-production-licence` (major); `sastind-coconstruction`, `defence-disciplines` (substantial); `defence-industry-partnership`, `defence-funded-research`, `pla-collaboration` (limited); `misconduct`; `state-control` (info)
  - `LISTS: { id, label, jurisdiction, kind: 'research-security'|'sanctions'|'export-control', snapshot: 'nro'|'us-csl'|'ca-sanctions'|'us-1286'|'jp-meti-eul', sourceUrl }[]` with ids, in display order: `ca-nro`, `ca-sanctions`, `us-entity-list`, `us-meu`, `us-sdn`, `us-1286`, `jp-eul`
  - `ANNEX_B = { '2.1': 'State influence or control', '2.2': 'Misconduct or lack of transparency', '2.3': 'Military or government ties' }`
  - `INSTITUTION_TYPES = { university, military, security, 'defence-industry', 'research-institute', nuclear, company, other }` → display labels
  - `RESERVED_SLUGS = ['batch', 'methodology']`, `STATUSES = ['seed', 'listing-only', 'verified']`
- Produces (rubric.js):
  - `RUBRIC_VERSION = '1.0'`
  - `RUBRIC_RULES: { id, rating, text }[]` for ids `structural`, `listed-major`, `listed`, `major-research`, `substantial-research`, `limited-links`, `none`
  - `rateInstitution(record, listingHits) → { rating: string|null, baseRating: string|null, rule: string, ruleText: string, reasons: ({ signal, label } | { listId, label })[], overridden: boolean, overrideReason: string|null, overrideError: string|null }`
  - `listingHits` is `{ listId, status: 'listed'|'not-listed'|'not-checked', entries }[]`

- [ ] **Step 1: Write the failing test** — `tests/tracker-rubric.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateInstitution, RUBRIC_RULES, RUBRIC_VERSION } from '../src/tools/compliance/defence-tracker/lib/rubric.js';
import { SIGNALS } from '../src/tools/compliance/defence-tracker/lib/constants.js';

const SRC = [{ id: 's1', title: 'T', publisher: 'P', url: 'https://example.org/a', accessed: '2026-10-24',
  archive: { url: 'https://web.archive.org/web/2026/https://example.org/a' } }];
const rec = (over = {}) => ({ status: 'verified', evidence: [], sources: SRC, rating: { override: null, overrideReason: null }, ...over });
const ev = (signal, extra = {}) => ({ signal, summary: 'x', annexB: ['2.3'], sources: ['s1'], ...extra });
const LISTED = [{ listId: 'ca-nro', status: 'listed', entries: [{}] }];
const NONE = [{ listId: 'ca-nro', status: 'not-listed', entries: [] }];

test('unverified profiles are not rated', () => {
  for (const status of ['seed', 'listing-only']) {
    const a = rateInstitution(rec({ status, evidence: [ev('pla')] }), LISTED);
    assert.equal(a.rating, null);
    assert.equal(a.rule, 'not-yet-rated');
  }
});

test('any structural signal rates very high', () => {
  for (const s of ['pla', 'security-agency', 'defence-conglomerate', 'nuclear-weapons', 'seven-sons']) {
    const a = rateInstitution(rec({ evidence: [ev(s)] }), NONE);
    assert.equal(a.rating, 'very-high', s);
    assert.equal(a.rule, 'structural', s);
  }
});

test('formally listed plus major defence research rates very high', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('defence-key-labs', { count: 2 })] }), LISTED).rule, 'listed-major');
  assert.equal(rateInstitution(rec({ evidence: [ev('secrecy-qualification')] }), LISTED).rating, 'very-high');
});

test('formally listed alone rates high', () => {
  const a = rateInstitution(rec(), LISTED);
  assert.equal(a.rating, 'high');
  assert.equal(a.rule, 'listed');
});

test('major research without a listing rates high', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('defence-key-labs', { count: 2 })] }), NONE).rule, 'major-research');
  assert.equal(rateInstitution(rec({ evidence: [ev('weapons-production-licence')] }), NONE).rating, 'high');
});

test('substantial research rates high', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('defence-key-labs', { count: 1 })] }), NONE).rule, 'substantial-research');
  assert.equal(rateInstitution(rec({ evidence: [ev('sastind-coconstruction')] }), NONE).rating, 'high');
});

test('limited links rate medium; nothing rates low', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('pla-collaboration')] }), NONE).rating, 'medium');
  const low = rateInstitution(rec(), NONE);
  assert.equal(low.rating, 'low');
  assert.equal(low.rule, 'none');
});

test('misconduct and state-control evidence never drive the rating', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('misconduct'), ev('state-control')] }), NONE).rating, 'low');
});

test('evidence without a valid source does not count', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('pla', { sources: [] })] }), NONE).rating, 'low');
  assert.equal(rateInstitution(rec({ evidence: [ev('pla', { sources: ['missing'] })] }), NONE).rating, 'low');
});

test('lists that were not checked do not count as listed', () => {
  assert.equal(rateInstitution(rec(), [{ listId: 'us-1286', status: 'not-checked', entries: [] }]).rating, 'low');
});

test('a one-level override with a reason is applied', () => {
  const a = rateInstitution(rec({ evidence: [ev('pla-collaboration')], rating: { override: 'high', overrideReason: 'Reported cyber operations (s1).' } }), NONE);
  assert.equal(a.rating, 'high');
  assert.equal(a.baseRating, 'medium');
  assert.equal(a.overridden, true);
  assert.equal(a.overrideError, null);
});

test('overrides of two levels or without a reason are rejected', () => {
  const two = rateInstitution(rec({ evidence: [ev('pla-collaboration')], rating: { override: 'very-high', overrideReason: 'x' } }), NONE);
  assert.equal(two.rating, 'medium');
  assert.ok(two.overrideError);
  const noReason = rateInstitution(rec({ evidence: [ev('pla-collaboration')], rating: { override: 'high', overrideReason: '' } }), NONE);
  assert.equal(noReason.rating, 'medium');
  assert.ok(noReason.overrideError);
});

test('reasons name the signals or listings behind the rule', () => {
  assert.ok(rateInstitution(rec({ evidence: [ev('seven-sons')] }), NONE).reasons.some((r) => r.signal === 'seven-sons'));
  assert.ok(rateInstitution(rec(), LISTED).reasons.some((r) => r.listId === 'ca-nro'));
});

test('every rule id has rendered text, and the version is 1.0', () => {
  const ids = new Set(RUBRIC_RULES.map((r) => r.id));
  for (const id of ['structural', 'listed-major', 'listed', 'major-research', 'substantial-research', 'limited-links', 'none']) assert.ok(ids.has(id), id);
  assert.equal(RUBRIC_VERSION, '1.0');
});

test('every signal has a group and a label', () => {
  for (const [key, s] of Object.entries(SIGNALS)) assert.ok(s.group && s.label, key);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test tests/tracker-rubric.test.mjs` → FAIL (`Cannot find module …/rubric.js`).
- [ ] **Step 3: Implement** `constants.js` (values above; `LISTS[].sourceUrl` for `ca-nro` is the Source URLs table's NRO URL; `ca-sanctions` → `https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx?lang=eng`; US lists → `https://www.trade.gov/consolidated-screening-list`; `us-1286` → `https://basicresearch.defense.gov/Pubs/Academic-Research-Security/`; `jp-eul` → `https://www.meti.go.jp/policy/anpo/law05.html`) and `rateInstitution` in `rubric.js`. Counting rule: an evidence item counts only if `record.status === 'verified'`, its `signal` is in `SIGNALS`, and it cites ≥1 id present in `record.sources`. `labsCount` = max `count` over counted `defence-key-labs` items (default `items.length || 1`). First match wins: structural → `listed && major` → `listed` → `major` (labs ≥2, `secrecy-qualification`, `weapons-production-licence`) → `substantial` (labs = 1, `sastind-coconstruction`, `defence-disciplines`) → `limited` → `none`. `listed` = any hit with `status === 'listed'`. Override applies only when it is in `RATING_ORDER`, within one step of the base rating, and has a non-blank reason; otherwise set `overrideError` and keep the base.
- [ ] **Step 4: Run to verify it passes** — `node --test tests/tracker-rubric.test.mjs` → all pass.
- [ ] **Step 5: Commit** — `git add src/tools/compliance/defence-tracker/lib tests/tracker-rubric.test.mjs && git commit -m "feat(tracker): rating rubric v1"`

### Task 2: Normalization and matcher

**Files:**
- Create: `src/tools/compliance/defence-tracker/lib/normalize.js`, `src/tools/compliance/defence-tracker/lib/matcher.js`
- Test: `tests/tracker-matcher.test.mjs`, `tests/fixtures/tracker-records.json`, `tests/fixtures/tracker-affiliations.json`

**Interfaces:**
- Produces (normalize.js): `nfkc(s) → string`; `hasCjk(s) → boolean`; `splitSegments(line) → string[]` (delimiters `, ; ( ) [ ] / | · •` and their full-width forms after NFKC); `segmentTokens(segment) → { kept: string[], rawAfter: (string|null)[] }` where `kept` are normalized tokens with stopwords removed and `rawAfter[i]` is the raw token that follows kept token `i` in the segment (or `null`); `normalizePhrase(s) → string` (kept tokens joined by one space); `extractDomains(s) → string[]`; `compactCjk(s) → string`; `osaDistance(a, b, max) → number`; constants `STOPWORDS = ['of', 'and', 'the', 'for', 'at', 'in']`, `ABBREVIATIONS` (`univ→university`, `inst→institute`, `tech|technol→technology`, `sci|sciences→science`, `eng|engn|engg→engineering`, `natl|nat→national`, `acad→academy`, `coll→college`, `sch→school`, `dept→department`, `lab|labs→laboratory`, `res→research`, `aeronaut→aeronautics`, `astronaut→astronautics`, `polytech→polytechnical`, `def|defence→defense`, `centre→center`, `peoples→people`), `PERSONAL_EMAIL_DOMAINS` (`gmail.com, 163.com, 126.com, qq.com, foxmail.com, sina.com, sohu.com, yeah.net, aliyun.com, outlook.com, hotmail.com, yahoo.com, icloud.com, proton.me, protonmail.com, yandex.ru, mail.ru`)
- Produces (matcher.js):
  - `buildMatchIndex(records) → MatchIndex` (records need `id, name, aliases, zh, zhAliases, acronyms, domains`; listing-only records contribute their names too)
  - `matchLine(line, index) → { id, matchedBy: 'domain'|'chinese-name'|'name'|'acronym'|'similar-name', confidence: 'confirmed'|'check', text }[]` — one entry per institution, strongest tier kept
  - `matchLines(text, index) → { lines: { input, matches }[], truncated: boolean, totalLines: number }` — blank lines skipped, `MAX_BATCH_LINES = 2000` non-blank lines
  - `searchRecords(query, index, { limit = 50 } = {}) → string[]` (ids, exact matches first, then Fuse results; Fuse `threshold: 0.35, ignoreLocation: true`)

- [ ] **Step 1: Write the fixtures.** `tests/fixtures/tracker-records.json` — 14 synthetic records (fields `id, name, aliases, zh, zhAliases, acronyms, domains`): `harbin-institute-of-technology` (哈尔滨工业大学, HIT, hit.edu.cn), `harbin-engineering-university` (哈尔滨工程大学, HEU, hrbeu.edu.cn), `northwestern-polytechnical-university` (西北工业大学, NWPU, nwpu.edu.cn), `beijing-institute-of-technology` (北京理工大学, BIT, bit.edu.cn), `nanjing-university` (南京大学, NJU, nju.edu.cn), `nanjing-university-of-science-and-technology` (南京理工大学, NJUST, njust.edu.cn), `nanjing-university-of-aeronautics-and-astronautics` (南京航空航天大学, NUAA, nuaa.edu.cn), `university-of-science-and-technology-of-china` (中国科学技术大学, USTC, ustc.edu.cn), `university-of-electronic-science-and-technology-of-china` (电子科技大学, UESTC, uestc.edu.cn), `zhejiang-university` (浙江大学, ZJU, zju.edu.cn), `national-university-of-defense-technology` (国防科技大学, NUDT, nudt.edu.cn), `beihang-university` (alias "Beijing University of Aeronautics and Astronautics"; 北京航空航天大学, BUAA, buaa.edu.cn), `chinese-academy-of-sciences` (中国科学院, CAS, cas.cn), `university-of-chinese-academy-of-sciences` (中国科学院大学, UCAS, ucas.ac.cn).
  `tests/fixtures/tracker-affiliations.json` — `{ input, expect: { id, confidence }[] }[]` (ids abbreviated here; use full ids):

  | # | input | expect |
  |---|---|---|
  | 1 | `School of Astronautics, Harbin Inst. of Tech., Harbin 150001, China` | HIT confirmed |
  | 2 | `zhang.wei@nudt.edu.cn` | NUDT confirmed |
  | 3 | `li@mail.nwpu.edu.cn` | NWPU confirmed |
  | 4 | `北京航空航天大学 宇航学院` | Beihang confirmed |
  | 5 | `HIT` | HIT check |
  | 6 | `ＨＩＴ` | HIT check |
  | 7 | `Northwestern University, Evanston, IL, USA` | — |
  | 8 | `Beijing University of Technology` | — |
  | 9 | `Beijing Institute of Technology, Zhuhai` | BIT confirmed |
  | 10 | `Nanjing University of Science and Technology` | NJUST confirmed |
  | 11 | `Nanjing University of Aeronautics and Astronautics` | NUAA confirmed |
  | 12 | `Dept. of Physics, Nanjing University` | NJU confirmed |
  | 13 | `University of Electronic Science and Technology of China` | UESTC confirmed |
  | 14 | `Univ. of Sci. & Tech. of China, Hefei` | USTC confirmed |
  | 15 | `Zhejiang University of Technology` | — |
  | 16 | `College of Computer Science, Zhejiang University` | ZJU confirmed |
  | 17 | `哈尔滨工业大学（深圳）` | HIT confirmed |
  | 18 | `Univ Chinese Acad Sci, Beijing` | UCAS confirmed |
  | 19 | `Institute of Automation, Chinese Academy of Sciences` | CAS confirmed |
  | 20 | `Harbin Engineering University` | HEU confirmed |
  | 21 | `Harbin Institute of Technology; Beihang University` | HIT confirmed, Beihang confirmed |
  | 22 | `Natl Univ Def Technol, Changsha` | NUDT confirmed |
  | 23 | `Beijing University of Aeronautics and Astronautics` | Beihang confirmed |
  | 24 | `Harbin Insitute of Technolgy` | HIT check |
  | 25 | `Harbin Institute of Technology (哈尔滨工业大学), HIT` | HIT confirmed |
  | 26 | `Shantou University, Guangdong` | — |
  | 27 | `wang@163.com` | — |
  | 28 | `Nanjing University, School of Physics` | NJU confirmed |
  | 29 | `Nanjing University of Science & Technology` | NJUST confirmed |

- [ ] **Step 2: Write the failing test** — `tests/tracker-matcher.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildMatchIndex, matchLine, matchLines, searchRecords } from '../src/tools/compliance/defence-tracker/lib/matcher.js';

const read = (f) => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'));
const index = buildMatchIndex(read('tracker-records.json'));
const norm = (ms) => ms.map(({ id, confidence }) => ({ id, confidence })).sort((a, b) => a.id.localeCompare(b.id));

for (const [i, c] of read('tracker-affiliations.json').entries()) {
  test(`case ${i + 1}: ${c.input}`, () => assert.deepEqual(norm(matchLine(c.input, index)), norm(c.expect)));
}

test('matchedBy reports how a line matched', () => {
  assert.equal(matchLine('zhang@nudt.edu.cn', index)[0].matchedBy, 'domain');
  assert.equal(matchLine('北京航空航天大学', index)[0].matchedBy, 'chinese-name');
  assert.equal(matchLine('Harbin Institute of Technology', index)[0].matchedBy, 'name');
  assert.equal(matchLine('HIT', index)[0].matchedBy, 'acronym');
  assert.equal(matchLine('Harbin Insitute of Technolgy', index)[0].matchedBy, 'similar-name');
});

test('blank lines are skipped', () => {
  const r = matchLines('\n\n  \nHIT\n', index);
  assert.equal(r.lines.length, 1);
  assert.equal(r.truncated, false);
});

test('long pastes are capped at 2000 lines', () => {
  const r = matchLines(Array.from({ length: 2500 }, () => 'Harbin Institute of Technology').join('\n'), index);
  assert.equal(r.lines.length, 2000);
  assert.equal(r.truncated, true);
  assert.equal(r.totalLines, 2500);
});

test('personal email domains never match', () => {
  assert.deepEqual(matchLine('wang@163.com; li@gmail.com; x@qq.com', index), []);
});

test('searchRecords ranks exact identifiers first', () => {
  assert.equal(searchRecords('nwpu.edu.cn', index)[0], 'northwestern-polytechnical-university');
  assert.equal(searchRecords('哈尔滨工业大学', index)[0], 'harbin-institute-of-technology');
  const harbin = searchRecords('harbin', index);
  assert.ok(harbin.includes('harbin-institute-of-technology') && harbin.includes('harbin-engineering-university'));
  assert.deepEqual(searchRecords('   ', index), []);
});
```

- [ ] **Step 3: Run to verify it fails** — `node --test tests/tracker-matcher.test.mjs` → FAIL (module not found).
- [ ] **Step 4: Implement `normalize.js`** per the interface. Token pipeline: NFKC → lowercase → strip diacritics (NFD, drop `\p{M}`) → drop apostrophes → `&` → ` and ` → non-alphanumerics to spaces → split → apply `ABBREVIATIONS` per token → drop `STOPWORDS` from `kept` while recording each kept token's following raw token.
- [ ] **Step 5: Implement `matcher.js`.** The algorithm the tests don't fully determine:

```text
index build
  phrases: Map<normalizePhrase(name|alias), Set<id>>   — only phrases of ≥2 kept tokens
  cjk:     [{ text: compactCjk(zh|zhAlias), id }]       — only CJK strings of ≥4 chars, longest first
  acronyms: Map<UPPERCASE acronym, Set<id>>
  domains: [{ domain, id }]                             — lowercase, never a public suffix
  fuzzy:   bucket phrases by first char of their first token
matchLine(line)
  1 domains: extractDomains(nfkc(line)); skip PERSONAL_EMAIL_DOMAINS; d === dom || d.endsWith('.' + dom) → confirmed/domain
  2 CJK: find every cjk text in compactCjk(nfkc(line)); resolve overlapping char spans longest-first → confirmed/chinese-name
  3 names: per splitSegments() segment, for each start i and length L≥2 look up kept[i..i+L);
           reject a hit whose rawAfter[end] is 'of', 'and' or 'for';
           resolve overlapping token spans longest-first → confirmed/name
  4 acronyms: raw NFKC tokens matching /^[A-Z][A-Z0-9&-]{1,7}$/ → check/acronym
  5 only if steps 1–4 found nothing: per segment, slide windows of each bucketed phrase's length;
           accept when every token pair has osaDistance ≤ 1 (≤ 2 for tokens ≥ 8 chars, 0 for tokens < 5 chars),
           at least one pair is not identical, and rawAfter[end] is not 'of'/'and'/'for' → check/similar-name
  dedupe by id keeping tier order domain > chinese-name > name > acronym > similar-name
```

  `searchRecords`: `matchLine(query)` ids first (confirmed before check), then Fuse over `name` (weight 3), `aliases`, `zh`, `zhAliases`, `acronyms`, `domains`, de-duplicated, capped at `limit`.
- [ ] **Step 6: Run to verify it passes** — `node --test tests/tracker-matcher.test.mjs` → all pass.
- [ ] **Step 7: Commit** — `git commit -m "feat(tracker): affiliation matcher"` (files above).

### Task 3: Schema validation and dataset assembly

**Files:**
- Create: `src/tools/compliance/defence-tracker/lib/schema.js`, `src/tools/compliance/defence-tracker/lib/dataset.js`
- Test: `tests/tracker-dataset.test.mjs`

**Interfaces:**
- Consumes: `LISTS`, `STATUSES`, `RESERVED_SLUGS`, `SIGNALS`, `ANNEX_B` (Task 1); `rateInstitution` (Task 1).
- Produces (schema.js):
  - `RECORD_KEY_ORDER = ['id', 'name', 'zh', 'zhAliases', 'aliases', 'acronyms', 'domains', 'country', 'type', 'location', 'supervisors', 'parent', 'ids', 'evidence', 'topics', 'subunits', 'sources', 'rating', 'status', 'verifiedOn', 'history', 'seedNotes']`
  - `validateRecord(record) → string[]` (empty = valid). Rules: `id` kebab-case `/^[a-z0-9]+(-[a-z0-9]+)*$/` and not reserved; `name` non-empty; `status` in `STATUSES`; `type` in `INSTITUTION_TYPES`; no keys outside `RECORD_KEY_ORDER` (so no `description`); unverified ⇒ `evidence` empty and `verifiedOn` null; verified ⇒ `verifiedOn` is a valid `YYYY-MM-DD` not after today; every evidence item has a known `signal`, non-empty `summary`, `annexB ⊆ {2.1, 2.2, 2.3}` and ≥1 source id that exists; every source has `id`, `title`, `url` (http/https), `accessed` date; on verified records every source has `archive.url` or a non-blank `archive.unavailable`; domains are lowercase hostnames that are not public suffixes (`cn, edu.cn, ac.cn, com.cn, gov.cn, org.cn, ru, ac.ru, ir, ac.ir, com, org, net, edu`); `ids.ror` matches `/^0[a-z0-9]{6}[0-9]{2}$/` when present; `rating.override` null or in `RATING_ORDER`.
  - `validateSnapshot(snapshot) → string[]`: `snapshot` in `['us-csl', 'ca-sanctions', 'us-1286', 'jp-meti-eul']`; `coverage` in `['complete', 'pending']`; `checkedOn` date or null; every entry has `key`, `list` (an `LISTS` id belonging to this snapshot), `name`, `institution` (kebab-case or null); keys unique.
  - `orderRecordKeys(record) → record`; `slugify(name) → string` (NFKC, ASCII-fold, lowercase, kebab, ≤80 chars).
- Produces (dataset.js):
  - `buildDataset({ institutions, snapshots, nroData, meta }) → { meta, records, byId: Map, lists }`
  - each record gains `virtual: boolean`, `listings: { listId, label, jurisdiction, kind, status, entries }[]` (one per `LISTS` entry, in `LISTS` order) and `assessment` (from `rateInstitution`)
  - `lists: { listId, label, coverage, checkedOn, sourceUrl }[]` — `ca-nro` uses `meta.listsCheckedOn['ca-nro']`
  - Virtual records are made for every snapshot `institution` slug and every `nroData` organization without a file: `status: 'listing-only'`, names from entries/nroData, `type` guessed (`university` when the name contains university/college, else `research-institute`).
  - Listing status: `not-checked` when the list's snapshot has `coverage: 'pending'`; `listed` when entries map to the record (NRO: `record.ids.nro === org.id`); otherwise `not-listed`.

- [ ] **Step 1: Write the failing test** — `tests/tracker-dataset.test.mjs` builds a synthetic dataset (one verified HIT file with `ids.nro` and a `seven-sons` evidence item; nroData with HIT and `nro-only-institute` (Iran); `us-csl` snapshot with an Entity List entry for HIT dated `2020-06-05`, citation `85 FR 34497`, and an SDN entry mapped to `example-listed-university`; `ca-sanctions` complete and empty; `us-1286` and `jp-meti-eul` pending) and asserts:

```js
test('files, NRO-only organizations and unmapped listings all become records', () => {
  for (const id of ['harbin-institute-of-technology', 'nro-only-institute', 'example-listed-university']) assert.ok(ds.byId.has(id), id);
  assert.equal(ds.byId.get('harbin-institute-of-technology').virtual, false);
  assert.equal(ds.byId.get('example-listed-university').virtual, true);
  assert.equal(ds.byId.get('example-listed-university').status, 'listing-only');
});

test('listing statuses: listed, not-listed, not-checked', () => {
  const s = (id, listId) => ds.byId.get(id).listings.find((l) => l.listId === listId).status;
  assert.equal(s('harbin-institute-of-technology', 'ca-nro'), 'listed');
  assert.equal(s('harbin-institute-of-technology', 'us-entity-list'), 'listed');
  assert.equal(s('harbin-institute-of-technology', 'us-sdn'), 'not-listed');
  assert.equal(s('harbin-institute-of-technology', 'us-1286'), 'not-checked');
  assert.equal(s('harbin-institute-of-technology', 'jp-eul'), 'not-checked');
});

test('a pending list never reports not-listed', () => {
  for (const r of ds.records) for (const l of r.listings.filter((x) => ['us-1286', 'jp-eul'].includes(x.listId))) assert.equal(l.status, 'not-checked');
});

test('listings carry the official entry details', () => {
  const el = ds.byId.get('harbin-institute-of-technology').listings.find((l) => l.listId === 'us-entity-list').entries[0];
  assert.equal(el.date, '2020-06-05');
  assert.equal(el.citation, '85 FR 34497');
});

test('verified records are rated; listing-only records are not', () => {
  assert.equal(ds.byId.get('harbin-institute-of-technology').assessment.rating, 'very-high');
  assert.equal(ds.byId.get('example-listed-university').assessment.rating, null);
});

test('an NRO-only record takes its name, aliases and location from nroData', () => {
  const r = ds.byId.get('nro-only-institute');
  assert.equal(r.name, 'NRO Only Institute');
  assert.equal(r.location.city, 'Tehran');
});

test('the lists summary reports coverage and check dates', () => {
  const l = Object.fromEntries(ds.lists.map((x) => [x.listId, x]));
  assert.equal(l['us-1286'].coverage, 'pending');
  assert.equal(l['ca-nro'].checkedOn, '2026-09-24');
  assert.equal(l['us-entity-list'].checkedOn, '2026-10-24');
});

test('validateRecord catches schema breaks', () => {
  const errs = validateRecord({ ...HIT, id: 'Bad Id', status: 'done' });
  assert.ok(errs.some((e) => e.includes('id')) && errs.some((e) => e.includes('status')));
  assert.ok(validateRecord({ ...HIT, id: 'batch' }).some((e) => e.includes('reserved')));
  assert.ok(validateRecord({ ...HIT, description: 'copied prose' }).some((e) => e.includes('description')));
  assert.ok(validateRecord({ ...HIT, sources: [{ ...HIT.sources[0], archive: undefined }] }).some((e) => e.includes('archive')));
  assert.ok(validateRecord({ ...HIT, status: 'seed', verifiedOn: null }).some((e) => e.includes('evidence')));
  assert.deepEqual(validateRecord(HIT), []);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test tests/tracker-dataset.test.mjs` → FAIL.
- [ ] **Step 3: Implement `schema.js` and `dataset.js`** per the interfaces.
- [ ] **Step 4: Run to verify it passes** — `node --test tests/tracker-dataset.test.mjs` → all pass.
- [ ] **Step 5: Commit** — `git commit -m "feat(tracker): schema validation and dataset assembly"`.

### Task 4: Record text, CSV and export

**Files:**
- Create: `src/tools/compliance/defence-tracker/lib/recordText.js`
- Test: `tests/tracker-recordtext.test.mjs`

**Interfaces:**
- Consumes: dataset records (Task 3), `RATING_LABELS`, `NOT_RATED_LABEL`, `LISTS` (Task 1).
- Produces:
  - `formatRecordForFile(record, { meta, permalink, retrievedOn }) → string`
  - `searchLogLine({ date, meta, counts: { lines, matched, check, notFound } }) → string`
  - `batchResultsToCsv(lines, byId) → string` and `batchResultsToText(lines, byId) → string` (tab-separated, same columns)
  - `BATCH_COLUMNS = ['Your text', 'Match', 'Matched by', 'Confidence', 'Rating', 'NRO', 'Other lists', 'Profile']`
  - `datasetToExport(dataset) → object` (`{ meta, lists, records }`, records without `seedNotes`) and `datasetToCsv(dataset) → string` (one row per record: `id, name, zh, acronyms, domains, country, type, status, rating, verified_on, listed_on, profile_path`)
  - `csvCell(value) → string` — RFC 4180 quoting; cells starting with `=`, `+`, `-`, `@`, tab or CR get a leading `'`.

- [ ] **Step 1: Write the failing test** — `tests/tracker-recordtext.test.mjs` (uses the synthetic dataset helper from Task 3 — extract it to `tests/fixtures/trackerDataset.mjs` and import it in both tests):

```js
test('a record for the file stands on its own', () => {
  const text = formatRecordForFile(hit, { meta, permalink: 'https://rs.example/#defence-tracker/harbin-institute-of-technology', retrievedOn: '2026-10-24' });
  for (const s of ['Harbin Institute of Technology', '哈尔滨工业大学', 'harbin-institute-of-technology', 'Rating: Very high',
    'Named Research Organizations', 'Entity List', '85 FR 34497', 'Verified: 2026-10-24', 'Dataset: 2026.10', 'Rubric: 1.0',
    'Retrieved: 2026-10-24', 'https://rs.example/#defence-tracker/harbin-institute-of-technology', 'institution-level']) {
    assert.ok(text.includes(s), s);
  }
});

test('an unverified record says it is not yet rated and marks unchecked lists', () => {
  const text = formatRecordForFile(listingOnly, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Rating: Not yet rated'));
  assert.ok(text.includes('Not checked yet'));
});

test('a sanctions listing adds the sanctions note without blanket-ban wording', () => {
  const text = formatRecordForFile(sanctioned, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Global Affairs Canada'));
  assert.ok(!/criminal offence/i.test(text));
});

test('the CSV header is fixed', () => {
  assert.equal(batchResultsToCsv([], byId).split('\r\n')[0], 'Your text,Match,Matched by,Confidence,Rating,NRO,Other lists,Profile');
});

test('CSV quotes commas, quotes and newlines', () => {
  assert.equal(csvCell('Dept, "A"\nB'), '"Dept, ""A""\nB"');
});

test('CSV neutralises formula-like cells', () => {
  for (const v of ['=HYPERLINK("x")', '+1', '-1', '@SUM(A1)']) assert.ok(csvCell(v).replace(/^"/, '').startsWith("'"), v);
});

test('the search log line has the date, dataset and counts', () => {
  assert.equal(
    searchLogLine({ date: '2026-10-24', meta: { version: '2026.10', rubricVersion: '1.0' }, counts: { lines: 6, matched: 4, check: 1, notFound: 1 } }),
    'Checked 2026-10-24 against Defence Institution Tracker dataset 2026.10 (rubric 1.0): 6 lines — 4 matched, 1 to check, 1 not in tracker.',
  );
});

test('the dataset CSV has one row per record and no seed notes in the export', () => {
  assert.equal(datasetToCsv(ds).trim().split('\r\n').length, ds.records.length + 1);
  assert.ok(datasetToExport(ds).records.every((r) => !('seedNotes' in r)));
});
```

- [ ] **Step 2: Run to verify it fails.** — `node --test tests/tracker-recordtext.test.mjs` → FAIL.
- [ ] **Step 3: Implement `recordText.js`.** Record text layout (plain text, one field per line): title line `Defence Institution Tracker — record`, then `Institution:` (name, zh, acronyms), `Permanent ID:` slug, `Rating:` label + `(rule: <ruleText>)` or `Not yet rated`, `Override:` when overridden, a `Formal listings:` block with one line per `LISTS` entry (`Listed — <date>, <citation>, <url>` / `Not listed` / `Not checked yet`), the sanctions note when a sanctions list is `listed`, `Key evidence:` (verified only: signal label — summary [source titles + urls]), `Verified:`, `Dataset:`, `Rubric:`, `Retrieved:`, `Link:`, and the disclaimer `Institution-level information only. Affiliation with a listed institution is not evidence of wrongdoing by an individual. Not legal advice; the official lists prevail.` Sanctions note: `This institution appears on a sanctions list. Prohibitions are activity-specific and cover direct or indirect dealings; check the specific activity with Global Affairs Canada before engaging.` CSV uses `\r\n`.
- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `git commit -m "feat(tracker): record text, CSV and export formatting"`.

## Part B — Data and import scripts

### Task 5: Data folder, Node loader and integrity tests

**Files:**
- Create: `src/data/defenceTracker/README.md`, `LICENSE`, `meta.json`, `changelog.json`, `listings/us-csl.json`, `listings/ca-sanctions.json`, `listings/us-1286.json`, `listings/jp-meti-eul.json` (all four start `{ coverage: 'pending', checkedOn: null, entries: [] }`); `scripts/tracker/lib/loadData.mjs`, `scripts/tracker/lib/http.mjs`
- Modify: `eslint.config.js` (add `scripts/**/*.mjs` to the Node-globals block alongside `tests/**/*.mjs`), `package.json` (scripts below)
- Test: `tests/tracker-data.test.mjs`

**Interfaces:**
- Produces (loadData.mjs): `DATA_DIR` (absolute path of `src/data/defenceTracker/`); `readRawData() → { institutions, snapshots, meta, changelog }`; `loadDataset() → Dataset` (calls `buildDataset` with `src/data/nroData.js`); `writeInstitution(record)` (ordered keys, 2-space JSON, trailing newline, file `institutions/<id>.json`); `writeSnapshot(name, snapshot)` (entries sorted by `key`).
- Produces (http.mjs): `fetchText(url, { timeoutMs = 60000, retries = 2 }) → string`, `fetchJson(url, opts) → any` — sends `User-Agent: RSToolkit-tracker/1.0 (+https://github.com/seawaydigital/RSToolkit)`, throws `Error` with status on failure.
- `meta.json`: `{ "name": "Defence Institution Tracker", "version": "2026.10", "released": "2026-10-24", "rubricVersion": "1.0", "license": { "name": "CC BY 4.0", "url": "https://creativecommons.org/licenses/by/4.0/", "holder": "Andrew Austin", "year": 2026 }, "listsCheckedOn": { "ca-nro": "2026-09-24" }, "attributions": [...] }` — attributions: MISP galaxy seed (CC0 1.0; derived from ASPI's 2019 tracker), ROR (CC0), Wikidata (CC0), US Consolidated Screening List (public domain), Government of Canada NRO list, GAC Consolidated Canadian Autonomous Sanctions List, US DoD Section 1286 list, Japan METI End User List.
- `LICENSE`: short notice — dataset © 2026 Andrew Austin, licensed CC BY 4.0, legal code URL `https://creativecommons.org/licenses/by/4.0/legalcode`, scope (files in this folder; code elsewhere in the repo is MIT), suggested attribution line.
- npm scripts: `"tracker:import": "node scripts/tracker/import-misp.mjs"`, `"tracker:sync": "node scripts/tracker/sync-listings.mjs"`, `"tracker:check": "node scripts/tracker/watch.mjs"`, `"tracker:archive": "node scripts/tracker/archive-sources.mjs"`, `"tracker:next": "node scripts/tracker/next.mjs"`.

- [ ] **Step 1: Write the failing test** — `tests/tracker-data.test.mjs` (real data):

```js
const raw = await readRawData();
const ds = await loadDataset();

test('every institution file passes the schema and is named after its id', () => {
  for (const r of raw.institutions) assert.deepEqual(validateRecord(r), [], r.id);
});
test('ids are unique', () => { const ids = ds.records.map((r) => r.id); assert.equal(new Set(ids).size, ids.length); });
test('no two records claim the same email domain', () => { /* collect domains across records, assert no duplicates */ });
test('no full name is shared by two records', () => { /* normalizePhrase(name|aliases) and compactCjk(zh|zhAliases) across file records: no collisions */ });
test('every NRO organization has a tracker record', () => {
  for (const org of nroData.organizations) assert.ok(ds.records.some((r) => r.ids?.nro === org.id), org.id);
});
test('ids.nro values point at real NRO organizations', () => { /* every file record with ids.nro is in nroData */ });
test('every snapshot passes the schema and every entry maps to a record', () => { /* validateSnapshot + entry.institution in ds.byId */ });
test('no record carries an invalid rating override', () => { for (const r of ds.records) assert.equal(r.assessment.overrideError, null, r.id); });
test('meta names the licence holder and rubric version', () => {
  assert.equal(raw.meta.license.holder, 'Andrew Austin');
  assert.equal(raw.meta.license.name, 'CC BY 4.0');
  assert.equal(raw.meta.rubricVersion, RUBRIC_VERSION);
  assert.match(raw.meta.version, /^\d{4}\.\d{2}$/);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test tests/tracker-data.test.mjs` → FAIL (loader missing).
- [ ] **Step 3: Implement** the loader, http helper, data scaffold files, ESLint block and npm scripts.
- [ ] **Step 4: Run** — `node --test tests/tracker-data.test.mjs` → pass (no institution files yet; NRO orgs are covered by virtual records). `npm run lint` → no new errors.
- [ ] **Step 5: Commit** — `git commit -m "feat(tracker): data folder, licence and Node loader"`.

### Task 6: MISP and NRO seed import with ROR enrichment

**Files:**
- Create: `scripts/tracker/import-misp.mjs`, `scripts/tracker/lib/seed.mjs`
- Test: `tests/tracker-import.test.mjs`
- Generates: `src/data/defenceTracker/institutions/*.json` (MISP's 159 institutions plus every NRO organization not in MISP)

**Interfaces:**
- Consumes: `writeInstitution`, `readRawData` (Task 5); `slugify`, `validateRecord` (Task 3); `normalizePhrase`, `hasCjk` (Task 2); `fetchJson` (Task 5).
- Produces (seed.mjs):
  - `MISP_URL = 'https://raw.githubusercontent.com/MISP/misp-galaxy/4635146b00713d1a1ed42bb7bb85ec2ab274ece7/clusters/china-defence-universities.json'`
  - `mispValueToRecord(value, { nroMatch, today }) → record` — `name` = `value.value`; CJK aliases → `zh` (first) and `zhAliases`; Latin aliases matching `/^[A-Z][A-Z0-9-]{1,7}$/` → `acronyms`, other Latin aliases → `aliases`; `type` from `meta.categories` (`Military` → `military`, `Security` → `security`, `Defence industry conglomerate` → `defence-industry`, `Seven sons of national defence` → `university`, `Civilian` → `university` if the name contains university/college else `research-institute`); `location.lat/lng` from MISP; `ids.misp` = `value.uuid`; `ids.nro` and `id` from `nroMatch` (else `slugify(name)`); `status: 'seed'`; `seedNotes` = `{ source: 'MISP galaxy china-defence-universities (CC0)', categories, supervisingAgencies, majorDefenceLaboratories, subsidiaries, topics, address }` — **never `description`**; `history: [{ date: today, change: 'Seed record from the MISP galaxy list (structured fields only); not yet verified.' }]`.
  - `nroOrgToRecord(org, { today }) → record` — `status: 'listing-only'`, `id = org.id`, `ids.nro = org.id`, `country` mapped `China→CN, Russia→RU, Iran→IR`, location from nroData, `parent` = slug of `org.parentOrg` when present.
  - `rorToEnrichment(rorOrg) → { ror, zh, zhAliases, acronyms, aliases, domains, wikidata, website, city, province, lat, lng }` from a ROR v2 record.
  - `mergeEnrichment(record, enrichment) → record` — fills `ids.ror`, `ids.wikidata`, `domains`, `zh` (if empty), acronyms/aliases (deduped), `location.city/province` (keeps existing lat/lng; nroData coords win, then MISP, then ROR).
- Script behaviour: fetch MISP JSON at `MISP_URL`; map NRO matches by `normalizePhrase` equality of names/aliases; create MISP records then NRO-only records; enrich each from `https://api.ror.org/v2/organizations?affiliation=<name>` using only the item with `chosen: true` (100 ms between requests); validate every record; write files; print a report of records without a ROR match and any duplicate names.

- [ ] **Step 1: Write the failing test** — `tests/tracker-import.test.mjs`:

```js
const MISP_HIT = { value: 'Harbin Institute of Technology', uuid: '11111111-2222-3333-4444-555555555555', description: 'ASPI prose — must not be imported',
  meta: { aliases: ['哈尔滨工业大学', 'HIT'], categories: ['Seven sons of national defence'], 'supervising agencies': ['Ministry of Industry and Information Technology (MIIT)'],
    'major defence laboratories': ['Lab A (实验室)'], topics: ['Cyber'], lat: '45.74', long: '126.62', address: 'China, Heilongjiang, Harbin', refs: ['https://unitracker.aspi.org.au/universities/harbin-institute-of-technology/'] } };

test('a MISP value becomes a seed record with structured notes only', () => {
  const r = mispValueToRecord(MISP_HIT, { nroMatch: 'harbin-institute-of-technology', today: '2026-10-24' });
  assert.equal(r.id, 'harbin-institute-of-technology');
  assert.equal(r.zh, '哈尔滨工业大学');
  assert.deepEqual(r.acronyms, ['HIT']);
  assert.equal(r.type, 'university');
  assert.equal(r.status, 'seed');
  assert.deepEqual(r.evidence, []);
  assert.equal(r.ids.misp, MISP_HIT.uuid);
  assert.ok(!JSON.stringify(r).includes('ASPI prose'));
  assert.ok(!('description' in r) && !('description' in r.seedNotes));
  assert.deepEqual(validateRecord(r), []);
});

test('MISP categories map to institution types', () => {
  const t = (cat, value = 'X Academy') => mispValueToRecord({ ...MISP_HIT, value, meta: { ...MISP_HIT.meta, categories: [cat] } }, { nroMatch: null, today: '2026-10-24' }).type;
  assert.equal(t('Military'), 'military');
  assert.equal(t('Security'), 'security');
  assert.equal(t('Defence industry conglomerate'), 'defence-industry');
  assert.equal(t('Civilian', 'Some University'), 'university');
  assert.equal(t('Civilian', 'Some Research Institute'), 'research-institute');
});

test('ROR enrichment extracts Chinese name, acronym, domain and ids', () => {
  const e = rorToEnrichment({ id: 'https://ror.org/01yqg2h08', domains: ['hit.edu.cn'],
    names: [{ lang: null, types: ['acronym'], value: 'HIT' }, { lang: 'en', types: ['ror_display', 'label'], value: 'Harbin Institute of Technology' }, { lang: 'zh', types: ['label'], value: '哈尔滨工业大学' }],
    links: [{ type: 'website', value: 'https://www.hit.edu.cn' }],
    external_ids: [{ type: 'wikidata', all: ['Q632558'], preferred: null }],
    locations: [{ geonames_details: { name: 'Harbin', country_subdivision_name: 'Heilongjiang', lat: 45.75, lng: 126.65 } }] });
  assert.equal(e.ror, '01yqg2h08');
  assert.equal(e.zh, '哈尔滨工业大学');
  assert.deepEqual(e.acronyms, ['HIT']);
  assert.deepEqual(e.domains, ['hit.edu.cn']);
  assert.equal(e.wikidata, 'Q632558');
  assert.equal(e.city, 'Harbin');
});

test('an NRO organization becomes a listing-only record', () => {
  const r = nroOrgToRecord({ id: 'iitp-ras', name: 'A.A. Kharkevich Institute', aliases: ['IITP'], country: 'Russia', city: 'Moscow', lat: 55.77, lng: 37.61, parentOrg: null, notes: null }, { today: '2026-10-24' });
  assert.equal(r.status, 'listing-only');
  assert.equal(r.country, 'RU');
  assert.equal(r.ids.nro, 'iitp-ras');
  assert.deepEqual(validateRecord(r), []);
});
```

- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement** `seed.mjs` and `import-misp.mjs`.
- [ ] **Step 4: Run the unit test** → pass. **Run the import:** `npm run tracker:import` → prints counts (expect 159 MISP records + the NRO-only remainder) and the unmatched-ROR report.
- [ ] **Step 5: Run** `npm test` → all tracker tests pass (fix any duplicate-name or duplicate-domain collisions the integrity test reports by editing the offending seed record, then re-run).
- [ ] **Step 6: Commit** — `git add scripts/tracker src/data/defenceTracker/institutions tests/tracker-import.test.mjs && git commit -m "feat(tracker): seed records from MISP and the NRO list, enriched from ROR"`.

### Task 7: Official listing sync

**Files:**
- Create: `scripts/tracker/lib/listings.mjs`, `scripts/tracker/sync-listings.mjs`
- Test: `tests/tracker-listings.test.mjs`
- Generates: `src/data/defenceTracker/listings/us-csl.json`, `listings/ca-sanctions.json`; updates `meta.json` `listsCheckedOn['ca-nro']` when the NRO page matches

**Interfaces:**
- Consumes: `buildMatchIndex`, `matchLine`, `normalizePhrase` (Task 2); `validateSnapshot`, `slugify` (Task 3); `readRawData`, `writeSnapshot`, `loadDataset` (Task 5); `fetchJson`, `fetchText` (Task 5).
- Produces (listings.mjs):
  - `CSL_URL = 'https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.json'`, `CA_SANCTIONS_URL = 'https://www.international.gc.ca/world-monde/assets/office_docs/international_relations-relations_internationales/sanctions/sema-lmes.xml'`
  - `isResearchBody(name) → boolean` — true for names containing university, institute, academy, college, laboratory, research, polytechnic, scientific, "school of" or "science and technology"; false when the name only reads as a trading company (`co., ltd`, `company`, `limited`, `llc`, `trading`, `import`, `export`) **unless** it also contains university, "research institute", "academy of" or "institute of".
  - `cslToEntries(results) → entry[]` — keeps sources `Entity List (EL) - Bureau of Industry and Security` → `us-entity-list`, `Military End User (MEU) List - Bureau of Industry and Security` → `us-meu`, `Specially Designated Nationals (SDN) - Treasury Department` → `us-sdn`; any address country in `CN, RU, IR`; `isResearchBody(name)` or any alt name; entry `{ key: 'csl:' + id, list, name, altNames, country, date: start_date || null, citation: federal_register_notice || (programs||[]).join('; ') || null, url: source_information_url || source_list_url, institution: null }`
  - `parseCaSanctionsXml(xml) → { country, entity, aliases, schedule, item, date }[]` — reads `<record>` elements: `Country-Pays`, `EntityOrShip-EntiteOuNavire`, `Aliases-Alias`, `Schedule-Annexe`, `Item-NumeroDarticle`, `DateOfListing-DateDinscription`; decodes XML entities.
  - `caToEntries(rows) → entry[]` — entities only, country starting `China`, `Russia` or `Iran`, `isResearchBody`; bilingual names split on the first `/` (English → `name`, French → `altNames`); `key: 'ca:' + country + ':' + schedule + ':' + item`; `list: 'ca-sanctions'`; `citation: 'Schedule ' + schedule + ', item ' + item`.
  - `assignInstitutions(entries, { previous, index, takenIds }) → { entries, created: string[] }` — keep `institution` from a previous entry with the same key, else from a previous entry with the same `normalizePhrase(name)`, else the first **confirmed** `matchLine` hit on name/alt names, else a new slug (`slugify(name)`, suffixed `-2`, `-3`… if taken or reserved).
  - `diffEntries(before, after) → { added, removed, changed }` by key (changed = name, list, date or citation differs).
  - `renderSyncReport(sections) → string` (markdown; names inside code spans).
- Script: `sync-listings.mjs [--check]` — fetch CSL and GAC XML, build entries, assign institutions against the current dataset, diff against the stored snapshots, also map unmapped entries in the hand-maintained `us-1286.json` / `jp-meti-eul.json`, check the live NRO page names against `nroData` (report only), print the report; without `--check` write snapshots with `coverage: 'complete'` and `checkedOn: today`. Any fetch failure becomes a "Couldn't check" line and leaves that snapshot untouched.

- [ ] **Step 1: Write the failing test** — `tests/tracker-listings.test.mjs`:

```js
test('research bodies are kept and trading companies dropped', () => {
  assert.equal(isResearchBody('Harbin Institute of Technology'), true);
  assert.equal(isResearchBody('Pasteur Institute of Iran'), true);
  assert.equal(isResearchBody('China Nuclear Power Technology Research Institute Co. Ltd.'), true);
  assert.equal(isResearchBody('Shenzhen Example Trading Co., Ltd.'), false);
});

test('CSL results become entries for the three US lists only', () => {
  const entries = cslToEntries([
    { id: 'a1', source: 'Entity List (EL) - Bureau of Industry and Security', name: 'Harbin Institute of Technology', alt_names: [], addresses: [{ country: 'CN' }], start_date: '2020-06-05', federal_register_notice: '85 FR 34497', source_information_url: 'https://www.bis.gov/entity-list' },
    { id: 'a2', source: 'Specially Designated Nationals (SDN) - Treasury Department', name: 'MALEK ASHTAR UNIVERSITY OF TECHNOLOGY', alt_names: [], addresses: [{ country: 'IR' }], programs: ['IRAN'], source_list_url: 'https://sanctionssearch.ofac.treas.gov/' },
    { id: 'a3', source: 'Nonproliferation Sanctions (ISN) - State Department', name: 'Example University', addresses: [{ country: 'CN' }] },
    { id: 'a4', source: 'Entity List (EL) - Bureau of Industry and Security', name: 'Example University', addresses: [{ country: 'DE' }] },
  ]);
  assert.deepEqual(entries.map((e) => [e.key, e.list]), [['csl:a1', 'us-entity-list'], ['csl:a2', 'us-sdn']]);
  assert.equal(entries[0].citation, '85 FR 34497');
  assert.equal(entries[1].citation, 'IRAN');
});

test('the GAC sanctions XML parses into entity entries', () => {
  const xml = `<data-set><record><Country-Pays>Iran</Country-Pays><EntityOrShip-EntiteOuNavire>Pasteur Institute of Iran/Institut Pasteur d&apos;Iran</EntityOrShip-EntiteOuNavire><Schedule-Annexe>1, Part 1</Schedule-Annexe><Item-NumeroDarticle>65</Item-NumeroDarticle><DateOfListing-DateDinscription>2016-02-05</DateOfListing-DateDinscription></record><record><Country-Pays>Russia / Russie</Country-Pays><LastName-NomDeFamille>Person</LastName-NomDeFamille><Schedule-Annexe>1, Part 1</Schedule-Annexe><Item-NumeroDarticle>9</Item-NumeroDarticle><DateOfListing-DateDinscription>2022-02-24</DateOfListing-DateDinscription></record></data-set>`;
  const entries = caToEntries(parseCaSanctionsXml(xml));
  assert.equal(entries.length, 1);
  assert.equal(entries[0].name, 'Pasteur Institute of Iran');
  assert.deepEqual(entries[0].altNames, ["Institut Pasteur d'Iran"]);
  assert.equal(entries[0].key, 'ca:Iran:1, Part 1:65');
  assert.equal(entries[0].date, '2016-02-05');
});

test('institution assignment keeps previous mappings, matches names, and creates stable slugs', () => {
  const index = buildMatchIndex([{ id: 'harbin-institute-of-technology', name: 'Harbin Institute of Technology', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }]);
  const { entries, created } = assignInstitutions(
    [{ key: 'csl:a1', name: 'Harbin Institute of Technology' }, { key: 'csl:a2', name: 'Malek Ashtar University of Technology' }, { key: 'csl:a9', name: 'Renamed Entry' }],
    { previous: [{ key: 'csl:a9', name: 'Old Name', institution: 'kept-slug' }], index, takenIds: new Set(['harbin-institute-of-technology', 'kept-slug']) },
  );
  assert.deepEqual(entries.map((e) => e.institution), ['harbin-institute-of-technology', 'malek-ashtar-university-of-technology', 'kept-slug']);
  assert.deepEqual(created, ['malek-ashtar-university-of-technology']);
});

test('diffs report added, removed and changed entries', () => {
  const d = diffEntries([{ key: 'a', name: 'A', list: 'us-sdn' }, { key: 'b', name: 'B', list: 'us-sdn' }], [{ key: 'a', name: 'A2', list: 'us-sdn' }, { key: 'c', name: 'C', list: 'us-sdn' }]);
  assert.deepEqual(d.added.map((e) => e.key), ['c']);
  assert.deepEqual(d.removed.map((e) => e.key), ['b']);
  assert.deepEqual(d.changed.map((e) => e.key), ['a']);
});
```

- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement** `listings.mjs` and `sync-listings.mjs`.
- [ ] **Step 4: Run** — unit tests pass; `npm run tracker:sync -- --check` prints a report without writing; `npm run tracker:sync` writes both snapshots; `npm test` → data integrity passes (every entry maps to a record).
- [ ] **Step 5: Try to populate the hand-maintained lists.** Open the FY25 1286 PDF in the built-in browser (`get_page_text`; never download) and, if readable, transcribe its China/Russia/Iran institutions into `listings/us-1286.json` (`fiscalYear: 'FY25'`, `published: '2026-07-23'`, `sourceUrl` = the PDF URL), run `npm run tracker:sync` to map them, and set `coverage: 'complete'`. Leave `jp-meti-eul.json` pending unless METI's current list is reachable the same way. If not readable, leave both pending — the UI says "Not checked yet".
- [ ] **Step 6: Commit** — `git commit -m "feat(tracker): sync official listings (US screening list, Canadian sanctions)"`.

## Part C — Views and integration

### Task 8: Routing and launch flag

**Files:**
- Create: `src/routing.js`, `src/data/defenceTracker/enabled.js`, `src/tools/compliance/defence-tracker/lib/views.js`
- Modify: `src/siteConfig.js` (append `ENABLE_DEFENCE_TRACKER`), `src/App.jsx:32-35,71-178`
- Test: `tests/tracker-routing.test.mjs`

**Interfaces:**
- Produces: `parseHashRoute(hash) → { route: string|null, subRoute: string|null }` (`subRoute` is `null` when percent-decoding fails, `''` when absent); `resolveTrackerView(subRoute, hasRecord: (id) => boolean) → { view: 'search'|'batch'|'methodology'|'profile'|'not-found', id?: string }`; `TRACKER_ENABLED` (from `enabled.js`) = `ENABLE_DEFENCE_TRACKER || import.meta.env?.VITE_ENABLE_DEFENCE_TRACKER === 'true'`.
- App passes every tool `subRoute` and `onPageTitle(title|null)`; title = `[pageTitle, tool.name, 'Research Security Toolkit']` joined by ` — `; focus/scroll effect runs on `route` or `subRoute` change (first render skipped); ErrorBoundary stays keyed on `route` so the tracker keeps its in-memory batch/search state across its own sub-routes (the tracker adds an inner boundary keyed on `subRoute`).

- [ ] **Step 1: Write the failing test** — `tests/tracker-routing.test.mjs`:

```js
const cases = [
  ['', { route: null, subRoute: '' }], ['#', { route: null, subRoute: '' }], ['#/', { route: null, subRoute: '' }],
  ['#nro-lookup', { route: 'nro-lookup', subRoute: '' }], ['#/nro-lookup', { route: 'nro-lookup', subRoute: '' }],
  ['#defence-tracker/harbin-institute-of-technology', { route: 'defence-tracker', subRoute: 'harbin-institute-of-technology' }],
  ['#defence-tracker/batch', { route: 'defence-tracker', subRoute: 'batch' }],
  ['#defence-tracker/', { route: 'defence-tracker', subRoute: '' }],
  ['#defence-tracker/a%20b', { route: 'defence-tracker', subRoute: 'a b' }],
  ['#defence-tracker/%E0%A4%A', { route: 'defence-tracker', subRoute: null }],
];
for (const [hash, expected] of cases) test(`parseHashRoute(${JSON.stringify(hash)})`, () => assert.deepEqual(parseHashRoute(hash), expected));

test('resolveTrackerView maps sub-routes to views', () => {
  const has = (id) => id === 'harbin-institute-of-technology';
  assert.deepEqual(resolveTrackerView('', has), { view: 'search' });
  assert.deepEqual(resolveTrackerView('batch', has), { view: 'batch' });
  assert.deepEqual(resolveTrackerView('methodology', has), { view: 'methodology' });
  assert.deepEqual(resolveTrackerView('harbin-institute-of-technology', has), { view: 'profile', id: 'harbin-institute-of-technology' });
  assert.deepEqual(resolveTrackerView('nope', has), { view: 'not-found' });
  assert.deepEqual(resolveTrackerView(null, has), { view: 'not-found' });
});
```

- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement** the three modules, the `siteConfig.js` constant (doc comment in the file's existing style: what it does, false until launch, the preview env var) and the App changes. App imports `TRACKER_ENABLED` and only registers `'defence-tracker'` in `TOOL_COMPONENTS` when it is true.
- [ ] **Step 4: Run** — `npm test` passes; `npm run lint` clean; `npm run build` succeeds; existing tools still route (preview: `#nro-lookup`, `#/nro-lookup`, home).
- [ ] **Step 5: Commit** — `git commit -m "feat: hash sub-routes and the tracker launch flag"` (update CLAUDE.md Routing section: sub-routes exist; only the tracker uses them).

### Task 9: Tracker shell, data loader and search view

**Files:**
- Create: `src/data/defenceTracker/index.js`, `src/tools/compliance/defence-tracker/DefenceTracker.jsx`, `TrackerSearch.jsx`, `RatingBadge.jsx`
- Modify: `src/App.jsx` (lazy import), `src/data/toolRegistry.js` (entry under `compliance-tools`, only when `TRACKER_ENABLED`), `src/styles/global.css` (`dit-` block)

**Interfaces:**
- Produces: `getTrackerData() → { dataset, index }` in `index.js` (built once with `import.meta.glob('./institutions/*.json', { eager: true, import: 'default' })` and `'./listings/*.json'`, `buildDataset`, `buildMatchIndex`; cached at module level).
- `DefenceTracker({ onNavigate, subRoute, onPageTitle })` resolves the view with `resolveTrackerView`, owns the in-memory `searchState` (`query`, `filters`) and `batchState` (`text`, `results`) so they survive moving between tracker views, and wraps the view in an inner error boundary keyed on `subRoute`. Never writes to storage.
- `RatingBadge({ assessment })` → `<span className="dit-badge dit-badge--{rating|unrated}">{label}</span>`.
- Registry entry: `{ id: 'defence-tracker', name: 'Defence Institution Tracker', slug: 'defence-tracker', description: 'Look up Chinese, Russian and Iranian research institutions with military or security ties — sourced ratings, official listings, and a batch check for partner and co-author lists', tags: ['defence', 'defense', 'military', 'universities', 'institutions', 'aspi', 'tracker', 'background check', 'due diligence', 'entity list', 'sanctions', 'nro', 'partners', 'co-authors', 'china'], related: ['nro-lookup', 'stra-lookup', 'dual-use'] }`.

- [ ] **Step 1: Implement** the loader, shell and search view: header per the Tool Page Layout pattern (h1, one-line description, meta line with dataset version, "Methodology" link), intro disclaimer (institution-level; not legal advice), search input (label "Search by name, Chinese name, acronym or email domain"), filters (rating incl. "Not yet rated", type, list, province) as `<select>`s with labels, a results list (`<ul>`; each row a `<button>` → `onNavigate('defence-tracker/' + id)`) showing name, zh, type, city and a listing summary ("NRO · US Entity List") plus `RatingBadge`, the result count in an `aria-live="polite"` region, header buttons Batch check / Methodology / Data, and the fixed footer copy. Empty query shows all records sorted: rated first (very-high→low), then unrated, then name.
- [ ] **Step 2: Contrast check.** Badge colours: Very high `--red` on `--red-subtle`; High `--amber` on a tint built from `--amber`; Medium `--purple` on `--purple-subtle`; Low `--text-secondary` on `--bg-tertiary`; Not yet rated `--text-muted` with a dashed `--border`. Compute each foreground/background ratio (WCAG relative luminance) and adjust the tint until every pair is ≥4.5:1; record the ratios in a comment above the `dit-badge` rules.
- [ ] **Step 3: Verify** — `npm run lint` and `npm run build` clean; preview with `VITE_ENABLE_DEFENCE_TRACKER=true`: `#defence-tracker` lists records; searching `哈尔滨工业大学`, `nwpu.edu.cn`, `harbin` behaves as in Task 2; filters narrow the list; with the flag off, `#defence-tracker` shows Home and the sidebar has no entry.
- [ ] **Step 4: Commit** — `git commit -m "feat(tracker): tracker shell and search view"`.

### Task 10: Institution page

**Files:**
- Create: `src/tools/compliance/defence-tracker/InstitutionProfile.jsx`
- Modify: `src/styles/global.css` (profile + print rules)

**Interfaces:**
- Consumes: `getTrackerData`, `formatRecordForFile` (Task 4), `RatingBadge`, `ANNEX_B`, `SIGNALS`, `LISTS`, `INSTITUTION_RS_CONTACT` (siteConfig), `SITE_URL` (siteConfig) for the permalink.
- `InstitutionProfile({ record, dataset, onNavigate, onPageTitle })` calls `onPageTitle(record.name)` on mount and `onPageTitle(null)` on unmount.

- [ ] **Step 1: Implement** per the approved mockup: breadcrumb back to search; header (name, zh · acronyms · domains · city/province; type and supervisors for verified records; `RatingBadge` with "Verified <date> · dataset <version>"); buttons **Copy record for file** (`navigator.clipboard.writeText(formatRecordForFile(...))`, status message in an `aria-live` region; on failure show the text in a read-only `<textarea>` to copy manually), **Print** (`window.print()`), **Report an error** (`mailto:` `INSTITUTION_RS_CONTACT.email`, subject `Tracker correction: <name> (<id>)`) and a GitHub link (`https://github.com/seawaydigital/RSToolkit/issues/new?template=tracker-correction.yml&title=<encoded subject>`); **Formal listings** table (`<th scope="col">` List / Status / Details; rows for every `LISTS` entry; NRO row adds the STRAC note "A current affiliation makes a STRAC-covered grant application ineligible."; sanctions rows add the sanctions note); unverified records show the "Profile under review" banner (`role="note"`) and stop after listings; verified records continue with **Why this rating** (rule text + reasons, override reason when overridden), **Evidence for your NSGRP form (Annex B)** — one accordion per `ANNEX_B` key listing evidence tagged with it (`aria-expanded`; `aria-controls` only while open), then accordions for defence labs, research areas (topic ids → STRA names, button to `stra-lookup`), campuses and subsidiaries, **Sources** (numbered; title, publisher, accessed date, link, "Archived copy" link or "No archived copy: <reason>"), and **Change history**. Unknown slug is handled in `DefenceTracker` (not-found view with a link back to search).
- [ ] **Step 2: Print rules** — hide `.dit-no-print` (buttons, filters), force accordion bodies open in print (`.dit-accordion-body { display: block !important }`), show the permalink text.
- [ ] **Step 3: Verify** — preview: open `#defence-tracker/harbin-institute-of-technology` directly → title `Harbin Institute of Technology — Defence Institution Tracker — Research Security Toolkit`, focus lands on main, Back returns to search with the previous query intact; copy produces the expected text; print preview shows listings and hides buttons; `#defence-tracker/does-not-exist` shows the not-found view; keyboard-only pass over buttons and accordions.
- [ ] **Step 4: Commit** — `git commit -m "feat(tracker): institution page"`.

### Task 11: Batch check

**Files:**
- Create: `src/tools/compliance/defence-tracker/BatchCheck.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `matchLines` (Task 2), `searchLogLine`, `batchResultsToCsv`, `batchResultsToText`, `BATCH_COLUMNS` (Task 4), `RatingBadge`.
- `BatchCheck({ dataset, index, state, setState, onNavigate })` — `state = { text, results }` lives in `DefenceTracker`.

- [ ] **Step 1: Implement** per the mockup: labelled `<textarea>` ("Paste affiliations, email addresses or a co-author list, one per line. Nothing leaves your browser."), **Check affiliations** button, truncation notice when `truncated` ("Only the first 2,000 lines were checked."), summary counts in `aria-live="polite"`, results `<table>` with `BATCH_COLUMNS` minus Profile (match names are buttons to the profile), one row per match (extra matches on the same line get their own row with the input cell repeated), "check" rows styled `dit-row--check` with text "Check: <name>" for acronym/similar-name, no-match rows with the fixed copy, the dated search line (`searchLogLine` with today's local date) in a `<pre>`-like block, buttons **Copy table for report** (`batchResultsToText`), **Download CSV** (Blob + temporary `<a download="defence-tracker-batch-<date>.csv">`, object URL revoked after click) and **Print**.
- [ ] **Step 2: Verify** — preview: paste the 29 fixture inputs from Task 2 (against the real data the expectations differ only where an institution is absent); counts add up; CSV opens with the fixed header and a `'=` prefix on a pasted `=SUM(1)` line; a 2,500-line paste shows the truncation notice and stays responsive; console shows no CSP violation for the download; navigating to a profile and back keeps the pasted text and results.
- [ ] **Step 3: Commit** — `git commit -m "feat(tracker): batch affiliation check"`.

### Task 12: Methodology page and downloads

**Files:**
- Create: `src/tools/compliance/defence-tracker/TrackerMethodology.jsx`
- Modify: `vite.config.js` (`trackerDataPlugin`), `src/styles/global.css`

**Interfaces:**
- Consumes: `RUBRIC_RULES`, `RUBRIC_VERSION`, `SIGNALS`, `RATING_LABELS` (Task 1), `datasetToExport`, `datasetToCsv` (Task 4), `meta`/`lists`/changelog from the dataset.
- `trackerDataPlugin()` — `apply: 'build'`, in `generateBundle` returns early unless `ENABLE_DEFENCE_TRACKER || process.env.VITE_ENABLE_DEFENCE_TRACKER === 'true'`; otherwise dynamically imports `scripts/tracker/lib/loadData.mjs` and the record-text module and emits `data/defence-tracker.json` and `data/defence-tracker.csv`.

- [ ] **Step 1: Implement the page** with sections: What this is (and isn't); How ratings work (render `RUBRIC_RULES` as a table — Rating / Rule — and the signal definitions from `SIGNALS`, plus the override rule; label "Rubric version 1.0" from the constant); Sources and when each list was last checked (from `dataset.lists`: label, jurisdiction, "Checked <date>" or "Not checked yet", source link); Verification and archiving; Ethics ("This tracker describes institutions, never individuals. Affiliation with a listed institution says nothing about a person's intentions, and Canadian research security guidance warns against profiling people by nationality."); Not legal advice; Licence ("Dataset © 2026 Andrew Austin, licensed under CC BY 4.0" with link; code MIT); How to cite (`Defence Institution Tracker, dataset <version>, <SITE_URL>/#defence-tracker, accessed <date>. CC BY 4.0.`); Downloads — buttons that build JSON/CSV in the browser (Blob) plus the stable build URLs `<base>data/defence-tracker.json|csv` for scripts; Attributions (from `meta.attributions`); Changelog; How to report a correction.
- [ ] **Step 2: Implement the plugin**; run `VITE_ENABLE_DEFENCE_TRACKER=true npm run build` → `dist/data/defence-tracker.json` and `.csv` exist; `npm run build` (flag off) → neither exists.
- [ ] **Step 3: Verify** — preview `#defence-tracker/methodology`: the rules table matches `RUBRIC_RULES`; list check dates show; both download buttons produce files.
- [ ] **Step 4: Commit** — `git commit -m "feat(tracker): methodology page and open-data downloads"`.

### Task 13: Toolkit cross-links

**Files:**
- Modify: `src/tools/compliance/NroLookup.jsx:716-760`, `src/components/home/Home.jsx:3-10`, `src/data/faqData.js:195-235`, `src/data/howItWorksData.js:89-91`

**Interfaces:**
- Consumes: `TRACKER_ENABLED` (Task 8). Every NRO organization has a tracker record with the same id (Task 5 test), so NRO rows can link without loading tracker data.

- [ ] **Step 1: Implement** (all gated on `TRACKER_ENABLED`): NRO table gains a fifth column "Profile" with a `<button>` "Tracker profile" (`onNavigate('defence-tracker/' + org.id)`; `stopPropagation` so the row's map fly-to still works); `NroLookup` starts accepting `{ onNavigate }`; Home's `new-partner` scenario becomes "Checking a new research partner or co-author?" with tools `['nro-lookup', 'defence-tracker', 'strac-flowchart', 'risk-mitigation']`; FAQ `getting-help` gains `{ id: 'help-tracker', question: "Is there a free alternative to ASPI's China Defence Universities Tracker?", answer: <who it covers, what a rating means, the listings it checks, that searches stay in the browser, not legal advice>, tags: ['aspi', 'tracker', 'due diligence', 'partners'], relatedTool: 'defence-tracker' }`; How It Works `dataFlows.outro` adds "the Defence Institution Tracker's search or batch check" to the list of inputs never transmitted.
- [ ] **Step 2: Verify** — with the flag on, each link navigates correctly and the NRO row click still flies the map; with the flag off, none of the four changes render; `npm run lint` clean.
- [ ] **Step 3: Commit** — `git commit -m "feat(tracker): cross-links from NRO Lookup, Home, FAQ and How This Site Works"` (CLAUDE.md: FAQ count "25 (26 with the tracker enabled)").

### Task 14: Map view (phase 2b)

**Files:**
- Create: `src/components/ui/map/MarkerCluster.jsx`, `src/components/ui/map/FlyToHandler.jsx`, `src/components/ui/map/escapeHtml.js`, `src/tools/compliance/defence-tracker/TrackerMap.jsx`
- Modify: `src/tools/compliance/NroLookup.jsx` (import the extracted pieces; behaviour unchanged), `TrackerSearch.jsx` (List · Map switch)

**Interfaces:**
- Produces: `MarkerCluster({ markers, onMarkerClick, colorFor })` where `markers` are `{ id, lat, lng, fillColor, popupHtml }` and `colorFor(childMarkers) → string` picks the cluster colour (NRO passes the existing dominant-country logic; the tracker passes dominant-rating logic); `FlyToHandler({ target })` unchanged; `escapeHtml(s)`.
- Rating marker colours (data identity, not palette): very-high `#ef4444`, high `#f97316`, medium `#a78bfa`, low `#94a3b8`, not rated `#64748b`; cluster count text `#061727`.

- [ ] **Step 1: Extract** the three pieces from `NroLookup.jsx` without changing its output (same `iconCreateFunction` result for the same markers).
- [ ] **Step 2: Implement `TrackerMap`** (records with `location.lat/lng`; popup = name, zh, rating, link text "Open profile" handled via `onMarkerClick` → navigate) and the switch in `TrackerSearch` (the map shows the currently filtered records; the list stays the accessible alternative and the default).
- [ ] **Step 3: Verify** — preview: NRO Lookup map looks and clusters exactly as before; tracker map clusters by dominant rating; no CSP violations (same tile hosts).
- [ ] **Step 4: Commit** — `git commit -m "feat(tracker): map view; share cluster map pieces with NRO Lookup"`.

## Part D — Upkeep

### Task 15: Source checks and archiving

**Files:**
- Create: `scripts/tracker/lib/sources.mjs`, `scripts/tracker/check-sources.mjs`, `scripts/tracker/archive-sources.mjs`
- Test: `tests/tracker-sources.test.mjs`

**Interfaces:**
- Produces: `collectSources(records) → { recordId, source }[]` (verified records only); `looksLikeBlockedCapture({ status, body }) → boolean` (status ≥ 400, body under 2,000 bytes, or body containing any of `captcha`, `access denied`, `verify you are human`, `安全验证`, `访问验证`, `请输入验证码`); `checkSources(entries, { fetchImpl, concurrency = 4 }) → { dead: [], missingArchive: [] }`.
- `archive-sources.mjs` (local only): for each source without `archive`, request `https://web.archive.org/save/<url>`, take the snapshot URL from the final response URL or `Content-Location`, fetch it and run `looksLikeBlockedCapture`; good captures write `archive: { url }` via `writeInstitution`; suspect ones are listed for a manual archive.today attempt or an `archive.unavailable` reason. 5 s between saves. Optional `ARCHIVE_ORG_ACCESS_KEY` / `ARCHIVE_ORG_SECRET` env vars add an `Authorization: LOW <key>:<secret>` header.

- [ ] **Step 1: Write the failing test:**

```js
test('blocked or empty captures are flagged', () => {
  assert.equal(looksLikeBlockedCapture({ status: 200, body: 'x'.repeat(5000) }), false);
  assert.equal(looksLikeBlockedCapture({ status: 403, body: 'x'.repeat(5000) }), true);
  assert.equal(looksLikeBlockedCapture({ status: 200, body: 'tiny' }), true);
  assert.equal(looksLikeBlockedCapture({ status: 200, body: 'x'.repeat(5000) + '请输入验证码' }), true);
});
test('only sources on verified records are collected', () => { /* one verified + one seed record → only the verified record's sources */ });
test('checkSources reports dead links and missing archives', async () => {
  const fetchImpl = async (url) => ({ ok: !url.includes('dead'), status: url.includes('dead') ? 404 : 200 });
  const r = await checkSources([{ recordId: 'a', source: { id: 's1', url: 'https://x/dead', archive: { url: 'https://web.archive.org/x' } } }, { recordId: 'a', source: { id: 's2', url: 'https://x/ok' } }], { fetchImpl });
  assert.deepEqual(r.dead.map((d) => d.source.id), ['s1']);
  assert.deepEqual(r.missingArchive.map((d) => d.source.id), ['s2']);
});
```

- [ ] **Step 2: Run to verify it fails. Step 3: Implement. Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `git commit -m "feat(tracker): source link checks and Wayback archiving"`.

### Task 16: Monthly watch report, workflow and correction form

**Files:**
- Create: `scripts/tracker/lib/watchReport.mjs`, `scripts/tracker/watch.mjs`, `.github/workflows/tracker-watch.yml`, `.github/ISSUE_TEMPLATE/tracker-correction.yml`
- Test: `tests/tracker-watch.test.mjs`

**Interfaces:**
- Produces: `sanitizeForIssue(text) → string` (wraps in a code span, replaces backticks with `'`, strips `@`); `renderWatchReport({ month, sync, sources }) → { title: 'Tracker watch — <YYYY-MM>', body, hasFindings }`.
- `watch.mjs` runs the sync in `--check` mode and `checkSources`, writes `watch-report.md` (git-ignored) and prints `has_findings=true|false`.
- Workflow: `on: schedule: - cron: '0 13 1 * *'` + `workflow_dispatch`; `permissions: contents: read, issues: write`; job `watch` on `ubuntu-latest`: checkout (SHA from deploy.yml, `persist-credentials: false`), setup-node (SHA from deploy.yml, `node-version: 22`, `cache: npm`), `npm ci`, `node scripts/tracker/watch.mjs`, then a `gh` step (env `GH_TOKEN: ${{ github.token }}`) that finds an open issue titled the report title (`gh issue list --state open --search "<title> in:title" --json number`) and edits its body, or creates it; skipped when `has_findings=false`.
- Issue form fields: institution name or permalink (required), what is wrong (required), source for the correction (required), contact (optional).

- [ ] **Step 1: Write the failing test:**

```js
test('external names are neutralised for issues', () => {
  assert.equal(sanitizeForIssue('Evil `code` @someone'), "`Evil 'code' someone`");
});
test('a report with no changes has no findings', () => {
  assert.equal(renderWatchReport({ month: '2026-11', sync: { sections: [], failures: [] }, sources: { dead: [], missingArchive: [] } }).hasFindings, false);
});
test('a report with changes or failures has findings and the month title', () => {
  const r = renderWatchReport({ month: '2026-11', sync: { sections: [{ list: 'us-entity-list', added: [{ name: 'New Univ' }], removed: [], changed: [] }], failures: ['GAC sanctions XML: timeout'] }, sources: { dead: [], missingArchive: [] } });
  assert.equal(r.title, 'Tracker watch — 2026-11');
  assert.equal(r.hasFindings, true);
  assert.ok(r.body.includes('`New Univ`') && r.body.includes("Couldn't check"));
});
```

- [ ] **Step 2: Run to verify it fails. Step 3: Implement** (add `watch-report.md` to `.gitignore`). **Step 4: Run to verify it passes**; run `node scripts/tracker/watch.mjs` locally and read the report.
- [ ] **Step 5: Commit** — `git commit -m "feat(tracker): monthly watch workflow and correction issue form"`.

### Task 17: Research skill, playbook and priority queue

**Files:**
- Create: `scripts/tracker/lib/priority.mjs`, `scripts/tracker/next.mjs`, `.claude/skills/tracker-research/SKILL.md`, `docs/tracker/research-playbook.md`
- Test: `tests/tracker-priority.test.mjs`

**Interfaces:**
- Produces: `priorityGroup(record) → 1..6` — 1: country CN and NRO-listed; 2: CN and listed on a US list (`us-entity-list`, `us-meu`, `us-sdn`, `us-1286`) with type university; 3: CN and type military, security, defence-industry or nuclear, or `seedNotes.categories` includes "Seven sons of national defence"; 4: other CN records with `seedNotes`; 5: other CN records; 6: RU/IR. `priorityQueue(records) → { id, name, group, status }[]` — unverified records first by group then name, then verified records oldest `verifiedOn` first (re-verification).
- `next.mjs [n=20]` prints the queue head.
- SKILL.md (frontmatter `name: tracker-research`, `description:` when to use) — inputs (slug, name, or "next N"), the source order, the evidence rules (own words, ≥1 source + archive entry, no ASPI text, no individuals, "reported by…"), signal definitions (link to constants), how to finish a profile (signals → `npm test` → status/verifiedOn/history → `npm run tracker:archive` → review note format), and the branch rule (rated profiles go on the content branch until the Lakehead review).
- research-playbook.md — the human version of the same, plus the monthly routine (watch issue → `npm run tracker:sync` → verify 15–25 profiles → publish: automatic on Pages; release bundle if the site has moved).

- [ ] **Step 1: Write the failing test** — synthetic records, one per group plus a verified record with an old `verifiedOn`; assert `priorityQueue` order is groups 1→6 then the verified record, and `priorityGroup` returns the expected number for each.
- [ ] **Step 2: Run to verify it fails. Step 3: Implement** module, script, skill and playbook. **Step 4: Run to verify it passes**; `npm run tracker:next` prints 20 rows.
- [ ] **Step 5: Commit** — `git commit -m "docs(tracker): research skill, playbook and priority queue"`.

## Part E — Docs and verification

### Task 18: Project docs and full verification

**Files:**
- Modify: `CLAUDE.md` (Directory Structure, Tools Inventory row under Compliance Tools, Key Decisions entry "Defence Institution Tracker" covering flag, data layout, listing-only synthesis, rubric/version, licence + the §3d exception, ethics/copy rules, branching before launch, matcher rules; Routing; Deployment gains the watch workflow and its permissions; FAQ count), `SECURITY.md` (new scheduled workflow, permissions, CI-never-writes rule, outbound fetches it makes), `HANDOFF.md` (maintainer duties + monthly routine + the `#…`-preserving redirect requirement for any domain move), `README.md` (tool list)

- [ ] **Step 1: Update the docs.**
- [ ] **Step 2: Run the gates** — `npm test` (all pass), `npm run lint` (no new errors), `npm run build` (flag off: no `dist/data/defence-tracker.*`), `VITE_ENABLE_DEFENCE_TRACKER=true npm run build` (downloads present), `npm audit --audit-level=high` (0 high).
- [ ] **Step 3: Preview checklist** (dev server via `.claude/launch.json` `rs-toolkit-dev`, flag on through the env var): searches for `哈尔滨工业大学`, `nwpu.edu.cn`, `HIT`; deep link + title + focus + Back; batch with the fixture list, CSV, copy, truncation; print previews; console has zero CSP violations and the network panel shows zero external requests from tracker pages (tiles only on the map view); keyboard-only pass; 375px layout; methodology renders the rubric; flag off → tool, links and downloads unreachable.
- [ ] **Step 4: Commit** — `git commit -m "docs: Defence Institution Tracker in CLAUDE.md, SECURITY.md, HANDOFF.md and README"`.
