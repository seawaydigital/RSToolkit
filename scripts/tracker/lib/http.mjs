// Small fetch helpers for the maintenance scripts: an identifying user agent,
// a timeout, and a couple of retries for server errors and rate limits.
export const USER_AGENT = 'RSToolkit-tracker/1.0 (+https://github.com/seawaydigital/RSToolkit)';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchText(url, { timeoutMs = 60000, retries = 2, headers = {} } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, ...headers }, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status} from ${url}`), { status: res.status });
      return await res.text();
    } catch (e) {
      lastError = e;
      const retryable = !e.status || e.status >= 500 || e.status === 429;
      if (!retryable || attempt === retries) break;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastError;
}

export async function fetchJson(url, options) {
  return JSON.parse(await fetchText(url, options));
}

// For link checks: the status only, without downloading the page.
export async function fetchStatus(url, { timeoutMs = 30000 } = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(timeoutMs) });
  await res.body?.cancel();
  return { ok: res.ok, status: res.status };
}
