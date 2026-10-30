// Whether the screening tools are in this build. Browser code only: Vite's
// define (vite.config.js) compiles ENABLE_SANCTIONS_SCREENING from
// siteConfig.js in as the literal __SCREENING_ENABLED__, so with the flag off
// the bundler drops both tools. Node scripts and tests have no
// __SCREENING_ENABLED__.
export const SCREENING_ENABLED = __SCREENING_ENABLED__;
