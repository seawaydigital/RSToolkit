// Affiliation matching for the tracker's search box and batch check. The
// fixtures pin the cases that matter on the record: abbreviations, Chinese
// names, email domains, and institutions whose names nest inside each other.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildMatchIndex, matchLine, matchLines, searchRecords } from '../src/tools/compliance/defence-tracker/lib/matcher.js';

const read = (f) => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'));
const index = buildMatchIndex(read('tracker-records.json'));
const norm = (ms) => ms.map(({ id, confidence }) => ({ id, confidence })).sort((a, b) => a.id.localeCompare(b.id));

for (const [i, c] of read('tracker-affiliations.json').entries()) {
  test(`case ${i + 1}: ${c.input}`, () => assert.deepEqual(norm(matchLine(c.input, index)), norm(c.expect)));
}

test('matchedBy reports how a line matched', () => {
  assert.equal(matchLine('zhang@nudt.edu.cn', index)[0].matchedBy, 'domain');
  assert.equal(matchLine('北京航空航天大学', index)[0].matchedBy, 'chinese-name');
  assert.equal(matchLine('Harbin Institute of Technology', index)[0].matchedBy, 'name');
  assert.equal(matchLine('HIT', index)[0].matchedBy, 'acronym');
  assert.equal(matchLine('Harbin Insitute of Technolgy', index)[0].matchedBy, 'similar-name');
});

// Constructor University (Bremen) once threw: "constructor" was looked up as an
// abbreviation and found Object.prototype.constructor.
test('a word that names a built-in object property is read as a plain word', () => {
  assert.deepEqual(matchLine('Constructor University, Bremen, Germany', index), []);
  const r = matchLines('Constructor University, Bremen, Germany\nHarbin Institute of Technology', index);
  assert.equal(r.lines[1].matches[0].id, 'harbin-institute-of-technology');
});

test('blank lines are skipped', () => {
  const r = matchLines('\n\n  \nHIT\n', index);
  assert.equal(r.lines.length, 1);
  assert.equal(r.truncated, false);
});

test('long pastes are capped at 2000 lines', () => {
  const r = matchLines(Array.from({ length: 2500 }, () => 'Harbin Institute of Technology').join('\n'), index);
  assert.equal(r.lines.length, 2000);
  assert.equal(r.truncated, true);
  assert.equal(r.totalLines, 2500);
});

const rec = (id, fields) => ({ id, name: id, aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [], country: 'CN', location: null, ...fields });
const at = (city) => ({ city, province: null, lat: null, lng: null });

test('a name made only of generic words confirms only when the line names its city', () => {
  const generic = buildMatchIndex([rec('institute-of-applied-physics', { name: 'Institute of Applied Physics', country: 'RU' })]);
  const [m] = matchLine('Institute of Applied Physics, Russian Academy of Sciences', generic);
  assert.equal(m.id, 'institute-of-applied-physics');
  assert.equal(m.confidence, 'check');
  const ieu = buildMatchIndex([rec('ieu', { name: 'Information Engineering University', location: at('Zhengzhou') })]);
  assert.deepEqual(norm(matchLine('Information Engineering University, Zhengzhou, China', ieu)), [{ id: 'ieu', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('Information Engineering University, China', ieu)), [{ id: 'ieu', confidence: 'check' }]);
});

test('a name used worldwide confirms only when the line places it in the institution’s country', () => {
  const ndu = buildMatchIndex([rec('ndu', { name: 'National Defense University', location: at('Beijing') })]);
  assert.deepEqual(matchLine('National Defense University, Washington, DC, USA', ndu), []);
  assert.deepEqual(matchLine('National Defence University, Islamabad, Pakistan', ndu), []);
  assert.deepEqual(norm(matchLine('National Defense University', ndu)), [{ id: 'ndu', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('National Defense University, Beijing, China', ndu)), [{ id: 'ndu', confidence: 'confirmed' }]);
});

test('a name that carries its own place confirms without more context', () => {
  const hit = buildMatchIndex([rec('hit', { name: 'Harbin Institute of Technology', location: at('Harbin') })]);
  assert.deepEqual(norm(matchLine('Harbin Institute of Technology', hit)), [{ id: 'hit', confidence: 'confirmed' }]);
});

test('an alias confirms only when the line names the institution’s own city', () => {
  const idx = buildMatchIndex([
    rec('hebei-university', { name: 'Hebei University', aliases: ['Tianjin Normal University'], location: at('Baoding') }),
    rec('beihang', { name: 'Beihang University', aliases: ['Beijing University of Aeronautics and Astronautics'], location: at('Beijing') }),
  ]);
  assert.deepEqual(norm(matchLine('Tianjin Normal University, Tianjin, China', idx)), [{ id: 'hebei-university', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('Beijing University of Aeronautics and Astronautics', idx)), [{ id: 'beihang', confidence: 'confirmed' }]);
});

test('a specific alias of a list-only record confirms when the line names its country', () => {
  const ioffe = buildMatchIndex([rec('ioffe', { name: 'Physics and Technology Institute named after A.F. Ioffe', aliases: ['Ioffe Institute', 'Institute of Applied Physics'], country: 'RU' })]);
  assert.deepEqual(norm(matchLine('Ioffe Institute, St. Petersburg, Russia', ioffe)), [{ id: 'ioffe', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('Ioffe Institute', ioffe)), [{ id: 'ioffe', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('Institute of Applied Physics, Moscow, Russia', ioffe)), [{ id: 'ioffe', confidence: 'check' }]);
});

test('a line placed in Taiwan never confirms a mainland institution', () => {
  const soochow = buildMatchIndex([rec('soochow', { name: 'Soochow University', location: at('Suzhou') })]);
  assert.deepEqual(matchLine('Soochow University, Taipei, Taiwan', soochow), []);
  assert.deepEqual(matchLine('Soochow University, Taipei, Republic of China', soochow), []);
  assert.deepEqual(norm(matchLine('Soochow University, Taiwan, China', soochow)), [{ id: 'soochow', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('Soochow University, Suzhou, China', soochow)), [{ id: 'soochow', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('Soochow University, People’s Republic of China', soochow)), [{ id: 'soochow', confidence: 'confirmed' }]);
});

test('each affiliation in a line is judged by its own place', () => {
  const idx = buildMatchIndex([
    rec('hit', { name: 'Harbin Institute of Technology', location: at('Harbin') }),
    rec('neu', { name: 'Northeastern University', location: at('Shenyang') }),
  ]);
  assert.deepEqual(norm(matchLine('Harbin Institute of Technology, Harbin, China; Northeastern University, Boston, MA, USA', idx)), [{ id: 'hit', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('Harbin Institute of Technology, Harbin, China; Northeastern University', idx)), [
    { id: 'hit', confidence: 'confirmed' },
    { id: 'neu', confidence: 'confirmed' },
  ]);
});

test('a name two institutions share is only ever a check', () => {
  const idx = buildMatchIndex([
    rec('naval-research-academy', { name: 'Naval Research Academy', aliases: ['Naval Academy'], location: at('Beijing') }),
    rec('dalian-naval-academy', { name: 'Dalian Naval Academy', aliases: ['Naval Academy'], location: at('Dalian') }),
  ]);
  assert.deepEqual(norm(matchLine('Naval Academy, Beijing, China', idx)), [
    { id: 'dalian-naval-academy', confidence: 'check' },
    { id: 'naval-research-academy', confidence: 'check' },
  ]);
});

test('generic parts of a listed name are not matched on their own', () => {
  const idx = buildMatchIndex([rec('cetc-29', { name: 'China Electronics Technology Group Corporation 29, Research Institute' })]);
  assert.deepEqual(matchLine('Sunnybrook Research Institute, Toronto', idx), []);
});

test('acronyms: at least three letters, no parent abbreviations, and country context inside a longer line', () => {
  const idx = buildMatchIndex([
    rec('nanjing-university', { name: 'Nanjing University', acronyms: ['NU', 'NJU'], location: at('Nanjing') }),
    rec('cas-ntsc', { name: 'National Time Service Center', acronyms: ['CAS', 'NTSC'], location: at('Xi’an') }),
    rec('cas-ict', { name: 'Institute of Computing Technology', acronyms: ['ICT'], location: at('Beijing') }),
  ]);
  assert.deepEqual(matchLine('NU', idx), []);
  assert.deepEqual(matchLine('Institute of Chemistry, CAS, Beijing', idx), []);
  assert.deepEqual(matchLine('Department of ICT, University of Agder, Norway', idx), []);
  assert.deepEqual(matchLine('ICT Department, Toronto', idx), []);
  assert.deepEqual(norm(matchLine('ICT', idx)), [{ id: 'cas-ict', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('ICT, Beijing', idx)), [{ id: 'cas-ict', confidence: 'check' }]);
});

test('a Chinese short form gives only a check, and a full name confirms', () => {
  const idx = buildMatchIndex([
    rec('cec', { name: 'China Electronics Corporation', zh: '中国电子信息产业集团有限公司', zhAliases: ['中国电子'] }),
    rec('hit', { name: 'Harbin Institute of Technology', zh: '哈尔滨工业大学', location: at('Harbin') }),
  ]);
  assert.deepEqual(norm(matchLine('中国电子学会', idx)), [{ id: 'cec', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('哈尔滨工业大学宇航学院', idx)), [{ id: 'hit', confidence: 'confirmed' }]);
});

test('a traditional-script or Taiwan line never confirms a mainland institution by its Chinese name', () => {
  const idx = buildMatchIndex([rec('donghua', { name: 'Donghua University', zh: '东华大学', zhAliases: ['東華大學'], location: at('Shanghai') })]);
  assert.deepEqual(norm(matchLine('國立東華大學', idx)), [{ id: 'donghua', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('东华大学', idx)), [{ id: 'donghua', confidence: 'confirmed' }]);
});

// 国际关系学院 is the University of International Relations, and also what
// many universities call their school of international relations.
const schools = () =>
  buildMatchIndex([
    rec('uir', { name: 'University of International Relations', zh: '国际关系学院', location: at('Beijing') }),
    rec('pku', { name: 'Peking University', zh: '北京大学', location: at('Beijing') }),
    rec('hit', { name: 'Harbin Institute of Technology', zh: '哈尔滨工业大学', location: at('Harbin') }),
    rec('hit-astronautics', { name: 'School of Astronautics', zh: '航天学院', parent: 'hit', location: at('Harbin') }),
  ]);

test('a school’s name straight after a university’s is that university’s school', () => {
  assert.deepEqual(norm(matchLine('北京大学国际关系学院', schools())), [{ id: 'pku', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('北京大学 国际关系学院', schools())), [{ id: 'pku', confidence: 'confirmed' }]);
  assert.deepEqual(matchLine('暨南大学国际关系学院', schools()), []);
});

test('a school-like name still confirms on its own, after a place, after its own name, or in a list', () => {
  assert.deepEqual(norm(matchLine('国际关系学院', schools())), [{ id: 'uir', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('北京市海淀区国际关系学院', schools())), [{ id: 'uir', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('国际关系学院国家安全学院', schools())), [{ id: 'uir', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('北京大学、国际关系学院', schools())), [
    { id: 'pku', confidence: 'confirmed' },
    { id: 'uir', confidence: 'confirmed' },
  ]);
  // Only a school's name reads as another university's unit, not a university's.
  assert.deepEqual(norm(matchLine('北京大学哈尔滨工业大学', schools())), [
    { id: 'hit', confidence: 'confirmed' },
    { id: 'pku', confidence: 'confirmed' },
  ]);
});

test('a listed school matches after its own university’s name, not another’s', () => {
  assert.deepEqual(norm(matchLine('哈尔滨工业大学航天学院', schools())), [
    { id: 'hit', confidence: 'confirmed' },
    { id: 'hit-astronautics', confidence: 'confirmed' },
  ]);
  assert.deepEqual(norm(matchLine('北京大学航天学院', schools())), [{ id: 'pku', confidence: 'confirmed' }]);
});

test('a bracketed code is not part of the name, but a bracketed place is', () => {
  const idx = buildMatchIndex([
    rec('cetc-14', { name: 'China Electronics Technology Group Corporation 14th Research Institute (CETC 14)' }),
    rec('cug-wuhan', { name: 'China University of Geosciences (Wuhan)', location: at('Wuhan') }),
  ]);
  assert.deepEqual(norm(matchLine('China Electronics Technology Group Corporation 14th Research Institute, Nanjing, China', idx)), [{ id: 'cetc-14', confidence: 'confirmed' }]);
  assert.deepEqual(norm(matchLine('China University of Geosciences, Beijing, China', idx)), [{ id: 'cug-wuhan', confidence: 'check' }]);
});

test('Airforce and Air Force spell the same name', () => {
  const af = buildMatchIndex([{ id: 'air-force-engineering-university', name: 'Air Force Engineering University', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [], country: 'CN' }]);
  assert.deepEqual(norm(matchLine('Airforce Engineering University, Xi’an', af)), [{ id: 'air-force-engineering-university', confidence: 'confirmed' }]);
});

test("a listed unit's parent name never matches the unit", () => {
  const unit = (id, name) => ({ id, name, aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] });
  // The parent comes first in one listed name and last in the other.
  const idx = buildMatchIndex([
    unit('cas-ntsc', 'Chinese Academy of Sciences, National Time Service Center'),
    unit('cas-air', 'Aerospace Information Research Institute, Chinese Academy of Sciences'),
  ]);
  assert.deepEqual(matchLine('Institute of Automation, Chinese Academy of Sciences', idx), []);
  assert.deepEqual(norm(matchLine('National Time Service Center, Chinese Academy of Sciences, Xi’an', idx)), [{ id: 'cas-ntsc', confidence: 'check' }]);
  assert.deepEqual(norm(matchLine('Aerospace Information Research Institute, CAS, Beijing', idx)), [{ id: 'cas-air', confidence: 'check' }]);
});

test('a different compass direction is never a spelling slip', () => {
  const ne = buildMatchIndex([{ id: 'northeastern-university', name: 'Northeastern University', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }]);
  assert.deepEqual(matchLine('Northwestern University, Evanston, IL', ne), []);
  assert.deepEqual(matchLine('Southwest University', buildMatchIndex([{ id: 'southeast-university', name: 'Southeast University', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }])), []);
});

test('personal email domains never match', () => {
  assert.deepEqual(matchLine('wang@163.com; li@gmail.com; x@qq.com', index), []);
});

test('searchRecords keeps fuzzy guesses out when the query is found directly', () => {
  assert.deepEqual(searchRecords('HIT', index), ['harbin-institute-of-technology']);
  assert.deepEqual(searchRecords('nwpu.edu.cn', index), ['northwestern-polytechnical-university']);
  assert.deepEqual(new Set(searchRecords('harbin', index)), new Set(['harbin-institute-of-technology', 'harbin-engineering-university']));
});

test('searchRecords falls back to fuzzy matching for typos', () => {
  assert.ok(searchRecords('Harbin Instute of Technolgy', index).includes('harbin-institute-of-technology'));
});

test('searchRecords ranks exact identifiers first', () => {
  assert.equal(searchRecords('nwpu.edu.cn', index)[0], 'northwestern-polytechnical-university');
  assert.equal(searchRecords('哈尔滨工业大学', index)[0], 'harbin-institute-of-technology');
  const harbin = searchRecords('harbin', index);
  assert.ok(harbin.includes('harbin-institute-of-technology') && harbin.includes('harbin-engineering-university'));
  assert.deepEqual(searchRecords('   ', index), []);
});

// A unit the researcher marked as naming its parent on its own ("match": true),
// such as a university's hospital, matches the parent. Unmarked units (generic
// names like "Stomatological Hospital", campuses) never do.
const afmu = () =>
  buildMatchIndex([
    rec('afmu', {
      name: 'Air Force Medical University',
      location: at("Xi'an"),
      subunits: [
        { name: 'Xijing Hospital (First Affiliated Hospital)', zh: '西京医院', kind: 'hospital', match: true },
        { name: 'Stomatological Hospital', zh: '口腔医院', kind: 'hospital' },
      ],
    }),
  ]);

test('a marked unit matches its parent, confirmed only when the line names the parent’s city', () => {
  const [m] = matchLine("Department of Neurology, Xijing Hospital, Xi'an 710032, China", afmu());
  assert.deepEqual([m.id, m.matchedBy, m.confidence, m.unit], ['afmu', 'unit', 'confirmed', 'Xijing Hospital']);
  assert.deepEqual(norm(matchLine('Xijing Hospital', afmu())), [{ id: 'afmu', confidence: 'check' }]);
  assert.deepEqual(matchLine('Xijing Hospital, Boston, USA', afmu()), []);
});

test('a marked unit’s Chinese name confirms, a hospital’s included', () => {
  const [m] = matchLine('西京医院神经内科', afmu());
  assert.deepEqual([m.id, m.matchedBy, m.confidence, m.unit], ['afmu', 'unit', 'confirmed', 'Xijing Hospital']);
});

test('an unmarked unit never matches on its own', () => {
  assert.deepEqual(matchLine('Stomatological Hospital, Sichuan University, Chengdu, China', afmu()), []);
  assert.deepEqual(matchLine('四川大学华西口腔医院', afmu()), []);
});

test('a line that also names the parent is reported as a name match', () => {
  const [m] = matchLine("Xijing Hospital, Air Force Medical University, Xi'an, China", afmu());
  assert.deepEqual([m.matchedBy, m.confidence], ['name', 'confirmed']);
});

test('the search box finds an institution by a marked unit', () => {
  assert.deepEqual(searchRecords('Xijing', afmu()), ['afmu']);
});
