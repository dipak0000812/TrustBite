import axios from 'axios';
import toast from 'react-hot-toast';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:8000';
  // Return origin only, no trailing slash
  return envUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('trustbite_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// Handle global failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Session Expiry (401)
    // IMPORTANT: Only treat a 401 as session expiry if the user actually
    // had a stored token. A 401 on /login or /register (no token) is
    // expected and must NOT redirect or clear storage — doing so would
    // nuke a freshly-saved token before onboarding can use it.
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('trustbite_token');
      if (hadToken) {
        localStorage.removeItem('trustbite_token');
        localStorage.removeItem('trustbite_user');
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please sign in again.');
          window.location.replace('/login');
        }
      }
      // If no token was stored, this is a pre-auth 401 (e.g. failed login
      // attempt before registration). Propagate the error normally.
    }
    // 2. Network Errors (No response)
    else if (!error.response) {
      toast.error('Network error. Check your connection.');
    }
    // 3. Server Errors (500+)
    else if (error.response.status >= 500) {
      toast.error('Server error. Our team is looking into it.');
    }
    // 4. Rate Limiting (429)
    else if (error.response.status === 429) {
      toast.error('Too many requests. Please slow down.');
    }

    return Promise.reject(error);
  }
);

export default api;