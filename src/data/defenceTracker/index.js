// Builds the tracker dataset in the browser. Imported only by the tracker's
// own lazily loaded chunk, so the rest of the site never downloads the data.
import nroData from '../nroData';
import meta from './meta.json';
import changelog from './changelog.json';
import { buildDataset } from '../../tools/compliance/defence-tracker/lib/dataset';
import { buildMatchIndex } from '../../tools/compliance/defence-tracker/lib/matcher';

const institutionFiles = import.meta.glob('./institutions/*.json', { eager: true, import: 'default' });
const listingFiles = import.meta.glob('./listings/*.json', { eager: true, import: 'default' });

let cache = null;

export function getTrackerData() {
  if (!cache) {
    const snapshots = Object.fromEntries(Object.values(listingFiles).map((s) => [s.snapshot, s]));
    const dataset = buildDataset({ institutions: Object.values(institutionFiles), snapshots, nroData, meta });
    cache = { dataset, index: buildMatchIndex(dataset.records), changelog };
  }
  return cache;
}
