import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { protect } from '../middleware/auth.js';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans.js';

const router = express.Router();

// Initialize Stripe (Test Mode)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || 'sk_test_...', {
  apiVersion: '2024-11-20.acacia'
});

// Initialize Razorpay (Test Mode)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID_TEST || 'rzp_test_...',
  key_secret: process.env.RAZORPAY_SECRET_KEY_TEST || '...'
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
    
    const plans = Object.keys(SUBSCRIPTION_PLANS)
      .filter(key => key !== 'trial')
      .map(key => ({
        id: key,
        name: SUBSCRIPTION_PLANS[key].name,
        price: currency === 'USD' 
          ? SUBSCRIPTION_PLANS[key].usd.price 
          : SUBSCRIPTION_PLANS[key].inr.price,
        currency,
        limits: SUBSCRIPTION_PLANS[key].limits,
        stripePriceId: currency === 'USD' ? SUBSCRIPTION_PLANS[key].usd.stripePriceId : null,
        razorpayPlanId: currency === 'INR' ? SUBSCRIPTION_PLANS[key].inr.razorpayPlanId : null
      }));

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create Stripe Checkout Session (USD)
router.post('/stripe/create-checkout', protect, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!SUBSCRIPTION_PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    const plan = SUBSCRIPTION_PLANS[planId];

    // Create or get Stripe customer
    let customerId = user.stripe?.customerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      if (!user.stripe) user.stripe = {};
      user.stripe.customerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: plan.usd.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/cancel`,
      metadata: {
        userId: user._id.toString(),
        planId: planId
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create Razorpay Order (INR)
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!SUBSCRIPTION_PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    const amount = plan.inr.price * 100; // Convert to paise

    // Create Razorpay customer if not exists
    let customerId = user.razorpay?.customerId;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: user.name,
        email: user.email,
        contact: user.phone || '9999999999',
        notes: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      if (!user.razorpay) user.razorpay = {};
      user.razorpay.customerId = customerId;
      await user.save();
    }

    // Create order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `order_${user._id}_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        planId: planId,
        customerId: customerId
      }
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID_TEST
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify Razorpay Payment
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const user = await User.findById(req.user.userId);

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY_TEST)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Payment verified - update user subscription
    const plan = SUBSCRIPTION_PLANS[planId];
    
    user.subscription.plan = planId;
    user.subscription.status = 'active';
    user.subscription.currency = 'INR';
    user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    user.limits = plan.limits;
    if (!user.razorpay) user.razorpay = {};
    user.razorpay.subscriptionId = razorpay_payment_id;
    
    await user.save();

    // Create subscription record
    const subscription = new Subscription({
      userId: user._id,
      provider: 'razorpay',
      subscriptionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan: planId,
      status: 'active',
      amount: plan.inr.price,
      currency: 'INR',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await subscription.save();

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        plan: planId,
        status: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Stripe Webhook Handler
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleStripeCheckoutCompleted(session);
      break;
    
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleStripeSubscriptionUpdate(subscription);
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleStripeSubscriptionDeleted(deletedSubscription);
      break;
  }

  res.json({ received: true });
});

// Razorpay Webhook Handler
router.post('/razorpay/webhook', express.json(), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET_TEST;
    
    // Verify webhook signature
    const text = JSON.stringify(req.body);
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.captured':
        await handleRazorpayPaymentCaptured(payload);
        break;
      case 'subscription.cancelled':
        await handleRazorpaySubscriptionCancelled(payload);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
async function handleStripeCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const planId = session.metadata.planId;
  const user = await User.findById(userId);
  
  if (user) {
    const plan = SUBSCRIPTION_PLANS[planId];
    user.subscription.plan = planId;
    user.subscription.status = 'active';
    user.subscription.currency = 'USD';
    user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.limits = plan.limits;
    if (!user.stripe) user.stripe = {};
    user.stripe.subscriptionId = session.subscription;
    await user.save();

    // Create subscription record
    const subscription = new Subscription({
      userId: user._id,
      provider: 'stripe',
      subscriptionId: session.subscription,
      plan: planId,
      status: 'active',
      amount: plan.usd.price,
      currency: 'USD',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await subscription.save();
  }
}

async function handleStripeSubscriptionUpdate(subscription) {
  const user = await User.findOne({ 'stripe.subscriptionId': subscription.id });
  if (user) {
    user.subscription.status = subscription.status;
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await user.save();
  }
}

async function handleStripeSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'stripe.subscriptionId': subscription.id });
  if (user) {
    user.subscription.status = 'cancelled';
    user.subscription.plan = 'free';
    await user.save();
  }
}

async function handleRazorpayPaymentCaptured(payload) {
  const userId = payload.payment.entity.notes?.userId;
  const planId = payload.payment.entity.notes?.planId;
  
  if (userId && planId) {
    const user = await User.findById(userId);
    if (user) {
      const plan = SUBSCRIPTION_PLANS[planId];
      user.subscription.plan = planId;
      user.subscription.status = 'active';
      user.subscription.currency = 'INR';
      user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.limits = plan.limits;
      await user.save();
    }
  }
}

async function handleRazorpaySubscriptionCancelled(payload) {
  const subscriptionId = payload.subscription.entity.id;
  const subscription = await Subscription.findOne({ subscriptionId });
  
  if (subscription) {
    const user = await User.findById(subscription.userId);
    if (user) {
      user.subscription.status = 'cancelled';
      user.subscription.plan = 'free';
      await user.save();
    }
  }
}

export default router;
