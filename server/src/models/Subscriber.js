import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      enum: ['homepage', 'footer', 'admin', 'checkout'],
      default: 'homepage',
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed',
    },
    consentAt: {
      type: Date,
      default: () => new Date(),
    },
    adminViewed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
