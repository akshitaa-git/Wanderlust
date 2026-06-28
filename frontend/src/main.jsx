import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn("Wanderlust Warning: VITE_GOOGLE_CLIENT_ID is not configured in your frontend/.env file.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || "missing-google-client-id"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
