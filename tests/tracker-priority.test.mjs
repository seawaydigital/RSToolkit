// The research priority queue: which unverified records to profile first, and
// when verified ones come back round for re-checking.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priorityGroup, priorityQueue } from '../scripts/tracker/lib/priority.mjs';

const listed = (...listIds) => listIds.map((listId) => ({ listId, status: 'listed' }));
const rec = (id, fields) => ({ id, name: id, country: 'CN', type: 'research-institute', status: 'seed', listings: [], seedNotes: null, verifiedOn: null, ...fields });

const records = [
  rec('g6-iran', { country: 'IR', type: 'university', listings: listed('ca-nro') }),
  rec('g5-plain', { status: 'listing-only' }),
  rec('g4-misp', { seedNotes: { categories: ['Civilian'] } }),
  rec('g3-seven-sons', { type: 'university', seedNotes: { categories: ['Seven sons of national defence'] } }),
  rec('g3-pla', { type: 'military' }),
  rec('g2-entity-list-university', { type: 'university', listings: [...listed('us-entity-list'), { listId: 'ca-nro', status: 'not-listed' }] }),
  rec('g1-nro', { type: 'research-institute', listings: listed('ca-nro') }),
  rec('verified-old', { status: 'verified', verifiedOn: '2026-01-15', listings: listed('ca-nro') }),
  rec('verified-recent', { status: 'verified', verifiedOn: '2026-09-30', listings: listed('ca-nro') }),
];

test('each record falls in the group the research plan sets', () => {
  const groups = Object.fromEntries(records.map((r) => [r.id, priorityGroup(r)]));
  assert.deepEqual(groups, {
    'g6-iran': 6,
    'g5-plain': 5,
    'g4-misp': 4,
    'g3-seven-sons': 3,
    'g3-pla': 3,
    'g2-entity-list-university': 2,
    'g1-nro': 1,
    'verified-old': 1,
    'verified-recent': 1,
  });
});

test('a US-listed Chinese body that is not a university is not group 2', () => {
  assert.equal(priorityGroup(rec('x', { type: 'company', status: 'listing-only', listings: listed('us-sdn') })), 5);
  assert.equal(priorityGroup(rec('y', { type: 'university', listings: listed('us-1286') })), 2);
});

test('the queue lists unverified records by group then name, then verified ones oldest first', () => {
  const queue = priorityQueue(records);
  assert.deepEqual(queue.map((q) => q.id), [
    'g1-nro',
    'g2-entity-list-university',
    'g3-pla',
    'g3-seven-sons',
    'g4-misp',
    'g5-plain',
    'g6-iran',
    'verified-old',
    'verified-recent',
  ]);
  assert.deepEqual(queue[0], { id: 'g1-nro', name: 'g1-nro', group: 1, status: 'seed', verifiedOn: null });
  assert.equal(queue.at(-2).verifiedOn, '2026-01-15');
});
