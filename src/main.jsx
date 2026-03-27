import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UIShowcase from './components/UIShowcase.jsx'

// ?ui в URL → показать дизайн-систему
const showUI = new URLSearchParams(window.location.search).has('ui')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {showUI ? <UIShowcase /> : <App />}
  </StrictMode>,
)
