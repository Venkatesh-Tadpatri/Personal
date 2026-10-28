import axios from 'axios';

// Session (token + signed-in user) and the auth/admin API.
// Kept in sessionStorage so a refresh stays signed in but closing the app signs out.
const SESSION_KEY = 'ph_session';

export const getSession = () => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
};
export const saveSession = (session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

const API = axios.create({ baseURL: 'http://127.0.0.1:5000', timeout: 10000 });

API.interceptors.request.use((config) => {
  const s = getSession();
  if (s?.token) config.headers.Authorization = `Bearer ${s.token}`;
  return config;
});

// Errors carry the server's message and code (e.g. LICENSE_EXPIRED); network failures have no code
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const e = new Error(err.response?.data?.error || 'Could not reach the server — is it running?');
    e.code = err.response?.data?.code || (err.response ? null : 'NETWORK');
    e.status = err.response?.status;
    return Promise.reject(e);
  }
);

const data = (p) => p.then(r => r.data.data);

// Codes that mean the current session must end (shown on the login screen)
export const SESSION_END_CODES = ['LICENSE_EXPIRED', 'ACCOUNT_DISABLED', 'SESSION_EXPIRED', 'CLOCK_TAMPERED'];

export const login          = (username, password) => data(API.post('/api/auth/login', { username, password }));
export const logout         = () => API.post('/api/auth/logout').catch(() => {});
export const fetchMe        = () => data(API.get('/api/auth/me'));
export const changePassword = (currentPassword, newPassword) => API.post('/api/auth/change-password', { currentPassword, newPassword });
export const updateProfile  = (profile) => data(API.put('/api/auth/profile', profile));

export const listUsers      = () => data(API.get('/api/admin/users'));
export const createUser     = (user) => data(API.post('/api/admin/users', user));
export const setLicense     = (id, expires) => data(API.put(`/api/admin/users/${id}/license`, { expires }));
export const setUserActive  = (id, active) => data(API.put(`/api/admin/users/${id}/status`, { active }));
export const resetPassword  = (id, newPassword) => API.post(`/api/admin/users/${id}/reset-password`, { newPassword });
export const deleteUser     = (id) => API.delete(`/api/admin/users/${id}`);

// ── Licence date helpers (dates are local YYYY-MM-DD; expiry day is inclusive) ──
export const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDate = (s) => new Date(`${s}T00:00:00`);
export const todayStr  = () => toDateStr(new Date());

export const formatDate = (s) => s
  ? parseDate(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

// Last valid day of a licence of `amount` `unit`s starting on `start` (e.g. 1 month from 21 Oct → 20 Nov)
export const licenceEnd = (start, amount, unit) => {
  const d = parseDate(start);
  if (unit === 'days') {
    d.setDate(d.getDate() + amount - 1);
    return toDateStr(d);
  }
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + (unit === 'years' ? amount * 12 : amount));
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  // 21 Oct + 1 month → through 20 Nov; 31 Jan + 1 month → through the end of February
  d.setDate(day > lastDay ? lastDay : day - 1);
  return toDateStr(d);
};
