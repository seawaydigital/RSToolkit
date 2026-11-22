// The Due Diligence Sources guide's content: every card complete and dated,
// every link https, and the question table pointing only at cards that exist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BADGES, dueDiligenceSourcesData as data } from '../src/data/dueDiligenceSourcesData.js';

const FIELDS = ['id', 'name', 'badge', 'runBy', 'url', 'whatItIs', 'goodFor', 'cantTell', 'reading', 'access', 'licence', 'reveals', 'checked'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const https = (u) => new URL(u).protocol === 'https:';

test('every source card has every field, filled in', () => {
  for (const s of data.sources) {
    for (const f of FIELDS) assert.ok(s[f] && (typeof s[f] !== 'string' || s[f].trim()), `${s.id}: ${f}`);
    assert.ok(s.goodFor.length > 0, `${s.id}: goodFor`);
    assert.ok(s.cantTell.length > 0, `${s.id}: cantTell`);
    assert.ok(BADGES[s.badge], `${s.id}: badge ${s.badge}`);
  }
});

test('ids are unique', () => {
  const ids = data.sources.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  const qids = data.questions.map((q) => q.id);
  assert.equal(new Set(qids).size, qids.length);
});

test('every link is https and every fact is dated against a source page', () => {
  for (const s of data.sources) {
    assert.ok(https(s.url), `${s.id}: url`);
    assert.match(s.checked.date, DATE, `${s.id}: checked.date`);
    assert.ok(https(s.checked.url), `${s.id}: checked.url`);
  }
  assert.match(data.lastUpdated, DATE);
});

test('the question table points only at cards that exist, and every card is reachable from it', () => {
  const ids = new Set(data.sources.map((s) => s.id));
  const used = new Set();
  for (const q of data.questions) {
    assert.ok(q.sources.length > 0, `${q.id}: no sources`);
    for (const id of q.sources) {
      assert.ok(ids.has(id), `${q.id}: unknown source ${id}`);
      used.add(id);
    }
    for (const t of q.tools) assert.ok(!t.flag || ['tracker', 'screening'].includes(t.flag), `${q.id}: flag ${t.flag}`);
  }
  for (const id of ids) assert.ok(used.has(id), `${id} is not reachable from any question`);
});

test('person-level sources carry the institutions-first caution', () => {
  for (const id of ['orcid', 'openalex', 'scholar-indexes']) {
    assert.equal(data.sources.find((s) => s.id === id)?.caution, true, id);
  }
});
