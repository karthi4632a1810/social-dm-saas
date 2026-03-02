import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'razorpay'],
    required: true
  },
  subscriptionId: {
    type: String,
    required: true
  },
  orderId: String, // For Razorpay
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid'],
    required: true
  },
  amount: Number,
  currency: {
    type: String,
    enum: ['USD', 'INR']
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: Boolean,
  canceledAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
