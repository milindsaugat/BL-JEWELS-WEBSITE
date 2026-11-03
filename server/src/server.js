import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import aiRoutes from './routes/ai.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import rateRoutes from './routes/rate.routes.js';
import settingRoutes from './routes/setting.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import occasionRoutes from './routes/occasion.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB on cold start
connectDB().catch((err) => {
  console.warn('Initial connectDB note:', err.message);
});

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Allowed Origins for Storefront Client & Executive Admin CMS
const allowedOrigins = [
  'https://client-six-eta-24.vercel.app',
  'https://admin-xi-five-53.vercel.app',
  'https://server-orpin-three-43.vercel.app',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean).map((o) => o.replace(/\/+$/, '')); // Strip any trailing slashes

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server or curl/Postman requests with no origin
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Default allow for preview URLs
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-access-token'],
}));

// Explicit Preflight Handling for all routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root Route (Confirms server is active on Vercel)
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'BL Jewels Luxury E-Commerce API',
    tagline: 'Purity with Auspiciousness',
    version: '1.0.0',
    status: 'operational',
    clientUrl: 'https://client-six-eta-24.vercel.app',
    adminUrl: 'https://admin-xi-five-53.vercel.app',
    endpoints: {
      health: '/api/v1/health',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      occasions: '/api/v1/occasions',
      rates: '/api/v1/rates/live',
      banners: '/api/v1/banners',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'BL Jewels',
    tagline: 'Purity with Auspiciousness',
    clientUrl: 'https://client-six-eta-24.vercel.app',
    adminUrl: 'https://admin-xi-five-53.vercel.app',
    timestamp: new Date().toISOString(),
  });
});

// Preflights and health checks never wait for MongoDB. Rates use an external API.
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/v1/rates/')) return next();
  try { await connectDB(); } catch {}
  next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/rates', rateRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/occasions', occasionRoutes);

// Error Handling
app.use(errorHandler);

// Standalone Server Start (When not executed as Vercel Serverless Function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦`);
    console.log(`✦ BL JEWELS — API SERVER RUNNING ON PORT ${PORT} ✦`);
    console.log(`✦ Purity with Auspiciousness ✦`);
    console.log(`✦ Client: https://client-six-eta-24.vercel.app`);
    console.log(`✦ Admin: https://admin-xi-five-53.vercel.app`);
    console.log(`✦ Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦\n`);
  });
}

// Export Express App for Vercel Serverless Execution
export default app;
