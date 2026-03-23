import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import axios from "axios"

// 🔥 IMPORTANT LINE (MISSING THA)
axios.defaults.withCredentials = true

export const serverUrl = "https://attendance-system-j9d3.onrender.com"

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
