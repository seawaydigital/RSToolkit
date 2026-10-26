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
// rating on their own.
export const SIGNALS = {
  pla: {
    group: 'structural',
    label: 'Part of the PLA, PAP or Central Military Commission system',
    description: "Run by China's armed forces: a PLA or People's Armed Police university, academy or research institute, or a body under the Central Military Commission.",
  },
  'security-agency': {
    group: 'structural',
    label: 'Run by a security or intelligence agency',
    description: 'Belongs to the Ministry of State Security, the Ministry of Public Security or another state security body.',
  },
  'defence-conglomerate': {
    group: 'structural',
    label: 'Defence conglomerate or one of its institutes',
    description: 'A state-owned defence-industry group (for example CASC, CASIC, AVIC, CETC, NORINCO or CSSC), or a research institute or academy that belongs to one.',
  },
  'nuclear-weapons': {
    group: 'structural',
    label: 'Part of the nuclear-weapons complex',
    description: 'Designs, builds or tests nuclear weapons, like the China Academy of Engineering Physics and its institutes.',
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
  'pla-collaboration': {
    group: 'limited',
    label: 'Research collaboration with PLA institutions',
    description: 'Documented joint research, joint laboratories or co-supervision with PLA institutions.',
  },
  misconduct: {
    group: 'misconduct',
    label: 'Documented misconduct',
    description: 'Officially documented cyber operations, espionage, or export-control or sanctions violations involving the institution. Shown under NSGRP question 2.2; can justify a one-level override.',
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
    sourceUrl: 'https://basicresearch.defense.gov/Pubs/Academic-Research-Security/',
  },
  {
    id: 'jp-eul',
    label: 'End User List (METI)',
    jurisdiction: 'Japan',
    kind: 'export-control',
    snapshot: 'jp-meti-eul',
    sourceUrl: 'https://www.meti.go.jp/policy/anpo/law05.html',
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
