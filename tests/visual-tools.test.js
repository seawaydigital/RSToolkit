import { describe, expect, it } from 'vitest';
import { distanceKm, formatDistance, parsePlaceResults, validCoordinates } from '../src/lib/geography.js';
import { layoutFlow } from '../src/lib/flowLayout.js';
import { choicesFor } from '../src/lib/flow.js';
import { nsgrpFlow } from '../src/data/flowcharts/nsgrpFlow.js';
import { stracFlow } from '../src/data/flowcharts/stracFlow.js';
import { ontarioFlow } from '../src/data/flowcharts/ontarioFlow.js';
import nroData from '../src/data/nroData.js';
import locations from '../src/data/nroLocations.json';

describe('Diagram rules stay identical to the reviewed policy graph', () => {
 it.each([nsgrpFlow, stracFlow, ontarioFlow])('$id includes every node and every labelled branch', flow => {
  const graph = layoutFlow(flow);
  expect(graph.nodes.map(n => n.id)).toEqual(flow.nodes.map(n => n.id));
  expect(graph.edges.map(e => [e.v, e.w, e.label]).sort()).toEqual(flow.nodes.flatMap(n => choicesFor(n).map(c => [n.id, c.next, c.label])).sort());
  expect(graph.edges.filter(e => e.label === 'Not sure').length).toBe(flow.nodes.filter(n => n.type === 'decision').length);
  for (const n of graph.nodes) { expect([n.x, n.y, n.width, n.height].every(Number.isFinite)).toBe(true); expect(n.width).toBeGreaterThan(0); }
 });
 it('does not collapse distinct choices which lead to the same destination', () => {
  const graph = layoutFlow({ nodes: [{ id: 'start', label: 'A shared destination', type: 'decision', yes: 'end', no: 'end', unknown: 'end' }, { id: 'end', label: 'Unresolved', type: 'end' }] });
  expect(graph.edges.map(e => e.label).sort()).toEqual(['No', 'Not sure', 'Yes']);
 });
});
describe('Geographic comparisons and untrusted location responses', () => {
 it('handles co-located, equatorial, antimeridian and antipodal points', () => {
  expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
  expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.195, 2);
  expect(distanceKm({ lat: 0, lng: 179.9 }, { lat: 0, lng: -179.9 })).toBeCloseTo(22.239, 2);
  expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })).toBeCloseTo(20015.114, 1);
 });
 it('rejects invalid coordinate types, nonfinite values and out-of-range points', () => {
  for (const [lat, lng] of [[NaN, 20], [Infinity, 0], [86, 0], [0, 181], ['40', 120], [null, 0]]) expect(validCoordinates(lat, lng)).toBe(false);
  expect(distanceKm({ lat: NaN, lng: 0 }, { lat: 0, lng: 0 })).toBeNull();
 });
 it('never formats precise metres or a clearance label', () => {
  expect(formatDistance(0.06)).toBe('Less than 1 km'); expect(formatDistance(123.456)).toBe('About 123 km'); expect(formatDistance(null)).toBe('Distance unavailable');
 });
 it('validates response shapes, Earth coordinates and source URL construction', () => {
  const good = { pageid: 123, title: '<img src=x onerror=alert(1)>', fullurl: 'javascript:alert(1)', coordinates: [{ lat: 40, lon: 116, primary: true, globe: 'earth' }] };
  const parsed = parsePlaceResults({ query: { pages: [good, { ...good, pageid: 124, coordinates: [{ lat: 90, lon: 200, globe: 'earth', primary: true }] }, { ...good, coordinates: 'bad' }, null, { ...good, pageid: 125, coordinates: [{ lat: 1, lon: 2, globe: 'moon', primary: true }] }] } });
  expect(parsed).toHaveLength(1); expect(parsed[0].label).toBe(good.title); expect(parsed[0].sourceUrl).toBe('https://en.wikipedia.org/?curid=123');
  for (const malformed of [null, [], {}, { query: { pages: 'bad' } }, { error: {} }]) expect(parsePlaceResults(malformed)).toEqual([]);
 });
 it('every bundled map point has an official organization ID and a dated location source', () => {
  expect(new Set(locations.locations.map(l => l.id)).size).toBe(locations.locations.length);
  const ids = new Set(nroData.organizations.map(o => o.id));
  for (const site of locations.locations) {
   expect(ids.has(site.organizationId)).toBe(true); expect(validCoordinates(site.lat, site.lng)).toBe(true);
   const source = new URL(site.sourceUrl); expect(source.protocol).toBe('https:'); expect(['www.wikidata.org', 'en.wikipedia.org', 'ru.wikipedia.org', 'zh.wikipedia.org', 'fa.wikipedia.org']).toContain(source.hostname);
   expect(source.searchParams.get('oldid')).toMatch(/^\d+$/); expect(site.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(site.scope).toContain('Approximate');
  }
 });
});
