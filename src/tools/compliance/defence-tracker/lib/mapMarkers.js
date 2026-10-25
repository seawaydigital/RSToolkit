// The tracker's map markers: one per record that has coordinates, coloured by
// rating, with a popup that links to the record's permanent address.
import { escapeHtml } from '../../../../components/ui/map/escapeHtml.js';
import { dominantColor } from '../../../../components/ui/map/clusterColor.js';
import { NOT_RATED_LABEL, RATING_LABELS, RATING_ORDER } from './constants.js';

// Data identity, not the site palette, and never Blaze or green; the dark
// #061727 cluster count clears 4.5:1 on every fill (tests check all three).
// "Not yet rated" is drawn hollow, like its dashed badge, so rated
// institutions stand out from the many not rated yet.
export const RATING_MARKER_STYLES = {
  'very-high': { fillColor: '#ef4444' },
  high: { fillColor: '#f97316' },
  medium: { fillColor: '#a78bfa' },
  low: { fillColor: '#94a3b8' },
  unrated: { fillColor: '#f1f5f9', strokeColor: '#64748b' },
};

const CLUSTER_PRIORITY = [...RATING_ORDER].reverse().concat('unrated').map((r) => RATING_MARKER_STYLES[r].fillColor);

// A cluster takes the colour of the most common rating inside it, ties going
// to the higher rating.
export const ratingClusterColor = (colors) => dominantColor(colors, { priority: CLUSTER_PRIORITY });

export function buildTrackerMarkers(records) {
  return records
    .filter((r) => Number.isFinite(r.location?.lat) && Number.isFinite(r.location?.lng))
    .map((r) => {
      const rating = r.assessment?.rating ?? null;
      const style = RATING_MARKER_STYLES[rating ?? 'unrated'];
      return {
        id: r.id,
        lat: r.location.lat,
        lng: r.location.lng,
        fillColor: style.fillColor,
        strokeColor: style.strokeColor,
        popupHtml: [
          `<b>${escapeHtml(r.name)}</b>`,
          r.zh && escapeHtml(r.zh),
          rating ? `Rating: ${escapeHtml(RATING_LABELS[rating])}` : NOT_RATED_LABEL,
          `<a href="#defence-tracker/${escapeHtml(encodeURIComponent(r.id))}">Open profile</a>`,
        ].filter(Boolean).join('<br/>'),
      };
    });
}
