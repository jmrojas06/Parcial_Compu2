import axios from 'axios';

// Instancia central de axios apuntando al backend (puerto 8080)
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

// Interceptor de REQUEST: adjunta el token JWT en cada petición
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de RESPONSE: extrae .data automáticamente
// Así las funciones del API devuelven directo los datos, sin necesidad de response.data
axiosInstance.interceptors.response.use((response) => response.data);

export default axiosInstance;
