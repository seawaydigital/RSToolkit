// Text the tracker hands to a research security file: the copied institution
// record (it has to stand on its own if the link ever breaks), batch-check
// tables in CSV, tab-separated and HTML form, the dated search line, and the
// open-data export.
import { NOT_RATED_LABEL, RATING_LABELS, SIGNALS } from './constants.js';
import { RUBRIC_VERSION } from './rubric.js';

export const BATCH_COLUMNS = ['Your text', 'Match', 'Matched by', 'Confidence', 'Rating', 'NRO', 'Other lists', 'Profile'];

export const DISCLAIMER =
  'This is institution-level information. Affiliation with a listed institution is not evidence of wrongdoing by an individual. Not legal advice; the official lists prevail.';

export const MATCHED_BY_LABELS = {
  domain: 'Email or web domain',
  'chinese-name': 'Chinese name',
  name: 'Name',
  acronym: 'Acronym',
  'similar-name': 'Similar name',
};

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
  return record.assessment?.rating ? RATING_LABELS[record.assessment.rating] : NOT_RATED_LABEL;
}

export function profilePath(id) {
  return `#defence-tracker/${id}`;
}

function listingLine(l) {
  if (l.status === 'not-checked') return `- ${l.jurisdiction}, ${l.label}: Not checked yet`;
  if (l.status === 'not-listed') return `- ${l.jurisdiction}, ${l.label}: Not listed`;
  const details = l.entries.map((e) => [e.date, e.citation, e.url].filter(Boolean).join(', ')).filter(Boolean).join('; ');
  return `- ${l.jurisdiction}, ${l.label}: Listed${details ? ` — ${details}` : ''}`;
}

export function formatRecordForFile(record, { meta, permalink, retrievedOn }) {
  const a = record.assessment;
  const otherNames = [record.zh, ...(record.acronyms ?? [])].filter(Boolean).join(', ');
  const lines = [
    'Defence Institution Tracker — record',
    `Institution: ${record.name}${otherNames ? ` (${otherNames})` : ''}`,
    `Permanent ID: ${record.id}`,
    a?.rating ? `Rating: ${RATING_LABELS[a.rating]} (rule: ${a.ruleText})` : `Rating: ${NOT_RATED_LABEL}`,
  ];
  if (a?.overridden) lines.push(`Override: moved from ${RATING_LABELS[a.baseRating]} because ${a.overrideReason}`);
  lines.push('Formal listings:', ...record.listings.map(listingLine), ...sanctionsNotes(record));
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

// Spreadsheet apps run cells that start with these characters as formulas,
// and batch input is pasted text, so such cells get a leading apostrophe:
// in the CSV and in the copied table, which is pasted into spreadsheets too.
const neutralise = (value) => {
  const s = value == null ? '' : String(value);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

export function csvCell(value) {
  const s = neutralise(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

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
        MATCHED_BY_LABELS[m.matchedBy] ?? m.matchedBy,
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

export function datasetToExport(dataset) {
  return {
    meta: dataset.meta,
    lists: dataset.lists,
    records: dataset.records.map((r) => {
      const copy = { ...r };
      delete copy.seedNotes;
      return copy;
    }),
  };
}

export function datasetToCsv(dataset) {
  const header = ['id', 'name', 'zh', 'acronyms', 'domains', 'country', 'type', 'status', 'rating', 'verified_on', 'listed_on', 'profile_path'];
  const rows = dataset.records.map((r) => [
    r.id,
    r.name,
    r.zh ?? '',
    (r.acronyms ?? []).join('; '),
    (r.domains ?? []).join('; '),
    r.country ?? '',
    r.type,
    r.status,
    ratingLabel(r),
    r.verifiedOn ?? '',
    r.listings.filter((l) => l.status === 'listed').map((l) => l.label).join('; '),
    profilePath(r.id),
  ]);
  return `${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
