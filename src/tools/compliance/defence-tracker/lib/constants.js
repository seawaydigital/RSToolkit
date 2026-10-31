// Shared vocabulary for the Defence Institution Tracker: rating levels, the
// evidence signals the rubric understands, and the official lists it checks.
// Plain ESM with no browser or Node globals, so the React views, the Node
// maintenance scripts and the tests all import the same definitions.

export const RATING_ORDER = ['low', 'medium', 'high', 'very-high'];

export const RATING_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  'very-high': 'Very high',
};

export const NOT_RATED_LABEL = 'Not yet rated';

// Every evidence item names one signal. The group decides how the rubric uses
// it; 'misconduct' and 'info' items are shown as evidence but never set the
// rating on their own. The structural signals and the armed-forces
// collaboration signal cover China, Russia and Iran (rubric 1.2); the
// laboratory, qualification, SASTIND and discipline signals describe China's
// system.
export const SIGNALS = {
  'armed-forces': {
    group: 'structural',
    label: 'Part of the armed forces',
    description: "Run by the armed forces of China, Russia or Iran: in China, a PLA or People's Armed Police university, academy or research institute, or a body under the Central Military Commission; in Russia, a university, academy or research institute of the Ministry of Defence or the National Guard (Rosgvardia); in Iran, one of the Army (Artesh), the Islamic Revolutionary Guard Corps (IRGC) or the Ministry of Defence and Armed Forces Logistics (MODAFL).",
  },
  'security-agency': {
    group: 'structural',
    label: 'Run by a security or intelligence agency',
    description: "Belongs to a state security or intelligence agency, such as China's Ministry of State Security or Ministry of Public Security, Russia's Federal Security Service (FSB) or Iran's Ministry of Intelligence.",
  },
  'defence-conglomerate': {
    group: 'structural',
    label: 'Defence conglomerate or one of its institutes',
    description: 'A state-owned defence-industry group, or a research institute, academy or design bureau that belongs to one: in China, for example CASC, CASIC, AVIC, CETC, NORINCO or CSSC; in Russia, for example Rostec and its holdings, Almaz-Antey, the Tactical Missiles Corporation, United Shipbuilding Corporation or Roscosmos; in Iran, the defence industries of the Ministry of Defence and Armed Forces Logistics (MODAFL), such as the Aerospace Industries Organization and the Defense Industries Organization.',
  },
  'nuclear-weapons': {
    group: 'structural',
    label: 'Part of the nuclear-weapons complex',
    description: "Designs, builds or tests nuclear weapons, like the China Academy of Engineering Physics and its institutes, or Russia's federal nuclear centres in Sarov (VNIIEF) and Snezhinsk (VNIITF).",
  },
  'seven-sons': {
    group: 'structural',
    label: 'One of the Seven Sons of National Defence',
    description: "One of the seven universities run by the Ministry of Industry and Information Technology as core training and research bases for China's defence industry.",
  },
  'defence-key-labs': {
    group: 'labs',
    label: 'National defence key laboratories',
    description: 'Hosts national defence science and technology key laboratories or defence key discipline laboratories. Two or more count as major defence research; one counts as substantial.',
  },
  'secrecy-qualification': {
    group: 'major',
    label: 'Secrecy qualification for weapons research',
    description: 'Holds a secrecy qualification to carry out classified weapons and equipment research and production.',
  },
  'weapons-production-licence': {
    group: 'major',
    label: 'Weapons research and production licence',
    description: 'Holds a licence to research and produce weapons and equipment.',
  },
  'sastind-coconstruction': {
    group: 'substantial',
    label: 'Co-run with the defence-industry regulator',
    description: 'Jointly supervised ("co-constructed") by SASTIND, the State Administration for Science, Technology and Industry for National Defence.',
  },
  'defence-disciplines': {
    group: 'substantial',
    label: 'Defence-specialty disciplines',
    description: 'Has disciplines officially designated as serving national defence.',
  },
  'defence-industry-partnership': {
    group: 'limited',
    label: 'Defence-industry partnerships',
    description: 'Documented research partnerships, joint centres or programs with defence-industry groups.',
  },
  'defence-funded-research': {
    group: 'limited',
    label: 'Defence-funded research',
    description: 'Documented research projects funded by military or defence-industry bodies.',
  },
  'armed-forces-collaboration': {
    group: 'limited',
    label: 'Research collaboration with armed-forces institutions',
    description: 'Documented joint research, joint laboratories or co-supervision with armed-forces institutions: in China, the PLA; in Russia, the Ministry of Defence; in Iran, the Army, the IRGC or MODAFL.',
  },
  misconduct: {
    group: 'misconduct',
    label: 'Documented misconduct',
    description: 'Officially documented cyber operations, espionage, export-control or sanctions violations, or human-rights abuses involving the institution (for example, a government finding that it supported surveillance or repression). Shown under NSGRP question 2.2; can justify a one-level override.',
  },
  'state-control': {
    group: 'info',
    label: 'State ownership or control',
    description: 'How the state owns, funds or directs the institution. Shown under NSGRP question 2.1; does not change the rating on its own.',
  },
};

// The official lists, in the order the institution page shows them. `snapshot`
// names where the entries come from: the existing NRO data module, or one of
// the listing snapshots in src/data/defenceTracker/listings/.
export const LISTS = [
  {
    id: 'ca-nro',
    label: 'Named Research Organizations',
    jurisdiction: 'Canada',
    kind: 'research-security',
    snapshot: 'nro',
    sourceUrl: 'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-and-affiliations-concern/named-research-organizations',
  },
  {
    id: 'ca-sanctions',
    label: 'Consolidated Canadian Autonomous Sanctions List',
    jurisdiction: 'Canada',
    kind: 'sanctions',
    snapshot: 'ca-sanctions',
    sourceUrl: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx?lang=eng',
  },
  {
    id: 'us-entity-list',
    label: 'Entity List (Commerce)',
    jurisdiction: 'United States',
    kind: 'export-control',
    snapshot: 'us-csl',
    sourceUrl: 'https://www.trade.gov/consolidated-screening-list',
  },
  {
    id: 'us-meu',
    label: 'Military End-User List (Commerce)',
    jurisdiction: 'United States',
    kind: 'export-control',
    snapshot: 'us-csl',
    sourceUrl: 'https://www.trade.gov/consolidated-screening-list',
  },
  {
    id: 'us-sdn',
    label: 'Specially Designated Nationals List (Treasury)',
    jurisdiction: 'United States',
    kind: 'sanctions',
    snapshot: 'us-csl',
    sourceUrl: 'https://www.trade.gov/consolidated-screening-list',
  },
  {
    id: 'us-1286',
    label: 'Section 1286 list (Defense)',
    jurisdiction: 'United States',
    kind: 'research-security',
    snapshot: 'us-1286',
    sourceUrl: 'https://www.cto.mil/fy25-ndaa-section-1286-list/',
  },
  {
    id: 'jp-eul',
    label: 'End User List (METI)',
    jurisdiction: 'Japan',
    kind: 'export-control',
    snapshot: 'jp-meti-eul',
    sourceUrl: 'https://www.meti.go.jp/policy/anpo/law09-2.html',
  },
];

export const LIST_BY_ID = Object.fromEntries(LISTS.map((l) => [l.id, l]));

// Compact names for result rows and table cells.
export const LIST_SHORT_LABELS = {
  'ca-nro': 'NRO',
  'ca-sanctions': 'Canadian sanctions',
  'us-entity-list': 'US Entity List',
  'us-meu': 'US Military End-User',
  'us-sdn': 'US SDN',
  'us-1286': 'US 1286',
  'jp-eul': 'Japan End User List',
};

export const COUNTRY_LABELS = { CN: 'China', RU: 'Russia', IR: 'Iran' };

export const SEARCH_PAGE_SIZE = 100;

export const SNAPSHOT_NAMES = ['us-csl', 'ca-sanctions', 'us-1286', 'jp-meti-eul'];

export const ANNEX_B = {
  '2.1': 'State influence or control',
  '2.2': 'Misconduct or lack of transparency',
  '2.3': 'Military or government ties',
};

export const INSTITUTION_TYPES = {
  university: 'University',
  military: 'Military',
  security: 'Security',
  'defence-industry': 'Defence industry',
  'research-institute': 'Research institute',
  nuclear: 'Nuclear weapons program',
  company: 'Company',
  other: 'Other',
};

// Sub-route names the tracker uses for its own views; no institution may use them.
export const RESERVED_SLUGS = ['batch', 'methodology'];

export const STATUSES = ['seed', 'listing-only', 'verified'];

// Kinds of subunit a profile lists (campuses, hospitals, labs, institutes). A
// subunit marked "match": true is matched to its parent in batch checks.
export const SUBUNIT_KINDS = ['campus', 'hospital', 'institute', 'lab'];
