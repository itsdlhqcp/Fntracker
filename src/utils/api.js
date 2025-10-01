import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor to add idToken to Authorization header and other required headers
api.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem('idToken') || sessionStorage.getItem('idToken');
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    config.headers['api-interaction-id'] = 'hjh5hj5-khkh5-5jk5j';
    config.headers['x-session-id'] = 'hhjhjhfefeb';
    config.headers['lang'] = 'en';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional - for logging and error handling)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('idToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('tokenExpiry');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


