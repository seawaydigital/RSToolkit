// Runs the batch-check matcher over test lines against the real data, or with
// --search the tracker's search box, to try a name or alias before it is
// committed. Test the lookalikes too (other universities' departments, the
// same name abroad, a former name now used by another body): a lookalike that
// confirms is a false match to fix before the profile goes in.
//
//   node scripts/tracker/research/try-match.mjs "<affiliation line>" ...
//   node scripts/tracker/research/try-match.mjs --search "<query>" ...
import { loadDataset } from '../lib/loadData.mjs';
import { buildMatchIndex, matchLine, searchRecords } from '../../../src/tools/compliance/defence-tracker/lib/matcher.js';

const args = process.argv.slice(2);
const search = args[0] === '--search';
const lines = search ? args.slice(1) : args;
if (!lines.length) {
  console.error('Usage: node scripts/tracker/research/try-match.mjs [--search] "<line>" ...');
  process.exit(1);
}

const index = buildMatchIndex((await loadDataset()).records);
for (const line of lines) {
  const hits = search
    ? searchRecords(line, index, { limit: 5 })
    : matchLine(line, index).map((m) => `${m.id} (${m.matchedBy}, ${m.confidence}${m.unit ? `, unit: ${m.unit}` : ''})`);
  console.log(`${JSON.stringify(line)} → ${hits.join('; ') || 'no match'}`);
}
