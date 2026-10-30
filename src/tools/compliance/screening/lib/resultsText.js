// Screening results as text for a research security file: CSV, tab-separated
// and HTML tables (Word pastes the HTML as a real table), and the dated line
// for a search log.
import { csvCell, neutralise } from '../../../../utils/csv.js';
import { countryName } from './countries.js';
import { DATASETS, resultLabel, topicLabel } from './client.js';
import { SCHEMA_LABELS } from './parseList.js';

export const RESULT_COLUMNS = ['Your entry', 'Type', 'Country', 'Birth date', 'Result', 'Best candidate', 'Score', 'Topics', 'Lists', 'OpenSanctions record'];

export const DISCLAIMER =
  'OpenSanctions combines official lists from many countries; it is not the legal list. ' +
  '"No match found" does not clear anyone: names can be spelled differently or missing. ' +
  'A possible match needs a person to review it. This is not legal advice.';

function resultRows(rows, results) {
  return rows.map((row, i) => {
    const r = results[i];
    const best = r?.candidates?.[0];
    return [
      row.name,
      SCHEMA_LABELS[row.schema],
      row.country ? countryName(row.country) : '',
      row.birthDate,
      resultLabel(r),
      best?.caption ?? '',
      best ? best.score.toFixed(2) : '',
      best ? best.topics.map(topicLabel).join('; ') : '',
      best ? best.lists.join('; ') : '',
      best?.url ?? '',
    ];
  });
}

export function resultsToCsv(rows, results) {
  return `${[RESULT_COLUMNS, ...resultRows(rows, results)].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

export function resultsToText(rows, results) {
  const clean = (c) => neutralise(c).replace(/[\t\r\n]+/g, ' ');
  return [RESULT_COLUMNS, ...resultRows(rows, results)].map((row) => row.map(clean).join('\t')).join('\n');
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function resultsToHtml(rows, results) {
  const head = `<tr>${RESULT_COLUMNS.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
  const body = resultRows(rows, results)
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(neutralise(c))}</td>`).join('')}</tr>`)
    .join('');
  return `<table>${head}${body}</table>`;
}

export function countResults(results) {
  const counts = { total: results.length, match: 0, possible: 0, nameOnly: 0, none: 0, error: 0 };
  for (const r of results) {
    counts[r?.status ?? 'error']++;
    if (r?.nameOnly) counts.nameOnly++;
  }
  return counts;
}

export function screeningLogLine({ date, dataset, threshold, counts }) {
  const plural = (n, word) => `${n} ${word}${n === 1 ? 'y' : 'ies'}`;
  return (
    `Screened ${date} against OpenSanctions (${DATASETS[dataset]?.short ?? dataset}, match threshold ${threshold.toFixed(2)}): ` +
    `${plural(counts.total, 'entr')} — ${counts.match} matched, ${counts.possible} possible` +
    `${counts.nameOnly ? ` (${counts.nameOnly} on a name alone)` : ''}, ${counts.none} with no match found` +
    `${counts.error ? `, ${counts.error} not checked` : ''}. Data: OpenSanctions (opensanctions.org).`
  );
}
