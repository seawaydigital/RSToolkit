export const faqData = {
 id: 'faq', title: 'Research Security FAQ', summary: 'Scoped answers with authoritative references. Check the funding opportunity and institution-specific requirements.',
 sourceIds: ['nsgrp', 'stracFaq'],
 sections: [
  { id: 'funding', title: 'Funding and policy scope', items: [
   { id: 'raf', title: 'Do I need a RAF when I have not identified a risk?', text: 'Yes, if the applicable NSGRP program and qualifying private-partner submission conditions are met. A no-risk assessment does not waive a required form. Check the NSGRP walkthrough for the scope questions.', sourceIds: ['nsgrp'], tool: 'nsgrp-flowchart' },
   { id: 'both', title: 'Are NSGRP and STRAC the same requirement?', text: 'They are distinct. A funding opportunity can apply both, one or neither. Establish each requirement separately using its competition instructions.', sourceIds: ['nsgrp', 'stracFaq'] },
   { id: 'attest', title: 'Does everyone on a team have to submit an attestation?', text: 'STRAC attesting roles depend on the funding agency and whether the in-scope grant advances a listed STRA. Unnamed trainees can have ongoing compliance duties without an application attestation. Check the official agency-specific role definitions.', sourceIds: ['stracFaq'], location: 'Questions 2–4' },
   { id: 'annual', title: 'Must STRAC attestations be renewed annually?', text: 'This toolkit does not establish a blanket annual renewal requirement. Follow the particular competition, award and institutional instructions. Distinguish application attestations from ongoing duties and required reporting of changes.', sourceIds: ['strac'] },
   { id: 'older', title: 'What about older awards and later list updates?', text: 'Do not apply a current list retrospectively by default. Determine the applicable application-date list, award terms and the treatment of extensions or changed research. This release provides a current reference snapshot, not a complete historical list service.', sourceIds: ['strac', 'stracFaq'] },
   { id: 'ontario', title: 'Can I reuse the federal process for Ontario?', text: 'Ontario has separate disclosure definitions, time periods and forms. Check its complete Relevant Period and application instructions rather than importing a federal no-action outcome.', sourceIds: ['ontario'], tool: 'ontario-flowchart' },
  ] },
  { id: 'screening', title: 'Research and partner lookup', items: [
   { id: 'stra', title: 'Does using AI or another listed technology automatically make my work a STRA?', text: 'The policy asks whether funded research advances a listed subcategory. Inspect the official definitions and examples. The category explorer helps locate information but does not classify your research.', sourceIds: ['stracFaq', 'stra'], tool: 'stra-lookup' },
   { id: 'nro', title: 'Does a name match prove an NRO affiliation?', text: 'No. Verify the organization’s identity and the actual relationship independently. Alias and fuzzy matches are search aids. An unrelated co-publication does not itself establish a person’s NRO affiliation.', sourceIds: ['nro', 'stracFaq'] },
   { id: 'negative', title: 'Does no search result mean the partner is cleared?', text: 'No. Try official names and aliases, clear filters and consult the complete official source. The NRO list is not a comprehensive register of all possible risks or sanctions.', sourceIds: ['nro', 'sanctions'] },
   { id: 'canadian', title: 'Is a Canadian company automatically lower risk?', text: 'Assess relevant ownership, relationships, activities and evidence in context. An address, nationality or country label alone is not a risk assessment.', sourceIds: ['nsgrpFramework', 'nsgrp'] },
  ] },
  { id: 'practice', title: 'Using the toolkit', items: [
   { id: 'student', title: 'Can an international student work in a Canadian laboratory?', text: 'This tool cannot decide access from nationality. Determine the actual controlled-goods, export, sanctions and any applicable foreign-origin requirements. The reference explains the separate regimes without issuing a legal clearance.', sourceIds: ['exports', 'goods', 'sanctions'], tool: 'export-control' },
   { id: 'storage', title: 'Where should research data be stored and how long should it be kept?', text: 'Use the requirements applicable to the data, consent/ethics commitments, community governance, institution, agreement and funder. The toolkit does not impose one retention period or a blanket geography-only rule.', sourceIds: ['lakeheadRdm', 'privacy'] },
   { id: 'complete', title: 'Does a completed worksheet mean approval?', text: 'No. Completion means responses were recorded. Risks, unanswered questions and uncertainty remain visible. The worksheet does not replace the official RAF or institutional review.', sourceIds: ['raf', 'nsgrp'] },
   { id: 'report', title: 'How should I report an urgent concern?', text: 'Follow the published institutional incident process promptly. Do not post confidential research or allegations in a public toolkit issue. This guide does not promise a universal legal protection for every kind of report.', sourceIds: ['cyber', 'lakeheadHelp'] },
  ] },
 ],
};
