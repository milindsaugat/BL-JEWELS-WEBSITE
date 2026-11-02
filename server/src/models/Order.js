import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // can allow guest order tracking
  },
  guestEmail: String,
  orderNumber: {
    type: String,
    unique: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    snapshot: {
      name: String,
      image: String,
      variant: Object,
      metal: Object,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coupon: String,
    shipping: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }, // 3% on jewelry
    total: { type: Number, required: true },
  },
  payment: {
    method: {
      type: String,
      enum: ['razorpay', 'cod', 'upi', 'card'],
      default: 'razorpay',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid', // for demo purchases
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
  },
  status: {
    type: String,
    enum: [
      'placed',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'return_requested',
      'returned',
    ],
    default: 'confirmed',
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
  }],
  tracking: {
    carrier: { type: String, default: 'Blue Dart Luxury Express' },
    trackingId: String,
    url: String,
    estimatedDelivery: Date,
  },
  notes: String,
  isGift: { type: Boolean, default: false },
  giftNote: String,
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `BLJ-${new Date().getFullYear()}-${randomSuffix}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;

