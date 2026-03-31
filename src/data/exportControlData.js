export const exportControlData = {
  lastUpdated: "2025-01-24",
  policySource: "National Security Guidelines for Research Partnerships, Annex A",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships",
  sections: [
    {
      id: "eipa",
      title: "Export and Import Permits Act (EIPA) - Export Control List",
      description: "Canada's primary export control legislation. The Export Control List (ECL) under the EIPA regulates the transfer of conventional weapons, dual-use goods, missile and rocket technology, space technology, chemical and biological weapons agents, and nuclear-related items outside of Canada. Research involving these areas may require permits before sharing technology or knowledge with researchers abroad.",
      entries: [
        {
          id: "eipa-conventional-weapons",
          title: "Conventional Weapons and Dual-Use Goods",
          description: "Research relating to conventional weapons and goods that have both civilian and military applications. Permits may be required prior to transfer of related technology to researchers outside of Canada.",
          tags: ["dual-use", "military", "export-control"],
          officialUrl: "https://laws-lois.justice.gc.ca/eng/acts/e-19/page-10.html",
          keywords: ["weapons", "dual-use", "conventional arms", "export control list", "ECL", "munitions", "defense technology"]
        },
        {
          id: "eipa-missile-rocket",
          title: "Missile and Rocket Technology",
          description: "Research related to missile and rocket technology, including propulsion systems, guidance systems, and delivery mechanisms. Subject to the ECL of the EIPA due to direct military and proliferation applications.",
          tags: ["military", "export-control", "proliferation"],
          officialUrl: "https://laws-lois.justice.gc.ca/eng/acts/e-19/page-10.html",
          keywords: ["missile", "rocket", "propulsion", "guidance systems", "ballistic", "MTCR", "missile technology control regime"]
        },
        {
          id: "eipa-space",
          title: "Space Technology",
          description: "Research involving space technology, satellite systems, and related components. Subject to the ECL due to overlap with military and intelligence applications including surveillance and communications.",
          tags: ["dual-use", "military", "export-control"],
          officialUrl: "https://laws-lois.justice.gc.ca/eng/acts/e-19/page-10.html",
          keywords: ["space", "satellite", "orbital", "remote sensing", "space launch", "spacecraft"]
        },
        {
          id: "eipa-chem-bio",
          title: "Chemical and Biological Weapons and Agents",
          description: "Research involving chemical and biological weapons agents, precursors, or related production equipment. Strictly controlled under the ECL due to the severe threat posed by proliferation of these materials.",
          tags: ["military", "export-control", "proliferation", "CBRN"],
          officialUrl: "https://laws-lois.justice.gc.ca/eng/acts/e-19/page-10.html",
          keywords: ["chemical weapons", "biological weapons", "CWC", "BWC", "agents", "precursors", "toxins"]
        },
        {
          id: "eipa-nuclear",
          title: "Nuclear Technology and Materials",
          description: "Research involving or applicable to nuclear programs. Subject to both the EIPA and the Nuclear Non-proliferation Import and Export Control Regulations. Covers nuclear materials, equipment, and related technology.",
          tags: ["military", "export-control", "proliferation", "CBRN"],
          officialUrl: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2000-210/",
          keywords: ["nuclear", "fissile", "uranium", "plutonium", "enrichment", "non-proliferation", "IAEA", "reactor"]
        }
      ]
    },
    {
      id: "defence-production-act",
      title: "Defence Production Act - Controlled Goods List",
      description: "The Controlled Goods List is the Schedule to the Defence Production Act and identifies goods and technology that are sensitive from a national security perspective. Research involving items on this list is subject to the Controlled Goods Program administered by Public Services and Procurement Canada. Researchers and institutions must be registered under the program to access or possess controlled goods.",
      entries: [
        {
          id: "cgl-military-goods",
          title: "Controlled Military Goods and Technology",
          description: "Goods and technology identified in the Schedule of the Defence Production Act that have direct military applications. Access to these items requires registration with the Controlled Goods Program and appropriate security clearances.",
          tags: ["military", "export-control"],
          officialUrl: "https://www.tpsgc-pwgsc.gc.ca/pmc-cgp/index-eng.html",
          keywords: ["controlled goods", "defence production", "military goods", "security clearance", "CGP registration"]
        },
        {
          id: "cgl-technical-data",
          title: "Controlled Technical Data",
          description: "Technical data related to controlled goods, including design specifications, manufacturing processes, and operational manuals. Subject to the same controls as the physical goods themselves.",
          tags: ["military", "export-control"],
          officialUrl: "https://www.tpsgc-pwgsc.gc.ca/pmc-cgp/index-eng.html",
          keywords: ["technical data", "specifications", "blueprints", "controlled information", "ITAR"]
        }
      ]
    },
    {
      id: "area-control-list",
      title: "Area Control List",
      description: "The Area Control List under the EIPA identifies countries to which exports of any goods or technology require an export permit issued by the Minister of Foreign Affairs, regardless of the nature of the goods or research. Research partnerships with institutions and/or researchers located in a listed country must be authorized regardless of the subject matter.",
      entries: [
        {
          id: "acl-listed-countries",
          title: "Partnerships with Area Control List Countries",
          description: "Any research partnership involving institutions or researchers located in a country on the Area Control List must be authorized by an export permit from the Minister of Foreign Affairs, regardless of the nature or subject matter of the research.",
          tags: ["sanctions", "export-control"],
          officialUrl: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-81-543/",
          keywords: ["area control list", "country restrictions", "export permit", "Global Affairs Canada", "restricted countries"]
        }
      ]
    },
    {
      id: "sema",
      title: "Special Economic Measures Act (SEMA)",
      description: "The Special Economic Measures Act allows Canada to impose sanctions against foreign states, entities, and individuals in response to grave breaches of international peace and security, gross human rights violations, or acts of corruption. Research partnerships with sanctioned entities may require prior authorization from Global Affairs Canada.",
      entries: [
        {
          id: "sema-sanctioned-entities",
          title: "Partnerships with SEMA-Sanctioned Entities",
          description: "Research partnerships with entities or individuals sanctioned under the Special Economic Measures Act may be restricted or require prior authorization from Global Affairs Canada. Sanctions can include asset freezes, dealing prohibitions, and trade restrictions.",
          tags: ["sanctions"],
          officialUrl: "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx?lang=eng",
          keywords: ["sanctions", "SEMA", "asset freeze", "dealing prohibition", "sanctioned entities", "restricted parties"]
        },
        {
          id: "sema-due-diligence",
          title: "SEMA Compliance Due Diligence",
          description: "Researchers should verify that partner organizations and individuals are not listed under any Canadian sanctions regime before entering into research partnerships. Global Affairs Canada maintains current sanctions lists.",
          tags: ["sanctions", "due-diligence"],
          officialUrl: "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx?lang=eng",
          keywords: ["due diligence", "sanctions screening", "compliance", "restricted parties screening"]
        }
      ]
    },
    {
      id: "un-act",
      title: "United Nations Act",
      description: "The United Nations Act implements binding UN Security Council resolutions in Canada, including arms embargoes, travel bans, and economic sanctions. Research partnerships with entities sanctioned under UN resolutions may require prior authorization from Global Affairs Canada. These obligations apply in addition to any restrictions under the Special Economic Measures Act.",
      entries: [
        {
          id: "un-sanctioned-entities",
          title: "Partnerships with UN-Sanctioned Entities",
          description: "Research partnerships with entities or individuals sanctioned under UN Security Council resolutions, as implemented by the United Nations Act, may be prohibited or require prior authorization from Global Affairs Canada.",
          tags: ["sanctions"],
          officialUrl: "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx?lang=eng",
          keywords: ["United Nations", "UN sanctions", "Security Council", "arms embargo", "UN Act"]
        },
        {
          id: "un-arms-embargo",
          title: "UN Arms Embargoes",
          description: "UN Security Council arms embargoes prohibit the supply of weapons and military equipment to specified countries or groups. Research that could contribute to military capabilities in embargoed jurisdictions may be restricted.",
          tags: ["sanctions", "military"],
          officialUrl: "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx?lang=eng",
          keywords: ["arms embargo", "military equipment", "UN Security Council", "prohibited transfers"]
        }
      ]
    }
  ]
};
