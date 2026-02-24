# Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for ShopNexus.

## Prerequisites

1. Node.js and npm installed
2. PostgreSQL database running
3. Stripe account (sign up at https://stripe.com)

## Installation Steps

### 1. Install Required Packages

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Get Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Go to Developers > API keys
3. Copy your **Publishable key** and **Secret key**
4. For webhooks, go to Developers > Webhooks > Add endpoint

### 3. Update Environment Variables

Add the following to your `.env` file:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Update Database Schema

Run the following commands to update your database:

```bash
npx prisma generate
npx prisma db push
```

This will add the new payment-related fields to your Order model:
- `paymentStatus` (unpaid, paid, failed, refunded)
- `paymentIntentId` (Stripe payment intent ID)
- `paymentMethod` (card, upi, etc.)
- `shippingAddress`
- `updatedAt`

And update the OrderStatus enum to include:
- PENDING
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED

### 5. Set Up Stripe Webhook (for Production)

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/payment/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your `.env` file

### 6. Test Stripe Integration Locally

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payment/webhook
```

The CLI will provide a webhook signing secret - add this to your `.env` file.

### 7. Test Payment Flow

1. Start your development server: `npm run dev`
2. Add items to cart and proceed to checkout
3. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`
4. Use any future expiry date, any 3-digit CVC, and any postal code

## Payment Flow

1. **User places order** → Order created with status PENDING and paymentStatus unpaid
2. **User redirected to checkout** → Stripe PaymentIntent created
3. **User completes payment** → Stripe processes payment
4. **Webhook received** → Order updated to PROCESSING with paymentStatus paid
5. **Admin manages order** → Can update status to SHIPPED, DELIVERED, etc.

## Order Status Management

### Order Statuses
- **PENDING**: Order created, awaiting payment
- **PROCESSING**: Payment received, order being prepared
- **SHIPPED**: Order dispatched for delivery
- **DELIVERED**: Order successfully delivered
- **CANCELLED**: Order cancelled

### Payment Statuses
- **unpaid**: Payment not yet received
- **paid**: Payment successful
- **failed**: Payment attempt failed
- **refunded**: Payment refunded to customer

## Admin Features

Admins can:
1. View all orders with payment and order status
2. Update order status (PENDING → PROCESSING → SHIPPED → DELIVERED)
3. See payment method and payment intent ID
4. Filter and manage orders efficiently

## Customer Features

Customers can:
1. View their orders with current status
2. Pay for unpaid orders via "Pay Now" button
3. Track order progress (Pending → Processing → Shipped → Delivered)
4. See payment status for each order

## Security Notes

- Never commit your `.env` file to version control
- Use test keys for development
- Use live keys only in production
- Validate webhook signatures to prevent fraud
- Keep Stripe libraries up to date

## Troubleshooting

### Payment not updating after successful payment
- Check webhook is properly configured
- Verify webhook secret is correct
- Check server logs for webhook errors

### "Invalid API key" error
- Verify STRIPE_SECRET_KEY is set correctly
- Ensure you're using the correct key for your environment (test vs live)

### Checkout page not loading
- Verify NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set
- Check browser console for errors
- Ensure Stripe packages are installed

## Support

For Stripe-specific issues, refer to:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application issues, check the application logs and ensure all environment variables are properly configured.
