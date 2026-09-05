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
// against that requirement, at the zoom levels this tool actually uses
// (z3 overview, z7 proximity placement, z10 table-row fly-to).
//
// Label coverage, verified tile-by-tile over Beijing / Moscow / Tehran:
//
//   CARTO Voyager   Latin at EVERY zoom. Best English experience, needs a key.
//   Stadia Alidade  Latin at every zoom (OpenMapTiles name:latin), needs a key.
//   Esri Street     Latin through z10, then switches to local script -- a z12
//                   tile over Beijing comes back with Hanzi street names.
//
// So: the keyless Esri default is correct through the zooms the UI drives you
// to, and only degrades if a user deliberately zooms in past z10. Setting
// VITE_CARTO_API_KEY removes that caveat entirely and is the recommended
// production setup. See .env.example.

const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY;
const STADIA_KEY = import.meta.env.VITE_STADIA_API_KEY;

export const TILE_PROVIDERS = {
  // Fallback default. No API key, no signup, no watermark. Latin labels through
  // z10; local script appears past that (see the note above). Note the
  // {z}/{y}/{x} ordering — Esri is y-before-x, unlike the {z}/{x}/{y} of the
  // OSM-style providers below.
  esri: {
    id: 'esri',
    name: 'Esri World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, and the GIS User Community',
    maxZoom: 19,
  },

  // RECOMMENDED. The original basemap, restored to an unwatermarked state by a
  // key, and the only option verified Latin at every zoom level. Free tier is
  // 5 million tile requests per calendar month and needs no CARTO account.
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
