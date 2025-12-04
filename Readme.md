# Shoesite Server API Documentation

Backend API server for the Shoesite e-commerce application. Built with Node.js, Express, and MongoDB.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Categories](#categories)
  - [Products](#products)
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

---

### Categories

#### Get All Categories
- **GET** `/cat/`
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

#### Create Category
- **POST** `/cat/create-cat`
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

#### Edit Category
- **PUT** `/cat/edit/:category`
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

#### Delete Category
- **DELETE** `/cat/delete/:id`
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
        "finalPrice": 120.00,
        "isPublic": true,
        "variants": [{"size": 8, "stock": 10}]
      }
    ]
  }
  ```

#### Get One Product
- **GET** `/product/:slug`
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
      "finalPrice": 120.00,
      "isPublic": true,
      "variants": [{"size": 8, "stock": 10}]
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

#### Create Product
- **POST** `/product/create`
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```
  title: "Nike Air Max 270"
  description: "Comfortable running shoes with air cushioning"
  brand: "nike"
  category: "category_id"
  originalPrice: 150.00
  finalPrice: 120.00
  isPublic: true
  variants: [{"size": 8, "stock": 10}, {"size": 9, "stock": 5}]
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
      "finalPrice": 120.00,
      "isPublic": true,
      "variants": [
        {"size": 8, "stock": 10},
        {"size": 9, "stock": 5}
      ],
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T10:00:00.000Z"
    }
  }
  ```

#### Update Product
- **PUT** `/product/update/:slug`
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
  finalPrice: 100.00
  variants: [{"size": 8, "stock": 15}]
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "product": {
      "_id": "product_id",
      "title": "Nike Air Max 270",
      "slug": "nike-air-max-270",
      "finalPrice": 100.00,
      "variants": [{"size": 8, "stock": 15}]
    }
  }
  ```

#### Delete Product
- **DELETE** `/product/delete/:slug`
- **URL Parameters**: 
  - `slug`: Product slug (e.g., `nike-air-max-270`)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

#### Toggle Product Visibility
- **PATCH** `/product/toggle/:slug`
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
  title: String,         // Required, min length: 1
  slug: String,          // Auto-generated, unique
  description: String,   // Required, min length: 10
  brand: String,         // Required
  imageUrl: [String],    // Array of image URLs (required, min 1 image)
  category: ObjectId,    // Required, reference to Category
  originalPrice: Decimal128,  // Required, min: 0
  finalPrice: Decimal128,     // Required, min: 0
  isPublic: Boolean,     // Default: true
  variants: [            // Required, min 1 variant
    {
      size: Number,      // Required, enum: [6,7,8,9,10,11]
      stock: Number      // Required, min: 0
    }
  ],
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
- Example: `Number(product.finalPrice)`

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
