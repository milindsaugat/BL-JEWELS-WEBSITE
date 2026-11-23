import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas:', mongoose.connection.name);

  const productsColl = mongoose.connection.collection('products');
  const couponsColl = mongoose.connection.collection('coupons');

  // 1. Restore coupons original minOrderValue
  await couponsColl.updateOne({ code: 'SHUBH10' }, { $set: { minOrderValue: 20000 } });
  await couponsColl.updateOne({ code: 'WELCOME5' }, { $set: { minOrderValue: 10000 } });
  await couponsColl.updateOne({ code: 'TEST' }, { $set: { minOrderValue: 20000 } });
  console.log('✓ Coupons minOrderValue restored to original thresholds.');

  // 2. Remove forced 0 priceBreakup and restore default studdedDetails
  const updateRes = await productsColl.updateMany(
    {},
    {
      $unset: { priceBreakup: '' },
      $set: {
        'studdedDetails.styleName': 'Other Charges [H]',
        'studdedDetails.studSalesAmount': 300,
        'studdedDetails.salesAmount': 300,
        'studdedDetails.otherCharges': 300
      }
    }
  );
  console.log('✓ Products updated. Removed forced 0 priceBreakup and restored studdedDetails. Modified:', updateRes.modifiedCount);

  // 3. Verify products: main prices (variants) remain testing prices, and priceBreakup is removed
  const products = await productsColl.find({}, {
    projection: {
      name: 1,
      sku: 1,
      'variants.price': 1,
      'variants.discountPrice': 1,
      priceBreakup: 1,
      studdedDetails: 1
    }
  }).toArray();

  for (const p of products) {
    const vStr = p.variants?.map(v => `MRP: ₹${v.price}, Discount: ₹${v.discountPrice}`).join(' | ');
    console.log(`• ${p.name} (${p.sku}): ${vStr}`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
