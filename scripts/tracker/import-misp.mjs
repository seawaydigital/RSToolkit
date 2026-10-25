// Seed import: creates tracker records from the MISP galaxy list (structured
// fields only) and the NRO list, then enriches them from ROR. Safe to re-run:
// existing files are merged, never overwritten, and verified records only
// gain identifiers.
//
//   npm run tracker:import            # MISP + NRO + ROR enrichment
//   npm run tracker:import -- --no-ror
import { readRawData, writeInstitution, nroData } from './lib/loadData.mjs';
import { fetchJson, sleep } from './lib/http.mjs';
import {
  MISP_URL,
  assembleSeedRecords,
  mergeEnrichment,
  resolveNameCollisions,
  resolveRorConflicts,
  rorAgrees,
  rorToEnrichment,
} from './lib/seed.mjs';
import { validateRecord } from '../../src/tools/compliance/defence-tracker/lib/schema.js';

const today = new Date().toISOString().slice(0, 10);
const skipRor = process.argv.includes('--no-ror');
const report = { rorMatched: 0, rorMissing: [], rorRejected: [], rorMismatched: [], rorConflicts: [], domainConflicts: [], invalid: [] };

const { institutions } = await readRawData();
const misp = await fetchJson(MISP_URL);
const { records, created, merged } = assembleSeedRecords({ mispValues: misp.values, nroOrgs: nroData.organizations, existing: institutions, today });
const collisions = resolveNameCollisions(records);

// ROR enrichment: only a ROR "chosen" match, in the same country, whose names
// agree with the record.
const enrichment = new Map();
if (!skipRor) {
  for (const record of records.values()) {
    if (record.ids?.ror || record.status === 'verified') continue;
    try {
      const res = await fetchJson(`https://api.ror.org/v2/organizations?affiliation=${encodeURIComponent(record.name)}`);
      const chosen = res.items?.find((i) => i.chosen);
      if (!chosen) report.rorMissing.push(record.id);
      else {
        const e = rorToEnrichment(chosen.organization);
        if (record.country && e.countryCode && e.countryCode !== record.country) report.rorRejected.push(`${record.id} → ${e.ror} (${e.countryCode})`);
        else if (!rorAgrees(record, e)) report.rorMismatched.push(`${record.id} → ${e.ror} "${e.display}"`);
        else enrichment.set(record.id, e);
      }
    } catch (err) {
      report.rorMissing.push(`${record.id} (${err.message})`);
    }
    await sleep(300);
  }
}
report.rorConflicts = resolveRorConflicts(enrichment, records);
for (const [id, e] of enrichment) {
  records.set(id, mergeEnrichment(records.get(id), e));
  report.rorMatched++;
}
collisions.push(...resolveNameCollisions(records));

// A domain claimed by two records is dropped from both and reported.
const domainOwners = new Map();
for (const r of records.values()) for (const d of r.domains) domainOwners.set(d, [...(domainOwners.get(d) ?? []), r.id]);
for (const [domain, ids] of domainOwners) {
  if (ids.length < 2) continue;
  report.domainConflicts.push(`${domain}: ${ids.join(', ')}`);
  for (const id of ids) records.get(id).domains = records.get(id).domains.filter((d) => d !== domain);
}

for (const record of records.values()) {
  const errors = validateRecord(record);
  if (errors.length) report.invalid.push(...errors);
  else await writeInstitution(record);
}

const list = (title, items) => items.length && console.log(`\n${title} (${items.length}):\n  ${items.join('\n  ')}`);
console.log(`MISP values: ${misp.values.length}. Records created: ${created}, merged: ${merged}, total: ${records.size}.`);
console.log(`ROR matched: ${report.rorMatched}.`);
list('No ROR match', report.rorMissing);
list('ROR match rejected (different country)', report.rorRejected);
list('ROR match rejected (names do not agree)', report.rorMismatched);
list('Shared names removed', collisions);
list('ROR match dropped (chosen for several records)', report.rorConflicts);
list('Domain claimed by several records (dropped)', report.domainConflicts);
list('Invalid records (not written)', report.invalid);
