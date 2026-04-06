import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 15000,
});

// Attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bikeservice_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bikeservice_token');
      localStorage.removeItem('bikeservice_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
