// Dataset assembly: institution files + listing snapshots + the NRO module
// become one rated record set, and listing-only institutions appear without
// needing files. Also pins the schema rules the data files must follow.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRecord } from '../src/tools/compliance/defence-tracker/lib/schema.js';
import { HIT, makeDataset } from './fixtures/trackerDataset.mjs';

const ds = makeDataset();

test('files, NRO-only organizations and unmapped listings all become records', () => {
  for (const id of ['harbin-institute-of-technology', 'nro-only-institute', 'example-listed-university']) assert.ok(ds.byId.has(id), id);
  assert.equal(ds.byId.get('harbin-institute-of-technology').virtual, false);
  assert.equal(ds.byId.get('example-listed-university').virtual, true);
  assert.equal(ds.byId.get('example-listed-university').status, 'listing-only');
});

test('listing statuses: listed, not-listed, not-checked', () => {
  const s = (id, listId) => ds.byId.get(id).listings.find((l) => l.listId === listId).status;
  assert.equal(s('harbin-institute-of-technology', 'ca-nro'), 'listed');
  assert.equal(s('harbin-institute-of-technology', 'us-entity-list'), 'listed');
  assert.equal(s('harbin-institute-of-technology', 'us-sdn'), 'not-listed');
  assert.equal(s('harbin-institute-of-technology', 'us-1286'), 'not-checked');
  assert.equal(s('harbin-institute-of-technology', 'jp-eul'), 'not-checked');
});

test('a pending list never reports not-listed', () => {
  for (const r of ds.records) for (const l of r.listings.filter((x) => ['us-1286', 'jp-eul'].includes(x.listId))) assert.equal(l.status, 'not-checked');
});

test('listings carry the official entry details', () => {
  const el = ds.byId.get('harbin-institute-of-technology').listings.find((l) => l.listId === 'us-entity-list').entries[0];
  assert.equal(el.date, '2020-06-05');
  assert.equal(el.citation, '85 FR 34497');
});

test('verified records are rated; listing-only records are not', () => {
  assert.equal(ds.byId.get('harbin-institute-of-technology').assessment.rating, 'very-high');
  assert.equal(ds.byId.get('example-listed-university').assessment.rating, null);
});

test('an NRO-only record takes its name, aliases and location from nroData', () => {
  const r = ds.byId.get('nro-only-institute');
  assert.equal(r.name, 'NRO Only Institute');
  assert.equal(r.location.city, 'Tehran');
  assert.equal(r.ids.nro, 'nro-only-institute');
});

test('the lists summary reports coverage and check dates', () => {
  const l = Object.fromEntries(ds.lists.map((x) => [x.listId, x]));
  assert.equal(l['us-1286'].coverage, 'pending');
  assert.equal(l['ca-nro'].checkedOn, '2026-09-24');
  assert.equal(l['us-entity-list'].checkedOn, '2026-10-24');
});

test('validateRecord catches schema breaks', () => {
  const errs = validateRecord({ ...HIT, id: 'Bad Id', status: 'done' });
  assert.ok(errs.some((e) => e.includes('id')) && errs.some((e) => e.includes('status')));
  assert.ok(validateRecord({ ...HIT, id: 'batch' }).some((e) => e.includes('reserved')));
  assert.ok(validateRecord({ ...HIT, description: 'copied prose' }).some((e) => e.includes('description')));
  assert.ok(validateRecord({ ...HIT, sources: [{ ...HIT.sources[0], archive: undefined }] }).some((e) => e.includes('archive')));
  assert.ok(validateRecord({ ...HIT, status: 'seed', verifiedOn: null }).some((e) => e.includes('evidence')));
  assert.deepEqual(validateRecord(HIT), []);
});
