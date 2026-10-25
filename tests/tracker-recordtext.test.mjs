// Text the tracker hands to a research security file: the copied institution
// record, the batch-check CSV, the dated search line and the open-data export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  batchResultsToCsv,
  batchResultsToHtml,
  batchResultsToText,
  countBatch,
  csvCell,
  datasetToCsv,
  datasetToExport,
  formatRecordForFile,
  searchLogLine,
} from '../src/tools/compliance/defence-tracker/lib/recordText.js';
import { META, SNAPSHOTS, makeDataset } from './fixtures/trackerDataset.mjs';

const ds = makeDataset();
const { byId } = ds;
const meta = META;
const hit = byId.get('harbin-institute-of-technology');
const listingOnly = byId.get('nro-only-institute');
const sanctioned = byId.get('example-listed-university');

test('a record for the file stands on its own', () => {
  const text = formatRecordForFile(hit, { meta, permalink: 'https://rs.example/#defence-tracker/harbin-institute-of-technology', retrievedOn: '2026-10-24' });
  for (const s of ['Harbin Institute of Technology', '哈尔滨工业大学', 'harbin-institute-of-technology', 'Rating: Very high',
    'Named Research Organizations', 'Entity List', '85 FR 34497', 'Verified: 2026-10-24', 'Dataset: 2026.10', 'Rubric: 1.0',
    'Retrieved: 2026-10-24', 'https://rs.example/#defence-tracker/harbin-institute-of-technology', 'institution-level']) {
    assert.ok(text.includes(s), s);
  }
});

test('an unverified record says it is not yet rated and marks unchecked lists', () => {
  const text = formatRecordForFile(listingOnly, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Rating: Not yet rated'));
  assert.ok(text.includes('Not checked yet'));
});

test('a sanctions listing adds the sanctions note without blanket-ban wording', () => {
  const text = formatRecordForFile(sanctioned, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Global Affairs Canada'));
  assert.ok(!/criminal offence/i.test(text));
});

test('the CSV header is fixed', () => {
  assert.equal(batchResultsToCsv([], byId).split('\r\n')[0], 'Your text,Match,Matched by,Confidence,Rating,NRO,Other lists,Profile');
});

test('CSV quotes commas, quotes and newlines', () => {
  assert.equal(csvCell('Dept, "A"\nB'), '"Dept, ""A""\nB"');
});

test('the copied table neutralises formula-like cells too, since it is pasted into spreadsheets', () => {
  const lines = [{ input: '=HYPERLINK("http://x","y")', matches: [] }, { input: '@SUM(A1)', matches: [] }];
  const text = batchResultsToText(lines, byId).split('\n').slice(1).map((row) => row.split('\t')[0]);
  assert.deepEqual(text, [`'=HYPERLINK("http://x","y")`, `'@SUM(A1)`]);
  const html = batchResultsToHtml(lines, byId);
  assert.ok(html.includes(`<td>'=HYPERLINK(&quot;http://x&quot;,&quot;y&quot;)</td>`), html);
  assert.ok(html.includes(`<td>'@SUM(A1)</td>`), html);
});

test('CSV neutralises formula-like cells', () => {
  for (const v of ['=HYPERLINK("x")', '+1', '-1', '@SUM(A1)']) assert.ok(csvCell(v).replace(/^"/, '').startsWith("'"), v);
});

test('batch rows name the match, its rating and its listings', () => {
  const csv = batchResultsToCsv(
    [
      { input: 'Harbin Inst. of Tech.', matches: [{ id: 'harbin-institute-of-technology', matchedBy: 'name', confidence: 'confirmed' }] },
      { input: 'Shantou University', matches: [] },
    ],
    byId,
  );
  const [, first, second] = csv.split('\r\n');
  assert.ok(first.includes('Harbin Institute of Technology') && first.includes('Very high') && first.includes('Yes') && first.includes('Entity List'));
  assert.ok(second.startsWith('Shantou University,Not in tracker'));
});

test('the HTML table for pasting into Word escapes pasted text', () => {
  const html = batchResultsToHtml([{ input: '<script>x</script> & co', matches: [] }], byId);
  assert.ok(html.startsWith('<table>'));
  assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt; &amp; co'));
  assert.ok(!html.includes('<script>'));
});

test('batch counts split confirmed, check-only and unmatched lines', () => {
  assert.deepEqual(
    countBatch([
      { input: 'a', matches: [{ confidence: 'confirmed' }, { confidence: 'check' }] },
      { input: 'b', matches: [{ confidence: 'check' }] },
      { input: 'c', matches: [] },
    ]),
    { lines: 3, matched: 1, check: 1, notFound: 1 },
  );
});

test('the search log line has the date, dataset and counts', () => {
  assert.equal(
    searchLogLine({ date: '2026-10-24', meta: { version: '2026.10', rubricVersion: '1.0' }, counts: { lines: 6, matched: 4, check: 1, notFound: 1 } }),
    'Checked 2026-10-24 against Defence Institution Tracker dataset 2026.10 (rubric 1.0): 6 lines — 4 matched, 1 to check, 1 not in tracker.',
  );
});

test('the dataset CSV has one row per record and no seed notes in the export', () => {
  assert.equal(datasetToCsv(ds).trim().split('\r\n').length, ds.records.length + 1);
  assert.ok(datasetToExport(ds).records.every((r) => !('seedNotes' in r)));
});

// A unit listed in its own right ("Harbin Institute of Technology, School of
// Astronautics") must show up wherever its parent does.
const withUnit = makeDataset({
  snapshots: {
    ...SNAPSHOTS,
    'ca-sanctions': {
      ...SNAPSHOTS['ca-sanctions'],
      entries: [{ key: 'ca:1', list: 'ca-sanctions', name: 'Harbin Institute of Technology, School of Astronautics', altNames: [], country: 'CN', date: '2026-01-01', citation: 'Schedule 1, item 9', url: 'https://example.org/sema', institution: 'hit-school-of-astronautics' }],
    },
  },
});
const parent = withUnit.byId.get('harbin-institute-of-technology');

test('a copied record lists the parent’s separately listed units', () => {
  const text = formatRecordForFile(parent, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Listed units:'), text);
  assert.ok(text.includes('Harbin Institute of Technology, School of Astronautics: Consolidated Canadian Autonomous Sanctions List'), text);
});

test('a batch row for the parent names its listed units', () => {
  const csv = batchResultsToCsv([{ input: 'HIT', matches: [{ id: 'harbin-institute-of-technology', matchedBy: 'name', confidence: 'confirmed' }] }], withUnit.byId);
  assert.ok(csv.includes('Listed unit: Harbin Institute of Technology, School of Astronautics (Consolidated Canadian Autonomous Sanctions List)'), csv);
});
