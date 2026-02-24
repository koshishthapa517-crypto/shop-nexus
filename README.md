# ShopNexus - E-Commerce Platform

A full-stack e-commerce platform built with Next.js 15, Prisma, PostgreSQL, and Stripe payment integration.

## Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart functionality
- 👤 User authentication (NextAuth.js)
- 💳 Payment processing (Stripe - Mock mode for testing)
- 📦 Order management
- 👨‍💼 Admin dashboard for product and order management
- 📊 Sales analytics and reporting

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL (via Docker or local installation)
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd shop-nexus
npm install
```

### 2. Setup Database

Start PostgreSQL with Docker:

```bash
docker-compose up -d
```

### 3. Configure Environment

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Payment Mode: "stripe" or "mock"
NEXT_PUBLIC_PAYMENT_MODE="mock"
PAYMENT_MODE="mock"
```

### 4. Setup Database Schema

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

**Admin Account:**
- Email: admin@shopnexus.com
- Password: admin123

**User Account:**
- Email: user@shopnexus.com
- Password: password123

## Project Structure

```
shop-nexus/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (protected)/  # Protected user pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── api/          # API routes
│   │   └── products/     # Product pages
│   ├── components/       # Reusable components
│   ├── core/
│   │   ├── lib/          # Utilities (auth, prisma, etc.)
│   │   ├── schemas/      # Zod validation schemas
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│   └── generated/        # Prisma generated client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Payment Testing

The app is configured for mock payments by default. To test:

1. Add products to cart
2. Place order
3. Use any card details (e.g., 4242 4242 4242 4242)
4. Payment will succeed automatically

To use real Stripe:
1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Update `.env` with your keys
3. Change `PAYMENT_MODE` to `"stripe"`

## Admin Features

Access admin dashboard at `/admin`:

- View sales statistics
- Manage products (create, edit, delete)
- Manage orders (update status)
- View customer information

## Database Schema

Main models:
- **User** - Customer and admin accounts
- **Product** - Product catalog
- **Order** - Customer orders
- **OrderItem** - Order line items
- **CartItem** - Shopping cart items

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
