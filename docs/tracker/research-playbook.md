# Defence Institution Tracker: research playbook

How tracker profiles are researched, verified and kept current. Claude research sessions follow the same process through the project skill `.claude/skills/tracker-research/SKILL.md`. The record format and the rules `npm test` enforces are in [`src/data/defenceTracker/README.md`](../../src/data/defenceTracker/README.md). The rating rules are on the tracker's methodology page and in `src/tools/compliance/defence-tracker/lib/rubric.js`.

## Principles

- **Institutions, never individuals.** No person is named, described or linked, including people in court cases.
- **Own words, every claim sourced, every source archived** (or a written reason it can't be).
- **No ASPI text, ratings or paid data.** Don't open ASPI's subscription tracker. Its free public reports can be cited like other research, never copied.
- **Neutral wording.** Allegations are "reported by" their publisher.
- **The rubric rates.** Overrides move one level at most and carry a written reason that the page shows.
- **Not listed is not low risk,** and a rating is not a legal determination. The official lists prevail.

## Where the work happens

- **Code, listing syncs and seed records** go to `master` through pull requests, with the tracker hidden (`ENABLE_DEFENCE_TRACKER = false`). Official-list data is public, so it can merge before launch.
- **Verified, rated profiles** go to the long-lived branch `tracker/content` until the Lakehead review has approved the method and a sample of profiles. It touches only `institutions/*.json` and `changelog.json`, so merge `master` into it regularly and conflicts stay rare.

Create it once with `git switch -c tracker/content master`, and push it so it is backed up.

## Choosing what to research

`npm run tracker:next` prints the next 20 records (`npm run tracker:next -- 50` for more). Unverified records come first, in priority groups:

1. Chinese institutions on Canada's Named Research Organizations list
2. US-listed Chinese universities
3. Structural institutions: PLA, security agencies, defence conglomerates, nuclear, the Seven Sons. These need only one or two sources each.
4. The rest of the MISP seed list
5. Other Chinese bodies: CAS institutes, joint-venture universities, newly listed bodies
6. Russia and Iran

Verified profiles follow, longest since verification first, for re-checking.

## Researching a profile

1. **Read the record.** `seedNotes` holds MISP's structured fields. Treat them as a list of claims to check, never as a source.
2. **Find sources**, best first: official lists and government documents; the institution's own websites (Chinese and English); Chinese government notices (SASTIND, MIIT, MOE); court records and indictments; reputable research; news only to corroborate.
3. **Write the evidence**, one item per signal, one or two sentences in your own words, each citing its sources and tagged with the NSGRP Annex B questions it supports (2.1 state influence or control, 2.2 misconduct or lack of transparency, 2.3 military or government ties). The signals and what counts for each are listed on the methodology page.
4. **Check the identifying details** with sources: names and Chinese names, aliases, email domains, type, supervising agency, campuses and labs, STRA topics, and main-campus coordinates (4 decimals, never the city centre).

## Archiving sources

Every source on a verified profile needs an archived copy or a reason.

1. Add the sources to the record while it is still a `seed` (the schema rejects evidence on unverified records), and run `npm test`.
2. Run `npm run tracker:archive -- --id <id>`. It saves each unarchived source to the Wayback Machine, five seconds apart, and records the snapshot. Optional `ARCHIVE_ORG_ACCESS_KEY` / `ARCHIVE_ORG_SECRET` environment variables (archive.org S3 keys) raise the rate limit. Keep them out of the repo.
3. A capture the script flags as blocked or empty (an anti-bot page, an error, a near-empty page) is not recorded. Try archive.today by hand. If that fails too, record `"archive": { "unavailable": "<reason>" }`.

## Finishing a profile

1. In one edit, add the evidence, set `"status": "verified"` and `"verifiedOn"`, and append a `history` entry ("Verified; rated High.", or what changed on a re-check).
2. Run `npm test`, then open the profile in `npm run dev:tracker`. The page shows the rating, the rule that produced it and the reasons. If the rating is wrong, fix the evidence. Override only for a reason the rubric can't see.
3. Commit on `tracker/content`.

A research session ends with a short review note per profile: rating and rule, evidence and Annex B coverage, sources and archive status, seed claims left out and why, and any judgement calls to check.

## Monthly routine (about a day)

1. **The watch issue.** On the 1st of each month the `Tracker watch` workflow opens an issue titled "Tracker watch — YYYY-MM". It lists official-list changes, lists it couldn't check, and sources that need attention. It never changes the repository.
2. **Sync the lists** on a branch from `master`: `npm run tracker:sync`, review the diff (new listing-only records, changed entries), `npm test`, and merge through a PR.
3. **Hand checks.** Scripts can't read the US Section 1286 list page or Japan's End User List page, so check both by hand for a new edition. Copy a new edition into `listings/us-1286.json` or `listings/jp-meti-eul.json`: entries `{ key, list, name, altNames, country, date, citation, url, institution: null }`, plus `coverage: "complete"`, `checkedOn` and the edition details. Then run `npm run tracker:sync` to map the new entries to records.
4. **Sources.** For a source that no longer answers, open it in a browser. If it is gone, the archived copy stays the citation; if it moved, update the address. Archive any source without a copy.
5. **Profiles.** Verify or re-check 15 to 25 profiles from `npm run tracker:next`, on `tracker/content` before launch and on `master` after.
6. **Release the data.** Bump `meta.json` `version` to `YYYY.MM` and `released`, and add a `changelog.json` entry saying what changed. On GitHub Pages, merging to `master` publishes. If the site has moved to institutional hosting, publish with the release-bundle procedure in `HANDOFF.md`.
7. **Close the watch issue.**

## Corrections

Corrections arrive by email (the address on the methodology page) or through the "Defence Institution Tracker correction" issue form. Check the claim against its source and fix the record. Add a `history` entry describing the change (never the reporter's name), run `npm test`, then reply. A correction that changes a rating is noted in the changelog.

## Before launch

All four gates must be met before `tracker/content` merges and `ENABLE_DEFENCE_TRACKER` is switched on:

1. **Lakehead review** of the methodology and a sample of profiles. Also confirm that holding the dataset personally fits Lakehead's IP policy, if any of the work is done in a Lakehead role.
2. **Hosting.** The site is on its final host, or the old host's redirect keeps the `#…` part of the address for as long as copied records may cite it. A meta refresh drops it; a small script redirect page keeps it.
3. **Accessibility pass** of the tracker pages with the `ACCESSIBILITY.md` checklist.
4. **Security review** of the watch workflow and the new scripts, and `npm audit`.
