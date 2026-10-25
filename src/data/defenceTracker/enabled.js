// The tracker's on/off switch: ENABLE_DEFENCE_TRACKER in src/siteConfig.js,
// or VITE_ENABLE_DEFENCE_TRACKER=true for a local preview. import.meta.env
// exists only under Vite, hence the optional chaining.
import { ENABLE_DEFENCE_TRACKER } from '../../siteConfig';

export const TRACKER_ENABLED = ENABLE_DEFENCE_TRACKER || import.meta.env?.VITE_ENABLE_DEFENCE_TRACKER === 'true';
