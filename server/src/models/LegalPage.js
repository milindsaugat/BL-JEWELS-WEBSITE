import mongoose from 'mongoose';

const legalPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a page title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a unique slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Please provide page content'],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate slug if not provided or updated
legalPageSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

const LegalPage = mongoose.model('LegalPage', legalPageSchema);
export default LegalPage;

