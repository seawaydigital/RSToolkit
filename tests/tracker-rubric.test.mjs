// Rating rubric v1 for the Defence Institution Tracker. The rubric is the
// published checklist behind every rating, so each rule and each guard
// (sources required, unverified records unrated, bounded overrides) is pinned.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateInstitution, RUBRIC_RULES, RUBRIC_VERSION } from '../src/tools/compliance/defence-tracker/lib/rubric.js';
import { SIGNALS } from '../src/tools/compliance/defence-tracker/lib/constants.js';

const SRC = [{ id: 's1', title: 'T', publisher: 'P', url: 'https://example.org/a', accessed: '2026-10-24',
  archive: { url: 'https://web.archive.org/web/2026/https://example.org/a' } }];
const rec = (over = {}) => ({ status: 'verified', evidence: [], sources: SRC, rating: { override: null, overrideReason: null }, ...over });
const ev = (signal, extra = {}) => ({ signal, summary: 'x', annexB: ['2.3'], sources: ['s1'], ...extra });
const LISTED = [{ listId: 'ca-nro', status: 'listed', entries: [{}] }];
const NONE = [{ listId: 'ca-nro', status: 'not-listed', entries: [] }];

test('an unresearched institution on an official list is rated High from the lists alone', () => {
  for (const status of ['seed', 'listing-only']) {
    const a = rateInstitution(rec({ status, evidence: [ev('pla')] }), LISTED);
    assert.equal(a.rating, 'high', status);
    assert.equal(a.rule, 'listed');
    assert.equal(a.basis, 'lists');
    assert.deepEqual(a.reasons.map((r) => r.listId), ['ca-nro']);
  }
});

test('an unresearched institution on no checked list is not rated', () => {
  const a = rateInstitution(rec({ status: 'seed' }), NONE);
  assert.equal(a.rating, null);
  assert.equal(a.rule, 'not-yet-rated');
  assert.equal(a.basis, null);
  const pending = rateInstitution(rec({ status: 'listing-only' }), [{ listId: 'us-1286', status: 'not-checked', entries: [] }]);
  assert.equal(pending.rating, null);
});

test('an override is never applied to a rating from the lists', () => {
  const a = rateInstitution(rec({ status: 'seed', rating: { override: 'very-high', overrideReason: 'Reported weapons work.' } }), LISTED);
  assert.equal(a.rating, 'high');
  assert.equal(a.overridden, false);
});

test('a researched profile’s rating comes from the profile', () => {
  assert.equal(rateInstitution(rec(), LISTED).basis, 'profile');
  assert.equal(rateInstitution(rec(), NONE).basis, 'profile');
});

test('any structural signal rates very high', () => {
  for (const s of ['pla', 'security-agency', 'defence-conglomerate', 'nuclear-weapons', 'seven-sons']) {
    const a = rateInstitution(rec({ evidence: [ev(s)] }), NONE);
    assert.equal(a.rating, 'very-high', s);
    assert.equal(a.rule, 'structural', s);
  }
});

test('formally listed plus major defence research rates very high', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('defence-key-labs', { count: 2 })] }), LISTED).rule, 'listed-major');
  assert.equal(rateInstitution(rec({ evidence: [ev('secrecy-qualification')] }), LISTED).rating, 'very-high');
});

test('formally listed alone rates high', () => {
  const a = rateInstitution(rec(), LISTED);
  assert.equal(a.rating, 'high');
  assert.equal(a.rule, 'listed');
});

test('major research without a listing rates high', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('defence-key-labs', { count: 2 })] }), NONE).rule, 'major-research');
  assert.equal(rateInstitution(rec({ evidence: [ev('weapons-production-licence')] }), NONE).rating, 'high');
});

test('substantial research rates high', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('defence-key-labs', { count: 1 })] }), NONE).rule, 'substantial-research');
  assert.equal(rateInstitution(rec({ evidence: [ev('sastind-coconstruction')] }), NONE).rating, 'high');
});

test('limited links rate medium; nothing rates low', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('pla-collaboration')] }), NONE).rating, 'medium');
  const low = rateInstitution(rec(), NONE);
  assert.equal(low.rating, 'low');
  assert.equal(low.rule, 'none');
});

test('misconduct and state-control evidence never drive the rating', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('misconduct'), ev('state-control')] }), NONE).rating, 'low');
});

test('evidence without a valid source does not count', () => {
  assert.equal(rateInstitution(rec({ evidence: [ev('pla', { sources: [] })] }), NONE).rating, 'low');
  assert.equal(rateInstitution(rec({ evidence: [ev('pla', { sources: ['missing'] })] }), NONE).rating, 'low');
});

test('lists that were not checked do not count as listed', () => {
  assert.equal(rateInstitution(rec(), [{ listId: 'us-1286', status: 'not-checked', entries: [] }]).rating, 'low');
});

test('a one-level override with a reason is applied', () => {
  const a = rateInstitution(rec({ evidence: [ev('pla-collaboration')], rating: { override: 'high', overrideReason: 'Reported cyber operations (s1).' } }), NONE);
  assert.equal(a.rating, 'high');
  assert.equal(a.baseRating, 'medium');
  assert.equal(a.overridden, true);
  assert.equal(a.overrideError, null);
});

test('overrides of two levels or without a reason are rejected', () => {
  const two = rateInstitution(rec({ evidence: [ev('pla-collaboration')], rating: { override: 'very-high', overrideReason: 'x' } }), NONE);
  assert.equal(two.rating, 'medium');
  assert.ok(two.overrideError);
  const noReason = rateInstitution(rec({ evidence: [ev('pla-collaboration')], rating: { override: 'high', overrideReason: '' } }), NONE);
  assert.equal(noReason.rating, 'medium');
  assert.ok(noReason.overrideError);
});

test('reasons name the signals or listings behind the rule', () => {
  assert.ok(rateInstitution(rec({ evidence: [ev('seven-sons')] }), NONE).reasons.some((r) => r.signal === 'seven-sons'));
  assert.ok(rateInstitution(rec(), LISTED).reasons.some((r) => r.listId === 'ca-nro'));
});

test('every rule id has rendered text, and the version is 1.1 (list-based ratings)', () => {
  const ids = new Set(RUBRIC_RULES.map((r) => r.id));
  for (const id of ['structural', 'listed-major', 'listed', 'major-research', 'substantial-research', 'limited-links', 'none']) assert.ok(ids.has(id), id);
  assert.equal(RUBRIC_VERSION, '1.1');
});

test('every signal has a group and a label', () => {
  for (const [key, s] of Object.entries(SIGNALS)) assert.ok(s.group && s.label, key);
});
