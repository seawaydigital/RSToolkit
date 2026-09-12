export const securityHeaders = {
 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tile.openstreetmap.org; font-src 'self'; connect-src 'self' https://en.wikipedia.org; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
 'X-Content-Type-Options': 'nosniff',
 'Referrer-Policy': 'no-referrer',
 'X-Frame-Options': 'DENY',
 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
