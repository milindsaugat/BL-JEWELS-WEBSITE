import mongoose from 'mongoose';

let isDbConnected = false;
let cachedPromise = null;

export const connectDB = async () => {
  if (isDbConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('⚠️ No MONGO_URI environment variable detected. Running in memory fallback mode.');
    isDbConnected = false;
    return null;
  }

  mongoose.set('strictQuery', false);

  cachedPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  }).then(async (conn) => {
    isDbConnected = true;
    console.log(`✦ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`✦ Database: ${conn.connection.name}`);

    return conn;
  }).catch((error) => {
    isDbConnected = false;
    cachedPromise = null;
    console.warn(`⚠️ MongoDB connection note: ${error.message}`);
    console.warn('ℹ️ BL Jewels server will run with mock/in-memory data fallback mode enabled.');
    return null;
  });

  return cachedPromise;
};

export const getDbStatus = () => isDbConnected;
