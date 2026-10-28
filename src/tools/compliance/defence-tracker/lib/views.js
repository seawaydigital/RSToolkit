// Maps the tracker's sub-route to one of its views. `hasRecord` says whether
// an institution id exists (aliases such as a second NRO id count).
export function resolveTrackerView(subRoute, hasRecord) {
  if (subRoute === null || subRoute === undefined) return { view: 'not-found' };
  if (subRoute === '') return { view: 'search' };
  if (subRoute === 'batch' || subRoute === 'methodology') return { view: subRoute };
  return hasRecord(subRoute) ? { view: 'profile', id: subRoute } : { view: 'not-found' };
}
