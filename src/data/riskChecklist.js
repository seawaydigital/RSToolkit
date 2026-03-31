export const riskChecklist = {
  lastUpdated: "2025-01-24",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships",
  sections: [
    {
      id: "research-area",
      title: "Research Area Assessment",
      policySource: "NSGRP, Annex A",
      items: [
        {
          id: "nuclear-cbrn",
          label: "Does the research involve nuclear, chemical, biological, or radiological applications?",
          learnMore: "Research in these fields has a clear link to advancing military or intelligence capabilities and is subject to export controls under the Export and Import Permits Act (EIPA) and the Nuclear Non-proliferation Import and Export Control Regulations. Permits may be required before transferring technology to researchers outside Canada.",
          policyRef: "NSGRP, Annex A, Item 1",
          defaultState: null
        },
        {
          id: "conventional-weapons",
          label: "Does the research relate to conventional weapons or dual-use goods?",
          learnMore: "Research relating to conventional weapons and dual-use goods may be subject to the Export Control List (ECL) of the EIPA and may require permits prior to transfer of technology to researchers outside of Canada.",
          policyRef: "NSGRP, Annex A, Item 2",
          defaultState: null
        },
        {
          id: "missile-space",
          label: "Does the research involve missile, rocket, or space technology?",
          learnMore: "Research related to missile and rocket technology, space technology, and chemical and biological weapons agents may be subject to the ECL of the EIPA. These areas have direct military and intelligence applications.",
          policyRef: "NSGRP, Annex A, Item 3",
          defaultState: null
        },
        {
          id: "controlled-goods",
          label: "Does the research involve goods or technology on the Controlled Goods List?",
          learnMore: "Research related to goods or technology identified in the Schedule of the Defence Production Act (the Controlled Goods List) is sensitive and subject to the Controlled Goods Program administered by Public Services and Procurement Canada.",
          policyRef: "NSGRP, Annex A, Item 4",
          defaultState: null
        },
        {
          id: "sensitive-dual-use",
          label: "Does the research advance sensitive or dual-use technologies (e.g., AI, quantum, biotech)?",
          learnMore: "Some new and emerging technologies have military, intelligence, or dual military/civilian applications but are not yet covered by international arms and export control regimes. Review the Sensitive Technology Research Areas list for the current inventory of areas considered sensitive.",
          policyRef: "NSGRP, Annex A, List 1",
          defaultState: null
        },
        {
          id: "critical-minerals",
          label: "Does the research relate to critical minerals or critical mineral supply chains?",
          learnMore: "Research areas related to critical minerals, including supply chains, as identified on the Government of Canada's Critical Minerals List, are considered sensitive due to their strategic importance to national security and the economy.",
          policyRef: "NSGRP, Annex A, Additional sensitive areas",
          defaultState: null
        },
        {
          id: "critical-infrastructure",
          label: "Does the research fall within a critical infrastructure sector?",
          learnMore: "Critical infrastructure encompasses processes, systems, facilities, technologies, networks, assets, and services essential to the health, safety, security, or economic well-being of Canadians and the effective functioning of government, as defined under the National Strategy for Critical Infrastructure.",
          policyRef: "NSGRP, Annex A, Additional sensitive areas",
          defaultState: null
        },
        {
          id: "large-datasets",
          label: "Does the research use large datasets that could reveal sensitive patterns about human behaviour?",
          learnMore: "Research using large datasets that can be analyzed to reveal patterns, trends, and associations related to human behaviour may have ethical, commercial, or legal impact. The sensitivity depends on the nature, type, and state of the information and how it may be used in aggregate.",
          policyRef: "NSGRP, Annex A, Additional sensitive areas",
          defaultState: null
        },
        {
          id: "sensitive-personal-data",
          label: "Does the research use sensitive personal data (health, genetic, biometric, financial, geolocation)?",
          learnMore: "Personal data that could be leveraged by hostile state actors to harm national and economic security includes: personally identifiable health or genetic data, biometric data, financial data, private communications, geolocation data, and personal data concerning government officials or members of the military or intelligence community.",
          policyRef: "NSGRP, Annex A, List 2",
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
          policyRef: "NSGRP, Partner considerations",
          defaultState: null
        },
        {
          id: "nro-listed",
          label: "Is the partner on the Named Research Organizations list?",
          learnMore: "The Named Research Organizations list identifies universities, research institutions, or laboratories connected to military, national defence, or state security organizations that could pose a risk to Canadian national security. Affiliations with NROs trigger additional requirements under both the STRAC policy and the NSGRP.",
          policyRef: "NSGRP, Annex B; STRAC Policy, Section 4",
          defaultState: null
        }
      ]
    },
    {
      id: "data-infrastructure",
      title: "Data and Infrastructure Security",
      policySource: "NSGRP, Annex A and Mitigation measures",
      items: [
        {
          id: "data-storage",
          label: "Will research data be stored in or accessible from jurisdictions with elevated security risks?",
          learnMore: "Influence over and access to data and infrastructure, including data storage, governance, and access provisions of the partnership agreement, could be used to support unwanted data access or knowledge transfer outside the scope of the research partnership.",
          policyRef: "NSGRP, Research area considerations",
          defaultState: null
        },
        {
          id: "cybersecurity",
          label: "Are sound cybersecurity and data management practices in place?",
          learnMore: "A strong risk mitigation plan should include sound cybersecurity and data management practices. Ensure that digital and physical infrastructure access controls are adequate to protect research data and intellectual property from unauthorized access.",
          policyRef: "NSGRP, Mitigation measures",
          defaultState: null
        },
        {
          id: "ip-ownership",
          label: "Are intellectual property rights and ownership of research results clearly defined?",
          learnMore: "Ensuring that Canada's research ecosystem serves the public interest requires a clear and shared understanding across all partners of the purpose, use, and ownership of research results. This understanding must be upheld across all stages of the research and in all jurisdictions.",
          policyRef: "NSGRP, Guiding principles - Research in the Public Interest",
          defaultState: null
        },
        {
          id: "data-governance",
          label: "Are data governance and access provisions in the partnership agreement adequate?",
          learnMore: "Review the data storage, governance, and access provisions of the research partnership agreement to ensure they cannot be used to support unwanted data access or knowledge transfer outside the scope of the partnership. Consider both physical and digital infrastructure.",
          policyRef: "NSGRP, Research area considerations",
          defaultState: null
        }
      ]
    },
    {
      id: "mitigation-planning",
      title: "Mitigation and Compliance Planning",
      policySource: "NSGRP, Mitigation measures and Implementation",
      items: [
        {
          id: "team-strength",
          label: "Has the research team been assessed for security risks and conflicts of interest?",
          learnMore: "Building a strong research team involves assessing all individuals for potential conflicts of interest and commitment. Identify any undisclosed affiliations, dual appointments, or obligations to foreign entities for all team members.",
          policyRef: "NSGRP, Mitigation measures",
          defaultState: null
        },
        {
          id: "partner-motivations",
          label: "Have you assessed the alignment of your partner's motivations with your own?",
          learnMore: "Assess whether your partner's goals and objectives for the shared research outcomes are transparent and aligned with yours. Consider whether there is any potential intention or risk to transfer research knowledge in ways that may harm Canadian national security.",
          policyRef: "NSGRP, Mitigation measures",
          defaultState: null
        },
        {
          id: "research-use-agreement",
          label: "Is there an agreement on the intended use of research findings?",
          learnMore: "Fully transparent and reciprocal sharing of the methods, data, and outcomes of research is crucial to research collaboration and integrity. Ensure there is a clear agreement on how findings may be used, published, and disseminated by all partners.",
          policyRef: "NSGRP, Mitigation measures",
          defaultState: null
        },
        {
          id: "export-controls",
          label: "Have applicable export control requirements been identified and addressed?",
          learnMore: "Research in areas covered by the Export and Import Permits Act, the Defence Production Act, the Area Control List, the Special Economic Measures Act, or the United Nations Act may require permits or prior authorization. Consult with your institution's export control office.",
          policyRef: "NSGRP, Annex A - Research areas covered by export controls",
          defaultState: null
        },
        {
          id: "institutional-resources",
          label: "Have you engaged your institution's research services or partnerships office?",
          learnMore: "Each research institution has a range of resources, policies, and processes to help researchers identify and mitigate risks. For any project with identified national security risks, researchers should use the full range of institutional resources at their disposal.",
          policyRef: "NSGRP, Identify potential risks",
          defaultState: null
        }
      ]
    }
  ]
};
