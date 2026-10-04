import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { SITE_URL } from './src/siteConfig.js'

// The canonical and Open Graph URLs in index.html are written as %SITE_URL%
// and filled in here, so the hosting domain is set in exactly one place:
// SITE_URL in src/siteConfig.js. A SITE_URL environment variable overrides it
// for one-off builds (e.g. a staging host) without editing the file.
function siteUrlPlugin() {
  const raw = process.env.SITE_URL || SITE_URL
  const url = String(raw).replace(/\/+$/, '')
  if (!/^https:\/\/[^/\s"'<>]+(\/[^\s"'<>]*)?$/.test(url)) {
    throw new Error(`SITE_URL must be an absolute https:// URL, got: ${JSON.stringify(raw)}`)
  }
  return {
    name: 'site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_URL%', url),
    },
  }
}

// Base path is selectable so the same build works at a domain root or under
// a subdirectory. It rewrites every asset URL in the output.
//
//   BASE_PATH=/                     → domain or subdomain root        (default)
//   BASE_PATH=/research-security/   → served from a subdirectory
//
// Include both the leading and trailing slash. Local dev uses '/' so assets
// load cleanly at http://localhost:5173/. See HANDOFF.md for deployment.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteUrlPlugin()],
  base: process.env.BASE_PATH || '/',
  build: {
    // Never inline font files as data: URIs. Vite inlines any asset under
    // 4 KB by default, which catches the smallest @fontsource subsets — and
    // the CSP's font-src is 'self' only, so an inlined font would be blocked.
    // Emitting them as files keeps font-src tight. Other small assets (the
    // Leaflet marker PNGs) still inline, which img-src data: allows.
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined),
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: !!process.env.PORT,
  },
})
