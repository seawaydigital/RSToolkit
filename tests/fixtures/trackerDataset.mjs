// A small synthetic tracker dataset shared by the dataset and record-text
// tests: one verified file record, one NRO-only organization, and listing
// snapshots that cover every listing status (listed, not listed, not checked).
import { buildDataset } from '../../src/tools/compliance/defence-tracker/lib/dataset.js';

export const HIT = {
  id: 'harbin-institute-of-technology',
  name: 'Harbin Institute of Technology',
  zh: '哈尔滨工业大学',
  zhAliases: [],
  aliases: [],
  acronyms: ['HIT'],
  domains: ['hit.edu.cn'],
  country: 'CN',
  type: 'university',
  location: { city: 'Harbin', province: 'Heilongjiang', lat: 45.7416, lng: 126.6256 },
  supervisors: ['Ministry of Industry and Information Technology (MIIT)'],
  parent: null,
  ids: { ror: '01yqg2h08', nro: 'harbin-institute-of-technology' },
  evidence: [
    {
      signal: 'seven-sons',
      summary: 'One of the seven universities run by MIIT as core bases for the defence industry.',
      annexB: ['2.1', '2.3'],
      sources: ['s1'],
    },
  ],
  topics: [],
  subunits: [],
  sources: [
    {
      id: 's1',
      title: 'Example source',
      publisher: 'Example publisher',
      url: 'https://example.org/hit',
      accessed: '2026-10-24',
      archive: { url: 'https://web.archive.org/web/2026/https://example.org/hit' },
    },
  ],
  rating: { override: null, overrideReason: null },
  status: 'verified',
  verifiedOn: '2026-10-24',
  history: [{ date: '2026-10-24', change: 'Verified; rated Very high.' }],
  seedNotes: null,
};

export const NRO_DATA = {
  lastUpdated: '2024-04-18',
  sourceUrl: 'https://science.gc.ca/nro',
  organizations: [
    { id: 'harbin-institute-of-technology', name: 'Harbin Institute of Technology', aliases: ['HIT'], country: 'China', city: 'Harbin', lat: 45.7416, lng: 126.6256, parentOrg: null, notes: null },
    { id: 'nro-only-institute', name: 'NRO Only Institute', aliases: ['NOI'], country: 'Iran', city: 'Tehran', lat: 35.7, lng: 51.4, parentOrg: null, notes: null },
  ],
};

export const SNAPSHOTS = {
  'us-csl': {
    snapshot: 'us-csl',
    coverage: 'complete',
    checkedOn: '2026-10-24',
    sourceUrl: 'https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.json',
    entries: [
      { key: 'csl:1', list: 'us-entity-list', name: 'Harbin Institute of Technology', altNames: [], country: 'CN', date: '2020-06-05', citation: '85 FR 34497', url: 'https://www.bis.gov/entity-list', institution: 'harbin-institute-of-technology' },
      { key: 'csl:2', list: 'us-sdn', name: 'Example Listed University', altNames: ['ELU'], country: 'IR', date: '2012-01-01', citation: 'IRAN', url: 'https://sanctionssearch.ofac.treas.gov/', institution: 'example-listed-university' },
    ],
  },
  'ca-sanctions': { snapshot: 'ca-sanctions', coverage: 'complete', checkedOn: '2026-10-24', sourceUrl: 'https://www.international.gc.ca/sema.xml', entries: [] },
  'us-1286': { snapshot: 'us-1286', coverage: 'pending', checkedOn: null, sourceUrl: 'https://basicresearch.defense.gov/1286.pdf', entries: [] },
  'jp-meti-eul': { snapshot: 'jp-meti-eul', coverage: 'pending', checkedOn: null, sourceUrl: 'https://www.meti.go.jp/eul', entries: [] },
};

export const META = {
  name: 'Defence Institution Tracker',
  version: '2026.10',
  released: '2026-10-24',
  rubricVersion: '1.0',
  license: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/', holder: 'Andrew Austin', year: 2026 },
  listsCheckedOn: { 'ca-nro': '2026-09-24' },
  attributions: [],
};

export function makeDataset(over = {}) {
  return buildDataset({ institutions: [HIT], snapshots: SNAPSHOTS, nroData: NRO_DATA, meta: META, ...over });
}
