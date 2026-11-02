import { getDbStatus } from '../config/db.js';
import Review from '../models/Review.js';
import { memoryStore } from '../config/memoryStore.js';

export const getFeaturedReviews = async (req, res) => {
  try {
    if (getDbStatus()) {
      const reviews = await Review.find({ isFeatured: true }).sort({ rating: -1, createdAt: -1 }).limit(12);
      return res.json({ success: true, count: reviews.length, reviews });
    } else {
      const reviews = memoryStore.reviews.filter(r => r.isFeatured !== false).slice(0, 12);
      return res.json({ success: true, count: reviews.length, reviews });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    if (getDbStatus()) {
      const reviews = await Review.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, count: reviews.length, reviews });
    } else {
      return res.json({ success: true, count: memoryStore.reviews.length, reviews: memoryStore.reviews });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (getDbStatus()) {
      const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: reviews.length, reviews });
    } else {
      const reviews = memoryStore.reviews.filter(r => r.productId === productId || r.product === productId);
      return res.json({ success: true, count: reviews.length, reviews });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, userName, location, piece, image, userImage, images, verifiedPurchase, isFeatured } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required.' });
    }

    const reviewData = {
      product: productId || null,
      productId: productId || null,
      userName: userName || req.user?.name || 'Verified Customer',
      location: location || 'India',
      rating: Number(rating) || 5,
      title: title || '',
      comment,
      piece: piece || '22K Hallmarked Gold Creation',
      image: image || '',
      userImage: userImage || '',
      images: images || (image ? [image] : []),
      verifiedPurchase: verifiedPurchase !== false,
      isFeatured: isFeatured !== false,
      createdAt: new Date().toISOString(),
    };

    if (getDbStatus()) {
      const review = await Review.create(reviewData);
      return res.status(201).json({ success: true, review });
    } else {
      const review = {
        _id: `rev_${Date.now()}`,
        ...reviewData,
      };
      memoryStore.reviews.unshift(review);
      return res.status(201).json({ success: true, review });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDirectReview = async (req, res) => {
  try {
    const { rating, title, comment, userName, location, piece, image, userImage, images, verifiedPurchase, isFeatured } = req.body;

    if (!rating || !comment || !userName) {
      return res.status(400).json({ success: false, message: 'Customer name, rating, and review comment are required.' });
    }

    const reviewData = {
      userName,
      location: location || 'India',
      rating: Number(rating) || 5,
      title: title || '',
      comment,
      piece: piece || '22K Hallmarked Gold Creation',
      image: image || '',
      userImage: userImage || '',
      images: images || (image ? [image] : []),
      verifiedPurchase: verifiedPurchase !== false,
      isFeatured: isFeatured !== false,
      createdAt: new Date().toISOString(),
    };

    if (getDbStatus()) {
      const review = await Review.create(reviewData);
      return res.status(201).json({ success: true, review });
    } else {
      const review = {
        _id: `rev_${Date.now()}`,
        ...reviewData,
      };
      memoryStore.reviews.unshift(review);
      return res.status(201).json({ success: true, review });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getDbStatus()) {
      const updated = await Review.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
      return res.json({ success: true, review: updated });
    } else {
      const idx = memoryStore.reviews.findIndex(r => r._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Review not found' });
      memoryStore.reviews[idx] = { ...memoryStore.reviews[idx], ...updates };
      return res.json({ success: true, review: memoryStore.reviews[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      await Review.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Review deleted successfully' });
    } else {
      const idx = memoryStore.reviews.findIndex(r => r._id === id);
      if (idx !== -1) memoryStore.reviews.splice(idx, 1);
      return res.json({ success: true, message: 'Review deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
