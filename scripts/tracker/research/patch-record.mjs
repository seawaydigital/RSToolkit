// Applies a JSON patch to one tracker record and writes it back with the
// tracker's own writer (stable key order), so each research step is a small
// file that can be checked and re-run instead of a hand edit. Fields in the
// patch replace the record's; two keys append instead: "+sources" (source ids
// must be new) and "+history".
//
//   node scripts/tracker/research/patch-record.mjs <record-id> <patch.json>
//
// A patched record that fails the schema is reported and not written. Run
// npm test afterwards, as for any data change.
import { readFile } from 'node:fs/promises';
import { readRawData, writeInstitution } from '../lib/loadData.mjs';
import { validateRecord } from '../../../src/tools/compliance/defence-tracker/lib/schema.js';

const [id, patchFile] = process.argv.slice(2);
if (!id || !patchFile) {
  console.error('Usage: node scripts/tracker/research/patch-record.mjs <record-id> <patch.json>');
  process.exit(1);
}

const patch = JSON.parse(await readFile(patchFile, 'utf8'));
const found = (await readRawData()).institutions.find((r) => r.id === id);
if (!found) {
  console.error(`No file for "${id}". A list-only record needs one first: see new-record.mjs.`);
  process.exit(1);
}

const record = structuredClone(found);
const { '+sources': addSources = [], '+history': addHistory = [], ...fields } = patch;
Object.assign(record, fields);
const taken = new Set((record.sources ?? []).map((s) => s.id));
for (const source of addSources) {
  if (taken.has(source.id)) {
    console.error(`Source id "${source.id}" is already used on ${id}.`);
    process.exit(1);
  }
  taken.add(source.id);
}
record.sources = [...(record.sources ?? []), ...addSources];
record.history = [...(record.history ?? []), ...addHistory];

const errors = validateRecord(record);
if (errors.length) {
  console.error(`Not written: the patched record fails the schema.\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
await writeInstitution(record);
console.log(`Wrote ${id}: ${record.sources.length} sources, ${(record.evidence ?? []).length} evidence items, status ${record.status}.`);
