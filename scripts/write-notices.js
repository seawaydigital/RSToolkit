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
await writeFile('public/THIRD_PARTY_NOTICES.txt', intro + notices.join('\n\n========================================\n\n'));
await writeFile('public/LICENSE.txt', await readFile('LICENSE'));
console.log(JSON.stringify(packages));
