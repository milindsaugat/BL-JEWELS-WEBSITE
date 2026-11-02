import mongoose from 'mongoose';

const occasionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Special Occasion',
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  badge: {
    type: String,
    default: 'Occasion',
    trim: true,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
  },
  cloudinaryPublicId: {
    type: String,
    default: '',
  },
  originalFilename: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '/collections',
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Occasion = mongoose.model('Occasion', occasionSchema);
export default Occasion;

