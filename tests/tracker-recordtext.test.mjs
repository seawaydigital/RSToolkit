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
  displayEntries,
  formatRecordForFile,
  listChips,
  listEvidence,
  listNotes,
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

test('an unresearched record on a list says its rating comes from the lists, and marks unchecked lists', () => {
  const text = formatRecordForFile(listingOnly, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Rating: High, from official lists'), text);
  assert.ok(text.includes('Not checked yet'));
  assert.ok(text.includes('Evidence from the official lists:'), text);
});

test('each listing becomes a plain-language piece of evidence with its official source', () => {
  const hitEvidence = listEvidence(hit);
  assert.deepEqual(hitEvidence.map((e) => e.text), [
    'Canada names it on its list of Named Research Organizations, which the STRAC policy uses.',
    'The US Commerce Department added it to the Entity List on 5 June 2020 (85 FR 34497).',
  ]);
  assert.equal(hitEvidence[1].url, 'https://www.govinfo.gov/link/fr/85/34497');
  assert.equal(hitEvidence[0].url, 'https://science.gc.ca/nro');
  assert.deepEqual(listEvidence(sanctioned).map((e) => e.text), [
    'The US Treasury lists it as a Specially Designated National under its Iran (IRAN) sanctions program.',
  ]);
});

test('evidence names Canada’s sanctions regulation and the US Treasury programs in words', () => {
  const record = {
    listings: [
      { listId: 'ca-sanctions', status: 'listed', entries: [{ key: 'ca:Iran:1, Part 1:117', date: '2016-02-05', citation: 'Schedule 1, Part 1, item 117', url: 'https://gac.example/list' }] },
      { listId: 'us-sdn', status: 'listed', entries: [{ key: 'csl:9', date: null, citation: 'NPWMD; RUSSIA-EO14024', url: 'https://treasury.example/sdn' }] },
      { listId: 'us-meu', status: 'listed', entries: [{ key: 'csl:8', date: '2020-12-23', citation: '83 FR 37423; 87 FR 77505', url: 'https://bis.example' }] },
      { listId: 'us-entity-list', status: 'not-listed', entries: [] },
    ],
  };
  const texts = listEvidence(record).map((e) => e.text);
  assert.deepEqual(texts, [
    'Canada lists it under the Special Economic Measures (Iran) Regulations (Schedule 1, Part 1, item 117) since 5 February 2016.',
    'The US Commerce Department added it to the Military End-User List on 23 December 2020 (83 FR 37423; 87 FR 77505).',
    'The US Treasury lists it as a Specially Designated National under its non-proliferation of weapons of mass destruction (NPWMD) and Russia harmful foreign activities (RUSSIA-EO14024) sanctions programs.',
  ]);
  assert.equal(listEvidence(record)[1].url, 'https://www.govinfo.gov/link/fr/83/37423');
});

test('repeated US entries with garbled Federal Register volumes become one, with the citation that fits the date', () => {
  const entry = (key, citation) => ({ key, name: 'X Institute', date: '2018-08-01', citation, url: 'https://bis.example' });
  const listing = { listId: 'us-entity-list', status: 'listed', entries: [entry('a', '87 FR  37423'), entry('b', '83 FR  37423'), entry('c', '85 FR  37423')] };
  assert.deepEqual(displayEntries(listing.listId, listing.entries).map((e) => e.citation), ['83 FR 37423']);
  assert.deepEqual(listEvidence({ listings: [listing] }).map((e) => e.text), [
    'The US Commerce Department added it to the Entity List on 1 August 2018 (83 FR 37423).',
  ]);
});

test('citation fragments and stray dates are left out of US citations; other lists keep theirs', () => {
  const entries = [
    { key: 'a', name: 'A', date: '2020-12-18', citation: '85 FR 83420; 88 FR', url: 'u' },
    { key: 'b', name: 'B', date: '2014-05-01', citation: '79 FR 24566; 5/1/14; 83 FR 3580; 1/26/18 ', url: 'u' },
  ];
  assert.deepEqual(displayEntries('us-entity-list', entries).map((e) => e.citation), ['85 FR 83420', '79 FR 24566; 83 FR 3580']);
  const ca = [{ key: 'ca:Iran:1', citation: 'Schedule 1, Part 1, item 2' }];
  assert.deepEqual(displayEntries('ca-sanctions', ca), ca);
});

test('a listing through a parent’s entry says the list names it as an alias in that entry', () => {
  const caep = 'Chinese Academy of Engineering Physics';
  const via = (listId, name, e) => ({ listId, status: 'listed', entries: [{ name, alias: 'Southwest Institute of Fluid Physics', date: null, url: 'https://list.example', ...e }] });
  const record = {
    listings: [
      via('ca-sanctions', 'Example Institute', { key: 'ca:Russia:1:5', date: '2022-02-24', citation: 'Schedule 1, item 5' }),
      via('us-entity-list', caep, { key: 'csl:1', date: '1997-06-30', citation: '62 FR 35334; 85 FR 34497' }),
      via('us-sdn', 'Example Institute', { key: 'csl:2', citation: 'IRAN' }),
      via('us-1286', 'Example Institute', { key: '1286:x', citation: 'FY2025 list, published 23 July 2026' }),
      via('jp-eul', caep, { key: 'eul:CN:x', citation: '29 September 2025 revision, No. 519; concerns: nuclear' }),
    ],
  };
  const evidence = listEvidence(record);
  assert.deepEqual(evidence.map((e) => e.text), [
    'Canada lists it under the Special Economic Measures (Russia) Regulations as an alias in the entry for “Example Institute” (Schedule 1, item 5) since 24 February 2022.',
    "The US Commerce Department's Entity List names it as an alias in the entry for “Chinese Academy of Engineering Physics”, added on 30 June 1997 (62 FR 35334; 85 FR 34497).",
    'The US Treasury lists it as a Specially Designated National under its Iran (IRAN) sanctions program, as an alias in the entry for “Example Institute”.',
    'The US Defense Department names it on its Section 1286 list as an alias in the entry for “Example Institute” (FY2025 list, published 23 July 2026).',
    "Japan's Ministry of Economy, Trade and Industry names it on its End User List as an alias in the entry for “Chinese Academy of Engineering Physics” (29 September 2025 revision, No. 519; concerns: nuclear).",
  ]);
  assert.equal(evidence[1].url, 'https://www.govinfo.gov/link/fr/62/35334');
});

test('the copied record gives each listing’s details once, as evidence', () => {
  const text = formatRecordForFile(hit, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.equal(text.split('\n').filter((line) => line.includes('85 FR 34497')).length, 1, text);
  assert.match(text, /^- United States, Entity List \(Commerce\): Listed$/m);
});

test('list chips name each list the institution is on, sanctions marked', () => {
  assert.deepEqual(listChips(hit), [
    { listId: 'ca-nro', label: 'NRO', kind: 'nro' },
    { listId: 'us-entity-list', label: 'US Entity List', kind: 'export' },
  ]);
  assert.deepEqual(listChips(sanctioned), [{ listId: 'us-sdn', label: 'US SDN', kind: 'sanctions' }]);
  assert.deepEqual(listChips(byId.get('nro-only-institute')).map((c) => c.kind), ['nro']);
});

test('list notes say what each kind of listing means, without blanket-ban wording', () => {
  const [nro, exportNote] = listNotes(hit);
  assert.match(nro, /STRAC/);
  assert.match(nro, /current affiliation/);
  assert.match(exportNote, /US export controls/);
  const both = {
    listings: [
      { listId: 'ca-sanctions', status: 'listed', entries: [{}] },
      { listId: 'us-sdn', status: 'listed', entries: [{}] },
    ],
  };
  assert.deepEqual(listNotes(both), [
    'Sanctioned by Canada and the US: prohibitions depend on the activity, so check it with Global Affairs Canada before engaging.',
  ]);
  const usOnly = listNotes(sanctioned);
  assert.equal(usOnly.length, 1);
  assert.match(usOnly[0], /^Sanctioned by the US: /);
  for (const n of [...listNotes(hit), ...listNotes(both), ...usOnly]) assert.ok(!/criminal offence|banned|prohibited from/i.test(n), n);
  assert.deepEqual(listNotes(byId.get('example-listed-university')), usOnly);
});

test('batch rows and the CSV say a rating comes from the official lists', () => {
  const csv = batchResultsToCsv([{ input: 'ELU', matches: [{ id: 'example-listed-university', matchedBy: 'name', confidence: 'confirmed' }] }], byId);
  assert.ok(csv.includes('High (from official lists)'), csv);
  const rows = datasetToCsv(ds).trim().split('\r\n').map((line) => line.split(','));
  const basis = rows[0].indexOf('rating_basis');
  assert.ok(basis > 0);
  assert.equal(rows.find((r) => r[0] === 'example-listed-university')[basis], 'official lists');
  assert.equal(rows.find((r) => r[0] === 'harbin-institute-of-technology')[basis], 'researched profile');
});

test('a sanctions listing adds the sanctions note without blanket-ban wording', () => {
  const text = formatRecordForFile(sanctioned, { meta, permalink: 'p', retrievedOn: '2026-10-24' });
  assert.ok(text.includes('Global Affairs Canada'));
  assert.ok(!/criminal offence/i.test(text));
});

test('a batch row matched through a unit names the unit', () => {
  const csv = batchResultsToCsv(
    [{ input: 'Xijing Hospital, Xi’an', matches: [{ id: 'harbin-institute-of-technology', matchedBy: 'unit', unit: 'Xijing Hospital', confidence: 'confirmed' }] }],
    byId,
  );
  assert.ok(csv.split('\r\n')[1].includes('Unit: Xijing Hospital'), csv);
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

test('an unverified record’s type is not published, since it comes from the seed data', () => {
  const exported = new Map(datasetToExport(ds).records.map((r) => [r.id, r]));
  assert.equal(exported.get('harbin-institute-of-technology').type, 'university');
  assert.equal(exported.get('nro-only-institute').type, null);
  const rows = datasetToCsv(ds).trim().split('\r\n').map((line) => line.split(','));
  const typeColumn = rows[0].indexOf('type');
  assert.equal(rows.find((r) => r[0] === 'nro-only-institute')[typeColumn], '');
  assert.equal(rows.find((r) => r[0] === 'harbin-institute-of-technology')[typeColumn], 'university');
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

test('list notes point to separately listed units', () => {
  assert.ok(listNotes(parent).includes('A unit is listed separately: Harbin Institute of Technology, School of Astronautics.'), listNotes(parent).join('\n'));
  const many = { listings: [], units: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] };
  assert.deepEqual(listNotes(many), ['3 of its units are listed separately; see the profile.']);
});
