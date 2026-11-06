import { createSharedRead } from './sharedRead';
import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://server-orpin-three-43.vercel.app/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bl_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

const shareRead = createSharedRead();
const readPublic = (path, ttl = 0) => {
  const token = localStorage.getItem('bl_access_token') || '';
  return shareRead(path + ':' + token, () => api.get(path, { timeout: 15000 }).then(res => res.data), ttl);
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }).then(res => res.data),
  getFeatured: () => readPublic('/products/featured'),
  getNewArrivals: () => readPublic('/products/new-arrivals'),
  getProductBySlug: (slug) => readPublic(`/products/${encodeURIComponent(slug)}`),
  getProductsByIds: (ids) => ids.length ? readPublic(`/products/by-ids?ids=${ids.join(',')}`) : Promise.resolve({ products: [] }),
  createProduct: (data) => api.post('/products', data).then(res => res.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(res => res.data),
};

export const categoryService = {
  getCategories: () => readPublic('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`).then(res => res.data),
};

export const occasionService = {
  getOccasions: () => readPublic('/occasions'),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  toggleWishlist: (productId) => api.post('/auth/wishlist/toggle', { productId }).then(res => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(res => res.data),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }).then(res => res.data),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }).then(res => res.data),
};

export const orderService = {
  createOrder: (orderData) => api.post('/orders/create', orderData).then(res => res.data),
  getMyOrders: () => api.get('/orders/my').then(res => res.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  getAllOrders: () => api.get('/orders').then(res => res.data),
  updateStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData).then(res => res.data),
};

export const couponService = {
  getCoupons: () => api.get('/coupons').then(res => res.data),
  createCoupon: (data) => api.post('/coupons', data).then(res => res.data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data).then(res => res.data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`).then(res => res.data),
};

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payments/create-order', data).then(res => res.data),
  verifyPayment: (data) => api.post('/payments/verify', data).then(res => res.data),
  validateCoupon: (data) => api.post('/payments/validate-coupon', data).then(res => res.data),
};

export const bannerService = {
  getBanners: () => readPublic('/banners'),
  getAllBanners: () => api.get('/banners/all').then(res => res.data),
  createBanner: (data) => api.post('/banners', data).then(res => res.data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data).then(res => res.data),
  deleteBanner: (id) => api.delete(`/banners/${id}`).then(res => res.data),
};

export const rateService = {
  getLiveRates: () => readPublic('/rates/live', 20000),
};

export const reviewService = {
  getFeaturedReviews: () => readPublic('/reviews'),
  getProductReviews: (productId) => api.get(`/reviews/${productId}`).then(res => res.data),
  addReview: (productId, data) => api.post(`/reviews/${productId}`, data).then(res => res.data),
};

export const settingService = {
  getSettings: () => readPublic('/settings'),
  updateSettings: (data) => api.put('/settings', data).then(res => res.data),
};

export const aiService = {
  chat: (messages, context) => api.post('/ai/chat', { messages, context }).then(res => res.data),
  searchSuggest: (query) => api.post('/ai/search-suggest', { query }).then(res => res.data),
  generateDescription: (details) => api.post('/ai/generate-description', details).then(res => res.data),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }).then(res => res.data),
  getUserStats: () => api.get('/users/stats').then(res => res.data),
  getUserById: (id) => api.get(`/users/${id}`).then(res => res.data),
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }).then(res => res.data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then(res => res.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then(res => res.data),
};

export const uploadService = {
  uploadImage: (file, folder = 'bl-jewels/uploads') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
  uploadMultiple: (files, folder = 'bl-jewels/products') => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    formData.append('folder', folder);
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
  deleteAsset: (publicId, url) => api.delete('/upload/asset', { data: { publicId, url } }).then(res => res.data),
};

