// Creates the file for a record that has none yet: an institution known only
// from an official list, whose record the loader otherwise builds from the
// list snapshots at load time. The spec is a JSON object with the record's
// fields; anything it leaves out starts empty. An existing file is never
// overwritten.
//
//   node scripts/tracker/research/new-record.mjs <spec.json>
//
// Keep the id the snapshot entries use (their "institution" field): it is the
// record's permanent permalink. Start with "status": "listing-only" and a
// history entry naming the list the record was created from, set "parent" to
// the host when the list names the body "at" another institution, then verify
// it with patch-record.mjs like any other record.
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR, loadDataset, writeInstitution } from '../lib/loadData.mjs';
import { validateRecord } from '../../../src/tools/compliance/defence-tracker/lib/schema.js';

const [specFile] = process.argv.slice(2);
if (!specFile) {
  console.error('Usage: node scripts/tracker/research/new-record.mjs <spec.json>');
  process.exit(1);
}

const spec = JSON.parse(await readFile(specFile, 'utf8'));
const file = path.join(DATA_DIR, 'institutions', `${spec.id}.json`);
if (await access(file).then(() => true, () => false)) {
  console.error(`${spec.id}.json already exists; change it with patch-record.mjs.`);
  process.exit(1);
}
if (!(await loadDataset()).records.some((r) => r.id === spec.id)) {
  console.warn(`Note: no list snapshot names "${spec.id}"; check the id against the entries' "institution" field.`);
}

const record = {
  zhAliases: [],
  aliases: [],
  acronyms: [],
  domains: [],
  supervisors: [],
  parent: null,
  ids: {},
  evidence: [],
  topics: [],
  subunits: [],
  sources: [],
  rating: { override: null, overrideReason: null },
  verifiedOn: null,
  history: [],
  seedNotes: null,
  ...spec,
};
const errors = validateRecord(record);
if (errors.length) {
  console.error(`Not written: the record fails the schema.\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
await writeInstitution(record);
console.log(`Created ${record.id} (${record.status}, ${record.sources.length} sources).`);
