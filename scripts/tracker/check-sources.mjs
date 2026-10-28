// Checks the sources on verified profiles: links that no longer answer, and
// sources with neither an archived copy nor a reason there can't be one.
// Writes nothing. The monthly watch runs the same check.
//
//   node scripts/tracker/check-sources.mjs
//
// A failing link may be gone or may only block automated checks (common for
// Chinese government sites): open it in a browser before replacing it, and
// cite the archived copy meanwhile.
import { readRawData } from './lib/loadData.mjs';
import { fetchStatus } from './lib/http.mjs';
import { checkSources, collectSources } from './lib/sources.mjs';

const { institutions } = await readRawData();
const entries = collectSources(institutions);
const { dead, missingArchive } = await checkSources(entries, { fetchImpl: fetchStatus });

console.log(`Checked ${entries.length} sources on ${new Set(entries.map((e) => e.recordId)).size} verified profiles.`);
console.log(`\nNot answering (${dead.length}):`);
for (const d of dead) console.log(`  ${d.recordId} ${d.source.id}  ${d.status ? `HTTP ${d.status}` : d.error}  ${d.source.url}`);
console.log(`\nNo archived copy or reason (${missingArchive.length}):`);
for (const m of missingArchive) console.log(`  ${m.recordId} ${m.source.id}  ${m.source.url}`);
if (missingArchive.length) console.log('\nRun npm run tracker:archive to archive them.');
