import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';

dotenv.config({ path: 'server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bl-jewels';

const images = [
  {
    userImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    userImage: 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  },
  {
    userImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=80',
  },
  {
    userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
  },
  {
    userImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80',
  },
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const reviews = await Review.find({});
    console.log(`Found ${reviews.length} reviews to update.`);
    for (let i = 0; i < reviews.length; i++) {
      const imgData = images[i % images.length];
      await Review.findByIdAndUpdate(reviews[i]._id, {
        userImage: imgData.userImage,
        image: imgData.image,
        images: [imgData.image],
      });
    }
    console.log('✓ All reviews updated with userImage and worn jewelry image!');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

