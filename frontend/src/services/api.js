import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL1 || "http://localhost:7000/api",
//   timeout: 15000,
// });
const api = axios.create({
  baseURL: "https://contactmanagementhub.onrender.com/api",
  timeout: 15000,
});
// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Attach admin secret for admin routes
  const adminSecret = sessionStorage.getItem('cms_admin_secret');
  if (adminSecret) config.headers['x-admin-secret'] = adminSecret;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Contacts ─────────────────────────────────────────────────────────────
export const contactAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  toggleFavorite: (id) => api.patch(`/contacts/${id}/favorite`),
  getStats: () => api.get('/contacts/stats'),
};

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/sys-panel/stats'),
  getUsers: (params) => api.get('/sys-panel/users', { params }),
  getUserDetails: (id) => api.get(`/sys-panel/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/sys-panel/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/sys-panel/users/${id}`),
};

export default api;
