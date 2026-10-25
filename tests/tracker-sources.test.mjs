// Source upkeep: which sources get checked, how dead links and missing
// archives are reported, and how a suspect Wayback capture is recognised.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkSources,
  collectSources,
  looksLikeBlockedCapture,
  waybackSnapshotUrl,
} from '../scripts/tracker/lib/sources.mjs';

const page = 'x'.repeat(5000);

test('blocked or empty captures are flagged', () => {
  assert.equal(looksLikeBlockedCapture({ status: 200, body: page }), false);
  assert.equal(looksLikeBlockedCapture({ status: 403, body: page }), true);
  assert.equal(looksLikeBlockedCapture({ status: 200, body: 'tiny' }), true);
  assert.equal(looksLikeBlockedCapture({ status: 200, body: page + '请输入验证码' }), true);
  assert.equal(looksLikeBlockedCapture({ status: 200, body: page + '<h1>Access Denied</h1>' }), true);
  assert.equal(looksLikeBlockedCapture({ status: 200, body: page + 'Please verify you are human' }), true);
});

test('size is measured in bytes, so a short Chinese page is not mistaken for an empty one', () => {
  assert.equal(looksLikeBlockedCapture({ status: 200, body: '中'.repeat(700) }), false); // 2,100 bytes
  assert.equal(looksLikeBlockedCapture({ status: 200, body: '中'.repeat(600) }), true); // 1,800 bytes
});

test('a reCAPTCHA script on an ordinary page does not make the capture suspect', () => {
  const body = `${page}<script src="https://www.google.com/recaptcha/api.js"></script><script>grecaptcha.ready(() => {})</script>`;
  assert.equal(looksLikeBlockedCapture({ status: 200, body }), false);
});

test('only sources on verified records are collected', () => {
  const entries = collectSources([
    { id: 'verified-one', status: 'verified', sources: [{ id: 's1', url: 'https://a.example/1' }, { id: 's2', url: 'https://a.example/2' }] },
    { id: 'seed-one', status: 'seed', sources: [{ id: 's1', url: 'https://b.example/1' }] },
    { id: 'listing-one', status: 'listing-only' },
  ]);
  assert.deepEqual(entries.map((e) => `${e.recordId}/${e.source.id}`), ['verified-one/s1', 'verified-one/s2']);
});

test('checkSources reports dead links and missing archives', async () => {
  const fetchImpl = async (url) => ({ ok: !url.includes('dead'), status: url.includes('dead') ? 404 : 200 });
  const r = await checkSources(
    [
      { recordId: 'a', source: { id: 's1', url: 'https://x/dead', archive: { url: 'https://web.archive.org/x' } } },
      { recordId: 'a', source: { id: 's2', url: 'https://x/ok' } },
      { recordId: 'a', source: { id: 's3', url: 'https://x/ok2', archive: { unavailable: 'Site blocks archiving.' } } },
    ],
    { fetchImpl },
  );
  assert.deepEqual(r.dead.map((d) => d.source.id), ['s1']);
  assert.equal(r.dead[0].status, 404);
  assert.deepEqual(r.missingArchive.map((d) => d.source.id), ['s2']);
});

test('a network error counts as a dead link and keeps its reason', async () => {
  const fetchImpl = async () => {
    throw new Error('getaddrinfo ENOTFOUND x');
  };
  const r = await checkSources([{ recordId: 'a', source: { id: 's1', url: 'https://x/gone', archive: { url: 'https://web.archive.org/x' } } }], { fetchImpl });
  assert.equal(r.dead.length, 1);
  assert.match(r.dead[0].error, /ENOTFOUND/);
});

test('Node fetch’s generic "fetch failed" keeps the underlying cause', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed', { cause: Object.assign(new Error('getaddrinfo ENOTFOUND x'), { code: 'ENOTFOUND' }) });
  };
  const r = await checkSources([{ recordId: 'a', source: { id: 's1', url: 'https://x/gone', archive: { url: 'https://web.archive.org/x' } } }], { fetchImpl });
  assert.equal(r.dead[0].error, 'fetch failed (ENOTFOUND)');
});

test('checkSources never has more requests open than its concurrency', async () => {
  let open = 0;
  let peak = 0;
  const fetchImpl = async () => {
    open++;
    peak = Math.max(peak, open);
    await new Promise((resolve) => setTimeout(resolve, 5));
    open--;
    return { ok: true, status: 200 };
  };
  const entries = Array.from({ length: 10 }, (_, i) => ({ recordId: 'a', source: { id: `s${i}`, url: `https://x/${i}`, archive: { url: 'https://web.archive.org/x' } } }));
  const r = await checkSources(entries, { fetchImpl, concurrency: 3 });
  assert.equal(peak, 3);
  assert.deepEqual(r, { dead: [], missingArchive: [] });
});

test('the Wayback snapshot address comes from the final URL or Content-Location', () => {
  const snapshot = 'https://web.archive.org/web/20261025120000/https://www.hit.edu.cn/about';
  assert.equal(waybackSnapshotUrl({ url: snapshot, headers: new Headers() }), snapshot);
  assert.equal(
    waybackSnapshotUrl({ url: 'https://web.archive.org/save/https://www.hit.edu.cn/about', headers: new Headers({ 'content-location': '/web/20261025120000/https://www.hit.edu.cn/about' }) }),
    snapshot,
  );
  assert.equal(waybackSnapshotUrl({ url: 'https://web.archive.org/save/https://www.hit.edu.cn/about', headers: new Headers() }), null);
});
