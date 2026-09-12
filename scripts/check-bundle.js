import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { resolve, sep } from 'node:path';
const files = await readdir('dist/assets');
const assetFiles = files.filter(f => /\.(js|css)$/.test(f));
assert(assetFiles.length > 10, 'Build scan did not find the expected assets');
const text = (await Promise.all(assetFiles.map(f => readFile('dist/assets/' + f, 'utf8')))).join('\n');
for (const value of ['nominatim.openstreetmap.org', 'photon.komoot.io', 'fonts.googleapis.com', 'fonts.gstatic.com', 'basemaps.cartocdn.com', 'api.mapbox.com', 'server.arcgisonline.com']) assert(!text.includes(value), 'Unexpected remote provider: ' + value);
assert(!files.some(f => /DualUseGuide|TravelSecurity|ReportConcern|straWizard/.test(f)), 'Excluded tool in build');
const html = await readFile('dist/index.html', 'utf8');
const page = load(html);
const base = new URL(process.env.BASE_PATH || '/', 'https://candidate.invalid/');
const root = resolve('dist');
for (const element of page('script[src], link[href]').toArray()) {
 const reference = page(element).attr('src') || page(element).attr('href');
 const asset = new URL(reference, base);
 assert(asset.origin === base.origin && asset.pathname.startsWith(base.pathname), 'Page asset is not local: ' + reference);
 const path = resolve(root, decodeURIComponent(asset.pathname.slice(base.pathname.length)));
 assert(path.startsWith(root + sep), 'Page asset escapes the build: ' + reference);
 await readFile(path);
}
assert(html.includes("script-src 'self';"));
assert(!html.includes("script-src 'self' 'unsafe-inline'"));
assert(!html.includes('frame-ancestors'), 'Anti-framing must be a response header');
await readFile('dist/THIRD_PARTY_NOTICES.txt');
await readFile('dist/LICENSE.txt');
console.log('Built assets: page references, local providers, excluded tools and license checks passed.');
