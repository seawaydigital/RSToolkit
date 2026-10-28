// Pure helpers for the official-list sync: turning the US Consolidated
// Screening List, Canada's sanctions XML and the NRO page into listing
// entries, and mapping each entry to a tracker record.
import { isGenericPhrase, normalizePhrase } from '../../../src/tools/compliance/defence-tracker/lib/normalize.js';
import { slugify } from '../../../src/tools/compliance/defence-tracker/lib/schema.js';
import { RESERVED_SLUGS } from '../../../src/tools/compliance/defence-tracker/lib/constants.js';

export const CSL_URL = 'https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.json';
export const CA_SANCTIONS_URL =
  'https://www.international.gc.ca/world-monde/assets/office_docs/international_relations-relations_internationales/sanctions/sema-lmes.xml';
export const CA_SANCTIONS_PAGE =
  'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx?lang=eng';
export const NRO_PAGE =
  'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations';

const CSL_LISTS = {
  'Entity List (EL) - Bureau of Industry and Security': 'us-entity-list',
  'Military End User (MEU) List - Bureau of Industry and Security': 'us-meu',
  'Specially Designated Nationals (SDN) - Treasury Department': 'us-sdn',
};
const COUNTRIES = new Set(['CN', 'RU', 'IR']);
const CA_COUNTRIES = { China: 'CN', Russia: 'RU', Iran: 'IR' };

// National supercomputing centres are research facilities whose names carry
// no research word ("National Supercomputing Center Wuxi").
const RESEARCH = /universit|institute|academy|college|laborator|research|polytechnic|scientific|school of|science and technology|design department|supercomput/i;
const COMMERCIAL = /\b(co\.?,?\s*ltd|company|limited|llc|trading|import|export|bank|group|corporation|holding|plant|factory|zavod)\b/i;
const STRONG_RESEARCH = /universit|research institute|academy of|institute of/i;
// A group's unit named after the group ("Aviation Industry Corporation of
// China 612 Institute", "CASC 8th Academy"): the last words say what it is.
// Not laboratories: "… Eluent Laboratories" with a company form is a company.
const RESEARCH_UNIT = /\b(institute|academy|design department)$/i;

// Rows of the US screening-list feed that the eCFR's Entity List shows are
// broken: they give the CASC 1st Academy 702nd Research Institute's name the
// 12th Research Institute's aliases (BICD), which the eCFR gives the 12th.
const CSL_FEED_ERRORS = new Set([
  'dcca14daa426b77552ceeaef87d7158bb85ab5f62e2d6efb15059a39',
  'ef74bd67d0b0b8b8c2dab900486ab40ec9338085b90ffc0aa08ddddb',
]);

// Rows whose name is cut short: each carries exactly the aliases of a row on
// the same list whose name continues it, so it is that row again. The feed
// repeats the CASC 9th Academy 13th Research Institute as "China Aerospace
// Science and Technology Corporation (CASC)", which would list CASC itself;
// the copy's id changes between downloads.
function cutShortRows(rows) {
  const byAliases = new Map();
  for (const r of rows) {
    const aliases = [...new Set((r.alt_names ?? []).map(normalizePhrase))].sort().join('|');
    if (!aliases) continue;
    const k = `${r.source}\t${aliases}`;
    if (!byAliases.has(k)) byAliases.set(k, []);
    byAliases.get(k).push({ id: r.id, name: normalizePhrase(r.name) });
  }
  const cut = new Set();
  for (const group of byAliases.values()) {
    for (const r of group) if (group.some((s) => s.name.startsWith(`${r.name} `))) cut.add(r.id);
  }
  return cut;
}

const unique = (list) => [...new Set(list.filter(Boolean))];
const tidy = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

export function decodeEntities(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

// Judged on an entry's main name only: alternative names on these lists are
// loose enough that banks and manufacturers carry "institute" aliases.
export function isResearchBody(name) {
  const n = String(name ?? '');
  if (!RESEARCH.test(n)) return false;
  const bare = n.replace(/\s*\([^)]*\)/g, '').replace(/[\s.,;]+$/, '');
  return !COMMERCIAL.test(n) || STRONG_RESEARCH.test(n) || RESEARCH_UNIT.test(bare);
}

const sameCountry = (a, b) => !a || !b || a === b;

// Whether a list's main name for an entry is the name of a record the tracker
// already holds in that country, compared the way assignInstitutions compares
// names. Alternative names don't count: the US list gives CETC 38's
// subsidiary companies the institute's own aliases.
function namesRecord(index, countryOf) {
  if (!index) return () => false;
  return (name, country) =>
    entryKeys({ name }, { distinctive: true }).some(({ key }) => [...(index.phrases.get(key) ?? [])].some((id) => sameCountry(countryOf(id), country)));
}

// The records the known-name test may trust: files and NRO organizations,
// records on a hand-kept list, and records some list entry names as a
// research body. A record made only by an entry the known-name test kept is
// left out, so an entry can't keep itself once the rules change.
const GENERATED_SNAPSHOTS = new Set(['us-csl', 'ca-sanctions']);
export function recordsHeldApart(records, snapshots) {
  const held = new Set(records.filter((r) => !r.virtual || r.ids?.nro).map((r) => r.id));
  for (const [name, snapshot] of Object.entries(snapshots)) {
    for (const e of snapshot.entries ?? []) if (e.institution && (!GENERATED_SNAPSHOTS.has(name) || isResearchBody(e.name))) held.add(e.institution);
  }
  return records.filter((r) => held.has(r.id));
}

// An entry is kept when its main name reads as a research body, or is a body
// the tracker already holds (CAEP's trading companies are on Canada's NRO
// list), so no record reads "Not listed" for a list that names it. For the
// second test, pass `index`, a match index of recordsHeldApart, and `countryOf`.
export function cslToEntries(results, { index = null, countryOf = () => null } = {}) {
  const known = namesRecord(index, countryOf);
  const rows = results
    .map((r) => ({ r, list: CSL_LISTS[r.source], country: (r.addresses ?? []).map((a) => a.country).find((c) => COUNTRIES.has(c)) }))
    .filter(({ r, list, country }) => list && country && !CSL_FEED_ERRORS.has(r.id));
  const cut = cutShortRows(rows.map(({ r }) => r));
  const out = [];
  for (const { r, list, country } of rows) {
    if (cut.has(r.id)) continue;
    if (!isResearchBody(r.name) && !known(r.name, country)) continue;
    out.push({
      key: `csl:${r.id}`,
      list,
      name: tidy(r.name),
      altNames: unique((r.alt_names ?? []).map(tidy)).filter((n) => n !== tidy(r.name)),
      country,
      date: r.start_date || null,
      citation: r.federal_register_notice || (r.programs ?? []).join('; ') || null,
      url: r.source_information_url || r.source_list_url || null,
      institution: null,
    });
  }
  return out;
}

export function parseCaSanctionsXml(xml) {
  return [...String(xml).matchAll(/<record>([\s\S]*?)<\/record>/g)].map(([, body]) => {
    const f = {};
    for (const [, tag, value] of body.matchAll(/<([A-Za-z-]+)>([\s\S]*?)<\/\1>/g)) f[tag] = decodeEntities(value.trim());
    return {
      country: f['Country-Pays'] ?? null,
      entity: f['EntityOrShip-EntiteOuNavire'] ?? null,
      aliases: f['Aliases-Alias'] ?? null,
      schedule: f['Schedule-Annexe'] ?? null,
      item: f['Item-NumeroDarticle'] ?? null,
      date: f['DateOfListing-DateDinscription'] ?? null,
    };
  });
}

// Aliases are free text: "Russian: <name> or <abbreviation>".
function splitCaAliases(text) {
  if (!text) return [];
  return text
    .split(/;|\bor\b/)
    .map((s) => s.replace(/^\s*(Russian|Chinese|Persian|Farsi|Belarusian|Ukrainian|English|French)\s*:\s*/i, '').replace(/[()]/g, ' '))
    .map(tidy)
    .filter((s) => s.length >= 2);
}

// Kept on the same terms as the US entries (see cslToEntries).
export function caToEntries(rows, { index = null, countryOf = () => null } = {}) {
  const known = namesRecord(index, countryOf);
  const out = [];
  for (const r of rows) {
    const countryEn = String(r.country ?? '').split('/')[0].trim();
    const country = CA_COUNTRIES[countryEn];
    if (!r.entity || !country) continue;
    // Names are bilingual: "English name/Nom français".
    const [english, ...french] = r.entity.split('/').map(tidy);
    const altNames = unique([...french, ...splitCaAliases(r.aliases)]).filter((n) => n !== english);
    if (!isResearchBody(english) && !known(english, country)) continue;
    out.push({
      key: `ca:${countryEn}:${r.schedule}:${r.item}`,
      list: 'ca-sanctions',
      name: english,
      altNames,
      country,
      date: r.date || null,
      citation: `Schedule ${r.schedule}, item ${r.item}`,
      url: CA_SANCTIONS_PAGE,
      institution: null,
    });
  }
  return out;
}

export function parseNroPage(html) {
  return [...String(html).matchAll(/<li>\s*<strong>([^<]+)<\/strong>/g)].map((m) => tidy(decodeEntities(m[1])));
}

// Compares the live NRO page with src/data/nroData.js. Any NRO data entry
// (including CAEP units split out for map pins) can account for a page name,
// and a page name the markup cuts short still counts as present.
export function compareNroNames(liveNames, orgs) {
  const live = liveNames.map((n) => [normalizePhrase(n), n]);
  const ours = orgs.map((o) => [normalizePhrase(o.name), o]);
  const covers = (a, b) => a === b || a.startsWith(`${b} `);
  return [
    ...live.filter(([k]) => !ours.some(([o]) => covers(o, k))).map(([, n]) => `On the NRO page but not in nroData.js: ${sanitizeForIssue(n)}`),
    ...ours
      .filter(([o, org]) => !org.parentOrg && !live.some(([k]) => covers(o, k)))
      .map(([, org]) => `In nroData.js but not on the NRO page: ${sanitizeForIssue(org.name)}`),
  ];
}

function uniqueSlug(base, taken) {
  let slug = base;
  for (let n = 2; taken.has(slug) || RESERVED_SLUGS.includes(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// An entry joins an existing record only on an exact name match in the same
// country. A listed unit ("Harbin Institute of Technology Shenzhen Research
// Institute") gets its own record, so its parent is not shown as listed.
// `known` carries names created earlier in this sync across lists.
// Comparable forms of an entry's names, with and without bracketed parts
// ("… Experimental Physics (VNIIEF)"). Only names of two or more words can
// identify an institution; `distinctive` also drops generic ones. A key from
// the entry's main name is marked primary.
function entryKeys(e, { distinctive }) {
  const keys = new Map();
  [e.name, ...(e.altNames ?? [])].forEach((n, i) => {
    for (const variant of [n, String(n).replace(/\s*\([^)]*\)/g, ' ')]) {
      const phrase = normalizePhrase(variant);
      if (phrase.split(' ').length < 2 || (distinctive && isGenericPhrase(phrase))) continue;
      keys.set(phrase, keys.get(phrase) || i === 0);
    }
  });
  return [...keys].map(([key, primary]) => ({ key, primary }));
}

const finder = (aliases) => (id) => {
  let x = id;
  for (let hops = 0; aliases.has(x) && hops < 100; hops++) x = aliases.get(x);
  return x;
};

export function resolveInstitutionAliases(entries, aliases) {
  const find = finder(aliases);
  return entries.map((e) => (e.institution ? { ...e, institution: find(e.institution) } : e));
}

// Entries link to a record this sync created when a main name is involved on
// at least one side; an alias two entries merely share (the Entity List gives
// two Kurchatov institutes the same one) does not make them one institution.
// When an entry links two such records, the later is folded into the earlier
// (`aliases`). Records that existed before the sync are never merged. Pass
// the same `known`, `aliases` and `createdIds` to every call in a sync.
export function assignInstitutions(
  entries,
  { previous = [], index, takenIds = new Set(), countryOf = () => null, known = new Map(), aliases = new Map(), createdIds = new Set() },
) {
  const find = finder(aliases);
  const byKey = new Map(previous.map((p) => [p.key, p]));
  const byName = new Map();
  for (const p of previous.filter((x) => x.institution)) {
    for (const { key, primary } of entryKeys(p, { distinctive: true })) if (primary) byName.set(key, p.institution);
  }
  const taken = new Set(takenIds);
  const createdHere = [];

  const out = entries.map((e) => {
    const exactKeys = entryKeys(e, { distinctive: false });
    const keys = entryKeys(e, { distinctive: true });
    let institution = byKey.get(e.key)?.institution ?? keys.filter((k) => k.primary).map((k) => byName.get(k.key)).find(Boolean) ?? null;
    for (const { key } of exactKeys) {
      if (institution) break;
      const ids = [...(index.phrases.get(key) ?? [])].filter((id) => sameCountry(countryOf(id), e.country));
      if (ids.length === 1) institution = ids[0];
    }
    const hits = [
      ...new Set(
        keys
          .map(({ key, primary }) => ({ hit: known.get(key), primary }))
          .filter(({ hit, primary }) => hit && (primary || hit.primary) && sameCountry(hit.country, e.country))
          .map(({ hit }) => find(hit.id)),
      ),
    ];
    institution = institution ? find(institution) : (hits.find((id) => !createdIds.has(id)) ?? hits[0] ?? null);
    if (institution) {
      for (const h of hits) if (h !== institution && createdIds.has(h)) aliases.set(h, institution);
    } else {
      institution = uniqueSlug(slugify(e.name), taken);
      taken.add(institution);
      createdIds.add(institution);
      createdHere.push(institution);
    }
    for (const { key, primary } of keys) {
      const prev = known.get(key);
      if (!prev || (primary && !prev.primary)) known.set(key, { id: institution, country: e.country ?? null, primary });
    }
    return { ...e, institution };
  });
  const created = [...new Set(createdHere.map(find))].filter((id) => !aliases.has(id));
  return { entries: resolveInstitutionAliases(out, aliases), created };
}

const fileName = (url) => String(url).split(/[?#]/)[0].split('/').pop().toLowerCase();

// The files a hand-kept list's page links that are neither the edition entered
// in the snapshot (`file`) nor a known copy of it (`alternateFiles`). Compared
// by file name, since pages link the same file over http, https or a relative
// path. The snapshot's `sourceUrl` is the list's page, not a file.
export function unknownListFiles(links, snapshot) {
  const known = new Set([snapshot?.file, ...(snapshot?.alternateFiles ?? [])].filter(Boolean).map(fileName));
  return links.filter((link) => !known.has(fileName(link)));
}

export function diffEntries(before, after) {
  const was = new Map(before.map((e) => [e.key, e]));
  const now = new Set(after.map((e) => e.key));
  const fields = ['name', 'list', 'date', 'citation'];
  return {
    added: after.filter((e) => !was.has(e.key)),
    removed: before.filter((e) => !now.has(e.key)),
    changed: after.filter((e) => was.has(e.key) && fields.some((f) => (was.get(e.key)[f] ?? null) !== (e[f] ?? null))),
  };
}

// For text that ends up in a GitHub issue: a code span, so a name or message
// from outside the repository can't mention anyone (@) or link elsewhere.
export const sanitizeForIssue = (s) => `\`${String(s).replace(/`/g, "'").replace(/@/g, '')}\``;
const entryLine = (e) => {
  const details = [e.list, e.date, e.citation].filter(Boolean).join(', ');
  return `${sanitizeForIssue(e.name)}${details ? ` (${sanitizeForIssue(details)})` : ''} → ${sanitizeForIssue(e.institution ?? 'unmapped')}`;
};

export function renderSyncReport(sections, failures = []) {
  const lines = [];
  for (const s of sections) {
    const parts = [
      ['Added', s.added ?? [], entryLine],
      ['Removed', s.removed ?? [], entryLine],
      ['Changed', s.changed ?? [], entryLine],
      ['New listing-only records', s.created ?? [], sanitizeForIssue],
      ['Notes', s.notes ?? [], String],
    ].filter(([, items]) => items.length);
    if (!parts.length) continue;
    lines.push(`### ${s.title}`);
    for (const [label, items, fmt] of parts) {
      lines.push(`- ${label} (${items.length}):`);
      for (const item of items.slice(0, 200)) lines.push(`  - ${fmt(item)}`);
      if (items.length > 200) lines.push(`  - …and ${items.length - 200} more`);
    }
  }
  if (failures.length) lines.push("### Couldn't check", ...failures.map((f) => `- ${sanitizeForIssue(f)}`));
  return lines.join('\n');
}
