# Subscription System Setup Guide

This document explains how to set up the subscription system with Stripe (USD) and Razorpay (INR) payment gateways.

## Features

- ✅ Free 14-day trial for new users
- ✅ Stripe integration for USD payments
- ✅ Razorpay integration for INR payments
- ✅ Subscription plans: Basic, Pro, Enterprise
- ✅ Resource limits based on subscription plan
- ✅ Webhook handlers for payment events

## Environment Variables

Add these to your `server/.env` file:

```env
# Stripe Test Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY_TEST=sk_test_51...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...

# Razorpay Test Keys (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID_TEST=rzp_test_...
RAZORPAY_SECRET_KEY_TEST=...
RAZORPAY_WEBHOOK_SECRET_TEST=...

# Frontend URL
FRONTEND_URL=https://clickmychat.netlify.app
```

## Stripe Setup

1. **Create Stripe Account**: Go to https://stripe.com and sign up
2. **Get Test Keys**: Dashboard → Developers → API keys
   - Copy `Publishable key` and `Secret key`
3. **Create Products & Prices**:
   - Products → Add product
   - Create: Basic ($9.99/month), Pro ($29.99/month), Enterprise ($99.99/month)
   - For each product, create a recurring monthly Price
   - Copy the Price IDs (e.g., `price_1ABC...`)
4. **Update Config**: Edit `server/config/subscriptionPlans.js` and replace:
   - `price_test_basic_usd` with your actual Stripe Price ID
   - `price_test_pro_usd` with your actual Stripe Price ID
   - `price_test_enterprise_usd` with your actual Stripe Price ID
5. **Webhook Setup** (for production):
   - Developers → Webhooks → Add endpoint
   - URL: `https://your-render-url.com/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Razorpay Setup

1. **Create Razorpay Account**: Go to https://razorpay.com and sign up
2. **Get Test Keys**: Settings → API Keys
   - Copy `Key ID` and `Key Secret`
3. **Create Plans**:
   - Settings → Plans → Create Plan
   - Create: Basic (₹799/month), Pro (₹2499/month), Enterprise (₹7999/month)
   - Copy the Plan IDs (e.g., `plan_ABC...`)
4. **Update Config**: Edit `server/config/subscriptionPlans.js` and replace:
   - `plan_test_basic_inr` with your actual Razorpay Plan ID
   - `plan_test_pro_inr` with your actual Razorpay Plan ID
   - `plan_test_enterprise_inr` with your actual Razorpay Plan ID
5. **Webhook Setup** (for production):
   - Settings → Webhooks → Add Webhook
   - URL: `https://your-render-url.com/api/payments/razorpay/webhook`
   - Events: `payment.captured`, `subscription.cancelled`

## Subscription Plans

### Free Trial (14 days)
- Max Links: 10
- Max Forms: 5
- Max Contact Cards: 3
- Max Leads: 100

### Basic Plan
- **USD**: $9.99/month
- **INR**: ₹799/month
- Max Links: 50
- Max Forms: 20
- Max Contact Cards: 10
- Max Leads: 1000

### Pro Plan
- **USD**: $29.99/month
- **INR**: ₹2499/month
- Max Links: 200
- Max Forms: 100
- Max Contact Cards: 50
- Max Leads: 10000

### Enterprise Plan
- **USD**: $99.99/month
- **INR**: ₹7999/month
- Unlimited everything

## API Endpoints

### Get Available Plans
```
GET /api/payments/plans?currency=USD
GET /api/payments/plans?currency=INR
```

### Stripe Checkout (USD)
```
POST /api/payments/stripe/create-checkout
Headers: Authorization: Bearer <token>
Body: { "planId": "basic" }
```

### Razorpay Order (INR)
```
POST /api/payments/razorpay/create-order
Headers: Authorization: Bearer <token>
Body: { "planId": "basic" }
```

### Verify Razorpay Payment
```
POST /api/payments/razorpay/verify
Headers: Authorization: Bearer <token>
Body: {
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "...",
  "planId": "basic"
}
```

### Webhooks
```
POST /api/payments/stripe/webhook
POST /api/payments/razorpay/webhook
```

## Testing

### Stripe Test Cards
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### Razorpay Test Cards
- Check Razorpay dashboard for test card numbers

## Notes

- All new users automatically get a 14-day free trial
- Trial expires automatically after 14 days
- Users must upgrade before trial expires to continue using the service
- Resource limits are enforced via middleware
- Subscription status is checked on protected routes
