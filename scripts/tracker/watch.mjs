// The monthly watch (npm run tracker:check, and the tracker-watch workflow):
// runs the official-list sync in check mode and the source check, writes
// watch-report.md (git-ignored) and prints the issue title and
// has_findings=true|false. Changes nothing in the repository.
import { appendFile, writeFile } from 'node:fs/promises';
import { readRawData } from './lib/loadData.mjs';
import { fetchStatus } from './lib/http.mjs';
import { checkSources, collectSources } from './lib/sources.mjs';
import { runSync } from './lib/sync.mjs';
import { renderWatchReport } from './lib/watchReport.mjs';

const month = new Date().toISOString().slice(0, 7);
const sync = await runSync({ write: false });
const entries = collectSources((await readRawData()).institutions);
const sources = { ...(await checkSources(entries, { fetchImpl: fetchStatus })), checked: entries.length };
const { title, body, hasFindings } = renderWatchReport({ month, sync, sources });

await writeFile('watch-report.md', `${body}\n`);
console.log(`title=${title}`);
console.log(`has_findings=${hasFindings}`);
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `title=${title}\nhas_findings=${hasFindings}\n`);
