// Integrity checks over the real tracker data in src/data/defenceTracker/.
// These are what stop a bad import, a hand edit or a listing sync from
// shipping: every file is valid, names and domains are unambiguous, every
// NRO has a record at the same id, and every listing entry has a home.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import nroData from '../src/data/nroData.js';
import { straData } from '../src/data/straData.js';
import { loadDataset, readRawData } from '../scripts/tracker/lib/loadData.mjs';
import { validateRecord, validateSnapshot } from '../src/tools/compliance/defence-tracker/lib/schema.js';
import { RUBRIC_VERSION } from '../src/tools/compliance/defence-tracker/lib/rubric.js';
import { compactCjk, isGenericPhrase, normalizePhrase } from '../src/tools/compliance/defence-tracker/lib/normalize.js';
import { withoutCodes } from '../src/tools/compliance/defence-tracker/lib/places.js';

const raw = await readRawData();
const ds = await loadDataset(raw);

test('every institution file passes the schema and is named after its id', () => {
  for (const { file, record } of raw.institutionFiles) {
    assert.deepEqual(validateRecord(record), [], file);
    assert.equal(file, `${record.id}.json`);
  }
});

// Topics link a profile to Canada's STRA list and are shown by their STRA
// names, so each must be a category or subcategory id from straData.js; a MISP
// topic name copied from seedNotes ("Cyber") would show as raw text.
const STRA_IDS = new Set(straData.categories.flatMap((c) => [c.id, ...(c.subcategories ?? []).map((s) => s.id)]));

test('every topic is a STRA category or subcategory id', () => {
  for (const r of ds.records) {
    for (const t of r.topics ?? []) assert.ok(STRA_IDS.has(t), `${r.id}: "${t}" is not a STRA category or subcategory id`);
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

// Official lists reuse aliases across entries (the Entity List gives two
// Kurchatov institutes the same alias), so two listing-only records may share
// a name; a name may never be shared with a curated (file) record.
test('no full name is shared with a curated record', () => {
  const owner = new Map();
  const claim = (key, id) => {
    const prev = owner.get(key);
    const bothListed = prev && ds.byId.get(prev).virtual && ds.byId.get(id).virtual;
    assert.ok(!prev || prev === id || bothListed, `"${key}" is used by ${prev} and ${id}`);
    if (!prev || !ds.byId.get(id).virtual) owner.set(key, id);
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

// Official lists name one institution in different ways (an Entity List
// spelling, an SDN legal name, a Canadian translation). Each is merged into
// one record by setting the entries' `institution`, which the sync keeps, so
// a record never says "Not listed" for a list it is on.
const listedOn = (id) => ds.byId.get(id)?.listings.filter((l) => l.status === 'listed').map((l) => l.listId).sort();

test('an institution named differently on several lists is one record carrying all of them', () => {
  const expected = {
    'moscow-institute-of-physics-and-technology': ['ca-sanctions', 'us-1286', 'us-entity-list', 'us-sdn'],
    'federal-state-financed-institution-of-science-physics-and-technology-institute-n': ['ca-sanctions', 'us-sdn'],
    'institute-of-physics-named-after-p-n-lebedev-of-the-russian-academy-of-sciences': ['ca-sanctions', 'us-1286', 'us-entity-list', 'us-sdn'],
    'all-russian-scientific-research-institute-of-experimental-physics-vniief': ['ca-sanctions', 'us-entity-list', 'us-sdn'],
    'all-russian-scientific-research-institute-of-technical-physics-vniitf': ['ca-sanctions', 'us-entity-list', 'us-sdn'],
    'central-research-institute-burevestnik': ['ca-sanctions', 'us-entity-list', 'us-sdn'],
    'federal-state-unitary-enterprise-central-research-institute-of-structural-materi': ['us-entity-list', 'us-sdn'],
    'institute-of-solid-state-physics-of-the-russian-academy-of-sciences': ['us-1286', 'us-entity-list', 'us-sdn'],
    'zhukovskiy-central-aerohydrodynamics-institute-tsagi': ['ca-sanctions', 'us-entity-list', 'us-sdn'],
    'iitp-ras': ['ca-nro', 'us-entity-list', 'us-sdn'],
    'northwest-institute-of-nuclear-technology': ['ca-nro', 'us-entity-list'],
    // Japan's End User List gives "Fater Engineering Institute" as another name of the Fater Institute,
    // and ties the US spellings of UNIIKM (Perm) and GosNIIMash (Dzerzhinsk) to the Canadian ones.
    'fater-institute': ['ca-sanctions', 'jp-eul', 'us-sdn'],
    'ural-research-institute-of-composite-materials': ['ca-sanctions', 'jp-eul', 'us-entity-list', 'us-sdn'],
    'state-scientific-research-institute-of-machine-building-bakhirev-gosniimash': ['ca-sanctions', 'jp-eul', 'us-1286', 'us-entity-list', 'us-sdn'],
  };
  for (const [id, lists] of Object.entries(expected)) assert.deepEqual(listedOn(id), lists, id);
  for (const gone of [
    'federal-state-institution-of-higher-vocational-education-moscow-institute-of-phy',
    'federal-state-financed-institution-of-science-physics-and-technology-institute-n-3',
    'russian-federal-nuclear-center-all-russian-research-institute-of-experimental-ph',
    'joint-stock-company-central-scientific-research-institute-burevestnik',
    'northwest-institute-of-nuclear-technology-in-the-science-research-nintf',
    'fater-engineering-institute',
    'ural-scientific-research-institute-for-composite-materials',
    'joint-stock-company-the-urals-scientific-research-institute-of-composite-materia',
    'state-scientific-research-institute-of-mechanical-engineering-imeni-v-v-bakhirev',
  ]) assert.equal(ds.byId.has(gone), false, gone);
  assert.equal(ds.byId.get('moscow-institute-of-physics-and-technology').name, 'Moscow Institute of Physics and Technology');
});

test('a sanctioned department shows on its university', () => {
  const units = (id) => ds.byId.get(id).units.map((u) => u.id);
  assert.ok(units('sharif-university-of-technology').includes('sharif-university-of-technology-department-of-engineering'));
  assert.ok(units('shahid-beheshti-university').includes('shahid-beheshti-university-department-of-engineering'));
});

// Different bodies whose names reduce to the same words.
const DISTINCT = [
  ['joint-stock-company-scientific-research-institute-giricond', 'joint-stock-company-scientific-research-institute-of-electronic-and-mechanical-d'],
  ['federal-state-governmental-institution-27-central-research-institute-of-the-mini', 'federal-state-governmental-institution-4-central-research-institute-of-the-minis'],
  ['46th-central-research-and-development-institute-of-the-ministry-of-defense', 'federal-state-governmental-institution-27-central-research-institute-of-the-mini'],
  ['46th-central-research-and-development-institute-of-the-ministry-of-defense', 'federal-state-governmental-institution-4-central-research-institute-of-the-minis'],
  ['institute-of-high-energy-physics', 'institute-of-theoretical-and-experimental-physics'],
  ['federal-research-center-institute-of-applied-physics-of-the-russian-academy-of-s', 'joint-stock-company-institute-of-applied-physics'],
  ['national-university-of-science-and-technology-centre-for-quantum-communications', 'national-university-of-science-and-technology-laboratory-of-superconductor-quant'],
  // Both are named after V.V. Bakhirev: NIMI (Moscow) and GosNIIMash (Dzerzhinsk).
  ['joint-stock-company-mechanical-engineering-research-institute', 'state-scientific-research-institute-of-machine-building-bakhirev-gosniimash'],
  ...['joint-stock-company-russian-research-institute-electronstandart', 'scientific-production-enterprise-almaz-jsc', 'scientific-production-enterprise-salyut-jsc', 'scientific-production-enterprise-vostok-jsc']
    .flatMap((a, i, all) => all.slice(i + 1).map((b) => [a, b])),
].map((pair) => [...pair].sort().join(' + '));

const LEGAL_FORM = new Set(('federal state unitary enterprise financed budgetary institution joint stock company jsc ao oao pao ojsc pjsc ' +
  'fsue fgup science higher education vocational educational named after the russian federation academy sciences ras ' +
  'public private limited liability llc national research center centre nrc open closed').split(' '));
const coreNames = (r) => [r.name, ...(r.aliases ?? [])]
  .flatMap((n) => [n, withoutCodes(n)].filter(Boolean))
  .map((n) => normalizePhrase(n).split(' ').filter((t) => t.length > 1 && !LEGAL_FORM.has(t)).sort().join(' '))
  .filter((core) => core.split(' ').length >= 2);

test('no two list-only records in one country are the same institution under different legal names', () => {
  const owners = new Map();
  for (const r of ds.records.filter((x) => x.virtual)) {
    for (const core of coreNames(r)) {
      const key = `${r.country}:${core}`;
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(r.id);
    }
  }
  const clashes = new Set();
  for (const ids of owners.values()) {
    const list = [...ids].sort();
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) clashes.add(`${list[i]} + ${list[j]}`);
  }
  const unexplained = [...clashes].filter((pair) => !DISTINCT.includes(pair));
  assert.deepEqual(unexplained, [], "Merge these (set the entries' institution to one id) or add them to DISTINCT");
});
