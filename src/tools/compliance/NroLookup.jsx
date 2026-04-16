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
function MarkerCluster({ markers, onMarkerClick, activeId }) {
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
              color:#fff;
              font-weight:700;
              font-size:${size >= 44 ? '14px' : '13px'};
              font-family:system-ui,-apple-system,sans-serif;
              text-shadow:0 1px 2px rgba(0,0,0,0.5);
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

export default function NroLookup({ onNavigate }) {
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

      {/* Fully sanctioned countries warning */}
      <div className="nro-sanctioned-banner">
        <div className="nro-sanctioned-title">
          ⚠️ Comprehensively Sanctioned Countries
        </div>
        <p className="nro-sanctioned-body">
          The following countries are subject to comprehensive Canadian sanctions — all research
          collaboration, funding, and technology transfer is prohibited regardless of whether
          a specific organization appears on the NRO list below.
        </p>
        <div className="nro-sanctioned-countries">
          {[
            { name: 'North Korea (DPRK)', basis: 'UNA + SEMA — ban on all new investment; comprehensive trade, financial, and technical restrictions' },
            { name: 'Belarus', basis: 'SEMA — broad sectoral restrictions on finance, energy, exports, and controlled technology' },
          ].map(c => (
            <div key={c.name} className="nro-sanctioned-country">
              <span className="nro-sanctioned-country-name">{c.name}</span>
              <span className="nro-sanctioned-country-basis">{c.basis}</span>
            </div>
          ))}
        </div>
        <p className="nro-sanctioned-note">
          Russia and Iran appear in the NRO list below and are also subject to comprehensive sanctions.
          Consult <a href="https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/current-actuelles.aspx" target="_blank" rel="noopener noreferrer">Global Affairs Canada</a> for the current full sanctions list.
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MarkerCluster
            markers={markers}
            onMarkerClick={handleMarkerClick}
            activeId={activeRowId}
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
              <li
                key={i}
                className="nro-proximity-suggestion"
                onClick={() => handleSelectInstitution(s)}
              >
                {s.displayName}
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
