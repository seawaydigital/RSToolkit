// Shape rules for tracker institution files and listing snapshots. The data
// tests run validateRecord over every file, and the maintenance scripts run it
// before they write, so a malformed record never reaches the site.
import { hasCjk } from './normalize.js';
import { ANNEX_B, INSTITUTION_TYPES, LISTS, RATING_ORDER, RESERVED_SLUGS, SIGNALS, SNAPSHOT_NAMES, STATUSES } from './constants.js';

export const RECORD_KEY_ORDER = [
  'id', 'name', 'zh', 'zhAliases', 'aliases', 'acronyms', 'domains', 'country', 'type', 'location',
  'supervisors', 'parent', 'ids', 'evidence', 'topics', 'subunits', 'sources', 'rating', 'status',
  'verifiedOn', 'history', 'seedNotes',
];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ROR = /^0[a-z0-9]{6}[0-9]{2}$/;
const HOST = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/;
const PUBLIC_SUFFIXES = new Set(['cn', 'edu.cn', 'ac.cn', 'com.cn', 'gov.cn', 'org.cn', 'ru', 'ac.ru', 'ir', 'ac.ir', 'com', 'org', 'net', 'edu']);

const isDate = (s) => typeof s === 'string' && DATE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const isHttpUrl = (s) => typeof s === 'string' && /^https?:\/\/\S+$/.test(s);
const todayIso = () => new Date().toISOString().slice(0, 10);
const arr = (v) => (Array.isArray(v) ? v : []);

export function slugify(name) {
  const slug = String(name ?? '')
    .normalize('NFKC')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return slug || 'institution';
}

export function orderRecordKeys(record) {
  const ordered = {};
  for (const k of RECORD_KEY_ORDER) if (k in record) ordered[k] = record[k];
  for (const k of Object.keys(record)) if (!(k in ordered)) ordered[k] = record[k];
  return ordered;
}

export function validateRecord(record) {
  const errors = [];
  const err = (msg) => errors.push(`${record?.id ?? '(no id)'}: ${msg}`);

  if (typeof record.id !== 'string' || !SLUG.test(record.id)) err('id must be lowercase kebab-case');
  else if (RESERVED_SLUGS.includes(record.id)) err(`id "${record.id}" is reserved for a tracker view`);
  if (typeof record.name !== 'string' || !record.name.trim()) err('name is required');
  if (!STATUSES.includes(record.status)) err(`status must be one of ${STATUSES.join(', ')}`);
  if (!(record.type in INSTITUTION_TYPES)) err(`type must be one of ${Object.keys(INSTITUTION_TYPES).join(', ')}`);
  for (const k of Object.keys(record)) if (!RECORD_KEY_ORDER.includes(k)) err(`unknown field "${k}"`);
  if (record.country != null && !/^[A-Z]{2}$/.test(record.country)) err('country must be a two-letter code');
  if (record.zh != null && !hasCjk(record.zh)) err('zh must be a Chinese name');
  if (record.parent != null && !SLUG.test(record.parent)) err('parent must be a record id');
  // Names are shown, searched and matched, so a stray "null" or a trailing
  // comma from an import would match lines it has nothing to do with.
  for (const field of ['aliases', 'zhAliases', 'acronyms']) {
    const bad = arr(record[field]).filter((n) => typeof n !== 'string' || !n.trim() || n !== n.trim() || /^(null|undefined)$/i.test(n) || /[,;:]$/.test(n));
    if (bad.length) err(`${field} has empty, placeholder or badly trimmed names: ${JSON.stringify(bad)}`);
  }

  const loc = record.location;
  if (loc != null && (typeof loc !== 'object' || (loc.lat != null && Math.abs(loc.lat) > 90) || (loc.lng != null && Math.abs(loc.lng) > 180))) {
    err('location must be { city, province, lat, lng } with valid coordinates');
  }

  for (const d of arr(record.domains)) {
    if (typeof d !== 'string' || d !== d.toLowerCase() || !HOST.test(d)) err(`domain "${d}" must be a lowercase hostname`);
    else if (PUBLIC_SUFFIXES.has(d)) err(`domain "${d}" is a public suffix, not an institution`);
  }
  if (record.ids?.ror != null && !ROR.test(record.ids.ror)) err(`ids.ror "${record.ids.ror}" is not a ROR id`);
  if (record.ids?.nroAlso != null && !(Array.isArray(record.ids.nroAlso) && record.ids.nroAlso.every((id) => SLUG.test(id)))) {
    err('ids.nroAlso must be a list of NRO ids');
  }

  const override = record.rating?.override ?? null;
  if (override !== null && !RATING_ORDER.includes(override)) err(`rating.override must be one of ${RATING_ORDER.join(', ')}`);

  const verified = record.status === 'verified';
  const evidence = arr(record.evidence);
  if (!verified) {
    if (evidence.length) err('unverified records must not carry evidence (seed facts belong in seedNotes)');
    if (record.verifiedOn != null) err('unverified records must not have verifiedOn');
  } else if (!isDate(record.verifiedOn) || record.verifiedOn > todayIso()) {
    err('verified records need a verifiedOn date that is not in the future');
  }

  const sources = arr(record.sources);
  const sourceIds = new Set(sources.map((s) => s.id));
  for (const s of sources) {
    if (!s.id || !s.title) err('every source needs an id and a title');
    if (!isHttpUrl(s.url)) err(`source "${s.id}" needs an http(s) url`);
    if (!isDate(s.accessed)) err(`source "${s.id}" needs an accessed date`);
    if (verified && !isHttpUrl(s.archive?.url) && !(typeof s.archive?.unavailable === 'string' && s.archive.unavailable.trim())) {
      err(`source "${s.id}" needs an archive url or an archive.unavailable reason`);
    }
  }
  for (const e of evidence) {
    if (!SIGNALS[e.signal]) err(`evidence signal "${e.signal}" is not a known signal`);
    if (typeof e.summary !== 'string' || !e.summary.trim()) err(`evidence "${e.signal}" needs a summary`);
    if (!arr(e.annexB).every((q) => q in ANNEX_B)) err(`evidence "${e.signal}" has an unknown Annex B question`);
    if (!arr(e.sources).length || !arr(e.sources).every((id) => sourceIds.has(id))) err(`evidence "${e.signal}" must cite existing sources`);
  }
  for (const h of arr(record.history)) if (!isDate(h.date) || !h.change) err('history entries need a date and a change');
  return errors;
}

export function validateSnapshot(snapshot) {
  const errors = [];
  const name = snapshot?.snapshot;
  if (!SNAPSHOT_NAMES.includes(name)) errors.push(`snapshot must be one of ${SNAPSHOT_NAMES.join(', ')}`);
  if (!['complete', 'pending'].includes(snapshot?.coverage)) errors.push(`${name}: coverage must be complete or pending`);
  if (snapshot?.checkedOn != null && !isDate(snapshot.checkedOn)) errors.push(`${name}: checkedOn must be a date or null`);
  const lists = new Set(LISTS.filter((l) => l.snapshot === name).map((l) => l.id));
  const keys = new Set();
  for (const e of arr(snapshot?.entries)) {
    if (!e.key || keys.has(e.key)) errors.push(`${name}: entry keys must be present and unique (${e.key})`);
    keys.add(e.key);
    if (!lists.has(e.list)) errors.push(`${name}: entry ${e.key} has list "${e.list}", which is not in this snapshot`);
    if (!e.name) errors.push(`${name}: entry ${e.key} needs a name`);
    if (e.institution != null && !SLUG.test(e.institution)) errors.push(`${name}: entry ${e.key} has an invalid institution id`);
    if (e.date != null && !isDate(e.date)) errors.push(`${name}: entry ${e.key} has an invalid date`);
  }
  return errors;
}
