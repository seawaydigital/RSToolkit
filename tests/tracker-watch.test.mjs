// The monthly watch report that becomes a GitHub issue: when it has findings,
// what it lists, and that nothing from outside the repository can mention
// anyone or link elsewhere once it is in the issue.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderWatchReport, sanitizeForIssue } from '../scripts/tracker/lib/watchReport.mjs';

const noSources = { dead: [], missingArchive: [] };
const quietSection = { title: 'US Consolidated Screening List', added: [], removed: [], changed: [], created: [], total: 538 };

test('external names are neutralised for issues', () => {
  assert.equal(sanitizeForIssue('Evil `code` @someone'), "`Evil 'code' someone`");
});

test('a report with no changes has no findings', () => {
  assert.equal(renderWatchReport({ month: '2026-11', sync: { sections: [], failures: [] }, sources: noSources }).hasFindings, false);
  assert.equal(renderWatchReport({ month: '2026-11', sync: { sections: [quietSection], failures: [] }, sources: noSources }).hasFindings, false);
});

test('with no verified profiles yet the report says so instead of counting zero sources', () => {
  const r = renderWatchReport({ month: '2026-11', sync: { sections: [], failures: [] }, sources: { ...noSources, checked: 0 } });
  assert.ok(r.body.includes('No verified profiles yet'), r.body);
  assert.ok(!r.body.includes('All 0'), r.body);
});

test('a report with changes or failures has findings and the month title', () => {
  const r = renderWatchReport({
    month: '2026-11',
    sync: { sections: [{ title: 'US Consolidated Screening List', list: 'us-entity-list', added: [{ name: 'New Univ' }], removed: [], changed: [] }], failures: ['GAC sanctions XML: timeout'] },
    sources: noSources,
  });
  assert.equal(r.title, 'Tracker watch — 2026-11');
  assert.equal(r.hasFindings, true);
  assert.ok(r.body.includes('`New Univ`') && r.body.includes("Couldn't check"));
});

test('failure messages, which can quote a server’s reply, go in code spans without @', () => {
  const r = renderWatchReport({
    month: '2026-11',
    sync: { sections: [], failures: ['US CSL: Unexpected token "@admin see owner/repo#1"'] },
    sources: noSources,
  });
  assert.equal(r.hasFindings, true);
  assert.ok(!r.body.includes('@'), r.body);
  assert.ok(r.body.includes('`US CSL: Unexpected token "admin see owner/repo#1"`'), r.body);
});

test('dead sources and missing archives are findings that name the record and source', () => {
  const r = renderWatchReport({
    month: '2026-11',
    sync: { sections: [], failures: [] },
    sources: {
      dead: [
        { recordId: 'harbin-institute-of-technology', source: { id: 's2', url: 'https://x.example/gone' }, status: 404 },
        { recordId: 'harbin-institute-of-technology', source: { id: 's4', url: 'https://x.example/blocked' }, error: 'fetch failed (ECONNRESET)' },
      ],
      missingArchive: [{ recordId: 'harbin-institute-of-technology', source: { id: 's3', url: 'https://x.example/new' } }],
    },
  });
  assert.equal(r.hasFindings, true);
  assert.match(r.body, /`harbin-institute-of-technology` `s2`.*HTTP 404.*https:\/\/x\.example\/gone/);
  assert.match(r.body, /`s4`.*`fetch failed \(ECONNRESET\)`/);
  assert.match(r.body, /`harbin-institute-of-technology` `s3`.*https:\/\/x\.example\/new/);
});
