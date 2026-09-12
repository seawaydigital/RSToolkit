export const triAgencyData = {
 id: 'tri-agency', title: 'Tri-Agency Research Security Guide',
 summary: 'A practical route through separate policies, supported by the official program instructions.',
 sourceIds: ['nsgrp', 'stracFaq'],
 sections: [
  { id: 'framework', title: 'Start with the application', items: [
   { id: 'program', title: 'Identify the program, competition and roles', text: 'Record the funding opportunity, submission date and participating organizations. Read the actual competition instructions before deciding which documents to prepare. This toolkit does not maintain a complete catalogue of every funding call.', sourceIds: ['nsgrp', 'stracFaq'] },
   { id: 'nsgrp', title: 'NSGRP: partnership assessment', text: 'The RAF submission rule depends on the applicable opportunity and qualifying private-sector partners. Research and partner risk findings inform the assessment; they do not waive a form that is required.', sourceIds: ['nsgrp'], tool: 'nsgrp-flowchart' },
   { id: 'strac', title: 'STRAC: sensitive research and connections', text: 'For an in-scope opportunity, whether the work advances a listed STRA affects attestation duties. Check current affiliation, funding and in-kind support, and the agency-specific roles. Evaluate STRAC separately from NSGRP.', sourceIds: ['stracFaq'], tool: 'strac-flowchart' },
   { id: 'ontario', title: 'Ontario has its own process', text: 'Federal definitions and submission outcomes cannot be transferred automatically into an Ontario application. Check the provincial instructions, disclosure period and forms.', sourceIds: ['ontario'], tool: 'ontario-flowchart' },
  ] },
  { id: 'practice', title: 'Use evidence proportionately', items: [
   { id: 'fairness', title: 'Protect research and fair treatment', text: 'Base concerns on relevant evidence about an activity and relationship. Nationality, language or ethnicity alone must not become a toolkit risk score. Check mistaken identity, record uncertainty and avoid spreading unverified allegations.', sourceIds: ['nsgrp'] },
   { id: 'separate', title: 'Keep four different questions separate', text: 'A technology category, an organization listing, a person’s actual connection and the applicable obligation are different questions. A search match answers only a narrow lookup question.', sourceIds: ['nro', 'stracFaq'] },
   { id: 'ongoing', title: 'Review changes against the applicable terms', text: 'Keep the application-date list version and award terms. New team members, scope changes and extensions may require action. This guide does not impose a blanket annual attestation or automatically apply later list additions to older awards.', sourceIds: ['strac'], tool: 'faq' },
  ] },
 ],
};
