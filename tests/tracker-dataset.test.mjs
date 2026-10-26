// Dataset assembly: institution files + listing snapshots + the NRO module
// become one rated record set, and listing-only institutions appear without
// needing files. Also pins the schema rules the data files must follow.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRecord } from '../src/tools/compliance/defence-tracker/lib/schema.js';
import { HIT, NRO_DATA, SNAPSHOTS, makeDataset } from './fixtures/trackerDataset.mjs';

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

test('verified records are rated by their profile; listed records not yet researched, by their lists', () => {
  const hit = ds.byId.get('harbin-institute-of-technology').assessment;
  assert.deepEqual([hit.rating, hit.basis], ['very-high', 'profile']);
  const listed = ds.byId.get('example-listed-university').assessment;
  assert.deepEqual([listed.rating, listed.basis, listed.rule], ['high', 'lists', 'listed']);
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

test('one record can stand for two NRO entries that name the same institution', () => {
  const peacTop = { id: 'peac-institute-of-multiscale-science', name: 'Peac Institute of Multiscale Science', aliases: ['Peak Multiscale Science Institute'], country: 'China', city: 'Mianyang', lat: 31.5, lng: 104.7, parentOrg: null, notes: null };
  const peacCaep = { ...peacTop, id: 'caep-peac-institute-of-multiscale-science', name: 'Peac Institute of Multiscale Science (CAEP)', lat: 30.7, lng: 103.9 };
  const peacFile = {
    ...HIT,
    id: 'peac-institute-of-multiscale-science',
    name: 'Peac Institute of Multiscale Science',
    zh: null,
    acronyms: [],
    domains: [],
    aliases: ['Peak Multiscale Science Institute'],
    ids: { nro: 'peac-institute-of-multiscale-science', nroAlso: ['caep-peac-institute-of-multiscale-science'] },
    evidence: [],
    sources: [],
    status: 'listing-only',
    verifiedOn: null,
    history: [],
  };
  const dup = makeDataset({ institutions: [HIT, peacFile], nroData: { ...NRO_DATA, organizations: [...NRO_DATA.organizations, peacTop, peacCaep] } });
  assert.deepEqual(validateRecord(peacFile), []);
  assert.equal(dup.byId.get('caep-peac-institute-of-multiscale-science').id, 'peac-institute-of-multiscale-science');
  assert.equal(dup.records.filter((r) => r.id.includes('peac')).length, 1);
  assert.equal(dup.byId.get('peac-institute-of-multiscale-science').listings.find((l) => l.listId === 'ca-nro').status, 'listed');
});

test('validateRecord catches schema breaks', () => {
  const errs = validateRecord({ ...HIT, id: 'Bad Id', status: 'done' });
  assert.ok(errs.some((e) => e.includes('id')) && errs.some((e) => e.includes('status')));
  assert.ok(validateRecord({ ...HIT, id: 'batch' }).some((e) => e.includes('reserved')));
  assert.ok(validateRecord({ ...HIT, description: 'copied prose' }).some((e) => e.includes('description')));
  assert.ok(validateRecord({ ...HIT, sources: [{ ...HIT.sources[0], archive: undefined }] }).some((e) => e.includes('archive')));
  assert.ok(validateRecord({ ...HIT, status: 'seed', verifiedOn: null }).some((e) => e.includes('evidence')));
  assert.deepEqual(validateRecord(HIT), []);
  assert.ok(validateRecord({ ...HIT, aliases: ['null'] }).some((e) => e.includes('aliases')));
  assert.ok(validateRecord({ ...HIT, zhAliases: ['  '] }).some((e) => e.includes('zhAliases')));
  assert.ok(validateRecord({ ...HIT, aliases: ['Harbin Polytechnic University,'] }).some((e) => e.includes('aliases')));
});

test('subunits need a name and a known kind, and only "match": true marks one for matching', () => {
  const ok = [
    { name: 'Weihai campus (Shandong)', zh: null, kind: 'campus' },
    { name: 'Xijing Hospital (First Affiliated Hospital)', zh: '西京医院', kind: 'hospital', match: true },
  ];
  assert.deepEqual(validateRecord({ ...HIT, subunits: ok }), []);
  for (const bad of [
    { name: ' ', kind: 'campus' },
    { name: 'Weihai campus', kind: 'ward' },
    { name: 'Xijing Hospital', zh: 'Xijing', kind: 'hospital' },
    { name: 'Xijing Hospital', kind: 'hospital', match: 'yes' },
  ]) {
    assert.ok(validateRecord({ ...HIT, subunits: [bad] }).some((e) => e.includes('subunit')), JSON.stringify(bad));
  }
});

test('a list-only unit named after another record is linked to it as a listed unit', () => {
  const snapshots = {
    ...SNAPSHOTS,
    'ca-sanctions': {
      ...SNAPSHOTS['ca-sanctions'],
      entries: [{ key: 'ca:1', list: 'ca-sanctions', name: 'Harbin Institute of Technology, School of Astronautics', altNames: [], country: 'CN', date: null, citation: null, url: 'https://example.org', institution: 'hit-school-of-astronautics' }],
    },
  };
  const d = makeDataset({ snapshots });
  assert.equal(d.byId.get('hit-school-of-astronautics').parent, 'harbin-institute-of-technology');
  const hit = d.byId.get('harbin-institute-of-technology');
  assert.deepEqual(hit.units, [{ id: 'hit-school-of-astronautics', name: 'Harbin Institute of Technology, School of Astronautics', lists: ['Consolidated Canadian Autonomous Sanctions List'] }]);
  assert.equal(hit.listings.find((l) => l.listId === 'ca-sanctions').status, 'not-listed');
  assert.deepEqual(makeDataset().byId.get('harbin-institute-of-technology').units, []);
});

test('the same name with a bracketed code is the institution itself, not a unit of it', () => {
  const snapshots = {
    ...SNAPSHOTS,
    'ca-sanctions': {
      ...SNAPSHOTS['ca-sanctions'],
      entries: [{ key: 'ca:1', list: 'ca-sanctions', name: 'Harbin Institute of Technology (HIT)', altNames: [], country: 'CN', date: null, citation: null, url: 'https://example.org', institution: 'hit-2' }],
    },
  };
  const d = makeDataset({ snapshots });
  assert.equal(d.byId.get('hit-2').parent, null);
  assert.deepEqual(d.byId.get('harbin-institute-of-technology').units, []);
});

test('a list-only record named by several entries takes a mixed-case name over an all-caps one', () => {
  const entry = (key, list, name) => ({ key, list, name, altNames: [], country: 'RU', date: null, citation: null, url: 'https://example.org', institution: 'mipt' });
  const snapshots = {
    ...SNAPSHOTS,
    'us-csl': {
      ...SNAPSHOTS['us-csl'],
      entries: [
        entry('csl:a', 'us-sdn', 'FEDERAL STATE INSTITUTION OF HIGHER VOCATIONAL EDUCATION MOSCOW INSTITUTE OF PHYSICS AND TECHNOLOGY'),
        entry('csl:b', 'us-entity-list', 'Moscow Institute of Physics and Technology'),
      ],
    },
  };
  const record = makeDataset({ snapshots }).byId.get('mipt');
  assert.equal(record.name, 'Moscow Institute of Physics and Technology');
  assert.ok(record.aliases.includes('FEDERAL STATE INSTITUTION OF HIGHER VOCATIONAL EDUCATION MOSCOW INSTITUTE OF PHYSICS AND TECHNOLOGY'));
  assert.ok(!record.aliases.includes('Moscow Institute of Physics and Technology'));
  assert.deepEqual(record.listings.filter((l) => l.status === 'listed').map((l) => l.listId).sort(), ['us-entity-list', 'us-sdn']);
});
