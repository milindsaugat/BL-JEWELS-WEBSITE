import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Setting from '../models/Setting.js';
import { seedCategories, seedProducts, seedBanners, seedCoupons, seedReviews } from './seedData.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bl-jewels';

export const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI.replace(/:([^:@]{3,})@/, ':****@')}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✦ MongoDB Connected Successfully for Seeding!');

    // 1. Seed Categories
    console.log('Seeding Categories...');
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(seedCategories);
    console.log(`✓ Seeded ${createdCategories.length} categories`);

    // Map slug to category ObjectId
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // 2. Seed Products
    console.log('Seeding Products...');
    await Product.deleteMany({});
    const productsToInsert = seedProducts.map((p) => {
      const catId = categoryMap[p.categorySlug] || createdCategories[0]._id;
      return {
        ...p,
        category: catId,
      };
    });
    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`✓ Seeded ${createdProducts.length} luxury jewelry products`);

    // 3. Seed Banners
    console.log('Seeding Hero Banners...');
    await Banner.deleteMany({});
    const bannersToInsert = seedBanners.map(({ _id, ...banner }) => banner);
    const createdBanners = await Banner.insertMany(bannersToInsert);
    console.log(`✓ Seeded ${createdBanners.length} hero showcase banners`);

    // 4. Seed Coupons
    console.log('Seeding Auspicious Promo Coupons...');
    await Coupon.deleteMany({});
    const createdCoupons = await Coupon.insertMany(seedCoupons);
    console.log(`✓ Seeded ${createdCoupons.length} promotional coupons`);

    // 5. Seed Users (Admin & Customer)
    console.log('Seeding Admin & Customer Accounts...');
    await User.deleteMany({ email: { $in: ['admin@bljewels.com', 'priya@example.com', 'demo@bljewels.com'] } });
    
    const adminUser = new User({
      name: 'BL Jewels Administrator',
      email: 'admin@bljewels.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+91 98765 43210',
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'Priya Sharma (Demo Patron)',
      email: 'demo@bljewels.com',
      password: 'DemoUser123!',
      role: 'customer',
      phone: '+91 98765 01234',
      addresses: [
        {
          label: 'Home',
          name: 'Priya Sharma',
          phone: '+91 98765 01234',
          line1: 'Villa 42, Palm Avenue, Near ISKCON',
          line2: 'Juhu Scheme',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400049',
          country: 'India',
          isDefault: true,
        }
      ]
    });
    await customerUser.save();

    console.log('✓ Seeded Admin User (admin@bljewels.com / adminpassword123)');
    console.log('✓ Seeded Customer Demo User (demo@bljewels.com / DemoUser123!)');

    // 6. Seed Patron Reviews / Testimonials
    console.log('Seeding Patron Reviews & Testimonials...');
    await Review.deleteMany({});
    const reviewsWithProducts = seedReviews.map((r, idx) => ({
      ...r,
      product: createdProducts[idx % createdProducts.length]._id,
    }));
    const createdReviews = await Review.insertMany(reviewsWithProducts);
    console.log(`✓ Seeded ${createdReviews.length} patron reflection reviews`);

    // 7. Seed Global Site Settings
    console.log('Seeding Global Site Settings (Brand Story, Rates, Announcements)...');
    await Setting.deleteMany({});
    await Setting.create({
      key: 'global_site_settings',
      brandName: 'BL Jewels',
      tagline: 'Purity with Auspiciousness',
      announcements: [
        '✦ 100% Certified 22K (916) BIS Hallmarked Gold Guaranteed ✦',
        '✦ Complimentary Insured Express Delivery across India (Orders > ₹5,000) ✦',
        '✦ Auspicious Festive Offer: Use Code SHUBH10 for 10% Off ✦',
        '✦ Lifetime Gold Buyback Guarantee · 15-Day Easy Returns ✦',
      ],
      todayGoldRate: {
        rate22k: '₹7,280/g',
        rate24k: '₹7,940/g',
        rate18k: '₹5,960/g',
        silverRate: '₹95/g',
        lastUpdated: new Date(),
      },
      brandStory: {
        eyebrow: 'Our Heritage & Philosophy',
        title: 'Where Auspicious Gold Meets Artisanal Royalty',
        paragraph1: 'Founded in the historic jewelry quarter of Zaveri Bazaar, Mumbai, BL Jewels was born from a singular sacred vow: Purity with Auspiciousness. We believe that fine jewelry is not merely an ornament — it is a blessing, a family heirloom, and a sacred celebration of love.',
        paragraph2: 'Every polki choker, auspicious mangalsutra, and solitaire ring is shaped by master karigars whose lineages have sculpted jewelry for generations. With 100% government BIS 916 hallmarking and transparent karat certifications, we guarantee that the beauty you wear today retains its auspicious value for generations to come.',
        legacyYears: '40+ YEARS LEGACY',
        legacySubtitle: 'Serving Indian royal families & connoisseurs since 1984',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
      },
      contact: {
        phone: '+91 98765 43210',
        email: 'concierge@bljewels.com',
        address: 'BL Jewels Heritage Flagship, Zaveri Bazaar, Mumbai 400002',
        whatsapp: '+91 98765 43210',
      },
    });
    console.log('✓ Seeded Global Site Settings');

    console.log('\n✦✦✦ DATABASE SEEDING COMPLETED SUCCESSFULLY ✦✦✦\n');
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    throw error;
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seeder.js')) {
  seedDatabase()
    .then(() => {
      console.log('Disconnecting from database...');
      return mongoose.disconnect();
    })
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

