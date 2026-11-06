import mongoose from 'mongoose';
import crypto from 'node:crypto';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
export function orderLines(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new Error('Add products to your bag first.');
  return items.map(item => {
    const sku = item.snapshot?.variant?.sku;
    if (!/^[a-f0-9]{24}$/i.test(item.product) || typeof sku !== 'string' || !sku || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) throw new Error('A product option or quantity is invalid. Please update your bag.');
    return { product: item.product, sku, quantity: item.quantity };
  });
}
export async function createInventoryOrder(user, body) {
  const lines = orderLines(body.items);
  const address = body.shippingAddress;
  if (!address?.name || !address.line1 || !address.city || !address.state || !/^\d{6}$/.test(address.pincode) || !/^[+\d\s-]{7,20}$/.test(address.phone)) throw new Error('Complete your delivery address.');
  if (!['razorpay','cod','upi','card'].includes(body.paymentMethod)) throw new Error('Choose a payment method.');
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const items = [];
      // MongoDB transactions must execute writes sequentially. A failed line rolls everything back.
      for (const line of lines) {
        const product = await Product.findOneAndUpdate({ _id: line.product, isActive: true, variants: { $elemMatch: { sku: line.sku, stock: { $gte: line.quantity } } } }, { $inc: { 'variants.$.stock': -line.quantity } }, { session, new: true });
        if (!product) throw new Error('An item is no longer available in this quantity. Please update your bag.');
        const variant = product.variants.find(v => v.sku === line.sku);
        items.push({ product: product._id, quantity: line.quantity, price: variant.discountPrice ?? variant.price,
          snapshot: { name: product.name, image: product.images[0]?.url, variant: variant.toObject(), metal: product.metal } });
      }
      const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
      let discount = 0;
      if (body.couponCode) {
        const coupon = await Coupon.findOne({ code: String(body.couponCode).toUpperCase(), isActive: true, validUntil: { $gt: new Date() } }).session(session);
        if (!coupon || subtotal < coupon.minOrderValue) throw new Error('This coupon is not valid for this order.');
        discount = Math.min(subtotal, coupon.maxDiscount, coupon.discountType === 'percentage' ? subtotal * coupon.value / 100 : coupon.value);
      }
      const shipping = subtotal >= 5000 ? 0 : 500;
      const gst = Math.round(Math.max(0, subtotal - discount) * 0.03);
      [order] = await Order.create([{ user, orderNumber: `BLJ-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, items, shippingAddress: address,
        pricing: { subtotal, discount, coupon: body.couponCode || null, shipping, gst, total: subtotal - discount + shipping + gst },
        inventoryReserved: true, payment: { method: body.paymentMethod, status: 'pending' }, status: 'placed',
        statusHistory: [{ status: 'placed', note: 'Order placed; payment pending.' }], isGift: !!body.isGift, giftNote: String(body.giftNote || '').slice(0, 500) }], { session });
    });
    return order;
  } finally { await session.endSession(); }
}

export async function cancelInventoryOrder(filter, note = 'Order cancelled') {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findOne(filter).session(session);
      if (!order || !['placed','confirmed','processing'].includes(order.status)) throw new Error('This order cannot be cancelled.');
      if (order.inventoryReserved) {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product, 'variants.sku': item.snapshot.variant.sku }, { $inc: { 'variants.$.stock': item.quantity } }, { session });
        }
        order.inventoryReserved = false;
      }
      order.status = 'cancelled';
      order.statusHistory.push({ status: 'cancelled', note, updatedAt: new Date() });
      await order.save({ session });
    });
    return order;
  } finally { await session.endSession(); }
}
