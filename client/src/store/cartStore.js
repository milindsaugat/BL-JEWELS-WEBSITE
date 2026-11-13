import { create } from 'zustand';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('bl_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadCouponFromStorage = () => {
  try {
    const saved = localStorage.getItem('bl_coupon');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const calculateDiscount = (items, coupon) => {
  if (!coupon) return 0;
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  if (subtotal < (coupon.minOrderValue || 0)) return 0;
  if (coupon.discountType === 'percentage') {
    const raw = (subtotal * coupon.value) / 100;
    const capped = (coupon.maxDiscount && Number(coupon.maxDiscount) > 0)
      ? Math.min(raw, Number(coupon.maxDiscount))
      : raw;
    return Math.round(capped);
  }
  return Math.round(Math.min(coupon.value, subtotal));
};

const initialItems = loadCartFromStorage();
const initialCoupon = loadCouponFromStorage();
const initialDiscount = calculateDiscount(initialItems, initialCoupon);

export const useCartStore = create((set, get) => ({
  items: initialItems,
  isDrawerOpen: false,
  coupon: initialCoupon,
  discount: initialDiscount,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  addToCart: (product, variant, quantity = 1) => {
    const available = variant || product.variants?.[0];
    if (!available || available.stock <= 0) return;
    set((state) => {
      const selectedVariant = variant || product.variants?.[0] || {};
      const itemIndex = state.items.findIndex(
        (i) => i.product._id === product._id && (selectedVariant.sku ? i.variant?.sku === selectedVariant.sku : i.variant?.label === selectedVariant.label)
      );

      let newItems;
      if (itemIndex > -1) {
        newItems = [...state.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          variant: selectedVariant,
          price: selectedVariant.discountPrice ?? selectedVariant.price,
          quantity: Math.min(selectedVariant.stock, newItems[itemIndex].quantity + quantity),
        };
      } else {
        newItems = [
          ...state.items,
          {
            product,
            variant: selectedVariant,
            price: selectedVariant.discountPrice || selectedVariant.price,
            quantity: Math.min(selectedVariant.stock, quantity),
          },
        ];
      }

      localStorage.setItem('bl_cart', JSON.stringify(newItems));
      const newDiscount = calculateDiscount(newItems, state.coupon);
      return { items: newItems, discount: newDiscount, isDrawerOpen: true };
    });
  },

  removeFromCart: (productId, variantIdentifier) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.product._id === productId && (i.variant?.sku === variantIdentifier || i.variant?.label === variantIdentifier))
      );
      localStorage.setItem('bl_cart', JSON.stringify(newItems));
      const newDiscount = calculateDiscount(newItems, state.coupon);
      return { items: newItems, discount: newDiscount };
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
          return { ...i, quantity: Math.min(i.variant?.stock ?? quantity, quantity) };
        }
        return i;
      });
      localStorage.setItem('bl_cart', JSON.stringify(newItems));
      const newDiscount = calculateDiscount(newItems, state.coupon);
      return { items: newItems, discount: newDiscount };
    });
  },

  clearCart: () => {
    localStorage.removeItem('bl_cart');
    localStorage.removeItem('bl_coupon');
    set({ items: [], coupon: null, discount: 0 });
  },

  applyCoupon: (coupon) => {
    const subtotal = get().getSubtotal();
    const qualifies = subtotal >= (coupon.minOrderValue || 0);
    const finalDiscount = qualifies ? calculateDiscount(get().items, coupon) : 0;
    localStorage.setItem('bl_coupon', JSON.stringify(coupon));
    set({
      coupon,
      discount: finalDiscount,
    });
  },

  removeCoupon: () => {
    localStorage.removeItem('bl_coupon');
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
