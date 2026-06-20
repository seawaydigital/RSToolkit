/**
 * Dual-Use Research Guide content.
 * Sourced from Public Safety Canada's Safeguarding Science dual-use workshop
 * and Government of Canada research-security guidance. Not attributed to any
 * single institution. All policy figures verified 2026-06-19 (see spec).
 */

export const dualUseData = {
  lastUpdated: "2026-06-19",
  sourceUrl: "https://science.gc.ca/site/science/en/safeguarding-your-research",
  sourceLabel: "Safeguarding Your Research (Government of Canada) & Public Safety Canada Safeguarding Science",

  // ── Tab 2: Dual-Use Areas (civilian vs. military/misuse) ──
  areas: [
    {
      id: "cfd",
      name: "Computational Fluid Dynamics (CFD)",
      civilian: ["Bridge design", "Vehicle aerodynamics", "Fuel efficiency"],
      military: ["Naval vessel design", "Fighter jets", "Hypersonic vehicles"],
    },
    {
      id: "combustion",
      name: "Combustion Research",
      civilian: ["Industrial furnaces", "Heating systems"],
      military: ["Jet engines", "Rocket propulsion systems"],
    },
    {
      id: "materials",
      name: "Materials Science",
      civilian: ["Automotive lightweight alloys", "Wind turbine blades"],
      military: ["Aerospace alloys for extended missile range", "Ballistic armour"],
    },
    {
      id: "medical",
      name: "Medical Research",
      civilian: ["Bone scaffolding for medical repairs"],
      military: ["Flexible concrete for hardened bunkers", "Composite armour"],
    },
    {
      id: "chem-bio",
      name: "Chemical / Biological Research",
      civilian: ["Pesticides and herbicides for agriculture"],
      military: ["Chemical warfare agents (similar chemical structures)"],
    },
    {
      id: "earth-monitoring",
      name: "Earth Monitoring",
      civilian: ["Deforestation tracking", "Water management"],
      military: ["Nuclear test-site monitoring", "Missile targeting systems"],
    },
    {
      id: "ai-big-data",
      name: "AI & Big Data",
      civilian: ["Personalized content", "Social analysis"],
      military: ["Targeted misinformation campaigns", "Surveillance"],
    },
    {
      id: "social-sciences",
      name: "Social Sciences",
      civilian: ["PTSD prevention", "Stress management"],
      military: ["Combat training", "Psychological warfare"],
    },
    {
      id: "quantum",
      name: "Quantum Technologies",
      civilian: ["Secure banking", "Precision measurements"],
      military: ["Military communications", "Submarine detection"],
    },
    {
      id: "life-sciences",
      name: "Life Sciences",
      civilian: ["Genetic testing", "Personalized medicine"],
      military: ["Identifying genetic vulnerabilities in populations"],
    },
  ],

  // Framing callouts shown on the Areas tab
  areaCallouts: [
    {
      id: "weaponized",
      title: "Even well-intentioned research can be weaponized",
      body: "Australian researchers studying mouse contraception accidentally engineered a far more lethal variant of the mousepox virus. Intent does not control outcome — the same result could guide misuse of related human pathogens.",
    },
    {
      id: "published-anyway",
      title: "\"It will be published openly anyway\" is a myth",
      body: "Published papers leave out the parts that make research reproducible: failed experiments, detailed methodology, tacit expertise, and the small techniques that actually make it work. Open publication is not full knowledge transfer.",
    },
    {
      id: "beyond-stem",
      title: "Dual-use is not just STEM",
      body: "Health data, social sciences, and behavioural studies can also be misused — for example, to profile populations, refine psychological operations, or identify vulnerabilities.",
    },
  ],

  // ── Tab 3: Vetting Collaborators ──
  redFlags: [
    "Publications with military or intelligence applications.",
    "Co-authors affiliated with defence or intelligence organizations.",
    "Publication gaps or incomplete publication records.",
    "Modified or incomplete publication titles that obscure military connections.",
    "Affiliation with an organization on Canada's Named Research Organizations / entities-of-concern list.",
  ],

  mice: [
    { letter: "M", label: "Money", body: "Financial incentives." },
    { letter: "I", label: "Ideology", body: "Patriotism or allegiance to another country." },
    { letter: "C", label: "Coercion", body: "Threats to the person or their family." },
    { letter: "E", label: "Ego", body: "Personal satisfaction, recognition, or the thrill of it." },
  ],

  myths: [
    {
      myth: "If a student or researcher has a visa, they aren't a security risk.",
      reality: "Research security requires vigilance from everyone — especially the people who know the field best. A visa is not a vetting outcome.",
    },
    {
      myth: "Only \"bad people\" misappropriate technology.",
      reality: "Motivations vary (see MICE). Ordinary people can be pressured, incentivized, or ideologically driven without being \"bad.\"",
    },
    {
      myth: "The information will be published openly anyway.",
      reality: "Papers omit failed experiments, detailed methods, and tacit know-how. The hardest-won knowledge rarely reaches print.",
    },
  ],

  scenarioLessons: [
    {
      id: "nro-student",
      title: "A grad student funded by a Named Research Organization",
      body: "A student receiving funding from an NRO is considered \"affiliated\" under STRAC — regardless of personal intent or work quality — and that affiliation can jeopardize the PI's federal-funding eligibility for the entire project.",
      mitigations: [
        "Ask the student to sever ties with the NRO.",
        "Select a different team member for the sensitive-area work.",
        "Restructure so the student has no access to federally-funded components.",
      ],
    },
    {
      id: "nro-support",
      title: "Receiving direct support from an NRO",
      body: "Accepting NRO funding is not illegal, but it constitutes a STRAC affiliation that makes the researcher ineligible for federal funding on additional sensitive-area projects — even if the NRO agrees outputs stay in Canada. Past affiliations that predate the policy can still surface in future applications.",
      mitigations: [
        "Evaluate any NRO arrangement with your institution before committing — not after.",
        "Disclose past and present affiliations early.",
      ],
    },
    {
      id: "pi-duty",
      title: "PIs are not investigators — but they have a due-diligence duty",
      body: "A PI's obligation is reasonable diligence, not espionage. Check the NRO list, get references, and have a direct conversation about a collaborator's long-term goals. Escalate to your Research Security office when you need deeper screening.",
      mitigations: [],
    },
  ],

  // ── Tab 4: Due Diligence (grouped action list) ──
  // Each action may carry { tool: "<slug>" } (internal nav) or { url: "<href>" } (external link).
  diligence: [
    {
      id: "before-apply",
      group: "Before You Apply",
      actions: [
        { text: "Assess whether your research area is sensitive or dual-use.", link: { tool: "stra-lookup", label: "STRA Lookup" } },
        { text: "Screen every team member — including grad students and postdocs — against the NRO list.", link: { tool: "nro-lookup", label: "NRO Lookup & Map" } },
        { text: "Determine whether STRAC and NSGRP apply to your project and team.", link: { tool: "strac-flowchart", label: "STRAC Flowchart" } },
        { text: "Run the grant-application risk assessment.", link: { tool: "risk-checklist", label: "Risk Assessment Checklist" } },
        { text: "Ensure anyone with an NRO affiliation completes the NSGRP attestation / Risk Assessment Form.", link: { url: "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/national-security-guidelines-research-partnerships/national-security-guidelines-research-partnerships-risk-assessment-form", label: "NSGRP Risk Assessment Form" } },
      ],
    },
    {
      id: "ongoing",
      group: "Ongoing Obligations",
      actions: [
        { text: "Disclose conflicts of interest whenever signing agreements with foreign institutions.", link: null },
        { text: "Monitor team affiliations throughout the project — not just at submission.", link: { tool: "nro-lookup", label: "NRO Lookup & Map" } },
        { text: "Track updates to export controls and sanctions lists.", link: { tool: "export-control", label: "Export Control Quick Reference" } },
      ],
    },
    {
      id: "partnerships",
      group: "Collaborations & Partnerships",
      actions: [
        { text: "Define intellectual-property ownership before any international collaboration begins.", link: null },
        { text: "Understand your bilateral context — Canada's relationship with a collaborator's country matters.", link: null },
        { text: "Apply consistent evaluation standards to all collaborators, regardless of country (\"agnostic but not ignorant\").", link: null },
        { text: "Seek guidance early — arranging mitigation before submission is far easier than fixing problems after.", link: null },
      ],
    },
    {
      id: "regimes",
      group: "Know the Regulatory Regimes",
      actions: [
        { text: "Export Controls regulate goods, services, and technology (including data on cloud platforms and temporary transfers) leaving Canada — Global Affairs Canada.", link: { url: "https://www.international.gc.ca/controls-controles/index.aspx", label: "Global Affairs Canada — Export Controls" } },
        { text: "The Controlled Goods Program regulates examination, possession, and transfer of certain goods within Canada — Public Services and Procurement Canada.", link: { url: "https://www.canada.ca/en/public-services-procurement/services/controlled-goods.html", label: "Controlled Goods Program (PSPC)" } },
        { text: "The Human Pathogens and Toxins Act governs activities involving human pathogens and toxins — Public Health Agency of Canada.", link: { url: "https://laws-lois.justice.gc.ca/eng/acts/h-5.67/", label: "Human Pathogens and Toxins Act" } },
        { text: "Check sanctions before partnering — Global Affairs Canada sanctions index, and OpenSanctions (aggregates 120+ sources; verify matches against official sources).", link: { url: "https://www.opensanctions.org/", label: "OpenSanctions" } },
      ],
    },
    {
      id: "mindset",
      group: "Mindset & Support",
      actions: [
        { text: "Treat research security as a shared responsibility — not one person's job. Educate your team about dual-use risks.", link: null },
        { text: "Document your due-diligence steps and any mitigations (you can print a record from the Self-Assessment tab).", link: null },
        { text: "When something feels uncertain, contact your Research Security office or Public Safety Canada's Research Security Centre.", link: { url: "https://www.publicsafety.gc.ca/cnt/ntnl-scrt/rsrch-scrt-cntr-en.aspx", label: "Public Safety Canada — Research Security Centre" } },
      ],
    },
  ],
};
