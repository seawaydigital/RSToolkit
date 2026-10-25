// Saves sources that have no archived copy to the Wayback Machine and records
// each snapshot address on its record. Run locally, never in CI.
//
//   npm run tracker:archive                         # every record with unarchived sources
//   npm run tracker:archive -- --id <record-id>     # one record (e.g. one being researched)
//   npm run tracker:archive -- --dry-run            # list what would be saved
//
// Optional: ARCHIVE_ORG_ACCESS_KEY and ARCHIVE_ORG_SECRET (archive.org →
// account settings → S3 API keys) authenticate the saves, which raises the
// rate limit. Keep them in your environment; never commit them.
//
// A capture that looks blocked or empty is not recorded. It is listed for a
// manual archive.today attempt, or for an archive.unavailable reason written
// into the record by hand.
import { readRawData, writeInstitution } from './lib/loadData.mjs';
import { USER_AGENT, sleep } from './lib/http.mjs';
import { hasArchive, looksLikeBlockedCapture, waybackSnapshotUrl } from './lib/sources.mjs';

const SAVE_GAP_MS = 5000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyId = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;

const { institutions } = await readRawData();
if (onlyId && !institutions.some((r) => r.id === onlyId)) {
  console.error(`No record with id "${onlyId}".`);
  process.exit(1);
}
const targets = institutions.filter((r) => (!onlyId || r.id === onlyId) && (r.sources ?? []).some((s) => !hasArchive(s)));

const saveHeaders = { 'User-Agent': USER_AGENT };
const { ARCHIVE_ORG_ACCESS_KEY: key, ARCHIVE_ORG_SECRET: secret } = process.env;
if (key && secret) saveHeaders.Authorization = `LOW ${key}:${secret}`;

const saved = [];
const suspect = [];
const failed = [];
let firstSave = true;

for (const record of targets) {
  let changed = false;
  for (const source of record.sources.filter((s) => !hasArchive(s))) {
    const label = `${record.id} ${source.id}`;
    if (dryRun) {
      console.log(`Would save ${label}  ${source.url}`);
      continue;
    }
    if (!firstSave) await sleep(SAVE_GAP_MS);
    firstSave = false;
    try {
      const res = await fetch(`https://web.archive.org/save/${source.url}`, { headers: saveHeaders, signal: AbortSignal.timeout(180000) });
      await res.body?.cancel();
      const snapshot = waybackSnapshotUrl(res);
      if (!snapshot) {
        failed.push({ label, url: source.url, reason: `no snapshot returned (HTTP ${res.status})` });
        continue;
      }
      const capture = await fetch(snapshot, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60000) });
      const body = await capture.text();
      if (looksLikeBlockedCapture({ status: capture.status, body })) {
        suspect.push({ label, url: source.url, snapshot });
        continue;
      }
      source.archive = { url: snapshot };
      changed = true;
      saved.push({ label, snapshot });
      console.log(`Saved ${label}  ${snapshot}`);
    } catch (e) {
      failed.push({ label, url: source.url, reason: e.message });
    }
  }
  if (changed) await writeInstitution(record);
}

if (dryRun) {
  console.log('\nDry run, nothing saved.');
} else {
  console.log(`\nSaved ${saved.length}. Suspect captures ${suspect.length}. Failed ${failed.length}.`);
  if (suspect.length) {
    console.log('\nThese captures look blocked or empty. Try archive.today, or record archive.unavailable with the reason:');
    for (const s of suspect) console.log(`  ${s.label}  ${s.url}\n    capture: ${s.snapshot}`);
  }
  if (failed.length) {
    console.log('\nThese could not be saved. Try again later, or archive by hand:');
    for (const f of failed) console.log(`  ${f.label}  ${f.url}  (${f.reason})`);
  }
}
