import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  key: { type: String, default: 'goldapi', unique: true },
  enabled: { type: Boolean, default: true },
  encryptedApiKey: { type: String, select: false },
}, { timestamps: true });

export default mongoose.model('GoldRateConfig', schema);
