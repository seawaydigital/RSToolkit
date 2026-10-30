import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { dominantColor, FALLBACK_COLOR } from './clusterColor';

const WHITE = '#fff';

// Clustered circle markers for react-leaflet. Each marker is
// { id, lat, lng, fillColor, strokeColor?, popupHtml }. popupHtml is set as
// innerHTML, so the caller escapes every value in it (see escapeHtml.js).
// A cluster is drawn in the colour colorFor picks from its markers' fill
// colours (by default the most common one), with those markers' outline when
// it is not white. Pass colorFor and onMarkerClick as stable references: a new
// function on every render would rebuild every marker.
export default function MarkerCluster({ markers, onMarkerClick, colorFor = dominantColor, iconClassName = 'map-cluster-icon' }) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: (group) => {
        const childMarkers = group.getAllChildMarkers();
        const count = childMarkers.length;
        const colors = childMarkers.map((cm) => cm.options.fillColor || FALLBACK_COLOR);
        const dominant = colorFor(colors);
        const mixed = new Set(colors).size > 1;
        const outline = childMarkers.find((cm) => (cm.options.fillColor || FALLBACK_COLOR) === dominant)?.options.color ?? WHITE;
        const border = outline !== WHITE ? outline : mixed ? '#fff' : 'rgba(255,255,255,0.85)';

        // Size scales with count, capped
        const size = count < 10 ? 32 : count < 50 ? 38 : count < 150 ? 44 : 50;

        // Count text is dark on every fill: white measured 2.28:1 on NRO Lookup's
        // Iran green and 3.68:1 on its China blue, below the 4.5:1 WCAG 1.4.3
        // floor. Callers choose fills that clear 4.5:1 against #061727.
        return L.divIcon({
          html: `
            <div style="
              width:${size}px;
              height:${size}px;
              border-radius:50%;
              background:${dominant};
              border:3px solid ${border};
              box-shadow:0 0 0 2px ${dominant}55, 0 2px 6px rgba(0,0,0,0.4);
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
          className: iconClassName,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });
    markers.forEach((m) => {
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 8,
        fillColor: m.fillColor,
        color: m.strokeColor ?? WHITE,
        weight: 2,
        fillOpacity: 0.8,
      });
      marker.bindPopup(m.popupHtml);
      if (onMarkerClick) marker.on('click', () => onMarkerClick(m.id));
      cluster.addLayer(marker);
    });
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [map, markers, onMarkerClick, colorFor, iconClassName]);

  return null;
}
