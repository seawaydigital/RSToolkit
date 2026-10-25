// Matches affiliation text to tracker records, for the search box and the
// batch check. Every match says how it was made and whether it is confirmed
// or needs a human check, because a wrong "confirmed" goes on someone's file.
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

export const MAX_BATCH_LINES = 2000;

const TIERS = ['domain', 'chinese-name', 'name', 'acronym', 'similar-name'];
const CONTINUATIONS = new Set(['of', 'and', 'for']);
const ACRONYM = /^[A-Z][A-Z0-9&-]{1,7}$/;

const latinNames = (r) => [r.name, ...(r.aliases ?? [])].filter((n) => n && !hasCjk(n));
const cjkNames = (r) => [r.zh, ...(r.zhAliases ?? []), ...(r.aliases ?? []).filter(hasCjk)].filter((n) => n && hasCjk(n));

function addTo(map, key, id) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(id);
}

export function buildMatchIndex(records) {
  const phrases = new Map();
  const unitPhrases = new Map();
  const genericPhrases = new Set();
  const cjk = [];
  const acronyms = new Map();
  const domains = [];
  const fuzzy = new Map();
  let maxPhraseLen = 0;

  for (const r of records) {
    for (const name of latinNames(r)) {
      // A listed name like "Chinese Academy of Sciences, National Time Service
      // Center" is indexed whole. Each part can also suggest a match
      // ("check"), except parts that name a parent: see below.
      const parts = splitSegments(name);
      const whole = normalizePhrase(parts.join(' '));
      const len = whole ? whole.split(' ').length : 0;
      if (len >= 2) {
        addTo(phrases, whole, r.id);
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
        if (partLen < 2) continue;
        addTo(unitPhrases, phrase, r.id);
        maxPhraseLen = Math.max(maxPhraseLen, partLen);
      }
    }
    for (const name of cjkNames(r)) {
      const text = compactCjk(name);
      if (text.length >= 4) cjk.push({ text, id: r.id });
    }
    for (const a of r.acronyms ?? []) addTo(acronyms, nfkc(a).toUpperCase(), r.id);
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

  return { phrases, unitPhrases, genericPhrases, cjk, acronyms, domains, fuzzy, maxPhraseLen, fuse };
}

// Keeps the longest of any overlapping spans, so "Nanjing University" inside
// "Nanjing University of Science and Technology" gives way to the longer name.
function longestFirst(hits) {
  const kept = [];
  for (const h of [...hits].sort((a, b) => b.end - b.start - (a.end - a.start))) {
    if (kept.every((k) => h.end <= k.start || h.start >= k.end)) kept.push(h);
  }
  return kept;
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

function cjkMatches(line, index) {
  if (!hasCjk(line)) return [];
  const compact = compactCjk(line);
  const hits = [];
  for (const { text, id } of index.cjk) {
    for (let at = compact.indexOf(text); at !== -1; at = compact.indexOf(text, at + 1)) {
      hits.push({ id, start: at, end: at + text.length, text });
    }
  }
  return longestFirst(hits).map(({ id, text }) => ({ id, matchedBy: 'chinese-name', confidence: 'confirmed', text }));
}

function nameMatches(line, index) {
  const out = [];
  for (const segment of splitSegments(line)) {
    const { kept, rawAfter } = segmentTokens(segment);
    const hits = [];
    for (let i = 0; i < kept.length; i++) {
      for (let len = 2; len <= Math.min(index.maxPhraseLen, kept.length - i); len++) {
        const phrase = kept.slice(i, i + len).join(' ');
        if (CONTINUATIONS.has(rawAfter[i + len - 1])) continue;
        for (const id of index.phrases.get(phrase) ?? []) {
          hits.push({ id, start: i, end: i + len, text: phrase, confirmed: !index.genericPhrases.has(phrase) });
        }
        for (const id of index.unitPhrases.get(phrase) ?? []) hits.push({ id, start: i, end: i + len, text: phrase, confirmed: false });
      }
    }
    for (const { id, text, confirmed } of longestFirst(hits)) {
      out.push({ id, matchedBy: 'name', confidence: confirmed ? 'confirmed' : 'check', text });
    }
  }
  return out;
}

function acronymMatches(line, index) {
  const out = [];
  for (const token of nfkc(line).split(/[^A-Za-z0-9&-]+/)) {
    if (!ACRONYM.test(token)) continue;
    for (const id of index.acronyms.get(token) ?? []) out.push({ id, matchedBy: 'acronym', confidence: 'check', text: token });
  }
  return out;
}

// Last resort for typos: same number of words, every word within a small edit
// distance, at least one word actually different (identical names were
// already decided above).
function similarNameMatches(line, index) {
  const out = [];
  for (const segment of splitSegments(line)) {
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
        if (ok && differs) out.push({ id: cand.id, matchedBy: 'similar-name', confidence: 'check', text: kept.slice(i, i + n).join(' ') });
      }
    }
  }
  return out;
}

export function matchLine(line, index) {
  let found = [...domainMatches(line, index), ...cjkMatches(line, index), ...nameMatches(line, index), ...acronymMatches(line, index)];
  if (!found.length) found = similarNameMatches(line, index);

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

export function searchRecords(query, index, { limit = 50 } = {}) {
  const q = String(query ?? '').trim();
  if (!q) return [];
  const exact = matchLine(q, index);
  const ids = [
    ...exact.filter((m) => m.confidence === 'confirmed'),
    ...exact.filter((m) => m.confidence !== 'confirmed'),
  ].map((m) => m.id);
  for (const r of index.fuse.search(q, { limit: limit * 2 })) ids.push(r.item.id);
  return [...new Set(ids)].slice(0, limit);
}
