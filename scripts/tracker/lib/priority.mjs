// The research priority queue (docs/tracker/research-playbook.md). Takes
// dataset records, which carry their joined listings.
const US_LISTS = new Set(['us-entity-list', 'us-meu', 'us-sdn', 'us-1286']);
const STRUCTURAL_TYPES = new Set(['military', 'security', 'defence-industry', 'nuclear']);

export const PRIORITY_GROUPS = {
  1: 'Chinese institutions on Canada’s NRO list',
  2: 'US-listed Chinese universities',
  3: 'Structural: PLA, security agencies, defence conglomerates, nuclear, Seven Sons',
  4: 'The rest of the MISP list',
  5: 'Other Chinese bodies (CAS institutes, newly listed bodies)',
  6: 'Russia and Iran',
};

const isListed = (record, test) => (record.listings ?? []).some((l) => l.status === 'listed' && test(l.listId));

export function priorityGroup(record) {
  if (record.country !== 'CN') return 6;
  if (isListed(record, (id) => id === 'ca-nro')) return 1;
  if (record.type === 'university' && isListed(record, (id) => US_LISTS.has(id))) return 2;
  if (STRUCTURAL_TYPES.has(record.type) || (record.seedNotes?.categories ?? []).includes('Seven sons of national defence')) return 3;
  return record.seedNotes ? 4 : 5;
}

// Unverified records first, by group then name; then verified records,
// longest since verification first, for re-checking.
export function priorityQueue(records) {
  const rows = records.map((r) => ({ id: r.id, name: r.name, group: priorityGroup(r), status: r.status, verifiedOn: r.verifiedOn ?? null }));
  const unverified = rows.filter((r) => r.status !== 'verified').sort((a, b) => a.group - b.group || a.name.localeCompare(b.name));
  const verified = rows.filter((r) => r.status === 'verified').sort((a, b) => a.verifiedOn.localeCompare(b.verifiedOn) || a.name.localeCompare(b.name));
  return [...unverified, ...verified];
}
