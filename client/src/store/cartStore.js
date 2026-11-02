import { create } from 'zustand';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('bl_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  items: loadCartFromStorage(),
  isDrawerOpen: false,
  coupon: null,
  discount: 0,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  addToCart: (product, variant, quantity = 1) => {
    set((state) => {
      const selectedVariant = variant || product.variants?.[0] || {};
      const itemIndex = state.items.findIndex(
        (i) => i.product._id === product._id && (i.variant?.sku === selectedVariant.sku || i.variant?.label === selectedVariant.label)
      );

      let newItems;
      if (itemIndex > -1) {
        newItems = [...state.items];
        newItems[itemIndex].quantity += quantity;
      } else {
        newItems = [
          ...state.items,
          {
            product,
            variant: selectedVariant,
            price: selectedVariant.discountPrice || selectedVariant.price,
            quantity,
          },
        ];
      }

      localStorage.setItem('bl_cart', JSON.stringify(newItems));
      return { items: newItems, isDrawerOpen: true };
    });
  },

  removeFromCart: (productId, variantIdentifier) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.product._id === productId && (i.variant?.sku === variantIdentifier || i.variant?.label === variantIdentifier))
      );
      localStorage.setItem('bl_cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (productId, variantIdentifier, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, variantIdentifier);
      return;
    }
    set((state) => {
      const newItems = state.items.map((i) => {
        if (i.product._id === productId && (i.variant?.sku === variantIdentifier || i.variant?.label === variantIdentifier)) {
          return { ...i, quantity };
        }
        return i;
      });
      localStorage.setItem('bl_cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('bl_cart');
    set({ items: [], coupon: null, discount: 0 });
  },

  applyCoupon: (coupon) => {
    set({
      coupon,
      discount: coupon.calculatedDiscount || 0,
    });
  },

  removeCoupon: () => {
    set({ coupon: null, discount: 0 });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  },

  getShipping: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 5000 ? 0 : 500;
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const taxable = Math.max(0, subtotal - discount);
    return Math.round(taxable * 0.03); // 3% GST on jewelry
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const shipping = get().getShipping();
    const tax = get().getTax();
    return Math.max(0, subtotal - discount) + shipping + tax;
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));

