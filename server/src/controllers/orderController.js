import { getDbStatus } from '../config/db.js';
import Order from '../models/Order.js';
import { memoryStore } from '../config/memoryStore.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes, isGift, giftNote } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Check coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = memoryStore.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount);
        } else {
          discount = Math.min(coupon.value, coupon.maxDiscount);
        }
      }
    }

    const shipping = subtotal >= 5000 ? 0 : 500;
    const taxableAmount = Math.max(0, subtotal - discount);
    const gst = Math.round(taxableAmount * 0.03); // 3% GST on jewelry
    const total = taxableAmount + shipping + gst;

    const orderData = {
      user: req.user?._id || req.user?.id || 'usr_customer',
      orderNumber: `BLJ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        coupon: couponCode || null,
        shipping,
        gst,
        total,
      },
      payment: {
        method: paymentMethod || 'razorpay',
        status: 'paid', // for demo ease
        paidAt: new Date(),
      },
      status: 'confirmed',
      statusHistory: [
        { status: 'placed', note: 'Order placed successfully', updatedAt: new Date() },
        { status: 'confirmed', note: 'Payment verified & order confirmed', updatedAt: new Date() }
      ],
      tracking: {
        carrier: 'Blue Dart Luxury Express',
        trackingId: `BLJ-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      notes,
      isGift: Boolean(isGift),
      giftNote: giftNote || '',
    };

    if (getDbStatus()) {
      const order = await Order.create(orderData);
      return res.status(201).json({ success: true, order });
    } else {
      const order = {
        _id: `ord_${Date.now()}`,
        ...orderData,
        createdAt: new Date().toISOString(),
      };
      memoryStore.orders.unshift(order);
      return res.status(201).json({ success: true, order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'usr_customer';

    if (getDbStatus()) {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    } else {
      const orders = memoryStore.orders.filter(o => o.user === userId || o.user === 'usr_customer');
      return res.json({ success: true, count: orders.length, orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const order = await Order.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }]
      });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    } else {
      const order = memoryStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    if (getDbStatus()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    } else {
      return res.json({ success: true, count: memoryStore.orders.length, orders: memoryStore.orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (getDbStatus()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = status;
      order.statusHistory.push({
        status,
        note: note || `Order updated to ${status}`,
        updatedAt: new Date(),
      });
      await order.save();
      return res.json({ success: true, order });
    } else {
      const order = memoryStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = status;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        note: note || `Order updated to ${status}`,
        updatedAt: new Date(),
      });
      return res.json({ success: true, order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

