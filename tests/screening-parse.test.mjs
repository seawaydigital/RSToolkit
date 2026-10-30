// The screening list builder's reader: messy pasted lists in, structured
// screening rows out, without losing a line silently.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_ROWS, parseDelimited, parseList, rowsToCsv } from '../src/tools/compliance/screening/lib/parseList.js';
import { countryCode } from '../src/tools/compliance/screening/lib/countries.js';

const pick = (rows) => rows.map(({ name, schema, country, birthDate }) => ({ name, schema, country, birthDate }));

test('an affiliation line gives the person and their institution, not the school', () => {
  const { rows } = parseList('1. Dr. Zhang Wei, School of Astronautics, Harbin Inst. of Tech., Harbin 150001, China');
  assert.deepEqual(pick(rows), [
    { name: 'Zhang Wei', schema: 'Person', country: '', birthDate: '' },
    { name: 'Harbin Institute of Technology', schema: 'Organization', country: 'cn', birthDate: '' },
  ]);
  assert.match(rows[0].note, /at Harbin Institute of Technology/);
  assert.equal(rows[0].source, '1. Dr. Zhang Wei, School of Astronautics, Harbin Inst. of Tech., Harbin 150001, China');
});

test('titles, suffixes, bullets and semicolon-separated parts', () => {
  const { rows } = parseList('- Prof. Maria Garcia PhD; Universidad de Chile, Santiago, Chile');
  assert.deepEqual(pick(rows), [
    { name: 'Maria Garcia', schema: 'Person', country: '', birthDate: '' },
    { name: 'Universidad de Chile', schema: 'Organization', country: 'cl', birthDate: '' },
  ]);
});

test('bracketed and trailing countries', () => {
  assert.deepEqual(pick(parseList('Bauman Moscow State Technical University (Russia)').rows), [
    { name: 'Bauman Moscow State Technical University', schema: 'Organization', country: 'ru', birthDate: '' },
  ]);
  assert.deepEqual(pick(parseList('Sharif University of Technology Iran').rows), [
    { name: 'Sharif University of Technology', schema: 'Organization', country: 'ir', birthDate: '' },
  ]);
});

test('a Chinese university name followed by its school screens the university', () => {
  assert.deepEqual(pick(parseList('北京航空航天大学 宇航学院').rows), [
    { name: '北京航空航天大学', schema: 'Organization', country: '', birthDate: '' },
  ]);
});

test('"Surname, Given" becomes one person', () => {
  assert.deepEqual(pick(parseList('Novak, Jan').rows), [{ name: 'Jan Novak', schema: 'Person', country: '', birthDate: '' }]);
});

test('dates: ISO kept, birth years kept, unclear day/month flagged and left blank', () => {
  assert.equal(parseList('Ivan Petrov 1975-04-21').rows[0].birthDate, '1975-04-21');
  assert.equal(parseList('Ivan Petrov, b. 1975').rows[0].birthDate, '1975');
  assert.equal(parseList('Ivan Petrov 21/04/1975').rows[0].birthDate, '1975-04-21');
  const unclear = parseList('John Smith 03/04/1975').rows[0];
  assert.equal(unclear.birthDate, '');
  assert.deepEqual(unclear.flags, ['date-ambiguous']);
});

test('an unrecognisable name is screened as either, flagged', () => {
  const [row] = parseList('Rosatom').rows;
  assert.equal(row.schema, 'LegalEntity');
  assert.deepEqual(row.flags, ['check-type']);
});

test('a line with only an email address is reported, not dropped silently', () => {
  const r = parseList('zhang.wei@nudt.edu.cn\nNanjing University');
  assert.deepEqual(r.skipped, ['zhang.wei@nudt.edu.cn']);
  assert.equal(r.rows.length, 1);
});

test('the email domain is kept as a note', () => {
  const [row] = parseList('Wei Zhang <zhang.wei@nudt.edu.cn>').rows;
  assert.equal(row.name, 'Wei Zhang');
  assert.match(row.note, /nudt\.edu\.cn/);
});

test('a spreadsheet paste with a header row maps its columns', () => {
  const tsv = 'Full Name\tCountry\tDate of Birth\tAffiliation\nWei Zhang\tPRC\t1980-02-03\tNUDT\nAcme Ltd\tGermany\t\t\nJane Roe\tAtlantis\t\t';
  const { rows } = parseList(tsv);
  assert.deepEqual(pick(rows), [
    { name: 'Wei Zhang', schema: 'Person', country: 'cn', birthDate: '1980-02-03' },
    { name: 'NUDT', schema: 'Organization', country: '', birthDate: '' },
    { name: 'Acme Ltd', schema: 'Organization', country: 'de', birthDate: '' },
    { name: 'Jane Roe', schema: 'Person', country: '', birthDate: '' },
  ]);
  assert.deepEqual(rows[3].flags, ['country-unknown']);
  assert.match(rows[3].note, /Atlantis/);
});

test('quoted CSV cells, including commas and line breaks', () => {
  assert.deepEqual(parseDelimited('name,note\n"Doe, Jane","line one\nline two"\n', ','), [
    ['name', 'note'],
    ['Doe, Jane', 'line one\nline two'],
  ]);
});

test('the downloaded CSV reads back exactly', () => {
  const { rows } = parseList(
    'Dr. Zhang Wei, Harbin Inst. of Tech., China\nRosatom\nIvan Petrov, b. 1975\nMaria Garcia; Universidad de Chile, Chile',
  );
  const back = parseList(rowsToCsv(rows)).rows;
  assert.deepEqual(pick(back), pick(rows));
  assert.deepEqual(back.map((r) => r.note), rows.map((r) => r.note));
});

test('duplicates are dropped and the list is capped', () => {
  assert.equal(parseList('Nanjing University\nNanjing University\nnanjing university').rows.length, 1);
  const many = Array.from({ length: MAX_ROWS + 20 }, (_, i) => `Test University ${i}`).join('\n');
  const r = parseList(many);
  assert.equal(r.rows.length, MAX_ROWS);
  assert.equal(r.truncated, true);
  assert.equal(r.totalRows, MAX_ROWS + 20);
});

test('two-letter words are countries only when they are known codes', () => {
  assert.equal(countryCode('cn'), 'cn');
  assert.equal(countryCode('P.R. China'), 'cn');
  assert.equal(countryCode('Iran (Islamic Republic of)'), 'ir');
  assert.equal(countryCode('Li'), '');
  assert.equal(countryCode('Wu'), '');
});
