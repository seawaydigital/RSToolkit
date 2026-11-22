// Where an affiliation says it is. Many institution names exist in several
// countries ("National Defense University", "Northeastern University",
// "Pasteur Institute"), so the matcher confirms a name only when the
// affiliation places it in the tracked institution's country, and drops it
// when the affiliation places itself somewhere else.
import { extractDomains, hasCjk, normalizePhrase, osaDistance } from './normalize.js';

const phrases = (text) => text.split(',').map((p) => normalizePhrase(p)).filter(Boolean);

// Words that name the country itself: they say which country an affiliation
// is in, not where in it.
const COUNTRY_WORDS = {
  CN: phrases('China, Chinese, PRC'),
  RU: phrases('Russia, Russian, USSR'),
  IR: phrases('Iran, Iranian, Islamic Republic'),
};

// Provinces and cities, written as they appear in English affiliations. Old
// romanizations that Taiwanese institutions still use (Soochow, Tsing Hua,
// Chiao Tung) are left out on purpose.
const HOME_PLACES = {
  CN: phrases(
    'Peking, Nanking, Tientsin, Chungking, ' +
      'Anhui, Beijing, Chongqing, Fujian, Gansu, Guangdong, Guangxi, Guizhou, Hainan, Hebei, Heilongjiang, Henan, Hubei, Hunan, ' +
      'Inner Mongolia, Jiangsu, Jiangxi, Jilin, Liaoning, Ningxia, Qinghai, Shaanxi, Shandong, Shanghai, Shanxi, Sichuan, Tianjin, ' +
      'Tibet, Xizang, Xinjiang, Yunnan, Zhejiang, ' +
      'Harbin, Shenyang, Dalian, Changchun, Nanjing, Wuhan, Xian, Chengdu, Changsha, Hangzhou, Hefei, Guangzhou, Shenzhen, Qingdao, ' +
      'Jinan, Zhengzhou, Taiyuan, Lanzhou, Kunming, Nanchang, Fuzhou, Xiamen, Suzhou, Wuxi, Ningbo, Mianyang, Luoyang, Zhuhai, ' +
      'Shijiazhuang, Baotou, Guilin, Nanning, Urumqi, Hohhot, Yinchuan, Xining, Guiyang, Haikou, Zhenjiang, Changzhou, Xuzhou, ' +
      'Yangzhou, Tangshan, Baoding, Weihai, Yantai, Zibo, Dongguan, Foshan, Zhuzhou, Xiangtan, Hengyang, Yichang, Xiangyang, ' +
      'Shiyan, Zigong, Deyang, Panzhihua, Jiuquan, Qinhuangdao, Anshan, Fushun, Daqing, Qiqihar, Mudanjiang, Jiamusi, Datong, ' +
      'Handan, Xinxiang, Kaifeng, Anyang, Nantong, Huaian, Lianyungang, Wenzhou, Jiaxing, Shaoxing, Taizhou, Jinhua, Quanzhou, ' +
      'Zhangzhou, Ganzhou, Jiujiang, Yueyang, Changde, Liuzhou, Sanya, Zunyi, Lhasa, Xianyang, Baoji, Hanzhong, Tianshui, Wuhu, ' +
      'Bengbu, Huainan, Maanshan, Anqing, Pingdingshan, Jiaozuo, Linyi, Weifang, Taian, Jining, Dongying, Rizhao, Haidian',
  ),
  RU: phrases(
    'Moscow, St Petersburg, Saint Petersburg, Petersburg, Leningrad, Novosibirsk, Sarov, Snezhinsk, ' +
      'Nizhny Novgorod, Yekaterinburg, Ekaterinburg, Kazan, Tomsk, Dubna, Obninsk, Korolev, Korolyov, Zhukovsky, Zhukovskiy, ' +
      'Troitsk, Chernogolovka, Pushchino, Samara, Perm, Omsk, Chelyabinsk, Vladivostok, Krasnoyarsk, Irkutsk, Sergiev Posad, ' +
      'Saratov, Volgograd, Rostov, Ufa, Tula, Kaliningrad, Zelenograd, Fryazino, Dolgoprudny, Dolgoprudnyy, Protvino, Khimki, ' +
      'Reutov, Arzamas, Kolomna, Izhevsk, Penza, Tver, Yaroslavl, Voronezh, Kursk, Ryazan, Murmansk, Severodvinsk, Krasnodar, ' +
      'Orenburg, Tyumen, Barnaul, Kemerovo, Novokuznetsk, Khabarovsk, Ulyanovsk, Kaluga, Bryansk, Smolensk, Shikhany',
  ),
  IR: phrases(
    'Tehran, Teheran, Isfahan, Esfahan, Shiraz, Tabriz, Mashhad, Karaj, Qom, Ahvaz, Ahwaz, ' +
      'Kerman, Yazd, Rasht, Hamedan, Hamadan, Kermanshah, Zanjan, Arak, Semnan, Urmia, Babol, Gorgan, Birjand, Zahedan, ' +
      'Bandar Abbas, Qazvin, Kashan, Sanandaj, Ardabil, Bushehr, Khorramabad, Shahrekord, Mazandaran, Khuzestan, Shahrood, ' +
      'Sabzevar, Neyshabur, Damghan, Dezful, Abadan',
  ),
};

// Places outside the tracker's three countries that end many affiliations.
const FOREIGN_PLACES = phrases(
  'USA, U.S.A., United States, America, UK, U.K., United Kingdom, England, Scotland, Wales, Britain, Canada, Australia, ' +
    'New Zealand, Ireland, Germany, France, Italy, Spain, Portugal, Netherlands, Holland, Belgium, Luxembourg, Switzerland, ' +
    'Austria, Sweden, Norway, Denmark, Finland, Iceland, Poland, Czech, Czechia, Slovakia, Hungary, Romania, Bulgaria, Greece, ' +
    'Croatia, Serbia, Slovenia, Turkey, Israel, Egypt, Saudi Arabia, United Arab Emirates, UAE, Qatar, Kuwait, Jordan, ' +
    'Lebanon, India, Pakistan, Bangladesh, Sri Lanka, Nepal, Japan, Korea, Singapore, Malaysia, Thailand, Vietnam, Indonesia, ' +
    'Philippines, Brazil, Mexico, Argentina, Chile, Colombia, Peru, South Africa, Nigeria, Kenya, Ethiopia, Ukraine, Estonia, ' +
    'Latvia, Lithuania, Belarus, Kazakhstan, Uzbekistan, Armenia, Georgia, Azerbaijan',
);

// Taiwanese institutions share names with mainland ones (Soochow, Sun
// Yat-sen, Dong Hwa), so these places never confirm a mainland record.
const TAIWAN_PLACES = phrases(
  'Taiwan, Taipei, Hsinchu, Tainan, Kaohsiung, Taichung, Taoyuan, Chiayi, Hualien, Keelung, Pingtung, Yilan, Changhua, ' +
    'Miaoli, Nantou, Yunlin, Taitung, ROC, R.O.C.',
);
const TAIWAN_CJK = ['台湾', '臺灣', '台灣', '台北', '臺北', '新竹', '高雄', '台南', '臺南', '台中', '臺中', '桃園', '中華民國', '國立'];
// Characters used only in traditional script, which mainland affiliations
// do not use.
const TRADITIONAL_ONLY = /[國學東華臺灣電機濟開關業術醫藝應與會體興隊軍師範區際經聯統陽錄發驗資訊實試環設計農衛護圖書館]/;

const TLD_COUNTRIES = { cn: 'CN', ir: 'IR', ru: 'RU', su: 'RU' };

const has = (tokens, phrase) => tokens.includes(` ${phrase} `);

// The countries whose places appear in a matched name ("Harbin Institute of
// Technology" names China).
export function placesIn(phrase) {
  const tokens = ` ${phrase} `;
  return new Set(Object.keys(HOME_PLACES).filter((c) => [...COUNTRY_WORDS[c], ...HOME_PLACES[c]].some((p) => has(tokens, p))));
}

// One place under the names affiliations and lists give it.
const SAME_PLACE = {
  peking: 'beijing', nanking: 'nanjing', tientsin: 'tianjin', chungking: 'chongqing', leningrad: 'saint petersburg',
  petersburg: 'saint petersburg', teheran: 'tehran', esfahan: 'isfahan', ahwaz: 'ahvaz', hamadan: 'hamedan',
  korolyov: 'korolev', ekaterinburg: 'yekaterinburg',
};

// A place name as it is compared: normalized, "St." read as "Saint".
export function placeKey(name) {
  const key = normalizePhrase(String(name ?? '').replace(/\bst\.?(?=\s)/gi, 'saint'));
  return SAME_PLACE[key] ?? key;
}

// The cities and regions of a country that a text names, as place keys. The
// text is normalized and padded with a space at each end.
export function placesNamed(tokens, country) {
  return (HOME_PLACES[country] ?? []).filter((p) => has(tokens, p)).map(placeKey);
}

// Two names of one place: the same key, a city and the region named after it
// ("Moscow", "Moscow Region"), or a transliteration a letter or two apart
// ("Zhukovsky", "Zhukovskiy"). A short name must match exactly: Omsk is not
// Tomsk.
export function samePlace(a, b) {
  if (a === b || ` ${a} `.includes(` ${b} `) || ` ${b} `.includes(` ${a} `)) return true;
  return Math.min(a.length, b.length) >= 8 && osaDistance(a, b, 2) <= 2;
}

// Where an institution is known to be: its city and region, the places the
// lists' addresses give it, and the places its own names and its units' names
// carry ("Harbin Institute of Technology", a "Shenzhen Research Institute").
export function knownPlaces(record) {
  const named = [record.name, ...(record.aliases ?? []), ...(record.subunits ?? []).map((u) => u?.name)]
    .filter((n) => n && !hasCjk(n))
    .flatMap((n) => placesNamed(` ${normalizePhrase(n)} `, record.country));
  const given = [record.location?.city, record.location?.province, ...(record.places ?? [])].map(placeKey).filter(Boolean);
  return [...new Set([...given, ...named])];
}

// What one affiliation says about where it is: the tracked countries it
// names, whether it names a place outside them, and whether it is placed in
// Taiwan. "Republic of China" names Taiwan unless it is the People's Republic.
export function placeContext(text) {
  const tokens = ` ${normalizePhrase(text)} `.replace(/ people republic china /g, ' prc ').replace(/ republic china /g, ' roc ');
  let taiwan = TAIWAN_PLACES.some((p) => has(tokens, p)) || TAIWAN_CJK.some((p) => String(text ?? '').includes(p));
  const countries = placesIn(tokens.trim());
  for (const d of extractDomains(text)) {
    const tld = d.split('.').pop();
    if (TLD_COUNTRIES[tld]) countries.add(TLD_COUNTRIES[tld]);
    if (tld === 'tw') taiwan = true;
  }
  const foreign = FOREIGN_PLACES.some((p) => has(tokens, p));
  return { tokens, countries, foreign, taiwan, placed: countries.size > 0 || foreign || taiwan };
}

// "… 14th Research Institute (CETC 14)": affiliations write the name without
// the bracketed code. A bracketed place ("China University of Geosciences
// (Wuhan)") tells institutions apart, so it stays.
export function withoutCodes(name) {
  const stripped = String(name).replace(/\(([^)]*)\)/g, (whole, inside) => (placesIn(normalizePhrase(inside)).size ? whole : ' '));
  return stripped === name ? null : stripped.replace(/\s+/g, ' ').trim();
}

export function inTokens(context, phrase) {
  return Boolean(phrase) && has(context.tokens, phrase);
}

// A Chinese-script line that is in traditional characters or names Taiwan.
export function traditionalOrTaiwan(text) {
  const s = String(text ?? '');
  return hasCjk(s) && (TRADITIONAL_ONLY.test(s) || TAIWAN_CJK.some((p) => s.includes(p)));
}
