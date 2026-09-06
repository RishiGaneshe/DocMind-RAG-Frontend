import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted variable fonts — no third-party request on the critical path, and
// no layout shift from a late-arriving webfont (§15.3). Only the axes we use.
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'

import './styles/index.css'
import { App } from './App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('#root is missing from index.html — nothing can mount.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
