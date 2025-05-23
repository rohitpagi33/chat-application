import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';  // Backend REST API
// Socket.IO will be used separately in components with 'http://localhost:8000'

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
