export const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Free Trial',
    price: 0,
    duration: 14, // days
    limits: {
      maxLinks: 10,
      maxForms: 5,
      maxContactCards: 3,
      maxLeads: 100
    }
  },
  basic: {
    name: 'Basic',
    usd: {
      price: 9.99,
      stripePriceId: 'price_test_basic_usd', // Replace with your Stripe test price ID
      billingInterval: 'month'
    },
    inr: {
      price: 799,
      razorpayPlanId: 'plan_test_basic_inr', // Replace with your Razorpay test plan ID
      billingInterval: 'monthly'
    },
    limits: {
      maxLinks: 50,
      maxForms: 20,
      maxContactCards: 10,
      maxLeads: 1000
    }
  },
  pro: {
    name: 'Pro',
    usd: {
      price: 29.99,
      stripePriceId: 'price_test_pro_usd', // Replace with your Stripe test price ID
      billingInterval: 'month'
    },
    inr: {
      price: 2499,
      razorpayPlanId: 'plan_test_pro_inr', // Replace with your Razorpay test plan ID
      billingInterval: 'monthly'
    },
    limits: {
      maxLinks: 200,
      maxForms: 100,
      maxContactCards: 50,
      maxLeads: 10000
    }
  },
  enterprise: {
    name: 'Enterprise',
    usd: {
      price: 99.99,
      stripePriceId: 'price_test_enterprise_usd', // Replace with your Stripe test price ID
      billingInterval: 'month'
    },
    inr: {
      price: 7999,
      razorpayPlanId: 'plan_test_enterprise_inr', // Replace with your Razorpay test plan ID
      billingInterval: 'monthly'
    },
    limits: {
      maxLinks: -1, // unlimited
      maxForms: -1,
      maxContactCards: -1,
      maxLeads: -1
    }
  }
};
