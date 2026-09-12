import assert from 'node:assert/strict';
import { policySources, CONTENT_VERSION, sourcesCurrent } from '../src/data/policySources.js';
import nro from '../src/data/nroData.js';
import { straData } from '../src/data/straData.js';
import { nsgrpFlow } from '../src/data/flowcharts/nsgrpFlow.js';
import { stracFlow } from '../src/data/flowcharts/stracFlow.js';
import { ontarioFlow } from '../src/data/flowcharts/ontarioFlow.js';
import { validateFlow } from '../src/lib/flow.js';
import { triAgencyData } from '../src/data/triAgencyData.js';
import { faqData } from '../src/data/faqData.js';
import { glossaryData } from '../src/data/glossaryData.js';
import { exportControlData } from '../src/data/exportControlData.js';
import { cybersecurityData } from '../src/data/cybersecurityData.js';
import { riskMitigationData } from '../src/data/riskMitigationData.js';
import { riskChecklist } from '../src/data/riskChecklist.js';
function sources(ids) {
 assert(ids?.length, 'Missing source attribution');
 ids.forEach(id => assert(policySources[id], 'Unknown source: ' + id));
}
for (const flow of [nsgrpFlow, stracFlow, ontarioFlow]) {
 assert.deepEqual(validateFlow(flow), [], flow.id);
 assert.equal(flow.contentVersion, CONTENT_VERSION); sources(flow.sourceIds);
}
let claims = 0;
for (const guide of [triAgencyData, faqData, glossaryData, exportControlData, cybersecurityData, riskMitigationData, riskChecklist]) {
 const ids = guide.sections.flatMap(s => s.items.map(i => i.id));
 assert.equal(new Set(ids).size, ids.length, 'Duplicate guide item');
 guide.sections.flatMap(s => s.items).forEach(i => { sources(i.sourceIds); claims++; });
}
assert.equal(nro.organizations.length, 103, 'Reconcile an official list change before updating this expectation');
assert.equal(new Set(nro.organizations.map(o => o.id)).size, 103);
assert.equal(nro.organizations.reduce((n, o) => n + o.aliases.length, 0), 252);
nro.organizations.forEach(o => {
 assert(o.name && o.country && Array.isArray(o.aliases)); sources([o.sourceId]);
 assert(!('lat' in o) && !('lng' in o), 'Geography is excluded from this release');
});
assert.equal(straData.categories.length, 11);
assert.equal(straData.categories.flatMap(c => c.subcategories).filter(s => s.kind !== 'category-overview').length, 74);
Object.entries(policySources).forEach(([id, s]) => {
 assert.equal(new URL(s.url).protocol, 'https:');
 assert(s.section && s.verifiedOn && s.reviewDue, id);
 assert(sourcesCurrent([id]), 'Review overdue or verification in future: ' + id);
});
console.log(JSON.stringify({ contentVersion: CONTENT_VERSION, sources: Object.keys(policySources).length, attributedItems: claims, flows: 3, nroEntries: 103, nroAliases: 252, straCategories: 11, straSubcategories: 74 }));
