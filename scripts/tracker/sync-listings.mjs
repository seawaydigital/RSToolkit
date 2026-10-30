// Syncs the tracker's listing snapshots with the official lists.
//
//   npm run tracker:sync               # fetch, map and write the snapshots
//   npm run tracker:sync -- --check    # report what would change; write nothing
//
// Review the diff before committing: new listing-only records and changed
// entries are listed in the report.
import { runSync } from './lib/sync.mjs';
import { renderSyncReport } from './lib/listings.mjs';

const check = process.argv.includes('--check');
const { sections, failures, created } = await runSync({ write: !check });

const report = renderSyncReport(sections, failures);
console.log(report || 'No changes.');
console.log(`\n${check ? 'Check only, nothing written.' : 'Snapshots written.'} New listing-only records: ${created.length}.`);
for (const s of sections) if (s.total !== undefined) console.log(`${s.title}: ${s.total} entries.`);
