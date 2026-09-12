import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
const routes = ['', 'tri-agency-guide', 'nsgrp-flowchart', 'strac-flowchart', 'ontario-flowchart', 'nro-lookup', 'stra-lookup', 'risk-checklist', 'risk-mitigation', 'export-control', 'faq', 'glossary', 'cybersecurity-guide', 'about'];
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-09-12T16:00:00Z')); });
async function go(page, route) { await page.goto('/#' + route); await expect(page.locator('main h1')).toBeVisible(); }
async function choose(page, labels) { for (const name of labels) await page.getByRole('button', { name, exact: true }).click(); }

test('policy path keeps the RAF required with no identified risk and retains context', async ({ page }) => {
 await go(page, 'nsgrp-flowchart');
 await choose(page, ['Continue', 'Yes', 'Yes', 'Continue']);
 await page.getByRole('button', { name: 'Open the preparation worksheet' }).click();
 await expect(page.getByRole('heading', { name: 'Research Security Preparation Worksheet' })).toBeVisible();
 await page.goBack();
 await expect(page.getByRole('heading', { name: 'Have you identified risks that need mitigation?' })).toBeVisible();
 await choose(page, ['Full View', 'Guided Mode', 'No', 'Continue']);
 await expect(page.getByRole('heading', { name: 'Prepare the RAF for submission', exact: true })).toBeVisible();
 await expect(page.getByText('Path complete', { exact: true })).toBeVisible();
});
test('unknown policy inputs never become a no-risk answer', async ({ page }) => {
 for (const route of ['nsgrp-flowchart', 'strac-flowchart', 'ontario-flowchart']) {
  await go(page, route); await choose(page, ['Continue', 'Not sure']);
  await expect(page.getByText('Path complete', { exact: true })).toBeVisible();
  await expect(page.locator('.guided-card')).toContainText(/missing|unknown|information/i);
 }
});
test('expired source disables both guided and full policy results', async ({ page }) => {
 await page.clock.setFixedTime(new Date('2026-10-13T12:00:00Z'));
 await go(page, 'nsgrp-flowchart');
 await expect(page.getByText(/This walkthrough is awaiting source review/)).toBeVisible();
 await expect(page.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
 await expect(page.getByRole('button', { name: 'Full View', exact: true })).toHaveCount(0);
});
test('local searches distinguish exact aliases, candidates and empty results without external requests', async ({ page }) => {
 const external = [], errors = [];
 page.on('request', r => { if (new URL(r.url()).origin !== 'http://127.0.0.1:4187') external.push(r.url()); });
 page.on('pageerror', e => errors.push(e.message));
 await go(page, 'nro-lookup');
 const input = page.getByLabel('Organization name or alias');
 await input.fill('BUAA');
 await expect(page.getByText('Official alias result', { exact: true }).first()).toBeVisible();
 await input.fill('Beihang Universit');
 await expect(page.getByText('Possible name candidate', { exact: true }).first()).toBeVisible();
 await input.fill('<img src=x onerror=alert(1)>');
 await expect(page.getByText(/No results in this view/)).toBeVisible();
 await expect(page.locator('main img')).toHaveCount(0);
 await go(page, 'stra-lookup');
 await page.getByLabel('Search names, descriptions and keyword aids').fill('quantum');
 await page.getByLabel('Not sure; more information is needed').check();
 await expect(page.getByLabel('Not sure; more information is needed')).toBeChecked();
 expect(external).toEqual([]); expect(errors).toEqual([]);
 expect(new URL(page.url()).search).toBe('');
});
test('global tool search traps keyboard focus and restores it on Escape', async ({ page }) => {
 await go(page, 'nsgrp-flowchart');
 const opener = page.getByRole('button', { name: 'Find a tool (Ctrl+K)', exact: true });
 await opener.click();
 const dialog = page.getByRole('dialog', { name: 'Find a tool', exact: true });
 await expect(page.getByLabel('Tool name, policy or topic')).toBeFocused();
 await page.getByLabel('Tool name, policy or topic').fill('zzzzunmatched');
 for (let n = 0; n < 6; n++) {
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('dialog'))).toBe(true);
 }
 await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
 await page.keyboard.press('Control+k');
 await expect(page.getByLabel('Tool name, policy or topic')).toBeFocused();
 await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
});
test('worksheet requires explicit saving and resume; new assessment and undo are isolated', async ({ page }) => {
 await go(page, 'risk-checklist');
 await page.getByLabel('Concern or risk identified', { exact: true }).first().check();
 expect(await page.evaluate(() => localStorage.getItem('rs-toolkit-assessment-v2'))).toBeNull();
 await page.getByLabel('Remember this worksheet on this device').check();
 await expect(page.getByRole('status').last()).toContainText('Worksheet saved');
 await page.getByRole('button', { name: 'New blank worksheet' }).click();
 await expect(page.getByText('0 of 14 topics answered', { exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Undo worksheet replacement' }).click();
 await expect(page.getByText('1 of 14 topics answered', { exact: true })).toBeVisible();
 await page.reload();
 await expect(page.getByText('0 of 14 topics answered', { exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Resume saved worksheet' }).click();
 await expect(page.getByText('1 of 14 topics answered', { exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Clear saved data' }).click();
 expect(await page.evaluate(() => localStorage.getItem('rs-toolkit-assessment-v2'))).toBeNull();
});
test('legacy, malformed and blocked storage never silently populate or claim a save', async ({ page }) => {
 await page.addInitScript(() => { localStorage.setItem('rs-toolkit-checklist-v1', '{"old":"yes"}'); });
 await go(page, 'risk-checklist');
 await page.getByRole('button', { name: 'Resume saved worksheet' }).click();
 await expect(page.getByRole('status').last()).toContainText('answers cannot be resumed');
 await page.evaluate(() => localStorage.setItem('rs-toolkit-assessment-v2', '{bad'));
 await page.getByRole('button', { name: 'Resume saved worksheet' }).click();
 await expect(page.getByRole('status').last()).toContainText('could not be read');
 await expect(page.getByText('0 of 14 topics answered', { exact: true })).toBeVisible();
 await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('blocked'); }; Storage.prototype.removeItem = () => { throw new Error('blocked'); }; });
 await page.getByLabel('Remember this worksheet on this device').check();
 await expect(page.getByRole('status').last()).toContainText('Saving failed');
 await page.getByRole('button', { name: 'Clear saved data' }).click();
 await expect(page.getByRole('status').last()).toContainText('Could not clear');
});
test('all-risk and all-unknown worksheets report work recorded without implying approval', async ({ page }) => {
 await go(page, 'risk-checklist');
 for (const radio of await page.getByLabel('Concern or risk identified', { exact: true }).all()) await radio.check();
 await expect(page.getByText('14 of 14 topics answered', { exact: true })).toBeVisible();
 await expect(page.getByText(/14 concerns · 0 unknown · 0 unanswered/)).toBeVisible();
 for (const radio of await page.getByLabel('Unknown / needs information', { exact: true }).all()) await radio.check();
 await expect(page.getByText(/0 concerns · 14 unknown · 0 unanswered/)).toBeVisible();
 await page.emulateMedia({ media: 'print' });
 await expect(page.getByText('Response: Unknown / needs information', { exact: true })).toHaveCount(14);
});
test('printing includes closed and filtered content plus explicit unanswered states', async ({ page, browserName }) => {
 await go(page, 'risk-mitigation');
 const count = await page.locator('.screen-only details').count();
 await page.getByLabel('Search this guide').fill('zzzznomatch');
 await expect(page.getByText(/No entries match/)).toBeVisible();
 await page.emulateMedia({ media: 'print' });
 await expect(page.locator('.print-only article')).toHaveCount(count);
 for (const h of await page.locator('.print-only article h3').all()) await expect(h).toBeVisible();
 if (browserName === 'chromium') {
  await mkdir('artifacts/verification', { recursive: true });
  await page.pdf({ path: 'artifacts/verification/mitigation-A4.pdf', format: 'A4', printBackground: true });
  await page.pdf({ path: 'artifacts/verification/mitigation-Letter.pdf', format: 'Letter', printBackground: true });
 }
 await page.emulateMedia({ media: 'screen' }); await go(page, 'risk-checklist'); await page.emulateMedia({ media: 'print' });
 await expect(page.getByText('Response: Unanswered', { exact: true })).toHaveCount(14);
 if (browserName === 'chromium') await page.pdf({ path: 'artifacts/verification/worksheet-Letter.pdf', format: 'Letter', printBackground: true });
});
test('unknown route and missing lazy chunk offer explicit recovery', async ({ page }) => {
 await go(page, 'not-a-tool'); await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
 await page.route('**/assets/NroLookup-*.js', route => route.abort());
 await go(page, '');
 await page.getByRole('button', { name: /NRO Lookup and Map/ }).first().click();
 await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
 await expect(page.getByRole('link', { name: 'Official research-security resources' })).toBeVisible();
 await page.getByRole('button', { name: 'Go Home', exact: true }).click();
 await expect(page.locator('main h1')).toBeVisible();
});
test('real candidate response headers enforce the configured document policy', async ({ request }) => {
 const response = await request.get('/');
 const headers = response.headers();
 expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
 expect(headers['content-security-policy']).toContain("script-src 'self';");
 expect(headers['x-content-type-options']).toBe('nosniff');
 expect(headers['referrer-policy']).toBe('no-referrer');
 expect((await request.get('/assets/nonexistent.js')).status()).toBe(404);
});
test('browser blocks inline script injection under the real candidate CSP', async ({ page }) => {
 await go(page, 'nro-lookup');
 await page.evaluate(() => {
  window.syntheticInjected = false;
  const script = document.createElement('script');
  script.textContent = 'window.syntheticInjected = true';
  document.head.append(script);
 });
 expect(await page.evaluate(() => window.syntheticInjected)).toBe(false);
});
for (const route of routes) test('accessible and reflowing route: ' + (route || 'home'), async ({ page, browserName }) => {
 await go(page, route);
 for (const summary of await page.locator('.screen-only details > summary').all()) await summary.click();
 const scan = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
 // Only spatial pins use the equivalent-target exception; all other marker
 // rules and all text-list control sizes are still checked (ACCESSIBILITY.md).
 if (route === 'nro-lookup') scan.disableRules(['target-size']);
 const result = await scan.analyze();
 expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
 if (route === 'nro-lookup') expect((await new AxeBuilder({ page }).withRules(['target-size']).exclude('.leaflet-marker-icon').analyze()).violations).toEqual([]);
 await page.setViewportSize({ width: 320, height: 900 });
 await expect(page.locator('#tool-navigation')).toHaveAttribute('inert', '');
 expect(await page.locator('.topbar').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
 expect(await page.locator('main').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
 if (browserName === 'chromium' && ['', 'risk-checklist', 'nro-lookup'].includes(route)) {
  await mkdir('artifacts/verification', { recursive: true });
  await page.screenshot({ path: 'artifacts/verification/' + (route || 'home') + '-320.png', fullPage: true });
 }
});
test('excluded newer tools have a clear unavailable route', async ({ page }) => {
 for (const route of ['dual-use', 'travel-security', 'report-concern']) {
  await go(page, route); await expect(page.getByRole('heading', { name: 'Tool unavailable', exact: true })).toBeVisible();
 }
});
test('source review expiry is applied when a long-lived tab becomes visible', async ({ page }) => {
 await go(page, 'nsgrp-flowchart');
 await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
 await page.clock.setFixedTime(new Date('2026-10-13T12:00:00Z'));
 await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
 await expect(page.getByText(/This walkthrough is awaiting source review/)).toBeVisible();
});
test('keyboard-only guided decisions, worksheet answers and mobile menu work', async ({ page }) => {
 await page.setViewportSize({ width: 320, height: 900 });
 await go(page, 'nsgrp-flowchart');
 await page.getByRole('button', { name: 'Continue', exact: true }).focus(); await page.keyboard.press('Enter');
 await expect(page.locator('#guided-heading')).toBeFocused();
 await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
 await expect(page.getByRole('heading', { name: 'Is at least one qualifying private-sector partner involved?' })).toBeFocused();
 await page.getByRole('button', { name: 'Toggle sidebar' }).click();
 await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toHaveAttribute('aria-expanded', 'true');
 await expect(page.locator('main')).toHaveAttribute('inert', '');
 await page.getByRole('button', { name: /Policy Guides 4/ }).focus(); await page.keyboard.press('Escape');
 await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toBeFocused();
 await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toHaveAttribute('aria-expanded', 'false');
 await go(page, 'risk-checklist');
 const response = page.getByLabel('Concern or risk identified', { exact: true }).first();
 await response.focus(); await page.keyboard.press('Space'); await expect(response).toBeChecked();
});
