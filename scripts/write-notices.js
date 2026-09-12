import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = JSON.parse(await readFile('package.json', 'utf8'));
const seen = new Set(), notices = [], packages = [];
async function visit(name) {
 if (seen.has(name)) return;
 seen.add(name);
 const dir = resolve('node_modules', name);
 const meta = JSON.parse(await readFile(resolve(dir, 'package.json'), 'utf8'));
 const names = (await readdir(dir)).filter(f => /^(licen[cs]e|notice)(\.|$)/i.test(f));
 if (!names.some(f => /^licen[cs]e/i.test(f))) throw new Error('Missing distributed license for ' + name);
 packages.push({ name, version: meta.version, license: meta.license });
 for (const file of names) notices.push(name + ' ' + meta.version + ' (' + meta.license + ')\n' + await readFile(resolve(dir, file), 'utf8'));
 for (const child of Object.keys(meta.dependencies || {})) await visit(child);
}
for (const name of Object.keys(root.dependencies)) await visit(name);
const intro = 'Third-party notices for Research Security Toolkit\n\nGovernment policy names, lists and linked materials remain attributed to their respective publishers. Toolkit paraphrases do not establish official status. OCAP® is a registered trademark of the First Nations Information Governance Centre (FNIGC), https://fnigc.ca/ocap-training/. The software license does not grant rights to third-party marks or linked documents.\n\n';
const mapNotice = 'Map data\n\nNatural Earth 1:110m country boundaries are public domain: https://www.naturalearthdata.com/about/terms-of-use/. Source revision, transformation and hashes: docs/evidence/map-basemap.json. Overview borders and labels are cartographic context, not a position on sovereignty.\n\nWikidata structured location statements are available under CC0: https://www.wikidata.org/wiki/Wikidata:Licensing. Individual source/revision links are retained with every point in src/data/nroLocations.json. A small number of factual coordinates are attributed to Wikipedia article revisions; no article prose is reproduced. Wikipedia articles have their own terms at https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use. These sources do not independently verify an institution identity or campus boundary.\n\nOptional OpenStreetMap street tiles show provider attribution when enabled. Map data copyright OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright. Tiles are requested at runtime only after opt-in, not bundled.\n\n';
await writeFile('public/THIRD_PARTY_NOTICES.txt', intro + mapNotice + notices.join('\n\n========================================\n\n'));
await writeFile('public/LICENSE.txt', await readFile('LICENSE'));
console.log(JSON.stringify(packages));
