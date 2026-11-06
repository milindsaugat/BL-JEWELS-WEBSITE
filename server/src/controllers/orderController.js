import { createInventoryOrder, cancelInventoryOrder } from '../services/orderInventory.js';
import { getDbStatus } from '../config/db.js';
import Order from '../models/Order.js';
import { memoryStore } from '../config/memoryStore.js';

export const createOrder = async (req, res) => {
  if (!getDbStatus()) return res.status(503).json({ message: 'Ordering is temporarily unavailable. Please try again.' });
  try { const order = await createInventoryOrder(req.user._id, req.body); res.status(201).json({ success: true, order }); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); }
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
        ...(req.user.role === 'admin' ? {} : { user: req.user._id }),
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
      if (status === 'cancelled') {
        const order = await cancelInventoryOrder({ _id: id }, note);
        return res.json({ success: true, order });
      }
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (order.status === 'cancelled') return res.status(400).json({ message: 'A cancelled order cannot be reopened. Create a new order.' });
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

