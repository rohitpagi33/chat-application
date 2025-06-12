import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${API_BASE}/api`;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');  // JWT token stored after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
