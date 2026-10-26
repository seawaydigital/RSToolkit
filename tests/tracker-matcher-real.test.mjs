// The matcher against the real tracker data. A "confirmed" match puts an
// institution's listings next to someone's name in a research security file,
// so affiliations of institutions the tracker does not cover must never come
// back confirmed, and clearly foreign ones should not appear at all. Real
// affiliations of tracked institutions must still confirm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadDataset } from '../scripts/tracker/lib/loadData.mjs';
import { buildMatchIndex, matchLine } from '../src/tools/compliance/defence-tracker/lib/matcher.js';

const dataset = await loadDataset();
const index = buildMatchIndex(dataset.records);
const show = (ms) => JSON.stringify(ms.map((m) => `${m.confidence} ${m.matchedBy} "${m.text}" → ${m.id}`));

const NEVER_CONFIRMED = [
  'National Defense University, Washington, DC, USA',
  'National Defence University, Islamabad',
  'United States Naval Academy, Annapolis, MD',
  'Air Force Research Institute, Maxwell AFB',
  'Army Research Institute, Fort Belvoir',
  'Naval Command College, U.S. Naval War College',
  'Pasteur Institute, Paris, France',
  'Virology Center, Mayo Clinic',
  'Institute of International Relations, Prague',
  'Institute of Computing Technology, Vietnam Academy of Science and Technology',
  'Institute of Electric Power Engineering, Poznan University of Technology',
  'Aeronautical Radio, Inc.',
  'Hydrographic Service of the Navy, Valparaiso, Chile',
  'Criminalistics Institute, Kyiv, Ukraine',
  'Northeastern University, Boston',
  'Soochow University, Taipei',
  'Tianjin Normal University',
  'Tianjin Normal University, Tianjin, China',
  'Luoyang University',
  '中国电子学会',
  '國立東華大學',
  '中国航天员科研训练中心',
  'Sunnybrook Research Institute, Toronto',
  'Ottawa Hospital Research Institute',
  'Institute of Chemistry, CAS, Beijing',
  'NU',
  'National Sun Yat-sen University, Kaohsiung, Taiwan',
  'Power Office, City of Toronto',
];

for (const line of NEVER_CONFIRMED) {
  test(`never confirmed: ${line}`, () => {
    const ms = matchLine(line, index);
    assert.equal(ms.filter((m) => m.confidence === 'confirmed').length, 0, show(ms));
  });
}

const NO_MATCH = [
  'National Defense University, Washington, DC, USA',
  'Pasteur Institute, Paris, France',
  'Northeastern University, Boston, MA, USA',
  'Soochow University, Taipei, Taiwan',
  'Hydrographic Service of the Navy, Valparaiso, Chile',
  'Criminalistics Institute, Kyiv, Ukraine',
  'Sunnybrook Research Institute, Toronto',
  'Ottawa Hospital Research Institute',
  'Institute of Chemistry, CAS, Beijing',
  'NU',
  'Department of ICT, University of Agder, Norway',
];

for (const line of NO_MATCH) {
  test(`not matched at all: ${line}`, () => {
    const ms = matchLine(line, index);
    assert.equal(ms.length, 0, show(ms));
  });
}

const CONFIRMED = [
  ['School of Astronautics, Harbin Institute of Technology, Harbin 150001, China', 'harbin-institute-of-technology'],
  ['Harbin Institute of Technology', 'harbin-institute-of-technology'],
  ['Northwestern Polytechnical University, Xi’an 710072, China', 'northwestern-polytechnical-university'],
  ['Beihang University, Beijing 100191, China', 'beihang-university'],
  ['Beijing University of Aeronautics and Astronautics', 'beihang-university'],
  ['National University of Defense Technology, Changsha 410073, China', 'national-university-of-defense-technology'],
  ['Nanjing University of Aeronautics and Astronautics, Nanjing, China', 'nanjing-university-of-aeronautics-and-astronautics'],
  ['Beijing Institute of Technology, Beijing, China', 'beijing-institute-of-technology'],
  ['Harbin Engineering University, Harbin, China', 'harbin-engineering-university'],
  ['Army Engineering University of PLA, Nanjing, China', 'army-engineering-university'],
  ['China Academy of Engineering Physics, Mianyang, China', 'chinese-academy-of-engineering-physics'],
  ['Moscow Institute of Physics and Technology, Dolgoprudny, Russia', 'moscow-institute-of-physics-and-technology'],
  ['Sharif University of Technology, Tehran, Iran', 'sharif-university-of-technology'],
  ['Malek Ashtar University of Technology, Tehran, Iran', 'malek-ashtar-university-of-technology'],
  ['Northeastern University, Shenyang 110819, China', 'northeastern-university'],
  ['Imam Hossein University, Tehran, Iran', 'imam-hossein-university'],
  ['Information Engineering University, Zhengzhou, China', 'information-engineering-university'],
  ['Xidian University, Xi’an, China', 'xidian-university'],
  ['National Defense University, Beijing, China', 'national-defense-university'],
  ['China Electronics Technology Group Corporation 14th Research Institute, Nanjing, China', 'china-electronics-technology-group-corporation-14th-research-institute-cetc-14'],
  ['Ioffe Institute, St. Petersburg, Russia', 'federal-state-financed-institution-of-science-physics-and-technology-institute-n'],
  ['zhang@hit.edu.cn', 'harbin-institute-of-technology'],
  ['哈尔滨工业大学', 'harbin-institute-of-technology'],
];

// The lists name these institutes on their own. They used to match their
// groups, which MISP gave the institutes' names as aliases.
const GROUPS = ['aviation-industry-corporation-of-china', 'china-aerospace-science-and-industry-corporation', 'china-aerospace-science-and-technology-corporation'];
const LISTED_UNITS = [
  ['Beijing Aeronautical Manufacturing Technology Research Institute, Beijing, China', 'Beijing Aeronautical Manufacturing Technology Research Institute'],
  ['Beijing Automation Control Equipment Institute, Beijing, China', 'China Aerospace Science and Industry Corporation (CASIC) 3rd Academy, 33 Research Institute'],
  ['China Academy of Space Technology, Beijing, China', 'China Academy of Space Technology (CAST)'],
];

for (const [line, unit] of LISTED_UNITS) {
  test(`matched to the listed unit, not its group: ${line}`, () => {
    const id = dataset.records.find((r) => r.name === unit)?.id;
    const ms = matchLine(line, index);
    assert.ok(id && ms.some((m) => m.id === id) && !ms.some((m) => GROUPS.includes(m.id)), `${unit} (${id}): ${show(ms)}`);
  });
}

for (const [line, id] of CONFIRMED) {
  test(`confirmed: ${line}`, () => {
    const ms = matchLine(line, index);
    assert.ok(ms.some((m) => m.id === id && m.confidence === 'confirmed'), show(ms));
  });
}
