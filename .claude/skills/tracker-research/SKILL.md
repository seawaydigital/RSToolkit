---
name: tracker-research
description: Research, verify and rate Defence Institution Tracker profiles in this repo (src/data/defenceTracker/institutions/*.json). Use when asked to research, verify, re-verify or rate a tracker institution, to work through the tracker's priority queue ("next 5"), or to fix a reported error in a profile.
---

# Tracker research

You turn a `seed` or `listing-only` record into a `verified` profile: sourced evidence in your own words, archived sources, and a rating the rubric computes. The human version of this process, including the monthly routine, is `docs/tracker/research-playbook.md`. The schema rules are in `src/data/defenceTracker/README.md` and are enforced by `npm test`.

## Rules that are never bent

- **Institutions, never individuals.** Do not name, describe or link to any person: staff, students, alumni, leaders or people in court cases. Write "researchers at the university", not a name.
- **Your own words.** Never copy text from any source. Never open or use ASPI's subscription tracker, and never reuse ASPI ratings. ASPI's free public reports may be cited like any research, never copied.
- **Every claim has a source,** and every source has an archived copy or a written reason it can't have one.
- **Neutral wording.** Allegations are "reported by <publisher>" and cite the report. No loaded words ("front", "spy school", "malign").
- **`seedNotes` is a checklist, not a source.** It holds MISP's structured fields (from ASPI's 2019 data). Use it to know what to look for; a claim goes in the profile only once you have found it in a source you cite. Leave `seedNotes` in the file; it is never displayed or exported.
- **The rubric rates, not you.** Never write a rating by hand. An override moves one level at most and needs `rating.overrideReason`. Before you start, a listed institution already shows High "from official lists"; verifying it replaces that with the rubric's rating of your evidence.

## Branch rule

Verified, rated profiles live on the content branch `tracker/content` until the Lakehead review has approved the method and a sample of profiles. Before writing a verified profile, run `git branch --show-current`. If it is not `tracker/content`, stop and ask Andrew. Never push, open a PR or merge unless he asks.

## Inputs

- A record id (`harbin-institute-of-technology`): open `src/data/defenceTracker/institutions/<id>.json`.
- A name: find the file with Grep over `institutions/` (names, `zh`, aliases, acronyms, domains). A `listing-only` record without a file is created at load time; to profile it, create `institutions/<id>.json` with the same id.
- "Next N": run `npm run tracker:next -- N` and work down the list in order.

## Source order

Use the highest-quality source that supports each claim:

1. Official lists and government documents (Canada, US, Japan, EU, UK, Australia).
2. The institution's own websites, Chinese and English (about pages, lab pages, discipline lists).
3. Chinese government notices: SASTIND, MIIT, MOE, ministry and provincial announcements.
4. Court records and indictments.
5. Reputable research (think tanks, academic papers): cite, never copy.
6. News, only to corroborate one of the above.

Chinese-language sources are fine (`"lang": "zh"`); summaries are in English. A Chinese government site that blocks you may have a Wayback copy; cite the original address and archive the copy you used.

## Evidence

One evidence item per signal. Signal ids and what counts (full text in `SIGNALS`, `src/tools/compliance/defence-tracker/lib/constants.js`):

| Signal | Counts when |
|---|---|
| `pla` | A PLA or People's Armed Police university, academy or institute, or a body under the Central Military Commission |
| `security-agency` | Belongs to the MSS, MPS or another state security body |
| `defence-conglomerate` | A state-owned defence-industry group (CASC, CASIC, AVIC, CETC, NORINCO, CSSC…) or one of its institutes |
| `nuclear-weapons` | Designs, builds or tests nuclear weapons (e.g. CAEP and its institutes) |
| `seven-sons` | One of the seven MIIT universities that are core defence-industry bases |
| `defence-key-labs` | Hosts national defence key laboratories; list them in `items` (English name and Chinese). Two or more = major, one = substantial |
| `secrecy-qualification` | Holds a weapons and equipment research secrecy qualification |
| `weapons-production-licence` | Holds a weapons research and production licence |
| `sastind-coconstruction` | Co-constructed (jointly supervised) by SASTIND |
| `defence-disciplines` | Has officially designated defence-specialty disciplines |
| `defence-industry-partnership` | Documented partnerships, joint centres or programs with defence-industry groups |
| `defence-funded-research` | Documented projects funded by military or defence-industry bodies |
| `pla-collaboration` | Documented joint research, joint labs or co-supervision with PLA institutions |
| `misconduct` | Officially documented cyber operations, espionage, or export-control or sanctions violations |
| `state-control` | How the state owns, funds or directs it (context; never changes the rating alone) |

Each item: `{ "signal", "summary", "annexB", "sources" }`, plus `items` (and `count` if not all are listed) for labs. `summary` is one or two sentences in your own words. `annexB` lists the NSGRP Annex B questions it supports: `2.1` state influence or control, `2.2` misconduct or lack of transparency, `2.3` military or government ties. `sources` lists source ids from the record.

Also check and correct, with sources: `type`, `supervisors`, `zh`, aliases, `domains`, `subunits` (campuses, labs, institutes), `topics` (STRA ids from `src/data/straData.js`, only where a source shows research in that area), and `location` (main-campus coordinates to 4 decimals, never the city centre).

## Sources

`{ "id": "s1", "title", "publisher", "url", "accessed": "YYYY-MM-DD", "lang": "en" | "zh", "archive" }`. `archive` is `{ "url": "https://web.archive.org/web/…" }` or `{ "unavailable": "<reason>" }`.

## Finishing a profile

The schema rejects evidence on an unverified record, so work in this order:

1. Add the `sources` to the record (still `seed`) and run `npm test`.
2. Run `npm run tracker:archive -- --id <id>`. For a capture it flags as blocked or empty, ask Andrew to try archive.today (it uses a CAPTCHA, so never do it yourself), or record `archive.unavailable` with the reason.
3. In one edit: add `evidence`, set `"status": "verified"` and `"verifiedOn": "<today>"`, and append `{ "date": "<today>", "change": "Verified; rated <rating>." }` to `history`. On a re-verification, say what changed.
4. Run `npm test`. Read the rating the rubric gives (the institution page in `npm run dev:tracker` shows the rule and reasons). If it is wrong, fix the evidence. Override only for a reason the rubric can't see, one level at most, with `rating.override` and `rating.overrideReason`.
5. Commit the record on `tracker/content` with a message naming the institution.

Then give Andrew a review note:

```
### <Name> (`<id>`)
- Rating: <rating>, rule `<rule id>`; override: none | <rating>, because <reason>
- Evidence: <n> items (<signal ids>); Annex B 2.1 ×n, 2.2 ×n, 2.3 ×n
- Sources: <n> (<n> archived, <n> unavailable: <reasons>)
- Seed claims left out: <claim, and why it couldn't be confirmed>
- Judgement calls: <anything borderline he should check>
```

## Corrections

A correction (GitHub issue or email) is handled like a re-verification: check the claim against its source, fix the record, add a `history` entry describing the change, run `npm test`, and draft a short reply for Andrew. Never include the reporter's name or contact details in the record or the commit.
