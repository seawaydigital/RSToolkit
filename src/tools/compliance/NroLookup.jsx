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
    const cluster = L.markerClusterGroup();
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
      map.flyTo([target.lat, target.lng], 10);
    }
  }, [map, target]);

  return null;
}

export default function NroLookup({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCountry, setActiveCountry] = useState('All');
  const [activeRowId, setActiveRowId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const tableRef = useRef(null);

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

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>NRO Lookup &amp; Map</h1>
        <p>
          Search Named Research Organizations with interactive map visualization.
          Data sourced from the Government of Canada, last updated{' '}
          {nroData.lastUpdated}.
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
