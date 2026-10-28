import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerCluster from '../../../components/ui/map/MarkerCluster';
import { activeTileProvider } from '../../../data/mapTiles';
import { NOT_RATED_LABEL, RATING_LABELS, RATING_ORDER } from './lib/constants';
import { RATING_MARKER_STYLES, buildTrackerMarkers, ratingClusterColor } from './lib/mapMarkers';

const LEGEND = [...RATING_ORDER].reverse().map((r) => [r, RATING_LABELS[r]]).concat([['unrated', NOT_RATED_LABEL]]);

// The search results on a map, coloured by rating. The list stays the default
// and the accessible alternative. The map never moves to fit the results:
// the tiles it would then fetch would tell the basemap provider where the
// results are. It opens on NRO Lookup's fixed view, so only the reader's own
// panning and zooming decide which tiles are requested.
export default function TrackerMap({ records }) {
  const markers = useMemo(() => buildTrackerMarkers(records), [records]);
  const unmapped = records.length - markers.length;

  return (
    <div className="dit-map-view">
      <p className="dit-map-note">
        {markers.length.toLocaleString()} of {records.length.toLocaleString()} shown on the map
        {unmapped > 0 ? `; ${unmapped.toLocaleString()} have no location recorded yet` : ''}. The list view shows every match and
        works with a keyboard and screen reader.
      </p>
      <div className="dit-map">
        <MapContainer center={[35, 80]} zoom={3} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution={activeTileProvider.attribution}
            url={activeTileProvider.url}
            subdomains={activeTileProvider.subdomains ?? 'abc'}
            maxZoom={activeTileProvider.maxZoom}
          />
          <MarkerCluster markers={markers} colorFor={ratingClusterColor} iconClassName="dit-cluster-icon" />
        </MapContainer>
      </div>
      <ul className="dit-map-legend" aria-label="Map key">
        {LEGEND.map(([rating, label]) => {
          const { fillColor, strokeColor } = RATING_MARKER_STYLES[rating];
          return (
            <li key={rating}>
              <span className="dit-map-swatch" style={{ background: fillColor, borderColor: strokeColor ?? '#fff' }} aria-hidden="true" />
              {label}
            </li>
          );
        })}
      </ul>
      <p className="dit-map-note">
        A cluster takes the colour of the most common rating inside it. Zoom in, or open a marker, to see each institution.
      </p>
    </div>
  );
}
