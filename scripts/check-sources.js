// Availability and change evidence only. HTTP 200 is not content approval.
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { policySources } from '../src/data/policySources.js';
await mkdir('artifacts/verification', { recursive: true });
const results = await Promise.all(Object.entries(policySources).map(async ([id, source]) => {
 try {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const html = bytes.toString();
  const title = response.headers.get('content-type')?.includes('pdf') ? 'PDF (inspect separately)' : load(html)('title').text().trim();
  return { id, url: source.url, finalUrl: response.url, status: response.status, title, sha256: createHash('sha256').update(bytes).digest('hex'), checkedAt: new Date().toISOString() };
 } catch (error) { return { id, error: error.message, checkedAt: new Date().toISOString() }; }
}));
await writeFile('artifacts/verification/source-availability.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map(({ id, status, title, error }) => ({ id, status, title, error })), null, 2));
if (results.some(r => r.status !== 200)) process.exitCode = 1;
