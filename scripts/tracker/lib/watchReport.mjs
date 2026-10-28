// The monthly watch report, written as the body of a GitHub issue: what
// changed on the official lists and which cited sources need attention.
// Names and messages from outside the repository go in code spans with "@"
// removed (sanitizeForIssue), so the issue can't mention anyone or link
// elsewhere. Source addresses are the tracker's own citations and stay
// clickable.
import { renderSyncReport, sanitizeForIssue } from './listings.mjs';

export { sanitizeForIssue };

const SYNC_FIELDS = ['added', 'removed', 'changed', 'created', 'notes'];
const hasChanges = (section) => SYNC_FIELDS.some((field) => (section[field] ?? []).length > 0);

export function renderWatchReport({ month, sync, sources }) {
  const syncFindings = sync.sections.some(hasChanges) || sync.failures.length > 0;
  const sourceFindings = sources.dead.length > 0 || sources.missingArchive.length > 0;
  const lines = [
    'Monthly check of the official lists and of the sources cited on verified tracker profiles. This workflow never changes the repository: work through the items below locally, following the monthly routine in HANDOFF.md.',
    '',
    '## Official lists',
    '',
    syncFindings ? renderSyncReport(sync.sections, sync.failures) : 'No changes since the last sync.',
    '',
    '## Sources on verified profiles',
    '',
  ];
  if (!sourceFindings) {
    lines.push(
      sources.checked === 0
        ? 'No verified profiles yet, so there are no sources to check.'
        : sources.checked === undefined
          ? 'Every source answered and has an archived copy or a reason.'
          : `All ${sources.checked} sources answered and have an archived copy or a reason.`,
    );
  }
  if (sources.dead.length) {
    lines.push(`Not answering (${sources.dead.length}). The page may be gone, or the site may only block automated checks:`);
    for (const d of sources.dead) {
      const why = d.status ? `HTTP ${d.status}` : sanitizeForIssue(d.error ?? 'no response');
      lines.push(`- ${sanitizeForIssue(d.recordId)} ${sanitizeForIssue(d.source.id)}: ${why}, ${d.source.url}`);
    }
    lines.push('');
  }
  if (sources.missingArchive.length) {
    lines.push(`No archived copy or reason (${sources.missingArchive.length}):`);
    for (const m of sources.missingArchive) lines.push(`- ${sanitizeForIssue(m.recordId)} ${sanitizeForIssue(m.source.id)}: ${m.source.url}`);
    lines.push('');
  }
  lines.push(
    '',
    '## What to do',
    '',
    '- **Lists:** run `npm run tracker:sync`, review the diff (new listing-only records and changed entries above), and commit. Check any list marked "Couldn\'t check" by hand.',
    '- **A source not answering:** open it in a browser. If it is gone, the archived copy stays the citation; if it moved, update the address.',
    '- **A source with no archived copy:** run `npm run tracker:archive -- --id <record>`, or record `archive.unavailable` with the reason.',
    '- Close this issue when done. Next month\'s run opens a new one.',
  );
  return { title: `Tracker watch — ${month}`, body: lines.join('\n'), hasFindings: syncFindings || sourceFindings };
}
