// Hash routes are "#tool" or "#tool/sub". Only the Defence Institution
// Tracker uses the sub-route (for citable institution permalinks); every other
// tool ignores it. A leading slash ("#/tool") is accepted for old links.
// subRoute is null when it cannot be percent-decoded, so the tool can show a
// not-found view instead of throwing.
export function parseHashRoute(hash) {
  const raw = String(hash ?? '').replace(/^#\/?/, '');
  const slash = raw.indexOf('/');
  const route = (slash === -1 ? raw : raw.slice(0, slash)) || null;
  let subRoute = slash === -1 ? '' : raw.slice(slash + 1);
  try {
    subRoute = decodeURIComponent(subRoute);
  } catch {
    subRoute = null;
  }
  return { route, subRoute };
}
