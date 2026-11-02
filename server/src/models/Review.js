import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  userName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'India',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5,
  },
  title: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    required: true,
  },
  piece: {
    type: String,
    default: '22K Hallmarked Gold Creation',
  },
  verifiedPurchase: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: true,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  images: [String],
  image: {
    type: String,
    default: '',
  },
  userImage: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
