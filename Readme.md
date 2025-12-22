# Shoesite Server API Documentation

Backend API server for the Shoesite e-commerce application. Built with Node.js, Express, and MongoDB.

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (React/Frontend)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Requests (REST API)
                      │ Cookies (userToken/adminToken)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                           │
│                   (Node.js + Express)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MIDDLEWARE LAYER                        │  │
│  │  • CORS                                              │  │
│  │  • express.json()                                    │  │
│  │  • cookie-parser                                     │  │
│  │  • authorizeM (JWT verification)                     │  │
│  │  • onlyUser / onlyAdmin (role-based access)         │  │
│  │  • multer + cloudinary (file uploads)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 ROUTES                               │  │
│  │  /api/v1/auth    → User authentication              │  │
│  │  /api/v1/cat     → Categories                       │  │
│  │  /api/v1/product → Products                         │  │
│  │  /api/v1/cart    → Shopping cart                    │  │
│  │  /api/v1/order   → Orders                           │  │
│  │  /api/v1/payment → Payment webhooks                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CONTROLLERS                             │  │
│  │  • user.controller.js                               │  │
│  │  • category.controller.js                           │  │
│  │  • product.controller.js                            │  │
│  │  • cart.controller.js                               │  │
│  │  • orders.controller.js                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               MODELS (Mongoose)                      │  │
│  │  • User     → Authentication & user data            │  │
│  │  • Category → Product categories (hierarchical)     │  │
│  │  • Product  → Products with variants (size/stock)   │  │
│  │  • Cart     → User shopping carts                   │  │
│  │  • Order    → Order management                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Mongoose ODM
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
│  Collections: users, categories, products, carts, orders    │
└─────────────────────────────────────────────────────────────┘
                      
┌─────────────────────────────────────────────────────────────┐
│                  CLOUDINARY (Image Storage)                 │
│  Product images uploaded via multer-storage-cloudinary      │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

**Authentication & Authorization:**
- JWT-based authentication with httpOnly cookies
- Separate tokens for users (`userToken`) and admins (`adminToken`)
- Role-based access control (RBAC)
- Refresh token mechanism

**Product Management:**
- Multi-variant products (size, stock, SKU)
- Auto-generated slugs for SEO
- Image upload to Cloudinary
- Stock management with validation
- Category hierarchy (parent/child)
- Product customization options (colors, materials)

**Shopping Flow:**
1. User browses products → Selects customizations (color, material, size) → Add to cart (stock validation)
2. Cart operations (add, remove, decrease quantity, clear)
3. Checkout → Stock re-validation at order time
4. Order creation → Automatic stock reduction
5. Order cancellation → Stock restoration

**Customization Features:**
- Product-level customization options (colors, materials)
- Cart items store individual customization choices
- Same product with different customizations = separate cart items
- Customizations preserved through cart → order flow

**Admin Features:**
- Product CRUD operations
- Category management
- Stock adjustment endpoint
- View all orders from all users
- Update order status

### Data Flow Example: Creating an Order

```
1. User clicks "Checkout"
   ↓
2. POST /api/v1/order/order (with address & payment method)
   ↓
3. Controller validates:
   • User is authenticated
   • Cart exists and has items
   • Sufficient stock for ALL items (prevents overselling)
   ↓
4. Create Order document in MongoDB
   ↓
5. Reduce stock for each item (atomic updates)
   ↓
6. Clear user's cart
   ↓
7. Return order confirmation
```

### Security Measures

- Passwords hashed with bcrypt (configurable salt rounds)
- JWT tokens stored in httpOnly cookies (prevents XSS)
- CORS enabled with credentials
- Input validation on all endpoints
- Role-based route protection
- Stock validation to prevent overselling

---

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Categories](#categories)
  - [Products](#products)
  - [Cart](#cart)
  - [Orders](#orders)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (see Environment Variables section)

4. Start the development server:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:3000` (or the port specified in your `.env` file)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# MongoDB
MONGO_URL=your_mongodb_connection_string

# Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SALT=10

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for payment redirects)
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication

#### Register User
- **POST** `/auth/register`
- **Body** (JSON):
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

#### Login
- **POST** `/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "accessToken": "jwt_token_here"
  }
  ```
- **Note**: Refresh token is set as an HTTP-only cookie

#### Refresh Token
- **GET** `/auth/refresh`
- **Headers**: Cookie with refresh token (automatically sent by browser)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "accessToken": "new_jwt_token_here"
  }
  ```

#### Logout
- **POST** `/auth/logout`
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Notes:**
  - Clears both `userToken` and `adminToken` cookies
  - No authentication required

---

### Categories

#### Get All Categories
- **GET** `/cat/`
- **Headers**: Requires authentication
- **Success Response** (200):
  ```json
  {
    "success": true,
    "AllCats": [
      {
        "_id": "category_id",
        "name": "Men's Footwear",
        "slug": "mens-footwear",
        "parent": null,
        "createdAt": "2025-12-01T10:00:00.000Z",
        "updatedAt": "2025-12-01T10:00:00.000Z"
      }
    ]
  }
  ```

#### Create Category (Admin Only)
- **POST** `/cat/admin/create-cat`
- **Headers**: Requires admin authentication
- **Body** (JSON):
  ```json
  {
    "name": "Men's Footwear",
    "parent": null
  }
  ```
  - `parent`: Optional. If creating a subcategory, provide the parent category ID
  - `slug`: Auto-generated from name
- **Success Response** (201):
  ```json
  {
    "success": true,
    "cat": {
      "name": "Men's Footwear",
      "parent": null
    }
  }
  ```

#### Edit Category (Admin Only)
- **PUT** `/cat/admin/edit/:category`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `category`: Category slug (e.g., `mens-footwear`)
- **Body** (JSON):
  ```json
  {
    "name": "Men's Shoes",
    "parent": "parent_category_id"
  }
  ```
  - Send only the fields you want to update
  - `slug` will be auto-regenerated if name is changed
- **Success Response** (200):
  ```json
  {
    "success": true,
    "catDb": {
      "_id": "category_id",
      "name": "Men's Shoes",
      "slug": "mens-shoes",
      "parent": "parent_category_id"
    }
  }
  ```

#### Delete Category (Admin Only)
- **DELETE** `/cat/admin/delete/:id`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `id`: Category ID
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Category deleted successfully..."
  }
  ```
- **Error Cases**:
  - Cannot delete if category has subcategories
  - Cannot delete if products are assigned to this category

---

### Products

#### Get All Products
- **GET** `/product/products`
- **Headers**: No authentication required
- **Success Response** (200):
  ```json
  {
    "success": true,
    "Products": [
      {
        "_id": "product_id",
        "title": "Nike Air Max 270",
        "slug": "nike-air-max-270",
        "description": "Comfortable running shoes",
        "brand": "nike",
        "imageUrl": ["https://cloudinary.com/image1.jpg"],
        "category": "category_id",
        "originalPrice": 150.00,
        "isPublic": true,
        "variants": [{"sku": "NIKE-8-1234", "size": 8, "stock": 10, "price": 4299}]
      }
    ]
  }
  ```

#### Get One Product
- **GET** `/product/:slug`
- **Headers**: No authentication required
- **URL Parameters**: 
  - `slug`: Product slug (e.g., `nike-air-max-270`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "product": {
      "_id": "product_id",
      "title": "Nike Air Max 270",
      "slug": "nike-air-max-270",
      "description": "Comfortable running shoes with air cushioning",
      "brand": "nike",
      "imageUrl": ["https://cloudinary.com/image1.jpg"],
      "category": "category_id",
      "originalPrice": 150.00,
      "isPublic": true,
      "variants": [{"sku": "NIKE-8-1234", "size": 8, "stock": 10, "price": 4299}]
    }
  }
  ```

#### Get Products by Brand
- **GET** `/product/products/:brand`
- **URL Parameters**: 
  - `brand`: Brand name (e.g., `nike`, `adidas`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "Products": [...]
  }
  ```

#### Get Products by Category
- **GET** `/product/products/category/:category`
- **URL Parameters**: 
  - `category`: Category ID
- **Success Response** (200):
  ```json
  {
    "success": true,
    "Products": [...]
  }
  ```

#### Search Products
- **GET** `/product/find?search=keyword`
- **Query Parameters**: 
  - `search`: Search term (searches in title, description, brand)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "products": [...]
  }
  ```

#### Search Bar Suggestions
- **GET** `/product/searchBar?search=keyword`
- **Query Parameters**: 
  - `search`: Search term (returns limited results for autocomplete)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "products": [...]
  }
  ```

#### Create Product (Admin Only)
- **POST** `/product/admin/create`
- **Headers**: Requires admin authentication
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```
  title: "Nike Air Max 270"
  description: "Comfortable running shoes with air cushioning"
  brand: "nike"
  category: "category_id"
  originalPrice: 150.00
  isPublic: true
  variants: [{"size": 8, "stock": 10, "price": 4299}, {"size": 9, "stock": 5, "price": 4299}]
  media: [image_file_1, image_file_2]
  ```
  - `media`: Array of image files (use key name "media" for all files)
  - `variants`: JSON string of size/stock array
  - `slug`: Auto-generated from title
  - `isPublic`: Optional, defaults to true
- **Success Response** (201):
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "NewProduct": {
      "_id": "product_id",
      "title": "Nike Air Max 270",
      "slug": "nike-air-max-270",
      "description": "Comfortable running shoes with air cushioning",
      "brand": "nike",
      "imageUrl": [
        "https://cloudinary.com/image1.jpg",
        "https://cloudinary.com/image2.jpg"
      ],
      "category": "category_id",
      "originalPrice": 150.00,
      "isPublic": true,
      "variants": [
        {"sku": "NIKE-8-1234", "size": 8, "stock": 10, "price": 4299},
        {"sku": "NIKE-9-1235", "size": 9, "stock": 5, "price": 4299}
      ],
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T10:00:00.000Z"
    }
  }
  ```

#### Update Product (Admin Only)
- **PUT** `/product/admin/update/:slug`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `slug`: Product slug (e.g., `nike-air-max-270`)
- **Content-Type**: `multipart/form-data`
- **Body**:
  - Send only the fields you want to update
  - Same format as Create Product
  - If you update `title`, the `slug` will be auto-regenerated
  - If sending new images with `media`, they will be added/replaced
- **Example** (updating only price and stock):
  ```
  variants: [{"size": 8, "stock": 15, "price": 3999}]
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "product": {
      "_id": "product_id",
      "title": "Nike Air Max 270",
      "slug": "nike-air-max-270",
      "variants": [{"sku": "NIKE-8-1234", "size": 8, "stock": 15, "price": 3999}]
    }
  }
  ```

#### Delete Product (Admin Only)
- **DELETE** `/product/admin/delete/:slug`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `slug`: Product slug (e.g., `nike-air-max-270`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

#### Toggle Product Visibility (Admin Only)
- **PATCH** `/product/admin/toggle/:slug`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `slug`: Product slug
- **Body** (JSON):
  ```json
  {
    "isPublic": false
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "nike-air-max-270 isPublic is change to false"
  }
  ```

#### Change Stock (Admin Only)
- **PATCH** `/product/admin/products/:productId/stock`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `productId`: Product slug
- **Body** (JSON):
  ```json
  {
    "sku": "NIKE-8-1234",
    "delta": 10
  }
  ```
  - `delta`: Positive to increase stock, negative to decrease
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "stock updation successfull",
    "updatedVariant": {
      "sku": "NIKE-8-1234",
      "size": 8,
      "stock": 25,
      "price": 4299
    }
  }
  ```
- **Notes:**
  - Admin only endpoint
  - Validates that stock won't go negative
  - Useful for manual stock adjustments, returns, or corrections

---

### Product Customization

Products can have customization options (colors, materials) that customers select when adding to cart.

#### Customization Data Structure

**In Product Model:**
```json
{
  "customizationOptions": {
    "colors": [
      {"name": "black"},
      {"name": "red"},
      {"name": "blue"}
    ],
    "materials": [
      {"name": "mesh"},
      {"name": "leather"},
      {"name": "suede"}
    ]
  }
}
```

**When Creating/Updating Products:**
Include `customizationOptions` in request body:
```json
{
  "title": "Nike Air Jordan",
  "description": "Premium basketball shoe",
  "brand": "nike",
  "originalPrice": 5000,
  "variants": [...],
  "customizationOptions": {
    "colors": [
      {"name": "black"},
      {"name": "red"}
    ],
    "materials": [
      {"name": "mesh"},
      {"name": "leather"}
    ]
  }
}
```

#### Customer Flow

1. **View Product**: Frontend displays available customization options from `product.customizationOptions`
2. **Select Customizations**: User picks color (e.g., "black") and material (e.g., "leather")
3. **Add to Cart**: Send selections in cart request:
   ```json
   {
     "sku": "NIK-001-9",
     "color": "black",
     "material": "leather"
   }
   ```
4. **Cart Storage**: Item stored with customizations:
   ```json
   {
     "sku": "NIK-001-9",
     "customizations": {
       "color": "black",
       "material": "leather"
     }
   }
   ```
5. **Checkout**: Customizations automatically flow to order

#### Important Notes

- **Cart Item Uniqueness**: Same SKU with different customizations = separate cart items
  - Example: Size 9 + Black + Mesh vs Size 9 + Red + Leather = 2 cart items
- **Same Customizations**: If user adds item with same SKU + same customizations, quantity increments
- **Stock Tracking**: Inventory tracked by SKU only (size), not by customization
- **Optional Field**: Products without `customizationOptions` work normally

---
  ```json
  {
    "sku": "NIKE-8-1234",
    "delta": 10
  }
  ```
  - `delta`: Positive to increase stock, negative to decrease
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "stock updation successfull",
    "updatedVariant": {
      "sku": "NIKE-8-1234",
      "size": 8,
      "stock": 25,
      "price": 4299
    }
  }
  ```
- **Notes:**
  - Admin only endpoint
  - Validates that stock won't go negative
  - Useful for manual stock adjustments, returns, or corrections

---

### Cart

#### Get Cart
- **GET** `/cart/viewcart`
- **Headers**: Requires authentication (user token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "cart": {
      "_id": "cart_id",
      "userId": "user_id",
      "items": [
        {
          "productId": "product_id",
          "sku": "NIKE-8-1234",
          "title": "Nike Air Max",
          "image": "https://cloudinary.com/image.jpg",
          "size": 8,
          "quantity": 2,
          "price": 4299,
          "subtotal": 8598
        }
      ],
      "totalAmount": 8598,
      "totalItems": 2
    }
  }
  ```

#### Add Item to Cart
- **POST** `/cart/addItem`
- **Headers**: Requires authentication (user token)
- **Body** (JSON):
  ```json
  {
    "sku": "NIKE-8-1234",
    "color": "black",
    "material": "mesh"
  }
  ```
  - `sku`: Required - Product SKU
  - `color`: Optional - Selected color customization
  - `material`: Optional - Selected material customization
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Item added to cart",
    "cart": {
      "_id": "cart_id",
      "userId": "user_id",
      "items": [
        {
          "productId": "product_id",
          "sku": "NIKE-8-1234",
          "title": "Nike Air Max",
          "image": "https://cloudinary.com/image.jpg",
          "size": 8,
          "quantity": 1,
          "price": 4299,
          "subtotal": 4299,
          "customizations": {
            "color": "black",
            "material": "mesh"
          }
        }
      ],
      "totalAmount": 4299,
      "totalItems": 1
    }
  }
  ```
- **Notes:**
  - Adds 1 unit of the item
  - If item with same SKU **and** same customizations exists, quantity is incremented
  - If item with same SKU but **different** customizations exists, added as separate item
  - Stock validation is performed before adding
  - Cart is created automatically if it doesn't exist

#### Add Multiple Items to Cart
- **POST** `/cart/newAddItemtoCart`
- **Headers**: Requires authentication (user token)
- **Body** (JSON):
  ```json
  {
    "sku": "NIKE-8-1234",
    "quantity": 2,
    "color": "red",
    "material": "leather"
  }
  ```
  - `sku`: Required - Product SKU
  - `quantity`: Required - Number of items to add
  - `color`: Optional - Selected color customization
  - `material`: Optional - Selected material customization
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Item added to cart",
    "cart": {
      "_id": "cart_id",
      "userId": "user_id",
      "items": [
        {
          "productId": "product_id",
          "sku": "NIKE-8-1234",
          "title": "Nike Air Max",
          "size": 8,
          "quantity": 2,
          "price": 4299,
          "subtotal": 8598,
          "customizations": {
            "color": "red",
            "material": "leather"
          }
        }
      ],
      "totalAmount": 8598,
      "totalItems": 2
    }
  }
  ```
- **Notes:**
  - Adds specified quantity of items
  - If item with same SKU and customizations exists, quantities are combined
  - Stock validation ensures sufficient inventory
  - Cart is created automatically if it doesn't exist

#### Remove Item from Cart
- **DELETE** `/cart/remove/:sku`
- **Headers**: Requires authentication (user token)
- **URL Parameters**: 
  - `sku`: Product SKU (e.g., `NIKE-8-1234`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Item removed",
    "cart": {
      "_id": "cart_id",
      "items": [],
      "totalAmount": 0,
      "totalItems": 0
    }
  }
  ```
- **Notes:**
  - Removes the entire item (all quantities) from cart
  - Totals are automatically recalculated

#### Clear Cart
- **DELETE** `/cart/clear`
- **Headers**: Requires authentication (user token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Cart cleared successfully"
  }
  ```
- **Notes:**
  - Removes all items from cart
  - Resets totalAmount and totalItems to 0

#### Decrease Item Quantity
- **PATCH** `/cart/decrease/:sku`
- **Headers**: Requires authentication (user token)
- **URL Parameters**: 
  - `sku`: Product SKU (e.g., `NIKE-8-1234`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Item quantity decreased",
    "cart": {
      "_id": "cart_id",
      "items": [...],
      "totalAmount": 4299,
      "totalItems": 1
    }
  }
  ```
- **Notes:**
  - Decreases quantity by 1
  - If quantity reaches 0, item is removed from cart
  - If cart becomes empty, message changes to "Item removed, cart is now empty"

---

### Orders

#### Create Order
- **POST** `/order/order`
- **Headers**: Requires authentication (user token)
- **Body** (JSON):
  ```json
  {
    "address": {
      "name": "John Doe",
      "phone": "1234567890",
      "line1": "123 Main St",
      "city": "Mumbai",
      "state": "MH",
      "zip": "400001"
    },
    "paymentMethod": "card"
  }
  ```
  - **Note:** `paymentMethod` values: `"card"`, `"upi"`, or `"cod"`
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Order created. Complete payment.",
    "paymentUrl": "https://rzp.io/i/abc123xyz",
    "orderId": "order_id",
    "orderNumber": "ORD-1234"
  }
  ```
- **Order Details**:
  ```json
  {
    "_id": "order_id",
    "userId": "user_id",
    "orderNumber": "ORD-1234",
    "items": [
      {
        "productId": "product_id",
        "sku": "NIKE-8-1234",
        "title": "Nike Air Max",
        "image": "https://cloudinary.com/image.jpg",
        "size": 8,
        "quantity": 2,
        "price": 4299,
        "subtotal": 8598
      }
    ],
    "subtotal": 8598,
    "shippingCost": 0,
    "tax": 0,
    "totalAmount": 8598,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "pending",
    "paymentLinkId": "plink_abc123xyz",
    "shippingAddress": {
      "name": "John Doe",
      "phone": "1234567890",
      "line1": "123 Main St",
      "city": "Mumbai",
      "state": "MH",
      "zip": "400001"
    },
    "createdAt": "2025-12-10T10:00:00.000Z",
    "updatedAt": "2025-12-10T10:00:00.000Z"
  }
  ```
- **Notes:**
  - Order is created from user's cart
  - For online payment (`card` or `upi`): Razorpay payment link is generated
  - For COD: Order is confirmed immediately
  - User is redirected to `paymentUrl` to complete payment
  - Cart is cleared only after successful payment (or immediately for COD)
  - Stock is reduced only after successful payment (or immediately for COD)
  - `orderNumber` is auto-generated with format "ORD-XXXX"
  - Shipping cost: ₹0 (currently disabled)
  - Tax: 0% (currently disabled)
  - Total calculation: subtotal only (shipping and tax disabled)
  - After payment completion, user is redirected to: `${FRONTEND_URL}/orders-success?orderId=${order._id}`
  - **Address Fields Required:** `name`, `phone`, `line1`, `city`, `state`, `zip`

#### Get All Orders (My Orders)
- **GET** `/order/my`
- **Headers**: Requires authentication (user token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "see below",
    "Allorders": [
      {
        "_id": "order_id",
        "userId": "user_id",
        "orderNumber": "ORD-1234",
        "items": [...],
        "subtotal": 8598,
        "shippingCost": 0,
        "tax": 0,
        "totalAmount": 8598,
        "paymentMethod": "card",
        "paymentStatus": "pending",
        "status": "pending",
        "shippingAddress": {...},
        "createdAt": "2025-12-10T10:00:00.000Z",
        "updatedAt": "2025-12-10T10:00:00.000Z"
      }
    ]
  }
  ```
- **Notes:**
  - Returns all orders for the authenticated user
  - Orders are sorted by creation date (newest first)

---

## Payment Integration (Razorpay)

### Payment Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      PAYMENT FLOW DIAGRAM                        │
└──────────────────────────────────────────────────────────────────┘

1. User clicks "Checkout" on Frontend
   ↓
2. Frontend calls: POST /api/v1/order/order
   - Sends: address, paymentMethod
   - Receives: paymentUrl, orderId, orderNumber
   ↓
3. Frontend redirects user to paymentUrl (Razorpay hosted page)
   - User sees Razorpay payment interface
   - User enters card/UPI/wallet details
   ↓
4. User completes payment on Razorpay
   ↓
5. Razorpay redirects back to: 
   ${FRONTEND_URL}/orders-success?orderId=xxx&razorpay_payment_id=xxx&...
   ↓
6. Razorpay calls webhook: POST /api/v1/payment/webhook
   - Backend verifies signature
   - Backend updates order status → "paid"
   - Backend reduces stock
   - Backend clears cart
   ↓
7. Frontend checks order status: GET /api/v1/order/:ordernumber
   - If paymentStatus === "paid" → Show success
   - If paymentStatus === "pending" → Show "Verifying..."
   - If paymentStatus === "failed" → Show error
```

### Frontend Implementation Guide

#### Step 1: Checkout Flow

```javascript
// When user clicks "Checkout" button

const handleCheckout = async () => {
  try {
    const response = await fetch('https://your-backend.com/api/v1/order/order', {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: {
          name: "John Doe",
          phone: "1234567890",
          line1: "123 Main St",
          city: "Mumbai",
          state: "MH",
          zip: "400001"
        },
        paymentMethod: "card" // or "cod" or "upi"
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to Razorpay payment page
      window.location.href = data.paymentUrl;
      
      // Store orderId in sessionStorage for later use
      sessionStorage.setItem('pendingOrderId', data.orderId);
      sessionStorage.setItem('pendingOrderNumber', data.orderNumber);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to create order');
  }
};
```

#### Step 2: Payment Success Page

Create a page at `/orders-success` that handles the redirect from Razorpay:

```javascript
// OrderSuccessPage.jsx

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    const verifyPayment = async () => {
      // Get parameters from URL
      const orderId = searchParams.get('orderId');
      const razorpay_payment_id = searchParams.get('razorpay_payment_id');
      const razorpay_payment_link_status = searchParams.get('razorpay_payment_link_status');
      
      if (!orderId) {
        setStatus('failed');
        return;
      }
      
      // Wait 2 seconds for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check order status
      try {
        const response = await fetch(`https://your-backend.com/api/v1/order/${orderId}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.order) {
          setOrder(data.order);
          
          if (data.order.paymentStatus === 'paid') {
            setStatus('success');
          } else if (data.order.paymentStatus === 'pending') {
            // Webhook might still be processing, check again
            setTimeout(() => verifyPayment(), 3000);
          } else {
            setStatus('failed');
          }
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
      }
    };
    
    verifyPayment();
  }, [searchParams]);
  
  if (status === 'verifying') {
    return (
      <div>
        <h2>Verifying Payment...</h2>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div>
        <h2>Payment Successful!</h2>
        <p>Order Number: {order?.orderNumber}</p>
        <p>Amount Paid: ₹{order?.totalAmount}</p>
        <button onClick={() => navigate('/orders')}>View Orders</button>
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div>
        <h2>Payment Verification Failed</h2>
        <p>Failed to verify payment. Please check your orders page.</p>
        <button onClick={() => navigate('/orders')}>View Orders</button>
        <button onClick={() => navigate('/products')}>Continue Shopping</button>
      </div>
    );
  }
}

export default OrderSuccessPage;
```

#### Step 3: Check Order Status (Alternative Method)

If you want to manually check order status:

```javascript
const checkOrderStatus = async (orderNumber) => {
  try {
    const response = await fetch(
      `https://your-backend.com/api/v1/order/${orderNumber}`,
      {
        credentials: 'include'
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      const { paymentStatus, status } = data.order;
      
      if (paymentStatus === 'paid') {
        console.log('Payment confirmed!');
      } else if (paymentStatus === 'pending') {
        console.log('Payment still pending');
      } else {
        console.log('Payment failed');
      }
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
};
```

### Payment Methods

#### Online Payment (Razorpay)

```javascript
{
  "paymentMethod": "card"  // or "upi"
}
```

- User is redirected to Razorpay payment page
- Supports: Cards, UPI, Netbanking, Wallets
- Payment must be completed before order is confirmed
- Stock is reduced only after successful payment

#### Cash on Delivery (COD)

```javascript
{
  "paymentMethod": "cod"
}
```

- Order is created immediately
- Stock is reduced immediately
- Cart is cleared immediately
- No payment link is generated
- `paymentStatus` is set to "paid" automatically

### Important Notes for Frontend Developers

#### 1. Cookie Handling
```javascript
// Always include credentials for authenticated requests
fetch(url, {
  credentials: 'include', // This sends cookies
  headers: {
    'Content-Type': 'application/json'
  }
})
```

#### 2. Payment Status Values

Actual values from Order model `paymentStatus` field:
- `pending` - Payment not yet completed (default)
- `paid` - Payment successful and verified
- `failed` - Payment failed or cancelled
- `refunded` - Payment refunded

#### 3. Order Status Values

Actual values from Order model `status` field (note: field is called `status`, not `orderStatus`):
- `pending` - Order created, waiting for payment (default)
- `processing` - Payment received, order being prepared
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `refunded` - Order refunded

#### 4. Error Handling

```javascript
// Always handle these cases:

// 1. Cart is empty
if (response.status === 400 && data.message === 'Cart not found') {
  alert('Your cart is empty');
  navigate('/cart');
}

// 2. Insufficient stock
if (response.status === 400 && data.message.includes('Insufficient stock')) {
  alert(data.message);
  // Reload cart to show updated stock
}

// 3. User not authenticated
if (response.status === 401) {
  alert('Please login to continue');
  navigate('/login');
}
```

#### 5. Loading States

```javascript
const [isCheckingOut, setIsCheckingOut] = useState(false);

const handleCheckout = async () => {
  setIsCheckingOut(true);
  try {
    // ... checkout logic
  } finally {
    setIsCheckingOut(false);
  }
};

// In JSX
<button disabled={isCheckingOut}>
  {isCheckingOut ? 'Processing...' : 'Proceed to Payment'}
</button>
```

### Testing Payment Integration

#### Test Mode (Razorpay)

Use these test credentials:

**Test Cards:**
```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure: 4000 0000 0000 0002
```

**Test UPI:**
```
UPI ID: success@razorpay
```

#### Testing Checklist

- [ ] Order creation with online payment
- [ ] Order creation with COD
- [ ] Payment success flow
- [ ] Payment failure flow
- [ ] User closes payment window
- [ ] User's cart is empty
- [ ] Insufficient stock scenario
- [ ] Network error during checkout
- [ ] Order status check after payment
- [ ] Multiple orders from same user

### Common Issues & Solutions

#### Issue 1: Payment Success but Order Still Pending

**Cause:** Webhook not called or failed

**Solution:**
1. Check if webhook is configured in Razorpay dashboard
2. Verify webhook URL is accessible (not localhost)
3. Check backend logs for webhook errors
4. Implement retry logic in frontend (check status every 3 seconds)

#### Issue 2: "Payment Verification Failed" Page

**Cause:** Webhook failed or signature mismatch

**Solution:**
1. Check `RAZORPAY_WEBHOOK_SECRET` in backend `.env`
2. Verify webhook endpoint is receiving requests
3. Check backend logs for specific error
4. User can still check order status manually

#### Issue 3: Stock Issues

**Cause:** Multiple users buying same product

**Solution:**
- Backend validates stock at order creation
- Stock is reduced only after payment success
- If stock insufficient, order creation fails with clear message

### Webhook Configuration (For Backend Setup)

**Razorpay Dashboard:**
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-backend.com/api/v1/payment/webhook`
3. Select events:
   - `payment_link.paid`
   - `payment_link.expired`
   - `payment_link.cancelled`
4. Copy webhook secret and add to `.env` as `RAZORPAY_WEBHOOK_SECRET`

**Important:** Webhook URL must be publicly accessible (not localhost). For local development, use ngrok or similar tunneling service.

---

### Order Management (Admin & User)

#### Get Single Order
- **GET** `/order/:ordernumber`
- **Headers**: Requires authentication (user token)
- **URL Parameters**: 
  - `ordernumber`: Order number (e.g., `ORD-1234`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "See below",
    "order": {
      "orderNumber": "ORD-1234",
      "paymentStatus": "paid",
      "status": "processing",
      "totalAmount": 8598,
      "items": [...],
      "shippingAddress": {...}
    }
  }
  ```
- **Notes:**
  - Users can only view their own orders
  - Used for payment verification after Razorpay redirect

#### Cancel Order
- **PUT** `/order/cancel/:ordernumber`
- **Headers**: Requires authentication (user token)
- **URL Parameters**: 
  - `ordernumber`: Order number (e.g., `ORD-1234`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Order cancelled. Thanks"
  }
  ```
- **Error Cases**:
  - Cannot cancel if already cancelled (409)
  - Cannot cancel if already shipped (403)
- **Notes:**
  - Stock is automatically restored when order is cancelled
  - Payment status is set to "failed"
  - Order status is set to "cancelled"

#### Get All Orders (Admin)
- **GET** `/order/admin/orders`
- **Headers**: Requires admin authentication
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "All order from all users",
    "totalOrders": 150,
    "Allorders": [
      {
        "_id": "order_id",
        "userId": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "orderNumber": "ORD-1234",
        "paymentStatus": "paid",
        "status": "processing",
        "totalAmount": 8598,
        "items": [...],
        "createdAt": "2025-12-10T10:00:00.000Z"
      }
    ]
  }
  ```
- **Notes:**
  - Admin only endpoint
  - Returns all orders from all users
  - Orders sorted by creation date (newest first)
  - User details populated (name, email)

#### Update Order Status (Admin)
- **PATCH** `/order/admin/status/:orderId`
- **Headers**: Requires admin authentication
- **URL Parameters**: 
  - `orderId`: Order number (e.g., `ORD-1234`)
- **Body** (JSON):
  ```json
  {
    "status": "shipped"
  }
  ```
  - Valid values: `"pending"`, `"processing"`, `"shipped"`, `"delivered"`, `"cancelled"`, `"refunded"`
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Status successsfully set",
    "order": {
      "orderNumber": "ORD-1234",
      "status": "shipped",
      "trackingNumber": null
    }
  }
  ```
- **Error Cases**:
  - Status is same as current status (409)
  - Order not found (404)
- **Notes:**
  - Admin only endpoint
  - Used to update order lifecycle status
  - Can optionally add tracking number separately

---

## Data Models

### User
```javascript
{
  name: String,          // Required
  email: String,         // Required, unique
  password: String,      // Required, hashed
  isAdmin: Boolean,      // Default: false
  refreshToken: Array,   // Stored refresh tokens
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  name: String,          // Required, unique
  slug: String,          // Auto-generated, unique
  parent: ObjectId,      // Reference to parent category, null for top-level
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  title: String,         // Required, min length: 3
  slug: String,          // Auto-generated, unique
  description: String,   // Required, min length: 10
  brand: String,         // Required, unique, lowercase
  imageUrl: [String],    // Array of image URLs (required, min 1 image)
  category: ObjectId,    // Required, reference to Category
  originalPrice: Decimal128,  // Required, min: 0
  isPublic: Boolean,     // Default: true
  variants: [            // Required, min 1 variant
    {
      sku: String,       // Auto-generated, unique (e.g., "NIKE-8-1234")
      size: Number,      // Required, enum: [6,7,8,9,10,11]
      stock: Number,     // Required, min: 0
      price: Number      // Required, individual variant price
    }
  ],
  customizationOptions: {  // Optional, product customization settings
    colors: [
      {
        name: String     // Color name (e.g., "black", "red")
      }
    ],
    materials: [
      {
        name: String     // Material name (e.g., "mesh", "leather")
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Cart
```javascript
{
  userId: ObjectId,      // Required, reference to User
  items: [
    {
      productId: ObjectId,  // Reference to Product
      sku: String,       // Product SKU
      title: String,     // Product title
      image: String,     // Product image URL
      size: Number,      // Selected size
      quantity: Number,  // Quantity in cart
      price: Number,     // Unit price
      subtotal: Number,  // price × quantity
      customizations: {  // Optional, user's customization choices
        color: String,   // Selected color (e.g., "black")
        material: String // Selected material (e.g., "leather")
      }
    }
  ],
  totalAmount: Number,   // Sum of all subtotals
  totalItems: Number,    // Total quantity of items
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId,      // Required, reference to User
  orderNumber: String,   // Auto-generated, unique (e.g., "ORD-1234")
  items: [               // Same structure as cart items
    {
      productId: ObjectId,
      sku: String,
      title: String,
      image: String,
      size: Number,
      quantity: Number,
      price: Number,
      subtotal: Number,
      customizations: {  // Optional, user's customization choices
        color: String,   // Selected color (e.g., "black")
        material: String // Selected material (e.g., "leather")
      }
    }
  ],
  subtotal: Number,      // Required, sum of items
  shippingCost: Number,  // Default: 0
  tax: Number,           // Default: 0
  totalAmount: Number,   // Required, calculated total
  paymentMethod: String, // Required, enum: ["card", "upi", "cod"]
  paymentStatus: String, // Default: "pending", enum: ["pending", "paid", "failed", "refunded"]
  paymentId: String,     // Razorpay payment ID (set after payment)
  paymentLinkId: String, // Razorpay payment link ID
  status: String,        // Default: "pending", enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
  shippingAddress: {     // Required
    name: String,        // Required
    phone: String,       // Required
    line1: String,       // Required
    city: String,        // Required
    state: String,       // Required
    zip: String          // Required
  },
  trackingNumber: String, // Optional
  estimatedDelivery: Date, // Optional
  deliveredAt: Date,     // Optional
  paidAt: Date,          // When payment was completed
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (missing or invalid data)
- **401**: Unauthorized (invalid credentials)
- **404**: Resource not found
- **409**: Conflict (duplicate entry)
- **500**: Internal server error

### Common Error Messages

**Authentication**
- "User already exist" (409)
- "User not found" (404)
- "Invalid credentials" (401)

**Categories**
- "Name is required" (400)
- "Category not found" (404)
- "Cannot delete category: it has subcategories" (400)
- "Cannot delete category: X products belongs to this category" (400)

**Products**
- "Fields are empty..." (400)
- "Product already exist, Please create different name" (409)
- "Product not found" (404)

---

## Payment Gateway Integration

### Overview

This application uses **Razorpay** as the payment gateway for processing online payments. The integration creates payment links that users can complete through Razorpay's hosted payment page.

### Payment Flow

```
1. User adds items to cart
   ↓
2. User proceeds to checkout
   ↓
3. POST /api/v1/order/order with address & payment method
   ↓
4. Server validates cart and stock availability
   ↓
5. Server creates Order document (status: pending)
   ↓
6. Server creates Razorpay Payment Link
   ↓
7. Server responds with payment URL
   ↓
8. Frontend redirects user to Razorpay payment page
   ↓
9. User completes payment on Razorpay
   ↓
10. Razorpay redirects to callback URL
    ↓
11. Frontend verifies payment status
    ↓
12. Server updates order status & clears cart
    ↓
13. Server reduces product stock
    ↓
14. User sees order confirmation
```

### Razorpay Setup

#### 1. Create Razorpay Account
- Go to https://razorpay.com/
- Sign up for an account
- Verify your business details

#### 2. Get API Credentials
- Login to Razorpay Dashboard
- Navigate to **Settings** → **API Keys**
- Generate API keys (Test mode for development)
- Copy `Key ID` and `Key Secret`
- Add them to your `.env` file:
  ```env
  RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
  ```

#### 3. Configure Webhooks (Optional - for production)
- Go to **Settings** → **Webhooks**
- Add webhook URL: `https://yourdomain.com/api/v1/order/webhook`
- Select events: `payment.captured`, `payment.failed`
- Save the webhook secret

### Implementation Details

#### Server-Side Configuration

**File: `src/config/razorpay.js`**
```javascript
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

#### Payment Link Creation

**File: `src/controllers/orders.controller.js`**
```javascript
// Create Razorpay Payment Link
const paymentLink = await razorpay.paymentLink.create({
    amount: order.totalAmount * 100,  // Amount in paise (₹1 = 100 paise)
    currency: "INR",
    description: `Order #${order.orderNumber}`,
    customer: {
        name: req.user.name,
        email: req.user.email
    },
    notify: {
        sms: false,      // Disable SMS notifications
        email: true      // Enable email notifications
    },
    reminder_enable: false,
    callback_url: `${process.env.FRONTEND_URL}/orders-success?orderId=${order._id}`,
    callback_method: "get"
});

// Save payment link ID to order
order.paymentLinkId = paymentLink.id;
await order.save();

// Return payment URL to frontend
res.json({
    success: true,
    message: "Order created. Complete payment.",
    paymentUrl: paymentLink.short_url,  // Shortened URL for payment
    orderId: order._id,
    orderNumber: order.orderNumber
});
```

### Frontend Integration Example

#### React/JavaScript Example

```javascript
// Place Order Function
const placeOrder = async (shippingAddress, paymentMethod) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/order/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify({
        address: shippingAddress,
        paymentMethod: paymentMethod
      })
    });

    const data = await response.json();

    if (data.success) {
      // Redirect user to Razorpay payment page
      window.location.href = data.paymentUrl;
      
      // Store order details for later reference
      localStorage.setItem('pendingOrderId', data.orderId);
      localStorage.setItem('pendingOrderNumber', data.orderNumber);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Order creation failed:', error);
    alert('Failed to create order. Please try again.');
  }
};

// Payment Success Page Handler
const handlePaymentSuccess = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  
  if (orderId) {
    // Fetch order details to verify payment
    fetch(`http://localhost:3000/api/v1/order/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.order.paymentStatus === 'paid') {
        // Show success message
        console.log('Payment successful!', data.order);
      } else {
        // Payment still pending or failed
        console.log('Payment verification pending');
      }
    });
  }
};
```

### Payment Link Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `amount` | Number | Amount in smallest currency unit (paise for INR) | `10000` (₹100.00) |
| `currency` | String | 3-letter ISO currency code | `"INR"` |
| `description` | String | Payment description shown to customer | `"Order #ORD-1234"` |
| `customer.name` | String | Customer's full name | `"John Doe"` |
| `customer.email` | String | Customer's email for receipt | `"john@example.com"` |
| `notify.sms` | Boolean | Send SMS notification | `false` |
| `notify.email` | Boolean | Send email notification | `true` |
| `reminder_enable` | Boolean | Enable payment reminders | `false` |
| `callback_url` | String | URL to redirect after payment | `"http://localhost:5173/success"` |
| `callback_method` | String | HTTP method for callback | `"get"` |

### Payment Status Verification

#### Option 1: Webhook (Recommended for Production)

```javascript
// Webhook handler
export const handlePaymentWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature === expectedSignature) {
      const { event, payload } = req.body;
      
      if (event === 'payment.captured') {
        // Update order status
        const order = await Order.findOne({ 
          paymentLinkId: payload.payment_link.entity.id 
        });
        
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          await order.save();
          
          // Reduce stock
          for (const item of order.items) {
            await Product.updateOne(
              { "variants.sku": item.sku },
              { $inc: { "variants.$.stock": -item.quantity } }
            );
          }
          
          // Clear cart
          await Cart.updateOne(
            { userId: order.userId },
            { $set: { items: [], totalAmount: 0, totalItems: 0 } }
          );
        }
      }
      
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
```

#### Option 2: Manual Verification (Current Implementation)

```javascript
// Get order details and verify payment status
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Fetch payment status from Razorpay
    const paymentLink = await razorpay.paymentLink.fetch(order.paymentLinkId);
    
    if (paymentLink.status === 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      await order.save();
      
      // Reduce stock and clear cart
      // ... (same as webhook implementation)
    }
    
    res.json({
      success: true,
      order,
      paymentStatus: paymentLink.status
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

### Testing Razorpay Integration

#### Test Mode

1. Use test API keys (start with `rzp_test_`)
2. Razorpay provides test card numbers for different scenarios:

**Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Insufficient Funds:**
- Card: `4000 0000 0000 9995`

#### Live Mode

1. Complete KYC verification on Razorpay
2. Switch to live API keys (start with `rzp_live_`)
3. Update `.env` file with live keys
4. Test with small real transactions first

### Security Best Practices

1. **Never expose API secrets**: Keep `RAZORPAY_KEY_SECRET` in `.env` file only
2. **Verify webhook signatures**: Always validate Razorpay webhook signatures
3. **Verify payment on server**: Never trust client-side payment status
4. **Use HTTPS**: Always use SSL in production
5. **Implement idempotency**: Handle duplicate webhook calls gracefully
6. **Log all transactions**: Keep audit trail of all payment attempts
7. **Validate amounts**: Always verify order amount matches payment amount

### Common Issues & Solutions

#### Issue 1: Payment link expired
**Solution**: Payment links expire after 15 days by default. Implement expiry handling:
```javascript
if (paymentLink.status === 'expired') {
  // Create new payment link
  const newPaymentLink = await razorpay.paymentLink.create({...});
}
```

#### Issue 2: Webhook not receiving events
**Solution**: 
- Check webhook URL is publicly accessible
- Verify webhook signature validation
- Check Razorpay dashboard for webhook delivery logs

#### Issue 3: Amount mismatch
**Solution**: Always convert to paise (multiply by 100):
```javascript
amount: Math.round(order.totalAmount * 100) // Ensures integer value
```

### Razorpay Dashboard Features

- **Payments**: View all transactions
- **Orders**: Track order details
- **Payment Links**: Manage all payment links
- **Refunds**: Process refunds if needed
- **Reports**: Download transaction reports
- **Analytics**: View payment success rates

### Alternative Payment Methods

Razorpay supports multiple payment methods:
- Credit/Debit Cards
- Net Banking
- UPI
- Wallets (Paytm, PhonePe, etc.)
- EMI
- Cardless EMI

These are automatically available on the payment page.

### Refund Implementation

```javascript
export const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    // Fetch payment details
    const paymentLink = await razorpay.paymentLink.fetch(order.paymentLinkId);
    const paymentId = paymentLink.payments[0].payment_id;
    
    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: order.totalAmount * 100,
      notes: {
        reason: 'Customer requested cancellation'
      }
    });
    
    // Update order
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();
    
    // Restore stock
    for (const item of order.items) {
      await Product.updateOne(
        { "variants.sku": item.sku },
        { $inc: { "variants.$.stock": item.quantity } }
      );
    }
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

### Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Payment Links API**: https://razorpay.com/docs/api/payment-links/
- **Webhooks Guide**: https://razorpay.com/docs/webhooks/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Node.js SDK**: https://github.com/razorpay/razorpay-node

---

## Notes for Frontend Developers

### Image Uploads
- Use `FormData` to send product images
- Set `Content-Type` to `multipart/form-data`
- Use the field name `media` for all image files
- Example:
  ```javascript
  const formData = new FormData();
  formData.append('title', 'Product Name');
  formData.append('description', 'Product description');
  // ... other fields
  formData.append('variants', JSON.stringify([{size: 8, stock: 10}]));
  formData.append('media', imageFile1);
  formData.append('media', imageFile2);
  ```

### Authentication Flow
1. User logs in → Receive access token + refresh token (in cookie)
2. Store access token in memory/state (not localStorage for security)
3. Include access token in headers: `Authorization: Bearer <token>`
4. When access token expires → Call `/auth/refresh` to get new access token
5. Refresh token is automatically sent via cookie

### Slugs
- Slugs are auto-generated from names/titles
- Use slugs in URLs for SEO-friendly routes
- When updating a category/product name, the slug updates automatically

### Variants
- For products, `variants` must be sent as a JSON string in form-data
- Parse it before sending: `JSON.stringify(variantsArray)`

### Decimal Prices
- Prices are stored as `Decimal128` in MongoDB
- When received from API, convert to numbers for display
- Example: `Number(product.originalPrice)` or `Number(variant.price)`

---

## Development

### Project Structure
```
shoesite-server/
├── src/
│   ├── app.js              # Express app configuration
│   ├── config/
│   │   └── db.js           # Database connection
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares (auth, upload)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── utils/              # Helper functions
├── server.js               # Entry point
├── package.json
└── .env                    # Environment variables
```

### Running the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
node server.js
```

---

For questions or issues, please contact the backend development team.
