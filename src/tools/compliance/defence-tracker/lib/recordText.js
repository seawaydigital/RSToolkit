// Text the tracker hands to a research security file: the copied institution
// record (it has to stand on its own if the link ever breaks), batch-check
// tables in CSV, tab-separated and HTML form, the dated search line, and the
// open-data export.
import { LISTS, LIST_SHORT_LABELS, NOT_RATED_LABEL, RATING_LABELS, SIGNALS } from './constants.js';
import { RUBRIC_VERSION } from './rubric.js';
import { csvCell, neutralise } from '../../../../utils/csv.js';

export const BATCH_COLUMNS = ['Your text', 'Match', 'Matched by', 'Confidence', 'Rating', 'NRO', 'Other lists', 'Profile'];

export const DISCLAIMER =
  'This is institution-level information. Affiliation with a listed institution is not evidence of wrongdoing by an individual. Not legal advice; the official lists prevail.';

export const MATCHED_BY_LABELS = {
  domain: 'Email or web domain',
  'chinese-name': 'Chinese name',
  name: 'Name',
  acronym: 'Acronym',
  'similar-name': 'Similar name',
  unit: 'Unit name',
};

// How a match was made, naming the unit when a line matched through one
// ("Unit: Xijing Hospital").
export function matchedByLabel(m) {
  if (m.matchedBy === 'unit' && m.unit) return `Unit: ${m.unit}`;
  return MATCHED_BY_LABELS[m.matchedBy] ?? m.matchedBy;
}

const CA_SANCTIONS_NOTE =
  'Canada lists this institution under its sanctions regulations. Prohibitions are activity-specific and cover direct or indirect dealings; check the specific activity with Global Affairs Canada before engaging.';
const US_SDN_NOTE =
  "The US Treasury lists this institution as a Specially Designated National. US sanctions can apply when US persons, US funding or US-origin items are involved, and Canadian sanctions may also apply; check the specific activity with Global Affairs Canada and your institution's research security office before engaging.";

const listed = (record, listId) => record.listings?.some((l) => l.listId === listId && l.status === 'listed');

export const UNITS_NOTE =
  'These units are listed in their own right; the listings above are for the institution as a whole. Check whether the work involves a listed unit.';

export function sanctionsNotes(record) {
  return [listed(record, 'ca-sanctions') && CA_SANCTIONS_NOTE, listed(record, 'us-sdn') && US_SDN_NOTE].filter(Boolean);
}

export function ratingLabel(record) {
  const a = record.assessment;
  if (!a?.rating) return NOT_RATED_LABEL;
  return a.basis === 'lists' ? `${RATING_LABELS[a.rating]} (from official lists)` : RATING_LABELS[a.rating];
}

const RATING_BASIS_LABELS = { lists: 'official lists', profile: 'researched profile' };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : String(iso);
}

const joinWords = (words) => (words.length < 3 ? words.join(' and ') : `${words.slice(0, -1).join(', ')}, and ${words.at(-1)}`);

// US Treasury sanctions program codes, as OFAC names them.
const SDN_PROGRAMS = {
  NPWMD: 'non-proliferation of weapons of mass destruction',
  IFSR: 'Iranian financial sanctions',
  IRGC: 'Islamic Revolutionary Guard Corps',
  SDGT: 'counter-terrorism',
  IRAN: 'Iran',
  'IRAN-HR': 'Iran human rights',
  'HRIT-IR': 'Iran human rights and technology',
  'RUSSIA-EO14024': 'Russia harmful foreign activities',
  'UKRAINE-EO13660': 'Ukraine-related',
  'UKRAINE-EO13661': 'Ukraine-related',
  'UKRAINE-EO13662': 'Ukraine-related',
  'UKRAINE-EO13685': 'Crimea-related',
  'CAATSA - RUSSIA': 'Russia (CAATSA)',
  CYBER2: 'malicious cyber activity',
  CYBER3: 'malicious cyber activity',
  'ELECTION-EO13848': 'election interference',
  DPRK2: 'North Korea',
  DPRK3: 'North Korea',
};

// A Commerce listing's own notice, through GovInfo's Federal Register
// citation link, which opens the official notice at the cited page.
const federalRegisterUrl = (citation) => {
  const m = String(citation ?? '').match(/(\d+)\s*FR\s*(\d+)/);
  return m ? `https://www.govinfo.gov/link/fr/${m[1]}/${m[2]}` : null;
};

const FEDERAL_REGISTER_LISTS = new Set(['us-entity-list', 'us-meu']);
const frCitations = (citation) => [...String(citation ?? '').matchAll(/(\d+)\s*FR\s*(\d+)/g)];
// Federal Register volume 1 is 1936, so a notice from year Y is in volume Y - 1935.
const citationFitsDate = (e) => frCitations(e.citation).some((m) => Number(m[1]) === Number(String(e.date).slice(0, 4)) - 1935);

// Listing entries as the tracker shows them. The US screening list repeats
// some entries once per address, and a copy's citation can carry the wrong
// volume (84 FR 37423 for 83 FR 37423), so of entries sharing a name and date
// only those whose citation fits the date are kept. Citations keep their
// well-formed "NN FR NNNNN" parts; fragments such as "88 FR" and stray dates
// are dropped. The open-data export keeps the entries as published.
export function displayEntries(listId, entries = []) {
  if (!FEDERAL_REGISTER_LISTS.has(listId)) return entries;
  const seen = new Set();
  return entries
    .filter((e) => citationFitsDate(e) || !entries.some((o) => o !== e && o.name === e.name && o.date === e.date && citationFitsDate(o)))
    .map((e) => {
      const cites = frCitations(e.citation).map((m) => `${m[1]} FR ${m[2]}`);
      return { ...e, citation: cites.length ? cites.join('; ') : e.citation };
    })
    .filter((e) => {
      const key = `${e.name}|${e.date}|${e.citation}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// Each piece of evidence names its official source in words (`source`), so a
// link to it can say where it goes.
function entryEvidence(listId, e) {
  const cite = e.citation ? ` (${String(e.citation).replace(/\s+/g, ' ')})` : '';
  const on = e.date ? ` on ${formatDate(e.date)}` : '';
  // Listed through a parent's entry that gives the unit's name as an alias.
  const asAlias = e.alias ? ` as an alias in the entry for “${e.name}”` : '';
  switch (listId) {
    case 'ca-nro':
      return { text: 'Canada names it on its list of Named Research Organizations, which the STRAC policy uses.', url: e.url, source: 'NRO list' };
    case 'ca-sanctions': {
      const country = String(e.key ?? '').split(':')[1];
      const regulation = country ? `the Special Economic Measures (${country}) Regulations` : "Canada's autonomous sanctions regulations";
      return {
        text: `Canada lists it under ${regulation}${asAlias}${cite}${e.date ? ` since ${formatDate(e.date)}` : ''}.`,
        url: e.url,
        source: 'Canadian sanctions list',
      };
    }
    case 'us-entity-list':
    case 'us-meu': {
      const list = listId === 'us-meu' ? 'Military End-User List' : 'Entity List';
      const notice = federalRegisterUrl(e.citation);
      return {
        text: e.alias
          ? `The US Commerce Department's ${list} names it${asAlias}${on ? `, added${on}` : ''}${cite}.`
          : `The US Commerce Department added it to the ${list}${on}${cite}.`,
        url: notice ?? e.url,
        source: notice ? 'Federal Register notice' : `${list} guidance`,
      };
    }
    case 'us-sdn': {
      const programs = String(e.citation ?? '').split(/;\s*/).filter(Boolean).map((c) => (SDN_PROGRAMS[c] ? `${SDN_PROGRAMS[c]} (${c})` : c));
      const under = programs.length ? ` under its ${joinWords(programs)} sanctions program${programs.length > 1 ? 's' : ''}` : '';
      return { text: `The US Treasury lists it as a Specially Designated National${under}${asAlias && `,${asAlias}`}.`, url: e.url, source: 'SDN list' };
    }
    case 'us-1286':
      return { text: `The US Defense Department names it on its Section 1286 list${asAlias}${cite}.`, url: e.url, source: 'Section 1286 list' };
    default:
      return { text: `Japan's Ministry of Economy, Trade and Industry names it on its End User List${asAlias}${cite}.`, url: e.url, source: 'End User List' };
  }
}

// The evidence the official lists themselves give, one plain sentence per
// listing entry with its official source, in the lists' published order.
export function listEvidence(record) {
  const out = [];
  for (const { id } of LISTS) {
    const listing = record.listings?.find((l) => l.listId === id && l.status === 'listed');
    for (const e of displayEntries(id, listing?.entries)) {
      const item = { listId: id, ...entryEvidence(id, e) };
      if (!out.some((o) => o.text === item.text)) out.push(item);
    }
  }
  return out;
}

const listedIds = (record) => LISTS.map((l) => l.id).filter((id) => listed(record, id));

const CHIP_KINDS = { 'ca-nro': 'nro', 'ca-sanctions': 'sanctions', 'us-sdn': 'sanctions' };

// The lists an institution is on, as short labels for search rows and the
// profile header, in the lists' published order.
export function listChips(record) {
  return listedIds(record).map((id) => ({ listId: id, label: LIST_SHORT_LABELS[id], kind: CHIP_KINDS[id] ?? 'export' }));
}

export const NRO_NOTE =
  'STRAC: a current affiliation with it, or funding or in-kind support from it, rules out grants that aim to advance a sensitive technology research area.';
const EXPORT_NOTE = 'US export controls: US-origin items or technology may need a US licence to reach it.';

// What each kind of listing means for a researcher, one short line each, for
// the search rows. The profile carries the full sanctions wording.
export function listNotes(record) {
  const ids = listedIds(record);
  const notes = [];
  if (ids.includes('ca-nro')) notes.push(NRO_NOTE);
  if (ids.includes('ca-sanctions')) {
    notes.push(
      `Sanctioned by Canada${ids.includes('us-sdn') ? ' and the US' : ''}: prohibitions depend on the activity, so check it with Global Affairs Canada before engaging.`,
    );
  } else if (ids.includes('us-sdn')) {
    notes.push('Sanctioned by the US: US sanctions can apply when US persons, funding or items are involved; check the activity before engaging.');
  }
  if (ids.includes('us-entity-list') || ids.includes('us-meu')) notes.push(EXPORT_NOTE);
  if (ids.includes('us-1286')) notes.push('US Section 1286 list: the US Defense Department uses it to review the research it funds.');
  if (ids.includes('jp-eul')) notes.push("Japan's End User List: exports from Japan to it face extra checks.");
  const units = record.units ?? [];
  if (units.length === 1) notes.push(`A unit is listed separately: ${units[0].name}.`);
  else if (units.length > 1) notes.push(`${units.length} of its units are listed separately; see the profile.`);
  return notes;
}

export function profilePath(id) {
  return `#defence-tracker/${id}`;
}

// The details of each listing are given once, in the evidence lines.
function listingLine(l) {
  return `- ${l.jurisdiction}, ${l.label}: ${{ listed: 'Listed', 'not-listed': 'Not listed', 'not-checked': 'Not checked yet' }[l.status]}`;
}

export function formatRecordForFile(record, { meta, permalink, retrievedOn }) {
  const a = record.assessment;
  const otherNames = [record.zh, ...(record.acronyms ?? [])].filter(Boolean).join(', ');
  const lines = [
    'Defence Institution Tracker — record',
    `Institution: ${record.name}${otherNames ? ` (${otherNames})` : ''}`,
    `Permanent ID: ${record.id}`,
    a?.rating
      ? `Rating: ${RATING_LABELS[a.rating]}${a.basis === 'lists' ? ', from official lists' : ''} (rule: ${a.ruleText})`
      : `Rating: ${NOT_RATED_LABEL}`,
  ];
  if (a?.overridden) lines.push(`Override: moved from ${RATING_LABELS[a.baseRating]} because ${a.overrideReason}`);
  lines.push('Formal listings:', ...record.listings.map(listingLine), ...sanctionsNotes(record));
  const fromLists = listEvidence(record);
  if (fromLists.length) lines.push('Evidence from the official lists:', ...fromLists.map((e) => `- ${e.text}${e.url ? ` ${e.url}` : ''}`));
  if (record.units?.length) {
    lines.push('Listed units:', ...record.units.map((u) => `- ${u.name}: ${u.lists.join('; ')}`), UNITS_NOTE);
  }

  if (record.status === 'verified' && record.evidence?.length) {
    const sourcesById = new Map(record.sources.map((s) => [s.id, s]));
    lines.push('Key evidence:');
    for (const e of record.evidence) {
      const cites = (e.sources ?? [])
        .map((id) => sourcesById.get(id))
        .filter(Boolean)
        .map((s) => `${s.title}, ${s.url}`)
        .join('; ');
      lines.push(`- ${SIGNALS[e.signal]?.label ?? e.signal}: ${e.summary}${cites ? ` [${cites}]` : ''}`);
    }
  }

  lines.push(
    `Verified: ${record.verifiedOn ?? 'not yet verified'}`,
    `Dataset: ${meta.version}`,
    `Rubric: ${meta.rubricVersion ?? RUBRIC_VERSION}`,
    `Retrieved: ${retrievedOn}`,
    `Link: ${permalink}`,
    DISCLAIMER,
  );
  return lines.join('\n');
}

export function countBatch(lines) {
  const counts = { lines: lines.length, matched: 0, check: 0, notFound: 0 };
  for (const { matches } of lines) {
    if (matches.some((m) => m.confidence === 'confirmed')) counts.matched++;
    else if (matches.length) counts.check++;
    else counts.notFound++;
  }
  return counts;
}

export function searchLogLine({ date, meta, counts }) {
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  return (
    `Checked ${date} against Defence Institution Tracker dataset ${meta.version} (rubric ${meta.rubricVersion}): ` +
    `${plural(counts.lines, 'line')} — ${counts.matched} matched, ${counts.check} to check, ${counts.notFound} not in tracker.`
  );
}

export { csvCell };

function batchRows(lines, byId, baseUrl) {
  const rows = [];
  for (const { input, matches } of lines) {
    if (!matches.length) {
      rows.push([input, 'Not in tracker', '', '', '', '', '', '']);
      continue;
    }
    for (const m of matches) {
      const r = byId.get(m.id);
      if (!r) continue;
      const others = [
        ...r.listings.filter((l) => l.listId !== 'ca-nro' && l.status === 'listed').map((l) => l.label),
        ...(r.units ?? []).map((u) => `Listed unit: ${u.name} (${u.lists.join(', ')})`),
      ];
      rows.push([
        input,
        r.name,
        matchedByLabel(m),
        m.confidence === 'confirmed' ? 'Confirmed' : 'Check',
        ratingLabel(r),
        listed(r, 'ca-nro') ? 'Yes' : 'No',
        others.join('; '),
        `${baseUrl}${profilePath(r.id)}`,
      ]);
    }
  }
  return rows;
}

export function batchResultsToCsv(lines, byId, { baseUrl = '' } = {}) {
  return `${[BATCH_COLUMNS, ...batchRows(lines, byId, baseUrl)].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

export function batchResultsToText(lines, byId, { baseUrl = '' } = {}) {
  const clean = (c) => neutralise(c).replace(/[\t\r\n]+/g, ' ');
  return [BATCH_COLUMNS, ...batchRows(lines, byId, baseUrl)].map((row) => row.map(clean).join('\t')).join('\n');
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Word pastes text/html as a real table, which tab-separated text is not.
export function batchResultsToHtml(lines, byId, { baseUrl = '' } = {}) {
  const head = `<tr>${BATCH_COLUMNS.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
  const body = batchRows(lines, byId, baseUrl)
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(neutralise(c))}</td>`).join('')}</tr>`)
    .join('');
  return `<table>${head}${body}</table>`;
}

// An unverified record's type comes from the seed import (MISP's categories),
// so like its seed notes it is not published.
const publishedType = (r) => (r.status === 'verified' ? r.type : null);

export function datasetToExport(dataset) {
  return {
    meta: dataset.meta,
    lists: dataset.lists,
    records: dataset.records.map((r) => {
      const copy = { ...r, type: publishedType(r) };
      delete copy.seedNotes;
      return copy;
    }),
  };
}

export function datasetToCsv(dataset) {
  const header = ['id', 'name', 'zh', 'acronyms', 'domains', 'country', 'type', 'status', 'rating', 'rating_basis', 'verified_on', 'listed_on', 'profile_path'];
  const rows = dataset.records.map((r) => [
    r.id,
    r.name,
    r.zh ?? '',
    (r.acronyms ?? []).join('; '),
    (r.domains ?? []).join('; '),
    r.country ?? '',
    publishedType(r) ?? '',
    r.status,
    r.assessment?.rating ? RATING_LABELS[r.assessment.rating] : NOT_RATED_LABEL,
    RATING_BASIS_LABELS[r.assessment?.basis] ?? '',
    r.verifiedOn ?? '',
    r.listings.filter((l) => l.status === 'listed').map((l) => l.label).join('; '),
    profilePath(r.id),
  ]);
  return `${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
