const NSGRP_URL =
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships";
const RAF_URL =
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form";
const STRAC_URL =
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/policy-sensitive-technology-research-and-affiliations-concern";
const STRA_URL =
  "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/sensitive-technology-research-areas";

export const riskChecklist = {
  // Verified 2026-11-21, item by item, against the live federal pages: the
  // NSGRP page (dateModified 2026-10-06; Annex A, Annex B, the two "elements
  // of risk" sections, guiding principles, mitigation measures), the Risk
  // Assessment Form page (form updated July 19, 2024; dateModified 2026-10-06)
  // and, for nro-listed, the STRAC policy (dateModified 2026-10-06) and its
  // FAQ. Annex A's real structure is "Research areas covered by export
  // controls", "List 1", "Additional research areas that can be considered
  // sensitive" and "List 2": it does NOT number items. Annex B has no
  // sub-headings.
  //
  // policyRef names a part of the NSGRP page and is linked to sourceUrl;
  // otherRefs are links to a different document (the Risk Assessment Form,
  // the STRAC policy or the STRA list). The page renders both as hyperlinks.
  lastUpdated: "2026-11-21",
  sourceUrl: NSGRP_URL,
  sections: [
    {
      id: "research-area",
      title: "Research Area Assessment",
      policySource: "NSGRP, Annex A",
      items: [
        {
          id: "nuclear-cbrn",
          label: "Does the research involve nuclear, chemical, biological, or radiological applications?",
          learnMore: "Fields such as nuclear, chemical, biological, radiological or space applications have a clear link to advancing military or intelligence capabilities, so laws and regulations govern how the research is conducted and how the resulting knowledge is exported. Research involving or applicable to nuclear programs is subject to the Export and Import Permits Act (EIPA) and the Nuclear Non-proliferation Import and Export Control Regulations. Research on chemical and biological weapons and agents may be subject to the Export Control List (ECL) of the EIPA.",
          policyRef: "NSGRP, Annex A — Research areas covered by export controls",
          defaultState: null
        },
        {
          id: "conventional-weapons",
          label: "Does the research relate to conventional weapons or dual-use goods?",
          learnMore: "Research relating to conventional weapons and dual-use goods may be subject to the Export Control List (ECL) of the EIPA and may require permits prior to transfer of technology to researchers outside of Canada.",
          policyRef: "NSGRP, Annex A — Research areas covered by export controls",
          defaultState: null
        },
        {
          id: "missile-space",
          label: "Does the research involve missile, rocket, or space technology?",
          learnMore: "Research related to missile and rocket technology, space technology, and chemical and biological weapons and agents may be subject to the ECL of the EIPA. Annex A gives these as examples of fields with a clear link to advancing military or intelligence capabilities.",
          policyRef: "NSGRP, Annex A — Research areas covered by export controls",
          defaultState: null
        },
        {
          id: "controlled-goods",
          label: "Does the research involve goods or technology on the Controlled Goods List?",
          learnMore: "Research related to goods or technology identified in the Schedule of the Defence Production Act (the Controlled Goods List) is sensitive and subject to the Controlled Goods Program administered by Public Services and Procurement Canada.",
          policyRef: "NSGRP, Annex A — Research areas covered by export controls",
          defaultState: null
        },
        {
          id: "sensitive-dual-use",
          label: "Does the research advance sensitive or dual-use technologies (e.g., AI, quantum, biotech)?",
          learnMore: "Some export control laws do not yet apply to new and emerging technologies, because their military, security and intelligence applications are less clear or because international arms and export control regimes have yet to reach consensus. These technologies can still be sensitive or dual-use, with military, intelligence, or dual military/civilian applications. List 1 of Annex A is the list of Sensitive Technology Research Areas: review it for the areas currently considered sensitive.",
          policyRef: "NSGRP, Annex A — Sensitive or dual-use technologies; List 1",
          otherRefs: [{ label: "Sensitive Technology Research Areas list", url: STRA_URL }],
          defaultState: null
        },
        {
          id: "critical-minerals",
          label: "Does the research relate to critical minerals or critical mineral supply chains?",
          learnMore: "Research areas related to critical minerals, including critical mineral supply chains, on the Government of Canada's Critical Minerals List can be considered sensitive. The Risk Assessment Form describes the list as the minerals considered critical for the sustainable economic success of Canada and its allies.",
          policyRef: "NSGRP, Annex A — Additional research areas that can be considered sensitive",
          otherRefs: [{ label: "NSGRP Risk Assessment Form, question 1.1", url: RAF_URL }],
          defaultState: null
        },
        {
          id: "critical-infrastructure",
          label: "Does the research fall within a critical infrastructure sector?",
          learnMore: "Critical infrastructure encompasses processes, systems, facilities, technologies, networks, assets, and services essential to the health, safety, security, or economic well-being of Canadians and the effective functioning of government, as defined under the National Strategy for Critical Infrastructure.",
          policyRef: "NSGRP, Annex A — Additional research areas that can be considered sensitive",
          defaultState: null
        },
        {
          id: "large-datasets",
          label: "Does the research use large datasets that could reveal sensitive patterns about human behaviour?",
          learnMore: "Research using large datasets that can be analyzed to reveal patterns, trends, and associations related to human behaviour may have ethical, commercial, or legal impact. The sensitivity depends on the nature, type, and state of the information and how it may be used in aggregate.",
          policyRef: "NSGRP, Annex A — Additional research areas that can be considered sensitive",
          defaultState: null
        },
        {
          id: "sensitive-personal-data",
          label: "Does the research use sensitive personal data (health, genetic, biometric, financial, geolocation)?",
          learnMore: "Personal data that could be leveraged by hostile state actors to harm national and economic security includes: personally identifiable health or genetic data, biometric data, financial data, private communications, geolocation data, and personal data concerning government officials, including members of the military or intelligence community.",
          policyRef: "NSGRP, Annex A — List 2",
          defaultState: null
        }
      ]
    },
    {
      id: "partner-risk",
      title: "Partner Risk Assessment",
      policySource: "NSGRP, Annex B",
      items: [
        {
          id: "state-owned",
          label: "Is the partner organization state-owned or subject to state influence?",
          learnMore: "Partner organizations that are state-owned or subject to state influence may facilitate unwanted knowledge transfer in a manner that could harm Canadian national security. Organizations lacking the autonomy and independence inherent in Canadian public research institutions pose a higher risk.",
          policyRef: "NSGRP, Annex B",
          defaultState: null
        },
        {
          id: "lacks-autonomy",
          label: "Does the partner organization lack institutional autonomy comparable to Canadian institutions?",
          learnMore: "Partner organizations that lack the autonomy and independence similar to public research institutions in Canada pose a greater risk of unwanted knowledge transfer to foreign governments, militaries, their proxies, or other actors.",
          policyRef: "NSGRP, Annex B",
          defaultState: null
        },
        {
          id: "compelled-disclosure",
          label: "Is the partner subject to laws compelling disclosure of research to a foreign government?",
          learnMore: "Some countries have laws or practices that compel entities and individuals to be subject to direction from their governments to provide Canadian information, research knowledge, technology, and its resulting intellectual property.",
          policyRef: "NSGRP, Annex B",
          defaultState: null
        },
        {
          id: "military-ties",
          label: "Do any personnel involved in the partnership have ties to foreign militaries or governments?",
          learnMore: "Risks can originate from personnel participating in the project, particularly if individuals have ties to foreign militaries or governments. It is important to identify and assess any potential conflicts of interest and commitment for all individuals involved in a research partnership.",
          policyRef: "NSGRP, Annex B",
          defaultState: null
        },
        {
          id: "knowledge-transfer-risk",
          label: "Is there potential for unwanted transfer of research knowledge to a foreign government or military?",
          learnMore: "Assess your partner's goals and objectives for the shared research outcomes. Consider any potential intention or risk to transfer the research knowledge or results to a foreign government, military, their proxies, or other actors where doing so may harm Canada's national security interests.",
          policyRef: "NSGRP — Partner: who are you working with?",
          defaultState: null
        },
        {
          id: "nro-listed",
          label: "Is the partner on the Named Research Organizations list?",
          learnMore: "The Named Research Organizations list is a non-exhaustive inventory of universities, research institutes and laboratories connected to military, national defence or state security entities that could pose a risk to Canada's national security. Under the STRAC Policy, a grant that aims to advance a Sensitive Technology Research Area will not be funded if any researcher involved in the activities it supports is affiliated with, or receives funding or in-kind support from, a listed organization. That covers everyone working on the funded research, including students, postdoctoral fellows and research staff, not only the people named on the application. A listed organization whose people take part in the project, or that contributes funding or in-kind support to it, would therefore make the application ineligible. The policy also says research affiliations are considered in the national security assessment of applications that are subject to the NSGRP, so record any tie between a partner and a listed organization on the Risk Assessment Form and address it in your mitigation plan.",
          policyRef: "NSGRP, Annex B",
          otherRefs: [
            { label: "STRAC Policy, Step 2: Check researchers' affiliations", url: STRAC_URL },
            { label: "NSGRP Risk Assessment Form, Section 2", url: RAF_URL }
          ],
          defaultState: null
        }
      ]
    },
    {
      id: "data-infrastructure",
      title: "Data and Infrastructure Security",
      policySource: "NSGRP, Research area and Mitigation Measures",
      items: [
        {
          id: "data-storage",
          label: "Will research data be stored in or accessible from jurisdictions with elevated security risks?",
          learnMore: "Influence over and access to data and infrastructure, including data storage, governance, and access provisions of the partnership agreement, could be used to support unwanted data access or knowledge transfer outside the scope of the research partnership. Annex B adds that some countries have laws or practices that compel entities and individuals to provide information and research knowledge to their governments, which is why it matters where data is stored and who can reach it from where.",
          policyRef: "NSGRP — Research area: what are you working on?; Annex B",
          defaultState: null
        },
        {
          id: "cybersecurity",
          label: "Are sound cybersecurity and data management practices in place?",
          learnMore: "The NSGRP lists sound cybersecurity and data management practices among the areas a risk mitigation plan can cover. Ensure that digital and physical infrastructure access controls are adequate to protect research data and intellectual property from unauthorized access.",
          policyRef: "NSGRP — Mitigation Measures",
          defaultState: null
        },
        {
          id: "ip-ownership",
          label: "Are intellectual property rights and ownership of research results clearly defined?",
          learnMore: "Ensuring that Canada's research ecosystem serves the public interest requires a clear and shared understanding across all partners of the purpose, use, and ownership of research results. This understanding must be upheld across all stages of the research and in all jurisdictions.",
          policyRef: "NSGRP — Guiding principles",
          defaultState: null
        },
        {
          id: "data-governance",
          label: "Are data governance and access provisions in the partnership agreement adequate?",
          learnMore: "Review the data storage, governance, and access provisions of the research partnership agreement to ensure they cannot be used to support unwanted data access or knowledge transfer outside the scope of the partnership. Consider both physical and digital infrastructure.",
          policyRef: "NSGRP — Research area: what are you working on?",
          defaultState: null
        }
      ]
    },
    {
      id: "mitigation-planning",
      title: "Mitigation and Compliance Planning",
      policySource: "NSGRP, Identify potential risks and Mitigation Measures",
      items: [
        {
          id: "team-strength",
          label: "Has the research team been assessed for security risks and conflicts of interest?",
          learnMore: "Building a strong research team is one of the areas the NSGRP says a risk mitigation plan can cover, and Annex B asks you to identify and assess potential conflicts of interest and commitment for everyone involved in the partnership. Look at affiliations and commitments, never at citizenship or country of residence: the Risk Assessment Form says mitigation measures must never lead to discrimination against or profiling of a member of the research community, and that excluding anyone on that basis is not an acceptable measure.",
          policyRef: "NSGRP — Mitigation Measures; Annex B",
          otherRefs: [{ label: "NSGRP Risk Assessment Form, Section 4", url: RAF_URL }],
          defaultState: null
        },
        {
          id: "partner-motivations",
          label: "Have you assessed the alignment of your partner's motivations with your own?",
          learnMore: "Assess whether your partner's goals and objectives for the shared research outcomes are transparent and aligned with yours. Consider whether there is any potential intention or risk to transfer research knowledge in ways that may harm Canadian national security.",
          policyRef: "NSGRP — Mitigation Measures",
          defaultState: null
        },
        {
          id: "research-use-agreement",
          label: "Is there an agreement on the intended use of research findings?",
          learnMore: "Fully transparent and reciprocal sharing of the methods, data, and outcomes of research is crucial to research collaboration and integrity. Ensure there is a clear agreement on how findings may be used, published, and disseminated by all partners.",
          policyRef: "NSGRP — Mitigation Measures",
          defaultState: null
        },
        {
          id: "export-controls",
          label: "Have applicable export control requirements been identified and addressed?",
          learnMore: "Annex A lists the controls that can apply. Research in areas covered by the Export Control List of the Export and Import Permits Act may need a permit before technology is transferred to researchers outside Canada, and goods or technology on the Controlled Goods List (the Schedule of the Defence Production Act) fall under the Controlled Goods Program. A partnership with an institution or researcher located in a country on the Area Control List must be authorized by an export permit whatever the research is. A partnership with an entity sanctioned under the Special Economic Measures Act or the United Nations Act may require prior authorization from Global Affairs Canada. Consult your institution's research security or export control contact.",
          policyRef: "NSGRP, Annex A — Research areas covered by export controls",
          defaultState: null
        },
        {
          id: "institutional-resources",
          label: "Have you engaged your institution's research services or partnerships office?",
          learnMore: "Each research institution has a range of resources, policies, and processes to help researchers identify and mitigate risks. For any project with identified national security risks, researchers should use the full range of institutional resources at their disposal.",
          policyRef: "NSGRP — Identify potential risks",
          defaultState: null
        }
      ]
    }
  ]
};
