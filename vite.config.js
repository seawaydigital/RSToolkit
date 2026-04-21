import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path is selectable so the same repo can deploy to either a custom
// subdomain (served at /) or the old project-pages URL (served at /RSToolkit/).
//
//   BASE_PATH=/          → custom subdomain, e.g. rs.rdmtoolkit.ca       (default)
//   BASE_PATH=/RSToolkit/ → legacy seawaydigital.github.io/RSToolkit/
//
// Local dev uses '/' so assets load cleanly at http://localhost:5173/.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: !!process.env.PORT,
  },
})
