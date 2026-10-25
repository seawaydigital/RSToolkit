// Node-side access to the tracker data: read the files, assemble the same
// dataset the site builds, and write records and snapshots back in a stable
// form (ordered keys, sorted entries) so diffs stay readable.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nroData from '../../../src/data/nroData.js';
import { buildDataset } from '../../../src/tools/compliance/defence-tracker/lib/dataset.js';
import { orderRecordKeys } from '../../../src/tools/compliance/defence-tracker/lib/schema.js';
import { SNAPSHOT_NAMES } from '../../../src/tools/compliance/defence-tracker/lib/constants.js';

export const DATA_DIR = fileURLToPath(new URL('../../../src/data/defenceTracker/', import.meta.url));
const INSTITUTIONS_DIR = path.join(DATA_DIR, 'institutions');
const LISTINGS_DIR = path.join(DATA_DIR, 'listings');

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const toJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

export async function readRawData() {
  let files = [];
  try {
    files = (await readdir(INSTITUTIONS_DIR)).filter((f) => f.endsWith('.json')).sort();
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const institutionFiles = await Promise.all(
    files.map(async (file) => ({ file, record: await readJson(path.join(INSTITUTIONS_DIR, file)) })),
  );
  const snapshots = {};
  for (const name of SNAPSHOT_NAMES) snapshots[name] = await readJson(path.join(LISTINGS_DIR, `${name}.json`));
  return {
    institutions: institutionFiles.map((f) => f.record),
    institutionFiles,
    snapshots,
    meta: await readJson(path.join(DATA_DIR, 'meta.json')),
    changelog: await readJson(path.join(DATA_DIR, 'changelog.json')),
  };
}

export async function loadDataset(raw) {
  const { institutions, snapshots, meta } = raw ?? (await readRawData());
  return buildDataset({ institutions, snapshots, nroData, meta });
}

export async function writeInstitution(record) {
  await mkdir(INSTITUTIONS_DIR, { recursive: true });
  await writeFile(path.join(INSTITUTIONS_DIR, `${record.id}.json`), toJson(orderRecordKeys(record)));
}

export async function writeSnapshot(name, snapshot) {
  const entries = [...snapshot.entries].sort((a, b) => a.key.localeCompare(b.key));
  await writeFile(path.join(LISTINGS_DIR, `${name}.json`), toJson({ ...snapshot, entries }));
}

export async function writeMeta(meta) {
  await writeFile(path.join(DATA_DIR, 'meta.json'), toJson(meta));
}

export { nroData };
