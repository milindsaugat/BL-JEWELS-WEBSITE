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
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bl_admin_token') || localStorage.getItem('bl_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }).then(res => res.data),
  createProduct: (data) => api.post('/products', data).then(res => res.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(res => res.data),
};

export const bannerService = {
  getBanners: () => api.get('/banners').then(res => res.data),
  getAllBanners: () => api.get('/banners/all').catch(() => api.get('/banners')).then(res => res.data),
  createBanner: (data) => api.post('/banners', data).then(res => res.data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data).then(res => res.data),
  deleteBanner: (id) => api.delete(`/banners/${id}`).then(res => res.data),
};

export const orderService = {
  getAllOrders: () => api.get('/orders').then(res => res.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  updateStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData).then(res => res.data),
};

export const couponService = {
  getCoupons: () => api.get('/coupons').then(res => res.data),
  createCoupon: (data) => api.post('/coupons', data).then(res => res.data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data).then(res => res.data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`).then(res => res.data),
};

export const categoryService = {
  getCategories: () => api.get('/categories').then(res => res.data),
  createCategory: (data) => api.post('/categories', data).then(res => res.data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then(res => res.data),
};

export const occasionService = {
  getOccasions: () => api.get('/occasions').then(res => res.data),
  getAllOccasions: () => api.get('/occasions/all').catch(() => api.get('/occasions')).then(res => res.data),
  createOccasion: (data) => api.post('/occasions', data).then(res => res.data),
  updateOccasion: (id, data) => api.put(`/occasions/${id}`, data).then(res => res.data),
  deleteOccasion: (id) => api.delete(`/occasions/${id}`).then(res => res.data),
};

export const settingService = {
  getSettings: () => api.get('/settings').then(res => res.data),
  updateSettings: (data) => api.put('/settings', data).then(res => res.data),
};

export const reviewService = {
  getReviews: () => api.get('/reviews').then(res => res.data),
  getAllReviews: () => api.get('/reviews/all').catch(() => api.get('/reviews')).then(res => res.data),
  createReview: (data) => api.post('/reviews', data).then(res => res.data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data).then(res => res.data),
  deleteReview: (id) => api.delete(`/reviews/${id}`).then(res => res.data),
};

export const aiService = {
  generateDescription: (details) => api.post('/ai/generate-description', details).then(res => res.data),
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
