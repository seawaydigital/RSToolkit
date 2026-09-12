import { CONTENT_VERSION, policySources } from '../policySources.js';
export const ontarioFlow = {
  id: 'ontario', title: 'Ontario research-security preparation', contentVersion: CONTENT_VERSION,
  sourceIds: ['ontario', 'ontarioForms'], sourceUrl: policySources.ontario.url, policySource: 'Ontario guidelines, June 2024',
  nodes: [
    { id: 'start', type: 'start', label: 'Check the Ontario competition instructions', description: 'Ontario has a distinct process. Use the guidelines and forms required for your competition.', next: 'scope' },
    { id: 'scope', type: 'decision', label: 'Does the competition use these Ontario guidelines?', description: 'Check the funding program and current instructions.', yes: 'period', no: 'outside', unknown: 'unknown' },
    { id: 'period', type: 'action', label: 'Review the full Relevant Period', description: 'Review two years before signing through anticipated project completion, including other projects. Ontario’s collaboration definition includes co-authorship and co-publication. See definitions on pages 2–3.', next: 'nro' },
    { id: 'nro', type: 'decision', label: 'Are there NRO connections to disclose during that period?', description: 'Consider collaborations, funding and in-kind support, including planned connections. Check the named researchers and form scope in the official application instructions.', yes: 'option-b', no: 'forms', unknown: 'unknown', crossLink: { tool: 'nro-lookup', label: 'Look up NRO names' } },
    { id: 'option-b', type: 'action', label: 'Provide Option B details where required', description: 'Disclose relevant NRO associations. The PI addresses those associations in the mitigation checklist. Other concerning entities do not automatically establish an NRO connection.', next: 'forms' },
    { id: 'forms', type: 'action', label: 'Complete and review the official forms', description: 'Check attestation duties and exclusions on pages 4–5. The PI completes the checklist; an authorized institutional officer reviews and signs it. Include other concerns through the appropriate disclosure process.', next: 'end', resourceLink: { url: policySources.ontarioForms.url, label: 'Open Ontario forms and instructions' } },
    { id: 'end', type: 'end', label: 'Prepare the competition submission package', description: 'Follow the official packaging instructions. The toolkit has not selected forms for every researcher or predicted adjudication.', outcome: 'prepare-ontario-forms' },
    { id: 'outside', type: 'end', label: 'Use the applicable funding instructions', description: 'This walkthrough has not established the requirements for another program.', outcome: 'outside-scope' },
    { id: 'unknown', type: 'end', label: 'Resolve the missing information', description: 'Do not assume a no-connection answer or select a declaration while information is unresolved. Use the official definitions and competition instructions.', outcome: 'needs-information' },
  ],
};
