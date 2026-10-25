// Joins the tracker's institution files, its listing snapshots and the NRO
// module into one rated record set. Institutions known only from an official
// list get a minimal "listing-only" record here, so they need no file and a
// batch check never misses them.
import { hasCjk } from './normalize.js';
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
      if (record.virtual) addNames(record, [e.name, ...(e.altNames ?? [])]);
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
