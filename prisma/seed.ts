import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting database seed...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@shopnexus.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@shopnexus.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@shopnexus.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@shopnexus.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log("Created users:", { admin: admin.email, user: user.email });

  // Create products
  const products = [
    {
      name: "Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 199.99,
      stock: 50,
    },
    {
      name: "Smart Watch",
      description: "Fitness tracking smart watch with heart rate monitor",
      price: 299.99,
      stock: 30,
    },
    {
      name: "Laptop Stand",
      description: "Ergonomic aluminum laptop stand",
      price: 49.99,
      stock: 100,
    },
    {
      name: "USB-C Hub",
      description: "7-in-1 USB-C hub with HDMI and card reader",
      price: 39.99,
      stock: 75,
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard with blue switches",
      price: 129.99,
      stock: 0,
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      price: 59.99,
      stock: 60,
    },
    {
      name: "4K Monitor",
      description: "27-inch 4K UHD monitor with HDR support",
      price: 449.99,
      stock: 20,
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
  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
