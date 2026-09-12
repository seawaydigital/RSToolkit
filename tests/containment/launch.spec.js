import { test, expect } from '@playwright/test';
test('containment disables all preparation routes while retaining official sources and reporting', async ({ page }) => {
 await page.goto('/');
 await expect(page.getByRole('heading', { name: 'Toolkit guidance temporarily unavailable' })).toBeVisible();
 for (const route of ['nsgrp-flowchart', 'strac-flowchart', 'ontario-flowchart', 'stra-lookup', 'nro-lookup', 'risk-checklist', 'risk-mitigation', 'export-control', 'faq', 'glossary', 'cybersecurity-guide', 'tri-agency-guide', 'dual-use', 'travel-security', 'report-concern']) {
  await page.goto('/#' + route);
  await expect(page.getByRole('heading', { name: 'Tool unavailable', exact: true })).toBeVisible();
 }
 await page.goto('/#about');
 await expect(page.getByRole('heading', { name: 'About, Privacy and Sources' })).toBeVisible();
 await expect(page.getByRole('link', { name: 'Private toolkit report' })).toHaveAttribute('href', 'mailto:security.research@lakeheadu.ca');
 await expect(page.getByRole('link', { name: 'Official Named Research Organizations list' })).toBeVisible();
});
