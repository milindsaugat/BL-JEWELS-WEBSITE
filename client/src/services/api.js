import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const productService = {
  getProducts: (params) => api.get('/products', { params }).then(res => res.data),
  getFeatured: () => api.get('/products/featured').then(res => res.data),
  getNewArrivals: () => api.get('/products/new-arrivals').then(res => res.data),
  getProductBySlug: (slug) => api.get(`/products/${slug}`).then(res => res.data),
  createProduct: (data) => api.post('/products', data).then(res => res.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(res => res.data),
};

export const categoryService = {
  getCategories: () => api.get('/categories').then(res => res.data),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`).then(res => res.data),
};

export const occasionService = {
  getOccasions: () => api.get('/occasions').then(res => res.data),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  toggleWishlist: (productId) => api.post('/auth/wishlist/toggle', { productId }).then(res => res.data),
};

export const orderService = {
  createOrder: (orderData) => api.post('/orders/create', orderData).then(res => res.data),
  getMyOrders: () => api.get('/orders/my').then(res => res.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  getAllOrders: () => api.get('/orders').then(res => res.data),
  updateStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData).then(res => res.data),
};

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payments/create-order', data).then(res => res.data),
  verifyPayment: (data) => api.post('/payments/verify', data).then(res => res.data),
  validateCoupon: (data) => api.post('/payments/validate-coupon', data).then(res => res.data),
};

export const bannerService = {
  getBanners: () => api.get('/banners').then(res => res.data),
  getAllBanners: () => api.get('/banners/all').then(res => res.data),
  createBanner: (data) => api.post('/banners', data).then(res => res.data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data).then(res => res.data),
  deleteBanner: (id) => api.delete(`/banners/${id}`).then(res => res.data),
};

export const rateService = {
  getLiveRates: () => api.get('/rates/live').then(res => res.data),
};

export const reviewService = {
  getFeaturedReviews: () => api.get('/reviews').then(res => res.data),
  getProductReviews: (productId) => api.get(`/reviews/${productId}`).then(res => res.data),
  addReview: (productId, data) => api.post(`/reviews/${productId}`, data).then(res => res.data),
};

export const settingService = {
  getSettings: () => api.get('/settings').then(res => res.data),
  updateSettings: (data) => api.put('/settings', data).then(res => res.data),
};

export const aiService = {
  chat: (messages, context) => api.post('/ai/chat', { messages, context }).then(res => res.data),
  searchSuggest: (query) => api.post('/ai/search-suggest', { query }).then(res => res.data),
  generateDescription: (details) => api.post('/ai/generate-description', details).then(res => res.data),
};

