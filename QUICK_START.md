# Quick Start Guide - Payment Integration

## Step 1: Install Required Packages

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## Step 2: Update Database

```bash
npx prisma generate
npx prisma db push
```

## Step 3: Add Environment Variables

Add these to your `.env` file:

```env
# Get these from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Test Payment

1. Go to http://localhost:3000
2. Add products to cart
3. Click "Place Order"
4. On checkout page, use test card: **4242 4242 4242 4242**
5. Use any future date, any CVC, any postal code
6. Click "Pay Now"

## That's It!

Your payment integration is now working. Check:
- ✅ Order status updates to PROCESSING after payment
- ✅ Payment status shows as "PAID"
- ✅ Admin can manage order status
- ✅ Customers can track orders

## Need Help?

See `PAYMENT_SETUP.md` for detailed instructions.
