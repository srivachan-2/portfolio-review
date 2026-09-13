import axios from 'axios';

// XAMPP: your PHP API lives at http://localhost/portfolio-review/api
// Adjust this if you put the project folder under a different name.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost/portfolio-review/api';
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const register = (payload) => api.post('/auth/register', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const getMe = () => api.get('/auth/me');

// --- Portfolios ---
export const listPortfolios = (params) => api.get('/portfolios', { params });
export const getPortfolio = (id) => api.get(`/portfolios/${id}`);
export const createPortfolio = (payload) => api.post('/portfolios', payload);
export const updatePortfolio = (id, payload) => api.put(`/portfolios/${id}`, payload);
export const deletePortfolio = (id) => api.delete(`/portfolios/${id}`);
export const getMyPortfolios = () => api.get('/my/portfolios');
export const getUserPortfolios = (userId) => api.get(`/users/${userId}/portfolios`);

// --- Reviews ---
export const getPortfolioReviewHistory = (portfolioId) => api.get(`/portfolios/${portfolioId}/reviews`);
export const submitReview = (portfolioId, payload) => api.post(`/portfolios/${portfolioId}/reviews`, payload);
export const requestAIReview = (portfolioId) => api.post(`/portfolios/${portfolioId}/ai-review`);
export const updateReview = (reviewId, payload) => api.put(`/reviews/${reviewId}`, payload);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
export const getMyReviews = () => api.get('/my/reviews');

export default api;
export const getAdminUsers = () => {
  return api.get('/admin/users');
};

export const updateUserRole = (userId, role) => {
  return api.put(`/admin/users/${userId}/role`, {
    role
  });
};