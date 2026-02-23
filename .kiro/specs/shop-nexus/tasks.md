# Implementation Plan: ShopNexus Ecommerce Application

## Overview

This implementation plan breaks down the ShopNexus ecommerce application into discrete, incremental coding tasks. The application uses Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma ORM, NextAuth, and TailwindCSS. Tasks are organized to build foundational components first, then layer on features, with property-based tests integrated throughout to catch errors early.

## Tasks

- [x] 1. Set up database schema and core infrastructure
  - [x] 1.1 Create Prisma schema with all models
    - Define User, Product, Order, OrderItem, CartItem models
    - Add enums for Role (USER, ADMIN) and OrderStatus (PENDING, PAID)
    - Configure relationships and constraints (unique email, foreign keys, indexes)
    - Set up Prisma client output to `src/generated/prisma`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [x] 1.2 Create database migration
    - Run `npx prisma migrate dev --name init` to create initial migration
    - Verify migration creates all tables with correct schema
    - _Requirements: 10.1-10.7_
  
  - [x] 1.3 Create Prisma client singleton
    - Create `src/core/lib/prisma.ts` with singleton pattern
    - Handle development hot-reload edge cases
    - Export configured Prisma client instance
    - _Requirements: 10.1_
  
  - [x] 1.4 Create database seed script
    - Create `prisma/seed.ts` with sample data
    - Create admin user (admin@shopnexus.com) and regular user (user@shopnexus.com)
    - Create at least 5 sample products with varying prices and stock
    - Use bcrypt to hash passwords for seeded users
    - Configure package.json with prisma seed command
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 1.5 Write unit tests for seed script
    - Test that seed script creates expected users and products
    - Verify password hashing for seeded users
    - Test idempotency (running seed multiple times)
    - _Requirements: 13.1-13.5_

- [x] 2. Implement validation schemas
  - [x] 2.1 Create user validation schemas
    - Create `src/core/schemas/user.schema.ts`
    - Define registerSchema (name, email, password with min 8 chars)
    - Define loginSchema (email, password)
    - Export schemas and infer TypeScript types
    - _Requirements: 1.5, 2.1, 11.1, 11.3_
  
  - [x] 2.2 Create product validation schemas
    - Create `src/core/schemas/product.schema.ts`
    - Define createProductSchema (name, description, positive price, non-negative stock)
    - Define updateProductSchema as partial of createProductSchema
    - _Requirements: 5.4, 11.1, 11.3_
  
  - [x] 2.3 Create cart validation schemas
    - Create `src/core/schemas/cart.schema.ts`
    - Define addToCartSchema (productId UUID, positive quantity)
    - Define updateCartItemSchema (positive quantity)
    - _Requirements: 6.1, 6.3, 11.1, 11.3_
  
  - [x] 2.4 Create order validation schemas
    - Create `src/core/schemas/order.schema.ts`
    - Define createOrderSchema (array of items with productId and quantity)
    - Define updateOrderStatusSchema (status enum: PENDING or PAID)
    - _Requirements: 7.1, 9.3, 11.1, 11.3_
  
  - [ ]* 2.5 Write property test for validation schemas
    - **Property 2: Invalid Registration Data Rejected**
    - **Validates: Requirements 1.5**
    - Test that invalid email formats and passwords < 8 chars are rejected
  
  - [ ]* 2.6 Write property test for product validation
    - **Property 14: Invalid Product Data Rejected**
    - **Validates: Requirements 5.4**
    - Test that negative prices and negative stock are rejected

- [x] 3. Implement authentication system
  - [x] 3.1 Create bcrypt utility
    - Create `src/core/lib/bcrypt.ts`
    - Implement hashPassword function (bcrypt with salt rounds 10)
    - Implement comparePassword function
    - _Requirements: 1.3, 2.2_
  
  - [x] 3.2 Create NextAuth configuration
    - Create `src/core/lib/auth.ts`
    - Configure NextAuth with credentials provider
    - Implement JWT session strategy
    - Add callbacks to include user ID and role in session
    - Set custom sign-in page to `/login`
    - _Requirements: 2.1, 2.3, 2.5_
  
  - [x] 3.3 Create NextAuth API route handler
    - Create `src/app/api/auth/[...nextauth]/route.ts`
    - Export GET and POST handlers from NextAuth config
    - _Requirements: 2.1_
  
  - [x] 3.4 Create user registration API endpoint
    - Create `src/app/api/register/route.ts`
    - Validate request body with registerSchema
    - Check for existing email (return 409 if exists)
    - Hash password with bcrypt
    - Create user record with Prisma
    - Return 201 on success, handle errors (400, 409, 500)
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 11.2, 12.2_
  
  - [ ]* 3.5 Write property test for user registration
    - **Property 1: User Registration Creates Hashed Password**
    - **Validates: Requirements 1.1, 1.2, 1.3, 10.5**
    - Test that any valid registration data creates user with bcrypt hash
  
  - [ ]* 3.6 Write property test for authentication
    - **Property 3: Valid Credentials Create Session**
    - **Validates: Requirements 2.1, 2.5**
    - Test that correct credentials create JWT session with user ID and role
  
  - [ ]* 3.7 Write property test for invalid credentials
    - **Property 4: Invalid Credentials Rejected**
    - **Validates: Requirements 2.2**
    - Test that incorrect passwords are rejected without creating session
  
  - [x] 3.8 Create NextAuth type definitions
    - Create `src/core/types/next-auth.d.ts`
    - Extend NextAuth Session and JWT types to include role
    - _Requirements: 2.5_

- [x] 4. Implement route protection middleware
  - [x] 4.1 Create authentication middleware
    - Create `src/middleware.ts`
    - Use NextAuth getToken to check authentication
    - Redirect unauthenticated users to `/login` for protected routes
    - Check user role for admin routes (return 403 if not ADMIN)
    - Configure matcher for `/products/*`, `/cart/*`, `/orders/*`, `/admin/*`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 4.2 Write property test for unauthenticated access
    - **Property 5: Unauthenticated Access Blocked**
    - **Validates: Requirements 3.1**
    - Test that any protected route redirects to login without auth
  
  - [ ]* 4.3 Write property test for role-based access control
    - **Property 6: Role-Based Access Control**
    - **Validates: Requirements 3.2**
    - Test that USER role cannot access admin routes
  
  - [ ]* 4.4 Write property test for admin access
    - **Property 7: Admin Access Granted**
    - **Validates: Requirements 3.3**
    - Test that ADMIN role can access admin routes

- [x] 5. Checkpoint - Ensure authentication and middleware tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement product service and API endpoints
  - [x] 6.1 Create product service layer
    - Create `src/core/services/product.service.ts`
    - Implement getAllProducts (ordered by createdAt)
    - Implement getProductById
    - Implement createProduct
    - Implement updateProduct
    - Implement deleteProduct (check for associated orders)
    - Implement checkStock helper
    - _Requirements: 4.1, 4.3, 5.1, 5.2, 5.3, 5.5_
  
  - [x] 6.2 Create product list API endpoint
    - Create `src/app/api/products/route.ts` with GET handler
    - Check authentication (return 401 if not authenticated)
    - Call getAllProducts from service
    - Return products array with 200 status
    - _Requirements: 4.1, 4.3_
  
  - [x] 6.3 Create product creation API endpoint
    - Add POST handler to `src/app/api/products/route.ts`
    - Check authentication and admin role (return 403 if not admin)
    - Validate request body with createProductSchema
    - Call createProduct from service
    - Return created product with 201 status
    - _Requirements: 5.1, 5.4, 11.2_
  
  - [x] 6.4 Create product detail/update/delete API endpoints
    - Create `src/app/api/products/[id]/route.ts`
    - Implement GET handler (return product or 404)
    - Implement PATCH handler (admin only, validate with updateProductSchema)
    - Implement DELETE handler (admin only, check for orders, return 409 if has orders)
    - _Requirements: 4.1, 5.2, 5.3, 5.4, 5.5, 12.4_
  
  - [ ]* 6.5 Write property test for product listing
    - **Property 8: Product Listing Contains All Fields**
    - **Validates: Requirements 4.1**
    - Test that any set of products includes name, description, price, stock
  
  - [ ]* 6.6 Write property test for zero stock indication
    - **Property 9: Zero Stock Indicated**
    - **Validates: Requirements 4.2**
    - Test that products with stock=0 are marked as out of stock
  
  - [ ]* 6.7 Write property test for product ordering
    - **Property 10: Products Ordered By Creation Date**
    - **Validates: Requirements 4.3**
    - Test that products are ordered by createdAt (oldest first)
  
  - [ ]* 6.8 Write property test for product creation
    - **Property 11: Product Creation Succeeds**
    - **Validates: Requirements 5.1**
    - Test that any valid product data creates a product record
  
  - [ ]* 6.9 Write property test for product update
    - **Property 12: Product Update Persists Changes**
    - **Validates: Requirements 5.2**
    - Test that product updates persist correctly
  
  - [ ]* 6.10 Write property test for product deletion
    - **Property 13: Product Deletion Removes Record**
    - **Validates: Requirements 5.3**
    - Test that products without orders can be deleted
  
  - [ ]* 6.11 Write property test for product deletion with orders
    - **Property 15: Product With Orders Cannot Be Deleted**
    - **Validates: Requirements 5.5**
    - Test that products with order items cannot be deleted

- [x] 7. Implement cart service and API endpoints
  - [x] 7.1 Create cart service layer
    - Create `src/core/services/cart.service.ts`
    - Implement getCart (with product details)
    - Implement addToCart (check stock, handle duplicate products)
    - Implement updateCartItem
    - Implement removeFromCart
    - Implement clearCart
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.2 Create cart list and add API endpoints
    - Create `src/app/api/cart/route.ts`
    - Implement GET handler (return user's cart items)
    - Implement POST handler (validate with addToCartSchema, check stock)
    - Return appropriate errors (400 for validation, 409 for insufficient stock)
    - _Requirements: 6.1, 6.2, 11.2_
  
  - [x] 7.3 Create cart item update/delete API endpoints
    - Create `src/app/api/cart/[id]/route.ts`
    - Implement PATCH handler (validate quantity, check stock)
    - Implement DELETE handler (remove cart item)
    - Return 404 if cart item not found
    - _Requirements: 6.3, 6.4, 12.4_
  
  - [ ]* 7.4 Write property test for add to cart
    - **Property 16: Add To Cart Stores Item**
    - **Validates: Requirements 6.1**
    - Test that any valid product and quantity creates cart item
  
  - [ ]* 7.5 Write property test for insufficient stock
    - **Property 17: Insufficient Stock Rejected**
    - **Validates: Requirements 6.2**
    - Test that quantity exceeding stock is rejected
  
  - [ ]* 7.6 Write property test for cart quantity update
    - **Property 18: Cart Quantity Update Persists**
    - **Validates: Requirements 6.3**
    - Test that cart item quantity updates persist
  
  - [ ]* 7.7 Write property test for cart item removal
    - **Property 19: Cart Item Removal Deletes Record**
    - **Validates: Requirements 6.4**
    - Test that removing cart item deletes the record
  
  - [ ]* 7.8 Write property test for cart persistence
    - **Property 20: Cart Persists Across Sessions**
    - **Validates: Requirements 6.5**
    - Test that cart items persist after logout and login

- [x] 8. Implement order service and API endpoints
  - [x] 8.1 Create order service layer
    - Create `src/core/services/order.service.ts`
    - Implement createOrder with transaction (validate stock, create order, create order items, reduce stock, clear cart)
    - Implement getUserOrders (ordered by createdAt desc)
    - Implement getAllOrders (for admin)
    - Implement getOrderById (with order items and product details)
    - Implement updateOrderStatus
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.4_
  
  - [x] 8.2 Create order list and creation API endpoints
    - Create `src/app/api/orders/route.ts`
    - Implement GET handler (return user's orders, or all orders if admin)
    - Implement POST handler (validate with createOrderSchema, call createOrder service)
    - Handle transaction errors (return 400 for insufficient stock, 500 for failures)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.3, 9.1, 11.2, 12.1_
  
  - [x] 8.3 Create order detail and update API endpoints
    - Create `src/app/api/orders/[id]/route.ts`
    - Implement GET handler (return order with items, check ownership or admin)
    - Implement PATCH handler (admin only, validate with updateOrderStatusSchema)
    - Return 403 if user tries to access another user's order
    - Return 404 if order not found
    - _Requirements: 8.2, 8.4, 9.2, 9.3, 9.4, 12.3, 12.4_
  
  - [ ]* 8.4 Write property test for order creation status
    - **Property 21: Order Creation Sets Pending Status**
    - **Validates: Requirements 7.1**
    - Test that any valid order is created with PENDING status
  
  - [ ]* 8.5 Write property test for order items creation
    - **Property 22: Order Items Created From Cart**
    - **Validates: Requirements 7.2**
    - Test that order items match cart items
  
  - [ ]* 8.6 Write property test for order total calculation
    - **Property 23: Order Total Calculated Correctly**
    - **Validates: Requirements 7.3**
    - Test that order total equals sum of (price × quantity) for all items
  
  - [ ]* 8.7 Write property test for stock reduction
    - **Property 24: Stock Reduced By Order Quantity**
    - **Validates: Requirements 7.4**
    - Test that product stock decreases by ordered quantity
  
  - [ ]* 8.8 Write property test for insufficient stock order rejection
    - **Property 25: Insufficient Stock Prevents Order**
    - **Validates: Requirements 7.5**
    - Test that orders with insufficient stock are rejected
  
  - [ ]* 8.9 Write property test for cart clearing
    - **Property 26: Successful Order Clears Cart**
    - **Validates: Requirements 7.6**
    - Test that cart is empty after successful order
  
  - [ ]* 8.10 Write property test for user order filtering
    - **Property 27: User Sees Only Own Orders**
    - **Validates: Requirements 8.1**
    - Test that users only see their own orders
  
  - [ ]* 8.11 Write property test for order details
    - **Property 28: Order Details Include All Fields**
    - **Validates: Requirements 8.2**
    - Test that order details include products, quantities, prices, total, status
  
  - [ ]* 8.12 Write property test for order ordering
    - **Property 29: Orders Ordered By Date Descending**
    - **Validates: Requirements 8.3**
    - Test that orders are ordered by createdAt (newest first)
  
  - [ ]* 8.13 Write property test for order items inclusion
    - **Property 30: Order Includes All Order Items**
    - **Validates: Requirements 8.4**
    - Test that all order item records are included in order details
  
  - [ ]* 8.14 Write property test for admin order access
    - **Property 31: Admin Sees All Orders**
    - **Validates: Requirements 9.1**
    - Test that admin users see orders from all users
  
  - [ ]* 8.15 Write property test for order status update
    - **Property 32: Order Status Update Persists**
    - **Validates: Requirements 9.2**
    - Test that order status updates persist correctly
  
  - [ ]* 8.16 Write property test for invalid order status
    - **Property 33: Invalid Order Status Rejected**
    - **Validates: Requirements 9.3**
    - Test that invalid status values are rejected
  
  - [ ]* 8.17 Write property test for status transition
    - **Property 34: Status Transition PENDING to PAID Allowed**
    - **Validates: Requirements 9.4**
    - Test that PENDING to PAID transition is allowed

- [x] 9. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement authentication pages
  - [x] 10.1 Create login page
    - Create `src/app/(auth)/login/page.tsx`
    - Build form with email and password fields
    - Use NextAuth signIn on form submit
    - Redirect to `/products` on success
    - Display error messages on failure
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 10.2 Create registration page
    - Create `src/app/(auth)/register/page.tsx`
    - Build form with name, email, and password fields
    - Call `/api/register` on form submit
    - Redirect to `/login` on success
    - Display validation errors
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 10.3 Create root layout with navigation
    - Create `src/app/layout.tsx`
    - Add navigation bar with links (Products, Cart, Orders, Admin for admins)
    - Show login/logout buttons based on session
    - Include TailwindCSS configuration
    - _Requirements: 2.1, 3.1_
  
  - [x] 10.4 Create home page with redirect
    - Create `src/app/page.tsx`
    - Redirect authenticated users to `/products`
    - Redirect unauthenticated users to `/login`
    - _Requirements: 2.4_

- [x] 11. Implement product pages
  - [x] 11.1 Create product listing page
    - Create `src/app/(protected)/products/page.tsx`
    - Fetch products from `/api/products`
    - Display product grid with name, description, price, stock
    - Show "Out of Stock" badge for products with stock=0
    - Add "View Details" link for each product
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 11.2 Create product detail page
    - Create `src/app/(protected)/products/[id]/page.tsx`
    - Fetch product details from `/api/products/[id]`
    - Display full product information
    - Add "Add to Cart" button with quantity selector
    - Disable button if out of stock
    - Call `/api/cart` on add to cart
    - _Requirements: 4.1, 4.2, 4.4, 6.1, 6.2_

- [x] 12. Implement cart page
  - [x] 12.1 Create cart page
    - Create `src/app/(protected)/cart/page.tsx`
    - Fetch cart items from `/api/cart`
    - Display cart items with product details, quantity, and subtotal
    - Add quantity update controls (call `/api/cart/[id]` PATCH)
    - Add remove button (call `/api/cart/[id]` DELETE)
    - Display cart total
    - Add "Place Order" button (call `/api/orders` POST)
    - Show empty cart message if no items
    - _Requirements: 6.1, 6.3, 6.4, 7.1_

- [x] 13. Implement order pages
  - [x] 13.1 Create order list page
    - Create `src/app/(protected)/orders/page.tsx`
    - Fetch user's orders from `/api/orders`
    - Display orders with date, total, status
    - Add "View Details" link for each order
    - Show empty state if no orders
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 13.2 Create order detail page
    - Create `src/app/(protected)/orders/[id]/page.tsx`
    - Fetch order details from `/api/orders/[id]`
    - Display order items with product names, quantities, prices
    - Show order total and status
    - Display order date
    - _Requirements: 8.2, 8.4_

- [x] 14. Implement admin pages
  - [x] 14.1 Create admin product list page
    - Create `src/app/admin/products/page.tsx`
    - Fetch products from `/api/products`
    - Display products table with edit and delete buttons
    - Add "Create Product" button linking to new product page
    - Handle delete with confirmation (call `/api/products/[id]` DELETE)
    - Show error if product has orders
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 14.2 Create admin product creation page
    - Create `src/app/admin/products/new/page.tsx`
    - Build form with name, description, price, stock fields
    - Call `/api/products` POST on submit
    - Redirect to admin products page on success
    - Display validation errors
    - _Requirements: 5.1, 5.4_
  
  - [x] 14.3 Create admin product edit page
    - Create `src/app/admin/products/[id]/edit/page.tsx`
    - Fetch product details from `/api/products/[id]`
    - Pre-fill form with existing product data
    - Call `/api/products/[id]` PATCH on submit
    - Redirect to admin products page on success
    - Display validation errors
    - _Requirements: 5.2, 5.4_
  
  - [x] 14.4 Create admin order management page
    - Create `src/app/admin/orders/page.tsx`
    - Fetch all orders from `/api/orders`
    - Display orders table with user, date, total, status
    - Add status update dropdown (PENDING/PAID)
    - Call `/api/orders/[id]` PATCH on status change
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 15. Implement database schema property tests
  - [ ]* 15.1 Write property test for UUID generation
    - **Property 35: Record IDs Are Valid UUIDs**
    - **Validates: Requirements 10.6**
    - Test that created records have valid UUID format
  
  - [ ]* 15.2 Write property test for foreign key integrity
    - **Property 36: Foreign Key Integrity Enforced**
    - **Validates: Requirements 10.7**
    - Test that invalid foreign keys are rejected

- [ ] 16. Implement API validation and error handling property tests
  - [ ]* 16.1 Write property test for validation errors
    - **Property 37: Invalid Request Data Returns 400**
    - **Validates: Requirements 11.1, 11.2, 12.2**
    - Test that schema validation failures return 400 with error details
  
  - [ ]* 16.2 Write property test for authorization errors
    - **Property 38: Authorization Errors Return 403**
    - **Validates: Requirements 12.3**
    - Test that permission violations return 403
  
  - [ ]* 16.3 Write property test for not found errors
    - **Property 39: Not Found Errors Return 404**
    - **Validates: Requirements 12.4**
    - Test that missing resources return 404

- [ ] 17. Write integration tests
  - [ ]* 17.1 Write end-to-end order flow test
    - Test complete flow: register → login → browse products → add to cart → place order
    - Verify cart clears after order
    - Verify stock reduces correctly
    - _Requirements: 1.1, 2.1, 4.1, 6.1, 7.1, 7.4, 7.6_
  
  - [ ]* 17.2 Write admin flow test
    - Test admin flow: login as admin → create product → update product → view all orders → update order status
    - Verify admin can access all admin routes
    - _Requirements: 2.1, 3.3, 5.1, 5.2, 9.1, 9.2_
  
  - [ ]* 17.3 Write authorization flow test
    - Test that USER cannot access admin routes
    - Test that unauthenticated users are redirected
    - _Requirements: 3.1, 3.2_

- [x] 18. Final checkpoint - Run full test suite
  - Ensure all tests pass, ask the user if questions arise.
  - Run database migrations and seed script
  - Verify all API endpoints work correctly
  - Test authentication and authorization flows

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end user flows
- The implementation follows Next.js 16 App Router conventions with TypeScript
- All API endpoints include proper error handling (400, 401, 403, 404, 409, 500)
- Database operations use Prisma ORM with transaction support for order creation
- Authentication uses NextAuth with JWT strategy and bcrypt password hashing
- Middleware protects routes based on authentication status and user role
