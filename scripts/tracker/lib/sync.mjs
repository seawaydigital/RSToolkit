// The official-list sync, shared by `npm run tracker:sync` and the monthly
// watch report. Fetches each source, maps entries to records, and diffs the
// result against the stored snapshots. A source that cannot be fetched is
// reported as "couldn't check" and its snapshot is left untouched.
import { buildMatchIndex } from '../../../src/tools/compliance/defence-tracker/lib/matcher.js';
import { loadDataset, nroData, readRawData, writeMeta, writeSnapshot } from './loadData.mjs';
import { fetchJson, fetchText } from './http.mjs';
import {
  CA_SANCTIONS_URL,
  CSL_URL,
  NRO_PAGE,
  assignInstitutions,
  caToEntries,
  compareNroNames,
  cslToEntries,
  diffEntries,
  parseCaSanctionsXml,
  parseNroPage,
  resolveInstitutionAliases,
  sanitizeForIssue,
  unknownListFiles,
} from './listings.mjs';

const DOD_1286_PAGE = 'https://www.cto.mil/fy25-ndaa-section-1286-list/';
// METI's revision log, which links each revision's list body as YYYYMMDD_3.pdf.
const METI_EUL_PAGE = 'https://www.meti.go.jp/policy/anpo/law09-2.html';

const linksMatching = (html, pattern) =>
  [...new Set([...String(html).matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => pattern.test(h)))];

export async function runSync({ write = false, today = new Date().toISOString().slice(0, 10) } = {}) {
  const raw = await readRawData();
  const dataset = await loadDataset(raw);
  const index = buildMatchIndex(dataset.records);
  const takenIds = new Set(dataset.byId.keys());
  const countryOf = (id) => dataset.byId.get(id)?.country ?? null;
  // Shared by every list in this sync, so a record created for one list can be
  // reused, or merged, by the next.
  const shared = { known: new Map(), aliases: new Map(), createdIds: new Set() };
  const sections = [];
  const failures = [];
  const pending = [];

  const assign = (entries, previous) => {
    const assigned = assignInstitutions(entries, { previous, index, takenIds, countryOf, ...shared });
    for (const id of assigned.created) takenIds.add(id);
    return assigned.entries;
  };

  for (const [name, title, load] of [
    ['us-csl', 'US Consolidated Screening List (Entity List, Military End-User, SDN)', async () => {
      const csl = await fetchJson(CSL_URL, { timeoutMs: 180000 });
      return cslToEntries(csl.results ?? csl);
    }],
    ['ca-sanctions', 'Consolidated Canadian Autonomous Sanctions List', async () =>
      caToEntries(parseCaSanctionsXml(await fetchText(CA_SANCTIONS_URL, { timeoutMs: 120000 })))],
  ]) {
    try {
      const snapshot = raw.snapshots[name];
      pending.push({ name, title, snapshot, entries: assign(await load(), snapshot.entries), generated: true });
    } catch (err) {
      failures.push(`${title}: ${err.message}`);
    }
  }

  // Hand-maintained lists: map any entry that has no institution yet.
  for (const name of ['us-1286', 'jp-meti-eul']) {
    const snapshot = raw.snapshots[name];
    const unmapped = snapshot.entries.filter((e) => !e.institution).length;
    if (!unmapped) continue;
    const entries = assign(snapshot.entries, snapshot.entries.filter((e) => e.institution));
    pending.push({ name, title: `${name}.json (hand-maintained)`, snapshot, entries, notes: [`Mapped ${unmapped} new entries.`] });
  }

  // Merges found late can rename records an earlier list created, so every
  // list is resolved before anything is reported or written.
  const created = [...shared.createdIds].filter((id) => !shared.aliases.has(id));
  const createdSet = new Set(created);
  for (const p of pending) {
    const entries = resolveInstitutionAliases(p.entries, shared.aliases);
    const before = new Set(p.snapshot.entries.map((e) => e.institution));
    const newHere = [...new Set(entries.map((e) => e.institution))].filter((id) => createdSet.has(id) && !before.has(id));
    sections.push({ title: p.title, ...diffEntries(p.snapshot.entries, entries), created: newHere, notes: p.notes, total: entries.length });
    if (write) {
      const snapshot = p.generated ? { ...p.snapshot, coverage: 'complete', checkedOn: today, entries } : { ...p.snapshot, entries };
      await writeSnapshot(p.name, snapshot);
    }
  }

  // The NRO page is compared with the names in src/data/nroData.js, which is
  // maintained by hand because NRO Lookup uses it too.
  try {
    const notes = compareNroNames(parseNroPage(await fetchText(NRO_PAGE)), nroData.organizations);
    if (notes.length) sections.push({ title: 'Named Research Organizations page', notes });
    else if (write) await writeMeta({ ...raw.meta, listsCheckedOn: { ...raw.meta.listsCheckedOn, 'ca-nro': today } });
  } catch (err) {
    failures.push(`Named Research Organizations page: ${err.message}`);
  }

  for (const [name, page, pattern] of [
    ['us-1286', DOD_1286_PAGE, /1286[^"]*\.pdf/i],
    ['jp-meti-eul', METI_EUL_PAGE, /\d{8}[-_]3\.pdf/i],
  ]) {
    try {
      const links = linksMatching(await fetchText(page), pattern);
      // The revision log links every past edition too; only the newest counts.
      const fresh = unknownListFiles(name === 'jp-meti-eul' ? links.slice(0, 1) : links, raw.snapshots[name]);
      if (fresh.length) sections.push({ title: `${name}: list page`, notes: fresh.map((l) => `Linked file not in ${name}.json: ${sanitizeForIssue(l)} — check whether a new list was published.`) });
    } catch (err) {
      failures.push(`${name} list page (${page}): ${err.message} — check it by hand.`);
    }
  }

  return { sections, failures, created };
}
