// Screening results as text for a file: spreadsheet-safe cells and the dated
// search-log line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countResults, resultsToCsv, resultsToHtml, resultsToText, screeningLogLine } from '../src/tools/compliance/screening/lib/resultsText.js';

const rows = [
  { name: '=SUM(A1:A2)', schema: 'LegalEntity', country: '', birthDate: '' },
  { name: 'Harbin Institute of Technology', schema: 'Organization', country: 'cn', birthDate: '' },
];
const results = [
  { status: 'none', candidates: [] },
  {
    status: 'match',
    candidates: [{ id: 'NK-1', caption: 'Harbin Institute of Technology', schema: 'Organization', score: 1, match: true, topics: ['export.control'], countries: ['cn'], lists: ['us_trade_csl'], url: 'https://www.opensanctions.org/entities/NK-1/' }],
  },
];

test('cells that a spreadsheet would run as formulas are neutralised', () => {
  const csv = resultsToCsv(rows, results);
  assert.ok(csv.split('\r\n')[1].startsWith("'=SUM(A1:A2)"));
  assert.ok(resultsToText(rows, results).split('\n')[1].startsWith("'=SUM"));
  assert.ok(resultsToHtml(rows, results).includes("<td>'=SUM(A1:A2)</td>"));
});

test('rows carry the result, best candidate, topics in words and the record link', () => {
  const line = resultsToCsv(rows, results).split('\r\n')[2];
  assert.equal(line, 'Harbin Institute of Technology,Organization,China,,Match,Harbin Institute of Technology,1.00,Export controlled,us_trade_csl,https://www.opensanctions.org/entities/NK-1/');
});

test('the search-log line', () => {
  const counts = countResults(results);
  assert.deepEqual(counts, { total: 2, match: 1, possible: 0, nameOnly: 0, none: 1, error: 0 });
  assert.equal(
    screeningLogLine({ date: '2026-10-29', dataset: 'sanctions', threshold: 0.7, counts }),
    'Screened 2026-10-29 against OpenSanctions (sanctions lists, match threshold 0.70): 2 entries — 1 matched, 0 possible, 1 with no match found. Data: OpenSanctions (opensanctions.org).',
  );
});

test('a person screened on a name alone is reported as a possible match, and the log says so', () => {
  const people = [{ name: 'John Smith', schema: 'Person', country: '', birthDate: '' }];
  const nameOnly = [{ ...results[1], status: 'possible', nameOnly: true }];
  const line = resultsToCsv(people, nameOnly).split('\r\n')[1];
  assert.equal(line.split(',')[4], 'Possible match (name only)');
  const counts = countResults(nameOnly);
  assert.equal(counts.nameOnly, 1);
  assert.match(screeningLogLine({ date: '2026-10-29', dataset: 'sanctions', threshold: 0.7, counts }), /1 possible \(1 on a name alone\)/);
});
