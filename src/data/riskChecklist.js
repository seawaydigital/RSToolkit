export const riskChecklist = {
 id: 'worksheet',
 sections: [
  { id: 'scope', title: 'Scope and required documents', items: [
   { id: 'scope-program', label: 'Funding opportunity, competition and applicable requirements', prompt: 'Have you established which NSGRP, STRAC, provincial and institutional requirements apply?', sourceIds: ['nsgrp', 'stracFaq', 'ontario'] },
   { id: 'scope-roles', label: 'Research team roles and relevant connections', prompt: 'Review agency-specific roles and any relevant affiliation, funding or in-kind support. Keep uncertainty explicit.', sourceIds: ['stracFaq'] },
   { id: 'scope-forms', label: 'Forms, list version and submission instructions', prompt: 'Identify the official forms and version applicable to this application. This worksheet is not the official RAF.', sourceIds: ['raf', 'strac'] },
  ] },
  { id: 'research', title: 'Research and information', items: [
   { id: 'research-stra', label: 'Contribution to a listed STRA', prompt: 'Inspect the official subcategories and consider the funded research contribution. Using a technology is not automatically advancing it.', sourceIds: ['stra', 'stracFaq'] },
   { id: 'research-sensitive', label: 'Other sensitive research and information', prompt: 'Review the official RAF and Annex A for sensitive research, critical infrastructure/minerals and datasets. STRA categories do not cover every RAF consideration.', sourceIds: ['nsgrpFramework', 'raf'] },
   { id: 'research-export', label: 'Controlled technology and proposed transfers', prompt: 'Identify technical information, goods, recipients, destinations and access arrangements. Record uncertainty rather than assume an exemption.', sourceIds: ['exports', 'goods'] },
   { id: 'research-data', label: 'Data classification and governance commitments', prompt: 'Consider participant consent, ethics, agreements, retention and applicable community governance before deciding how information may be used or stored.', sourceIds: ['lakeheadRdm', 'ocap'] },
  ] },
  { id: 'partners', title: 'Partners and activities', items: [
   { id: 'partner-identity', label: 'Verified partner identity and relationships', prompt: 'Resolve names, aliases and the actual relationship. A match, location or nationality alone is not a risk conclusion.', sourceIds: ['nro', 'nsgrp'] },
   { id: 'partner-sanctions', label: 'Applicable sanctions and indirect dealings', prompt: 'Use current official guidance on parties and activities. NRO and sanctions checks serve different purposes.', sourceIds: ['sanctions'] },
   { id: 'partner-use', label: 'Intended use, onward sharing and agreements', prompt: 'Establish the proposed uses and responsibilities, including who can receive or exploit results. Use the relevant institutional agreement process.', sourceIds: ['nsgrpFramework'] },
  ] },
  { id: 'measures', title: 'Safeguards and follow-through', items: [
   { id: 'measure-access', label: 'Access, device and account safeguards', prompt: 'Identify appropriate access and supported systems. Confirm operational instructions for your institution and account type.', sourceIds: ['cyber', 'lakeheadCyber'] },
   { id: 'measure-recovery', label: 'Backup, recovery and incident reporting', prompt: 'Check that recovery is feasible and the reporting route is known. Avoid delaying urgent reporting.', sourceIds: ['cyber'] },
   { id: 'measure-plan', label: 'Mitigation measures, owners and unresolved matters', prompt: 'Tie each action to an identified concern and responsible role. Record what still needs evidence or a decision in the approved institutional record.', sourceIds: ['nsgrp'] },
   { id: 'measure-change', label: 'Review of changes and applicable award terms', prompt: 'Plan to reassess relevant changes in team, partners, research and funding under the applicable terms and list version.', sourceIds: ['strac', 'nsgrp'] },
  ] },
 ],
};
