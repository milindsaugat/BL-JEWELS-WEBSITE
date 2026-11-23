import mongoose from 'mongoose';
import crypto from 'node:crypto';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
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
  if (!['razorpay', 'cod', 'upi', 'card', 'bank_transfer'].includes(body.paymentMethod)) {
    throw new Error('Choose a payment method.');
  }

  let bankTransferMeta = null;
  if (body.paymentMethod === 'bank_transfer') {
    const bt = body.bankTransfer || {};
    const txId = String(bt.transactionId || '').trim();
    const proofUrl = String(bt.proofImage || '').trim();
    if (txId.length < 4) {
      throw new Error('Please enter a valid Transaction ID / UTR reference number for bank transfer.');
    }
    if (!/^https?:\/\/.+/i.test(proofUrl)) {
      throw new Error('Please upload your bank transfer / UPI payment proof screenshot before completing checkout.');
    }
    bankTransferMeta = {
      transactionId: txId.slice(0, 120),
      proofImage: proofUrl.slice(0, 1000),
      bankAccountId: String(bt.bankAccountId || '').slice(0, 80),
      bankLabel: String(bt.bankLabel || '').slice(0, 120),
      bankName: String(bt.bankName || '').slice(0, 120),
      accountNumberLast4: String(bt.accountNumberLast4 || '').slice(-4),
    };
  }
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
        const coupon = await Coupon.findOne({
          code: String(body.couponCode).toUpperCase(),
          isActive: true,
          validUntil: { $gt: new Date() }
        }).session(session);

        if (!coupon || subtotal < coupon.minOrderValue) {
          throw new Error('This coupon is not valid for this order.');
        }

        if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
          throw new Error('This coupon has reached its maximum usage limit.');
        }

        const calculated = coupon.discountType === 'percentage'
          ? ((coupon.maxDiscount && Number(coupon.maxDiscount) > 0)
              ? Math.min((subtotal * coupon.value) / 100, Number(coupon.maxDiscount))
              : (subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal);
        discount = Math.round(calculated);

        // Atomically increment used count
        await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } }).session(session);
      }

      // Fetch dynamic shipping rules
      let shippingCharge = 500;
      let freeShippingThreshold = 5000;
      try {
        const globalSettings = await Setting.findOne({ key: 'global_site_settings' }).session(session);
        if (globalSettings?.shippingSettings) {
          const sc = globalSettings.shippingSettings.shippingCharge;
          shippingCharge = (sc !== undefined && sc !== null && sc !== '' && !isNaN(Number(sc))) ? Number(sc) : 0;
          const fst = globalSettings.shippingSettings.freeShippingThreshold;
          freeShippingThreshold = (fst !== undefined && fst !== null && fst !== '' && !isNaN(Number(fst))) ? Number(fst) : null;
        }
      } catch (e) {
        // Fallback to default
      }

      let shipping = 0;
      if (shippingCharge > 0) {
        if (freeShippingThreshold !== null && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
          shipping = 0;
        } else {
          shipping = shippingCharge;
        }
      }

      const taxable = Math.max(0, subtotal - discount);
      const total = taxable + shipping; // Product price already includes GST from product detail breakdown
      [order] = await Order.create([{ user, orderNumber: `BLJ-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`, items, shippingAddress: address,
        pricing: { subtotal, discount, coupon: body.couponCode || null, shipping, gst: 0, total },
        inventoryReserved: true,
        payment: {
          method: body.paymentMethod,
          status: body.paymentMethod === 'bank_transfer' ? 'verification_pending' : 'pending',
          ...(bankTransferMeta || {}),
        },
        status: 'placed',
        statusHistory: [{
          status: 'placed',
          note:
            body.paymentMethod === 'bank_transfer'
              ? `Order placed via Bank / QR transfer (Ref: ${bankTransferMeta.transactionId}); awaiting payment verification.`
              : 'Order placed; payment pending.',
        }],
        isGift: !!body.isGift, giftNote: String(body.giftNote || '').slice(0, 500),
        adminViewed: false }], { session });
    });
    return order;
  } finally { await session.endSession(); }
}

export async function cancelInventoryOrder(filter, note = 'Order cancelled', reason = '', comments = '') {
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
      order.cancelledAt = new Date();
      if (reason) order.cancelReason = reason;
      if (comments) order.cancelComments = comments;
      order.statusHistory.push({ status: 'cancelled', note, updatedAt: new Date() });
      await order.save({ session });
    });
    return order;
  } finally { await session.endSession(); }
}
