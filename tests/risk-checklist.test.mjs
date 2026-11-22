// The Risk Assessment Checklist's content: every item complete, every
// reference an https link, and every item id kept. The ids are the keys the
// page saves answers under in localStorage (rs-toolkit-checklist-v1), so
// renaming or removing one silently drops what people have already answered.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { riskChecklist } from '../src/data/riskChecklist.js';

// Every id the checklist has shipped with. Add new ids here; never remove one.
const SHIPPED_IDS = [
  // Research Area Assessment
  'nuclear-cbrn', 'conventional-weapons', 'missile-space', 'controlled-goods', 'sensitive-dual-use',
  'critical-minerals', 'critical-infrastructure', 'large-datasets', 'sensitive-personal-data',
  // Partner Risk Assessment
  'state-owned', 'lacks-autonomy', 'compelled-disclosure', 'partner-conduct', 'military-ties',
  'knowledge-transfer-risk', 'nro-listed',
  // Data and Infrastructure Security
  'data-storage', 'cybersecurity', 'ip-ownership', 'data-governance', 'facility-access',
  // Mitigation and Compliance Planning
  'team-strength', 'partner-motivations', 'research-use-agreement', 'export-controls',
  'no-lab-mirroring', 'partner-funding-disclosed', 'institutional-resources',
];

const items = riskChecklist.sections.flatMap((s) => s.items);
const https = (u) => {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
};

test('ids are unique, and every id the checklist has shipped with is still there', () => {
  const ids = items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate item id');
  const missing = SHIPPED_IDS.filter((id) => !ids.includes(id));
  assert.deepEqual(missing, [], 'item ids are localStorage keys: renaming or removing one loses saved answers');
  const unlisted = ids.filter((id) => !SHIPPED_IDS.includes(id));
  assert.deepEqual(unlisted, [], 'add each new item id to SHIPPED_IDS in this test');
});

test('every item has its question, its explanation and an empty starting state', () => {
  for (const i of items) {
    assert.ok(i.label?.trim().endsWith('?'), `${i.id}: label should be a question`);
    assert.ok(i.learnMore?.trim(), `${i.id}: learnMore`);
    assert.equal(i.defaultState, null, `${i.id}: defaultState`);
  }
});

test('every item cites at least one source, and every source is an https link', () => {
  assert.ok(https(riskChecklist.sourceUrl), 'sourceUrl');
  assert.match(riskChecklist.lastUpdated, /^\d{4}-\d{2}-\d{2}$/);
  for (const i of items) {
    // policyRef names a part of the NSGRP page; null means the item rests on
    // another document only, which otherRefs must then name.
    assert.ok(i.policyRef === null || i.policyRef?.trim(), `${i.id}: policyRef must be text or null`);
    const others = i.otherRefs ?? [];
    assert.ok(i.policyRef || others.length > 0, `${i.id}: cites no source`);
    for (const r of others) {
      assert.ok(r.label?.trim(), `${i.id}: a reference has no label`);
      assert.ok(https(r.url), `${i.id}: "${r.label}" is not an https link`);
    }
  }
  for (const s of riskChecklist.sections) {
    assert.ok(s.title?.trim() && s.policySource?.trim(), `${s.id}: title and policySource`);
    for (const r of s.otherSources ?? []) {
      assert.ok(r.label?.trim() && https(r.url), `${s.id}: "${r.label}"`);
    }
  }
});
