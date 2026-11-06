import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSearchOpen: false,
  isLiveRateOpen: false,
  quickViewProduct: null,
  isAuthModalOpen: false,
  authModalReason: '', // 'checkout' | 'wishlist' | ''
  authModalData: null, // extra payload (e.g. productId for wishlist)

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  openLiveRate: () => set({ isLiveRateOpen: true }),
  closeLiveRate: () => set({ isLiveRateOpen: false }),
  toggleLiveRate: () => set((state) => ({ isLiveRateOpen: !state.isLiveRateOpen })),

  openQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),

  openAuthModal: (reason = '', data = null) =>
    set({ isAuthModalOpen: true, authModalReason: reason, authModalData: data }),
  closeAuthModal: () =>
    set({ isAuthModalOpen: false, authModalReason: '', authModalData: null }),
}));

