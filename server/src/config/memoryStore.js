// Runtime memory storage starts without a hardcoded storefront catalog.
export const memoryStore = {
  banners: [],
  categories: [],
  products: [],
  coupons: [],
  users: [
    {
      _id: 'usr_admin',
      name: 'BL Jewels Administrator',
      email: 'admin@bljewels.com',
      role: 'admin',
      addresses: [
        {
          label: 'Office',
          name: 'BL Jewels HQ',
          phone: '+91 98765 43210',
          line1: 'BL Jewels House, Zaveri Bazaar',
          line2: 'Kalbadevi',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          country: 'India',
          isDefault: true,
        }
      ],
      wishlist: [],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'usr_customer',
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          name: 'Ananya Sharma',
          phone: '+91 98200 12345',
          line1: 'Flat 402, Royale Meadows',
          line2: 'Juhu Tara Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400049',
          country: 'India',
          isDefault: true,
        }
      ],
      wishlist: ['prod_1', 'prod_3'],
      createdAt: new Date().toISOString(),
    }
  ],
  orders: [
    {
      _id: 'ord_1001',
      orderNumber: 'BLJ-2026-00101',
      user: 'usr_customer',
      items: [
        {
          product: 'prod_2',
          snapshot: {
            name: 'Auspicious Swarna Mangalsutra 22K Gold',
            image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=85',
            variant: { label: '16 Inch · 11.2g', weight: 11.2 },
            metal: { karat: '22K', purity: '916' }
          },
          quantity: 1,
          price: 82900,
        }
      ],
      shippingAddress: {
        name: 'Ananya Sharma',
        phone: '+91 98200 12345',
        line1: 'Flat 402, Royale Meadows',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400049',
        country: 'India',
      },
      pricing: {
        subtotal: 82900,
        discount: 0,
        shipping: 0,
        gst: 2487,
        total: 85387,
      },
      payment: {
        method: 'razorpay',
        status: 'paid',
        paidAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      },
      status: 'shipped',
      tracking: {
        carrier: 'Blue Dart Luxury Express',
        trackingId: 'BD-BLJ-889921',
        url: 'https://bluedart.com',
        estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 2).toISOString(),
      },
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    }
  ],
  reviews: []
};

