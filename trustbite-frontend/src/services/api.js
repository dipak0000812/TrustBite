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


// Handle global auth failures
api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem('trustbite_token');
      localStorage.removeItem('trustbite_user');

      // avoid infinite redirects
      if (
        !window.location.pathname.includes('/login')
      ) {
        toast.error('Session expired. Please login again.');
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;