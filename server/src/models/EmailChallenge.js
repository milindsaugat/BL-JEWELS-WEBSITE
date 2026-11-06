import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  email: { type: String, required: true },
  purpose: { type: String, enum: ['login', 'reset'], required: true },
  digest: String,
  attempts: { type: Number, default: 0 },
  sentAt: Date,
  expiresAt: { type: Date, expires: 0 },
});
schema.index({ email: 1, purpose: 1 }, { unique: true });
export default mongoose.model('EmailChallenge', schema);
