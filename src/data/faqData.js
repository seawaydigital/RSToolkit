export const faqData = {
  lastUpdated: '2026-03-31',
  categories: [
    {
      id: 'strac-policy',
      title: 'STRAC Policy',
      icon: '🛡️',
      faqs: [
        {
          id: 'strac-what',
          question: 'What is the STRAC Policy and who does it apply to?',
          answer:
            'The Policy on Sensitive Technology Research and Affiliations of Concern (STRAC Policy) is a federal requirement that applies to all researchers who hold or apply for funding from NSERC, SSHRC, or CIHR (the "tri-agency"). It requires that researchers whose work falls within a Sensitive Technology Research Area (STRA) must not have affiliations with any organization on the Named Research Organizations (NRO) list. If you are a researcher at a Canadian university or institution applying for tri-agency funding, this policy applies to you.',
          tags: ['strac', 'policy', 'eligibility'],
        },
        {
          id: 'strac-applies',
          question: 'Does the STRAC Policy apply to ALL tri-agency funded researchers?',
          answer:
            'The STRAC Policy applies when BOTH of the following are true: (1) your research falls within one or more Sensitive Technology Research Areas (STRAs), AND (2) you have an affiliation with an organization on the Named Research Organizations (NRO) list. If your research is not in a STRA, the STRAC Policy restrictions do not apply regardless of your affiliations. If your research is in a STRA but you have no NRO affiliations, you are in compliance. The policy does not restrict international collaboration broadly — only affiliations with specifically listed organizations.',
          tags: ['strac', 'stra', 'nro'],
        },
        {
          id: 'strac-affiliation',
          question: 'What counts as an "affiliation" with an NRO?',
          answer:
            'An affiliation with a Named Research Organization includes: receiving funding or in-kind support from an NRO, holding a formal or informal research position at an NRO (e.g., adjunct professor, visiting researcher, courtesy appointment), being a co-investigator or collaborator on a project where an NRO is a partner, and receiving grants or scholarships through an NRO. Past affiliations that have fully ended do not count, but researchers must be transparent about current and planned affiliations when applying for tri-agency funds. When in doubt, consult your institution\'s research security or research services office.',
          tags: ['strac', 'nro', 'affiliation'],
        },
        {
          id: 'strac-consequence',
          question: 'What happens if a researcher violates the STRAC Policy?',
          answer:
            'A researcher found to have an undisclosed or ongoing affiliation with an NRO while holding tri-agency funding in a STRA may be required to end the affiliation, have their funding placed on hold, be required to return funding, or be declared ineligible for future tri-agency funding for a period of time. The tri-agency takes a risk-based and supportive approach, and researchers are encouraged to proactively disclose and seek guidance rather than risk non-compliance. Institutions also have responsibilities to support researcher compliance.',
          tags: ['strac', 'compliance', 'consequences'],
        },
        {
          id: 'strac-stra-check',
          question: 'How do I know if my research is in a Sensitive Technology Research Area (STRA)?',
          answer:
            'Use the STRA Lookup tool in this toolkit (or the Government of Canada\'s official STRA list) to search for keywords related to your research area. The STRA list covers approximately 12 broad categories including artificial intelligence, quantum science, advanced biology, aerospace, and others — each broken down into specific subcategories. If you are unsure whether your research fits, use the "Guided Assessment" wizard in the STRA Lookup tool, or contact your institution\'s research security office. When in doubt, it is better to seek guidance early than to assume your work is not covered.',
          tags: ['stra', 'lookup', 'compliance'],
          relatedTool: 'stra-lookup',
        },
      ],
    },
    {
      id: 'nro',
      title: 'Named Research Organizations (NRO)',
      icon: '🏛️',
      faqs: [
        {
          id: 'nro-what',
          question: 'What is a Named Research Organization (NRO)?',
          answer:
            'A Named Research Organization (NRO) is an organization identified by the Government of Canada as posing a risk to national security due to its links with the military, national security apparatus, or state-sponsored programs of a foreign country that has demonstrated intent to acquire Canadian sensitive technologies. The NRO list currently includes hundreds of organizations, primarily from China, Russia, and Iran. The list is maintained by the Government of Canada and updated periodically.',
          tags: ['nro', 'policy'],
        },
        {
          id: 'nro-find',
          question: 'How do I find out if a specific organization is on the NRO list?',
          answer:
            'Use the NRO Lookup & Map tool in this toolkit to search by name, alias, or city. The tool includes the full current NRO list with an interactive map. You should also check the official Government of Canada NRO list directly, as it is updated periodically and this toolkit may not reflect the very latest version. If an organization has alternate names, romanized spellings, or subsidiaries, search for variations — many NROs are known by multiple names. If you are unsure, consult your institution\'s research security office.',
          tags: ['nro', 'lookup'],
          relatedTool: 'nro-lookup',
        },
        {
          id: 'nro-update',
          question: 'How often is the NRO list updated?',
          answer:
            'The Government of Canada updates the NRO list periodically as new intelligence assessments are completed. There is no fixed schedule — additions and removals can occur at any time. Researchers with ongoing collaborations or funding relationships should check the list regularly, particularly at the time of grant application and renewal. Sign up for notifications from your institution\'s research office or check the Government of Canada\'s Safeguarding Your Research portal for announcements.',
          tags: ['nro', 'updates'],
        },
        {
          id: 'nro-subsidiary',
          question: 'Does the NRO restriction apply to subsidiaries or spin-offs of listed organizations?',
          answer:
            'This is an area where guidance is evolving. The NRO list names specific organizations, but the Government of Canada has indicated that researchers should exercise caution with entities that are subsidiaries, spin-offs, or closely affiliated with listed NROs. If an organization appears to be a front, subsidiary, or closely affiliated entity of a listed NRO, it may still trigger STRAC Policy concerns. When in doubt, seek guidance from your institution\'s research security office before establishing any affiliation.',
          tags: ['nro', 'subsidiaries'],
        },
      ],
    },
    {
      id: 'nsgrp',
      title: 'NSGRP & Research Partnerships',
      icon: '🤝',
      faqs: [
        {
          id: 'nsgrp-what',
          question: 'What is the NSGRP and when does it apply?',
          answer:
            'The National Security Guidelines for Research Partnerships (NSGRP) are federal guidelines that require all research partnership grant applications submitted to the tri-agency (NSERC, SSHRC, CIHR) to be assessed for national security risks. The NSGRP applies whenever you apply for a partnership grant that involves a private-sector organization, non-governmental organization, or international organization as a partner. Pure academic collaborations between universities are generally not subject to the NSGRP, but any partner from outside the academic sector may trigger the requirements.',
          tags: ['nsgrp', 'partnerships'],
        },
        {
          id: 'nsgrp-vs-strac',
          question: 'What is the difference between the NSGRP and the STRAC Policy?',
          answer:
            'The NSGRP and the STRAC Policy are separate but related frameworks. The NSGRP is a risk assessment process applied at the time of partnership grant application — it requires researchers to complete a questionnaire evaluating national security risks, and the tri-agency may deny or condition funding based on that assessment. The STRAC Policy is a hard eligibility rule: researchers whose work is in a STRA and who have NRO affiliations are simply ineligible for tri-agency funding — no case-by-case assessment is done. Think of the NSGRP as a risk review process and the STRAC Policy as a bright-line prohibition.',
          tags: ['nsgrp', 'strac', 'policy'],
        },
        {
          id: 'nsgrp-assessment',
          question: 'What does the NSGRP risk assessment involve?',
          answer:
            'The NSGRP risk assessment is a questionnaire completed by the applying researcher(s) as part of the grant application. It asks about: the nature of the research and whether it involves sensitive technologies, the identity and background of partner organizations (including country of ownership and affiliations), proposed intellectual property arrangements, any publication restrictions, and safeguards in place to protect sensitive information. The tri-agency uses this information to assess the national security risk of the partnership. Higher-risk applications may require additional review or mitigation measures.',
          tags: ['nsgrp', 'risk', 'assessment'],
          relatedTool: 'nsgrp-flowchart',
        },
        {
          id: 'nsgrp-low-risk',
          question: 'My industry partner is a Canadian company — do I still need to worry about the NSGRP?',
          answer:
            'Yes, potentially. The NSGRP applies to any partnership with a non-academic partner, including Canadian companies. However, the risk level assigned to a Canadian company with no foreign ownership or affiliations will generally be much lower than for a foreign-owned entity. The risk assessment will consider factors like whether the Canadian company is foreign-owned or controlled, the nature of the research, and whether the research has dual-use potential. Many partnerships with Canadian companies will complete the NSGRP review without issue, but the process still applies.',
          tags: ['nsgrp', 'industry', 'canadian'],
        },
      ],
    },
    {
      id: 'export-control',
      title: 'Export Controls',
      icon: '🚢',
      faqs: [
        {
          id: 'ec-apply-universities',
          question: 'Do export controls really apply to university research?',
          answer:
            'Yes. Canadian export controls apply to university research just as they apply to commercial activities. The Export and Import Permits Act (EIPA) does not exempt academic institutions. If your research involves goods or technologies on the Export Control List (ECL), you may need an export permit to transfer that technology — including to foreign students working in your lab (a "deemed export"). Many universities have export control compliance programs to help researchers navigate these requirements. Contact your institution\'s research compliance or legal office for guidance.',
          tags: ['export', 'controls', 'universities'],
          relatedTool: 'export-control',
        },
        {
          id: 'ec-international-student',
          question: 'Can I share research data with my international graduate students?',
          answer:
            'This depends on whether the data constitutes "controlled technology" under the Export Control List. For most academic research — published or publishable, not involving weapons or military systems — sharing data with international students does not require an export permit. However, if your research involves technologies on the Export Control List (e.g., certain encryption, advanced materials, aerospace propulsion), providing access to international students may constitute a "deemed export" or "intangible transfer of technology" requiring a permit. When working in sensitive technology areas, consult your institution\'s export compliance office.',
          tags: ['export', 'controls', 'students', 'deemed-export'],
        },
        {
          id: 'ec-sanctions',
          question: 'How do I know if a potential collaborator is subject to Canadian sanctions?',
          answer:
            'Global Affairs Canada maintains the Canadian Sanctions List, which identifies individuals and entities subject to sanctions under the Special Economic Measures Act (SEMA), the United Nations Act (UNA), and other legislation. You can search the list at the Global Affairs Canada website. Transacting with sanctioned persons — including research collaboration, payments, or providing services — is prohibited. Sanctions apply to both organizations and individuals, and the list is updated frequently. Consider sanctions screening as part of your due diligence for any international collaboration.',
          tags: ['sanctions', 'collaborators'],
        },
        {
          id: 'ec-publication',
          question: 'Does publishing my research results count as an "export"?',
          answer:
            'Generally, publishing research results in academic journals, conference papers, or other open publications does not constitute a controlled export in Canada. However, if your research involves controlled technology and your publication would disclose technical details that provide a foreign state or entity with access to that technology, there may be export control implications. This is an area where the boundary is not always clear. If you are working with technology on the Export Control List and plan to publish detailed technical data, consult with your institution\'s export control compliance office before submission.',
          tags: ['export', 'controls', 'publication'],
        },
      ],
    },
    {
      id: 'institutional',
      title: 'Institutional Responsibilities',
      icon: '🏫',
      faqs: [
        {
          id: 'inst-who-responsible',
          question: 'Who is responsible for research security — the researcher or the institution?',
          answer:
            'Both. The Government of Canada places responsibility on both researchers and institutions. Researchers are responsible for: knowing the requirements that apply to their work, completing required attestations, disclosing affiliations, and conducting due diligence on partners. Institutions are responsible for: developing and implementing research security policies, providing training and support to researchers, reviewing grant applications for compliance, and reporting concerns to appropriate authorities. When in doubt, researchers should consult their institution\'s research security or research services office — it is there to help.',
          tags: ['institutional', 'responsibilities'],
        },
        {
          id: 'inst-policy',
          question: 'Does my university need a formal research security policy?',
          answer:
            'Under the Ontario Research Security Guidelines, publicly assisted universities in Ontario are expected to adopt formal research security policies covering personnel security, information security, physical security, and cybersecurity. Federally, the STRAC Policy and NSGRP create institutional obligations for universities whose researchers receive tri-agency funding. Most major Canadian research universities now have dedicated research security offices or staff embedded in research services. If your university does not yet have formal policies, it likely does or will soon under increasing federal and provincial pressure.',
          tags: ['institutional', 'policy', 'ontario'],
          relatedTool: 'ontario-flowchart',
        },
        {
          id: 'inst-training',
          question: 'Is there training available for research security?',
          answer:
            'Yes. The Government of Canada\'s Safeguarding Your Research portal (science.gc.ca) provides free online training modules for researchers. Individual universities also provide institution-specific training through their research security or research services offices. CSIS has produced threat awareness briefings available to institutions upon request. The tri-agency occasionally hosts webinars on STRAC Policy and NSGRP compliance. Investing time in training is strongly encouraged — research security requirements are evolving rapidly and non-compliance carries real consequences.',
          tags: ['training', 'institutional'],
        },
        {
          id: 'inst-report',
          question: 'What should I do if I suspect foreign interference in my research?',
          answer:
            'If you suspect that you or your research has been targeted by foreign interference — including suspicious recruitment approaches, unauthorized access to data, or pressure from a foreign government or affiliated entity — you should report it to your institution\'s security or research integrity office, who can assist and escalate appropriately. You may also contact the Canadian Security Intelligence Service (CSIS) through their tip line (1-800-267-7685) or the RCMP. Reporting suspected foreign interference is encouraged and protected under Canadian law. Document the incident carefully before reporting.',
          tags: ['reporting', 'foreign-interference'],
        },
      ],
    },
    {
      id: 'getting-help',
      title: 'Getting Help & Resources',
      icon: '💡',
      faqs: [
        {
          id: 'help-where',
          question: 'Where can I get official guidance on research security?',
          answer:
            'The primary official resource is the Government of Canada\'s Safeguarding Your Research portal at science.gc.ca. It contains the current STRA and NRO lists, the STRAC Policy, the NSGRP, export control guidance, and links to training resources. For institution-specific guidance, contact your university\'s research security office, research services office, or general counsel. For export control questions specifically, the Trade Commissioner Service at Global Affairs Canada provides guidance. CSIS and the RCMP can assist with national security threat concerns.',
          tags: ['help', 'resources'],
        },
        {
          id: 'help-toolkit',
          question: 'Is this toolkit an official Government of Canada resource?',
          answer:
            'No. This Research Security Toolkit is an independent reference tool created to help Canadian researchers navigate research security requirements. It is not produced by or affiliated with the Government of Canada, the tri-agency, or any federal agency. While we aim to keep information current and accurate, you should always consult the official Government of Canada sources (particularly science.gc.ca) and your institution\'s research security office for authoritative guidance. Policy requirements can change, and official sources are always the most current.',
          tags: ['disclaimer', 'about'],
        },
        {
          id: 'help-stra-lookup',
          question: 'What tools in this toolkit should I use before submitting a grant?',
          answer:
            'Before submitting a tri-agency grant application, we recommend: (1) Use the STRA Lookup to check whether your research falls within a Sensitive Technology Research Area. (2) Use the NRO Lookup to check whether any partners or collaborators appear on the Named Research Organizations list. (3) If applying for a partnership grant, use the NSGRP Flowchart to understand the risk assessment process. (4) Use the Risk Assessment Checklist to systematically work through security considerations. (5) Review the Export Control Quick Reference if your research involves dual-use or controlled technologies.',
          tags: ['help', 'grants', 'workflow'],
          relatedTools: ['stra-lookup', 'nro-lookup', 'nsgrp-flowchart', 'risk-checklist', 'export-control'],
        },
      ],
    },
  ],
};
