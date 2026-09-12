import { readFile, readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const files = [];
async function walk(dir) {
 for (const name of await readdir(dir)) {
  const path = dir + '/' + name;
  if ((await stat(path)).isDirectory()) await walk(path);
  else { const bytes = await readFile(path); files.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }); }
 }
}
await walk('dist');
await mkdir('artifacts', { recursive: true });
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifest = { revision, generatedAt: new Date().toISOString(), node: process.version, files };
await writeFile('artifacts/release-manifest.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ revision, node: process.version, files: files.length }));
