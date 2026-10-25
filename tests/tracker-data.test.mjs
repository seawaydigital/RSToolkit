// Integrity checks over the real tracker data in src/data/defenceTracker/.
// These are what stop a bad import, a hand edit or a listing sync from
// shipping: every file is valid, names and domains are unambiguous, every
// NRO has a record at the same id, and every listing entry has a home.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import nroData from '../src/data/nroData.js';
import { loadDataset, readRawData } from '../scripts/tracker/lib/loadData.mjs';
import { validateRecord, validateSnapshot } from '../src/tools/compliance/defence-tracker/lib/schema.js';
import { RUBRIC_VERSION } from '../src/tools/compliance/defence-tracker/lib/rubric.js';
import { compactCjk, isGenericPhrase, normalizePhrase } from '../src/tools/compliance/defence-tracker/lib/normalize.js';

const raw = await readRawData();
const ds = await loadDataset(raw);

test('every institution file passes the schema and is named after its id', () => {
  for (const { file, record } of raw.institutionFiles) {
    assert.deepEqual(validateRecord(record), [], file);
    assert.equal(file, `${record.id}.json`);
  }
});

test('ids are unique', () => {
  const ids = ds.records.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('no two records claim the same email domain', () => {
  const owner = new Map();
  for (const r of ds.records) {
    for (const d of r.domains ?? []) {
      assert.ok(!owner.has(d) || owner.get(d) === r.id, `${d} is claimed by ${owner.get(d)} and ${r.id}`);
      owner.set(d, r.id);
    }
  }
});

test('no full name is shared by two records', () => {
  const owner = new Map();
  const claim = (key, id) => {
    assert.ok(!owner.has(key) || owner.get(key) === id, `"${key}" is used by ${owner.get(key)} and ${id}`);
    owner.set(key, id);
  };
  for (const r of ds.records) {
    for (const n of [r.name, ...(r.aliases ?? [])]) {
      const phrase = normalizePhrase(n);
      if (phrase.split(' ').length >= 2 && !isGenericPhrase(phrase)) claim(phrase, r.id);
    }
    for (const n of [r.zh, ...(r.zhAliases ?? [])].filter(Boolean)) {
      const text = compactCjk(n);
      if (text.length >= 4) claim(text, r.id);
    }
  }
});

test('every NRO organization resolves to a tracker record at the same id', () => {
  for (const org of nroData.organizations) {
    const r = ds.byId.get(org.id);
    assert.ok(r, `no record for ${org.id}`);
    assert.ok([r.ids?.nro, ...(r.ids?.nroAlso ?? [])].includes(org.id), org.id);
  }
});

test('ids.nro values point at real NRO organizations', () => {
  const nroIds = new Set(nroData.organizations.map((o) => o.id));
  for (const r of raw.institutions) if (r.ids?.nro) assert.ok(nroIds.has(r.ids.nro), `${r.id}: ${r.ids.nro}`);
});

test('every snapshot passes the schema and every entry maps to a record', () => {
  for (const [name, snapshot] of Object.entries(raw.snapshots)) {
    assert.deepEqual(validateSnapshot(snapshot), [], name);
    for (const e of snapshot.entries) assert.ok(e.institution && ds.byId.has(e.institution), `${name}: ${e.key} is unmapped`);
  }
});

test('no record carries an invalid rating override', () => {
  for (const r of ds.records) assert.equal(r.assessment.overrideError, null, r.id);
});

test('meta names the licence holder and rubric version', () => {
  assert.equal(raw.meta.license.holder, 'Andrew Austin');
  assert.equal(raw.meta.license.name, 'CC BY 4.0');
  assert.equal(raw.meta.rubricVersion, RUBRIC_VERSION);
  assert.match(raw.meta.version, /^\d{4}\.\d{2}$/);
});
