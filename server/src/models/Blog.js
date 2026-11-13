import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: true,
      default: '<p></p>',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80',
    },
    category: {
      type: String,
      default: 'Bridal Heritage',
      trim: true,
      index: true,
    },
    authorName: {
      type: String,
      default: 'BL Jewels Editorial Atelier',
      trim: true,
    },
    authorRole: {
      type: String,
      default: 'Master Gemologists & Heritage Curators',
      trim: true,
    },
    readTimeMinutes: {
      type: Number,
      default: 4,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: () => new Date(),
    },
    views: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: { type: String, default: '', trim: true },
      metaDescription: { type: String, default: '', trim: true },
      metaKeywords: { type: [String], default: [] },
      ogImage: { type: String, default: '', trim: true },
      canonicalUrl: { type: String, default: '', trim: true },
    },
  },
  { timestamps: true }
);

blogSchema.index({ isPublished: 1, publishedAt: -1 });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
export default Blog;

