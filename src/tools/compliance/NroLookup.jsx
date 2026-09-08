import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Fuse from 'fuse.js';
import nroData from '../../data/nroData';
import { activeTileProvider } from '../../data/mapTiles';

// Fix Leaflet default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

// Prepare marker data from organizations
function buildMarkers(orgs) {
  return orgs.map((org) => ({
    id: org.id,
    name: org.name,
    aliases: org.aliases || [],
    city: org.city,
    country: org.country,
    lat: org.lat,
    lng: org.lng,
    color: COUNTRY_COLORS[org.country] || '#94a3b8',
  }));
}

// Fuse.js search index
function buildFuse(orgs) {
  return new Fuse(orgs, {
    keys: ['name', 'aliases', 'city'],
    threshold: 0.35,
    ignoreLocation: true,
  });
}

// Custom MarkerCluster component for react-leaflet v4
function MarkerCluster({ markers, onMarkerClick }) {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers();
        const count = childMarkers.length;

        // Tally by country color to determine dominant country in cluster
        const colorCounts = {};
        childMarkers.forEach((cm) => {
          const c = cm.options.fillColor || '#94a3b8';
          colorCounts[c] = (colorCounts[c] || 0) + 1;
        });
        let dominantColor = '#94a3b8';
        let max = 0;
        Object.entries(colorCounts).forEach(([col, n]) => {
          if (n > max) {
            max = n;
            dominantColor = col;
          }
        });
        const mixed = Object.keys(colorCounts).length > 1;

        // Size scales with count, capped
        const size = count < 10 ? 32 : count < 50 ? 38 : count < 150 ? 44 : 50;

        // Count text is dark on the country fill: white measured 2.28:1 on Iran green
        // and 3.68:1 on China blue, below the 4.5:1 WCAG 1.4.3 floor.
        return L.divIcon({
          html: `
            <div style="
              width:${size}px;
              height:${size}px;
              border-radius:50%;
              background:${dominantColor};
              border:3px solid ${mixed ? '#fff' : 'rgba(255,255,255,0.85)'};
              box-shadow:0 0 0 2px ${dominantColor}55, 0 2px 6px rgba(0,0,0,0.4);
              display:flex;
              align-items:center;
              justify-content:center;
              color:#061727;
              font-weight:700;
              font-size:${size >= 44 ? '14px' : '13px'};
              font-family:system-ui,-apple-system,sans-serif;
              text-shadow:0 1px 1px rgba(255,255,255,0.35);
            ">${count}</div>
          `,
          className: 'nro-cluster-icon',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });
    markers.forEach((m) => {
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 8,
        fillColor: m.color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      });
      marker.bindPopup(
        `<b>${m.name}</b><br/>${m.aliases.length > 0 ? m.aliases.join(', ') + '<br/>' : ''}${m.city}, ${m.country}`
      );
      marker.on('click', () => onMarkerClick(m.id));
      cluster.addLayer(marker);
    });
    map.addLayer(cluster);
    clusterRef.current = cluster;
    return () => {
      map.removeLayer(cluster);
    };
  }, [map, markers, onMarkerClick]);

  return null;
}

// Component to imperatively fly the map to a location
function FlyToHandler({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom ?? 10);
    }
  }, [map, target]);

  return null;
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
      `<b>${institution.shortLabel}</b><br/><span style="font-size:11px;color:#888">Your institution</span>`
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

  // Geocode an institution name via Nominatim
  const handleInstitutionSearch = async (e) => {
    e?.preventDefault();
    const q = institutionQuery.trim();
    if (!q) return;
    setGeocoding(true);
    setGeocodeError('');
    setInstitutionSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.length === 0) {
        setGeocodeError('No results found. Try a more specific name, or include the city and country.');
      } else {
        setInstitutionSuggestions(
          data.map((r) => ({
            displayName: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          }))
        );
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
            ⛔ Tier 1 — Comprehensive prohibitions (no research engagement)
          </span>
          <span className="nro-sanctioned-count">2 destinations</span>
          <span className="nro-sanctioned-chevron" aria-hidden="true">▸</span>
        </button>
        {tier1Open && (
          <div id="nro-sanctioned-tier1-content" className="nro-sanctioned-content">
            <p className="nro-sanctioned-body">
              Canadian sanctions functionally prohibit all research collaboration, funding,
              technology transfer, and most in-kind support with these destinations,
              regardless of whether a specific organization appears on the NRO list.
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
            ⚠️ Tier 2 — Broad sectoral sanctions (heightened scrutiny required)
          </span>
          <span className="nro-sanctioned-count">4 destinations</span>
          <span className="nro-sanctioned-chevron" aria-hidden="true">▸</span>
        </button>
        {tier2Open && (
          <div id="nro-sanctioned-tier2-content" className="nro-sanctioned-content">
            <p className="nro-sanctioned-body">
              Sanctions vary in scope but are substantial enough to warrant
              institutional review of any proposed partnership. Scope is sector-
              or list-based rather than comprehensive, so research is not
              categorically banned — but due diligence must confirm no listed
              person, controlled good, or restricted sector is involved. Many
              Canadian institutions have elected to pause new collaborations in
              these jurisdictions pending federal guidance.
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
          The authoritative and frequently-updated list lives with{' '}
          <a href="https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx" target="_blank" rel="noopener noreferrer">Global Affairs Canada</a>.
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
      </div>

      {/* Institution proximity check */}
      <div className="nro-proximity-panel">
        <div className="nro-proximity-header">
          <strong>Check proximity to NROs</strong>
          <span>Search any institution to see the nearest Named Research Organizations and their distances. Searches OpenStreetMap data worldwide — for best results, include the city or country (e.g. "Beihang University, Beijing"). If nothing is found, try a partial name or full address.</span>
        </div>
        <form className="nro-proximity-form" onSubmit={handleInstitutionSearch}>
          <input
            type="text"
            className="nro-proximity-input"
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
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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
