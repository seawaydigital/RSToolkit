export const riskMitigationData = {
 id: 'mitigation', title: 'Risk Mitigation Guide',
 summary: 'Choose measures that address evidence in a specific project. These are preparation prompts, not a universal set of mandatory controls.',
 sourceIds: ['nsgrpFramework', 'nsgrp'],
 sections: [
  { id: 'partners', title: 'Partners and people', items: [
   { id: 'identity', title: 'Verify identity before interpreting a match', text: 'Compare official names, aliases, organizational context and the relevant relationship. Record uncertainty and resolve homonyms. Proximity, citizenship or a Canadian address alone does not establish risk or safety.', sourceIds: ['nro', 'nsgrp'] },
   { id: 'due-diligence', title: 'Use proportionate due diligence', text: 'Identify the project-specific concern, check credible evidence and document the reasoning in an approved location. Avoid blanket background checks, unnecessary sensitive information and circulation of unverified allegations.', sourceIds: ['nsgrpFramework', 'nsgrp'] },
   { id: 'roles', title: 'Define roles, responsibilities and disclosure routes', text: 'Agree who oversees access, partner changes, conflicts and relevant disclosures. Explain applicable requirements to the team without assuming every member has the same form-submission duties.', sourceIds: ['stracFaq', 'nsgrp'] },
  ] },
  { id: 'information', title: 'Information and agreements', items: [
   { id: 'access', title: 'Control access to identified sensitive information', text: 'Identify the data or technology requiring protection, give people appropriate access and review it when work or roles change. Use supported institutional systems and an explicit handover/revocation process.', sourceIds: ['cyber', 'lakeheadRdm'] },
   { id: 'agreements', title: 'Document intended use and sharing conditions', text: 'Establish responsibilities for data, intellectual property, confidentiality, publication and permitted onward sharing through the applicable institutional agreements. This toolkit does not draft binding terms or determine export permissions.', sourceIds: ['nsgrpFramework', 'exports'] },
   { id: 'recovery', title: 'Prepare for interruption or compromise', text: 'Test backups and restoration, identify the private incident-reporting route and know how to suspend affected access without destroying evidence or research records.', sourceIds: ['cyber'] },
  ] },
  { id: 'monitoring', title: 'Maintain a project-specific plan', items: [
   { id: 'accountability', title: 'Assign a measure, owner and review point', text: 'Connect each identified risk with a feasible action, responsible role and evidence of implementation. Record unresolved matters. The fact that every worksheet item has an answer does not establish acceptability.', sourceIds: ['nsgrp'] },
   { id: 'changes', title: 'Revisit changes under the applicable rules', text: 'Review team, partner, activity and funding changes against the award terms and applicable list version. A newly published NRO addition is not automatically a retroactive condition of an earlier award.', sourceIds: ['strac', 'nsgrp'] },
  ] },
 ],
};
