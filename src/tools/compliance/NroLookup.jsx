import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerCluster from '../../components/ui/map/MarkerCluster';
import FlyToHandler from '../../components/ui/map/FlyToHandler';
import { escapeHtml } from '../../components/ui/map/escapeHtml';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Fuse from 'fuse.js';
import nroData from '../../data/nroData';
import { activeTileProvider } from '../../data/mapTiles';
import { ENABLE_PROXIMITY_SEARCH } from '../../siteConfig';
import { TRACKER_ENABLED } from '../../data/defenceTracker/enabled';

// Fix Leaflet default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- Institution geocoding -------------------------------------------------
// Nominatim is the primary geocoder: it returns precise street addresses.
// But it only knows what is mapped in OpenStreetMap, and OSM's coverage of
// universities outside Western Europe / North America is patchy — Minnan
// Normal University and Bauman Moscow State Technical University, for example,
// are both absent. Wikipedia article coordinates cover that long tail, so they
// are used as a fallback whenever Nominatim comes back empty. Wikipedia coords
// are article-level (main campus centroid), which is accurate enough for the
// tens-to-hundreds-of-km distances this panel reports.

async function geocodeNominatim(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) throw new Error('nominatim');
  const data = await res.json();
  return data.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    source: 'OpenStreetMap',
  }));
}

// Normalize a title/query for exact-match comparison
const normalizeName = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function geocodeWikipedia(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrlimit: '8',
    gsrsearch: query,
    prop: 'coordinates',
  });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) throw new Error('wikipedia');
  const data = await res.json();
  const pages = Object.values(data?.query?.pages ?? {});
  const q = normalizeName(query);
  return pages
    .filter((p) => p.coordinates?.length)
    .map((p) => {
      const title = normalizeName(p.title);
      // Wikipedia's relevance ranking is loose — searching for a specific
      // university also surfaces the city and neighbouring institutions — so
      // pull exact and prefix title matches to the top before its own ordering.
      const titleRank = title === q ? 0 : title.startsWith(q) || q.startsWith(title) ? 1 : 2;
      return {
        displayName: p.title,
        lat: p.coordinates[0].lat,
        lng: p.coordinates[0].lon,
        source: 'Wikipedia',
        titleRank,
        index: p.index ?? 99,
      };
    })
    .sort((a, b) => a.titleRank - b.titleRank || a.index - b.index)
    .slice(0, 5);
}

const COUNTRY_COLORS = {
  Russia: '#ef4444',
  China: '#3b82f6',
  Iran: '#22c55e',
};

// Haversine distance between two lat/lng points, returns km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Prepare marker data from organizations. Popup values are escaped because
// Leaflet sets popups as innerHTML.
function buildMarkers(orgs) {
  return orgs.map((org) => {
    const aliases = org.aliases || [];
    return {
      id: org.id,
      lat: org.lat,
      lng: org.lng,
      fillColor: COUNTRY_COLORS[org.country] || '#94a3b8',
      popupHtml: `<b>${escapeHtml(org.name)}</b><br/>${aliases.length > 0 ? escapeHtml(aliases.join(', ')) + '<br/>' : ''}${escapeHtml(org.city)}, ${escapeHtml(org.country)}`,
    };
  });
}

// Fuse.js search index
function buildFuse(orgs) {
  return new Fuse(orgs, {
    keys: ['name', 'aliases', 'city'],
    threshold: 0.35,
    ignoreLocation: true,
  });
}

// Renders a gold star marker for the user's searched institution
function MyInstitutionLayer({ institution }) {
  const map = useMap();

  useEffect(() => {
    if (!institution) return;

    const icon = L.divIcon({
      html: `<div style="
        width:30px;height:30px;border-radius:50%;
        background:#fbbf24;border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(251,191,36,0.45),0 2px 8px rgba(0,0,0,0.55);
        display:flex;align-items:center;justify-content:center;
        color:#78350f;font-size:16px;line-height:1;
      ">★</div>`,
      className: 'nro-my-institution-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const marker = L.marker([institution.lat, institution.lng], { icon });
    marker.bindPopup(
      `<b>${escapeHtml(institution.shortLabel)}</b><br/><span style="font-size:11px;color:#888">Your institution</span>`
    );
    marker.addTo(map);

    return () => {
      map.removeLayer(marker);
    };
  }, [map, institution]);

  return null;
}

export default function NroLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCountry, setActiveCountry] = useState('All');
  const [activeRowId, setActiveRowId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const tableRef = useRef(null);

  // Institution proximity search state
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [institutionSuggestions, setInstitutionSuggestions] = useState([]);
  const [myInstitution, setMyInstitution] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [tier1Open, setTier1Open] = useState(false);
  const [tier2Open, setTier2Open] = useState(false);

  const organizations = nroData.organizations;

  // Derive unique countries with counts
  const countryCounts = useMemo(() => {
    const counts = {};
    organizations.forEach((org) => {
      counts[org.country] = (counts[org.country] || 0) + 1;
    });
    return counts;
  }, [organizations]);

  const countries = useMemo(() => Object.keys(countryCounts).sort(), [countryCounts]);

  // Fuse instance
  const fuse = useMemo(() => buildFuse(organizations), [organizations]);

  // Filter organizations by country and search
  const filteredOrgs = useMemo(() => {
    let results = organizations;

    // Country filter
    if (activeCountry !== 'All') {
      results = results.filter((org) => org.country === activeCountry);
    }

    // Search filter
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery.trim());
      const searchIds = new Set(searchResults.map((r) => r.item.id));
      results = results.filter((org) => searchIds.has(org.id));
    }

    return results;
  }, [organizations, activeCountry, searchQuery, fuse]);

  // Markers for the map
  const markers = useMemo(() => buildMarkers(filteredOrgs), [filteredOrgs]);

  // Nearest NROs to the searched institution (computed against all orgs, not filtered)
  const nearestNros = useMemo(() => {
    if (!myInstitution) return [];
    return organizations
      .map((org) => ({
        ...org,
        distanceKm: haversineKm(myInstitution.lat, myInstitution.lng, org.lat, org.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [myInstitution, organizations]);

  // Handle clicking a map pin
  const handleMarkerClick = useCallback((id) => {
    setActiveRowId(id);
    // Scroll the table row into view
    setTimeout(() => {
      const row = document.getElementById(`nro-row-${id}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // Handle clicking a table row
  const handleRowClick = useCallback((org) => {
    setActiveRowId(org.id);
    setFlyTarget({ lat: org.lat, lng: org.lng, id: org.id });
  }, []);

  // Geocode an institution name: OpenStreetMap first, Wikipedia as fallback
  const handleInstitutionSearch = async (e) => {
    e?.preventDefault();
    const q = institutionQuery.trim();
    if (!q) return;
    setGeocoding(true);
    setGeocodeError('');
    setInstitutionSuggestions([]);
    try {
      let results = [];
      let osmFailed = false;
      try {
        results = await geocodeNominatim(q);
      } catch {
        osmFailed = true;
      }
      if (results.length === 0) {
        results = await geocodeWikipedia(q);
      }
      if (results.length === 0) {
        setGeocodeError(
          osmFailed
            ? 'Search failed. Check your connection and try again.'
            : 'No match found. Try the institution’s full official name, or search for its city instead — city-level accuracy is enough for a proximity check.'
        );
      } else {
        setInstitutionSuggestions(results);
      }
    } catch {
      setGeocodeError('Search failed. Check your connection and try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSelectInstitution = useCallback((suggestion) => {
    setMyInstitution({
      ...suggestion,
      shortLabel: suggestion.displayName.split(',')[0],
    });
    setInstitutionSuggestions([]);
    setFlyTarget({ lat: suggestion.lat, lng: suggestion.lng, zoom: 7 });
  }, []);

  const handleClearInstitution = useCallback(() => {
    setMyInstitution(null);
    setInstitutionQuery('');
    setInstitutionSuggestions([]);
    setGeocodeError('');
  }, []);

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>NRO Lookup &amp; Map</h1>
        <p>
          Search Named Research Organizations with interactive map visualization.
          Data sourced from the{' '}
          <a href={nroData.sourceUrl} target="_blank" rel="noopener noreferrer">
            Government of Canada
          </a>
          , last updated {nroData.lastUpdated}.
        </p>
      </div>

      {/* Sanctions context for research collaboration.
          Each tier's content is unmounted when collapsed, so aria-controls is set
          only while the panel exists — a dangling IDREF is an ARIA error. */}
      <div className="nro-sanctioned-banner">
        <button
          type="button"
          className={`nro-sanctioned-toggle nro-sanctioned-toggle--tier1 ${tier1Open ? 'is-open' : ''}`}
          onClick={() => setTier1Open(v => !v)}
          aria-expanded={tier1Open}
          aria-controls={tier1Open ? 'nro-sanctioned-tier1-content' : undefined}
        >
          <span className="nro-sanctioned-title nro-sanctioned-title--tier1">
            ⛔ Tier 1 — Comprehensive sanctions (collaboration almost certainly prohibited)
          </span>
          <span className="nro-sanctioned-count">2 destinations</span>
          <span className="nro-sanctioned-chevron" aria-hidden="true">▸</span>
        </button>
        {tier1Open && (
          <div id="nro-sanctioned-tier1-content" className="nro-sanctioned-content">
            <p className="nro-sanctioned-body">
              Canadian sanctions on these destinations prohibit dealings with listed persons —
              even indirectly through a third party — and the supply of a wide range of goods,
              technology and services, including research and development and scientific or
              technical assistance. Almost any research collaboration would involve a prohibited
              activity. Treat it as off the table unless Global Affairs Canada&rsquo;s Sanctions
              Bureau has confirmed that the specific activity is permitted. This applies whether
              or not an organization appears on the NRO list.
            </p>
            <div className="nro-sanctioned-countries">
              {[
                { name: 'North Korea (DPRK)', basis: 'UNA + SEMA — near-total trade, financial, and technical embargo; asset freeze on all listed persons' },
                { name: 'Occupied regions of Ukraine', basis: 'SEMA — Crimea, Donetsk, Luhansk, Zaporizhzhia, and Kherson treated as comprehensively sanctioned territories' },
              ].map(c => (
                <div key={c.name} className="nro-sanctioned-country">
                  <span className="nro-sanctioned-country-name">{c.name}</span>
                  <span className="nro-sanctioned-country-basis">{c.basis}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="nro-sanctioned-divider" />

        <button
          type="button"
          className={`nro-sanctioned-toggle nro-sanctioned-toggle--tier2 ${tier2Open ? 'is-open' : ''}`}
          onClick={() => setTier2Open(v => !v)}
          aria-expanded={tier2Open}
          aria-controls={tier2Open ? 'nro-sanctioned-tier2-content' : undefined}
        >
          <span className="nro-sanctioned-title nro-sanctioned-title--tier2">
            ⚠️ Tier 2 — Broad sanctions (check the specific activity before engaging)
          </span>
          <span className="nro-sanctioned-count">4 destinations</span>
          <span className="nro-sanctioned-chevron" aria-hidden="true">▸</span>
        </button>
        {tier2Open && (
          <div id="nro-sanctioned-tier2-content" className="nro-sanctioned-content">
            <p className="nro-sanctioned-body">
              Sanctions on these destinations are extensive but activity-specific: they
              prohibit dealings with listed persons and entities, and restrict named sectors,
              goods, technology and services. Research collaboration is not categorically
              banned, but you must confirm that no listed person, controlled item, restricted
              sector or prohibited service is involved — and that the partner is not owned or
              controlled, directly or indirectly, by a listed entity. Your institution&rsquo;s
              research security or legal office should review any proposed partnership; some
              Canadian institutions have paused new collaborations in these jurisdictions.
            </p>
            <div className="nro-sanctioned-countries">
              {[
                { name: 'Russia', basis: 'SEMA — sweeping list-based asset freezes, dealings prohibitions, and sectoral restrictions on finance, energy, defence, and dual-use technology' },
                { name: 'Belarus', basis: 'SEMA — broad restrictions on finance, energy, exports, and controlled technology; extensive list of designated persons' },
                { name: 'Iran', basis: 'SEMA + UNA — list-based designations plus prohibitions on nuclear, missile, and military-related goods, services, and financial dealings' },
                { name: 'Myanmar (Burma)', basis: 'SEMA — targeted designations of senior military officials and affiliated entities, arms embargo, and prohibition on supplying technical data related to military activities' },
              ].map(c => (
                <div key={c.name} className="nro-sanctioned-country">
                  <span className="nro-sanctioned-country-name">{c.name}</span>
                  <span className="nro-sanctioned-country-basis">{c.basis}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="nro-sanctioned-note">
          This is a high-level summary for research collaboration decisions, not legal advice.
          Global Affairs Canada publishes{' '}
          <a href="https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/academic-research-universitaire-recherche.aspx?lang=eng" target="_blank" rel="noopener noreferrer">guidance for academic and research institutions</a>
          {' '}and the authoritative, frequently-updated{' '}
          <a href="https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx" target="_blank" rel="noopener noreferrer">sanctions index</a>.
          Always confirm with your institution&rsquo;s research security or legal office before engaging.
        </p>
      </div>

      {/* Map */}
      <div className="nro-map-container">
        <MapContainer
          center={[35, 80]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution={activeTileProvider.attribution}
            url={activeTileProvider.url}
            subdomains={activeTileProvider.subdomains ?? 'abc'}
            maxZoom={activeTileProvider.maxZoom}
          />
          <MarkerCluster
            markers={markers}
            onMarkerClick={handleMarkerClick}
            iconClassName="nro-cluster-icon"
          />
          <MyInstitutionLayer institution={myInstitution} />
          <FlyToHandler target={flyTarget} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
        {Object.entries(COUNTRY_COLORS).map(([country, color]) => (
          <span key={country} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: color,
                display: 'inline-block',
                border: '2px solid #fff',
              }}
            />
            {country}
          </span>
        ))}
        {ENABLE_PROXIMITY_SEARCH && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              display: 'inline-block',
              border: '2px solid #fff',
            }} />
            Your institution
          </span>
        )}
      </div>

      {/* Institution proximity check — the only feature that sends user input
          off the device, so it carries its own privacy notice at the point of
          entry and can be switched off in siteConfig.js. */}
      {ENABLE_PROXIMITY_SEARCH && (
      <div className="nro-proximity-panel">
        <div className="nro-proximity-header">
          <strong>Check proximity to NROs</strong>
          <span>Search any institution to see the nearest Named Research Organizations and their distances. Searches OpenStreetMap first, then Wikipedia for institutions that OpenStreetMap does not map — for best results, include the city or country (e.g. &quot;Beihang University, Beijing&quot;). Each result shows which source it came from; Wikipedia results are main-campus locations rather than exact addresses.</span>
        </div>
        <p id="nro-proximity-privacy" className="nro-proximity-privacy">
          <strong>Privacy:</strong> unlike the rest of this site, what you type here leaves your
          browser. When you press Find it is sent, with your IP address, to OpenStreetMap and
          possibly Wikipedia. Enter an institution name only — never project details. If the fact
          that you are looking at a particular partner is itself sensitive, filter the NRO table
          below by city instead; that search stays on your device.{' '}
          <a href="#how-it-works">How this site handles your data</a>
        </p>
        <form className="nro-proximity-form" onSubmit={handleInstitutionSearch}>
          <input
            type="text"
            className="nro-proximity-input"
            aria-label="Institution name"
            aria-describedby="nro-proximity-privacy"
            autoComplete="off"
            placeholder="e.g. University of Toronto, MIT, Peking University…"
            value={institutionQuery}
            onChange={(e) => {
              setInstitutionQuery(e.target.value);
              if (institutionSuggestions.length > 0) setInstitutionSuggestions([]);
              if (geocodeError) setGeocodeError('');
            }}
          />
          <button
            type="submit"
            className="nro-proximity-btn"
            disabled={geocoding || !institutionQuery.trim()}
          >
            {geocoding ? 'Searching…' : 'Find'}
          </button>
          {myInstitution && (
            <button type="button" className="nro-proximity-clear" onClick={handleClearInstitution}>
              Clear
            </button>
          )}
        </form>

        {institutionSuggestions.length > 0 && (
          <ul className="nro-proximity-suggestions">
            {institutionSuggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="nro-proximity-suggestion"
                  onClick={() => handleSelectInstitution(s)}
                >
                  {s.displayName}
                  <span className="nro-proximity-suggestion-source">via {s.source}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {geocodeError && <p className="nro-proximity-error">{geocodeError}</p>}

        {myInstitution && nearestNros.length > 0 && (
          <div className="nro-proximity-results">
            <p className="nro-proximity-results-label">
              Nearest NROs to <strong>{myInstitution.shortLabel}</strong>:
            </p>
            <table className="nro-proximity-results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Organization</th>
                  <th>Country</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {nearestNros.map((org, i) => (
                  <tr
                    key={org.id}
                    onClick={() => handleRowClick(org)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="nro-proximity-rank">{i + 1}</td>
                    <td>{org.name}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: COUNTRY_COLORS[org.country] || '#94a3b8',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {org.country}
                      </span>
                    </td>
                    <td className="nro-proximity-distance">
                      {org.distanceKm < 1
                        ? `${Math.round(org.distanceKm * 1000)} m`
                        : org.distanceKm < 100
                        ? `${org.distanceKm.toFixed(1)} km`
                        : `${Math.round(org.distanceKm)} km`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Country filter chips */}
      <div className="nro-filters">
        <button
          className={`nro-filter-chip ${activeCountry === 'All' ? 'nro-filter-chip--active' : ''}`}
          onClick={() => setActiveCountry('All')}
        >
          All ({organizations.length})
        </button>
        {countries.map((country) => (
          <button
            key={country}
            className={`nro-filter-chip ${activeCountry === country ? 'nro-filter-chip--active' : ''}`}
            onClick={() => setActiveCountry(country)}
          >
            {country} ({countryCounts[country]})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        className="stra-search"
        placeholder="Search organizations by name, alias, or city..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Table */}
      <div ref={tableRef} style={{ overflowX: 'auto' }}>
        <table className="nro-table">
          <thead>
            <tr>
              <th>Organization Name</th>
              <th>Aliases</th>
              <th>City</th>
              <th>Country</th>
              {TRACKER_ENABLED && <th>Profile</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={TRACKER_ENABLED ? 5 : 4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No organizations match your search criteria.
                </td>
              </tr>
            ) : (
              filteredOrgs.map((org) => (
                <tr
                  key={org.id}
                  id={`nro-row-${org.id}`}
                  className={activeRowId === org.id ? 'nro-row--active' : ''}
                  onClick={() => handleRowClick(org)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{org.name}</td>
                  <td>{org.aliases.join(', ')}</td>
                  <td>{org.city}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: COUNTRY_COLORS[org.country] || '#94a3b8',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      {org.country}
                    </span>
                  </td>
                  {TRACKER_ENABLED && (
                    <td>
                      {/* Every NRO has a tracker record at the same id. stopPropagation
                          keeps the row's fly-to-map click from firing as well. */}
                      <a className="nro-profile-link" href={`#defence-tracker/${org.id}`} onClick={(e) => e.stopPropagation()}>
                        Tracker profile
                      </a>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Showing {filteredOrgs.length} of {organizations.length} organizations
      </p>
    </div>
  );
}
