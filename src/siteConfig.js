// ---------------------------------------------------------------------------
// DEPLOYMENT CONFIGURATION
//
// These three values belong to whoever hosts this site. If you are taking
// this repository over, these are the only values you need to change — and
// you should change all three. Everything else in src/ is host-neutral.
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
export const ACCESSIBILITY_CONTACT = 'andrew@seawaydigital.ca';

/**
 * The site's canonical public URL, no trailing slash.
 *
 * Used for the <link rel="canonical"> and Open Graph tags in index.html.
 * Update this to the real hosting URL before going live, or search engines
 * and social previews will point at the previous host.
 */
export const SITE_URL = 'https://rs.rdmtoolkit.ca';

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
