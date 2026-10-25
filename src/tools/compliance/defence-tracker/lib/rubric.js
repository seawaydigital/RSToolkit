// Rubric v1: the published checklist behind every tracker rating.
//
// Only verified profiles are rated, and only evidence that cites at least one
// of the record's own sources counts. The first rule that matches wins.
// RUBRIC_RULES is rendered on the methodology page, so the page and the code
// cannot drift apart; bump RUBRIC_VERSION whenever a rule changes.
import { RATING_ORDER, LIST_BY_ID, SIGNALS } from './constants.js';

export const RUBRIC_VERSION = '1.0';

export const RUBRIC_RULES = [
  {
    id: 'structural',
    rating: 'very-high',
    text: 'Part of the PLA, PAP or Central Military Commission system, a security agency, a defence conglomerate or one of its institutes, the nuclear-weapons complex, or one of the Seven Sons of National Defence.',
  },
  { id: 'listed-major', rating: 'very-high', text: 'Formally listed, and doing major defence research.' },
  { id: 'listed', rating: 'high', text: 'Formally listed by Canada, the United States or Japan.' },
  {
    id: 'major-research',
    rating: 'high',
    text: 'Major defence research: two or more national defence key laboratories, a secrecy qualification for weapons research, or a weapons research and production licence.',
  },
  {
    id: 'substantial-research',
    rating: 'high',
    text: 'Substantial defence research: co-run with the defence-industry regulator (SASTIND), one national defence key laboratory, or defence-specialty disciplines.',
  },
  {
    id: 'limited-links',
    rating: 'medium',
    text: 'Limited defence links: documented defence-industry partnerships, defence-funded research, or research collaboration with PLA institutions.',
  },
  { id: 'none', rating: 'low', text: 'Verified, and none of the above was found.' },
];

const NOT_RATED_TEXT = 'Not yet verified, so not rated. Official listings are still shown.';

const ruleText = (id) => RUBRIC_RULES.find((r) => r.id === id).text;

const signalReason = (e) => ({ signal: e.signal, label: SIGNALS[e.signal].label });

export function rateInstitution(record, listingHits = []) {
  if (record.status !== 'verified') {
    return {
      rating: null,
      baseRating: null,
      rule: 'not-yet-rated',
      ruleText: NOT_RATED_TEXT,
      reasons: [],
      overridden: false,
      overrideReason: null,
      overrideError: null,
    };
  }

  const sourceIds = new Set((record.sources || []).map((s) => s.id));
  const counted = (record.evidence || []).filter(
    (e) => SIGNALS[e.signal] && (e.sources || []).some((id) => sourceIds.has(id)),
  );
  const inGroup = (group) => counted.filter((e) => SIGNALS[e.signal].group === group);

  const labs = inGroup('labs');
  const labsCount = labs.reduce((max, e) => Math.max(max, e.count ?? (e.items?.length || 1)), 0);
  const structural = inGroup('structural');
  const major = [...(labsCount >= 2 ? labs : []), ...inGroup('major')];
  const substantial = [...(labsCount === 1 ? labs : []), ...inGroup('substantial')];
  const limited = inGroup('limited');
  const listed = listingHits
    .filter((h) => h.status === 'listed')
    .map((h) => ({ listId: h.listId, label: LIST_BY_ID[h.listId]?.label ?? h.listId }));

  let rule;
  let reasons;
  if (structural.length) [rule, reasons] = ['structural', structural.map(signalReason)];
  else if (listed.length && major.length) [rule, reasons] = ['listed-major', [...listed, ...major.map(signalReason)]];
  else if (listed.length) [rule, reasons] = ['listed', listed];
  else if (major.length) [rule, reasons] = ['major-research', major.map(signalReason)];
  else if (substantial.length) [rule, reasons] = ['substantial-research', substantial.map(signalReason)];
  else if (limited.length) [rule, reasons] = ['limited-links', limited.map(signalReason)];
  else [rule, reasons] = ['none', []];

  const baseRating = RUBRIC_RULES.find((r) => r.id === rule).rating;
  const result = {
    rating: baseRating,
    baseRating,
    rule,
    ruleText: ruleText(rule),
    reasons,
    overridden: false,
    overrideReason: null,
    overrideError: null,
  };

  const override = record.rating?.override ?? null;
  if (override === null || override === baseRating) return result;

  const reason = (record.rating?.overrideReason ?? '').trim();
  const step = RATING_ORDER.indexOf(override) - RATING_ORDER.indexOf(baseRating);
  if (!RATING_ORDER.includes(override)) result.overrideError = `Unknown override rating "${override}".`;
  else if (Math.abs(step) > 1) result.overrideError = 'An override can move a rating by one level at most.';
  else if (!reason) result.overrideError = 'An override needs a written reason.';
  else Object.assign(result, { rating: override, overridden: true, overrideReason: reason });
  return result;
}
