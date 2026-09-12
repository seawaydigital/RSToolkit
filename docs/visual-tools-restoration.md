# RC2 visual tools and geographic context

The owner approved restoration on 12 September 2026 after reviewing the RC1 removal. This is an amendment to the original launch scope. No geographic risk score, affiliation inference, automatic campus choice or legacy coordinate validation is introduced.

## Flowcharts

All three diagrams use the same reviewed policy nodes and labelled branches as Guided Mode and Text View. Dagre arranges the graph; it does not choose answers. Native step buttons expose full explanations, sources and outgoing choices. Distinct choices sharing a destination retain separate arrows. Diagram exploration leaves guided answers unchanged. Full View prints the complete text reference rather than a clipped viewport.

## Location evidence and limits

The new snapshot contains **55 points for 54 of 103 official NRO entries**. The remaining **49 are searchable but unmapped and excluded from distances**. The map's coverage message follows the current name/country filters. An absence of nearby results cannot clear a collaboration.

Official-list identity and aliases remain in nroData.js. Location evidence is a separate dataset, not a government list of NRO buildings. Entity associations were selected using official names/aliases, source labels and country checks. Coordinates were then copied from Earth-coordinate statements in cited Wikidata revisions or linked Wikipedia revisions; duplicates and invalid coordinates were excluded. The 48th Central Scientific Research Institute uses its official listed alias for the cited Sergiyev Posad institute; that point does not represent all of its sites. Locations describe source-reported organization points, not independently verified building boundaries, all campuses, present occupancy or ownership. Neither geocoding nor a matching country proves identity.

Every point retains an organization ID, source/revision URL, source label, scope and retrieval-review date. docs/evidence/nro-location-matches.json records selected associations; nro-locations-review-2026-09-12.json records exclusions and retrieval hashes. src/data/nroLocations.json is the reviewed publication snapshot. The 12 October 2026 review deadline disables pins and distance comparisons when overdue; source references remain available.

Distances are spherical great-circle distances between selected source points, rounded to kilometres (under 1 km is labelled as such). They are approximate straight-line context, not travel distances, building separation or a relationship assessment. The user must inspect and confirm a campus point before comparison. Closest results cover only currently filtered, mapped sites; other campuses or unmapped organizations may be closer.

## Requests and rendering

- Default overview: bundled Natural Earth 1:110m country outlines and the bundled location snapshot. No tile/geocoder request. Country detail is intentionally coarse; close zoom without street detail shows pins on a plain land background.
- Manual campus coordinates: processed locally, explicitly confirmed, never persisted or added to URLs.
- Optional place search: explicit opt-in and submit to en.wikipedia.org, credentials omitted and no referrer. Only a public institution/campus name is appropriate. Response coordinates and article IDs are validated, source URLs are constructed from fixed hosts, results require selection and confirmation. No query-on-keystroke, fallback provider or remote result HTML.
- Optional street detail: separate opt-in to tile.openstreetmap.org. Browser image requests send the site origin as the referrer required by the provider; no query or worksheet text is appended. Disabling stops new requests; a failed tile automatically disables the layer. Browser caching is retained; no bulk/prefetch/offline downloader is used.
- Consents and comparison/search state live in component memory and reset on reload or leaving the tool. Requests already sent cannot be recalled. Revoking search consent aborts/discards pending results. No analytics, location tracking or remote fonts.
- Popups and tooltips use DOM textContent; only static, developer-authored attribution markup reaches Leaflet's HTML attribution API.

The CSP admits only those two external origins for their required resource types. Unknown services remain blocked. The chosen production host must apply the supplied headers. Provider policies: [OSM tiles](https://operations.osmfoundation.org/policies/tiles/), [MediaWiki API etiquette](https://www.mediawiki.org/wiki/API:Etiquette). Runtime dependencies and map-data attribution are in generated THIRD_PARTY_NOTICES.txt.

## Verification and maintenance

visual-tools.test.js checks graph parity, all unknown branches, shared destinations, geographic edge cases, malformed responses and source integrity. visual-tools.spec.js exercises native keyboard selection, memory-only comparison, inert markup, opt-ins, pending-request revocation, provider failure, expiry and mobile alternatives across three browser engines. Tile tests use fixtures, not automated live OSM downloads. Real-host/provider checks remain part of the owner's release walkthrough.

The map's spatial pins can overlap; equivalent text-source controls supply the same information and a way to focus the site. The narrow-screen accessibility check tests those large controls and all marker rules except target size, as documented in ACCESSIBILITY.md. Prints include all location sources in the current filtered view and the comparison point; they do not imply a complete inventory of sites.

To refresh, review official identities first, then update the association file and run scripts/prepare-map-snapshot.js. It writes candidates under artifacts only. Inspect every changed point against its cited revision and intended campus, record exclusions and uncertainty, and publish to src/data only after review. Do not extend deadlines solely on a successful fetch or guess coordinates for missing records. review-map-locations.js provides candidate search evidence, not automatic matching. Natural Earth provenance is in docs/evidence/map-basemap.json; retain only geometry and the country name when updating the local overview.
