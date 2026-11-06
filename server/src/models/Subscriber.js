import mongoose from 'mongoose';
export default mongoose.model('Subscriber', new mongoose.Schema({ email: { type: String, unique: true, required: true }, consentAt: Date }, { timestamps: true }));
