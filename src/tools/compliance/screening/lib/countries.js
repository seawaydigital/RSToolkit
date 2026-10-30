// Country names, common variants and codes, mapped to the lowercase ISO
// 3166-1 alpha-2 codes OpenSanctions uses. Not every country: the ones a
// research security office is likely to see in a partner or co-author list,
// with the formal names official lists use ("Iran (Islamic Republic of)").
// A country not here is left in the row's note for the user to fill in.

const COUNTRIES = [
  ['ca', 'Canada'],
  ['us', 'United States', 'United States of America', 'USA', 'U.S.A.', 'U.S.', 'US', 'America'],
  ['gb', 'United Kingdom', 'UK', 'U.K.', 'Great Britain', 'Britain', 'England', 'Scotland', 'Wales', 'Northern Ireland'],
  ['cn', 'China', "People's Republic of China", 'P.R. China', 'PR China', 'P.R.C.', 'PRC', 'Mainland China', '中国', '中华人民共和国'],
  ['hk', 'Hong Kong', 'Hong Kong SAR', '香港'],
  ['mo', 'Macao', 'Macau', '澳门'],
  ['tw', 'Taiwan', 'Republic of China', 'Taiwan, Province of China', 'Chinese Taipei', '台湾', '台灣'],
  ['ru', 'Russia', 'Russian Federation', 'Россия', 'Российская Федерация', '俄罗斯'],
  ['by', 'Belarus', 'Republic of Belarus', 'Беларусь'],
  ['ir', 'Iran', 'Islamic Republic of Iran', 'Iran (Islamic Republic of)', 'ایران', '伊朗'],
  ['kp', 'North Korea', 'DPRK', "Democratic People's Republic of Korea", "Korea, Democratic People's Republic of", 'Korea (North)'],
  ['kr', 'South Korea', 'Korea', 'Republic of Korea', 'Korea, Republic of', 'Korea (South)', '韩国', '대한민국'],
  ['mm', 'Myanmar', 'Burma', 'Myanmar (Burma)'],
  ['sy', 'Syria', 'Syrian Arab Republic'],
  ['cu', 'Cuba'],
  ['ve', 'Venezuela', 'Bolivarian Republic of Venezuela'],
  ['ua', 'Ukraine', 'Україна'],
  ['jp', 'Japan', '日本'],
  ['in', 'India'],
  ['pk', 'Pakistan'],
  ['sg', 'Singapore'],
  ['my', 'Malaysia'],
  ['th', 'Thailand'],
  ['vn', 'Vietnam', 'Viet Nam'],
  ['id', 'Indonesia'],
  ['ph', 'Philippines'],
  ['au', 'Australia'],
  ['nz', 'New Zealand'],
  ['de', 'Germany', 'Deutschland'],
  ['fr', 'France'],
  ['it', 'Italy'],
  ['es', 'Spain'],
  ['pt', 'Portugal'],
  ['nl', 'Netherlands', 'The Netherlands', 'Holland'],
  ['be', 'Belgium'],
  ['ch', 'Switzerland'],
  ['at', 'Austria'],
  ['se', 'Sweden'],
  ['no', 'Norway'],
  ['dk', 'Denmark'],
  ['fi', 'Finland'],
  ['ie', 'Ireland'],
  ['pl', 'Poland'],
  ['cz', 'Czechia', 'Czech Republic'],
  ['hu', 'Hungary'],
  ['ro', 'Romania'],
  ['gr', 'Greece'],
  ['tr', 'Turkey', 'Türkiye', 'Turkiye'],
  ['il', 'Israel'],
  ['sa', 'Saudi Arabia'],
  ['ae', 'United Arab Emirates', 'UAE'],
  ['qa', 'Qatar'],
  ['eg', 'Egypt'],
  ['iq', 'Iraq'],
  ['af', 'Afghanistan'],
  ['kz', 'Kazakhstan'],
  ['uz', 'Uzbekistan'],
  ['am', 'Armenia'],
  ['az', 'Azerbaijan'],
  ['ge', 'Georgia'],
  ['ng', 'Nigeria'],
  ['za', 'South Africa'],
  ['ke', 'Kenya'],
  ['et', 'Ethiopia'],
  ['br', 'Brazil', 'Brasil'],
  ['mx', 'Mexico'],
  ['ar', 'Argentina'],
  ['cl', 'Chile'],
  ['co', 'Colombia'],
];

const key = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[.\s]+/g, ' ').trim();

const BY_NAME = new Map();
export const COUNTRY_NAMES = {};
for (const [code, name, ...variants] of COUNTRIES) {
  COUNTRY_NAMES[code] = name;
  for (const v of [name, ...variants]) BY_NAME.set(key(v), code);
}

// "China", "P.R. China", "PRC", "cn" → "cn". Two-letter input counts as a
// code only when it is one of the codes above, so "Li" or "Wu" never becomes
// a country. Returns '' for anything else.
export function countryCode(text) {
  const k = key(text);
  if (!k) return '';
  if (BY_NAME.has(k)) return BY_NAME.get(k);
  if (/^[a-z]{2}$/.test(k) && Object.hasOwn(COUNTRY_NAMES, k)) return k;
  return '';
}

export const countryName = (code) => COUNTRY_NAMES[code] ?? code?.toUpperCase() ?? '';

// Countries for the editable country picker, sorted by name.
export const COUNTRY_OPTIONS = Object.entries(COUNTRY_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));
