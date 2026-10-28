// Hash routing with sub-routes: #tool and #tool/sub. The tracker uses the
// sub-route for citable institution permalinks, so malformed or unknown
// addresses must resolve to a not-found view, never a crash.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHashRoute } from '../src/routing.js';
import { resolveTrackerView } from '../src/tools/compliance/defence-tracker/lib/views.js';

const cases = [
  ['', { route: null, subRoute: '' }],
  ['#', { route: null, subRoute: '' }],
  ['#/', { route: null, subRoute: '' }],
  ['#nro-lookup', { route: 'nro-lookup', subRoute: '' }],
  ['#/nro-lookup', { route: 'nro-lookup', subRoute: '' }],
  ['#defence-tracker/harbin-institute-of-technology', { route: 'defence-tracker', subRoute: 'harbin-institute-of-technology' }],
  ['#defence-tracker/batch', { route: 'defence-tracker', subRoute: 'batch' }],
  ['#defence-tracker/', { route: 'defence-tracker', subRoute: '' }],
  ['#defence-tracker/a%20b', { route: 'defence-tracker', subRoute: 'a b' }],
  ['#defence-tracker/%E0%A4%A', { route: 'defence-tracker', subRoute: null }],
];
for (const [hash, expected] of cases) {
  test(`parseHashRoute(${JSON.stringify(hash)})`, () => assert.deepEqual(parseHashRoute(hash), expected));
}

test('resolveTrackerView maps sub-routes to views', () => {
  const has = (id) => id === 'harbin-institute-of-technology';
  assert.deepEqual(resolveTrackerView('', has), { view: 'search' });
  assert.deepEqual(resolveTrackerView('batch', has), { view: 'batch' });
  assert.deepEqual(resolveTrackerView('methodology', has), { view: 'methodology' });
  assert.deepEqual(resolveTrackerView('harbin-institute-of-technology', has), { view: 'profile', id: 'harbin-institute-of-technology' });
  assert.deepEqual(resolveTrackerView('nope', has), { view: 'not-found' });
  assert.deepEqual(resolveTrackerView(null, has), { view: 'not-found' });
});
