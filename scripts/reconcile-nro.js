// Fetch official public records into a review artifact. Never publishes or changes runtime data.
import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import previous from '../src/data/nroData.js';

const url = 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations';
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Official source returned ${response.status}`);
const html = await response.text();
const $ = load(html);
const normalize = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const unmatched = [];
const organizations = $('.wb-filter section > ul > li').toArray().map(element => {
  const row = $(element);
  const name = row.children('strong').first().text().trim();
  const country = row.clone().children().remove().end().text().trim().replace(/^\(|\)$/g, '').trim();
  const aliasText = row.children('p').text().replace(/^Known alias\(es\):\s*/, '').trim();
  const aliases = aliasText ? aliasText.split(';').map(a => a.trim()).filter(Boolean) : [];
  // The CAEP source has a comma-separated sequence within its otherwise semicolon-separated aliases.
  const officialAliases = aliases.flatMap(a => a.startsWith('CAEP, ') ? a.split(', ').map(s => s.trim()) : [a]);
  const old = previous.organizations.find(o => normalize(o.name) === normalize(name));
  if (!old) unmatched.push(name);
  return { id: old?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name,
    aliases: [...new Set(officialAliases)].filter(a => a !== name), country, sourceId: 'nro',
    sourceAnchor: row.closest('section').attr('id'), aliasProvenance: 'Official source alias paragraph' };
});
if (organizations.length < 90 || organizations.some(o => !o.name || !o.country)) throw new Error('Source structure changed; manual inspection required');
await mkdir('artifacts/verification', { recursive: true });
await writeFile('artifacts/verification/nro-candidate.json', JSON.stringify({ sourceUrl: url, retrievedAt: new Date().toISOString(), sourceSha256: createHash('sha256').update(html).digest('hex'), organizations }, null, 2));
console.log(JSON.stringify({ officialEntries: organizations.length, officialAliases: organizations.reduce((n, o) => n + o.aliases.length, 0), previousEntries: previous.organizations.length, namesWithoutExactPreviousMatch: unmatched }, null, 2));
