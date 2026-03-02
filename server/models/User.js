import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  avatar: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Subscription fields
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'trial', 'basic', 'pro', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'cancelled', 'past_due'],
      default: 'trial'
    },
    trialEndsAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      }
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      enum: ['USD', 'INR'],
      default: 'USD'
    }
  },
  // Payment gateway info
  stripe: {
    customerId: String,
    subscriptionId: String,
    priceId: String
  },
  razorpay: {
    customerId: String,
    subscriptionId: String,
    planId: String
  },
  // Limits based on plan
  limits: {
    maxLinks: {
      type: Number,
      default: 10
    },
    maxForms: {
      type: Number,
      default: 5
    },
    maxContactCards: {
      type: Number,
      default: 3
    },
    maxLeads: {
      type: Number,
      default: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
