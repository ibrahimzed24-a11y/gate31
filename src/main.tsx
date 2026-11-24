import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getEngine } from './audio/AudioEngine'
import { useStore } from './state/store'
import './styles.css'

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__g31 = { getEngine, useStore }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('./sw.js') })
}
