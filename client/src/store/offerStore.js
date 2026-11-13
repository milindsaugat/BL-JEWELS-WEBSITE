import { create } from 'zustand';
import { offerService } from '../services/api';

export const useOfferStore = create((set, get) => ({
  activeOffers: [],
  isLoading: false,

  fetchActiveOffers: async () => {
    if (get().activeOffers.length > 0) return get().activeOffers;
    set({ isLoading: true });
    try {
      const res = await offerService.getActiveOffers();
      const offers = res.offers || [];
      set({ activeOffers: offers, isLoading: false });
      return offers;
    } catch {
      set({ isLoading: false });
      return [];
    }
  },

  getOfferForProduct: (product) => {
    if (!product) return null;
    const { activeOffers } = get();
    if (!activeOffers || activeOffers.length === 0) return null;

    const prodCategorySlug = (
      product.categorySlug ||
      product.category?.slug ||
      (typeof product.category === 'string' ? product.category : '')
    ).toLowerCase();

    const prodCategoryName = (
      product.category?.name || ''
    ).toLowerCase();

    const prodId = String(product._id || '');

    for (const offer of activeOffers) {
      if (!offer.isActive) continue;
      if (new Date(offer.endDate) <= new Date()) continue;

      const categories = (offer.targetCategories || []).map((c) => String(c).toLowerCase());
      const specificProducts = (offer.targetProducts || []).map((p) => String(p));

      // Match all, category slug/name, or specific product ID
      const matchesAll = categories.includes('all');
      const matchesCategory =
        categories.includes(prodCategorySlug) ||
        categories.some((c) => prodCategoryName.includes(c) || prodCategorySlug.includes(c));
      const matchesProduct = specificProducts.includes(prodId);

      if (matchesAll || matchesCategory || matchesProduct) {
        return offer;
      }
    }

    return null;
  },
}));

