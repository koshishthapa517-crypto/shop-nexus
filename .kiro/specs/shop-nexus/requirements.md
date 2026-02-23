# Requirements Document

## Introduction

ShopNexus is a full-stack ecommerce web application that enables users to browse and purchase products while providing administrators with tools to manage inventory and orders. The system uses Next.js with TypeScript, PostgreSQL database via Prisma ORM, NextAuth for authentication, and TailwindCSS for styling.

## Glossary

- **ShopNexus_System**: The complete ecommerce web application
- **Authentication_Service**: The NextAuth-based service handling user login, signup, and session management
- **User**: A registered person with USER role who can browse and purchase products
- **Admin**: A registered person with ADMIN role who can manage products and orders
- **Product_Catalog**: The collection of products available for purchase
- **Order_Service**: The service handling order creation and management
- **Cart**: Temporary storage of products a User intends to purchase
- **Middleware_Guard**: Next.js middleware that protects routes based on authentication and authorization
- **API_Handler**: Next.js Route Handler that processes HTTP requests
- **Database_Schema**: Prisma schema defining data models and relationships
- **Validation_Service**: Zod-based service that validates request data

## Requirements

### Requirement 1: User Registration

**User Story:** As a visitor, I want to register with email and password, so that I can create an account to purchase products

#### Acceptance Criteria

1. WHEN a visitor submits valid registration data, THE Authentication_Service SHALL create a new User record with hashed password
2. WHEN a visitor submits an email that already exists, THE Authentication_Service SHALL return an error message
3. THE Authentication_Service SHALL hash passwords using bcrypt before storage
4. WHEN registration succeeds, THE Authentication_Service SHALL redirect the User to the login page
5. THE Validation_Service SHALL validate that email format is correct and password meets minimum requirements

### Requirement 2: User Authentication

**User Story:** As a registered user, I want to login with my credentials, so that I can access my account and make purchases

#### Acceptance Criteria

1. WHEN a User submits valid credentials, THE Authentication_Service SHALL create a JWT session
2. WHEN a User submits invalid credentials, THE Authentication_Service SHALL return an error message
3. THE Authentication_Service SHALL use JWT session strategy for session management
4. WHEN authentication succeeds, THE Authentication_Service SHALL redirect the User to the products page
5. THE Authentication_Service SHALL store user role in the JWT token

### Requirement 3: Route Protection

**User Story:** As a system administrator, I want protected routes to require authentication, so that unauthorized users cannot access restricted content

#### Acceptance Criteria

1. WHEN an unauthenticated visitor attempts to access a protected route, THE Middleware_Guard SHALL redirect them to the login page
2. WHEN a User attempts to access an admin route, THE Middleware_Guard SHALL block access and return an error
3. WHEN an Admin attempts to access an admin route, THE Middleware_Guard SHALL allow access
4. THE Middleware_Guard SHALL protect all routes under /admin path
5. THE Middleware_Guard SHALL protect all routes under /orders path

### Requirement 4: Product Catalog Display

**User Story:** As a user, I want to view a list of available products, so that I can browse what is available for purchase

#### Acceptance Criteria

1. WHEN a User accesses the products page, THE Product_Catalog SHALL display all products with name, description, price, and stock
2. WHEN a product has zero stock, THE Product_Catalog SHALL indicate the product is out of stock
3. THE API_Handler SHALL retrieve products from the database ordered by creation date
4. WHEN a User clicks on a product, THE ShopNexus_System SHALL display detailed product information

### Requirement 5: Product Management

**User Story:** As an admin, I want to create, edit, and delete products, so that I can manage the product catalog

#### Acceptance Criteria

1. WHEN an Admin submits valid product data, THE API_Handler SHALL create a new Product record
2. WHEN an Admin updates product data, THE API_Handler SHALL modify the existing Product record
3. WHEN an Admin deletes a product, THE API_Handler SHALL remove the Product record from the database
4. THE Validation_Service SHALL validate that price is a positive decimal and stock is a non-negative integer
5. WHERE a product has associated orders, THE API_Handler SHALL prevent deletion and return an error message

### Requirement 6: Shopping Cart

**User Story:** As a user, I want to add products to a cart, so that I can purchase multiple items in a single order

#### Acceptance Criteria

1. WHEN a User adds a product to cart, THE ShopNexus_System SHALL store the product and quantity
2. WHEN a User adds a product with insufficient stock, THE ShopNexus_System SHALL return an error message
3. WHEN a User modifies cart quantity, THE ShopNexus_System SHALL update the stored quantity
4. WHEN a User removes a product from cart, THE ShopNexus_System SHALL delete the cart item
5. THE ShopNexus_System SHALL persist cart data across sessions

### Requirement 7: Order Placement

**User Story:** As a user, I want to place an order for items in my cart, so that I can complete my purchase

#### Acceptance Criteria

1. WHEN a User submits an order, THE Order_Service SHALL create an Order record with status PENDING
2. WHEN an order is created, THE Order_Service SHALL create OrderItem records for each cart item
3. WHEN an order is created, THE Order_Service SHALL calculate and store the total amount
4. WHEN an order is created, THE Order_Service SHALL reduce product stock by the ordered quantity
5. IF a product has insufficient stock during order placement, THEN THE Order_Service SHALL reject the order and return an error message
6. WHEN an order is successfully created, THE Order_Service SHALL clear the User's cart

### Requirement 8: Order Viewing

**User Story:** As a user, I want to view my order history, so that I can track my purchases

#### Acceptance Criteria

1. WHEN a User accesses the orders page, THE Order_Service SHALL display all orders for that User
2. THE Order_Service SHALL display order details including products, quantities, prices, total amount, and status
3. THE API_Handler SHALL retrieve orders ordered by creation date descending
4. WHEN a User views order details, THE ShopNexus_System SHALL display all OrderItem records associated with that order

### Requirement 9: Order Management

**User Story:** As an admin, I want to view all orders and update their status, so that I can manage order fulfillment

#### Acceptance Criteria

1. WHEN an Admin accesses the admin orders page, THE Order_Service SHALL display all orders from all users
2. WHEN an Admin updates order status, THE API_Handler SHALL modify the Order record status field
3. THE Validation_Service SHALL validate that status is either PENDING or PAID
4. THE API_Handler SHALL allow status transitions from PENDING to PAID

### Requirement 10: Database Schema

**User Story:** As a developer, I want a well-defined database schema, so that data is stored consistently and relationships are maintained

#### Acceptance Criteria

1. THE Database_Schema SHALL define a User model with id, name, email, password, role, and createdAt fields
2. THE Database_Schema SHALL define a Product model with id, name, description, price, stock, and createdAt fields
3. THE Database_Schema SHALL define an Order model with id, userId, totalAmount, status, and createdAt fields
4. THE Database_Schema SHALL define an OrderItem model with id, orderId, productId, quantity, and price fields
5. THE Database_Schema SHALL enforce unique constraint on User email field
6. THE Database_Schema SHALL use UUID for User, Product, and Order id fields
7. THE Database_Schema SHALL define foreign key relationships between Order and User, OrderItem and Order, and OrderItem and Product

### Requirement 11: API Request Validation

**User Story:** As a developer, I want all API requests to be validated, so that invalid data is rejected before processing

#### Acceptance Criteria

1. WHEN an API_Handler receives a request, THE Validation_Service SHALL validate the request body against the expected schema
2. WHEN validation fails, THE API_Handler SHALL return a 400 status code with descriptive error messages
3. THE Validation_Service SHALL use Zod schemas for all validation
4. WHEN validation succeeds, THE API_Handler SHALL process the request

### Requirement 12: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to fix it

#### Acceptance Criteria

1. WHEN a database operation fails, THE API_Handler SHALL return a 500 status code with a generic error message
2. WHEN a validation error occurs, THE API_Handler SHALL return a 400 status code with specific field errors
3. WHEN an authorization error occurs, THE API_Handler SHALL return a 403 status code with an error message
4. WHEN a resource is not found, THE API_Handler SHALL return a 404 status code with an error message
5. THE ShopNexus_System SHALL log all errors for debugging purposes

### Requirement 13: Database Seeding

**User Story:** As a developer, I want to seed the database with initial data, so that I can test the application with realistic data

#### Acceptance Criteria

1. THE Database_Schema SHALL include a seed script that creates sample users
2. THE Database_Schema SHALL include a seed script that creates sample products
3. THE seed script SHALL create at least one Admin user and one regular User
4. THE seed script SHALL create at least five sample products with varying prices and stock levels
5. THE seed script SHALL use bcrypt to hash passwords for seeded users
