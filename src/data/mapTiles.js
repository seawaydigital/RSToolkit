// Basemap tile provider configuration for the NRO Lookup map.
//
// Why this file exists: CARTO began enforcing API keys on its raster basemaps
// (basemaps.cartocdn.com) in August 2026. Unkeyed requests still return a tile,
// so nothing "breaks" — but every tile comes back stamped with a repeating
// "API KEY REQUIRED" watermark, which is what was showing on the map. CARTO has
// also put raster basemaps on a deprecation path in favour of vector.
//
// The hard requirement for this map is ENGLISH place labels: it plots Chinese,
// Russian and Iranian institutions, and the standard OpenStreetMap basemap
// renders those in local script (Hanzi / Cyrillic / Perso-Arabic), which would
// make the map unreadable for its audience. Every provider below is checked
// against that requirement.
//
// The default requires no key and no signup, so the site builds and deploys
// with nothing configured. To switch to a keyed provider, set the matching
// env var at build time (see .env.example).

const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY;
const STADIA_KEY = import.meta.env.VITE_STADIA_API_KEY;

export const TILE_PROVIDERS = {
  // Default. No API key, no signup, no watermark. Latin/English labels
  // worldwide. Note the {z}/{y}/{x} ordering — Esri is y-before-x, unlike the
  // {z}/{x}/{y} of the OSM-style providers below.
  esri: {
    id: 'esri',
    name: 'Esri World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, and the GIS User Community',
    maxZoom: 19,
  },

  // The original basemap, restored to an unwatermarked state by a key.
  // Free tier is 5 million tile requests per calendar month.
  // Request one at https://carto.com/basemaps/apikey/
  carto: {
    id: 'carto',
    name: 'CARTO Voyager',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    subdomains: 'abcd',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    maxZoom: 20,
  },

  // Closest visual match to Voyager, and the key can be locked to a domain in
  // the Stadia dashboard — so publishing it in a static bundle is safe.
  // Free tier covers non-commercial and academic use.
  stadia: {
    id: 'stadia',
    name: 'Stadia Alidade Smooth',
    url: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`,
    attribution:
      '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 20,
  },
};

// A configured key wins; otherwise fall back to the keyless default.
// CARTO is checked first so that setting VITE_CARTO_API_KEY restores the
// map's original appearance with no other change.
export const activeTileProvider = CARTO_KEY
  ? TILE_PROVIDERS.carto
  : STADIA_KEY
    ? TILE_PROVIDERS.stadia
    : TILE_PROVIDERS.esri;

export default activeTileProvider;
