// Leaflet's bindPopup(string) sets innerHTML, so every value interpolated into
// a popup must be escaped. On NRO Lookup the institution label comes straight
// from a Nominatim display_name or a Wikipedia title — third-party data that
// anyone can edit upstream — and the NRO and tracker popups are escaped too so
// every map follows one rule.
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
