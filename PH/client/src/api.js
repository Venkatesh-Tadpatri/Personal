import axios from 'axios';

// In development React uses proxy (client/package.json -> "proxy": "http://localhost:5000")
// In production Electron loads the built React app and talks directly to server on 5000
const BASE = 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — log in dev
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error — is the server running?';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

// ─── SELLERS ────────────────────────────────────────────────
export const getSellers = (date) =>
  api.get('/api/sellers', { params: date ? { date } : {} });

export const getSeller = (id) => api.get(`/api/sellers/${id}`);

export const createSeller = (data) => api.post('/api/sellers', data);

export const updateSeller = (id, data) => api.put(`/api/sellers/${id}`, data);

export const deleteSeller = (id) => api.delete(`/api/sellers/${id}`);

// ─── BUYERS ─────────────────────────────────────────────────
export const getBuyers = (date) =>
  api.get('/api/buyers', { params: date ? { date } : {} });

export const getBuyer = (id) => api.get(`/api/buyers/${id}`);

export const createBuyer = (data) => api.post('/api/buyers', data);

export const updateBuyer = (id, data) => api.put(`/api/buyers/${id}`, data);

export const deleteBuyer = (id) => api.delete(`/api/buyers/${id}`);

// ─── SUMMARY ────────────────────────────────────────────────
export const getSummary = (date) =>
  api.get('/api/summary', { params: date ? { date } : {} });

export default api;
