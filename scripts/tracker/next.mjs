// Prints the head of the research priority queue.
//
//   npm run tracker:next          # the next 20
//   npm run tracker:next -- 50    # the next 50
import { loadDataset } from './lib/loadData.mjs';
import { PRIORITY_GROUPS, priorityQueue } from './lib/priority.mjs';

const count = Number.parseInt(process.argv[2] ?? '20', 10) || 20;
const queue = priorityQueue((await loadDataset()).records);
const unverified = queue.filter((q) => q.status !== 'verified').length;

console.log(`Next ${Math.min(count, queue.length)} of ${queue.length} (${unverified} not yet verified; verified profiles follow, oldest first, for re-checking).\n`);
queue.slice(0, count).forEach((q, i) => {
  const state = q.status === 'verified' ? `verified ${q.verifiedOn}` : q.status;
  console.log(`${String(i + 1).padStart(3)}. [${q.group}] ${state.padEnd(19)} ${q.id}  (${q.name})`);
});
console.log('\nGroups:');
for (const [group, label] of Object.entries(PRIORITY_GROUPS)) console.log(`  ${group}  ${label}`);
