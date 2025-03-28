import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './public/styles.css'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SettingsProvider>

)