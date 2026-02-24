#!/bin/bash

echo "========================================="
echo "ShopNexus Payment Integration Setup"
echo "========================================="
echo ""

# Install Stripe packages
echo "📦 Installing Stripe packages..."
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

echo ""
echo "✅ Packages installed successfully!"
echo ""

# Update database
echo "🗄️  Updating database schema..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Database updated successfully!"
echo ""

# Check for environment variables
echo "🔑 Checking environment variables..."
if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env && \
   grep -q "STRIPE_SECRET_KEY" .env && \
   grep -q "STRIPE_WEBHOOK_SECRET" .env; then
    echo "✅ Stripe environment variables found in .env"
else
    echo "⚠️  Warning: Stripe environment variables not found in .env"
    echo ""
    echo "Please add the following to your .env file:"
    echo ""
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here"
    echo "STRIPE_SECRET_KEY=sk_test_your_key_here"
    echo "STRIPE_WEBHOOK_SECRET=whsec_your_secret_here"
    echo ""
    echo "Get your keys from: https://dashboard.stripe.com/apikeys"
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Add your Stripe API keys to .env file"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test payment with card: 4242 4242 4242 4242"
echo ""
echo "For detailed instructions, see PAYMENT_SETUP.md"
echo ""
