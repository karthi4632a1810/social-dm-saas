import User from '../models/User.js';

export const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trial expired
    if (user.subscription.status === 'trial') {
      const now = new Date();
      if (user.subscription.trialEndsAt && now > user.subscription.trialEndsAt) {
        user.subscription.status = 'expired';
        await user.save();
      }
    }

    // Check if subscription is active
    if (user.subscription.status === 'expired' || user.subscription.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Subscription expired. Please upgrade to continue.',
        subscription: {
          status: user.subscription.status,
          plan: user.subscription.plan
        }
      });
    }

    req.user.subscription = user.subscription;
    req.user.limits = user.limits;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check specific resource limits
export const checkLimit = (resourceType) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      const limit = user.limits[`max${resourceType}`];
      
      if (limit === -1) {
        // Unlimited
        return next();
      }

      // Count existing resources
      let count = 0;
      switch (resourceType) {
        case 'Links':
          const Link = (await import('../models/Link.js')).default;
          count = await Link.countDocuments({ userId: req.user.userId });
          break;
        case 'Forms':
          const Form = (await import('../models/Form.js')).default;
          count = await Form.countDocuments({ userId: req.user.userId });
          break;
        case 'ContactCards':
          const ContactCard = (await import('../models/ContactCard.js')).default;
          count = await ContactCard.countDocuments({ userId: req.user.userId });
          break;
      }

      if (count >= limit) {
        return res.status(403).json({
          success: false,
          message: `You've reached your ${resourceType} limit (${limit}). Please upgrade your plan.`,
          limit,
          current: count
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};
