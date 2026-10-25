// Pure helpers for the seed import: MISP galaxy values and NRO organizations
// become tracker records, then ROR fills in Chinese names, acronyms, email
// domains and identifiers. Only structured fields are taken from MISP; its
// description text (ASPI's prose) is never read into a record.
import { compactCjk, hasCjk, isGenericPhrase, normalizePhrase } from '../../../src/tools/compliance/defence-tracker/lib/normalize.js';
import { slugify } from '../../../src/tools/compliance/defence-tracker/lib/schema.js';

// Pinned to the last commit that touched the cluster (2020-08-22), so the
// import is reproducible.
export const MISP_URL =
  'https://raw.githubusercontent.com/MISP/misp-galaxy/4635146b00713d1a1ed42bb7bb85ec2ab274ece7/clusters/china-defence-universities.json';

const ACRONYM = /^[A-Z][A-Z0-9&-]{1,7}$/;
const COUNTRY_CODES = { China: 'CN', Russia: 'RU', Iran: 'IR' };
const MISP_TYPES = {
  Military: 'military',
  Security: 'security',
  'Defence industry conglomerate': 'defence-industry',
  'Seven sons of national defence': 'university',
};

const unique = (list) => [...new Set(list.filter(Boolean))];
const num = (v) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

function splitNames(names, primary) {
  const out = { zh: [], acronyms: [], aliases: [] };
  // Drop missing names before String() turns them into "null", and the stray
  // trailing commas some sources carry.
  for (const n of unique(names.filter((x) => x != null).map((x) => String(x).trim().replace(/[,;:]+$/, '').trim()))) {
    if (n === primary) continue;
    if (hasCjk(n)) out.zh.push(n);
    else if (ACRONYM.test(n)) out.acronyms.push(n);
    else out.aliases.push(n);
  }
  return out;
}

function guessType(name, { parentOrg } = {}) {
  if (parentOrg === 'chinese-academy-of-engineering-physics') return 'nuclear';
  if (/\b(PLA|People'?s Liberation Army|Army|Navy|Naval|Air ?force|Rocket Force|Military|Armed Police|Flight Academy)\b/i.test(name)) return 'military';
  return /universit|college/i.test(name) ? 'university' : 'research-institute';
}

function emptyRecord(id, name) {
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
  const parts = splitNames(names, record.name);
  if (!record.zh && parts.zh.length) record.zh = parts.zh.shift();
  record.zhAliases = unique([...record.zhAliases, ...parts.zh]).filter((n) => n !== record.zh);
  record.acronyms = unique([...record.acronyms, ...parts.acronyms]);
  record.aliases = unique([...record.aliases, ...parts.aliases]);
  return record;
}

// MISP names often end with the Chinese name in brackets:
// "Harbin Engineering University (哈尔滨工程大学)".
export function parseMispName(value) {
  const raw = String(value ?? '').trim();
  const m = /^(.*\S)\s*\(([^()]*)\)\s*$/.exec(raw);
  if (m && hasCjk(m[2]) && !hasCjk(m[1])) return { name: m[1].trim(), zh: m[2].trim() };
  return { name: raw, zh: null };
}

export function mispValueToRecord(value, { nroMatch, today }) {
  const meta = value.meta ?? {};
  const { name, zh } = parseMispName(value.value);
  const record = emptyRecord(nroMatch ?? slugify(name), name);
  addNames(record, [zh, ...(meta.aliases ?? [])].filter(Boolean));
  const category = (meta.categories ?? [])[0];
  record.type = MISP_TYPES[category] ?? (/universit|college/i.test(name) ? 'university' : 'research-institute');
  record.country = 'CN';
  const lat = num(meta.lat);
  const lng = num(meta.long);
  record.location = lat !== null && lng !== null ? { city: null, province: null, lat, lng } : null;
  record.ids = { misp: value.uuid, ...(nroMatch ? { nro: nroMatch } : {}) };
  record.status = 'seed';
  record.seedNotes = {
    source: 'MISP galaxy china-defence-universities cluster (CC0)',
    categories: meta.categories ?? [],
    supervisingAgencies: meta['supervising agencies'] ?? [],
    majorDefenceLaboratories: meta['major defence laboratories'] ?? [],
    subsidiaries: meta.subsidiaries ?? [],
    topics: meta.topics ?? [],
    address: meta.address ?? null,
  };
  record.history = [{ date: today, change: 'Seed record from the MISP galaxy list (structured fields only); not yet verified.' }];
  return record;
}

export function nroOrgToRecord(org, { today }) {
  const record = emptyRecord(org.id, org.name);
  addNames(record, org.aliases ?? []);
  record.type = guessType(org.name, org);
  record.country = COUNTRY_CODES[org.country] ?? null;
  record.location = { city: org.city ?? null, province: null, lat: num(org.lat), lng: num(org.lng) };
  record.parent = org.parentOrg ?? null;
  record.ids = { nro: org.id };
  record.history = [{ date: today, change: 'Record created from the Named Research Organizations list; not yet verified.' }];
  return record;
}

// NRO coordinates are curated per campus, so they replace MISP's.
export function addNroDetails(record, org) {
  const out = structuredClone(record);
  addNames(out, [org.name, ...(org.aliases ?? [])]);
  out.ids = { ...out.ids, nro: org.id };
  out.parent = out.parent ?? org.parentOrg ?? null;
  if (org.lat != null && org.lng != null) {
    out.location = { city: org.city ?? out.location?.city ?? null, province: out.location?.province ?? null, lat: num(org.lat), lng: num(org.lng) };
  }
  return out;
}

const withoutBrackets = (s) => s.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

// Comparable keys for a set of names: Latin-script forms only (a bracketed
// Chinese name is dropped), skipping generic phrases unless `allowGeneric`.
function nameKeys(names, { allowGeneric = false } = {}) {
  const keys = new Set();
  for (const n of names) {
    if (!n) continue;
    const latin = n.replace(/\s*\([^)]*\p{Script=Han}[^)]*\)\s*/gu, ' ').trim();
    if (!latin || hasCjk(latin)) continue;
    for (const variant of [latin, withoutBrackets(latin)]) {
      const phrase = normalizePhrase(variant);
      if (phrase.split(' ').length >= 2 && (allowGeneric || !isGenericPhrase(phrase))) keys.add(phrase);
    }
  }
  return keys;
}

const orgKeys = (org) => nameKeys([org.name, ...(org.aliases ?? [])]);

// An exact primary-name match wins even for generic names ("Information
// Engineering University"); otherwise any shared distinctive name counts.
export function findNroMatch(value, orgs) {
  const { name } = parseMispName(value.value);
  const primary = normalizePhrase(name);
  const keys = nameKeys([name, ...(value.meta?.aliases ?? [])]);
  const exact = orgs.filter((o) => nameKeys([o.name], { allowGeneric: true }).has(primary));
  const candidates = exact.length ? exact : orgs.filter((o) => [...orgKeys(o)].some((k) => keys.has(k)));
  if (!candidates.length) return null;
  candidates.sort(
    (a, b) =>
      Number(Boolean(a.parentOrg)) - Number(Boolean(b.parentOrg)) ||
      Number(normalizePhrase(b.name) === primary) - Number(normalizePhrase(a.name) === primary),
  );
  return candidates[0].id;
}

// Groups NRO organizations that share a name, top-level entry first.
export function groupDuplicateNroOrgs(orgs) {
  const groups = [];
  for (const org of orgs) {
    const keys = orgKeys(org);
    const group = groups.find((g) => g.some((o) => [...orgKeys(o)].some((k) => keys.has(k))));
    if (group) group.push(org);
    else groups.push([org]);
  }
  for (const g of groups) g.sort((a, b) => Number(Boolean(a.parentOrg)) - Number(Boolean(b.parentOrg)) || a.id.localeCompare(b.id));
  return groups;
}

export function mergeSeedIntoExisting(existing, seed) {
  const out = structuredClone(existing);
  out.ids = { ...seed.ids, ...out.ids };
  if (out.status === 'verified') {
    out.seedNotes = out.seedNotes ?? seed.seedNotes;
    return out;
  }
  addNames(out, [seed.name, seed.zh, ...seed.zhAliases, ...seed.acronyms, ...seed.aliases]);
  out.type = out.type === 'research-institute' ? seed.type : out.type;
  out.location = out.location ?? seed.location;
  out.status = 'seed';
  out.seedNotes = seed.seedNotes;
  out.history = [...out.history, ...seed.history];
  return out;
}

// Builds the full record set from MISP values and NRO organizations, merging
// into `existing` records instead of replacing them. An NRO organization whose
// id matches a MISP seed is the same institution and is merged into it.
export function assembleSeedRecords({ mispValues, nroOrgs, existing = [], today }) {
  const records = new Map(existing.map((r) => [r.id, structuredClone(r)]));
  const orgsById = new Map(nroOrgs.map((o) => [o.id, o]));
  let created = 0;
  let merged = 0;
  const put = (record, isMerge) => {
    records.set(record.id, record);
    if (isMerge) merged++;
    else created++;
  };

  for (const value of mispValues) {
    const nroMatch = findNroMatch(value, nroOrgs);
    let seed = mispValueToRecord(value, { nroMatch, today });
    if (nroMatch) seed = addNroDetails(seed, orgsById.get(nroMatch));
    const prev = records.get(seed.id);
    put(prev ? mergeSeedIntoExisting(prev, seed) : seed, Boolean(prev));
  }

  const covered = new Set([...records.values()].flatMap((r) => [r.ids?.nro, ...(r.ids?.nroAlso ?? [])]).filter(Boolean));
  for (const [primary, ...rest] of groupDuplicateNroOrgs(nroOrgs.filter((o) => !covered.has(o.id)))) {
    const prev = records.get(primary.id);
    const record = prev ? addNroDetails(prev, primary) : nroOrgToRecord(primary, { today });
    if (rest.length) record.ids = { ...record.ids, nroAlso: unique([...(record.ids.nroAlso ?? []), ...rest.map((o) => o.id)]) };
    put(record, Boolean(prev));
  }
  return { records, created, merged };
}

// When ROR chose one organization for several records (often a parent for its
// sub-institutes), it stays only with the record that carries that name; if
// none does, no record gets it. Mutates `enrichment`; returns what was dropped.
export function resolveRorConflicts(enrichment, records) {
  const byRor = new Map();
  for (const [id, e] of enrichment) byRor.set(e.ror, [...(byRor.get(e.ror) ?? []), id]);
  const dropped = [];
  for (const [ror, ids] of byRor) {
    if (ids.length < 2) continue;
    const e = enrichment.get(ids[0]);
    const rorNames = new Set([e.display, ...(e.aliases ?? [])].filter(Boolean).map(normalizePhrase));
    const keep =
      ids.find((id) => {
        const r = records.get(id);
        return [r.name, ...(r.aliases ?? [])].some((n) => rorNames.has(normalizePhrase(n)));
      }) ?? null;
    for (const id of ids) {
      if (id === keep) continue;
      enrichment.delete(id);
      dropped.push(`${id} (${ror}${keep ? `, kept by ${keep}` : ''})`);
    }
  }
  return dropped;
}

const latinKey = (n) => {
  if (!n || hasCjk(n)) return null;
  const phrase = normalizePhrase(n);
  return phrase.split(' ').length >= 2 && !isGenericPhrase(phrase) ? phrase : null;
};
const cjkKey = (n) => {
  if (!n || !hasCjk(n)) return null;
  const text = compactCjk(n);
  return text.length >= 4 ? text : null;
};

// MISP lists some institutions' subsidiaries as aliases (CAEP's alias list
// names its institutes). A name that another record carries as its own name
// stays only with that record; an alias two records share is removed from
// both, since it could not tell them apart. Mutates the records.
export function resolveNameCollisions(records) {
  const owners = new Map();
  const claim = (key, id, primary) => {
    if (!key) return;
    if (!owners.has(key)) owners.set(key, []);
    owners.get(key).push({ id, primary });
  };
  for (const r of records.values()) {
    claim(latinKey(r.name), r.id, true);
    for (const a of r.aliases ?? []) claim(latinKey(a), r.id, false);
    claim(cjkKey(r.zh), r.id, true);
    for (const z of r.zhAliases ?? []) claim(cjkKey(z), r.id, false);
  }
  const removed = [];
  for (const [key, claims] of owners) {
    const ids = [...new Set(claims.map((c) => c.id))];
    if (ids.length < 2) continue;
    const primaryOwners = [...new Set(claims.filter((c) => c.primary).map((c) => c.id))];
    const keeper = primaryOwners.length === 1 ? primaryOwners[0] : null;
    for (const id of ids) {
      if (id === keeper) continue;
      const r = records.get(id);
      const before = r.aliases.length + r.zhAliases.length;
      r.aliases = r.aliases.filter((a) => latinKey(a) !== key);
      r.zhAliases = r.zhAliases.filter((z) => cjkKey(z) !== key);
      if (r.aliases.length + r.zhAliases.length < before) removed.push(`"${key}" removed from ${id}${keeper ? ` (it is ${keeper}'s name)` : ''}`);
    }
  }
  return removed;
}

// ROR's "chosen" match can be a different body with a similar name (it chose
// the Chinese Academy of Engineering for CAEP), so a match must share a name
// with the record and must not contradict its Chinese name.
// Official Chinese names carry prefixes and suffixes that short forms drop
// (中国人民解放军国防科技大学 vs 国防科技大学), and older names spell words
// out (国防科学技术大学), so compare the cores and accept one whose characters
// appear in order within the other.
const zhCore = (s) =>
  compactCjk(s)
    .replace(/^(中国人民解放军|中国人民武装警察部队|中国)/, '')
    .replace(/(有限责任公司|有限公司|公司)$/, '');
const inOrder = (short, long) => {
  let at = 0;
  for (const ch of long) if (ch === short[at]) at++;
  return at === short.length;
};
const zhAgree = (a, b) => {
  const [x, y] = [zhCore(a), zhCore(b)];
  if (!x || !y) return false;
  return x.length <= y.length ? inOrder(x, y) : inOrder(y, x);
};

export function rorAgrees(record, e) {
  const recordNames = new Set([record.name, ...(record.aliases ?? [])].map((n) => normalizePhrase(n)).filter(Boolean));
  if (![e.display, ...(e.aliases ?? [])].filter(Boolean).some((n) => recordNames.has(normalizePhrase(n)))) return false;
  const ours = [record.zh, ...(record.zhAliases ?? [])].filter(Boolean);
  const theirs = [e.zh, ...(e.zhAliases ?? [])].filter(Boolean);
  if (ours.length && theirs.length && !ours.some((a) => theirs.some((b) => zhAgree(a, b)))) return false;
  return true;
}

export function rorToEnrichment(org) {
  const names = org.names ?? [];
  const zhNames = names.map((n) => n.value).filter(hasCjk);
  const loc = org.locations?.[0]?.geonames_details ?? {};
  return {
    ror: String(org.id).replace('https://ror.org/', ''),
    display: names.find((n) => n.types?.includes('ror_display'))?.value ?? null,
    zh: zhNames[0] ?? null,
    zhAliases: zhNames.slice(1),
    acronyms: names.filter((n) => n.types?.includes('acronym')).map((n) => n.value),
    aliases: names.filter((n) => !n.types?.includes('acronym') && !hasCjk(n.value)).map((n) => n.value),
    domains: (org.domains ?? []).map((d) => d.toLowerCase()),
    wikidata: org.external_ids?.find((x) => x.type === 'wikidata')?.all?.[0] ?? null,
    website: org.links?.find((l) => l.type === 'website')?.value ?? null,
    city: loc.name ?? null,
    province: loc.country_subdivision_name ?? null,
    countryCode: loc.country_code ?? null,
    lat: num(loc.lat),
    lng: num(loc.lng),
  };
}

export function mergeEnrichment(record, e) {
  const out = structuredClone(record);
  out.ids = { ...out.ids, ror: e.ror, ...(e.wikidata ? { wikidata: e.wikidata } : {}) };
  out.domains = unique([...out.domains, ...e.domains]);
  addNames(out, [e.zh, ...e.zhAliases, ...e.acronyms, ...e.aliases]);
  out.location = {
    city: out.location?.city ?? e.city,
    province: out.location?.province ?? e.province,
    lat: out.location?.lat ?? e.lat,
    lng: out.location?.lng ?? e.lng,
  };
  return out;
}
