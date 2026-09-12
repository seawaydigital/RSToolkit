export const glossaryData = {
 id: 'glossary', title: 'Research Security Glossary', summary: 'Plain-language explanations with official references. Definitions and scope can differ between programs.',
 sourceIds: ['nsgrp', 'stracFaq', 'ontario'],
 sections: [{ id: 'terms', title: 'Policy and practice terms', items: [
  { id: 'stra', title: 'STRA: Sensitive Technology Research Areas', text: 'Listed technology categories and subcategories relevant to STRAC. Use the official descriptions to assess whether research advances a listed area.', sourceIds: ['stra', 'stracFaq'], keywords: ['DTRS', 'domaines de recherche en technologies sensibles'] },
  { id: 'strac', title: 'STRAC policy', text: 'A policy connecting in-scope sensitive research funding with restrictions on specified NRO affiliations, funding and in-kind support. Attestation and ongoing duties must be checked separately.', sourceIds: ['stracFaq'], keywords: ['organisations préoccupantes'] },
  { id: 'nsgrp', title: 'NSGRP: National Security Guidelines for Research Partnerships', text: 'A framework implemented by selected funding opportunities to assess partnership risks and mitigation. Submission requirements depend on the relevant program and partner definition.', sourceIds: ['nsgrp'], keywords: ['Lignes directrices sur la sécurité nationale pour les partenariats de recherche'] },
  { id: 'nro', title: 'NRO: Named Research Organizations', text: 'Organizations and aliases named in the policy list. A listed entry, a similar name and a person’s actual relationship are different facts.', sourceIds: ['nro'], keywords: ['ORNs', 'organisations de recherche nommées'] },
  { id: 'dual', title: 'Dual use', text: 'Potential civilian and military or other security applications. The phrase alone does not determine a legal classification, export permit or STRA result.', sourceIds: ['exports', 'stra'] },
  { id: 'goods', title: 'Controlled goods', text: 'Goods and technology subject to the Canadian domestic controlled-goods framework. Check examination, possession and transfer requirements, including applicable exclusions and exemptions.', sourceIds: ['goods'] },
  { id: 'export', title: 'Export controls', text: 'Rules governing specified cross-border transfers and related activities. Analysis may include technical information as well as physical items.', sourceIds: ['exports'] },
  { id: 'sanctions', title: 'Sanctions', text: 'Restrictions under applicable legislation and regulations on certain dealings, activities, goods, services or parties. A current list search alone is not a complete legal assessment.', sourceIds: ['sanctions'] },
  { id: 'diligence', title: 'Due diligence', text: 'Evidence-based steps to understand a relevant activity or relationship, document uncertainty and manage identified concerns proportionately.', sourceIds: ['nsgrpFramework'] },
  { id: 'security', title: 'Research security', text: 'Practices that help protect research and its integrity from misuse, interference and unauthorized transfer while supporting responsible collaboration.', sourceIds: ['nsgrpFramework'] },
  { id: 'assessment', title: 'Risk assessment', text: 'A contextual examination of possible harm, evidence and uncertainty. A filled-in worksheet or missing search result is not itself an acceptable-risk determination.', sourceIds: ['nsgrp'] },
  { id: 'mitigation', title: 'Risk mitigation', text: 'Measures tied to identified concerns, with responsibilities and follow-through. Their adequacy is assessed under the applicable process and funding terms.', sourceIds: ['nsgrp'] },
 ] }],
};
