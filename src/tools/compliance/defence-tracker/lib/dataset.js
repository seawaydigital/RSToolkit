// Joins the tracker's institution files, its listing snapshots and the NRO
// module into one rated record set. Institutions known only from an official
// list get a minimal "listing-only" record here, so they need no file and a
// batch check never misses them.
import { STOPWORDS, hasCjk, isGenericPhrase, normalizePhrase, segmentTokens, splitSegments } from './normalize.js';
import { withoutCodes } from './places.js';
import { LISTS, SNAPSHOT_NAMES } from './constants.js';
import { rateInstitution } from './rubric.js';
import { slugify } from './schema.js';

const COUNTRY_CODES = { China: 'CN', Russia: 'RU', Iran: 'IR' };
const ACRONYM = /^[A-Z][A-Z0-9&-]{1,7}$/;

function guessType(name) {
  return /universit|college/i.test(name) ? 'university' : 'research-institute';
}

function blankRecord(id, name) {
  return {
    id,
    name,
    zh: null,
    zhAliases: [],
    aliases: [],
    acronyms: [],
    domains: [],
    country: null,
    type: guessType(name),
    location: null,
    supervisors: [],
    parent: null,
    ids: {},
    evidence: [],
    topics: [],
    subunits: [],
    sources: [],
    rating: { override: null, overrideReason: null },
    status: 'listing-only',
    verifiedOn: null,
    history: [],
    seedNotes: null,
  };
}

function addNames(record, names) {
  for (const n of names) {
    if (!n || n === record.name) continue;
    const list = hasCjk(n) ? record.zhAliases : ACRONYM.test(n) ? record.acronyms : record.aliases;
    if (!list.includes(n)) list.push(n);
  }
}

const allCaps = (s) => /[A-Z]/.test(s) && s === s.toUpperCase();

// A record that several list entries name (an SDN legal name in capitals, an
// Entity List spelling) shows the first name written in mixed case.
function preferMixedCase(record, name) {
  if (!allCaps(record.name) || !/[a-z]/.test(name ?? '')) return;
  const old = record.name;
  record.name = name;
  record.type = guessType(name);
  record.aliases = record.aliases.filter((a) => a !== name);
  addNames(record, [old]);
}

// A list-only unit named after another record is linked to it, and every
// parent lists its units that are listed in their own right. The name may set
// the parent off ("Sharif University of Technology, Department of
// Engineering") or just start with it ("Aviation Industry Corporation of
// China 612 Institute"), but not carry it on: "Shahid Beheshti University of
// Medical Sciences" is another university. The most specific parent wins, so
// an academy's institute is the academy's unit. The unit's listings stay the
// unit's: the parent still reads "Not listed" for them.
function linkListedUnits(records, byId) {
  const byName = new Map();
  const byFirstWord = new Map();
  for (const r of records) {
    for (const n of [r.name, withoutCodes(r.name)].filter(Boolean)) {
      const key = normalizePhrase(n);
      if (key && !byName.has(key)) byName.set(key, r.id);
      const words = key.split(' ');
      if (words.length < 2 || isGenericPhrase(key)) continue;
      if (!byFirstWord.has(words[0])) byFirstWord.set(words[0], []);
      byFirstWord.get(words[0]).push({ id: r.id, words });
    }
  }
  const core = (name) => normalizePhrase(withoutCodes(name) ?? name);
  const sameCountry = (a, b) => !a || !b || a === b;
  for (const r of records) {
    r.units = [];
    if (!r.virtual || r.parent) continue;
    const candidates = [];
    const parts = splitSegments(r.name);
    if (parts.length > 1) {
      const key = parts.map(normalizePhrase).find((p) => byName.has(p) && byName.get(p) !== r.id);
      if (key) candidates.push({ id: byName.get(key), size: key.split(' ').length });
    }
    const { kept, rawAfter } = segmentTokens(r.name);
    for (const { id, words } of byFirstWord.get(kept[0]) ?? []) {
      const startsWith = words.length < kept.length && words.every((w, i) => w === kept[i]);
      if (startsWith && id !== r.id && !STOPWORDS.has(rawAfter[words.length - 1]) && sameCountry(r.country, byId.get(id).country)) {
        candidates.push({ id, size: words.length });
      }
    }
    const best = candidates.reduce((a, b) => (b.size > a.size ? b : a), candidates[0]);
    // "X (CODE)" is X itself under another list's spelling, not a unit of X.
    r.parent = best && core(r.name) !== core(byId.get(best.id).name) ? best.id : null;
  }
  for (const r of records) {
    const parent = r.parent ? byId.get(r.parent) : null;
    // A listing through the parent's own entry (see addAliasEntries) is the parent's.
    const lists = r.listings.filter((l) => l.status === 'listed' && l.entries.some((e) => !e.alias)).map((l) => l.label);
    if (parent && parent !== r && lists.length) parent.units.push({ id: r.id, name: r.name, lists });
  }
  for (const r of records) r.units.sort((a, b) => a.name.localeCompare(b.name));
}

// The forms of an alias that can name a unit: as written, before a bracketed
// note ("… Chemistry (a.k.a., China Academy of Engineering Physics (CAEP)'s
// 902 Institute)") and before a comma ("The High Power Laser Laboratory,
// Shanghai").
const aliasForms = (alias) => [alias, alias.split('(')[0], alias.split(',')[0]].map(normalizePhrase).filter((p) => p.includes(' '));

// A list can name a unit among its parent's aliases: the Entity List's entry
// for CAEP gives its institutes ("a.k.a. … Southwest Institute of Fluid
// Physics"). That entry covers the unit, so the unit is listed through it,
// with the alias that names it, unless the list gives the unit an entry of
// its own. Only units the data already links to the parent count, since the
// lists' aliases are loose.
function addAliasEntries(records, byId, entriesByList) {
  const unitsOf = new Map();
  for (const r of records) {
    const parentId = r.parent ? (byId.get(r.parent)?.id ?? r.parent) : null;
    if (!parentId || parentId === r.id) continue;
    if (!unitsOf.has(parentId)) unitsOf.set(parentId, []);
    unitsOf.get(parentId).push({ id: r.id, names: new Set([r.name, ...(r.aliases ?? [])].map(normalizePhrase)) });
  }
  for (const forList of entriesByList.values()) {
    const found = [];
    for (const [parentId, entries] of forList) {
      for (const unit of unitsOf.get(parentId) ?? []) {
        if (forList.has(unit.id)) continue;
        for (const e of entries) {
          const alias = (e.altNames ?? []).find((a) => aliasForms(a).some((form) => unit.names.has(form)));
          if (alias) found.push([unit.id, { ...e, alias }]);
        }
      }
    }
    for (const [id, e] of found) forList.set(id, [...(forList.get(id) ?? []), e]);
  }
}

export function buildDataset({ institutions, snapshots = {}, nroData, meta }) {
  const byId = new Map();
  for (const file of institutions) byId.set(file.id, { ...blankRecord(file.id, file.name), ...file, virtual: false });

  const entriesByList = new Map(LISTS.map((l) => [l.id, new Map()]));
  for (const name of SNAPSHOT_NAMES) {
    for (const e of snapshots[name]?.entries ?? []) {
      if (!e.institution) continue;
      let record = byId.get(e.institution);
      if (!record) {
        record = { ...blankRecord(e.institution, e.name), country: e.country ?? null, virtual: true };
        byId.set(record.id, record);
      }
      if (record.virtual) {
        preferMixedCase(record, e.name);
        addNames(record, [e.name, ...(e.altNames ?? [])]);
      }
      const forList = entriesByList.get(e.list);
      if (!forList) continue;
      if (!forList.has(record.id)) forList.set(record.id, []);
      forList.get(record.id).push(e);
    }
  }

  // The NRO data can name one institution twice (a top-level entry plus a
  // CAEP alias split out for its own map pin). A record lists the extra NRO
  // ids in ids.nroAlso, and those ids resolve to it.
  const nroIdsOf = (r) => [r.ids?.nro, ...(r.ids?.nroAlso ?? [])].filter(Boolean);
  const nroById = new Map(nroData.organizations.map((o) => [o.id, o]));
  const coveredNro = new Set([...byId.values()].flatMap(nroIdsOf));
  for (const org of nroData.organizations) {
    if (coveredNro.has(org.id)) continue;
    const existing = byId.get(org.id);
    const record = existing ?? { ...blankRecord(org.id, org.name), virtual: true };
    record.ids = { ...record.ids, nro: org.id };
    record.country = record.country ?? COUNTRY_CODES[org.country] ?? null;
    record.location = record.location ?? { city: org.city ?? null, province: null, lat: org.lat ?? null, lng: org.lng ?? null };
    record.parent = record.parent ?? (org.parentOrg ? slugify(org.parentOrg) : null);
    if (record.virtual) addNames(record, [org.name, ...(org.aliases ?? [])]);
    byId.set(record.id, record);
  }

  const records = [...byId.values()];
  for (const record of records) {
    for (const alias of record.ids?.nroAlso ?? []) if (!byId.has(alias)) byId.set(alias, record);
  }
  addAliasEntries(records, byId, entriesByList);

  const coverage = (snapshotName) => snapshots[snapshotName]?.coverage ?? 'pending';
  for (const record of records) {
    record.listings = LISTS.map((list) => {
      let status;
      let entries;
      if (list.snapshot === 'nro') {
        const orgs = nroIdsOf(record).map((id) => nroById.get(id)).filter(Boolean);
        entries = orgs.map((org) => ({ name: org.name, date: null, citation: 'Named Research Organizations list', url: nroData.sourceUrl ?? list.sourceUrl }));
        status = orgs.length ? 'listed' : 'not-listed';
      } else if (coverage(list.snapshot) !== 'complete') {
        entries = [];
        status = 'not-checked';
      } else {
        entries = entriesByList.get(list.id).get(record.id) ?? [];
        status = entries.length ? 'listed' : 'not-listed';
      }
      return { listId: list.id, label: list.label, jurisdiction: list.jurisdiction, kind: list.kind, sourceUrl: list.sourceUrl, status, entries };
    });
    record.assessment = rateInstitution(record, record.listings);
  }
  linkListedUnits(records, byId);

  const lists = LISTS.map((list) => {
    const base = { listId: list.id, label: list.label, jurisdiction: list.jurisdiction, kind: list.kind };
    if (list.snapshot === 'nro') {
      return { ...base, coverage: 'complete', checkedOn: meta?.listsCheckedOn?.['ca-nro'] ?? null, listDate: nroData.lastUpdated ?? null, sourceUrl: nroData.sourceUrl ?? list.sourceUrl };
    }
    const snap = snapshots[list.snapshot];
    return { ...base, coverage: coverage(list.snapshot), checkedOn: snap?.checkedOn ?? null, listDate: snap?.published ?? null, sourceUrl: snap?.sourceUrl ?? list.sourceUrl };
  });

  return { meta, records, byId, lists };
}
