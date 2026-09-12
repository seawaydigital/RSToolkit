export function validCoordinates(latitude, longitude) {
 return typeof latitude === 'number' && typeof longitude === 'number' && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 85 && Math.abs(longitude) <= 180;
}

export function distanceKm(a, b) {
 if (!validCoordinates(a.lat, a.lng) || !validCoordinates(b.lat, b.lng)) return null;
 const radians = degrees => degrees * Math.PI / 180;
 const dLat = radians(b.lat - a.lat), dLng = radians(b.lng - a.lng);
 const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
 return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, value))));
}

export function formatDistance(km) {
 if (!Number.isFinite(km) || km < 0) return 'Distance unavailable';
 return km < 1 ? 'Less than 1 km' : 'About ' + Math.round(km).toLocaleString('en-CA') + ' km';
}

export function parsePlaceResults(data) {
 if (!data || typeof data !== 'object' || data.error || !Array.isArray(data.query?.pages)) return [];
 return data.query.pages.flatMap(page => {
  if (!page || !Number.isSafeInteger(page.pageid) || page.pageid < 1 || typeof page.title !== 'string' || !page.title.trim() || page.title.length > 300 || !Array.isArray(page.coordinates)) return [];
  const point = page.coordinates.find(p => p?.primary === true && p.globe === 'earth' && validCoordinates(p.lat, p.lon));
  if (!point) return [];
  return [{ id: 'wikipedia-' + page.pageid, label: page.title, lat: point.lat, lng: point.lon, sourceUrl: 'https://en.wikipedia.org/?curid=' + page.pageid, sourceLabel: 'Wikipedia article location', scope: 'Article-level point; confirm the campus or building before using it.' }];
 }).slice(0, 8);
}

export async function searchPublicPlaces(query, signal) {
 const value = query.trim();
 if (value.length < 3 || value.length > 160) throw new Error('Enter 3 to 160 characters naming a public institution or campus.');
 const url = new URL('https://en.wikipedia.org/w/api.php');
 url.search = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: value, gsrnamespace: '0', gsrlimit: '8', prop: 'coordinates', coprimary: 'primary', coprop: 'globe|dim', format: 'json', formatversion: '2', origin: '*' });
 const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer', headers: { 'Api-User-Agent': 'ResearchSecurityToolkit/0.1 (security.research@lakeheadu.ca)' } });
 if (!response.ok) throw new Error('The location service is unavailable. Try later or enter coordinates locally.');
 const data = await response.json();
 if (!data || typeof data !== 'object' || data.error) throw new Error('The location service could not complete this search. Try later or enter coordinates locally.');
 return parsePlaceResults(data);
}
