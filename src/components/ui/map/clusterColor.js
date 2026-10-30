export const FALLBACK_COLOR = '#94a3b8';

// The colour most of a cluster's markers share. Ties go to the colour listed
// first in `priority` when one is given, otherwise to the colour seen first,
// which is how NRO Lookup's dominant-country clusters have always behaved.
export function dominantColor(colors, { priority = [] } = {}) {
  const counts = new Map();
  for (const c of colors) counts.set(c, (counts.get(c) ?? 0) + 1);
  const rank = (c) => {
    const i = priority.indexOf(c);
    return i === -1 ? priority.length : i;
  };
  let best = FALLBACK_COLOR;
  let max = 0;
  for (const [c, n] of counts) {
    if (n > max || (n === max && rank(c) < rank(best))) {
      best = c;
      max = n;
    }
  }
  return best;
}
