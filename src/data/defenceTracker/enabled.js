// Whether the Defence Institution Tracker is switched on: ENABLE_DEFENCE_TRACKER
// in src/siteConfig.js, `npm run dev:tracker` for a local preview, or
// VITE_ENABLE_DEFENCE_TRACKER=true for one build. vite.config.js compiles the
// answer in as the literal __TRACKER_ENABLED__, so with the flag off the
// tracker's code and data are left out of the build. Browser-only: plain Node
// has no __TRACKER_ENABLED__.
export const TRACKER_ENABLED = __TRACKER_ENABLED__;
