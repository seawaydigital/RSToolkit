// ---------------------------------------------------------------------------
// DEPLOYMENT CONFIGURATION
//
// These values belong to whoever hosts this site. If you are taking this
// repository over, these are the only values you need to change — review
// every one. Everything else in src/ is host-neutral.
//
// See HANDOFF.md for the full deployment guide.
// ---------------------------------------------------------------------------

/**
 * Where accessibility barrier reports and alternate-format requests go.
 *
 * AODA's Information and Communications standard expects a public-facing
 * Ontario site to provide a feedback process and accessible formats on
 * request. This address is what the footer offers users, so it MUST be an
 * address the hosting organization actively monitors. It is not decorative.
 */
export const ACCESSIBILITY_CONTACT = 'security.research@lakeheadu.ca';

/**
 * The hosting institution's research security contact.
 *
 * Report a Concern tells researchers to start with their own institution for
 * almost every scenario, and the travel emergency block tells them to report
 * back to it — this is who that is. Shown by name, so keep it current when
 * the role changes hands. The email should be a monitored office inbox, not a
 * personal address, so it survives staff turnover.
 */
export const INSTITUTION_RS_CONTACT = {
  institution: 'Lakehead University',
  name: 'Andrew Austin',
  title: 'Research Security and Data Management Specialist',
  email: 'security.research@lakeheadu.ca',
};

/**
 * The site's canonical public URL, no trailing slash.
 *
 * Filled into the <link rel="canonical"> and Open Graph tags in index.html at
 * build time (vite.config.js replaces %SITE_URL%), so this is the only place
 * the domain needs changing. Must be https://. A SITE_URL environment
 * variable overrides it for a single build.
 */
export const SITE_URL = 'https://rs.rdmtoolkit.ca';

/**
 * Who serves the site's files, named on the "How This Site Works" page.
 *
 * That page promises a COMPLETE list of every party that sees a request from
 * the site, so this must name the real host — and any proxy/CDN in front of
 * it (e.g. 'Cloudflare, which forwards them to Lakehead University web
 * servers'). A privacy page naming the wrong host is a false statement.
 */
export const WEB_HOST = 'GitHub Pages';

/**
 * Whether the NRO map's "Check proximity to NROs" panel is shown.
 *
 * It is the ONLY feature that sends something a user types off the device:
 * the institution name goes to OpenStreetMap's Nominatim geocoder and, if
 * that finds nothing, to the Wikipedia API. Set to false if your institution
 * does not want any user input leaving the browser; the panel and its row on
 * the How This Site Works page disappear together. If you do, also remove
 * the two geocoder hosts from connect-src in index.html (and the header CSP)
 * so the policy allows nothing the site does not use.
 */
export const ENABLE_PROXIMITY_SEARCH = true;

/**
 * Whether to show the RDM Toolkit sister-site card at the bottom of the
 * sidebar.
 *
 * This links to rdmtoolkit.ca, a separate project by the original author.
 * It is a peer-brand affordance, not an advertisement — but a new host may
 * reasonably not want to link off-site from their own domain. Set to false
 * to remove the card entirely; no other change is needed.
 */
export const SHOW_SISTER_SITE_CARD = true;
