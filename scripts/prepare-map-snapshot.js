// Produces a candidate snapshot for review. It never edits the bundled location file.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import nroData from '../src/data/nroData.js';
import { validCoordinates } from '../src/lib/geography.js';
const matches = JSON.parse(await readFile('docs/evidence/nro-location-matches.json'));
await mkdir('artifacts', { recursive: true });
const entities = {};
const headers = { 'User-Agent': 'ResearchSecurityToolkitSourceReview/0.1 (security.research@lakeheadu.ca)' };
const evidence = [];
async function retrieve(url) {
 const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
 if (!response.ok) throw new Error('Map source HTTP ' + response.status);
 const raw = await response.text(), data = JSON.parse(raw);
 if (data.error) throw new Error(data.error.code);
 evidence.push({ url: url.toString(), retrievedAt: new Date().toISOString(), sha256: createHash('sha256').update(raw).digest('hex') });
 return data;
}
const ids = [...new Set(Object.values(matches))];
for (let start = 0; start < ids.length; start += 50) {
 const url = new URL('https://www.wikidata.org/w/api.php');
 url.search = new URLSearchParams({ action: 'wbgetentities', ids: ids.slice(start, start + 50).join('|'), props: 'labels|descriptions|claims|info|sitelinks', languages: 'en', format: 'json', maxlag: '5' });
 Object.assign(entities, (await retrieve(url)).entities);
}
const locations = [], excluded = [];
for (const [organizationId, id] of Object.entries(matches)) {
 const org = nroData.organizations.find(o => o.id === organizationId);
 if (!org) throw new Error('Unknown organization ID: ' + organizationId);
 const e = entities[id];
 const country = { Russia: 'Q159', Iran: 'Q794', 'People’s Republic of China': 'Q148' }[org.country];
 const countries = (e.claims?.P17 || []).map(c => c.mainsnak.datavalue?.value?.id);
 if (countries.length && !countries.includes(country)) throw new Error('Country mismatch: ' + organizationId);
 let points = (e.claims?.P625 || []).filter(c => c.rank !== 'deprecated').map(c => c.mainsnak.datavalue?.value).filter(p => p?.globe === 'http://www.wikidata.org/entity/Q2' && validCoordinates(p.latitude, p.longitude)).map(p => ({ lat: p.latitude, lng: p.longitude, precisionDegrees: p.precision }));
 let sourceUrl = 'https://www.wikidata.org/w/index.php?title=' + id + '&oldid=' + e.lastrevid;
 let sourceLabel = 'Wikidata coordinate statement (' + id + ')';
 if (!points.length) {
  for (const language of ['en', 'zh', 'ru', 'fa']) {
   const title = e.sitelinks?.[language + 'wiki']?.title;
   if (!title) continue;
   const url = new URL('https://' + language + '.wikipedia.org/w/api.php');
   url.search = new URLSearchParams({ action: 'query', titles: title, prop: 'coordinates|pageprops|revisions', rvprop: 'ids', coprop: 'type|dim|name|globe', format: 'json', formatversion: '2', maxlag: '5' });
   const page = (await retrieve(url)).query?.pages?.[0];
   if (page?.pageprops?.wikibase_item !== id) continue;
   points = (page.coordinates || []).filter(p => p.globe === 'earth' && validCoordinates(p.lat, p.lon)).map(p => ({ lat: p.lat, lng: p.lon }));
   if (points.length) { sourceUrl = 'https://' + language + '.wikipedia.org/w/index.php?oldid=' + page.revisions[0].revid; sourceLabel = 'Wikipedia coordinate (' + language + '; ' + title + ')'; break; }
  }
 }
 if (!points.length) { excluded.push({ organizationId, entity: id, reason: 'No usable coordinate found on the reviewed entity or its linked pages.' }); continue; }
 const unique = points.filter((p, index) => points.findIndex(o => o.lat === p.lat && o.lng === p.lng) === index);
 unique.forEach((point, index) => locations.push({ id: organizationId + '-site-' + (index + 1), organizationId, label: (e.labels?.en?.value || org.name) + (unique.length > 1 ? ' (source point ' + (index + 1) + ')' : ''), ...point, scope: 'Approximate source-reported organisation location. Campus and building boundaries have not been verified.', sourceUrl, sourceLabel, identitySourceUrl: 'https://www.wikidata.org/wiki/' + id, reviewedOn: new Date().toISOString().slice(0, 10) }));
 console.log(organizationId + ': ' + unique.length + ' point(s) · ' + sourceLabel);
}
for (const org of nroData.organizations) if (!matches[org.id]) excluded.push({ organizationId: org.id, reason: 'No unambiguous location source selected. Legacy coordinates are not reused.' });
const reviewedOn = new Date().toISOString().slice(0, 10);
// A candidate cannot silently extend the published review deadline.
const published = JSON.parse(await readFile('src/data/nroLocations.json'));
await writeFile('artifacts/nro-locations-candidate.json', JSON.stringify({ reviewedOn, reviewDue: published.reviewDue, locations }, null, 2));
await writeFile('artifacts/nro-locations-review.json', JSON.stringify({ reviewedOn, method: 'Manually selected entity associations; source coordinate statements copied and range-checked. Source reporting is not independent geographic validation. Candidate requires review before publication.', mappedOrganizations: new Set(locations.map(l => l.organizationId)).size, sites: locations.length, excluded, retrievals: evidence }, null, 2));
console.log('Candidate only: ' + locations.length + ' sites; ' + excluded.length + ' unmapped organizations. Review before copying to src/data.');
