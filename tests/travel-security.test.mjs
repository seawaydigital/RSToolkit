// Research Travel Security's checklist: ids kept, items complete, links and
// contacts usable, and the host's travel consultation item present exactly
// when siteConfig.js offers one. The ids are the keys the page saves ticked
// items under in localStorage (rs-toolkit-travel-v1), so renaming or removing
// one silently drops what people have already ticked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { travelSecurityData as data } from '../src/data/travelSecurityData.js';
import { INSTITUTION_RS_CONTACT } from '../src/siteConfig.js';

// Every id the checklist has shipped with. Add new ids here; never remove one.
const SHIPPED_IDS = [
  // Before You Go
  'b-advisory', 'b-threat', 'b-consult', 'b-notify', 'b-insurance',
  'b-it', 'b-minimum', 'b-patch', 'b-external', 'b-backup',
  'b-social', 'b-visa',
  // While Away
  'd-discuss', 'd-relationships', 'd-local-law',
  'd-room', 'd-devices-sight', 'd-public-computers',
  'd-usb', 'd-wifi', 'd-cloud', 'd-report-loss',
  // When You Return
  'a-scan', 'a-gifts', 'a-credentials', 'a-report', 'a-obligations',
];
// Items that exist only when the host configures them.
const OPTIONAL = { 'b-consult': Boolean(INSTITUTION_RS_CONTACT.travelConsultation) };

const items = data.phases.flatMap((p) => p.groups.flatMap((g) => g.items));
const usable = (u) => {
  try {
    return ['https:', 'mailto:'].includes(new URL(u).protocol);
  } catch {
    return false;
  }
};

test('ids are unique, and every id the checklist has shipped with is still there', () => {
  const ids = items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate item id');
  const expected = SHIPPED_IDS.filter((id) => OPTIONAL[id] !== false);
  const missing = expected.filter((id) => !ids.includes(id));
  assert.deepEqual(missing, [], 'item ids are localStorage keys: renaming or removing one loses saved ticks');
  const unlisted = ids.filter((id) => !SHIPPED_IDS.includes(id));
  assert.deepEqual(unlisted, [], 'add each new item id to SHIPPED_IDS in this test');
});

test("the travel consultation item follows siteConfig.js", () => {
  const consult = items.find((i) => i.id === 'b-consult');
  const config = INSTITUTION_RS_CONTACT.travelConsultation;
  if (!config) {
    assert.equal(consult, undefined, 'travelConsultation is null, so the item must not show');
    return;
  }
  assert.ok(consult, 'travelConsultation is set but the item is missing');
  assert.ok(consult.text.includes(INSTITUTION_RS_CONTACT.institution), 'the item names the institution');
  assert.ok(config.detail?.trim(), 'travelConsultation.detail');
  assert.equal(consult.detail, config.detail);
  assert.ok(usable(config.url), 'travelConsultation.url must be https');
  assert.equal(consult.link.url, config.url);
});

test('every item has its text, and every link, cross-link and contact is usable', () => {
  // toolRegistry.js imports browser-only modules, so its slugs are read as text.
  const registry = readFileSync(new URL('../src/data/toolRegistry.js', import.meta.url), 'utf8');
  const slugs = new Set([...registry.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));
  for (const i of items) {
    assert.ok(i.text?.trim(), `${i.id}: text`);
    if (i.link) {
      assert.ok(i.link.label?.trim(), `${i.id}: link label`);
      assert.ok(usable(i.link.url), `${i.id}: link must be https`);
    }
    if (i.crossLink) assert.ok(slugs.has(i.crossLink.tool), `${i.id}: "${i.crossLink.tool}" is not a tool slug`);
  }
  for (const c of data.emergency.contacts) {
    assert.ok(c.label?.trim() && c.detail?.trim(), `${c.id}: label and detail`);
    assert.ok(c.phone || c.email, `${c.id}: needs a phone number or an email address`);
    if (c.email) assert.match(c.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i, `${c.id}: email`);
  }
  assert.ok(usable(data.sourceUrl), 'sourceUrl');
  assert.ok(usable(data.training.url), 'training.url');
});
