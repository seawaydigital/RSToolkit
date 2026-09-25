export const faqData = {
  lastUpdated: '2026-09-18',
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
            'The Policy on Sensitive Technology Research and Affiliations of Concern (STRAC Policy) applies to grant applications submitted to NSERC, SSHRC and CIHR (the "tri-agency") and to the Canada Foundation for Innovation from May 1, 2024 onward, where the proposed research aims to advance a Sensitive Technology Research Area (STRA). For those applications, every researcher with a named role (applicants, co-applicants, collaborators or equivalent roles, which vary slightly by agency) must attest that they are not affiliated with, or receiving funding or in-kind support from, any organization on the Named Research Organizations (NRO) list. Highly qualified personnel — students, postdocs and research staff — do not attest unless they hold a named role, but everyone working on the funded research must comply for the life of the grant. The policy is not retroactive: grants awarded before May 1, 2024 are not reassessed under it, although the agencies reserve the right to consider affiliations of concern if a risk is identified.',
          tags: ['strac', 'policy', 'eligibility'],
        },
        {
          id: 'strac-applies',
          question: 'Does the STRAC Policy apply to ALL tri-agency funded researchers?',
          answer:
            'No — it applies to a grant application when the proposed research aims to advance a Sensitive Technology Research Area (STRA). That covers applications to NSERC, SSHRC, CIHR and the Canada Foundation for Innovation submitted from May 1, 2024. Research that merely uses a sensitive technology as a tool, without aiming to advance it, is out of scope — for example, using AI to sort data in a social sciences project. When the policy does apply, every researcher with a named role must attest at the time of application that they are not affiliated with, and do not receive funding or in-kind support from, an organization on the Named Research Organizations (NRO) list; an NRO connection makes the application ineligible. Having no NRO connection does not remove the attestation requirement. The policy does not restrict international collaboration broadly — only connections to specifically listed organizations.',
          tags: ['strac', 'stra', 'nro'],
          relatedTool: 'strac-flowchart',
        },
        {
          id: 'strac-affiliation',
          question: 'What counts as an "affiliation" with an NRO?',
          answer:
            'Under the STRAC Policy you are "affiliated" with an organization if you are employed by it, hold an appointment there (including adjunct, visiting, honorary or courtesy appointments), or conduct research there. The policy separately captures researchers who receive funding or in-kind support from an NRO, even without a formal appointment. Only current affiliations count: the policy states explicitly that past affiliations will not be considered, and a former student or employee with no continuing obligation to return is not affiliated. You attest to your status at the time of application and must remain compliant for the duration of the grant, so disclose anything you are unsure about and ask your institution\'s research security or research services office.',
          tags: ['strac', 'nro', 'affiliation'],
        },
        {
          id: 'strac-consequence',
          question: 'What happens if a researcher violates the STRAC Policy?',
          answer:
            'Applications that do not meet the policy are ineligible for federal funding. If the agencies later validate an attestation and find it was inaccurate, the consequences follow the Tri-Agency Framework: Responsible Conduct of Research and can include termination of the grant, a requirement to reimburse funds, and temporary or permanent ineligibility to apply for or hold federal funding. The agencies take a supportive approach — researchers are encouraged to disclose and seek guidance early rather than risk non-compliance — and institutions have a responsibility to help their researchers comply.',
          tags: ['strac', 'compliance', 'consequences'],
        },
        {
          id: 'strac-stra-check',
          question: 'How do I know if my research is in a Sensitive Technology Research Area (STRA)?',
          answer:
            'Use the STRA Lookup tool in this toolkit (or the Government of Canada\'s official STRA list) to search for keywords related to your research area. The STRA list has 11 categories — advanced digital infrastructure; advanced energy; advanced materials and manufacturing; advanced sensing and surveillance; advanced weapons; aerospace, space and satellite; artificial intelligence and big data; human-machine integration; life science; quantum science; and robotics and autonomous systems — each broken down into specific subcategories. If you are unsure whether your research fits, use the "Guided Assessment" wizard in the STRA Lookup tool, or contact your institution\'s research security office. When in doubt, it is better to seek guidance early than to assume your work is not covered.',
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
            'A Named Research Organization (NRO) is an organization identified by the Government of Canada as posing a risk to national security due to its links with the military, national security apparatus, or state-sponsored programs of a foreign country that has demonstrated intent to acquire Canadian sensitive technologies. The current list names 103 organizations: 85 in China, 12 in Iran and 6 in Russia. The Government of Canada last modified it on 2024-04-18 and updates it as threats evolve. (The NRO Lookup in this toolkit plots 126 pins because the Chinese Academy of Engineering Physics\' listed sub-institutes are mapped as separate campuses.)',
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
            'Formally, the STRAC Policy applies to the organizations on the list, including the known aliases the list gives for each one. It does not automatically extend to every subsidiary or spin-off. However, the Government of Canada notes that institutions not on the list may still pose a risk, and encourages due diligence on any collaboration in a sensitive technology research area. If an organization looks like a front for, or an arm of, a listed NRO, treat it as a serious concern and seek guidance from your institution\'s research security office before establishing any affiliation.',
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
            'The National Security Guidelines for Research Partnerships (NSGRP) set out how national security considerations are assessed in federally funded research partnerships. A Risk Assessment Form (RAF) is mandatory when two things are true: you are applying to one of the funding opportunities the tri-agency has listed (NSERC Alliance and Idea to Innovation Phase II, CIHR Project Grants, SSHRC Partnership, Partnership Development and Partnership Engage Grants, and newer opportunities added to the list), and the application includes at least one private-sector partner organization — a for-profit company or a body representing for-profits, but not a Canadian Crown corporation or a producer group. The form is required even if you believe there are no risks. The funding organization reviews every form, consulting national security departments and agencies where appropriate, and may fund the project as proposed, fund it with conditions, or decline it. Partnerships whose only partners are universities, hospitals, governments or non-profits do not require the form, but the Government of Canada encourages every researcher to apply the guidelines to any partnership.',
          tags: ['nsgrp', 'partnerships'],
        },
        {
          id: 'nsgrp-vs-strac',
          question: 'What is the difference between the NSGRP and the STRAC Policy?',
          answer:
            'The NSGRP and the STRAC Policy are separate but related frameworks. The NSGRP is a risk assessment process applied at the time of partnership grant application — it requires researchers to complete a Risk Assessment Form evaluating national security risks, and the funding organization may deny or condition funding based on that assessment. The STRAC Policy is a hard eligibility rule: researchers whose work is in a STRA and who have NRO affiliations are simply ineligible for tri-agency funding — no case-by-case assessment is done. Think of the NSGRP as a risk review process and the STRAC Policy as a bright-line prohibition.',
          tags: ['nsgrp', 'strac', 'policy'],
        },
        {
          id: 'nsgrp-assessment',
          question: 'What does the NSGRP risk assessment involve?',
          answer:
            'The NSGRP risk assessment is the Risk Assessment Form (RAF), completed by the applying researcher(s) as part of the grant application. It asks about: the nature of the research and whether it involves sensitive technologies, the identity and background of partner organizations (including country of ownership and affiliations), proposed intellectual property arrangements, any publication restrictions, and safeguards in place to protect sensitive information. The funding organization uses this information to assess the national security risk of the partnership, consulting national security departments and agencies where appropriate. Higher-risk applications may require additional review or mitigation measures.',
          tags: ['nsgrp', 'risk', 'assessment'],
          relatedTool: 'nsgrp-flowchart',
        },
        {
          id: 'nsgrp-low-risk',
          question: 'My industry partner is a Canadian company — do I still need to worry about the NSGRP?',
          answer:
            'Yes, potentially. Where a funding opportunity requires a Risk Assessment Form, it applies to private-sector partners wherever they are based, including Canadian companies. However, the risk level assigned to a Canadian company with no foreign ownership or affiliations will generally be much lower than for a foreign-owned entity. The risk assessment will consider factors like whether the Canadian company is foreign-owned or controlled, the nature of the research, and whether the research has dual-use potential. Many partnerships with Canadian companies will complete the NSGRP review without issue, but the process still applies.',
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
            'Yes. Canadian export controls apply to university research just as they apply to commercial activity; the Export and Import Permits Act (EIPA) does not exempt academic institutions. If your research involves goods or technology on the Export Control List (ECL), transferring that technology to a person outside Canada may need an export permit — and the permit requirement applies regardless of the means of delivery, so an email, a shared cloud folder, remote access to a server, or technical assistance given over a call all count. Separately, examining, possessing or transferring goods on the Controlled Goods List inside Canada is regulated by the Controlled Goods Program, which requires the institution to be registered and the people with access to be security-assessed. Many universities have export control compliance programs; contact your institution\'s research compliance or legal office for guidance.',
          tags: ['export', 'controls', 'universities', 'intangible transfer', 'controlled goods'],
          relatedTool: 'export-control',
        },
        {
          id: 'ec-international-student',
          question: 'Can I share research data with my international graduate students?',
          answer:
            'Usually yes. Canada does not have a "deemed export" rule — that is a US concept. Under Canada\'s general export-control regime, sharing controlled technology with a foreign national who is physically in Canada is not an export. Three things still need checking. First, if the data is on the Export Control List and the student will access it from outside Canada, or you will send it to them abroad, that is an export by intangible means and may need a permit. Second, if the material is a controlled good under the Defence Production Act, domestic access is governed by the Controlled Goods Program, and the student may need a security assessment before being given access. Third, if the technology is of US origin, US export rules — including the US deemed-export rule — may travel with it. For most academic research that is published or publishable and does not involve controlled technology, none of this applies. When it might, consult your institution\'s export compliance office before sharing.',
          tags: ['export', 'controls', 'students', 'intangible transfer', 'controlled goods', 'US-origin'],
        },
        {
          id: 'ec-sanctions',
          question: 'How do I know if a potential collaborator is subject to Canadian sanctions?',
          answer:
            'Global Affairs Canada recommends screening any proposed engagement — hiring, admitting a student, or a research collaboration — against both the Consolidated Canadian Autonomous Sanctions List (people and entities listed under the Special Economic Measures Act and related legislation) and the UN consolidated list. Dealing with a listed person or entity is generally prohibited, and under most regulations that includes indirect dealings, for example through a third party or an organization the listed person owns or controls. Beyond listed persons, some country regimes also restrict specific goods, technology and services, including research and technical assistance. The lists change frequently, so screen at the start of a collaboration and again before renewing it, and consult your institution if anything matches.',
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
            'No single federal or Ontario rule requires a stand-alone research security policy, but in practice every university that receives tri-agency or Ontario research funding needs one. The STRAC Policy and the NSGRP place obligations on institutions as well as researchers, and Ontario\'s Research Security Guidelines require attestations from every named researcher and a security review for provincially funded applications. Most Canadian research universities now have a research security office or dedicated staff in research services, and U15 Canada published a guide to university research security policies and practices in June 2026. Ask your research services office what your institution\'s policy is.',
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
            'If you suspect that you or your research has been targeted by foreign interference — including suspicious recruitment approaches, unauthorized access to data, or pressure from a foreign government or affiliated entity — you should report it to your institution\'s security or research integrity office, who can assist and escalate appropriately. You may also contact the Canadian Security Intelligence Service (CSIS) at 1-800-267-7685 or 613-993-9620, or the RCMP National Security Information Network at 1-800-420-5805; both also take online reports. Write down what happened — dates, names, messages — but do not delay reporting to do so. The Report a Concern page in this toolkit lists who to contact for each type of situation.',
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
            'The primary official resource is the Government of Canada\'s Safeguarding Your Research portal at science.gc.ca. It contains the current STRA and NRO lists, the STRAC Policy, the NSGRP, export control guidance, and links to training resources. For institution-specific guidance, contact your university\'s research security office, research services office, or general counsel. For export control questions specifically, contact Global Affairs Canada\'s export controls program, which publishes the Export Control List and handles permit enquiries. CSIS and the RCMP can assist with national security threat concerns.',
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
          id: 'help-safe',
          question: 'Is it safe to type details of my research into this toolkit?',
          answer:
            'Yes, because nothing you type is sent anywhere. The toolkit has no server behind it: the whole site is downloaded to your browser once, and every search, wizard, and checklist then runs locally on your own device. There is no account, no database, no analytics, and no form that submits — the browser-enforced security policy on the page forbids it. Two checklists save your ticks in your browser\'s local storage so they survive a refresh; that stays on your device and can be cleared with one click. The single exception is the "Check proximity to NROs" panel on the NRO map, which sends the institution name you type to OpenStreetMap (and Wikipedia as a fallback) to find its coordinates — use it for institution names only. Compare that with asking a consumer AI chatbot, where your prompt is stored on the vendor\'s servers and may be used for training. The "How This Site Works" page lists every outbound request the site makes and shows you how to verify it yourself.',
          tags: ['privacy', 'safety', 'data', 'about'],
          relatedTools: ['how-it-works', 'cybersecurity-guide'],
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
