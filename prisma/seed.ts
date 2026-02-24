import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopnexus.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shopnexus.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@shopnexus.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@shopnexus.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Created users:', { admin: admin.email, user: user.email });

  // Create products with exact data provided
  const products = [
    {
      name: 'Classic Denim Pants',
      description: 'Timeless denim jacket with a modern fit and premium quality',
      price: 4500,
      stock: 38,
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Premium cotton t-shirts in assorted colors, pack of 3',
      price: 2500,
      stock: 125,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight running shoes with superior cushioning and support',
      price: 7500,
      stock: 67,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    },
    {
      name: 'Leather Boots',
      description: 'Genuine leather boots with durable construction and classic style',
      price: 9500,
      stock: 42,
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500',
    },
    {
      name: 'Casual Sneakers',
      description: 'Comfortable everyday sneakers with breathable mesh design',
      price: 5500,
      stock: 95,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    },
    {
      name: 'Slim Fit Jeans',
      description: 'Modern slim fit jeans with stretch fabric for comfort',
      price: 3800,
      stock: 78,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
    },
    {
      name: 'Hoodie Sweatshirt',
      description: 'Cozy fleece hoodie perfect for casual wear and layering',
      price: 3200,
      stock: 88,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    },
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 8500,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    },
    {
      name: 'Laptop Backpack',
      description: 'Water-resistant laptop backpack with USB charging port',
      price: 3500,
      stock: 32,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 1800,
      stock: 56,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with premium sound quality',
      price: 2500,
      stock: 120,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard for gaming and typing',
      price: 6500,
      stock: 41,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
    },
    {
      name: 'Screen Protector',
      description: 'Tempered glass screen protector for smartphones',
      price: 500,
      stock: 200,
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
    },
    {
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      price: 2800,
      stock: 63,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    },
    {
      name: 'Wireless Earbuds',
      description: 'True wireless earbuds with active noise cancellation',
      price: 9999,
      stock: 67,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracker smartwatch with heart rate monitor',
      price: 15000,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    },
    {
      name: 'Drawing Tablet',
      description: 'Graphics drawing tablet with pressure sensitivity',
      price: 12000,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    },
  ];

  // Delete existing products to ensure clean seed
  await prisma.product.deleteMany({});

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`Created ${products.length} products`);
  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
