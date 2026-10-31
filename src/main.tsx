import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/vendor/98.css'
import './styles/os.css'
import './styles/apps.css'
import './styles/web.css'
import './apps/registry'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
