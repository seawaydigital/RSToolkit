import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { SITE_URL, ENABLE_DEFENCE_TRACKER } from './src/siteConfig.js'

// The Defence Institution Tracker's launch flag, compiled in as a literal so
// that with the flag off the bundler drops the tracker's code and data
// entirely. It is on when ENABLE_DEFENCE_TRACKER is true in siteConfig.js, in
// the "tracker" mode (npm run dev:tracker, a local preview), or when
// VITE_ENABLE_DEFENCE_TRACKER=true is set for one build.
const trackerEnabled = (mode) =>
  ENABLE_DEFENCE_TRACKER || mode === 'tracker' || process.env.VITE_ENABLE_DEFENCE_TRACKER === 'true'

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

// With the tracker switched on, publishes its open dataset at stable URLs
// (data/defence-tracker.json and .csv) for scripts and other tools. Built
// from the same loader and formatting code the page uses.
function trackerDataPlugin(enabled) {
  return {
    name: 'defence-tracker-data',
    apply: 'build',
    async generateBundle() {
      if (!enabled) return
      const load = (file) => import(new URL(file, import.meta.url).href)
      const { loadDataset } = await load('./scripts/tracker/lib/loadData.mjs')
      const { datasetToCsv, datasetToExport } = await load('./src/tools/compliance/defence-tracker/lib/recordText.js')
      const dataset = await loadDataset()
      this.emitFile({ type: 'asset', fileName: 'data/defence-tracker.json', source: `${JSON.stringify(datasetToExport(dataset), null, 2)}\n` })
      this.emitFile({ type: 'asset', fileName: 'data/defence-tracker.csv', source: `﻿${datasetToCsv(dataset)}` })
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
export default defineConfig(({ mode }) => ({
  plugins: [react(), siteUrlPlugin(), trackerDataPlugin(trackerEnabled(mode))],
  base: process.env.BASE_PATH || '/',
  define: {
    __TRACKER_ENABLED__: JSON.stringify(trackerEnabled(mode)),
  },
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
}))
