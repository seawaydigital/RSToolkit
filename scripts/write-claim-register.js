import { writeFile, mkdir } from 'node:fs/promises';
import { policySources, CONTENT_VERSION } from '../src/data/policySources.js';
import { triAgencyData } from '../src/data/triAgencyData.js';
import { faqData } from '../src/data/faqData.js';
import { glossaryData } from '../src/data/glossaryData.js';
import { exportControlData } from '../src/data/exportControlData.js';
import { cybersecurityData } from '../src/data/cybersecurityData.js';
import { riskMitigationData } from '../src/data/riskMitigationData.js';
import { riskChecklist } from '../src/data/riskChecklist.js';
import { nsgrpFlow } from '../src/data/flowcharts/nsgrpFlow.js';
import { stracFlow } from '../src/data/flowcharts/stracFlow.js';
import { ontarioFlow } from '../src/data/flowcharts/ontarioFlow.js';
const records = [];
const sources = ids => ids.map(id => ({ id, publisherHost: new URL(policySources[id].url).hostname, ...policySources[id] }));
for (const guide of [triAgencyData, faqData, glossaryData, exportControlData, cybersecurityData, riskMitigationData, riskChecklist]) {
 for (const section of guide.sections) for (const item of section.items) records.push({
  id: guide.id + '/' + item.id, type: item.prompt ? 'preparation prompt' : 'toolkit explanation or recommendation', title: item.title || item.label,
  content: item.text || item.prompt, steps: item.steps, locationOverride: item.location, sources: sources(item.sourceIds),
 });
}
for (const flow of [nsgrpFlow, stracFlow, ontarioFlow]) for (const node of flow.nodes) records.push({
 id: flow.id + '/' + node.id, type: 'bounded policy path ' + node.type, title: node.label, content: node.description,
 outcome: node.outcome, sources: sources(flow.sourceIds),
});
await mkdir('docs/evidence', { recursive: true });
await writeFile('docs/claim-register.json', JSON.stringify({
 contentVersion: CONTENT_VERSION, reviewer: 'Codex, official-source comparison and self-review; no independent certification',
 interpretation: 'This is a content inventory. Scenario and exception interpretation is in policy-rule-matrix.md. Availability alone is not verification.',
 records,
}, null, 2) + '\n');
console.log(records.length + ' attributed content and path records');
