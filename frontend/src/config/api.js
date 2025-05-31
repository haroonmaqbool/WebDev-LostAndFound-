const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  status: '/',
  statusChecks: '/status',
};

export const createApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default API_BASE_URL; 