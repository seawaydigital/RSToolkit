// The cluster-map pieces NRO Lookup and the tracker's map view share, and the
// tracker's rating markers: colours, popups and which records can be mapped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../src/components/ui/map/escapeHtml.js';
import { dominantColor } from '../src/components/ui/map/clusterColor.js';
import {
  RATING_MARKER_STYLES,
  buildTrackerMarkers,
  ratingClusterColor,
} from '../src/tools/compliance/defence-tracker/lib/mapMarkers.js';

// WCAG 2.0 relative luminance and contrast ratio, for the cluster count text.
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const hue = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return null;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

const rec = (id, rating, extra = {}) => ({
  id,
  name: `Institution ${id}`,
  zh: null,
  location: { city: 'Harbin', lat: 45.7416, lng: 126.6256 },
  assessment: { rating },
  ...extra,
});

test('escapeHtml escapes the five HTML-significant characters', () => {
  assert.equal(escapeHtml(`<a href="x">Tom & Jerry's</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;');
  assert.equal(escapeHtml(42), '42');
});

test('dominantColor picks the most common colour', () => {
  assert.equal(dominantColor(['#aaaaaa', '#bbbbbb', '#bbbbbb']), '#bbbbbb');
});

test('dominantColor breaks ties toward the colour seen first, as NRO Lookup always has', () => {
  assert.equal(dominantColor(['#bbbbbb', '#aaaaaa']), '#bbbbbb');
  assert.equal(dominantColor(['#aaaaaa', '#bbbbbb', '#bbbbbb', '#aaaaaa']), '#aaaaaa');
});

test('dominantColor breaks ties by the priority list when one is given, but the count still wins', () => {
  const priority = ['#111111', '#222222'];
  assert.equal(dominantColor(['#222222', '#111111'], { priority }), '#111111');
  assert.equal(dominantColor(['#222222', '#222222', '#111111'], { priority }), '#222222');
});

test('dominantColor falls back to slate for an empty cluster', () => {
  assert.equal(dominantColor([]), '#94a3b8');
});

test('buildTrackerMarkers skips records without usable coordinates', () => {
  const markers = buildTrackerMarkers([
    rec('a', null),
    rec('b', null, { location: null }),
    rec('c', null, { location: { city: 'Xi’an', lat: null, lng: 108.9 } }),
    rec('d', null, { location: { lat: Number.NaN, lng: 108.9 } }),
    rec('e', null, { location: undefined }),
  ]);
  assert.deepEqual(markers.map((m) => m.id), ['a']);
  assert.deepEqual([markers[0].lat, markers[0].lng], [45.7416, 126.6256]);
});

test('buildTrackerMarkers colours markers by rating and draws unrated ones hollow', () => {
  const [vh, high, unrated] = buildTrackerMarkers([rec('vh', 'very-high'), rec('h', 'high'), rec('u', null)]);
  assert.equal(vh.fillColor, '#ef4444');
  assert.equal(vh.strokeColor, undefined);
  assert.equal(high.fillColor, '#f97316');
  assert.equal(unrated.fillColor, RATING_MARKER_STYLES.unrated.fillColor);
  assert.equal(unrated.strokeColor, '#64748b');
});

test('tracker popups escape every value and link to the permanent profile address', () => {
  const [m] = buildTrackerMarkers([rec('harbin-institute-of-technology', 'high', { name: '<img src=x onerror=alert(1)>', zh: '哈尔滨<工业>大学' })]);
  assert.ok(!m.popupHtml.includes('<img'), m.popupHtml);
  assert.ok(m.popupHtml.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(m.popupHtml.includes('哈尔滨&lt;工业&gt;大学'));
  assert.ok(m.popupHtml.includes('High'));
  assert.ok(m.popupHtml.includes('<a href="#defence-tracker/harbin-institute-of-technology">Open profile</a>'));
});

test('unrated popups say "Not yet rated" and leave out a missing Chinese name', () => {
  const [m] = buildTrackerMarkers([rec('x', null)]);
  assert.ok(m.popupHtml.includes('Not yet rated'));
  assert.ok(!m.popupHtml.includes('null'), m.popupHtml);
});

test('rating clusters take the most common rating, ties going to the higher rating', () => {
  const fill = (r) => RATING_MARKER_STYLES[r].fillColor;
  assert.equal(ratingClusterColor([fill('unrated'), fill('very-high')]), fill('very-high'));
  assert.equal(ratingClusterColor([fill('low'), fill('medium')]), fill('medium'));
  assert.equal(ratingClusterColor([fill('unrated'), fill('unrated'), fill('high')]), fill('unrated'));
});

test('every rating fill keeps dark cluster counts at 4.5:1 or better', () => {
  for (const [rating, { fillColor }] of Object.entries(RATING_MARKER_STYLES)) {
    const ratio = contrast(fillColor, '#061727');
    assert.ok(ratio >= 4.5, `${rating} ${fillColor}: ${ratio.toFixed(2)}:1`);
  }
});

test('rating colours are never Blaze yellow or green', () => {
  for (const [rating, { fillColor }] of Object.entries(RATING_MARKER_STYLES)) {
    const h = hue(fillColor);
    assert.ok(h === null || h < 40 || h > 175, `${rating} ${fillColor} has hue ${h?.toFixed(0)}°`);
  }
});
