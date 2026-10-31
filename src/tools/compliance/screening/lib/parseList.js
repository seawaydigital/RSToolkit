// Turns whatever a user pastes (a co-author list, an email signature block,
// rows copied from a spreadsheet, the list builder's own CSV) into structured
// screening rows: a name, what kind of entity it is, a country and a birth
// date. Runs in the browser and in Node tests; nothing here makes a request.
//
// The parser guesses, and says so: every row keeps the line it came from, and
// a row it is unsure about carries a flag the user can see and correct.
import { hasCjk, nfkc } from '../../defence-tracker/lib/normalize.js';
import { countryCode } from './countries.js';
import { csvRow } from '../../../../utils/csv.js';

export const MAX_ROWS = 500;

// OpenSanctions schemas. LegalEntity matches people and organizations alike,
// so it is the honest choice when the parser can't tell which a name is.
export const SCHEMAS = ['Person', 'Organization', 'LegalEntity'];
export const SCHEMA_LABELS = { Person: 'Person', Organization: 'Organization', LegalEntity: 'Either' };

export const FLAG_LABELS = {
  'check-type': 'Check type',
  'date-ambiguous': 'Date unclear',
  'country-unknown': 'Country not recognised',
};

const ORG_WORDS =
  /\b(universi\w*|univ|institut\w*|inst|academy|academia|acad|college|polytechnic|laborator(y|ies)|lab|labs|centre|center|school|faculty|department|dept|hospital|corporation|corp|company|co|ltd|limited|llc|inc|gmbh|plc|jsc|ojsc|pjsc|group|holdings?|bureau|ministry|agency|administration|council|foundation|society|association|commission|committee|authority|office|force|forces|army|navy|command|bank|enterprise|factory|plant|works|concern|organi[sz]ation|consortium|federation|service)\b\.?/i;

// Chinese and Japanese endings for an organization's name.
const CJK_ORG_ENDINGS = /(大学|大學|学院|學院|研究所|研究院|研究中心|中心|实验室|實驗室|公司|集团|集團|医院|醫院|科学院|科學院|学校|學校|部|局|委员会|委員會|基金会|協会|协会)$/;

// Parts of an affiliation that name a unit inside an institution ("School of
// Astronautics", "Dept. of Physics"). The institution itself is what gets
// screened, so these are dropped when a larger body follows them.
const UNIT_START = /^(school|faculty|department|dept|division|college|centre|center|laboratory|lab|key laboratory|state key laboratory|program|programme|graduate school|institute for|unit|section|group)\b/i;
const PARENT_WORDS = /\b(universi\w*|univ|academy|acad|polytechnic|corporation|corp|company|ltd|limited|group|ministry|hospital)\b/i;

const ABBREVIATIONS = [
  [/\bUniv\b\.?/gi, 'University'],
  [/\bInst\b\.?/gi, 'Institute'],
  [/\bTech\b\.?/gi, 'Technology'],
  [/\bTechnol\b\.?/gi, 'Technology'],
  [/\bAcad\b\.?/gi, 'Academy'],
  [/\bSci\b\.?/gi, 'Sciences'],
  [/\bNatl\b\.?/gi, 'National'],
  [/\bEng\b\.?/gi, 'Engineering'],
  [/\bAeronaut\b\.?/gi, 'Aeronautics'],
  [/\bAstronaut\b\.?/gi, 'Astronautics'],
  [/\bPolytech\b\.?/gi, 'Polytechnical'],
];

const TITLES = /^(dr|prof|professor|assoc\.? prof|asst\.? prof|mr|mrs|ms|mx|miss|sir|dame|rev|hon)\b\.?\s+/i;
const SUFFIXES = /,?\s+(ph\.?\s?d|m\.?d|m\.?sc|b\.?sc|p\.?eng|jr|sr|ii|iii|frs|frsc)\.?$/i;
const BULLET = /^\s*(?:[-*•·▪◦‣–—]|\d{1,4}[.)]|\(\d{1,4}\)|[a-z][.)](?=\s))\s*/i;
const EMAIL = /[A-Z0-9._%+-]+@([A-Z0-9-]+(?:\.[A-Z0-9-]+)+)/gi;
const ISO_DATE = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const SLASH_DATE = /\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/;
const BORN_YEAR = /\b(?:b\.|born|dob:?|date of birth:?)\s*(\d{4})\b/i;

const HEADER_ALIASES = {
  name: ['name', 'full name', 'entity', 'entity name', 'person', 'individual', 'researcher', 'author', 'co-author', 'coauthor', 'visitor', 'partner', 'organization name', 'organisation name'],
  first: ['first name', 'given name', 'first', 'given'],
  last: ['last name', 'surname', 'family name', 'last'],
  type: ['type', 'schema', 'kind', 'entity type', 'category'],
  country: ['country', 'nationality', 'citizenship', 'jurisdiction', 'country of residence'],
  birthDate: ['birth date', 'birth_date', 'birthdate', 'date of birth', 'dob', 'born'],
  note: ['note', 'notes', 'comment', 'comments'],
  org: ['organization', 'organisation', 'institution', 'affiliation', 'employer', 'university', 'company'],
};

const headerKey = (cell) => {
  const c = nfkc(cell).toLowerCase().replace(/[_\s]+/g, ' ').trim();
  return Object.keys(HEADER_ALIASES).find((k) => HEADER_ALIASES[k].includes(c));
};

// A delimited-text reader that understands quoted cells, including quoted
// line breaks, which is what spreadsheet apps produce when copying or saving.
export function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === delimiter) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

function parseDate(text) {
  let m = text.match(ISO_DATE);
  if (m) return { date: `${m[1]}-${m[2]}-${m[3]}`, rest: text.replace(m[0], ' ') };
  m = text.match(SLASH_DATE);
  if (m) {
    const [a, b, y] = [Number(m[1]), Number(m[2]), m[3]];
    const pad = (n) => String(n).padStart(2, '0');
    const rest = text.replace(m[0], ' ');
    if (a > 12 && b <= 12) return { date: `${y}-${pad(b)}-${pad(a)}`, rest };
    if (b > 12 && a <= 12) return { date: `${y}-${pad(a)}-${pad(b)}`, rest };
    if (a === b) return { date: `${y}-${pad(a)}-${pad(b)}`, rest };
    return { date: '', ambiguous: true, rest };
  }
  m = text.match(BORN_YEAR);
  if (m) return { date: m[1], rest: text.replace(m[0], ' ') };
  return { date: '', rest: text };
}

export function expandAbbreviations(name) {
  let out = name;
  for (const [re, full] of ABBREVIATIONS) out = out.replace(re, full);
  return out.replace(/\s{2,}/g, ' ').trim();
}

const tidy = (s) => s.replace(/\s{2,}/g, ' ').replace(/^[\s,;:.–—-]+|[\s,;:–—-]+$/g, '').trim();

export function isOrgName(s) {
  const t = nfkc(s).trim();
  if (hasCjk(t)) return CJK_ORG_ENDINGS.test(t.replace(/\s/g, ''));
  return ORG_WORDS.test(t);
}

// Two to four words of letters (hyphens and apostrophes allowed), or two to
// four Chinese characters with no organization ending.
export function isPersonName(s) {
  const t = nfkc(s).trim();
  if (!t || /\d/.test(t) || isOrgName(t)) return false;
  if (hasCjk(t)) return /^[\p{Script=Han}·]{2,4}$/u.test(t.replace(/\s/g, ''));
  const words = t.split(/\s+/);
  return words.length >= 2 && words.length <= 4 && words.every((w) => /^[\p{L}][\p{L}.'’-]*$/u.test(w));
}

// A Chinese name ending in 大学 (or an academy, company or group) is the
// parent; a 学院, 系 or 研究所 named after it is one of its schools or institutes.
const CJK_PARENT_ENDINGS = /(大学|大學|科学院|科學院|公司|集团|集團)$/;
const isUnit = (s) => (hasCjk(s) ? !CJK_PARENT_ENDINGS.test(s.replace(/\s/g, '')) : UNIT_START.test(s.trim()) && !PARENT_WORDS.test(s));
const looksLikeAddress = (s) => /\d/.test(s) && !isOrgName(s.replace(/\d+/g, ''));

function stripPersonName(s) {
  return tidy(s.replace(TITLES, '').replace(SUFFIXES, ''));
}

function makeRow(fields) {
  return { name: '', schema: 'LegalEntity', country: '', birthDate: '', flags: [], note: '', source: '', ...fields };
}

// One pasted line (or one ;-separated part of it) → zero or more rows.
function rowsFromText(text, source) {
  const notes = [];
  let work = nfkc(text).replace(BULLET, '');
  const domains = [...work.matchAll(EMAIL)].map((m) => m[1].toLowerCase());
  // Remove the address and the brackets it sat in ("Wei Zhang <wz@nudt.edu.cn>").
  work = work.replace(EMAIL, ' ').replace(/[<([]\s*[>)\]]/g, ' ');
  if (domains.length) notes.push(`email domain ${domains.join(', ')}`);

  const { date, ambiguous, rest } = parseDate(work);
  work = rest;

  // A bracketed country ("Moscow (Russia)") is lifted out before splitting.
  let country = '';
  work = work.replace(/\(([^()]+)\)/g, (whole, inner) => {
    const code = countryCode(inner);
    if (code && !country) { country = code; return ' '; }
    return whole;
  });

  // Chinese parts separated by spaces ("北京航空航天大学 宇航学院") are separate parts.
  let segments = work
    .split(/[,，、|]+/)
    .flatMap((seg) => (hasCjk(seg) && !/[A-Za-z]/.test(seg) ? seg.split(/\s+/) : [seg]))
    .map(tidy)
    .filter(Boolean);
  // Trailing countries ("…, Beijing, China") are the institution's country.
  while (segments.length > 1 && countryCode(segments[segments.length - 1])) {
    const code = countryCode(segments.pop());
    if (!country) country = code;
  }
  if (segments.length === 1 && !country) {
    const words = segments[0].split(/\s+/);
    const last = words.length > 1 && countryCode(words[words.length - 1]);
    if (last && isOrgName(words.slice(0, -1).join(' '))) { country = last; segments = [words.slice(0, -1).join(' ')]; }
  }
  if (!segments.length) return [];

  // "Zhang, Wei": surname, given name.
  if (segments.length === 2 && segments.every((s) => /^[\p{L}][\p{L}'’-]*$/u.test(s)) && !isOrgName(segments.join(' '))) {
    segments = [`${segments[1]} ${segments[0]}`];
  }

  const orgs = [];
  const people = [];
  const other = [];
  for (const seg of segments) {
    if (isOrgName(seg)) orgs.push(seg);
    else if (isPersonName(stripPersonName(seg))) people.push(stripPersonName(seg));
    else if (!looksLikeAddress(seg)) other.push(seg);
  }

  // Of the organization parts, screen the institution, not its school or
  // department: drop leading units when a larger body is also named.
  const parents = orgs.filter((o) => !isUnit(o));
  const screenOrgs = (parents.length ? parents : orgs.slice(-1)).map(expandAbbreviations);

  const rows = [];
  const note = notes.join('; ');
  const flags = ambiguous ? ['date-ambiguous'] : [];
  if (people.length) {
    const at = screenOrgs.length ? `at ${screenOrgs[0]}` : '';
    for (const name of people.slice(0, 1)) {
      rows.push(makeRow({ name, schema: 'Person', birthDate: date, flags, note: [at, note].filter(Boolean).join('; '), source }));
    }
  }
  for (const name of screenOrgs.slice(0, 1)) {
    rows.push(makeRow({ name, schema: 'Organization', country, flags: people.length ? [] : flags, note: people.length ? '' : note, source }));
  }
  if (!rows.length && other.length) {
    // Nothing recognisable: screen the first part as "either", flagged.
    const name = stripPersonName(other[0]);
    rows.push(makeRow({ name, schema: 'LegalEntity', country, birthDate: date, flags: ['check-type', ...flags], note, source }));
  }
  return rows;
}

function typeFromCell(cell) {
  const c = nfkc(cell).toLowerCase().trim();
  if (/^(person|individual|people|human|researcher|author|p)$/.test(c)) return 'Person';
  if (/^(organi[sz]ation|org|institution|company|entity|university|o)$/.test(c)) return 'Organization';
  if (/^(either|legalentity|unknown|any|)$/.test(c)) return 'LegalEntity';
  return null;
}

// Rows from a table with a recognised header row: the list builder's own
// CSV, or a spreadsheet with Name / Country / Date of birth columns.
function rowsFromTable(table) {
  const header = table[0].map(headerKey);
  const col = (k) => header.indexOf(k);
  const rows = [];
  for (const cells of table.slice(1)) {
    const get = (k) => (col(k) >= 0 ? cells[col(k)] ?? '' : '');
    const source = cells.join(', ');
    let name = get('name') || [get('first'), get('last')].filter(Boolean).join(' ');
    const org = get('org');
    const countryText = get('country');
    const country = countryCode(countryText);
    const flags = [];
    let note = [get('note'), countryText && !country ? `country: ${countryText}` : ''].filter(Boolean).join('; ');
    if (countryText && !country) flags.push('country-unknown');
    let birthDate = '';
    if (get('birthDate')) {
      const d = parseDate(get('birthDate'));
      birthDate = d.date || (/^\d{4}(-\d{2})?$/.test(get('birthDate')) ? get('birthDate') : '');
      if (d.ambiguous) flags.push('date-ambiguous');
    }
    let schema = typeFromCell(get('type'));
    if (!name && org) {
      name = org;
      schema = schema ?? 'Organization';
    }
    if (!name) continue;
    name = tidy(name);
    if (!schema || (schema === 'LegalEntity' && !get('type'))) {
      schema = isOrgName(name) ? 'Organization' : isPersonName(stripPersonName(name)) ? 'Person' : 'LegalEntity';
      if (schema === 'LegalEntity') flags.push('check-type');
    }
    if (schema === 'Person') name = stripPersonName(name);
    else if (schema === 'Organization') name = expandAbbreviations(name);
    if (schema === 'Person' && org) note = [`at ${org}`, note].filter(Boolean).join('; ');
    rows.push(makeRow({ name, schema, country, birthDate: schema === 'Organization' ? '' : birthDate, flags, note, source }));
    if (schema === 'Person' && org) {
      rows.push(makeRow({ name: expandAbbreviations(tidy(org)), schema: 'Organization', source }));
    }
  }
  return rows;
}

function detectTable(lines) {
  const first = lines[0] ?? '';
  const delimiter = first.includes('\t') ? '\t' : first.includes(',') ? ',' : null;
  if (!delimiter) return null;
  const header = parseDelimited(first, delimiter)[0] ?? [];
  const keys = header.map(headerKey);
  const known = keys.filter(Boolean).length;
  const hasName = keys.includes('name') || keys.includes('org') || (keys.includes('first') && keys.includes('last'));
  return hasName && known >= Math.ceil(header.length / 2) ? delimiter : null;
}

const dedupeKey = (r) => [r.schema, nfkc(r.name).toLowerCase().replace(/\s+/g, ' '), r.country, r.birthDate].join('|');

// The whole paste → { rows, truncated, totalRows, skipped }. `skipped` lists
// lines that gave no name to screen (an email address on its own, say), so
// the page can show them instead of silently losing them.
export function parseList(text) {
  const clean = nfkc(text ?? '').replace(/\r\n?/g, '\n');
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], truncated: false, totalRows: 0, skipped: [] };

  const skipped = [];
  let parsed = [];
  const delimiter = detectTable(lines);
  if (delimiter) {
    parsed = rowsFromTable(parseDelimited(clean, delimiter));
  } else {
    for (const line of lines) {
      const parts = line.split(/[;；]+/).map((p) => p.trim()).filter(Boolean);
      const before = parsed.length;
      for (const part of parts) parsed.push(...rowsFromText(part, line));
      if (parsed.length === before) skipped.push(line);
    }
  }

  const seen = new Map();
  const rows = [];
  for (const r of parsed) {
    if (!r.name) continue;
    const k = dedupeKey(r);
    if (seen.has(k)) continue;
    seen.set(k, true);
    rows.push(r);
  }
  return {
    rows: rows.slice(0, MAX_ROWS).map((r, i) => ({ ...r, id: `r${i + 1}` })),
    truncated: rows.length > MAX_ROWS,
    totalRows: rows.length,
    skipped,
  };
}

// The list builder's canonical CSV: what it downloads, and what parseList
// reads back in without guessing.
export const LIST_COLUMNS = ['name', 'type', 'country', 'birth_date', 'note'];
const TYPE_OUT = { Person: 'person', Organization: 'organization', LegalEntity: 'either' };

export function rowsToCsv(rows) {
  const body = rows.map((r) => csvRow([r.name, TYPE_OUT[r.schema], r.country, r.birthDate, r.note]));
  return `${[csvRow(LIST_COLUMNS), ...body].join('\r\n')}\r\n`;
}
