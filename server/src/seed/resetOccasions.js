import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Occasion from '../models/Occasion.js';
import { DEFAULT_OCCASIONS } from './occasionData.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resetOccasions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found in server/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    // Delete existing old occasions
    const deleteRes = await Occasion.deleteMany({});
    console.log(`Deleted ${deleteRes.deletedCount} old occasions.`);

    // Insert 6 new occasions from user specification
    const insertRes = await Occasion.insertMany(DEFAULT_OCCASIONS);
    console.log(`Inserted ${insertRes.length} new occasions:`);
    insertRes.forEach(o => {
      console.log(`- [${o.order}] ${o.title} (${o.badge}): ${o.subtitle}`);
    });

    console.log('Occasions reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting occasions:', error);
    process.exit(1);
  }
};

resetOccasions();
