// Prints what the rubric makes of records, to check a profile before it is
// committed and to fill in its review note: the rating and the rule that set
// it, the reasons (lists and signals), the lists that name it, the evidence
// signals with their Annex B counts, and how many sources are archived. With
// no ids it prints the totals of verified profiles by rating.
//
//   node scripts/tracker/research/rating.mjs <record-id> [<record-id> ...]
//   node scripts/tracker/research/rating.mjs
import { loadDataset } from '../lib/loadData.mjs';

const ids = process.argv.slice(2);
const { records } = await loadDataset();

if (!ids.length) {
  const verified = records.filter((r) => r.status === 'verified');
  const byRating = {};
  for (const r of verified) byRating[r.assessment.rating] = (byRating[r.assessment.rating] ?? 0) + 1;
  const totals = Object.entries(byRating).map(([rating, n]) => `${n} ${rating}`).join(', ');
  console.log(`${records.length} records, ${verified.length} verified${totals ? `: ${totals}` : ''}.`);
  process.exit(0);
}

for (const id of ids) {
  const r = records.find((x) => x.id === id);
  if (!r) {
    console.log(`${id}: no such record`);
    process.exitCode = 1;
    continue;
  }
  const a = r.assessment;
  const override = a.rating !== a.baseRating ? ` (overridden from ${a.baseRating ?? 'not yet rated'})` : '';
  const reasons = a.reasons.map((x) => x.signal ?? x.listId).join(', ') || 'none';
  const lists = r.listings.filter((l) => l.status === 'listed').map((l) => l.listId).join(', ') || 'none';
  const annexB = { '2.1': 0, '2.2': 0, '2.3': 0 };
  const signals = (r.evidence ?? []).map((e) => {
    for (const q of e.annexB) annexB[q] += 1;
    const labs = e.count ?? e.items?.length;
    return labs ? `${e.signal} ×${labs}` : e.signal;
  });
  const sources = r.sources ?? [];
  const archived = sources.filter((s) => s.archive?.url).length;
  const unavailable = sources.filter((s) => s.archive?.unavailable).length;
  console.log(`${r.name} (${id}), ${r.status}`);
  console.log(`  rating: ${a.rating ?? 'not yet rated'}${override}; rule ${a.rule}, basis ${a.basis ?? 'none'}; reasons: ${reasons}`);
  console.log(`  listed on: ${lists}`);
  console.log(`  evidence: ${signals.join(', ') || 'none'}; Annex B 2.1 ×${annexB['2.1']}, 2.2 ×${annexB['2.2']}, 2.3 ×${annexB['2.3']}`);
  console.log(`  sources: ${sources.length} (${archived} archived, ${unavailable} unavailable)`);
}
