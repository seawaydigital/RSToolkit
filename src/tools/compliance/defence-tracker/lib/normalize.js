// Text normalization for matching institution names in messy affiliation
// strings: full-width characters, abbreviations ("Inst. of Tech."), mixed
// English and Chinese, and email addresses.

const CJK = /[㐀-䶿一-鿿豈-﫿]/;

export const STOPWORDS = new Set(['of', 'and', 'the', 'for', 'at', 'in']);

// Applied per token after lowercasing, so "Univ." and "univ" both expand.
// Looked up with Object.hasOwn: "constructor" (Constructor University) is a
// word, not Object.prototype.constructor.
export const ABBREVIATIONS = {
  univ: 'university',
  inst: 'institute',
  tech: 'technology',
  technol: 'technology',
  sci: 'science',
  sciences: 'science',
  eng: 'engineering',
  engn: 'engineering',
  engg: 'engineering',
  natl: 'national',
  nat: 'national',
  acad: 'academy',
  coll: 'college',
  sch: 'school',
  dept: 'department',
  lab: 'laboratory',
  labs: 'laboratory',
  laboratories: 'laboratory',
  res: 'research',
  aeronaut: 'aeronautics',
  astronaut: 'astronautics',
  polytech: 'polytechnical',
  def: 'defense',
  defence: 'defense',
  airforce: 'air force',
  centre: 'center',
  peoples: 'people',
};

// Words that describe what an institution does rather than which one it is.
// A name made only of these ("Institute of Applied Physics") is too generic
// to confirm a match on its own.
export const GENERIC_WORDS = new Set([
  'institute', 'university', 'college', 'school', 'academy', 'center', 'research', 'science',
  'technology', 'engineering', 'applied', 'physics', 'chemistry', 'mathematics', 'biology',
  'medicine', 'medical', 'laboratory', 'national', 'state', 'key', 'department', 'faculty',
  'studies', 'development', 'design', 'production', 'scientific', 'technical', 'technological', 'aerospace',
  'aviation', 'space', 'electronics', 'electronic', 'information', 'energy', 'nuclear',
  'materials', 'optics', 'mechanics', 'mechanical', 'industrial', 'industry', 'advanced',
  'high', 'new', 'central', 'general', 'main', 'complex', 'organization', 'systems', 'system',
  'problems', 'physical', 'chemical', 'polytechnic', 'polytechnical', 'federal', 'unitary',
  'enterprise', 'joint', 'stock', 'company', 'military',
]);

export const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', '163.com', '126.com', 'qq.com', 'foxmail.com', 'sina.com', 'sohu.com', 'yeah.net',
  'aliyun.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'proton.me',
  'protonmail.com', 'yandex.ru', 'mail.ru',
]);

export function nfkc(s) {
  return String(s ?? '').normalize('NFKC');
}

export function hasCjk(s) {
  return CJK.test(String(s ?? ''));
}

// Commas, semicolons, brackets and similar separate the parts of an
// affiliation ("Dept. of Physics, Nanjing University"); a name never spans one.
export function splitSegments(line) {
  return nfkc(line)
    .split(/[,;()[\]/|·•、。\n\r\t]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function rawTokens(segment) {
  return nfkc(segment)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’`]/g, '')
    .replace(/&/g, ' and ')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .flatMap((t) => (Object.hasOwn(ABBREVIATIONS, t) ? ABBREVIATIONS[t] : t).split(' '));
}

// `kept` drops stopwords; `rawAfter[i]` is the raw token that follows kept
// token i, so a match can be rejected when the name carries on ("Zhejiang
// University" followed by "of Technology").
export function segmentTokens(segment) {
  const raw = rawTokens(segment);
  const kept = [];
  const rawAfter = [];
  raw.forEach((t, i) => {
    if (STOPWORDS.has(t)) return;
    kept.push(t);
    rawAfter.push(raw[i + 1] ?? null);
  });
  return { kept, rawAfter };
}

export function normalizePhrase(s) {
  return segmentTokens(s).kept.join(' ');
}

export function isGenericPhrase(phrase) {
  return phrase.split(' ').every((t) => GENERIC_WORDS.has(t));
}

export function compactCjk(s) {
  return nfkc(s).replace(/\s+/g, '');
}

export function extractDomains(s) {
  const found = nfkc(s).toLowerCase().match(/(?:[a-z0-9-]+\.)+[a-z]{2,}/g) ?? [];
  return [...new Set(found.map((d) => d.replace(/^www\./, '')))];
}

// Optimal string alignment distance (Levenshtein plus adjacent swaps), giving
// up early once it is certain to exceed `max`.
export function osaDistance(a, b, max = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, before[j - 2] + 1);
      cur[j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    before = prev;
    prev = cur;
  }
  return prev[b.length];
}
