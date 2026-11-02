import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: 'server/.env' });

async function fixImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const validImg = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80';
  const validProdImg = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85';

  const catRes = await Category.updateMany(
    { slug: 'bangles-bracelets' },
    { $set: { image: validImg } }
  );
  console.log('Category bangles updated:', catRes.modifiedCount);

  const prodRes = await Product.updateMany(
    { slug: 'royal-rajwadi-polki-kada-bangle-22k-gold' },
    { $set: { 
      'images.0.url': validProdImg,
      image: validProdImg
    } }
  );
  console.log('Product kada updated:', prodRes.modifiedCount);

  // Also check if any other product has broken photo-1611591475870
  const anyBroken = await Product.updateMany(
    { 'images.url': { $regex: '1611591475870' } },
    { $set: { 'images.$.url': validProdImg } }
  );
  console.log('Any other broken images updated:', anyBroken.modifiedCount);

  await mongoose.disconnect();
}

fixImages().catch(console.error);
