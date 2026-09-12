export const exportControlData = {
 id: 'export', title: 'Export Control and Sanctions Reference',
 summary: 'Identify the legal regime and information to check. This guide does not authorize a transfer, transaction or admission decision.',
 sourceIds: ['exports', 'goods', 'sanctions'],
 sections: [
  { id: 'transfers', title: 'Transfers and access', items: [
   { id: 'ecl-guide', title: 'Look up a specific Export Control List item', text: 'Open the official Guide to Canada’s Export Control List for item-level technical parameters and the applicable version. The toolkit’s short summaries do not reproduce the full list or determine classification.', sourceIds: ['ecl'], keywords: ['ECL', 'classification', 'technical parameters'] },
   { id: 'export', title: 'Canadian exports and intangible transfers', text: 'Review the item or technical information, destination, recipient, end use and applicable controls before a transfer. Email, cloud access, remote collaboration or oral disclosure can involve technology transfers. Academic purpose alone does not establish a permit exemption.', sourceIds: ['exports'], keywords: ['EIPA', 'ECL', 'cloud', 'email', 'remote'] },
   { id: 'domestic', title: 'Controlled goods inside Canada', text: 'Examination, possession and transfer of controlled goods in Canada have a distinct framework. Check registration, security assessments and applicable exclusions or exemptions. Do not replace that analysis with a general export checklist.', sourceIds: ['goods'], keywords: ['DPA', 'CGP', 'Defence Production Act'] },
   { id: 'student', title: 'International students and foreign-origin technology', text: 'Do not label access in a Canadian laboratory a Canadian deemed export solely because a student is international. Establish the Canadian controls and any applicable foreign-origin restrictions separately. The toolkit cannot determine access from citizenship alone.', sourceIds: ['exports', 'goods'], keywords: ['deemed export', 'student', 'US', 'ITAR', 'EAR'] },
   { id: 'acl', title: 'Area controls concern regulated activities', text: 'A partnership label is not itself an export permit. Check the actual goods, technology or activities, the destination rules and the relevant permit process in the current handbook.', sourceIds: ['exports'], keywords: ['Area Control List', 'ACL', 'permit'] },
  ] },
  { id: 'sanctions', title: 'Sanctions are activity-specific', items: [
   { id: 'regimes', title: 'Identify the applicable Canadian restrictions', text: 'Check the governing regulations, parties, ownership or indirect dealings, services, technology and financial transactions. Exceptions and permits depend on the actual regime. NRO status is not a sanctions determination.', sourceIds: ['sanctions'] },
   { id: 'lists', title: 'One search is not complete screening', text: 'Use the official guidance on UN and Canadian autonomous lists together with applicable regulations. US and EU lists are not automatically Canadian law; any foreign obligation needs an applicable nexus. An unlisted counterparty can still present an indirect-dealing issue.', sourceIds: ['sanctions'] },
   { id: 'fairness', title: 'Avoid country-wide admissions or employment conclusions', text: 'Canadian sanctions do not prohibit education or employment for every person from a sanctioned country. Examine the actual activity and relevant relationships. Verify names before drawing a consequential conclusion.', sourceIds: ['sanctions'] },
  ] },
  { id: 'prepare', title: 'Prepare a useful review record', items: [
   { id: 'facts', title: 'Gather the facts without collecting unnecessary personal data', text: 'Record the proposed transfer or activity, technical classification if known, destination, entities and source/date of checks in an approved institutional record. Separate verified facts from assumptions. Keep confidential case details out of public issues and this toolkit.', sourceIds: ['exports', 'sanctions', 'lakeheadRdm'] },
  ] },
 ],
};
