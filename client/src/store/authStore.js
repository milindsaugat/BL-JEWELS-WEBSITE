import { create } from 'zustand';
import { authService } from '../services/api';

const loadUserFromStorage = () => {
  try {
    const saved = localStorage.getItem('bl_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const loadWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem('bl_wishlist');
    return saved ? JSON.parse(saved) : ['prod_1', 'prod_3'];
  } catch {
    return ['prod_1', 'prod_3'];
  }
};

export const useAuthStore = create((set, get) => ({
  user: loadUserFromStorage(),
  token: localStorage.getItem('bl_access_token') || null,
  isAuthenticated: !!localStorage.getItem('bl_access_token'),
  wishlist: loadWishlistFromStorage(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login({ email, password });
      if (data.success) {
        localStorage.setItem('bl_access_token', data.accessToken);
        localStorage.setItem('bl_user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.accessToken,
          isAuthenticated: true,
          wishlist: data.user.wishlist || get().wishlist,
          isLoading: false,
        });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, message: data.message };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await authService.register(userData);
      if (data.success) {
        localStorage.setItem('bl_access_token', data.accessToken);
        localStorage.setItem('bl_user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, message: data.message };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('bl_access_token');
    localStorage.removeItem('bl_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  toggleWishlist: async (productId) => {
    const { wishlist } = get();
    const isPresent = wishlist.includes(productId);
    const updated = isPresent
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    localStorage.setItem('bl_wishlist', JSON.stringify(updated));
    set({ wishlist: updated });

    try {
      await authService.toggleWishlist(productId);
    } catch {
      // Local state kept
    }
  },

  isWishlisted: (productId) => {
    return get().wishlist.includes(productId);
  },
}));

