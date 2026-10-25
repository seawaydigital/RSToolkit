// Matches affiliation text to tracker records, for the search box and the
// batch check. Every match says how it was made and whether it is confirmed
// or needs a human check, because a wrong "confirmed" goes on someone's file.
//
// A name confirms only when the affiliation places it: the name itself names
// a place in the institution's country ("Harbin Institute of Technology"),
// or the affiliation names that country or the institution's city. Many
// names exist elsewhere too ("National Defense University", "Pasteur
// Institute"), and an affiliation that places itself in another country is
// not matched at all. Alternative names, which include historical names now
// used by other institutions, confirm only with the institution's own city.
import Fuse from 'fuse.js';
import {
  PERSONAL_EMAIL_DOMAINS,
  compactCjk,
  extractDomains,
  hasCjk,
  isGenericPhrase,
  nfkc,
  normalizePhrase,
  osaDistance,
  segmentTokens,
  splitSegments,
} from './normalize.js';
import { inTokens, placeContext, placesIn, traditionalOrTaiwan } from './places.js';

export const MAX_BATCH_LINES = 2000;

const TIERS = ['domain', 'chinese-name', 'name', 'acronym', 'similar-name'];
const CONTINUATIONS = new Set(['of', 'and', 'for']);
const ACRONYM = /^[A-Z][A-Z0-9&-]{1,7}$/;
// Abbreviations of parent bodies and countries, which appear in countless
// affiliations ("Institute of Chemistry, CAS").
const ACRONYM_STOPLIST = new Set(['CAS', 'RAS', 'PLA', 'PRC', 'MOD', 'MOE', 'USA', 'UK']);
// A Chinese name that ends like an institution's full name; anything else
// ("中国电子", "中国航天") is a short form that starts many other names.
const CJK_SUFFIXES = ['大学', '大學', '学院', '學院', '研究院', '研究所', '公司', '学校', '學校', '中心', '集团', '集團', '实验室', '實驗室', '基地', '部队'];
// Separates the affiliations in one line; commas separate the parts of one.
const AFFILIATIONS = /[;|]/;

const latinNames = (r) => [r.name, ...(r.aliases ?? [])].filter((n) => n && !hasCjk(n));
const cjkNames = (r) => [r.zh, ...(r.zhAliases ?? []), ...(r.aliases ?? []).filter(hasCjk)].filter((n) => n && hasCjk(n));

function addTo(map, key, id) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(id);
}

export function buildMatchIndex(records) {
  const phrases = new Map();
  const primary = new Set();
  const info = new Map();
  const unitPhrases = new Map();
  const genericPhrases = new Set();
  const cjk = [];
  const acronyms = new Map();
  const domains = [];
  const fuzzy = new Map();
  let maxPhraseLen = 0;

  for (const r of records) {
    info.set(r.id, { country: r.country ?? null, city: r.location?.city ? normalizePhrase(r.location.city) : null });
    for (const name of latinNames(r)) {
      // A listed name like "Chinese Academy of Sciences, National Time Service
      // Center" is indexed whole. Each part can also suggest a match
      // ("check"), except parts that name a parent: see below.
      const parts = splitSegments(name);
      const whole = normalizePhrase(parts.join(' '));
      const len = whole ? whole.split(' ').length : 0;
      if (len >= 2) {
        addTo(phrases, whole, r.id);
        if (name === r.name) primary.add(`${r.id}\t${whole}`);
        if (isGenericPhrase(whole)) genericPhrases.add(whole);
        maxPhraseLen = Math.max(maxPhraseLen, len);
        const tokens = whole.split(' ');
        const bucket = tokens[0][0];
        if (!fuzzy.has(bucket)) fuzzy.set(bucket, []);
        fuzzy.get(bucket).push({ id: r.id, tokens, generic: isGenericPhrase(whole) });
      }
      if (parts.length < 2) continue;
      for (const part of parts) {
        const phrase = normalizePhrase(part);
        const partLen = phrase ? phrase.split(' ').length : 0;
        // "Research Institute" or "Joint Stock Company" says nothing about
        // which institution a line names.
        if (partLen < 2 || (partLen < 4 && isGenericPhrase(phrase))) continue;
        addTo(unitPhrases, phrase, r.id);
        maxPhraseLen = Math.max(maxPhraseLen, partLen);
      }
    }
    for (const name of cjkNames(r)) {
      const text = compactCjk(name);
      if (text.length >= 4) cjk.push({ text, id: r.id });
    }
    for (const a of r.acronyms ?? []) {
      const acronym = nfkc(a).toUpperCase();
      if (acronym.length >= 3 && !ACRONYM_STOPLIST.has(acronym)) addTo(acronyms, acronym, r.id);
    }
    for (const d of r.domains ?? []) domains.push({ domain: d.toLowerCase(), id: r.id });
  }
  cjk.sort((a, b) => b.text.length - a.text.length);
  // A part shared by several listed names ("Chinese Academy of Sciences"), or
  // one that is a record's own name, names a parent, not the unit.
  for (const [phrase, ids] of unitPhrases) if (ids.size > 1 || phrases.has(phrase)) unitPhrases.delete(phrase);

  const fuse = new Fuse(
    records.map((r) => ({
      id: r.id,
      name: r.name,
      aliases: r.aliases ?? [],
      zh: r.zh ?? '',
      zhAliases: r.zhAliases ?? [],
      acronyms: r.acronyms ?? [],
      domains: r.domains ?? [],
    })),
    {
      keys: [{ name: 'name', weight: 3 }, 'aliases', 'zh', 'zhAliases', 'acronyms', 'domains'],
      threshold: 0.35,
      ignoreLocation: true,
    },
  );
  const searchable = records.map((r) => ({
    id: r.id,
    texts: [r.name, ...(r.aliases ?? []), r.zh, ...(r.zhAliases ?? []), ...(r.acronyms ?? []), ...(r.domains ?? [])]
      .filter(Boolean)
      .map((t) => nfkc(t).toLowerCase()),
  }));

  return { phrases, primary, info, unitPhrases, genericPhrases, cjk, acronyms, domains, fuzzy, maxPhraseLen, fuse, searchable };
}

// Keeps the longest of any overlapping spans, so "Nanjing University" inside
// "Nanjing University of Science and Technology" gives way to the longer name.
// Every record sharing a kept span stays, marked as shared.
function longestFirst(hits) {
  const kept = [];
  for (const h of [...hits].sort((a, b) => b.end - b.start - (a.end - a.start))) {
    if (kept.every((k) => (h.start === k.start && h.end === k.end) || h.end <= k.start || h.start >= k.end)) kept.push(h);
  }
  const ids = new Map();
  for (const h of kept) addTo(ids, `${h.start}:${h.end}`, h.id);
  return kept.map((h) => ({ ...h, shared: ids.get(`${h.start}:${h.end}`).size > 1 }));
}

// How sure a name-type match is, given where the affiliation says it is:
// 'confirmed', 'check', or null when the affiliation places itself elsewhere.
function placeConfidence(hit, context, index) {
  const { country = null, city = null } = index.info.get(hit.id) ?? {};
  const atCity = Boolean(city) && inTokens(context, city);
  const inCountry = Boolean(country) && context.countries.has(country);
  const selfPlaced = Boolean(country) && placesIn(hit.text).has(country);
  const taiwan = country === 'CN' && context.taiwan;
  if ((context.foreign || taiwan) && !inCountry && !atCity && !selfPlaced) return null;
  if (hit.kind === 'unit' || hit.kind === 'similar' || hit.shared || (taiwan && !atCity)) return 'check';
  const generic = isGenericPhrase(hit.text);
  if (hit.kind === 'name') return (generic ? atCity : selfPlaced || inCountry || atCity) ? 'confirmed' : 'check';
  // An alternative name: the institution's own city, or for a record known
  // only from an official list (no city) a specific name in the right country.
  return atCity || (!city && !generic && (inCountry || selfPlaced)) ? 'confirmed' : 'check';
}

// "Northwestern" and "Northeastern" are two edits apart but name different
// places, so words that carry different compass directions never count as a
// spelling slip.
const compass = (t) => ['north', 'south', 'east', 'west'].filter((d) => t.includes(d)).join();

function tokenAllowance(a, b) {
  if (compass(a) !== compass(b)) return 0;
  const shorter = Math.min(a.length, b.length);
  return shorter < 5 ? 0 : shorter < 8 ? 1 : 2;
}

function domainMatches(line, index) {
  const out = [];
  for (const d of extractDomains(line)) {
    if (PERSONAL_EMAIL_DOMAINS.has(d)) continue;
    for (const { domain, id } of index.domains) {
      if (d === domain || d.endsWith(`.${domain}`)) out.push({ id, matchedBy: 'domain', confidence: 'confirmed', text: d });
    }
  }
  return out;
}

// A Chinese name confirms when it is a full name (it ends like one) in
// simplified script. Short forms and traditional-script or Taiwan lines,
// where mainland and Taiwanese names collide, are left to a human.
function cjkMatches(line, index) {
  if (!hasCjk(line)) return [];
  const compact = compactCjk(line);
  const doubtful = traditionalOrTaiwan(line);
  const hits = [];
  for (const { text, id } of index.cjk) {
    for (let at = compact.indexOf(text); at !== -1; at = compact.indexOf(text, at + 1)) {
      hits.push({ id, start: at, end: at + text.length, text });
    }
  }
  return longestFirst(hits).map(({ id, text, shared }) => ({
    id,
    matchedBy: 'chinese-name',
    confidence: !shared && !doubtful && CJK_SUFFIXES.some((s) => text.endsWith(s)) ? 'confirmed' : 'check',
    text,
  }));
}

function nameMatches(affiliation, index, context) {
  const out = [];
  for (const segment of splitSegments(affiliation)) {
    const { kept, rawAfter } = segmentTokens(segment);
    const hits = [];
    for (let i = 0; i < kept.length; i++) {
      for (let len = 2; len <= Math.min(index.maxPhraseLen, kept.length - i); len++) {
        const phrase = kept.slice(i, i + len).join(' ');
        if (CONTINUATIONS.has(rawAfter[i + len - 1])) continue;
        for (const id of index.phrases.get(phrase) ?? []) {
          hits.push({ id, start: i, end: i + len, text: phrase, kind: index.primary.has(`${id}\t${phrase}`) ? 'name' : 'alias' });
        }
        for (const id of index.unitPhrases.get(phrase) ?? []) hits.push({ id, start: i, end: i + len, text: phrase, kind: 'unit' });
      }
    }
    for (const hit of longestFirst(hits)) {
      const confidence = placeConfidence(hit, context, index);
      if (confidence) out.push({ id: hit.id, matchedBy: 'name', confidence, text: hit.text });
    }
  }
  return out;
}

// An acronym is always a check. Inside a longer line it counts only when the
// line names the institution's country or city: "ICT" or "NEU" alone means
// little.
function acronymMatches(affiliation, index, context) {
  const out = [];
  const alone = affiliation.trim();
  for (const token of nfkc(affiliation).split(/[^A-Za-z0-9&-]+/)) {
    if (!ACRONYM.test(token)) continue;
    for (const id of index.acronyms.get(token) ?? []) {
      const { country = null, city = null } = index.info.get(id) ?? {};
      const placed = nfkc(alone) === token || (country && context.countries.has(country)) || (city && inTokens(context, city));
      if (placed) out.push({ id, matchedBy: 'acronym', confidence: 'check', text: token });
    }
  }
  return out;
}

// Last resort for typos: same number of words, every word within a small edit
// distance, at least one word actually different (identical names were
// already decided above).
function similarNameMatches(affiliation, index, context) {
  const out = [];
  for (const segment of splitSegments(affiliation)) {
    const { kept, rawAfter } = segmentTokens(segment);
    for (let i = 0; i < kept.length; i++) {
      for (const cand of index.fuzzy.get(kept[i][0]) ?? []) {
        const n = cand.tokens.length;
        if (cand.generic || i + n > kept.length || CONTINUATIONS.has(rawAfter[i + n - 1])) continue;
        let differs = false;
        let ok = true;
        for (let k = 0; k < n && ok; k++) {
          const a = kept[i + k];
          const b = cand.tokens[k];
          if (a === b) continue;
          differs = true;
          const allowed = tokenAllowance(a, b);
          ok = allowed > 0 && osaDistance(a, b, allowed) <= allowed;
        }
        if (!ok || !differs) continue;
        const text = kept.slice(i, i + n).join(' ');
        if (placeConfidence({ id: cand.id, text, kind: 'similar' }, context, index)) {
          out.push({ id: cand.id, matchedBy: 'similar-name', confidence: 'check', text });
        }
      }
    }
  }
  return out;
}

// Each affiliation in a line is judged by the places it names; one that names
// none ("Beihang University" after "Harbin, China;") borrows the line's.
function affiliationsOf(line) {
  const whole = placeContext(line);
  return String(line)
    .split(AFFILIATIONS)
    .filter((a) => a.trim())
    .map((text) => {
      const own = placeContext(text);
      return { text, context: own.placed ? own : whole };
    });
}

export function matchLine(line, index) {
  const affiliations = affiliationsOf(nfkc(line));
  let found = affiliations.flatMap(({ text, context }) => [
    ...domainMatches(text, index),
    ...cjkMatches(text, index),
    ...nameMatches(text, index, context),
    ...acronymMatches(text, index, context),
  ]);
  if (!found.length) found = affiliations.flatMap(({ text, context }) => similarNameMatches(text, index, context));

  const best = new Map();
  for (const m of found) {
    const prev = best.get(m.id);
    const better =
      !prev ||
      (m.confidence === 'confirmed' && prev.confidence !== 'confirmed') ||
      (m.confidence === prev.confidence && TIERS.indexOf(m.matchedBy) < TIERS.indexOf(prev.matchedBy));
    if (better) best.set(m.id, m);
  }
  return [...best.values()];
}

export function matchLines(text, index) {
  const all = String(text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    lines: all.slice(0, MAX_BATCH_LINES).map((input) => ({ input, matches: matchLine(input, index) })),
    truncated: all.length > MAX_BATCH_LINES,
    totalLines: all.length,
  };
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Search box: exact identifiers first, then names that contain the query at
// the start of a word (so "HIT" never finds "architecture"), and fuzzy
// guesses only when nothing matched directly.
export function searchRecords(query, index, { limit = 50 } = {}) {
  const q = String(query ?? '').trim();
  if (!q) return [];
  const exact = matchLine(q, index);
  const ids = [
    ...exact.filter((m) => m.confidence === 'confirmed'),
    ...exact.filter((m) => m.confidence !== 'confirmed'),
  ].map((m) => m.id);

  const needle = nfkc(q).toLowerCase();
  const wordStart = hasCjk(needle) ? null : new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(needle)}`, 'u');
  const leading = [];
  const inside = [];
  for (const { id, texts } of index.searchable) {
    if (texts[0].startsWith(needle)) leading.push(id);
    else if (texts.some((t) => (wordStart ? wordStart.test(t) : t.includes(needle)))) inside.push(id);
  }
  ids.push(...leading, ...inside);

  if (!ids.length) for (const r of index.fuse.search(q, { limit })) ids.push(r.item.id);
  return [...new Set(ids)].slice(0, limit);
}
