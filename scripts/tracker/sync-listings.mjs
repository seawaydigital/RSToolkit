// Syncs the tracker's listing snapshots with the official lists.
//
//   npm run tracker:sync               # fetch, map and write the snapshots
//   npm run tracker:sync -- --check    # report what would change; write nothing
//
// Review the diff before committing: new listing-only records and changed
// entries are listed in the report.
//
// An entry a pass adds can teach the tracker a name another entry needs: an
// SDN alias admits the Entity List's spelling of the same body. A writing run
// therefore repeats until a pass adds nothing; a check reports one pass.
import { runSync } from './lib/sync.mjs';
import { renderSyncReport } from './lib/listings.mjs';

const MAX_PASSES = 4;
const check = process.argv.includes('--check');
const passes = [];
do passes.push(await runSync({ write: !check }));
while (!check && passes.length < MAX_PASSES && passes.at(-1).sections.some((s) => (s.added ?? []).length));

passes.forEach(({ sections, failures }, i) => {
  const report = renderSyncReport(sections, failures);
  if (i === 0) console.log(report || 'No changes.');
  else if (sections.some((s) => (s.added ?? []).length)) console.log(`\n## Pass ${i + 1}: entries that the names learned in pass ${i} let in\n${report}`);
});
const created = new Set(passes.flatMap((p) => p.created));
console.log(`\n${check ? 'Check only, nothing written.' : `Snapshots written in ${passes.length} ${passes.length === 1 ? 'pass' : 'passes'}.`} New listing-only records: ${created.size}.`);
for (const s of passes.at(-1).sections) if (s.total !== undefined) console.log(`${s.title}: ${s.total} entries.`);
