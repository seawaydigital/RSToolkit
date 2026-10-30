// Screens rows against the OpenSanctions matching API from the browser.
// `fetch` is passed in so the Node tests can run it against a fake server.
//
// The key travels in the query string because it is the only form browsers
// can send: an Authorization header makes the browser send a preflight
// request first, and the API answers preflights with 401 (checked
// 2026-10-28). It goes to api.opensanctions.org only, over HTTPS, and is
// never stored or put in the page address.

export const API_BASE = 'https://api.opensanctions.org';
export const ENTITY_BASE = 'https://www.opensanctions.org/entities/';

export const DATASETS = {
  sanctions: { label: 'Sanctions lists only', short: 'sanctions lists' },
  default: { label: 'All OpenSanctions data (adds politically exposed persons, debarment, crime and more)', short: 'all OpenSanctions data' },
};

export const DEFAULT_THRESHOLD = 0.7;
// A candidate below the match threshold but at or above this score is shown
// as a possible match, for a person to look at.
export const POSSIBLE_FLOOR = 0.5;
export const CONCURRENCY = 2;
const MAX_RETRIES = 3;

export const RESULT_LABELS = {
  match: 'Match',
  possible: 'Possible match',
  none: 'No match found',
  error: 'Not checked',
};

export const resultLabel = (result) =>
  !result ? 'Not checked' : result.nameOnly ? 'Possible match (name only)' : RESULT_LABELS[result.status];

// A person screened on a name alone can only ever match a name: "Zhang Wei"
// or "John Smith" scores 1.00 against someone else entirely. Without a
// country or birth date to tell them apart, a match is at most possible.
export const isNameOnly = (row) => row?.schema === 'Person' && !row.country && !row.birthDate;

// FollowTheMoney topic codes, in words. Unknown codes are shown as they are.
export const TOPIC_LABELS = {
  sanction: 'Sanctioned',
  'sanction.linked': 'Linked to a sanctioned entity',
  'sanction.counter': 'Counter-sanctioned',
  debarment: 'Debarred',
  'export.control': 'Export controlled',
  'export.risk': 'Export risk',
  'role.pep': 'Politically exposed person',
  'role.rca': 'Close associate of a PEP',
  'role.oligarch': 'Oligarch',
  crime: 'Crime',
  'crime.terror': 'Terrorism',
  'crime.fin': 'Financial crime',
  'crime.war': 'War crimes',
  'crime.cyber': 'Cybercrime',
  wanted: 'Wanted',
  poi: 'Person of interest',
  mil: 'Military',
  'gov.soe': 'State-owned enterprise',
  'reg.action': 'Regulatory action',
  'reg.warn': 'Regulatory warning',
  'corp.disqual': 'Disqualified director',
};

export const topicLabel = (t) => TOPIC_LABELS[t] ?? t;

// Some datasets are reference sources OpenSanctions uses to enrich a record,
// not lists: ids starting ext_ (the ROR registry of research organizations,
// say), Wikidata (wd_), company registries and ownership databases (LSEG's
// PermID, GLEIF, Global Energy Monitor's gem_ sets), and a campaign group's
// register of firms doing business in Iran. Showing them as "lists" would
// overstate the result; the record page on OpenSanctions still names them.
const NOT_LISTS = new Set(['permid', 'gleif', 'wikidata', 'opencorporates', 'ir_uani_business_registry']);
const NOT_LIST_PREFIXES = ['ext_', 'wd_', 'gem_'];
export const listDatasets = (datasets = []) =>
  datasets.filter((d) => !NOT_LISTS.has(d) && !NOT_LIST_PREFIXES.some((p) => d.startsWith(p)));

export function buildQuery(row) {
  const properties = { name: [row.name] };
  if (row.schema === 'Person') {
    if (row.birthDate) properties.birthDate = [row.birthDate];
    if (row.country) properties.nationality = [row.country];
  } else if (row.country) {
    properties.country = [row.country];
  }
  return { schema: row.schema, properties };
}

export function matchUrl({ dataset, key, threshold }) {
  const params = new URLSearchParams({ api_key: key, threshold: String(threshold), limit: '5' });
  return `${API_BASE}/match/${encodeURIComponent(dataset)}?${params}`;
}

export const entityUrl = (id) => `${ENTITY_BASE}${encodeURIComponent(id)}/`;

function candidate(result) {
  return {
    id: result.id,
    caption: result.caption,
    schema: result.schema,
    score: result.score,
    match: Boolean(result.match),
    topics: result.properties?.topics ?? [],
    countries: result.properties?.country ?? result.properties?.nationality ?? [],
    lists: listDatasets(result.datasets),
    url: entityUrl(result.id),
  };
}

// One /match response → this row's outcome and its top three candidates.
export function summarize(response, row) {
  const results = [...(response?.results ?? [])].sort((a, b) => b.score - a.score);
  const candidates = results.filter((r) => r.match || r.score >= POSSIBLE_FLOOR).slice(0, 3).map(candidate);
  const matched = candidates.some((c) => c.match);
  if (matched && isNameOnly(row)) return { status: 'possible', nameOnly: true, candidates };
  return { status: matched ? 'match' : candidates.length ? 'possible' : 'none', candidates };
}

export class KeyRejectedError extends Error {}

const defaultSleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(signal.reason ?? new DOMException('Aborted', 'AbortError')); }, { once: true });
  });

async function screenOne(row, { fetchImpl, url, signal, sleep }) {
  const body = JSON.stringify({ queries: { q: buildQuery(row) } });
  for (let attempt = 0; ; attempt++) {
    const res = await fetchImpl(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal });
    if (res.status === 401 || res.status === 403) throw new KeyRejectedError(`OpenSanctions rejected the key (HTTP ${res.status}).`);
    if ((res.status === 429 || res.status === 503) && attempt < MAX_RETRIES) {
      const wait = Number(res.headers?.get?.('Retry-After'));
      await sleep(Number.isFinite(wait) && wait > 0 ? wait * 1000 : 1000 * 2 ** attempt, signal);
      continue;
    }
    if (!res.ok) return { status: 'error', candidates: [], error: `HTTP ${res.status}` };
    const json = await res.json();
    return summarize(json.responses?.q, row);
  }
}

// Screens every row, CONCURRENCY at a time, calling onResult(index, result)
// as each finishes. A row that fails is marked "Not checked" and the run
// carries on; a rejected key, or the user cancelling, stops the whole run.
export async function screenRows(rows, { key, dataset = 'sanctions', threshold = DEFAULT_THRESHOLD, fetchImpl, signal, onResult, sleep = defaultSleep, concurrency = CONCURRENCY }) {
  const url = matchUrl({ dataset, key, threshold });
  let next = 0;
  let stopped = false;
  async function worker() {
    while (next < rows.length && !stopped) {
      if (signal?.aborted) return;
      const i = next++;
      let result;
      try {
        result = await screenOne(rows[i], { fetchImpl, url, signal, sleep });
      } catch (e) {
        if (e instanceof KeyRejectedError || e?.name === 'AbortError' || signal?.aborted) {
          stopped = true;
          throw e;
        }
        result = { status: 'error', candidates: [], error: 'The request failed. Check your connection and try again.' };
      }
      onResult?.(i, result);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, worker));
}
