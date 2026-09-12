import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
 await page.clock.setFixedTime(new Date('2026-09-12T16:00:00Z'));
 // Never automate live map-tile downloads. Provider behavior is simulated here.
 await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64') }));
});
async function nro(page) { await page.goto('/#nro-lookup'); await expect(page.getByRole('heading', { name: 'NRO Lookup and Map', exact: true })).toBeVisible(); }
async function manual(page, label = 'Synthetic public campus') {
 await page.getByText('Enter coordinates locally', { exact: true }).click();
 await page.getByLabel('Public campus or building name', { exact: true }).fill(label);
 await page.getByLabel('Latitude', { exact: true }).fill('39.98'); await page.getByLabel('Longitude', { exact: true }).fill('116.341');
 await page.getByRole('button', { name: 'Review these coordinates' }).click();
}
for (const route of ['nsgrp-flowchart', 'strac-flowchart', 'ontario-flowchart']) test('visual diagram supports keyboard, all branches and text alternative: ' + route, async ({ page, browserName }) => {
 await page.goto('/#' + route); await page.getByRole('button', { name: 'Full View', exact: true }).click();
 await expect(page.getByRole('region', { name: 'Scrollable flowchart' })).toBeVisible();
 expect(await page.locator('[data-edge-label="Not sure"]').count()).toBeGreaterThan(0);
 const start = page.locator('[data-node-id="start"]'); await start.focus(); await page.keyboard.press('Enter'); await expect(start).toHaveAttribute('aria-pressed', 'true');
 await page.getByRole('button', { name: 'Actual size', exact: true }).click(); await expect(page.locator('.diagram-toolbar [role=status]')).toHaveText('100%');
 await page.getByRole('button', { name: 'Fit diagram' }).click();
 expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.map(v => v.id)).toEqual([]);
 if (browserName === 'chromium') { await mkdir('artifacts/verification', { recursive: true }); await page.locator('.diagram-viewport').screenshot({ path: 'artifacts/verification/' + route + '-restored.png' }); }
 await page.getByRole('button', { name: 'Text View', exact: true }).click(); await expect(page.getByRole('region', { name: 'Complete policy path reference' })).toBeVisible();
 await page.getByRole('button', { name: 'Guided Mode', exact: true }).click(); await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
});
test('location service failures never select a campus or imply a screening result', async ({ page }) => {
 let response = { status: 503, body: 'Unavailable' };
 await page.route('https://en.wikipedia.org/w/api.php**', route => route.fulfill(response));
 await nro(page); await page.getByText('Search for a public institution online', { exact: true }).click();
 await page.getByLabel('Allow public-place searches through Wikipedia for this visit').check();
 await page.getByLabel('Public institution or campus to find', { exact: true }).fill('Synthetic campus');
 await page.getByRole('button', { name: 'Search Wikipedia locations', exact: true }).click();
 await expect(page.getByText(/The location service is unavailable/)).toBeVisible();
 await expect(page.getByRole('button', { name: 'Use this campus or location' })).toHaveCount(0);
 response = { json: { query: { pages: [{ pageid: 22, title: 'Invalid location', coordinates: [{ lat: 999, lon: 5, primary: true, globe: 'earth' }] }] } } };
 await page.clock.setFixedTime(new Date('2026-09-12T16:00:05Z'));
 await page.getByRole('button', { name: 'Search Wikipedia locations', exact: true }).click();
 await expect(page.getByText(/No usable location was returned. This is not an NRO screening result/)).toBeVisible();
 await expect(page.getByRole('heading', { name: /Closest mapped sites/ })).toHaveCount(0);
 await page.reload(); await page.getByText('Search for a public institution online', { exact: true }).click();
 await expect(page.getByLabel('Allow public-place searches through Wikipedia for this visit')).not.toBeChecked();
});
test('visual flow and filtered map print complete text alternatives', async ({ page, browserName }) => {
 for (const route of ['nsgrp-flowchart', 'strac-flowchart', 'ontario-flowchart']) {
  await page.goto('/#' + route); await page.getByRole('button', { name: 'Full View', exact: true }).click();
  const steps = await page.locator('.diagram-node').count();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-meta')).toContainText('0.1.0-rc.2');
  await expect(page.locator('.full-flow article')).toHaveCount(steps);
  for (const heading of await page.locator('.full-flow h2').all()) await expect(heading).toBeVisible();
  await expect(page.getByRole('region', { name: 'Scrollable flowchart' })).toBeHidden();
  if (browserName === 'chromium') { await mkdir('artifacts/verification', { recursive: true }); await page.pdf({ path: 'artifacts/verification/' + route + '-Letter.pdf', format: 'Letter' }); }
  await page.emulateMedia({ media: 'screen' });
 }
 await nro(page); await page.getByLabel('Organization name or alias').fill('BUAA');
 await manual(page); await page.getByRole('button', { name: 'Use this campus or location' }).click();
 await page.emulateMedia({ media: 'print' });
 await expect(page.getByText(/Name\/alias filter: BUAA/)).toBeVisible();
 await expect(page.locator('.print-meta')).toContainText('0.1.0-rc.2');
 // BUAA returns its exact alias plus the separately labelled NUAA candidate.
 await expect(page.locator('.map-location-list.print-only li')).toHaveCount(2);
 await expect(page.locator('.map-location-list.print-only')).toContainText('Nanjing University of Aeronautics and Astronautics');
 await expect(page.locator('.map-location-list.print-only')).toBeVisible();
 await expect(page.getByText(/Comparison point:/)).toBeVisible();
 await expect(page.locator('.distance-list')).toContainText('Less than 1 km');
 if (browserName === 'chromium') await page.pdf({ path: 'artifacts/verification/nro-comparison-Letter.pdf', format: 'Letter' });
});
test('local map and confirmed coordinate comparison make no external requests', async ({ page, browserName }) => {
 const external = []; page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4187/')) external.push(r.url()); });
 await nro(page); await expect(page.getByRole('region', { name: 'NRO location map' })).toBeVisible();
 await manual(page); await expect(page.getByRole('heading', { name: /Closest mapped sites/ })).toHaveCount(0);
 await page.getByRole('button', { name: 'Use this campus or location' }).click();
 await expect(page.locator('.distance-list li').first()).toContainText('Beihang University');
 await expect(page.locator('.distance-list li').first()).toContainText('Less than 1 km');
 await page.locator('.distance-list button').first().click();
 await expect(page.getByRole('region', { name: 'NRO location map' })).toBeFocused();
 if (browserName === 'chromium') { await mkdir('artifacts/verification', { recursive: true }); await page.locator('.nro-map-canvas').screenshot({ path: 'artifacts/verification/nro-map-local-restored.png' }); }
 expect(external).toEqual([]);
 expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('Synthetic public campus');
 await page.reload(); await expect(page.getByRole('heading', { name: /Closest mapped sites/ })).toHaveCount(0);
});
test('markup in a comparison label stays inert in the map popup', async ({ page }) => {
 await nro(page); await manual(page, '<img src=x onerror="window.mapInjected=1">');
 await page.getByRole('button', { name: 'Use this campus or location' }).click();
 await page.locator('.leaflet-marker-icon').last().click();
 await expect(page.locator('.leaflet-popup-content')).toContainText('<img src=x');
 await expect(page.locator('.leaflet-popup-content img')).toHaveCount(0);
 expect(await page.evaluate(() => window.mapInjected)).toBeUndefined();
});
test('external location search requires opt-in and confirmation, and rejects stale responses', async ({ page }) => {
 let requests = 0;
 await page.route('https://en.wikipedia.org/w/api.php**', async route => { requests++; await route.fulfill({ json: { query: { pages: [{ pageid: 123, title: 'Synthetic campus', coordinates: [{ lat: 40, lon: 116, primary: true, globe: 'earth' }] }, { pageid: 456, title: 'Bad point', coordinates: [{ lat: 999, lon: 'bad', primary: true, globe: 'earth' }] }] } } }); });
 await nro(page); await page.getByText('Search for a public institution online', { exact: true }).click();
 await expect(page.getByLabel('Public institution or campus to find', { exact: true })).toHaveCount(0); expect(requests).toBe(0);
 const consent = page.getByLabel('Allow public-place searches through Wikipedia for this visit'); await consent.check();
 await page.getByLabel('Public institution or campus to find', { exact: true }).fill('Synthetic campus'); expect(requests).toBe(0);
 await page.getByRole('button', { name: 'Search Wikipedia locations', exact: true }).click();
 await page.getByRole('radio', { name: /Synthetic campus/ }).check(); await expect(page.getByRole('heading', { name: /Closest mapped sites/ })).toHaveCount(0);
 await expect(page.getByRole('radio', { name: /Bad point/ })).toHaveCount(0);
 await page.getByRole('button', { name: 'Use this campus or location' }).click(); await expect(page.getByRole('heading', { name: 'Closest mapped sites to Synthetic campus' })).toBeVisible();
 await consent.uncheck(); expect(requests).toBe(1); await expect(page.getByLabel('Public institution or campus to find', { exact: true })).toHaveCount(0);
 await consent.check(); await page.clock.setFixedTime(new Date('2026-09-12T16:00:05Z'));
 let release; await page.unroute('https://en.wikipedia.org/w/api.php**');
 await page.route('https://en.wikipedia.org/w/api.php**', async route => { await new Promise(resolve => { release = resolve; }); await route.fulfill({ json: { query: { pages: [{ pageid: 999, title: 'Old response', coordinates: [{ lat: 40, lon: 116, primary: true, globe: 'earth' }] }] } } }); });
 await page.getByLabel('Public institution or campus to find', { exact: true }).fill('Old response');
 const pending = page.waitForRequest('https://en.wikipedia.org/w/api.php**');
 await page.getByRole('button', { name: 'Search Wikipedia locations', exact: true }).click(); await pending;
 await consent.uncheck(); release(); await expect(page.getByRole('radio', { name: /Old response/ })).toHaveCount(0);
});
test('street tiles are opt-in, omit queries and stop on withdrawal or provider failure', async ({ page }) => {
 const tiles = []; page.on('request', r => { if (r.url().startsWith('https://tile.openstreetmap.org/')) tiles.push(r); });
 await nro(page); await expect(page.locator('img.leaflet-tile')).toHaveCount(0);
 const consent = page.getByLabel('Load OpenStreetMap street detail for this visit'); await consent.check();
 await expect.poll(() => tiles.length).toBeGreaterThan(0);
 expect(tiles.every(r => /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(r.url()))).toBe(true);
 expect(tiles[0].headers().referer).toBe('http://127.0.0.1:4187/');
 await consent.uncheck(); await expect(page.locator('img.leaflet-tile')).toHaveCount(0);
 const count = tiles.length; await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); expect(tiles.length).toBe(count);
 await page.unroute('https://tile.openstreetmap.org/**'); await page.route('https://tile.openstreetmap.org/**', route => route.abort());
 // The error handler can revoke consent before check() asserts its transient state.
 await consent.click(); await expect(page.getByText(/Street detail could not load/)).toBeVisible(); await expect(consent).not.toBeChecked();
});
test('map privacy controls reflow and expiry stops distance comparisons', async ({ page }) => {
 await nro(page); await manual(page); await page.getByRole('button', { name: 'Use this campus or location' }).click();
 await page.setViewportSize({ width: 320, height: 900 });
 expect(await page.locator('main').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
 await page.getByText(/Mapped location sources and text alternative/).click();
 // Spatial markers can overlap. Equivalent text details and 44px controls are
 // available in the source list (WCAG 2.5.8 Equivalent exception).
 expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).disableRules(['target-size']).analyze()).violations.map(v => v.id)).toEqual([]);
 expect((await new AxeBuilder({ page }).withRules(['target-size']).exclude('.leaflet-marker-icon').analyze()).violations.map(v => v.id)).toEqual([]);
 expect(await page.getByRole('button', { name: 'Show this site', exact: true }).evaluateAll(elements => elements.every(el => el.getBoundingClientRect().height >= 44))).toBe(true);
 await page.clock.setFixedTime(new Date('2026-10-13T16:00:00Z')); await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
 await expect(page.getByText(/Map location review is overdue/)).toBeVisible(); await expect(page.locator('.distance-list li')).toHaveCount(0);
});
