import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: !!process.env.PORT,
  },
})
