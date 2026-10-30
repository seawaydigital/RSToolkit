// The OpenSanctions client, against a fake fetch: request shape, the
// concurrency limit, retries, cancelling, and how results are classified.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyRejectedError, buildQuery, listDatasets, matchUrl, resultLabel, screenRows, summarize } from '../src/tools/compliance/screening/lib/client.js';

const row = (name, schema = 'Organization', extra = {}) => ({ name, schema, country: '', birthDate: '', ...extra });
const json = (status, body, headers = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  headers: { get: (h) => headers[h] ?? null },
  json: async () => body,
});
const responseFor = (results) => ({ responses: { q: { status: 200, results, total: { value: results.length } } }, limit: 5 });
const answer = (results) => responseFor(results).responses.q;
const result = (id, score, match, extra = {}) => ({ id, caption: id, schema: 'Organization', score, match, datasets: ['us_trade_csl', 'ext_ror'], properties: { topics: ['export.control'], country: ['cn'] }, ...extra });

test('queries use nationality for people and country for organizations', () => {
  assert.deepEqual(buildQuery(row('Wei Zhang', 'Person', { country: 'cn', birthDate: '1980' })), {
    schema: 'Person',
    properties: { name: ['Wei Zhang'], birthDate: ['1980'], nationality: ['cn'] },
  });
  assert.deepEqual(buildQuery(row('Harbin Institute of Technology', 'Organization', { country: 'cn' })), {
    schema: 'Organization',
    properties: { name: ['Harbin Institute of Technology'], country: ['cn'] },
  });
  assert.deepEqual(buildQuery(row('Rosatom', 'LegalEntity')), { schema: 'LegalEntity', properties: { name: ['Rosatom'] } });
});

test('the key goes in the query string of the API host only', () => {
  const url = new URL(matchUrl({ dataset: 'sanctions', key: 'k&y', threshold: 0.7 }));
  assert.equal(url.origin, 'https://api.opensanctions.org');
  assert.equal(url.pathname, '/match/sanctions');
  assert.equal(url.searchParams.get('api_key'), 'k&y');
  assert.equal(url.searchParams.get('threshold'), '0.7');
});

test('results: match, possible, none; enrichment sources are not lists', () => {
  const m = summarize(answer([result('a', 0.62, false), result('b', 0.95, true)]));
  assert.equal(m.status, 'match');
  assert.equal(m.candidates[0].id, 'b');
  assert.deepEqual(m.candidates[0].lists, ['us_trade_csl']);
  assert.deepEqual(m.candidates[0].topics, ['export.control']);
  assert.equal(m.candidates[0].url, 'https://www.opensanctions.org/entities/b/');
  assert.equal(summarize(answer([result('a', 0.55, false)])).status, 'possible');
  assert.equal(summarize(answer([result('a', 0.3, false)])).status, 'none');
  assert.equal(summarize(answer([])).status, 'none');
  assert.deepEqual(listDatasets(['ext_ror', 'us_ofac_sdn']), ['us_ofac_sdn']);
});

test('registries and enrichment sources are not shown as lists', () => {
  assert.deepEqual(
    listDatasets(['tw_shtc', 'permid', 'gem_energy_ownership', 'ir_uani_business_registry', 'wd_peps', 'gb_fcdo_sanctions', 'us_sam_exclusions']),
    ['tw_shtc', 'gb_fcdo_sanctions', 'us_sam_exclusions'],
  );
});

test('a person with only a name is a possible match at most; a country or birth date restores a match', () => {
  const hit = answer([result('a', 1, true)]);
  const nameOnly = summarize(hit, row('John Smith', 'Person'));
  assert.equal(nameOnly.status, 'possible');
  assert.equal(nameOnly.nameOnly, true);
  assert.equal(resultLabel(nameOnly), 'Possible match (name only)');
  assert.equal(summarize(hit, row('John Smith', 'Person', { country: 'us' })).status, 'match');
  assert.equal(summarize(hit, row('John Smith', 'Person', { birthDate: '1970' })).status, 'match');
  assert.equal(summarize(hit, row('Rosatom', 'LegalEntity')).status, 'match');
  assert.equal(summarize(answer([result('a', 0.3, false)]), row('John Smith', 'Person')).status, 'none');
  assert.equal(resultLabel(summarize(hit, row('Rosatom', 'Organization'))), 'Match');
});

test('at most two requests at a time, every row answered in place', async () => {
  let inFlight = 0;
  let peak = 0;
  const fetchImpl = async (url, init) => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await new Promise((r) => setTimeout(r, 5));
    inFlight--;
    const name = JSON.parse(init.body).queries.q.properties.name[0];
    return json(200, responseFor(name === 'hit' ? [result('x', 0.9, true)] : []));
  };
  const rows = ['a', 'hit', 'b', 'c', 'd'].map((n) => row(n));
  const out = [];
  await screenRows(rows, { key: 'k', fetchImpl, onResult: (i, r) => (out[i] = r.status) });
  assert.equal(peak, 2);
  assert.deepEqual(out, ['none', 'match', 'none', 'none', 'none']);
});

test('a 429 is retried after Retry-After; a failed row does not stop the run', async () => {
  const calls = {};
  const waits = [];
  const fetchImpl = async (url, init) => {
    const name = JSON.parse(init.body).queries.q.properties.name[0];
    calls[name] = (calls[name] ?? 0) + 1;
    if (name === 'busy' && calls[name] === 1) return json(429, {}, { 'Retry-After': '3' });
    if (name === 'broken') return json(500, {});
    return json(200, responseFor([]));
  };
  const out = [];
  await screenRows([row('busy'), row('broken'), row('fine')], {
    key: 'k',
    fetchImpl,
    sleep: async (ms) => waits.push(ms),
    onResult: (i, r) => (out[i] = r.status),
  });
  assert.deepEqual(waits, [3000]);
  assert.deepEqual(out, ['none', 'error', 'none']);
});

test('a rejected key stops the whole run', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return json(401, { detail: 'Invalid API key' });
  };
  await assert.rejects(screenRows([row('a'), row('b'), row('c'), row('d')], { key: 'bad', fetchImpl, concurrency: 1 }), KeyRejectedError);
  assert.equal(calls, 1);
});

test('cancelling stops before the next request', async () => {
  const ctrl = new AbortController();
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    ctrl.abort();
    return json(200, responseFor([]));
  };
  await screenRows([row('a'), row('b'), row('c')], { key: 'k', fetchImpl, signal: ctrl.signal, concurrency: 1 });
  assert.equal(calls, 1);
});
