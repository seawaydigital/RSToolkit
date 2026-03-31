export const glossaryData = {
  lastUpdated: '2026-03-31',
  sourceNote: 'Definitions sourced from official Canadian and Ontario Government publications where available.',
  terms: [
    {
      id: 'controlled-goods',
      term: 'Controlled Goods',
      shortDef: 'Military and strategic goods and technologies regulated under the Controlled Goods Program.',
      definition:
        'Goods, components, and technologies listed in the Defence Production Act\'s Controlled Goods List that relate to weapons, military equipment, and certain dual-use items. The Controlled Goods Program (CGP), administered by Public Services and Procurement Canada, regulates who may examine, possess, or transfer controlled goods in Canada. Organizations handling controlled goods must register with the CGP and conduct security assessments of employees with access.',
      source: 'Defence Production Act, R.S.C., 1985, c. D-1; Controlled Goods Program, PSPC',
      sourceUrl: 'https://www.tpsgc-pwgsc.gc.ca/pmc-cgp/index-eng.html',
      category: 'Export Controls',
      tags: ['export', 'controls', 'military'],
    },
    {
      id: 'due-diligence',
      term: 'Due Diligence',
      shortDef: 'Reasonable steps taken to assess risks before entering a research partnership.',
      definition:
        'In the context of research security, due diligence refers to the process by which researchers and institutions assess potential risks associated with research partnerships, collaborators, and funding sources prior to and during the research relationship. This includes verifying the identity and affiliations of partners, assessing whether research areas fall under STRA, and determining whether any partners appear on the NRO list. The NSGRP states that researchers and institutions share responsibility for conducting appropriate due diligence.',
      source: 'National Security Guidelines for Research Partnerships (NSGRP), Government of Canada',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/national-security-guidelines-research-partnerships',
      category: 'Policy Terms',
      tags: ['compliance', 'partnerships'],
    },
    {
      id: 'dual-use',
      term: 'Dual-Use Research',
      shortDef: 'Research with both civilian and potential military or weapons applications.',
      definition:
        'Research, knowledge, or technology that can be applied for both beneficial civilian purposes and for harmful or military purposes. Dual-use considerations are central to export control regimes and research security policies. The Export Control List under the EIPA and the Wassenaar Arrangement both target dual-use goods and technologies. Researchers working in dual-use fields may be subject to export permit requirements even when collaborating with civilian academic institutions.',
      source: 'Export and Import Permits Act; Wassenaar Arrangement on Export Controls for Conventional Arms and Dual-Use Goods and Technologies',
      sourceUrl: 'https://www.international.gc.ca/controls-controles/about-a_propos/expor/before-avant.aspx',
      category: 'Policy Terms',
      tags: ['export', 'controls', 'technology'],
    },
    {
      id: 'export-controls',
      term: 'Export Controls',
      shortDef: 'Legal requirements governing the transfer of controlled goods and technology outside Canada.',
      definition:
        'Canada\'s export control regime, established under the Export and Import Permits Act (EIPA), regulates the export and transfer of goods and technologies on the Export Control List (ECL) and to countries on the Area Control List (ACL). Controls apply not only to physical shipments but also to "intangible transfers" — sharing controlled technology via email, cloud storage, or verbal communication. Universities are not exempt. Researchers must assess whether their work involves controlled goods or dual-use technology before sharing with foreign nationals or institutions, even within Canada.',
      source: 'Export and Import Permits Act, R.S.C., 1985, c. E-19; Global Affairs Canada',
      sourceUrl: 'https://www.international.gc.ca/controls-controles/about-a_propos/expor/before-avant.aspx',
      category: 'Export Controls',
      tags: ['export', 'controls', 'eipa', 'legislation'],
    },
    {
      id: 'named-research-organization',
      term: 'Named Research Organization (NRO)',
      shortDef: 'An organization listed by the Government of Canada as posing a risk to national security.',
      definition:
        'Organizations identified by the Government of Canada as posing a risk to national security due to their involvement with the military, national security apparatus, or state-sponsored programs of countries with demonstrated intent to acquire Canadian sensitive technology. Under the Policy on Sensitive Technology Research and Affiliations of Concern (STRAC Policy), Canadian researchers receiving tri-agency funding must not conduct research with, or receive funding from, Named Research Organizations. The NRO list is maintained and updated by the Government of Canada.',
      source: 'Policy on Sensitive Technology Research and Affiliations of Concern (STRAC Policy), Government of Canada',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/named-research-organizations',
      category: 'Policy Terms',
      tags: ['strac', 'nro', 'security'],
    },
    {
      id: 'nsgrp',
      term: 'National Security Guidelines for Research Partnerships (NSGRP)',
      shortDef: 'Federal guidelines for risk-based assessment of research partnership proposals.',
      definition:
        'Guidelines established by the Government of Canada (administered through the tri-agency: NSERC, SSHRC, CIHR) requiring that research partnership applications be assessed against national security considerations. The NSGRP applies to all research partnership applications involving private-sector organizations, non-governmental organizations, and international organizations. Applicants must complete a risk assessment questionnaire, and tri-agency program officers review for national security concerns before funding is awarded. Applications flagged for elevated risk may be referred to national security bodies for further review.',
      source: 'National Security Guidelines for Research Partnerships (NSGRP), Government of Canada, 2021',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/national-security-guidelines-research-partnerships',
      category: 'Policy Terms',
      tags: ['nsgrp', 'partnerships', 'compliance'],
    },
    {
      id: 'research-security',
      term: 'Research Security',
      shortDef: 'Protecting Canadian research from foreign interference, theft, and misuse.',
      definition:
        'A set of policies, practices, and safeguards designed to protect the integrity, confidentiality, and beneficial use of Canadian research. Research security encompasses measures to prevent foreign state-sponsored espionage, unauthorized technology transfer, research misconduct motivated by foreign actors, and misappropriation of intellectual property developed with Canadian public funding. The Government of Canada\'s research security framework spans the STRAC Policy, the NSGRP, export control legislation, and institutional policies at universities and research institutions.',
      source: 'Safeguarding Your Research portal, Government of Canada',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research',
      category: 'Policy Terms',
      tags: ['security', 'policy'],
    },
    {
      id: 'risk-assessment',
      term: 'Risk Assessment',
      shortDef: 'Evaluating the national security risk of a research project or partnership.',
      definition:
        'The process of systematically evaluating the potential national security risks associated with a research project, partnership, or funding arrangement. Under the NSGRP, all eligible partnership grant applications must include a risk assessment completed by the applying researcher(s). The assessment considers factors such as the sensitivity of the research area (STRA status), the nature of the partner organization (NRO status, country of origin), the potential for misuse of research outcomes, and proposed safeguards. Institutions are expected to support researchers in conducting meaningful risk assessments.',
      source: 'National Security Guidelines for Research Partnerships (NSGRP), Government of Canada',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/national-security-guidelines-research-partnerships',
      category: 'Policy Terms',
      tags: ['compliance', 'assessment'],
    },
    {
      id: 'risk-mitigation',
      term: 'Risk Mitigation',
      shortDef: 'Actions taken to reduce identified national security risks in a research project.',
      definition:
        'Steps taken by researchers and institutions to reduce the likelihood or impact of national security risks identified through a risk assessment. Under the NSGRP, when a partnership grant application is flagged as elevated risk, the tri-agency may work with the applicant to implement mitigation measures as a condition of funding. Common mitigation strategies include restricting access to sensitive research outputs, implementing data management controls, limiting partner involvement in certain research activities, requiring publication approval processes, or restructuring the partnership to exclude higher-risk elements. Mitigation does not eliminate risk but brings it to an acceptable level.',
      source: 'National Security Guidelines for Research Partnerships (NSGRP), Government of Canada',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/national-security-guidelines-research-partnerships',
      category: 'Policy Terms',
      tags: ['compliance', 'assessment', 'nsgrp'],
    },
    {
      id: 'sanctions',
      term: 'Sanctions',
      shortDef: 'Legal restrictions on transactions with designated countries, organizations, or individuals.',
      definition:
        'Restrictive measures imposed by Canada against foreign states, organizations, and individuals for foreign policy or national security reasons. Canadian sanctions can arise under the Special Economic Measures Act (SEMA), the United Nations Act (UNA), the Justice for Victims of Corrupt Foreign Officials Act (Magnitsky Act), and the Export and Import Permits Act. For researchers, sanctions may prohibit funding from, payments to, or collaborations with sanctioned entities, even in academic contexts. Sanctions lists are maintained by Global Affairs Canada and updated frequently.',
      source: 'Global Affairs Canada, Sanctions Regime',
      sourceUrl: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/index.aspx',
      category: 'Export Controls',
      tags: ['sanctions', 'export', 'controls'],
    },
    {
      id: 'sensitive-technology-research-areas',
      term: 'Sensitive Technology Research Areas (STRA)',
      shortDef: 'Areas of research identified by Canada as particularly vulnerable to foreign misuse.',
      definition:
        'A list of research areas identified by the Government of Canada as particularly sensitive from a national security perspective, maintained by the tri-agency. Researchers conducting work in STRA fields are at higher risk of unwanted foreign interference and technology transfer. Under the STRAC Policy, researchers with tri-agency funding who work in STRA fields and who have affiliations with Named Research Organizations are not eligible for continued funding. The STRA list currently covers approximately 12 broad categories including AI, quantum science, advanced biology, aerospace, space technology, advanced energy, advanced manufacturing, and advanced sensing.',
      source: 'Sensitive Technology Research Areas, Government of Canada',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-areas',
      category: 'Policy Terms',
      tags: ['stra', 'strac', 'technology'],
    },
    {
      id: 'strac-policy',
      term: 'Policy on Sensitive Technology Research and Affiliations of Concern (STRAC Policy)',
      shortDef: 'Federal policy requiring researchers in sensitive areas to have no NRO affiliations.',
      definition:
        'A federal policy issued jointly by NSERC, SSHRC, and CIHR that requires researchers applying for or holding tri-agency funding to not have current affiliations with Named Research Organizations if their research falls within a Sensitive Technology Research Area. Researchers must attest at the time of application and annually that they have no such affiliations. Non-compliance can result in ineligibility for tri-agency funding. The policy does not prohibit international collaboration broadly — only affiliations with specifically listed organizations in sensitive research areas.',
      source: 'Policy on Sensitive Technology Research and Affiliations of Concern, NSERC/SSHRC/CIHR',
      sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-universities-researchers-and-sponsors/sensitive-technology-research-and-affiliations-concern',
      category: 'Policy Terms',
      tags: ['strac', 'policy', 'compliance'],
    },
  ],
};
