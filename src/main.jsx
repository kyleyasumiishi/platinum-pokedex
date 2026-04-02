/**
 * main.jsx — Entry point. Mounts the React app into the #root div in index.html.
 *
 * StrictMode is a development-only wrapper that intentionally double-invokes
 * certain functions to help you catch bugs. It has no effect in production.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
