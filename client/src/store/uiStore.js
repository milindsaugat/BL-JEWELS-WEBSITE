import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSearchOpen: false,
  isLiveRateOpen: false,
  quickViewProduct: null,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  openLiveRate: () => set({ isLiveRateOpen: true }),
  closeLiveRate: () => set({ isLiveRateOpen: false }),
  toggleLiveRate: () => set((state) => ({ isLiveRateOpen: !state.isLiveRateOpen })),

  openQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),
}));

