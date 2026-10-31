// Due Diligence Sources: a plain-language guide to the open sources people use
// to check a partner, and how to read what they find. The page only links to
// these sources; it never sends anything to them.
//
// Every fact about a source was read on that source's own pages on the date in
// its `checked` field (2026-10-31 for all of them), at the URL given there.
// Re-read the source before changing a fact, and bump the date only then.
// Worked examples use made-up names on purpose: they never go stale and never
// read as an accusation against a real person or body.

export const BADGES = {
  official: 'Official list',
  aggregator: 'Aggregator',
  registry: 'Company registry',
  research: 'Research records',
  investigative: 'Investigative journalism',
};

export const dueDiligenceSourcesData = {
  lastUpdated: '2026-10-31',

  // Each question points at source cards by id, and at tools on this site.
  // A tool with `flag` is shown only when that feature is switched on.
  questions: [
    {
      id: 'sanctioned',
      question: 'Is this person or organization under sanctions?',
      sources: ['gac-sanctions', 'un-sanctions', 'opensanctions', 'us-csl'],
      tools: [{ slug: 'sanctions-screening', label: 'Sanctions Screening', flag: 'screening' }],
      note: 'Start with the two lists Canada applies: its own and the UN Security Council’s.',
    },
    {
      id: 'nro',
      question: 'Is this institution on Canada’s list of Named Research Organizations?',
      sources: ['nro-list'],
      tools: [{ slug: 'nro-lookup', label: 'NRO Lookup & Map' }],
      note: 'This is the list the STRAC policy uses for sensitive technology research areas.',
    },
    {
      id: 'military',
      question: 'Does it have military, defence or security ties?',
      sources: ['nro-list', 'us-csl'],
      tools: [
        { slug: 'defence-tracker', label: 'Defence Institution Tracker', flag: 'tracker' },
        { slug: 'dual-use', label: 'Dual-Use Research Guide' },
      ],
      note: 'The US lists include export-control lists such as the Entity List and the Military End User List.',
    },
    {
      id: 'owner',
      question: 'Who owns or controls this company?',
      sources: ['opencorporates', 'gleif'],
      tools: [],
      note: 'Ownership is the hardest thing to see from outside. Ask the partner directly as well, in writing.',
    },
    {
      id: 'which-institution',
      question: 'Is this the institution I think it is?',
      sources: ['ror'],
      tools: [],
      note: 'Useful when two institutions have similar names, or one has changed its name.',
    },
    {
      id: 'researcher',
      question: 'Is this researcher affiliated where they say they are?',
      sources: ['orcid', 'openalex', 'scholar-indexes'],
      tools: [],
      note: 'Check institutions before individuals, and only as far as the decision needs.',
    },
    {
      id: 'publications',
      question: 'What has this institution published, and with whom?',
      sources: ['openalex', 'scholar-indexes'],
      tools: [],
      note: 'Under STRAC, co-authoring with someone at a named organization does not by itself create an affiliation.',
    },
    {
      id: 'patents',
      question: 'Does it hold patents in a sensitive technology area?',
      sources: ['patents'],
      tools: [{ slug: 'stra-lookup', label: 'STRA Lookup' }],
      note: 'Search by applicant name, then compare the technology with the sensitive technology research areas.',
    },
    {
      id: 'offshore',
      question: 'Does it appear in leaked offshore company records?',
      sources: ['icij'],
      tools: [],
      note: 'Appearing in these records is not evidence of wrongdoing.',
    },
  ],

  sources: [
    {
      id: 'gac-sanctions',
      name: 'Consolidated Canadian Autonomous Sanctions List',
      badge: 'official',
      runBy: 'Government of Canada (Global Affairs Canada)',
      url: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx?lang=eng',
      whatItIs:
        'The people, entities and ships under the sanctions Canada imposes on its own, under the Special Economic Measures Act and the Justice for Victims of Corrupt Foreign Officials Act. The page is a table you can filter by regime, name, alias and date of birth, and it can be downloaded.',
      goodFor: ['Checking a name against Canada’s own sanctions, by regime.', 'Seeing the aliases and dates of birth that tell two people apart.'],
      cantTell: [
        'Whether someone is on the UN Security Council’s list: check that list too.',
        'Exactly what is prohibited. The list itself has no force of law; the regulation that names someone sets out the measures.',
        'Whether the version you are looking at is current. The page warns it may not be up to date, so note the date shown.',
      ],
      reading:
        'You search “Northgate Instruments” and find “Northgate Instrument Works” under one regime, listed with an address in another country. That is a lead, not an answer: compare the address and any other details you have. If it is the same organization, read the regulation it is listed under, and talk to your research security office before going further.',
      access: 'Free, no account.',
      licence: 'Government of Canada terms of use for its websites.',
      reveals: 'An ordinary visit to a Government of Canada website.',
      checked: { date: '2026-10-31', url: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx?lang=eng' },
    },
    {
      id: 'un-sanctions',
      name: 'UN Security Council Consolidated List',
      badge: 'official',
      runBy: 'United Nations Security Council',
      url: 'https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list',
      whatItIs:
        'Every individual and entity under measures imposed by the UN Security Council, gathered into one list. Member states, Canada among them, must apply these measures. It can be read as a web page, PDF or XML file.',
      goodFor: ['Checking names under UN regimes, such as those on North Korea and Al-Qaida.'],
      cantTell: [
        'Canada’s own sanctions: those are on the Canadian list.',
        'What each listing requires. The list is gathered in one place for convenience; each Security Council committee publishes the measures for its own regime.',
      ],
      reading:
        'Each entry has a permanent reference number whose letters show the regime (for example, “KP” for the North Korea regime). Where a detail is missing, the list shows “na”. A name match with “na” in every other field cannot be confirmed from the list alone.',
      access: 'Free, no account.',
      licence: 'United Nations website terms.',
      reveals: 'An ordinary visit to a UN website.',
      checked: { date: '2026-10-31', url: 'https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list' },
    },
    {
      id: 'nro-list',
      name: 'Named Research Organizations list',
      badge: 'official',
      runBy: 'Government of Canada (science.gc.ca)',
      url: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations',
      whatItIs:
        'The research organizations named under the Policy on Sensitive Technology Research and Affiliations of Concern (STRAC). It names 103 organizations in China, Iran and Russia.',
      goodFor: [
        'Checking whether an affiliation or funding source matters under STRAC, for grants that aim to advance a sensitive technology research area.',
      ],
      cantTell: [
        'Anything about organizations it does not name. The list does not automatically extend to unlisted subsidiaries, and not being listed does not mean low risk.',
        'Sanctions: it is a research-security list, not a sanctions list.',
      ],
      reading:
        'Institutions often appear under more than one name or translation. If a partner’s name is close to a listed one but not the same, check the city and the full official name before deciding either way. NRO Lookup on this site lists every named organization with its location.',
      access: 'Free, no account.',
      licence: 'Government of Canada terms of use for its websites.',
      reveals: 'An ordinary visit to a Government of Canada website. NRO Lookup on this site searches the list in your browser without sending anything.',
      checked: { date: '2026-09-24', url: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations' },
    },
    {
      id: 'us-csl',
      name: 'US Consolidated Screening List',
      badge: 'official',
      runBy: 'US Department of Commerce, International Trade Administration',
      url: 'https://www.trade.gov/consolidated-screening-list',
      whatItIs:
        'One search across export-control and sanctions lists from three US departments: Commerce (including the Entity List and the Military End User List), State, and the Treasury (including the SDN list and the Chinese Military-Industrial Complex list).',
      goodFor: [
        'Seeing whether an organization faces US export controls, which can affect US-origin technology and equipment in your lab.',
        'Its fuzzy name search, which helps with names transliterated from other alphabets.',
      ],
      cantTell: [
        'Canadian obligations: these are US lists.',
        'The legal listing itself. The site says to check the official publication in the US Federal Register.',
        'Every US designation, or past ones. The site notes some State Department designations appear only on the Treasury’s SDN list, and its data covers active entries only.',
      ],
      reading:
        'Fuzzy search gives each result a score. A high score on “Eastbridge Optical Institute” for your search “East Bridge Optics” still needs the address and the list it comes from compared. Each result names its source list; open that list’s entry to see why the organization was added.',
      access: 'Free, no account. Also downloadable.',
      licence: 'US government data; no reuse licence is stated on the page.',
      reveals: 'An ordinary visit to a US government website.',
      checked: { date: '2026-10-31', url: 'https://www.trade.gov/consolidated-screening-list' },
    },
    {
      id: 'opensanctions',
      name: 'OpenSanctions',
      badge: 'aggregator',
      runBy: 'OpenSanctions, based in Germany',
      url: 'https://www.opensanctions.org/',
      whatItIs:
        'A database that gathers sanctions lists, export-control lists, politically exposed persons and other watch lists from many countries into one search.',
      goodFor: ['Searching many countries’ lists at once.', 'Seeing every list that names the same person or organization on one page.'],
      cantTell: [
        'The legal position: it is an aggregator, not the official list. Confirm anything you find on the official list it came from.',
        'That someone is clear. No match found means nothing close turned up in the data searched.',
      ],
      reading:
        'Each record shows the lists it comes from and a score for how closely it matches your search. A score of 1.00 on a common name is still only a name match. Compare birth dates, nationality and other details before treating it as the same person.',
      access:
        'Searching the website is free. Its API needs a key; OpenSanctions counts compliance screening as commercial use even when it earns nothing, so screening partners needs a key that comes with a data licence.',
      licence: 'Data licensed CC BY-NC 4.0 (non-commercial); commercial use needs a data licence.',
      reveals: 'An ordinary website visit when you search the site. Sanctions Screening on this site, when it is switched on, says exactly what it sends.',
      checked: { date: '2026-10-30', url: 'https://www.opensanctions.org/docs/commercial/exemption/' },
    },
    {
      id: 'opencorporates',
      name: 'OpenCorporates',
      badge: 'registry',
      runBy: 'OpenCorporates Ltd, a public-benefit company in the UK',
      url: 'https://opencorporates.com/',
      whatItIs:
        'Company records gathered from more than 140 government registries and other official sources: company names, registration numbers, addresses, status, and often officers.',
      goodFor: [
        'Finding a company’s registration details, status and officers.',
        'Seeing other companies registered at the same address or with the same officers.',
      ],
      cantTell: [
        'Who ultimately owns a company, in most cases: registries rarely publish that.',
        'Anything a registry does not publish. Coverage varies by jurisdiction, and its list of registries did not include mainland China when checked.',
        'That the data is correct: it repeats what registries publish, errors included.',
      ],
      reading:
        'A search for “Harborline Technologies” may return several companies with that name in different places. Match on the registration number and jurisdiction, not the name. A company marked dissolved may have a successor with a similar name.',
      access:
        'Searching the website is free for personal use. Free API access is limited to journalists, NGOs and academics doing public-benefit research; government departments and regulators are excluded; other use is paid.',
      licence: 'Open Database License: reuse must link “from OpenCorporates” and share any database you build from it on the same terms.',
      reveals: 'An ordinary website visit. Some features need an account.',
      checked: { date: '2026-10-31', url: 'https://opencorporates.com/terms-of-use-2/' },
    },
    {
      id: 'gleif',
      name: 'GLEIF: Legal Entity Identifier search',
      badge: 'registry',
      runBy: 'Global Legal Entity Identifier Foundation, a Swiss not-for-profit foundation',
      url: 'https://search.gleif.org/',
      whatItIs:
        'The worldwide index of Legal Entity Identifiers (LEIs): codes that companies and other legal entities register to identify themselves in financial transactions. A record gives the official name and address, and, where reported, the direct and ultimate parent company.',
      goodFor: ['Confirming a company’s exact legal name and registered address.', 'Seeing its parent companies, where both have an LEI.'],
      cantTell: [
        'Anything about organizations without an LEI, and many organizations do not have one.',
        'Owners that are not consolidating parents, or parents without an LEI. A record can show a reported reason why no parent is given.',
        'That the data is correct: it is provided as is.',
      ],
      reading:
        'The record for “Silverfield Components Ltd” shows a direct parent and an ultimate parent. If the ultimate parent field gives a reason instead of a company (for example, that the parent has no LEI), the ownership chain stops there, not the ownership.',
      access: 'Free, no account.',
      licence: 'CC0: no restrictions on reuse.',
      reveals: 'An ordinary website visit.',
      checked: { date: '2026-10-31', url: 'https://www.gleif.org/en/meta/lei-data-terms-of-use' },
    },
    {
      id: 'ror',
      name: 'ROR: Research Organization Registry',
      badge: 'research',
      runBy: 'California Digital Library, Crossref and DataCite, jointly',
      url: 'https://ror.org/search',
      whatItIs:
        'A registry of research organizations, each with a permanent identifier, its names in other languages and former names, and its links to parent, child and related organizations.',
      goodFor: [
        'Telling apart institutions with similar names.',
        'Seeing an institution’s other names, former names and related bodies, such as its institutes or hospitals.',
      ],
      cantTell: [
        'Anything about risk: it identifies organizations and says nothing about them.',
        'Departments and schools inside a university, which it deliberately leaves out.',
      ],
      reading:
        'Searching “Riverside Polytechnic” may return two records in different countries. Check the country and city on each, and the “related” links: a hospital or institute listed there is connected, but is not the same body.',
      access: 'Free, no account.',
      licence: 'CC0: no restrictions on reuse.',
      reveals: 'An ordinary website visit.',
      checked: { date: '2026-10-31', url: 'https://ror.org/about/' },
    },
    {
      id: 'orcid',
      name: 'ORCID',
      badge: 'research',
      runBy: 'ORCID, Inc., a not-for-profit',
      url: 'https://orcid.org/',
      whatItIs:
        'A free, permanent identifier for a researcher, with a record of their affiliations, funding and works. Researchers register and manage their own records and set what is public.',
      goodFor: ['Telling apart researchers with the same name.', 'Seeing the affiliations a researcher lists, with dates.'],
      cantTell: [
        'That what a record says is true or complete. Much of it is entered by the researcher; it is not an independent check.',
        'Anything the researcher has kept private or never added.',
      ],
      reading:
        'Two records for “L. Moreno” may both be real people, or one person may have made two records. Match on the works and affiliations listed, not the name. A gap in an affiliation history is not a red flag on its own; ask the person.',
      access: 'Free to search, no account.',
      licence: 'Public data file released under CC0.',
      reveals: 'An ordinary website visit.',
      caution: true,
      checked: { date: '2026-10-31', url: 'https://info.orcid.org/what-is-orcid/' },
    },
    {
      id: 'openalex',
      name: 'OpenAlex',
      badge: 'research',
      runBy: 'OpenAlex, a US non-profit',
      url: 'https://openalex.org/',
      whatItIs:
        'An open index of hundreds of millions of scholarly works, linked to their authors, institutions, funders and topics.',
      goodFor: [
        'Seeing which institutions an organization publishes with most.',
        'Seeing what topics an institution or author works on, and who funds the work.',
      ],
      cantTell: [
        'That an author or affiliation is matched correctly. OpenAlex calls its matching a best answer to a fuzzy question that can be wrong.',
        'Anything about intent: a co-authored paper is not an affiliation.',
      ],
      reading:
        'An author page for “J. Halvorsen” may combine two people, or split one person into two. Open the works and check the affiliations on each. For institutions, check the ROR link on the institution page to be sure it is the body you mean.',
      access: 'Searching the website is free.',
      licence: 'CC0: no restrictions on reuse.',
      reveals: 'An ordinary website visit.',
      caution: true,
      checked: { date: '2026-10-31', url: 'https://help.openalex.org/data/' },
    },
    {
      id: 'scholar-indexes',
      name: 'Google Scholar, Scopus and Web of Science',
      badge: 'research',
      runBy: 'Google; Elsevier (Scopus); Clarivate (Web of Science)',
      url: 'https://scholar.google.com/',
      whatItIs:
        'Indexes of academic publications. Google Scholar is free and lets authors keep their own profiles. Scopus and Web of Science are subscription services; your library may give you access.',
      goodFor: ['Finding a researcher’s or institution’s publications and co-authors.', 'Seeing the affiliations printed on each paper.'],
      cantTell: [
        'Which person wrote what, when names are shared. Google Scholar notes that names are often abbreviated and that its automatic matching is not always accurate.',
        'Anything a profile owner has left out: Google Scholar profiles are kept by the authors themselves.',
      ],
      reading:
        'A profile for “A. Lindqvist” listing 400 papers across unrelated fields probably merges several people. Rely on the affiliation printed on each paper, not the profile summary.',
      access: 'Google Scholar is free. Scopus and Web of Science need a subscription, usually through a university library.',
      licence: 'Each service’s own terms.',
      reveals: 'An ordinary website visit.',
      caution: true,
      checked: { date: '2026-10-31', url: 'https://scholar.google.com/intl/en/scholar/citations.html' },
    },
    {
      id: 'patents',
      name: 'Espacenet and Google Patents',
      badge: 'research',
      runBy: 'European Patent Office (Espacenet); Google (Google Patents)',
      url: 'https://worldwide.espacenet.com/',
      whatItIs:
        'Free patent searches. Espacenet covers more than 150 million patent documents from around the world, from 1782 to today, updated daily, with machine translation.',
      goodFor: [
        'Seeing what technologies an organization patents, searched by applicant name.',
        'Reading patents from other countries in machine translation.',
      ],
      cantTell: [
        'What an organization does that it does not patent.',
        'Whether a patent is still in force without checking its legal status.',
      ],
      reading:
        'A search for applicant “Kestrel Engineering Institute” returns patents filed under several spellings. Group them by the applicant’s address. A patent in a sensitive area is a reason to look at the partnership more closely, not a finding on its own.',
      access: 'Free, no account.',
      licence: 'Each service’s own terms.',
      reveals: 'An ordinary website visit.',
      checked: { date: '2026-10-31', url: 'https://www.epo.org/en/searching-for-patents/technical/espacenet' },
    },
    {
      id: 'icij',
      name: 'ICIJ Offshore Leaks Database',
      badge: 'investigative',
      runBy: 'International Consortium of Investigative Journalists',
      url: 'https://offshoreleaks.icij.org/',
      whatItIs:
        'Records of more than 810,000 offshore companies and the people linked to them, from the Pandora Papers, Paradise Papers, Panama Papers and other investigations.',
      goodFor: ['Seeing whether a company or its officers appear in leaked offshore records.'],
      cantTell: [
        'That anyone did anything wrong. ICIJ says there are legitimate uses for offshore companies and that it does not suggest anyone listed broke the law.',
        'Anything after 2020, when the records end, or outside the leaks.',
      ],
      reading:
        'Names appear as they were typed in the leaked records, so spellings vary and duplicates exist. A match on “Marrow Holdings Ltd” needs an address or other identifier to confirm. ICIJ asks to be credited whenever its data is used.',
      access: 'Free, no account.',
      licence: 'Open Database License, contents CC BY-SA; cite ICIJ.',
      reveals: 'An ordinary website visit.',
      checked: { date: '2026-10-31', url: 'https://offshoreleaks.icij.org/pages/howtouse' },
    },
  ],

  // Paid tools named elsewhere on the site (Risk Mitigation), not reviewed here.
  paidNote:
    'Paid company databases such as PitchBook and Crunchbase can help map investors and ownership. This guide does not review them; your institution may have access.',

  rules: [
    {
      title: 'A matching name is not the same person or organization.',
      text: 'Confirm with at least one other detail: a date of birth, an address, a registration number or an identifier.',
    },
    {
      title: 'Finding nothing does not clear anyone.',
      text: 'Names are spelled and translated differently, and every source has gaps. Record what you searched so others can see what was and was not checked.',
    },
    {
      title: 'Check the date.',
      text: 'Lists change often. Note when the source was last updated, and when you searched it.',
    },
    {
      title: 'An official list outranks an aggregator.',
      text: 'Use aggregators to find leads, then confirm on the official list that is the legal reference.',
    },
    {
      title: 'Institutions first, then individuals.',
      text: 'Look up organizations before people, and look up a person only as far as the decision needs. Keep notes factual.',
    },
    {
      title: 'When something turns up, ask.',
      text: 'Talk to your research security office before acting on a result, and ask the partner directly where that is appropriate.',
    },
  ],

  logTemplate:
    'Searched [source] on [YYYY-MM-DD] for "[name exactly as typed]" ([country, if known]). Result: [no match found / possible match / match, with link]. Checked by [initials].',
};
