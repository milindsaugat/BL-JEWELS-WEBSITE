import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

export const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for order seeding...');

    const products = await Product.find().limit(5);
    const user = await User.findOne({ email: 'priya@example.com' });

    if (products.length === 0) {
      console.log('No products found, aborting order seeding.');
      return;
    }

    const sampleOrders = [
      {
        orderNumber: 'BLJ-ORD-10821',
        user: user?._id,
        items: [
          {
            product: products[0]._id,
            snapshot: {
              name: products[0].name,
              image: products[0].images?.[0]?.url,
              variant: { weight: 48.5, label: '22K · 48.5g' },
              metal: products[0].metal,
            },
            quantity: 1,
            price: 365000,
          },
        ],
        shippingAddress: {
          name: 'Radhika Mehra',
          phone: '+91 98111 22334',
          line1: '14, Golf Links',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110003',
          country: 'India',
        },
        pricing: {
          subtotal: 365000,
          discount: 15000,
          coupon: 'SHUBH10',
          shipping: 0,
          gst: 10500,
          total: 360500,
        },
        payment: {
          method: 'razorpay',
          status: 'paid',
          paidAt: new Date(Date.now() - 2 * 3600 * 1000),
        },
        status: 'shipped',
        trackingNumber: 'BLUEDART-8829104',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        orderNumber: 'BLJ-ORD-10822',
        user: user?._id,
        items: [
          {
            product: products[1]?._id || products[0]._id,
            snapshot: {
              name: products[1]?.name || 'Eternity Solitaire Diamond Ring',
              image: products[1]?.images?.[0]?.url,
              variant: { weight: 4.8, label: '18K · 4.8g' },
              metal: { type: 'gold', karat: '18K' },
            },
            quantity: 1,
            price: 185000,
          },
        ],
        shippingAddress: {
          name: 'Aditya Singhania',
          phone: '+91 98200 44556',
          line1: '72, Altamount Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400026',
          country: 'India',
        },
        pricing: {
          subtotal: 185000,
          discount: 0,
          shipping: 0,
          gst: 5550,
          total: 190550,
        },
        payment: {
          method: 'upi',
          status: 'paid',
          paidAt: new Date(Date.now() - 5 * 3600 * 1000),
        },
        status: 'processing',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000),
      },
      {
        orderNumber: 'BLJ-ORD-10823',
        user: user?._id,
        items: [
          {
            product: products[2]?._id || products[0]._id,
            snapshot: {
              name: products[2]?.name || 'Auspicious Swarna Mangalsutra 22K',
              image: products[2]?.images?.[0]?.url,
              variant: { weight: 14.2, label: '22K · 14.2g' },
              metal: { type: 'gold', karat: '22K' },
            },
            quantity: 1,
            price: 98000,
          },
        ],
        shippingAddress: {
          name: 'Meenakshi Sundaram',
          phone: '+91 99401 77889',
          line1: '402, Indiranagar 100ft Rd',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India',
        },
        pricing: {
          subtotal: 98000,
          discount: 5000,
          coupon: 'WELCOME5',
          shipping: 0,
          gst: 2790,
          total: 95790,
        },
        payment: {
          method: 'razorpay',
          status: 'paid',
          paidAt: new Date(Date.now() - 12 * 3600 * 1000),
        },
        status: 'confirmed',
        createdAt: new Date(Date.now() - 13 * 3600 * 1000),
      },
      {
        orderNumber: 'BLJ-ORD-10824',
        user: user?._id,
        items: [
          {
            product: products[3]?._id || products[0]._id,
            snapshot: {
              name: products[3]?.name || 'Antique Temple Lakshmi Gold Kada',
              image: products[3]?.images?.[0]?.url,
              variant: { weight: 36.0, label: '22K · 36.0g' },
              metal: { type: 'gold', karat: '22K' },
            },
            quantity: 1,
            price: 278000,
          },
        ],
        shippingAddress: {
          name: 'Ananya Deshmukh',
          phone: '+91 97654 33221',
          line1: 'B-12, Koregaon Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India',
        },
        pricing: {
          subtotal: 278000,
          discount: 2500,
          coupon: 'FESTIVE2500',
          shipping: 0,
          gst: 8265,
          total: 283765,
        },
        payment: {
          method: 'razorpay',
          status: 'paid',
          paidAt: new Date(Date.now() - 24 * 3600 * 1000),
        },
        status: 'delivered',
        trackingNumber: 'BLUEDART-8829091',
        createdAt: new Date(Date.now() - 26 * 3600 * 1000),
      },
      {
        orderNumber: 'BLJ-ORD-10825',
        user: user?._id,
        items: [
          {
            product: products[0]._id,
            snapshot: {
              name: products[0].name,
              image: products[0].images?.[0]?.url,
              variant: { weight: 12.0, label: '22K · 12.0g' },
              metal: products[0].metal,
            },
            quantity: 1,
            price: 88500,
          },
        ],
        shippingAddress: {
          name: 'Kavita Chawla',
          phone: '+91 98888 12345',
          line1: 'Sector 9-C',
          city: 'Chandigarh',
          state: 'Punjab',
          pincode: '160009',
          country: 'India',
        },
        pricing: {
          subtotal: 88500,
          discount: 0,
          shipping: 0,
          gst: 2655,
          total: 91155,
        },
        payment: {
          method: 'upi',
          status: 'paid',
          paidAt: new Date(Date.now() - 48 * 3600 * 1000),
        },
        status: 'delivered',
        trackingNumber: 'BLUEDART-8828940',
        createdAt: new Date(Date.now() - 50 * 3600 * 1000),
      },
    ];

    await Order.deleteMany({});
    const created = await Order.insertMany(sampleOrders);
    console.log(`✓ Seeded ${created.length} luxury jewelry orders in MongoDB Atlas!`);
  } catch (error) {
    console.error('Order seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Done order seeding.');
  }
};

seedOrders();

