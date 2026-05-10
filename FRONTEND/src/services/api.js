import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apis.canadacentral.cloudapp.azure.com/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratar erros globalmente (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
