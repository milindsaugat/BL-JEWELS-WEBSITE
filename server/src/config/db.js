import mongoose from 'mongoose';
import Category from '../models/Category.js';
import { seedDatabase } from '../seed/seeder.js';

let isDbConnected = false;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bl-jewels';
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB Atlas with reliable timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    
    isDbConnected = true;
    console.log(`✦ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`✦ Database: ${conn.connection.name}`);

    // Auto-seed if newly provisioned empty Atlas cluster
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('✦ Fresh Atlas database detected. Initiating initial catalog seeding...');
      await seedDatabase();
    } else {
      console.log(`✦ Database ready with ${categoryCount} active jewelry categories.`);
    }
  } catch (error) {
    isDbConnected = false;
    console.warn(`⚠️ MongoDB connection note: ${error.message}`);
    console.warn('ℹ️ BL Jewels server will run with mock/in-memory data fallback mode enabled for instant development!');
  }
};

export const getDbStatus = () => isDbConnected;
