import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    originalName: {
      type: String,
      default: '',
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const replySchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ['customer', 'admin'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['contact', 'ticket'],
      default: 'ticket',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    occasion: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General Inquiry',
      trim: true,
    },
    orderNumber: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'replied', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
    },
    returnReasons: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    replies: {
      type: [replySchema],
      default: [],
    },
    lastRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ type: 1, status: 1, createdAt: -1 });

const SupportTicket =
  mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;

