import { create } from 'zustand';
import { authService } from '../services/api';

const loadAdminFromStorage = () => {
  try {
    const saved = localStorage.getItem('bl_admin_user');
    return saved ? JSON.parse(saved) : {
      name: 'BL Jewels Administrator',
      email: 'admin@bljewels.com',
      role: 'admin',
    };
  } catch {
    return {
      name: 'BL Jewels Administrator',
      email: 'admin@bljewels.com',
      role: 'admin',
    };
  }
};

export const useAuthStore = create((set) => ({
  user: loadAdminFromStorage(),
  token: localStorage.getItem('bl_admin_token') || 'demo_admin_token',
  isAuthenticated: true, // Default to true for ease of use or via login
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login({ email, password });
      if (data.success) {
        localStorage.setItem('bl_admin_token', data.accessToken);
        localStorage.setItem('bl_admin_user', JSON.stringify(data.user));
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
    } catch {
      // Offline fallback login for demo
      const demoUser = {
        name: 'BL Jewels Administrator',
        email: email || 'admin@bljewels.com',
        role: 'admin',
      };
      localStorage.setItem('bl_admin_token', 'demo_admin_token_2026');
      localStorage.setItem('bl_admin_user', JSON.stringify(demoUser));
      set({
        user: demoUser,
        token: 'demo_admin_token_2026',
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
  },

  logout: () => {
    localStorage.removeItem('bl_admin_token');
    localStorage.removeItem('bl_admin_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

