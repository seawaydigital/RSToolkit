import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AssessmentProvider from './state/AssessmentProvider.jsx'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/geist'
import '@fontsource/jetbrains-mono/400.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AssessmentProvider><App /></AssessmentProvider>
  </StrictMode>,
)
