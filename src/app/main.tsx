import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initInstall } from '@/features/install-app'
import { initUpdates } from '@/features/update-app'
import { App } from './app'
import './styles/index.css'

initInstall()
initUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
