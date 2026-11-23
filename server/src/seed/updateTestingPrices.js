import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testPricesBySku = {
  // 1. Devi Jhumka - ₹1 test product
  'BLJ-ER-004': {
    variants: [
      { sku: 'BLJ-ER-004-A', price: 10, discountPrice: 1 }
    ],
    priceBreakup: {
      metalAmount: 1,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 1
    }
  },

  // 2. Swarna Mangalsutra - ₹1 & ₹2 test variants
  'BLJ-MS-002': {
    variants: [
      { sku: 'BLJ-MS-002-16', price: 5, discountPrice: 1 },
      { sku: 'BLJ-MS-002-18', price: 10, discountPrice: 2 }
    ],
    priceBreakup: {
      metalAmount: 1,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 1
    }
  },

  // 3. Eternity Diamond Ring - ₹5 & ₹10 test variants
  'BLJ-RG-003': {
    variants: [
      { sku: 'BLJ-RG-003-12', price: 10, discountPrice: 5 },
      { sku: 'BLJ-RG-003-14', price: 15, discountPrice: 10 }
    ],
    priceBreakup: {
      metalAmount: 5,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 5
    }
  },

  // 4. Noor Chandbali - ₹10 test product
  'BLJ-ER-008': {
    variants: [
      { sku: 'BLJ-ER-008-A', price: 20, discountPrice: 10 }
    ],
    priceBreakup: {
      metalAmount: 10,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 10
    }
  },

  // 5. Lakshmi Kasu Mala - ₹10 test product
  'BLJ-NK-007': {
    variants: [
      { sku: 'BLJ-NK-007-A', price: 20, discountPrice: 10 }
    ],
    priceBreakup: {
      metalAmount: 10,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 10
    }
  },

  // 6. Maya Kundan Choker - ₹10 & ₹15 test variants
  'BLJ-NK-001': {
    variants: [
      { sku: 'BLJ-NK-001-A', price: 20, discountPrice: 10 },
      { sku: 'BLJ-NK-001-B', price: 25, discountPrice: 15 }
    ],
    priceBreakup: {
      metalAmount: 10,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 10
    }
  },

  // 7. Celestial Diamond Bracelet - ₹15 test product
  'BLJ-BR-006': {
    variants: [
      { sku: 'BLJ-BR-006-7', price: 25, discountPrice: 15 }
    ],
    priceBreakup: {
      metalAmount: 15,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 15
    }
  },

  // 8. Royal Rajwadi Kada - ₹15 & ₹20 test variants
  'BLJ-BG-005': {
    variants: [
      { sku: 'BLJ-BG-005-24', price: 25, discountPrice: 15 },
      { sku: 'BLJ-BG-005-26', price: 30, discountPrice: 20 }
    ],
    priceBreakup: {
      metalAmount: 15,
      otherCharge: 0,
      makingCharge: 0,
      gstAmount: 0,
      grandTotal: 15
    }
  }
};

async function updatePrices() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas:', mongoose.connection.name);

  const productsCollection = mongoose.connection.collection('products');
  const couponsCollection = mongoose.connection.collection('coupons');

  for (const [sku, config] of Object.entries(testPricesBySku)) {
    const product = await productsCollection.findOne({ sku });
    if (!product) {
      console.warn(`Product with SKU ${sku} not found.`);
      continue;
    }

    const updatedVariants = product.variants.map((v) => {
      const match = config.variants.find((cv) => cv.sku === v.sku);
      if (match) {
        return {
          ...v,
          price: match.price,
          discountPrice: match.discountPrice
        };
      }
      return v;
    });

    await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: {
          variants: updatedVariants,
          priceBreakup: config.priceBreakup,
          'studdedDetails.studSalesAmount': 0,
          'studdedDetails.salesAmount': 0,
          'studdedDetails.otherCharges': 0
        }
      }
    );

    console.log(`Updated ${product.name} (${sku}): variants=${updatedVariants.map(v => `₹${v.discountPrice}`).join(', ')}`);
  }

  // Also update coupon minOrderValue so coupons work with test prices
  await couponsCollection.updateMany(
    { code: { $in: ['SHUBH10', 'WELCOME5', 'TEST'] } },
    { $set: { minOrderValue: 1 } }
  );
  console.log('Updated coupons (SHUBH10, WELCOME5, TEST) minOrderValue to ₹1 for test orders.');

  await mongoose.disconnect();
  console.log('All product testing prices applied successfully!');
}

updatePrices().catch((err) => {
  console.error('Error updating prices:', err);
  process.exit(1);
});
