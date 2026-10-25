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

test('a name made only of generic words never confirms a match', () => {
  const generic = buildMatchIndex([{ id: 'institute-of-applied-physics', name: 'Institute of Applied Physics', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }]);
  const [m] = matchLine('Institute of Applied Physics, Russian Academy of Sciences', generic);
  assert.equal(m.id, 'institute-of-applied-physics');
  assert.equal(m.confidence, 'check');
});

test('personal email domains never match', () => {
  assert.deepEqual(matchLine('wang@163.com; li@gmail.com; x@qq.com', index), []);
});

test('searchRecords ranks exact identifiers first', () => {
  assert.equal(searchRecords('nwpu.edu.cn', index)[0], 'northwestern-polytechnical-university');
  assert.equal(searchRecords('哈尔滨工业大学', index)[0], 'harbin-institute-of-technology');
  const harbin = searchRecords('harbin', index);
  assert.ok(harbin.includes('harbin-institute-of-technology') && harbin.includes('harbin-engineering-university'));
  assert.deepEqual(searchRecords('   ', index), []);
});
