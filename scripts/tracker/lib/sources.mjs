// Source upkeep for the tracker: which sources to check, dead links and
// missing archived copies, and how to recognise a Wayback capture that saved
// an anti-bot or error page instead of the source.

const BLOCK_MARKERS = ['captcha', 'access denied', 'verify you are human', '安全验证', '访问验证', '请输入验证码'];
const MIN_CAPTURE_BYTES = 2000;
const SNAPSHOT_URL = /^https:\/\/web\.archive\.org\/web\/\d{14}[^/]*\/\S+$/;

const isHttpUrl = (s) => typeof s === 'string' && /^https?:\/\/\S+$/.test(s);

// The same rule the schema applies to verified profiles: an archived copy,
// or a written reason there can't be one.
export const hasArchive = (source) =>
  isHttpUrl(source.archive?.url) || (typeof source.archive?.unavailable === 'string' && source.archive.unavailable.trim() !== '');

// An error status, a near-empty page, or a block-page phrase. Scripts are left
// out of the phrase search, so an ordinary page that loads reCAPTCHA passes.
export function looksLikeBlockedCapture({ status, body }) {
  if (status >= 400) return true;
  const text = String(body ?? '');
  if (Buffer.byteLength(text, 'utf8') < MIN_CAPTURE_BYTES) return true;
  const visible = text.replace(/<script\b[\s\S]*?<\/script>/gi, '').toLowerCase();
  return BLOCK_MARKERS.some((marker) => visible.includes(marker));
}

export function collectSources(records) {
  return records
    .filter((r) => r.status === 'verified')
    .flatMap((r) => (r.sources ?? []).map((source) => ({ recordId: r.id, source })));
}

// Requests each source URL, at most `concurrency` at a time. A failure may
// mean the page is gone or only that the site blocks automated checks, so
// each dead entry keeps its status or error for the reader to judge.
export async function checkSources(entries, { fetchImpl = fetch, concurrency = 4 } = {}) {
  const missingArchive = entries.filter((e) => !hasArchive(e.source));
  const queue = entries.map((entry, index) => ({ entry, index })).filter(({ entry }) => isHttpUrl(entry.source.url));
  const dead = [];
  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const { entry, index } = queue[next++];
      try {
        const res = await fetchImpl(entry.source.url);
        if (!res.ok) dead.push({ index, item: { ...entry, status: res.status } });
      } catch (e) {
        const cause = e.cause?.code ?? e.cause?.name;
        dead.push({ index, item: { ...entry, error: cause ? `${e.message} (${cause})` : e.message } });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  return { dead: dead.sort((a, b) => a.index - b.index).map((d) => d.item), missingArchive };
}

// Save Page Now answers with the snapshot itself (after a redirect) or with
// its address in Content-Location. Anything else is not a snapshot.
export function waybackSnapshotUrl({ url, headers }) {
  if (SNAPSHOT_URL.test(url ?? '')) return url;
  const location = headers?.get('content-location');
  if (!location) return null;
  const absolute = new URL(location, 'https://web.archive.org').href;
  return SNAPSHOT_URL.test(absolute) ? absolute : null;
}
