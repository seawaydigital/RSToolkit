import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are self-hosted from npm (bundled into dist/assets) rather than loaded
// from Google Fonts, so no visitor's IP address is sent to a third party just
// for opening the site. Imported before App so global.css can use the families.
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/inter/wght-italic.css'
import '@fontsource-variable/archivo/wght.css'
import '@fontsource-variable/archivo/wght-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
