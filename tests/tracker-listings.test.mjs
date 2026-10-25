// Official-list sync: parsing the US screening list, Canada's sanctions XML
// and the NRO page, and mapping list entries to tracker records without
// marking a parent institution as listed because one of its units is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assignInstitutions,
  caToEntries,
  compareNroNames,
  cslToEntries,
  diffEntries,
  isResearchBody,
  parseCaSanctionsXml,
  parseNroPage,
  resolveInstitutionAliases,
} from '../scripts/tracker/lib/listings.mjs';
import { buildMatchIndex } from '../src/tools/compliance/defence-tracker/lib/matcher.js';

test('research bodies are kept and trading companies dropped', () => {
  assert.equal(isResearchBody('Harbin Institute of Technology'), true);
  assert.equal(isResearchBody('Pasteur Institute of Iran'), true);
  assert.equal(isResearchBody('China Nuclear Power Technology Research Institute Co. Ltd.'), true);
  assert.equal(isResearchBody('Shenzhen Example Trading Co., Ltd.'), false);
});

test('banks, holdings and manufacturers are not research bodies', () => {
  assert.equal(isResearchBody('Joint Stock Company Scientific and Production Corporation Uralvagonzavod'), false);
  assert.equal(isResearchBody('Internet Research Agency LLC'), false);
  assert.equal(isResearchBody('Ansar Bank'), false);
  assert.equal(isResearchBody('China Electronics Technology Group Corporation 13th Research Institute'), true);
});

test('only the main name decides whether an entry is a research body', () => {
  const entries = cslToEntries([
    { id: 'z1', source: 'Specially Designated Nationals (SDN) - Treasury Department', name: 'ANSAR BANK', alt_names: ['Ansar Institute of Finance'], addresses: [{ country: 'IR' }], programs: ['IRAN'] },
  ]);
  assert.deepEqual(entries, []);
});

test('CSL results become entries for the three US lists only', () => {
  const entries = cslToEntries([
    { id: 'a1', source: 'Entity List (EL) - Bureau of Industry and Security', name: 'Harbin Institute of Technology', alt_names: [], addresses: [{ country: 'CN' }], start_date: '2020-06-05', federal_register_notice: '85 FR 34497', source_information_url: 'https://www.bis.gov/entity-list' },
    { id: 'a2', source: 'Specially Designated Nationals (SDN) - Treasury Department', name: 'MALEK ASHTAR UNIVERSITY OF TECHNOLOGY', alt_names: [], addresses: [{ country: 'IR' }], programs: ['IRAN'], source_list_url: 'https://sanctionssearch.ofac.treas.gov/' },
    { id: 'a3', source: 'Nonproliferation Sanctions (ISN) - State Department', name: 'Example University', addresses: [{ country: 'CN' }] },
    { id: 'a4', source: 'Entity List (EL) - Bureau of Industry and Security', name: 'Example University', addresses: [{ country: 'DE' }] },
  ]);
  assert.deepEqual(entries.map((e) => [e.key, e.list]), [['csl:a1', 'us-entity-list'], ['csl:a2', 'us-sdn']]);
  assert.equal(entries[0].citation, '85 FR 34497');
  assert.equal(entries[1].citation, 'IRAN');
});

test('the GAC sanctions XML parses into entity entries', () => {
  const xml = `<data-set><record><Country-Pays>Iran</Country-Pays><EntityOrShip-EntiteOuNavire>Pasteur Institute of Iran/Institut Pasteur d&apos;Iran</EntityOrShip-EntiteOuNavire><Schedule-Annexe>1, Part 1</Schedule-Annexe><Item-NumeroDarticle>65</Item-NumeroDarticle><DateOfListing-DateDinscription>2016-02-05</DateOfListing-DateDinscription></record><record><Country-Pays>Russia / Russie</Country-Pays><LastName-NomDeFamille>Person</LastName-NomDeFamille><Schedule-Annexe>1, Part 1</Schedule-Annexe><Item-NumeroDarticle>9</Item-NumeroDarticle><DateOfListing-DateDinscription>2022-02-24</DateOfListing-DateDinscription></record></data-set>`;
  const entries = caToEntries(parseCaSanctionsXml(xml));
  assert.equal(entries.length, 1);
  assert.equal(entries[0].name, 'Pasteur Institute of Iran');
  assert.deepEqual(entries[0].altNames, ["Institut Pasteur d'Iran"]);
  assert.equal(entries[0].key, 'ca:Iran:1, Part 1:65');
  assert.equal(entries[0].date, '2016-02-05');
  assert.equal(entries[0].country, 'IR');
});

test('free-text sanctions aliases are split into names', () => {
  const xml = `<data-set><record><Country-Pays>Russia / Russie</Country-Pays><EntityOrShip-EntiteOuNavire>Example Research Institute of Instrument Engineering JSC</EntityOrShip-EntiteOuNavire><Aliases-Alias>Russian: Научно-исследовательский институт приборостроения or НИИП</Aliases-Alias><Schedule-Annexe>1, Part 2</Schedule-Annexe><Item-NumeroDarticle>72</Item-NumeroDarticle><DateOfListing-DateDinscription>2024-08-08</DateOfListing-DateDinscription></record></data-set>`;
  const [entry] = caToEntries(parseCaSanctionsXml(xml));
  assert.deepEqual(entry.altNames, ['Научно-исследовательский институт приборостроения', 'НИИП']);
});

test('institution assignment keeps previous mappings, matches names, and creates stable slugs', () => {
  const index = buildMatchIndex([{ id: 'harbin-institute-of-technology', name: 'Harbin Institute of Technology', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }]);
  const { entries, created } = assignInstitutions(
    [{ key: 'csl:a1', name: 'Harbin Institute of Technology' }, { key: 'csl:a2', name: 'Malek Ashtar University of Technology' }, { key: 'csl:a9', name: 'Renamed Entry' }],
    { previous: [{ key: 'csl:a9', name: 'Old Name', institution: 'kept-slug' }], index, takenIds: new Set(['harbin-institute-of-technology', 'kept-slug']) },
  );
  assert.deepEqual(entries.map((e) => e.institution), ['harbin-institute-of-technology', 'malek-ashtar-university-of-technology', 'kept-slug']);
  assert.deepEqual(created, ['malek-ashtar-university-of-technology']);
});

test('a listed unit does not mark its parent as listed', () => {
  const index = buildMatchIndex([{ id: 'harbin-institute-of-technology', name: 'Harbin Institute of Technology', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }]);
  const { entries } = assignInstitutions([{ key: 'csl:b1', name: 'Harbin Institute of Technology Shenzhen Research Institute' }], { index, takenIds: new Set(['harbin-institute-of-technology']) });
  assert.equal(entries[0].institution, 'harbin-institute-of-technology-shenzhen-research-institute');
});

test('an exact name in a different country is a different institution', () => {
  const index = buildMatchIndex([{ id: 'institute-of-applied-physics-iran', name: 'Institute of Applied Physics', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] }]);
  const countryOf = (id) => (id === 'institute-of-applied-physics-iran' ? 'IR' : null);
  const { entries } = assignInstitutions([{ key: 'csl:c1', name: 'Institute of Applied Physics', country: 'RU' }, { key: 'csl:c2', name: 'Institute of Applied Physics', country: 'IR' }], {
    index,
    takenIds: new Set(['institute-of-applied-physics-iran']),
    countryOf,
  });
  assert.deepEqual(entries.map((e) => e.institution), ['institute-of-applied-physics', 'institute-of-applied-physics-iran']);
});

test('names created in one list are reused by the next', () => {
  const index = buildMatchIndex([]);
  const known = new Map();
  const first = assignInstitutions([{ key: 'csl:d1', name: 'Malek Ashtar University of Technology', country: 'IR' }], { index, takenIds: new Set(), known });
  const second = assignInstitutions([{ key: 'ca:d2', name: 'Malek-Ashtar University of Technology', country: 'IR' }], { index, takenIds: new Set(first.created), known });
  assert.equal(second.entries[0].institution, 'malek-ashtar-university-of-technology');
  assert.deepEqual(second.created, []);
});

test('a bracketed abbreviation does not split one institution into two', () => {
  const { entries } = assignInstitutions(
    [
      { key: 'csl:v1', name: 'All-Russian Scientific Research Institute of Experimental Physics', country: 'RU' },
      { key: 'csl:v2', name: 'All-Russian Scientific Research Institute of Experimental Physics (VNIIEF)', country: 'RU' },
    ],
    { index: buildMatchIndex([]), takenIds: new Set() },
  );
  assert.equal(entries[0].institution, entries[1].institution);
});

test('a one-word alias never links two entries', () => {
  const { entries } = assignInstitutions(
    [
      { key: 'csl:i1', name: 'Institute of High Energy Physics', altNames: ['ITEP'], country: 'RU' },
      { key: 'csl:i2', name: 'Institute of Theoretical and Experimental Physics', altNames: ['ITEP'], country: 'RU' },
    ],
    { index: buildMatchIndex([]), takenIds: new Set() },
  );
  assert.notEqual(entries[0].institution, entries[1].institution);
});

test('entries link through main names, not through a shared alias alone', () => {
  const { entries, created } = assignInstitutions(
    [
      { key: 'a', name: 'Russian Federal Nuclear Center – All-Russian Research Institute of Experimental Physics', altNames: ['RFNC-VNIIEF'], country: 'RU' },
      { key: 'b', name: 'All-Russian Scientific Research Institute of Experimental Physics (VNIIEF)', country: 'RU' },
      { key: 'c', name: 'ALL-RUSSIAN SCIENTIFIC RESEARCH INSTITUTE OF EXPERIMENTAL PHYSICS', altNames: ['RFNC-VNIIEF'], country: 'RU' },
    ],
    { index: buildMatchIndex([]), takenIds: new Set() },
  );
  const [a, b, c] = entries.map((e) => e.institution);
  assert.equal(b, c);
  assert.notEqual(a, b);
  assert.equal(created.length, 2);
});

test('two institutes that share an alias on the list stay separate', () => {
  const { entries } = assignInstitutions(
    [
      { key: 'h', name: 'Institute of High Energy Physics', altNames: ['IHEP', 'Kurchatovskiy Institute ITEF'], country: 'RU' },
      { key: 't', name: 'Institute of Theoretical and Experimental Physics', altNames: ['ITEP', 'Kurchatovskiy Institute ITEF'], country: 'RU' },
    ],
    { index: buildMatchIndex([]), takenIds: new Set() },
  );
  assert.notEqual(entries[0].institution, entries[1].institution);
});

test('a link found in a later list merges records an earlier list created', () => {
  const index = buildMatchIndex([]);
  const shared = { known: new Map(), aliases: new Map(), createdIds: new Set() };
  const first = assignInstitutions(
    [{ key: 'a', name: 'Alpha Research Institute', country: 'RU' }, { key: 'b', name: 'Beta Research Institute', country: 'RU' }],
    { index, takenIds: new Set(), ...shared },
  );
  const second = assignInstitutions([{ key: 'c', name: 'Alpha Research Institute', altNames: ['Beta Research Institute'], country: 'RU' }], {
    index,
    takenIds: new Set(first.created),
    ...shared,
  });
  const all = resolveInstitutionAliases([...first.entries, ...second.entries], shared.aliases);
  assert.equal(new Set(all.map((e) => e.institution)).size, 1);
});

test('two existing records are never merged', () => {
  const index = buildMatchIndex([
    { id: 'alpha-research-institute', name: 'Alpha Research Institute', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] },
    { id: 'beta-research-institute', name: 'Beta Research Institute', aliases: [], zh: null, zhAliases: [], acronyms: [], domains: [] },
  ]);
  const { entries } = assignInstitutions(
    [{ key: 'a', name: 'Alpha Research Institute' }, { key: 'b', name: 'Beta Research Institute' }, { key: 'c', name: 'Alpha Research Institute', altNames: ['Beta Research Institute'] }],
    { index, takenIds: new Set(['alpha-research-institute', 'beta-research-institute']) },
  );
  assert.deepEqual(entries.map((e) => e.institution), ['alpha-research-institute', 'beta-research-institute', 'alpha-research-institute']);
});

test('diffs report added, removed and changed entries', () => {
  const d = diffEntries([{ key: 'a', name: 'A', list: 'us-sdn' }, { key: 'b', name: 'B', list: 'us-sdn' }], [{ key: 'a', name: 'A2', list: 'us-sdn' }, { key: 'c', name: 'C', list: 'us-sdn' }]);
  assert.deepEqual(d.added.map((e) => e.key), ['c']);
  assert.deepEqual(d.removed.map((e) => e.key), ['b']);
  assert.deepEqual(d.changed.map((e) => e.key), ['a']);
});

test('the NRO comparison ignores split-out units and names the page truncates', () => {
  const orgs = [
    { name: 'Harbin Institute of Technology', parentOrg: null },
    { name: 'Northwest Institute of Nuclear Technology', parentOrg: null },
    { name: 'Chengdu Fine Optical Engineering Research Center', parentOrg: 'chinese-academy-of-engineering-physics' },
    { name: 'Removed Institute', parentOrg: null },
  ];
  const live = ['Harbin Institute of Technology', 'Northwest Institute of Nuclear', 'Chengdu Fine Optical Engineering Research Center', 'Brand New University'];
  assert.deepEqual(compareNroNames(live, orgs), [
    'On the NRO page but not in nroData.js: Brand New University',
    'In nroData.js but not on the NRO page: Removed Institute',
  ]);
});

test('the NRO page yields the organization names', () => {
  const html = '<p><strong>Organization:</strong> x</p><ul><li><strong>Harbin Institute of Technology</strong> (People’s Republic of China)</li><li><strong>Xi&#39;an Technological University</strong> (People’s Republic of China)</li></ul>';
  assert.deepEqual(parseNroPage(html), ['Harbin Institute of Technology', "Xi'an Technological University"]);
});
