// Seed import: MISP galaxy values and NRO organizations become tracker
// records, enriched from ROR. Pins that ASPI's description prose never
// enters the data and that seeds carry no displayed evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assembleSeedRecords,
  findNroMatch,
  listOnlyNames,
  mergeEnrichment,
  resolveNameCollisions,
  resolveRorConflicts,
  rorAgrees,
  mispValueToRecord,
  nroOrgToRecord,
  rorToEnrichment,
} from '../scripts/tracker/lib/seed.mjs';
import { validateRecord } from '../src/tools/compliance/defence-tracker/lib/schema.js';

const MISP_HIT = {
  value: 'Harbin Institute of Technology',
  uuid: '11111111-2222-3333-4444-555555555555',
  description: 'ASPI prose — must not be imported',
  meta: {
    aliases: ['哈尔滨工业大学', 'HIT'],
    categories: ['Seven sons of national defence'],
    'supervising agencies': ['Ministry of Industry and Information Technology (MIIT)'],
    'major defence laboratories': ['Lab A (实验室)'],
    topics: ['Cyber'],
    lat: '45.74',
    long: '126.62',
    address: 'China, Heilongjiang, Harbin',
    refs: ['https://unitracker.aspi.org.au/universities/harbin-institute-of-technology/'],
  },
};

const ROR_HIT = {
  id: 'https://ror.org/01yqg2h08',
  domains: ['hit.edu.cn'],
  names: [
    { lang: null, types: ['acronym'], value: 'HIT' },
    { lang: 'en', types: ['ror_display', 'label'], value: 'Harbin Institute of Technology' },
    { lang: 'zh', types: ['label'], value: '哈尔滨工业大学' },
  ],
  links: [{ type: 'website', value: 'https://www.hit.edu.cn' }],
  external_ids: [{ type: 'wikidata', all: ['Q632558'], preferred: null }],
  locations: [{ geonames_details: { name: 'Harbin', country_subdivision_name: 'Heilongjiang', country_code: 'CN', lat: 45.75, lng: 126.65 } }],
};

test('a MISP value becomes a seed record with structured notes only', () => {
  const r = mispValueToRecord(MISP_HIT, { nroMatch: 'harbin-institute-of-technology', today: '2026-10-24' });
  assert.equal(r.id, 'harbin-institute-of-technology');
  assert.equal(r.zh, '哈尔滨工业大学');
  assert.deepEqual(r.acronyms, ['HIT']);
  assert.equal(r.type, 'university');
  assert.equal(r.status, 'seed');
  assert.deepEqual(r.evidence, []);
  assert.equal(r.ids.misp, MISP_HIT.uuid);
  assert.equal(r.ids.nro, 'harbin-institute-of-technology');
  assert.ok(!JSON.stringify(r).includes('ASPI prose'));
  assert.ok(!('description' in r) && !('description' in r.seedNotes));
  assert.deepEqual(validateRecord(r), []);
});

test('MISP categories map to institution types', () => {
  const t = (cat, value = 'X Academy') =>
    mispValueToRecord({ ...MISP_HIT, value, meta: { ...MISP_HIT.meta, categories: [cat] } }, { nroMatch: null, today: '2026-10-24' }).type;
  assert.equal(t('Military'), 'military');
  assert.equal(t('Security'), 'security');
  assert.equal(t('Defence industry conglomerate'), 'defence-industry');
  assert.equal(t('Civilian', 'Some University'), 'university');
  assert.equal(t('Civilian', 'Some Research Institute'), 'research-institute');
});

test('ROR enrichment extracts Chinese name, acronym, domain and ids', () => {
  const e = rorToEnrichment(ROR_HIT);
  assert.equal(e.ror, '01yqg2h08');
  assert.equal(e.zh, '哈尔滨工业大学');
  assert.deepEqual(e.acronyms, ['HIT']);
  assert.deepEqual(e.domains, ['hit.edu.cn']);
  assert.equal(e.wikidata, 'Q632558');
  assert.equal(e.city, 'Harbin');
  assert.equal(e.countryCode, 'CN');
});

test('merging ROR data fills gaps without overwriting curated coordinates', () => {
  const seed = mispValueToRecord({ ...MISP_HIT, meta: { ...MISP_HIT.meta, aliases: [] } }, { nroMatch: null, today: '2026-10-24' });
  const merged = mergeEnrichment(seed, rorToEnrichment(ROR_HIT));
  assert.equal(merged.ids.ror, '01yqg2h08');
  assert.equal(merged.zh, '哈尔滨工业大学');
  assert.deepEqual(merged.domains, ['hit.edu.cn']);
  assert.equal(merged.location.lat, 45.74);
  assert.equal(merged.location.city, 'Harbin');
  assert.deepEqual(validateRecord(merged), []);
});

test('a missing name never becomes the alias "null", and names lose stray trailing punctuation', () => {
  const seed = mispValueToRecord({ ...MISP_HIT, meta: { ...MISP_HIT.meta, aliases: [] } }, { nroMatch: null, today: '2026-10-24' });
  const merged = mergeEnrichment({ ...seed, zh: null }, { ...rorToEnrichment(ROR_HIT), zh: null, aliases: ['Hāĕrbīn Gōngyè Dàxué,', null, undefined] });
  for (const field of ['aliases', 'zhAliases', 'acronyms']) {
    assert.ok(merged[field].every((n) => typeof n === 'string' && n !== 'null' && n !== 'undefined' && !/[,;:]$/.test(n)), `${field}: ${merged[field]}`);
  }
  assert.ok(merged.aliases.includes('Hāĕrbīn Gōngyè Dàxué'));
});

test('an NRO organization becomes a listing-only record', () => {
  const r = nroOrgToRecord(
    { id: 'iitp-ras', name: 'A.A. Kharkevich Institute', aliases: ['IITP'], country: 'Russia', city: 'Moscow', lat: 55.77, lng: 37.61, parentOrg: null, notes: null },
    { today: '2026-10-24' },
  );
  assert.equal(r.status, 'listing-only');
  assert.equal(r.country, 'RU');
  assert.equal(r.ids.nro, 'iitp-ras');
  assert.deepEqual(r.acronyms, ['IITP']);
  assert.deepEqual(validateRecord(r), []);
});

test('a MISP name with a Chinese name in brackets is split', () => {
  const r = mispValueToRecord(
    { ...MISP_HIT, value: 'Harbin Engineering University (哈尔滨工程大学)', meta: { ...MISP_HIT.meta, aliases: [] } },
    { nroMatch: null, today: '2026-10-24' },
  );
  assert.equal(r.name, 'Harbin Engineering University');
  assert.equal(r.zh, '哈尔滨工程大学');
  assert.equal(r.id, 'harbin-engineering-university');
});

test('NRO matching reads past bracketed Chinese names, generic names and Airforce spellings', () => {
  const orgs = [
    { id: 'harbin-engineering-university', name: 'Harbin Engineering University', aliases: ['HEU'], parentOrg: null },
    { id: 'information-engineering-university', name: 'Information Engineering University', aliases: [], parentOrg: null },
    { id: 'airforce-engineering-university', name: 'Airforce Engineering University', aliases: [], parentOrg: null },
  ];
  const m = (value) => findNroMatch({ value, meta: { aliases: [] } }, orgs);
  assert.equal(m('Harbin Engineering University (哈尔滨工程大学)'), 'harbin-engineering-university');
  assert.equal(m('Information Engineering University (中国人民解放军信息工程大学)'), 'information-engineering-university');
  assert.equal(m('Air Force Engineering University (中国人民解放军空军工程大学)'), 'airforce-engineering-university');
});

test('assembly merges an NRO organization into the MISP seed for the same institution', () => {
  const { records } = assembleSeedRecords({
    mispValues: [{ ...MISP_HIT, value: 'Harbin Engineering University (哈尔滨工程大学)', meta: { ...MISP_HIT.meta, aliases: [] } }],
    nroOrgs: [
      { id: 'harbin-engineering-university', name: 'Harbin Engineering University', aliases: ['HEU'], country: 'China', city: 'Harbin', lat: 45.77, lng: 126.68, parentOrg: null, notes: null },
      { id: 'iitp-ras', name: 'A.A. Kharkevich Institute', aliases: ['IITP'], country: 'Russia', city: 'Moscow', lat: 55.77, lng: 37.61, parentOrg: null, notes: null },
    ],
    existing: [],
    today: '2026-10-24',
  });
  assert.equal(records.size, 2);
  const heu = records.get('harbin-engineering-university');
  assert.equal(heu.status, 'seed');
  assert.equal(heu.ids.nro, 'harbin-engineering-university');
  assert.ok(heu.seedNotes);
  assert.equal(heu.location.lat, 45.77);
  assert.equal(records.get('iitp-ras').status, 'listing-only');
});

test('a ROR match chosen for several records stays with the record that carries its name', () => {
  const records = new Map([
    ['beijing-computational-science-research-centre', { id: 'beijing-computational-science-research-centre', name: 'Beijing Computational Science Research Centre', aliases: [], parent: null }],
    ['chinese-academy-of-engineering-physics', { id: 'chinese-academy-of-engineering-physics', name: 'Chinese Academy of Engineering Physics', aliases: ['China Academy of Engineering Physics'], parent: null }],
  ]);
  const e = { ror: '00z3yke57', display: 'China Academy of Engineering Physics', aliases: ['China Academy of Engineering Physics'] };
  const enrichment = new Map([
    ['beijing-computational-science-research-centre', e],
    ['chinese-academy-of-engineering-physics', e],
  ]);
  const dropped = resolveRorConflicts(enrichment, records);
  assert.deepEqual([...enrichment.keys()], ['chinese-academy-of-engineering-physics']);
  assert.deepEqual(dropped, ['beijing-computational-science-research-centre (00z3yke57, kept by chinese-academy-of-engineering-physics)']);
});

test("an alias that is another record's own name is removed", () => {
  const rec = (id, name, aliases = [], zh = null, zhAliases = []) => ({ id, name, aliases, zh, zhAliases });
  const records = new Map([
    ['chinese-academy-of-engineering-physics', rec('chinese-academy-of-engineering-physics', 'Chinese Academy of Engineering Physics',
      ['China Academy of Engineering Physics', 'Beijing Computational Science Research Center', 'Peac Institute of Multiscale Science', 'Ninth Academy'],
      '中国工程物理研究院', ['北京计算科学研究中心'])],
    ['beijing-computational-science-research-centre', rec('beijing-computational-science-research-centre', 'Beijing Computational Science Research Centre', [], '北京计算科学研究中心')],
    ['peac-institute-of-multiscale-science', rec('peac-institute-of-multiscale-science', 'Peac Institute of Multiscale Science')],
  ]);
  const removed = resolveNameCollisions(records);
  assert.deepEqual(records.get('chinese-academy-of-engineering-physics').aliases, ['China Academy of Engineering Physics', 'Ninth Academy']);
  assert.deepEqual(records.get('chinese-academy-of-engineering-physics').zhAliases, []);
  assert.equal(records.get('beijing-computational-science-research-centre').zh, '北京计算科学研究中心');
  assert.equal(removed.length, 3);
});

// MISP lists CASC's academies and institutes as CASC's aliases. Once an
// official list gives one of them a record of its own, a re-import must not
// hand its names back to CASC.
test('a seed alias that an official list gives a list-only body is removed from the seed', () => {
  const rec = (id, name, aliases = []) => ({ id, name, aliases, zh: null, zhAliases: [] });
  const records = new Map([
    ['casc', rec('casc', 'China Aerospace Science and Technology Corporation', ['China Academy of Space Technology (CAST)', 'Beijing Institute of Space System Engineering', 'Beijing Aerospace Automatic Control Institute'])],
    ['caep', rec('caep', 'Chinese Academy of Engineering Physics', ['Ninth Academy'])],
    ['caep-902', rec('caep-902', 'Southwest Institute of Nuclear Physics and Chemistry', ["China Academy of Engineering Physics (CAEP)'s 902 Institute"])],
  ]);
  const snapshots = {
    'jp-meti-eul': {
      entries: [
        { key: 'eul:1', name: 'China Academy of Space Technology (CAST)', altNames: ['5th Academy of China Aerospace Science and Technology Corporation'], institution: 'cast' },
        // The sync also compares names without their brackets.
        { key: 'eul:2', name: 'Beijing Aerospace Automatic Control Institute (BICD)', altNames: [], institution: 'casc-12th-institute' },
      ],
    },
    // An entry for a body that has a file keeps its names where they are.
    'us-csl': { entries: [{ key: 'csl:1', name: 'Chinese Academy of Engineering Physics', altNames: ['Ninth Academy', "China Academy of Engineering Physics (CAEP)'s 902 Institute"], institution: 'caep' }] },
  };
  const removed = resolveNameCollisions(records, { listed: listOnlyNames(snapshots, new Set(records.keys())) });
  assert.deepEqual(records.get('casc').aliases, ['Beijing Institute of Space System Engineering']);
  assert.deepEqual(records.get('caep').aliases, ['Ninth Academy']);
  assert.deepEqual(records.get('caep-902').aliases, ["China Academy of Engineering Physics (CAEP)'s 902 Institute"]);
  assert.deepEqual(removed, [
    '"china academy space technology cast" removed from casc (it is cast\'s name)',
    '"beijing aerospace automatic control institute" removed from casc (it is casc-12th-institute\'s name)',
  ]);
});

// The match index reads names without bracketed notes, so this alias is
// BAMTRI's own name to the list sync and the matcher.
test("a seed alias that is a listed body's name plus a bracketed note is removed", () => {
  const records = new Map([['avic', { id: 'avic', name: 'Aviation Industry Corporation of China', aliases: ['Beijing Aeronautical Manufacturing Technology Research Institute (a.k.a. AVIC Institute 625)'], zh: null, zhAliases: [] }]]);
  const snapshots = { 'us-csl': { entries: [{ key: 'csl:1', name: 'Beijing Aeronautical Manufacturing Technology Research Institute', altNames: ['BAMTRI'], institution: 'bamtri' }] } };
  resolveNameCollisions(records, { listed: listOnlyNames(snapshots, new Set(records.keys())) });
  assert.deepEqual(records.get('avic').aliases, []);
});

test('a ROR match is accepted only when its names agree with the record', () => {
  const caep = { name: 'Chinese Academy of Engineering Physics', aliases: ['China Academy of Engineering Physics'], zh: '中国工程物理研究院' };
  const cae = { display: 'Chinese Academy of Engineering', aliases: ['Chinese Academy of Engineering'], zh: '中国工程院', zhAliases: [] };
  assert.equal(rorAgrees(caep, cae), false);
  const hit = { name: 'Harbin Institute of Technology', aliases: [], zh: '哈尔滨工业大学' };
  assert.equal(rorAgrees(hit, rorToEnrichment(ROR_HIT)), true);
  assert.equal(rorAgrees({ ...hit, zh: '哈尔滨工程大学' }, rorToEnrichment(ROR_HIT)), false);
});

test('Chinese names agree when one is the full form of the other', () => {
  const nudt = { name: 'National University of Defense Technology', aliases: [], zh: '中国人民解放军国防科技大学' };
  assert.equal(rorAgrees(nudt, { display: 'National University of Defense Technology', aliases: [], zh: '国防科技大学', zhAliases: [] }), true);
  const cnnc = { name: 'China National Nuclear Corporation', aliases: [], zh: '中国核工业集团有限公司' };
  assert.equal(rorAgrees(cnnc, { display: 'China National Nuclear Corporation', aliases: [], zh: '中国核工业集团公司', zhAliases: [] }), true);
  // NUDT's older official name spells 科技 out as 科学技术.
  assert.equal(rorAgrees(nudt, { display: 'National University of Defense Technology', aliases: [], zh: '中国人民解放军国防科学技术大学', zhAliases: [] }), true);
  // Any of the record's Chinese names can agree, not only the first.
  const amu = { name: 'Army Medical University', aliases: [], zh: '中国人民解放军陆军军医大学', zhAliases: ['中国人民解放军第三军医大学'] };
  assert.equal(rorAgrees(amu, { display: 'Army Medical University', aliases: [], zh: '中国人民解放军第三军医大学', zhAliases: [] }), true);
});

test('NRO matching prefers the top-level entry over a split-out alias', () => {
  const orgs = [
    { id: 'caep-peac', name: 'Peac Institute of Multiscale Science (CAEP)', aliases: ['Peak Multiscale Science Institute'], parentOrg: 'chinese-academy-of-engineering-physics' },
    { id: 'peac', name: 'Peac Institute of Multiscale Science', aliases: ['Peak Multiscale Science Institute'], parentOrg: null },
  ];
  assert.equal(findNroMatch({ value: 'PEAC Institute of Multiscale Sciences', meta: { aliases: [] } }, orgs), 'peac');
  assert.equal(findNroMatch({ value: 'Unrelated University', meta: { aliases: [] } }, orgs), null);
});
