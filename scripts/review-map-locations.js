// Maintenance-only discovery. Results are candidates, never automatically published map points.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import nroData from '../src/data/nroData.js';
const path = 'artifacts/map-location-candidates.json';
await mkdir('artifacts', { recursive: true });
let records = [];
try { records = JSON.parse(await readFile(path, 'utf8')); } catch { /* First discovery run. */ }
for (const org of nroData.organizations) {
 if (records.some(r => r.id === org.id)) continue;
 const query = org.name.replace(/,.*$/, '');
 const url = new URL('https://en.wikipedia.org/w/api.php');
 url.search = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '5', gsrnamespace: '0', prop: 'coordinates|info|pageprops', inprop: 'url', coprop: 'type|dim|name', format: 'json', formatversion: '2', maxlag: '5' });
 const response = await fetch(url, { headers: { 'User-Agent': 'ResearchSecurityToolkitSourceReview/0.1 (security.research@lakeheadu.ca)' }, signal: AbortSignal.timeout(20000) });
 if (!response.ok) throw new Error('Source discovery stopped: HTTP ' + response.status);
 const data = await response.json();
 if (data.error) throw new Error('Source discovery stopped: ' + data.error.code);
 const candidates = (data.query?.pages || []).map(p => ({ title: p.title, url: p.fullurl, pageId: p.pageid, wikidataId: p.pageprops?.wikibase_item, coordinates: p.coordinates || [] }));
 records.push({ id: org.id, name: org.name, query, retrievedAt: new Date().toISOString(), candidates });
 await writeFile(path, JSON.stringify(records, null, 2));
 console.log(records.length + ': ' + org.name + ' => ' + candidates.filter(p => p.coordinates.length).map(p => p.title).join(' | '));
}
