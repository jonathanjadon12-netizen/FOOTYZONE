import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import { AppProvider } from './contexts/AppContext.jsx'
import './index.css'

// Setup global Axios base URL and interceptors for automated session expiration checks
let API_URL = import.meta.env.VITE_API_BASE_URL || '';
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}
axios.defaults.baseURL = API_URL;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if the 401 happened during a login or signup request itself
      const isAuthRequest = error.config && (error.config.url.includes('/api/auth/login') || error.config.url.includes('/api/auth/signup'));
      if (!isAuthRequest) {
        localStorage.removeItem('zone_token');
        localStorage.removeItem('zone_user');
        localStorage.removeItem('zone_active_profile');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
