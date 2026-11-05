import { create } from 'zustand';
import { authService } from '../services/api';

const loadSession = () => {
  try {
    const token = localStorage.getItem('bl_admin_token');
    const user = JSON.parse(localStorage.getItem('bl_admin_user') || 'null');
    if (!token || token.startsWith('demo_admin_token') || user?.role !== 'admin') return null;
    return { token, user };
  } catch { return null; }
};
const session = loadSession();
const clearSession = () => {
  localStorage.removeItem('bl_admin_token');
  localStorage.removeItem('bl_admin_user');
};

export const useAuthStore = create((set) => ({
  user: session?.user ?? null,
  token: session?.token ?? null,
  isAuthenticated: Boolean(session),
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login({ email, password });
      if (!data.success || !data.accessToken || data.accessToken.startsWith('demo_admin_token') || data.user?.role !== 'admin') {
        throw new Error(data.message || 'Please sign in with an administrator account.');
      }
      localStorage.setItem('bl_admin_token', data.accessToken);
      // Verify the backend recognises the session before unlocking the admin UI.
      const verified = await authService.getMe();
      if (!verified.success || verified.user?.role !== 'admin') throw new Error('An administrator account is required.');
      localStorage.setItem('bl_admin_user', JSON.stringify(verified.user));
      set({ user: verified.user, token: data.accessToken, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      clearSession();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return { success: false, message: error.response?.data?.message || error.message || 'Unable to sign in. Please try again.' };
    }
  },
  logout: () => {
    clearSession();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
