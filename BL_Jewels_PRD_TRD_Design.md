# BL Jewels — MERN E-Commerce Platform
## PRD · TRD · Agent Design · UI Design System

> **Brand:** BL Jewels | *"Purity with Auspiciousness"*  
> **Stack:** MongoDB · Express · React (Vite) · Node.js  
> **Reference:** rightgold.com  
> **Version:** v1.0 · Frontend-Ready Document

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PART 1 · PRD — Product Requirements Document
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1.1 Vision & Objective

BL Jewels ka ek **premium, AI-assisted ecommerce platform** banana hai — Shopify-level UX,
Indian jewelry market focus, aur brand ke **crimson-gold identity** ke saath visually distinction.
Rightgold.com jaise premium editorial feel + modern ecommerce functionality ka fusion.

**Core Goal:** Convert first-time visitors into buyers with trust, beauty, and speed.

---

## 1.2 Target Audience

| Segment       | Profile                                           | Buying Trigger            |
| ------------- | ------------------------------------------------- | ------------------------- |
| Primary       | Women 25–55, urban India, Tier 1–2 cities         | Gifting + personal buy    |
| Secondary     | Men buying gifts (festival, anniversary, wedding) | Occasion-based            |
| Tertiary      | NRI buyers, wholesale/bulk                        | Heritage & trust          |
| Persona Match | Quality-conscious, hallmark-aware, trust-seeking  | Certification + purity    |

---

## 1.3 Core Feature Modules

### 🛍️ Customer Side

| Module                | Features                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| Homepage              | Hero, Featured Collections, Best Sellers, New Arrivals, USP, Testimonials |
| Product Listing (PLP) | Filters, Sort, Grid/List toggle, Quick View, Lazy Load                   |
| Product Detail (PDP)  | Multi-image gallery, Zoom, Metal/Karat selector, EMI, Add to Cart        |
| AI Search             | Semantic instant suggestions, voice search (Phase 2)                     |
| Cart & Wishlist       | Persistent cart, Wishlist sync, Guest cart                               |
| Checkout              | Multi-step: Address → Payment → Review → Confirm                         |
| Payments              | Razorpay — UPI, Card, Net Banking, EMI, COD                              |
| Order Tracking        | Status timeline + carrier tracking link                                  |
| User Account          | Orders, Wishlist, Address Book, Profile, Loyalty points (Phase 2)        |
| Reviews & Ratings     | Verified purchase badge, image reviews                                   |
| Blog/Education        | Gold purity guide, Hallmark info, Styling tips                           |
| Priya — AI Chatbot    | Floating widget, styling assistant, product recommendations              |

### 🔧 Admin Panel

| Module               | Features                                                      |
| -------------------- | ------------------------------------------------------------- |
| Dashboard            | Revenue, Orders, Inventory KPIs, Conversion rate             |
| Product Management   | CRUD, Variants (karat/weight/size), Bulk upload, Image manager |
| Category Management  | Nested categories, SEO slugs, Banner images                  |
| Order Management     | Status updates, Invoice PDF, Dispatch, Refunds               |
| Customer Management  | List, profile, order history, block/unblock                  |
| Coupon & Offers      | % off, flat off, cart min, product-specific, expiry          |
| Banner / CMS         | Homepage banners, announcement bar, popup management         |
| Analytics            | Sales reports, top products, revenue by category             |
| AI Tools             | Auto product description generator, bulk tag suggestions     |

---

## 1.4 Page Inventory

| #  | Page                 | Route                    | Priority |
| -- | -------------------- | ------------------------ | -------- |
| 1  | Homepage             | `/`                      | P0       |
| 2  | Collection Listing   | `/collections/:slug`     | P0       |
| 3  | Product Detail       | `/products/:slug`        | P0       |
| 4  | Search Results       | `/search?q=`             | P0       |
| 5  | Cart                 | `/cart`                  | P0       |
| 6  | Checkout             | `/checkout`              | P0       |
| 7  | Order Confirmation   | `/order/success/:id`     | P0       |
| 8  | Login / Register     | `/auth`                  | P0       |
| 9  | My Account           | `/account`               | P1       |
| 10 | My Orders            | `/account/orders`        | P1       |
| 11 | Wishlist             | `/wishlist`              | P1       |
| 12 | Order Tracking       | `/orders/:id/track`      | P1       |
| 13 | About Us             | `/about`                 | P1       |
| 14 | Contact              | `/contact`               | P1       |
| 15 | Blog Listing         | `/blog`                  | P2       |
| 16 | Blog Post            | `/blog/:slug`            | P2       |
| 17 | Admin Dashboard      | `/admin`                 | P0       |
| 18 | Admin Products       | `/admin/products`        | P0       |
| 19 | Admin Orders         | `/admin/orders`          | P0       |

---

## 1.5 Key User Flows

### Purchase Flow (Critical Path)
```
Homepage
  → Collection / PLP (Filter by occasion / metal)
    → PDP (Select variant, view gallery)
      → Add to Cart
        → Checkout (Address → Razorpay → Review)
          → Order Confirmation
            → Email + WhatsApp notification
              → Order Tracking
```

### Discovery Flow (AI-Assisted)
```
Homepage / Any page
  → Search bar / AI chatbot
    → Instant suggestions (PDP links)
      → PLP with pre-filled filters
        → PDP → Wishlist / Add to Cart
```

### Admin Product Publish Flow
```
Admin Login
  → Products → Add New
    → Fill: Name, Category, Metal, Karat
      → Upload Images (drag-drop, Cloudinary)
        → Add Variants (Weight/Size/Price/Stock)
          → AI Generate Description
            → Set Tags, SEO slug
              → Publish → Live on Store
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PART 2 · TRD — Technical Requirements Document
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2.1 Confirmed Tech Stack

### Frontend
| Layer            | Technology                         | Why                                         |
| ---------------- | ---------------------------------- | ------------------------------------------- |
| Framework        | **React 18 + Vite 5**              | Fast dev, HMR, modern build pipeline        |
| UI Component Lib | **ShadCN/UI + Radix UI Primitives**| Headless, 100% customizable, production-ready|
| Styling          | **Tailwind CSS v3.4**              | Utility-first, design token support          |
| Animation        | **Framer Motion v11**              | Premium smooth animations, spring physics   |
| State — Global   | **Zustand**                        | Lightweight, no boilerplate (cart, auth, UI) |
| State — Server   | **TanStack Query (React Query v5)**| Caching, refetch, optimistic updates        |
| Routing          | **React Router v6.4+**             | SPA with data loaders                       |
| Forms            | **React Hook Form + Zod**          | Performant + type-safe validation           |
| Icons            | **Lucide React**                   | Clean, consistent, tree-shakable            |
| Carousel         | **Embla Carousel**                 | Lightweight, touch-friendly, SSR-safe       |
| Image            | **Cloudinary + react-lazy-load-image** | CDN + lazy load + blur placeholder      |
| HTTP             | **Axios** with interceptors        | Request/response interceptors for auth      |
| Payments         | **Razorpay React SDK**             | Indian market, UPI/Card/EMI ready           |
| Notifications    | **Sonner** (toast) + ShadCN Alert  | Non-blocking, beautiful toasts              |

### Backend
| Layer        | Technology                    | Details                                      |
| ------------ | ----------------------------- | -------------------------------------------- |
| Runtime      | **Node.js 20 LTS**            | Current LTS, stable                          |
| Framework    | **Express.js 4.x**            | Minimal, middleware-based                    |
| Database     | **MongoDB Atlas**             | Cloud-managed, free tier to paid scaling     |
| ODM          | **Mongoose 8**                | Schema + validation + virtuals               |
| Auth         | **JWT + bcrypt**              | Access token 15m + Refresh token 7d (cookie) |
| File Upload  | **Multer + Cloudinary SDK**   | Image processing + CDN delivery              |
| Email        | **Nodemailer + Resend**       | Transactional emails (order confirm, OTP)    |
| Payment      | **Razorpay Node SDK**         | Order creation + webhook verification        |
| AI           | **OpenAI API (GPT-4o-mini)**  | Search, chatbot, description generation      |
| Search       | **MongoDB Atlas Search**      | Full-text + fuzzy search on products         |
| Rate Limit   | **express-rate-limit**        | API protection                               |
| Security     | **helmet + cors + express-mongo-sanitize** | Production hardening            |
| Validation   | **express-validator**         | Request body validation                      |
| Logging      | **Morgan + Winston**          | HTTP + application logs                      |

### DevOps / Infrastructure
| Tool         | Purpose                    | Service                    |
| ------------ | -------------------------- | -------------------------- |
| Hosting FE   | Vercel                     | Auto-deploy from GitHub    |
| Hosting BE   | Railway / Render           | Node.js server             |
| Database     | MongoDB Atlas              | M0 → M10 as scale          |
| Media CDN    | Cloudinary                 | Images + transformations   |
| CI/CD        | GitHub Actions             | Lint → Test → Deploy       |
| Monitoring   | Sentry                     | Error tracking both ends   |
| Analytics    | Google Analytics 4 + Hotjar| User behavior + heatmaps   |

---

## 2.2 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 CLIENT (React + Vite)                │
│                                                       │
│   Pages → Components → Custom Hooks → Zustand Store  │
│   TanStack Query (server state cache)                 │
│   React Router v6 (SPA routing)                      │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS REST API
                       │ /api/v1/*
┌──────────────────────▼───────────────────────────────┐
│              EXPRESS API SERVER (Node.js)             │
│                                                       │
│   Routes → Middleware → Controllers → Services        │
│                                                       │
│   MW Stack: helmet | cors | rateLimiter | auth | err  │
└──────┬───────────────┬─────────────────┬─────────────┘
       │               │                 │
┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼────────┐
│  MongoDB    │ │ Cloudinary  │ │  OpenAI API    │
│  Atlas      │ │ Media CDN   │ │  GPT-4o-mini   │
│  Mongoose   │ │ Image xform │ │  Embeddings    │
└─────────────┘ └─────────────┘ └────────────────┘
       │
┌──────▼──────┐ ┌──────────────┐
│  Razorpay   │ │ Resend/SMTP  │
│  Payments   │ │ Email        │
└─────────────┘ └──────────────┘
```

---

## 2.3 Folder Structure

### Frontend `/client`
```
client/
├── public/
│   ├── fonts/              # Self-hosted fonts (performance)
│   └── og-image.jpg        # Open Graph default image
│
├── src/
│   ├── assets/
│   │   ├── images/         # Static images, brand assets
│   │   ├── icons/          # Custom SVG icons
│   │   └── logo/           # BL Jewels logo variants
│   │
│   ├── components/
│   │   ├── ui/             # ShadCN base components (auto-generated)
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Desktop + Mobile nav
│   │   │   ├── Footer.jsx
│   │   │   ├── AnnouncementBar.jsx
│   │   │   └── MobileMenu.jsx
│   │   ├── home/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── FeaturedCollections.jsx
│   │   │   ├── BestSellers.jsx
│   │   │   ├── NewArrivals.jsx
│   │   │   ├── USPStrip.jsx
│   │   │   ├── BrandStory.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   └── BlogPreview.jsx
│   │   ├── product/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductGallery.jsx
│   │   │   ├── ProductInfo.jsx
│   │   │   ├── VariantSelector.jsx
│   │   │   ├── ProductTabs.jsx
│   │   │   ├── QuickViewModal.jsx
│   │   │   └── RelatedProducts.jsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── CartItem.jsx
│   │   │   └── CartSummary.jsx
│   │   ├── checkout/
│   │   │   ├── AddressForm.jsx
│   │   │   ├── PaymentForm.jsx
│   │   │   └── OrderSummary.jsx
│   │   ├── filters/
│   │   │   ├── FilterSidebar.jsx
│   │   │   ├── FilterMobileSheet.jsx
│   │   │   ├── PriceRangeSlider.jsx
│   │   │   └── SortDropdown.jsx
│   │   ├── account/
│   │   │   ├── ProfileCard.jsx
│   │   │   ├── OrderList.jsx
│   │   │   └── AddressBook.jsx
│   │   ├── ai/
│   │   │   ├── AISearchBar.jsx       # Smart search with suggestions
│   │   │   ├── PriyaChatbot.jsx      # Floating AI chat widget
│   │   │   └── RecommendationRow.jsx
│   │   └── common/
│   │       ├── StarRating.jsx
│   │       ├── PriceDisplay.jsx
│   │       ├── HallmarkBadge.jsx
│   │       ├── WishlistButton.jsx
│   │       ├── LoadingSkeleton.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Collection.jsx
│   │   ├── Product.jsx
│   │   ├── Search.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Auth.jsx
│   │   ├── Account/
│   │   │   ├── index.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Addresses.jsx
│   │   │   └── Profile.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Blog/
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Products/
│   │       ├── Orders/
│   │       ├── Customers.jsx
│   │       ├── Coupons.jsx
│   │       └── Banners.jsx
│   │
│   ├── hooks/
│   │   ├── useCart.js
│   │   ├── useWishlist.js
│   │   ├── useAuth.js
│   │   ├── useSearch.js
│   │   ├── useProducts.js
│   │   └── useOrders.js
│   │
│   ├── store/
│   │   ├── cartStore.js          # Zustand cart state
│   │   ├── authStore.js          # Zustand auth state
│   │   ├── uiStore.js            # Drawer/modal open states
│   │   └── wishlistStore.js
│   │
│   ├── services/
│   │   ├── api.js                # Axios instance + interceptors
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   └── aiService.js
│   │
│   ├── lib/
│   │   ├── utils.js              # cn(), formatCurrency(), slugify()
│   │   ├── constants.js          # METALS, KARATS, OCCASIONS etc.
│   │   └── validators.js         # Zod schemas
│   │
│   ├── styles/
│   │   ├── globals.css           # CSS variables + base styles
│   │   └── animations.css        # Custom keyframes
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
│
├── components.json               # ShadCN config
├── tailwind.config.js
├── vite.config.js
└── .env.local
```

### Backend `/server`
```
server/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB Atlas connection
│   │   ├── cloudinary.js
│   │   └── razorpay.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Coupon.js
│   │   ├── Banner.js
│   │   └── Blog.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── reviewController.js
│   │   ├── paymentController.js
│   │   ├── couponController.js
│   │   └── aiController.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   ├── cart.routes.js
│   │   ├── review.routes.js
│   │   ├── payment.routes.js
│   │   ├── coupon.routes.js
│   │   └── ai.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.js             # protect + adminOnly
│   │   ├── upload.js           # Multer config
│   │   ├── rateLimiter.js
│   │   ├── errorHandler.js
│   │   └── asyncHandler.js
│   │
│   ├── services/
│   │   ├── emailService.js
│   │   ├── cloudinaryService.js
│   │   ├── paymentService.js
│   │   └── aiService.js        # OpenAI calls
│   │
│   ├── utils/
│   │   ├── apiFeatures.js      # Filter, Sort, Paginate class
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   │
│   └── server.js
│
├── .env
└── package.json
```

---

## 2.4 REST API Endpoints

**Base URL:** `/api/v1`

```
━━━ AUTH
POST    /auth/register              # New user
POST    /auth/login                 # Login → access + refresh token
POST    /auth/logout                # Clear refresh cookie
POST    /auth/refresh               # Get new access token
POST    /auth/forgot-password       # Send reset email
PATCH   /auth/reset-password/:token # Reset with token

━━━ PRODUCTS
GET     /products                   # List (filter, sort, paginate)
GET     /products/featured          # Featured products
GET     /products/new-arrivals      # Recent products
GET     /products/search?q=&...     # Full-text search
GET     /products/:slug             # Single product detail
POST    /products            [ADMIN] # Create product
PUT     /products/:id        [ADMIN] # Update product
DELETE  /products/:id        [ADMIN] # Soft delete
POST    /products/:id/images [ADMIN] # Upload images
DELETE  /products/:id/images/:imgId [ADMIN]

━━━ CATEGORIES
GET     /categories                 # All (with product count)
GET     /categories/:slug           # Category + products
POST    /categories          [ADMIN]
PUT     /categories/:id      [ADMIN]
DELETE  /categories/:id      [ADMIN]

━━━ CART (server-synced for logged-in users)
GET     /cart                       # Get user cart
POST    /cart/add                   # Add item
PUT     /cart/update                # Update quantity
DELETE  /cart/remove/:itemId        # Remove item
DELETE  /cart/clear                 # Clear cart
POST    /cart/apply-coupon          # Apply coupon code

━━━ ORDERS
POST    /orders/create              # Place order
GET     /orders/my                  # User's own orders
GET     /orders/:id                 # Single order detail
GET     /orders                [ADMIN] # All orders
PATCH   /orders/:id/status   [ADMIN] # Update status
GET     /orders/:id/invoice  [ADMIN] # Generate PDF invoice

━━━ REVIEWS
GET     /reviews/:productId         # Product reviews
POST    /reviews/:productId         # Add review (auth)
DELETE  /reviews/:id                # Delete own review
PATCH   /reviews/:id/helpful        # Mark helpful

━━━ PAYMENTS
POST    /payments/create-order      # Create Razorpay order
POST    /payments/verify            # Verify signature
POST    /payments/webhook           # Razorpay webhook

━━━ WISHLIST
GET     /wishlist                   # Get wishlist
POST    /wishlist/toggle/:productId # Add/remove toggle

━━━ COUPONS
POST    /coupons/validate           # Check if coupon valid
GET     /coupons             [ADMIN]
POST    /coupons             [ADMIN]
PUT     /coupons/:id         [ADMIN]
DELETE  /coupons/:id         [ADMIN]

━━━ AI ENDPOINTS
POST    /ai/search-suggest          # Semantic search suggestions
POST    /ai/recommendations         # Product recommendations
POST    /ai/chat                    # Priya chatbot message
POST    /ai/generate-description   [ADMIN] # Auto product copy

━━━ UPLOAD
POST    /upload/image               # Single image → Cloudinary
POST    /upload/images              # Multiple images
DELETE  /upload/:publicId           # Delete from Cloudinary
```

---

## 2.5 Database Schema — Key Models

### Product Model
```javascript
const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, unique: true, lowercase: true },
  description:      { type: String, required: true },
  shortDescription: { type: String, maxlength: 160 },  // for SEO meta
  sku:              { type: String, unique: true, sparse: true },

  category:    { type: ObjectId, ref: 'Category', required: true },
  subcategory: { type: String },
  tags:        [{ type: String, lowercase: true }],

  metal: {
    type:   { type: String, enum: ['gold', 'silver', 'platinum', 'diamond', 'mixed'] },
    karat:  { type: String, enum: ['14K', '18K', '22K', '24K', 'N/A'] },
    purity: { type: String },     // "916", "750", "999"
    color:  { type: String, enum: ['yellow', 'white', 'rose', 'mixed'] },
  },

  // Each variant = a purchasable product configuration
  variants: [{
    label:         String,        // "22K · 4.2g"
    weight:        Number,        // grams
    size:          String,        // ring size / chain length in cm
    price:         { type: Number, required: true },
    discountPrice: Number,
    stock:         { type: Number, default: 0 },
    sku:           String,
    isDefault:     { type: Boolean, default: false },
  }],

  images: [{
    url:       { type: String, required: true },
    publicId:  String,            // Cloudinary public_id for deletion
    alt:       String,
    isPrimary: { type: Boolean, default: false },
  }],

  stone: {
    type:     String,             // Diamond, Ruby, Emerald, Pearl...
    carats:   Number,
    quality:  String,             // VVS, VS, SI, I (for diamonds)
    color:    String,
    clarity:  String,
  },

  occasion:        [String],      // ["wedding", "daily-wear", "gifting"]
  certifications:  [String],      // ["BIS Hallmark", "GIA Certificate"]
  careInstructions: String,

  isFeatured:  { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },

  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 },
  },

  seo: {
    metaTitle:       String,
    metaDescription: String,
    keywords:        [String],
  },

}, { timestamps: true });

// Auto-generate slug before save
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Atlas Search Index on: name, description, tags, metal.type, occasion
```

### Order Model
```javascript
const orderSchema = new mongoose.Schema({
  user:        { type: ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },  // BLJ-2024-00001

  items: [{
    product:  { type: ObjectId, ref: 'Product' },
    snapshot: {                          // Price snapshot at order time
      name:     String,
      image:    String,
      variant:  Object,
      metal:    Object,
    },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true },  // price at order time
  }],

  shippingAddress: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    pincode: String,
    country: { type: String, default: 'India' },
  },

  pricing: {
    subtotal:  Number,
    discount:  { type: Number, default: 0 },
    coupon:    String,
    shipping:  { type: Number, default: 0 },
    gst:       Number,           // 3% on gold jewelry
    total:     Number,
  },

  payment: {
    method:           { type: String, enum: ['razorpay', 'cod'] },
    status:           { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId:  String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt:           Date,
  },

  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'placed',
  },

  statusHistory: [{ status: String, note: String, updatedAt: Date }],

  tracking: {
    carrier:    String,
    trackingId: String,
    url:        String,
    estimatedDelivery: Date,
  },

  notes:    String,             // Special instructions
  isGift:   { type: Boolean, default: false },
  giftNote: String,

}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await Order.countDocuments();
    this.orderNumber = `BLJ-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});
```

### User Model
```javascript
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, unique: true, lowercase: true },
  phone:      { type: String, unique: true, sparse: true },
  password:   { type: String, minlength: 6, select: false },

  role:       { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar:     { type: String },

  addresses:  [{
    label:   { type: String, enum: ['Home', 'Office', 'Other'] },
    name:    String, phone: String,
    line1:   String, line2: String,
    city:    String, state: String, pincode: String,
    isDefault: { type: Boolean, default: false },
  }],

  wishlist:        [{ type: ObjectId, ref: 'Product' }],
  refreshToken:    { type: String, select: false },
  resetToken:      String,
  resetExpiry:     Date,
  isActive:        { type: Boolean, default: true },

}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

---

## 2.6 Auth Strategy

```
Access Token  → JWT, 15min expiry, sent in Authorization header
Refresh Token → JWT, 7 days, stored in httpOnly Secure cookie

Flow:
  Login → { accessToken } + Set-Cookie: refreshToken
  API calls → Bearer <accessToken>
  Token expired → POST /auth/refresh → new accessToken (via cookie)
  Logout → Clear refresh cookie + blacklist (Redis in Phase 2)

Role Guards:
  protect      → any logged-in user
  adminOnly    → role === 'admin'

Password Reset:
  Forgot → generate crypto token → hash → store in DB → send email
  Reset  → compare token → update password → invalidate token
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PART 3 · AGENT DESIGN — AI Layer
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3.1 AI Features Roadmap

| Feature                   | Priority | Model          | Placement              |
| ------------------------- | -------- | -------------- | ---------------------- |
| Smart Search Suggestions  | P0       | Atlas Search + GPT-4o-mini | Navbar searchbar  |
| Product Recommendations   | P1       | GPT-4o-mini    | PDP bottom, Cart drawer|
| Priya — Styling Chatbot   | P1       | GPT-4o-mini    | Floating widget        |
| Auto Description Generator| P2       | GPT-4o         | Admin product form     |
| Visual Search (image-in)  | Phase 3  | GPT-4 Vision   | PLP top bar            |
| AR Try-On                 | Phase 3  | TBD            | PDP                    |

---

## 3.2 Smart Search Agent

### Architecture
```
User types in search bar (debounce 300ms)
         ↓
POST /ai/search-suggest { query, currentCategory?, priceRange? }
         ↓
Server:
  1. Atlas Search → keyword match on name/tags/metal
  2. Pass top 10 candidates + user query to GPT-4o-mini
  3. GPT reranks + enriches with semantic understanding
         ↓
Return: [{ productId, name, image, price, matchReason, slug }]
         ↓
Client: Instant dropdown (< 400ms target)
```

### Backend Service
```javascript
// services/aiService.js
async function getSearchSuggestions(query, candidates) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `You are BL Jewels search assistant.
        Given user query and product candidates, return top 6 matches.
        Understand intent: occasion, metal, karat, budget, category.
        Map "mangalsutra for wedding" → category=necklace, occasion=wedding.
        Return JSON: { results: [{ id, relevanceScore, reason }] }
        Only return JSON, no extra text.`
    }, {
      role: 'user',
      content: `Query: "${query}"\nCandidates: ${JSON.stringify(candidates)}`
    }],
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 3.3 Priya — AI Styling Chatbot

### Personality & Behavior
```
Name:         Priya
Personality:  Warm, knowledgeable jewelry expert from BL Jewels
Languages:    Hindi, English, Hinglish (auto-detect from user message)
Context:      Knows current page (product, collection, cart contents)
Purpose:      Help customers find the right jewelry, answer questions,
              guide purchase decisions
Tone:         Premium but approachable, never pushy
```

### System Prompt
```
You are Priya, a personal jewelry styling expert at BL Jewels — a premium
Indian jewelry brand known for "Purity with Auspiciousness."

Your mission: Help customers find the perfect jewelry piece.

Start by understanding:
- Who is buying and for whom?
- What's the occasion? (wedding, gifting, daily-wear, festival)
- What metal preference? (gold, silver, diamond)
- Any budget range?

Then recommend from our catalog, explain metal purity (22K=916 hallmark etc.),
and help with sizing/gifting.

Rules:
- Respond in the same language the user writes (Hindi/English/Hinglish)
- Never make up prices — say "please check the product page for latest price"
- Always encourage trying our BIS Hallmarked certified pieces
- If unsure, say "Let me connect you with our team"
- Keep responses concise — 2-3 sentences max unless asked for detail
- End with a product link suggestion when relevant

Brand voice: "At BL Jewels, purity is our promise."
```

### Widget Component Structure
```jsx
// Floating chatbot widget
// Position: fixed bottom-right
// Collapsed: 56px circle, crimson bg, gold diamond icon
// Expanded: 380px × 500px card (glassmorphism)

const PriyaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Namaste! 🙏 Main Priya hoon, aapki BL Jewels stylist. Aaj main aapki kya madad kar sakti hoon?'
  }]);
  const [context, setContext] = useState({
    currentProduct: null,    // inject from page
    cartItems: [],           // inject from Zustand
  });
  // ...
};
```

### API Flow
```javascript
// POST /ai/chat
// Body: { messages: [...history], context: { product, cart } }

async function chatWithPriya(messages, context) {
  const systemMessage = buildSystemPrompt(context);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemMessage }, ...messages],
    max_tokens: 300,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}
```

---

## 3.4 Admin: Auto Description Generator

### Flow
```
Admin fills: Product name, Metal type, Karat, Stone, Occasion, Tags
   ↓
Clicks "✨ Generate with AI"
   ↓
POST /ai/generate-description
   ↓
GPT-4o generates: short description (160 chars) + long description (350 words)
                  + SEO meta title + 5 focus keywords
   ↓
Pre-fills form fields (admin can edit before saving)
```

### System Prompt (Description Generator)
```
You are BL Jewels' copywriter. Write premium, SEO-optimized product descriptions.

Brand voice: Elegant, trustworthy, heritage-rich, modern.
Tagline: "Purity with Auspiciousness"
Audience: Premium Indian jewelry buyers

Given product details, return JSON:
{
  "shortDescription": "~160 chars, for cards and meta",
  "longDescription": "300-400 words, sections: [overview, craftsmanship, occasions, care]",
  "metaTitle": "SEO title ~60 chars",
  "keywords": ["5 focus keywords"],
  "features": ["4-5 key selling points as bullet items"]
}

Emphasize: Hallmark certification, karat purity, craftsmanship heritage.
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PART 4 · DESIGN SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4.1 Brand Color Palette

> Directly extracted from BL Jewels logo — Deep Crimson + Champagne Gold + Warm Pearl base.

```css
/* ── CRIMSON (Primary Brand) ─────────────────── */
--crimson-950: #3D0505;    /* Near-black crimson for text on light */
--crimson-900: #5C0A0A;    /* Deepest crimson */
--crimson-800: #7A0F0F;    /* Dark crimson */
--crimson-700: #8B1A1A;    /* ★ PRIMARY BRAND RED (logo match) */
--crimson-600: #9B2020;    /* Hover state */
--crimson-500: #B02828;    /* Button active */
--crimson-100: #FDF0F0;    /* Light tint for backgrounds */
--crimson-50:  #FFF5F5;    /* Faintest blush for section bg */

/* ── GOLD (Secondary Brand) ──────────────────── */
--gold-950:    #4A3300;    /* Near-black gold */
--gold-900:    #7A5C00;    /* Deepest gold */
--gold-700:    #A07830;    /* Antique gold */
--gold-500:    #C9A44A;    /* ★ PRIMARY GOLD (logo match) */
--gold-400:    #D4B05A;    /* Light gold */
--gold-300:    #E0C478;    /* Highlight gold */
--gold-200:    #EDD98A;    /* Shimmer gold */
--gold-100:    #FAF3DC;    /* Gold tint background */
--gold-50:     #FFFBEE;    /* Faintest gold wash */

/* ── NEUTRAL BASE (Warm Whites) ──────────────── */
--pearl:       #FAF7F2;    /* ★ PAGE BACKGROUND — warm pearl white */
--ivory:       #F5F0E8;    /* Card background */
--warm-white:  #FFFEF9;    /* Input / modal bg */
--parchment:   #EDE5D8;    /* Subtle section contrast */

/* ── TEXT ────────────────────────────────────── */
--text-primary:   #1C1410;  /* Warm charcoal (not pure black) */
--text-secondary: #6B5B52;  /* Muted warm brown */
--text-muted:     #9E8E85;  /* Captions, meta */
--text-inverse:   #FAF7F2;  /* On dark/crimson backgrounds */

/* ── BORDER ──────────────────────────────────── */
--border-light:   #E8E0D5;  /* Default borders */
--border-gold:    rgba(201, 164, 74, 0.3);   /* Gold accent border */
--border-crimson: rgba(139, 26, 26, 0.2);    /* Crimson accent border */

/* ── SEMANTIC ────────────────────────────────── */
--success:    #2D7A4F;
--error:      #C0392B;
--warning:    #D4AC0D;
--info:       #2980B9;
```

### Tailwind Config Extension
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        crimson: {
          50:  '#FFF5F5',
          100: '#FDF0F0',
          500: '#B02828',
          600: '#9B2020',
          700: '#8B1A1A',   // primary
          800: '#7A0F0F',
          900: '#5C0A0A',
          950: '#3D0505',
        },
        gold: {
          50:  '#FFFBEE',
          100: '#FAF3DC',
          200: '#EDD98A',
          300: '#E0C478',
          400: '#D4B05A',
          500: '#C9A44A',   // primary
          700: '#A07830',
          900: '#7A5C00',
          950: '#4A3300',
        },
        pearl:    '#FAF7F2',
        ivory:    '#F5F0E8',
        parchment: '#EDE5D8',
        charcoal: '#1C1410',
      },
      boxShadow: {
        'gold-sm': '0 2px 8px rgba(201, 164, 74, 0.15)',
        'gold':    '0 4px 20px rgba(201, 164, 74, 0.25)',
        'gold-lg': '0 8px 40px rgba(201, 164, 74, 0.35)',
        'crimson': '0 4px 20px rgba(139, 26, 26, 0.25)',
        'premium': '0 20px 60px rgba(28, 20, 16, 0.12)',
      },
    },
  },
};
```

---

## 4.2 Typography System

### Font Families
```
DISPLAY — Cormorant Garamond
  Role:   Hero headings, collection titles, brand moments
  Feel:   Luxury editorial, old-world elegance, distinctly NOT generic
  Use:    H1, H2, large quotes, section display text
  Weights: 300 (Light), 400 (Regular), 600 (SemiBold), 300i (Italic)

BODY — DM Sans
  Role:   UI text, descriptions, navigation, buttons, labels
  Feel:   Modern, clean, premium clarity
  Use:    Body copy, UI elements, forms, meta info
  Weights: 300, 400, 500, 600

ACCENT — Cinzel
  Role:   Price displays, certifications, brand name in components
  Feel:   Classical Roman capitals — timeless jewelry vernacular
  Use:    Price tags, "BL JEWELS" wordmark in nav, hallmark labels
  Weights: 400, 600
```

### Google Fonts Import (paste in `index.html`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet">
```

### Type Scale (in CSS variables)
```css
/* In globals.css */
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-accent:  'Cinzel', 'Trajan Pro', serif;

  /* Scale */
  --text-xs:   0.75rem;    /* 12px — Tags, badges */
  --text-sm:   0.875rem;   /* 14px — Meta, captions */
  --text-base: 1rem;       /* 16px — Body copy */
  --text-lg:   1.125rem;   /* 18px — Lead paragraph */
  --text-xl:   1.25rem;    /* 20px — Card headings */
  --text-2xl:  1.5rem;     /* 24px — Sub-section heads */
  --text-3xl:  1.875rem;   /* 30px — Section headings */
  --text-4xl:  2.25rem;    /* 36px — Page headings */
  --text-5xl:  3rem;       /* 48px — Large display */
  --text-6xl:  3.75rem;    /* 60px — Hero subheading */
  --text-8xl:  6rem;       /* 96px — Hero DISPLAY (Cormorant) */
  --text-9xl:  8rem;       /* 128px — Oversized editorial moment */
}
```

### Tailwind Extend (typography)
```javascript
fontFamily: {
  display: ['Cormorant Garamond', 'Georgia', 'serif'],
  body:    ['DM Sans', 'system-ui', 'sans-serif'],
  accent:  ['Cinzel', 'serif'],
},
letterSpacing: {
  cinzel:    '0.08em',   // Cinzel always needs tracking
  display:   '-0.01em',  // Cormorant slightly tighter at large sizes
  wide:      '0.12em',   // DM Sans labels
},
lineHeight: {
  display:  '1.1',
  tight:    '1.2',
  snug:     '1.35',
  relaxed:  '1.7',       // Body Cormorant at small sizes
},
```

---

## 4.3 ShadCN/UI Setup & Component List

### Init
```bash
# 1. Create project
npm create vite@latest bl-jewels-client -- --template react
cd bl-jewels-client

# 2. Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Init ShadCN
npx shadcn@latest init
# → Style: Default
# → Base color: Neutral
# → CSS variables: Yes

# 4. Install core components
npx shadcn@latest add button input label card sheet dialog
npx shadcn@latest add dropdown-menu navigation-menu badge
npx shadcn@latest add select slider checkbox radio-group
npx shadcn@latest add toast sonner avatar separator skeleton
npx shadcn@latest add accordion tabs breadcrumb command
npx shadcn@latest add scroll-area progress drawer

# 5. Additional packages
npm install framer-motion
npm install embla-carousel-react embla-carousel-autoplay
npm install zustand @tanstack/react-query
npm install react-router-dom
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install lucide-react
npm install react-lazy-load-image-component
npm install react-medium-image-zoom
npm install sonner
```

### CSS Variable Overrides (ShadCN + BL Jewels branding)
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background:   27 22% 97%;       /* pearl #FAF7F2 */
    --foreground:   20 25% 10%;       /* charcoal #1C1410 */

    --card:         32 30% 95%;       /* ivory */
    --card-foreground: 20 25% 10%;

    --primary:      0 73% 32%;        /* crimson-700 #8B1A1A */
    --primary-foreground: 27 22% 97%;

    --secondary:    43 53% 54%;       /* gold-500 #C9A44A */
    --secondary-foreground: 20 25% 10%;

    --muted:        32 15% 90%;
    --muted-foreground: 20 15% 42%;

    --accent:       43 53% 54%;       /* gold */
    --accent-foreground: 20 25% 10%;

    --border:       32 20% 88%;       /* border-light */
    --input:        32 20% 88%;
    --ring:         43 53% 54%;       /* gold focus ring */

    --radius: 0.75rem;
  }
}

/* ── Gold Shimmer Animation ───────────────────── */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.gold-shimmer-text {
  background: linear-gradient(
    90deg,
    #A07830 0%, #D4B05A 30%, #EDD98A 50%, #D4B05A 70%, #A07830 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

.gold-shimmer-border {
  background: linear-gradient(90deg, #C9A44A, #EDD98A, #C9A44A);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
}

/* ── Glassmorphism ────────────────────────────── */
.glass {
  background: rgba(255, 254, 249, 0.75);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(201, 164, 74, 0.2);
}

/* ── Premium Scroll ───────────────────────────── */
html { scroll-behavior: smooth; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #FAF7F2; }
::-webkit-scrollbar-thumb { background: #C9A44A; border-radius: 3px; }
```

---

## 4.4 Framer Motion — Design Language

### Motion Tokens
```javascript
// src/lib/motion.js

// Page transition
export const pageTransition = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Fade up (section reveals)
export const fadeUp = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

// Stagger container
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// Card hover (product cards)
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -8, scale: 1.02,
    transition: { type: 'spring', stiffness: 350, damping: 25 }
  }
};

// Cart drawer
export const drawerVariants = {
  closed: { x: '100%' },
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  }
};

// Image zoom overlay
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
};
```

### "Deliberate Luxury Motion" Philosophy
```
✦ Entry:     Sections fade up once, staggered children — not every card on scroll
✦ Hover:     Product cards: subtle lift + gold border glow (spring physics)
✦ CTA:       Buttons scale 1.02 on hover, shadow deepens
✦ Loading:   Skeleton shimmer (warm gold tint — not grey)
✦ Page:      Simple fade — no jarring slides or elaborate transitions
✦ Cart:      Spring slide from right
✦ Modal:     Scale from 0.95 → 1.0 + fade
✦ Hero:      One orchestrated load sequence — not repeated on scroll
✦ AVOID:     Per-card scroll animations, parallax on everything, spinning loaders
```

---

## 4.5 Page-by-Page Component Blueprint

### Homepage
```
<AnnouncementBar />
  "🚚 Free Shipping on orders above ₹5,000 · BIS Hallmarked"

<Navbar />
  Logo (center) | Collections · Blog (left) | Search · Wishlist · Cart · Account (right)
  Scroll → frosted glass background (glass utility class)

<HeroSection />
  Full viewport (100dvh)
  BG: Warm pearl gradient (#FAF7F2 → #F5F0E8)
  Eyebrow: "Purity with Auspiciousness" [Cinzel, tracked, gold-500]
  Headline: "Timeless Jewels, Crafted for Generations" [Cormorant 7xl, crimson-700]
  Subheading: [DM Sans, text-secondary]
  CTA: "Explore Collections" [Crimson filled] + "Our Story" [ghost]
  Visual: Right side — editorial product image with gold circle frame
  
<FeaturedCollections />
  4-col grid (desktop), 2-col (tablet), 1-col (mobile)
  Cards: hover scale + gold border glow
  Categories: Rings, Necklaces, Earrings, Bracelets

<USPStrip />
  4 columns: "916 Hallmarked" · "Certified Purity" · "Free Shipping" · "Easy Returns"
  [Cinzel labels, gold-500 icons]

<BestSellers />
  Heading: "Bestsellers" [Cormorant 4xl]
  Horizontal Embla carousel (desktop: 4 visible, mobile: 1.5)
  ProductCard with Quick Add

<NewArrivals />
  Masonry-ish 3+1 grid layout
  "New" badge [crimson pill]

<BrandStory />
  Editorial layout: large gold quote left, image right
  "Since our founding, BL Jewels has been synonymous with..."

<Testimonials />
  3-col grid, star ratings, customer photo, verified badge

<BlogPreview />
  3-col cards, category tag [gold badge]

<NewsletterSection />
  BG: crimson-900, text white + gold accents
  "Join the BL Jewels Family"

<Footer />
  4-col: Brand | Shop | Help | Connect
  Gold divider line
  Bottom: © + Payment icons (Razorpay badge)
```

### Product Listing Page (PLP)
```
<CollectionHero />     Full-width banner, collection name overlay

<div class="flex">
  <FilterSidebar />    Fixed left (desktop)
    Filters: Category | Metal Type | Karat | Price Range (slider) | Stone | Occasion
    Mobile: Sheet from bottom (ShadCN Sheet)

  <div class="flex-1">
    <FilterBar />      Active filters as removable chips + Sort dropdown + Count
    <ProductGrid />    4→3→2→1 responsive grid
    <Pagination />     Numbered or "Load More" button
  </div>
</div>

<QuickViewModal />     Opens on card hover "Quick View" button
```

### Product Detail Page (PDP)
```
<Breadcrumb />         Home > Gold Rings > [Product Name]

<div class="grid grid-cols-2">
  <ProductGallery />
    Main image (zoom: react-medium-image-zoom)
    Thumbnail row (Embla horizontal scroll)
    Badge: "New" | "Bestseller" | "Limited"

  <ProductInfo />
    <ProductTitle />     [Cormorant 3xl]
    <SKUMeta />          SKU: BLJ-GR-001 · BIS Hallmarked ✓
    <PriceDisplay />     [Cinzel] ₹24,500 ~~₹28,000~~ · Save ₹3,500
    <MetalDetails />     22K Yellow Gold · 916 Purity · 4.2g
    <VariantSelector />  Weight options (pills) + Size (if applicable)
    <QuantitySelector />
    <CTAButtons />
      [Add to Cart — full width, crimson]
      [Buy Now — gold outlined]
      [Wishlist — heart icon]
    <EMIBanner />        "EMI from ₹X/month on Razorpay"
    <CertBadges />       BIS Hallmark | Free Shipping | 15-day Returns
    <ShareButtons />
</div>

<ProductTabs />         Description | Metal Details | Reviews | Care Guide
<RelatedProducts />     "You Might Also Love"
<RecentlyViewed />      Last 4 viewed products (localStorage)
```

---

## 4.6 Spacing & Layout Tokens

```javascript
// tailwind.config.js extend
spacing: {
  '18': '4.5rem',   // 72px
  '22': '5.5rem',   // 88px
  '30': '7.5rem',   // 120px — section padding
  '40': '10rem',    // 160px — hero padding
},
maxWidth: {
  'content': '1280px',
  'narrow':  '800px',   // blog, about
  'reading': '65ch',
},
borderRadius: {
  DEFAULT: '0.75rem',   // 12px — cards, inputs
  'pill':  '9999px',    // tags, badges
  'xl':    '1rem',      // feature cards
  '2xl':   '1.5rem',    // hero elements
},
```

### Container Utility
```css
.container-bl {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 5vw, 4rem);
}
```

---

## 4.7 Product Card Component Spec

```jsx
// components/product/ProductCard.jsx

const ProductCard = ({ product }) => {
  return (
    <motion.article
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className="group relative bg-ivory rounded-xl overflow-hidden
                 border border-transparent
                 hover:border-gold-300 hover:shadow-gold
                 transition-colors duration-300"
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-parchment">
        <img src={product.primaryImage} alt={product.name}
             className="w-full h-full object-cover
                        group-hover:scale-105 transition-transform duration-500" />

        {/* Badges */}
        {product.isNewArrival && (
          <span className="absolute top-3 left-3
                           bg-crimson-700 text-white
                           font-body text-xs font-medium
                           px-2.5 py-1 rounded-pill">New</span>
        )}

        {/* Hover overlay actions */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10
                        transition-colors duration-300 flex items-end justify-center pb-4
                        opacity-0 group-hover:opacity-100">
          <button className="bg-white/90 backdrop-blur-sm text-charcoal
                             font-body text-sm font-medium
                             px-5 py-2 rounded-pill
                             hover:bg-crimson-700 hover:text-white
                             transition-colors duration-200">
            Quick View
          </button>
        </div>

        <WishlistButton productId={product._id}
                        className="absolute top-3 right-3" />
      </div>

      {/* Info area */}
      <div className="p-4 space-y-1">
        <p className="font-body text-xs text-muted-foreground tracking-wide">
          {product.metal.karat} {product.metal.color} Gold
        </p>
        <h3 className="font-display text-lg leading-snug text-charcoal
                       line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-accent text-base text-crimson-700">
            ₹{formatCurrency(product.variants[0].discountPrice || product.variants[0].price)}
          </span>
          {product.variants[0].discountPrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              ₹{formatCurrency(product.variants[0].price)}
            </span>
          )}
        </div>
        {product.certifications.includes('BIS Hallmark') && (
          <p className="font-body text-xs text-gold-700 flex items-center gap-1">
            <HallmarkIcon className="w-3 h-3" /> BIS Hallmarked
          </p>
        )}
      </div>
    </motion.article>
  );
};
```

---

## 4.8 Responsive Breakpoints & Grid

```
Mobile First Approach

xs     < 480px   1-col product grid
sm   480–639px   2-col product grid
md   640–767px   2-col product grid
lg   768–1023px  3-col product grid
xl  1024–1279px  4-col product grid
2xl   ≥ 1280px  4-col product grid (max-width container)
```

### Responsive Product Grid
```jsx
<div className="grid
  grid-cols-2
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4 md:gap-6">
  {products.map(p => <ProductCard key={p._id} product={p} />)}
</div>
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PART 5 · DEVELOPMENT PHASES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Phase 0 — Foundation (Week 1–2)
- [ ] Monorepo setup: `/client` + `/server`
- [ ] Tailwind + ShadCN initialized with BL Jewels design tokens
- [ ] Global styles (globals.css with CSS variables)
- [ ] Font setup (Cormorant + DM Sans + Cinzel)
- [ ] MongoDB Atlas connected + Mongoose models created
- [ ] Auth APIs (register, login, JWT + refresh token)
- [ ] Cloudinary integration + upload middleware
- [ ] Base component set: Button, Input, Card, Badge, Skeleton
- [ ] Navbar + Footer shell
- [ ] React Router setup (all routes declared, placeholder pages)

## Phase 1 — Core Customer Flow (Week 3–6)
- [ ] Homepage (all sections)
- [ ] PLP (product grid + filters + sort + pagination)
- [ ] PDP (gallery + variants + cart add)
- [ ] Cart (Zustand store + drawer)
- [ ] Wishlist (toggle + page)
- [ ] Checkout (multi-step form)
- [ ] Razorpay integration
- [ ] Order confirmation page
- [ ] Basic account page (orders list)
- [ ] Search (Atlas Search basic)

## Phase 2 — Admin Panel (Week 7–9)
- [ ] Admin layout + protected routes
- [ ] Product CRUD + image upload
- [ ] Category management
- [ ] Order management (status updates)
- [ ] Dashboard KPIs
- [ ] Coupon management

## Phase 3 — AI Features (Week 10–11)
- [ ] Smart search (Atlas + GPT-4o-mini)
- [ ] Priya chatbot widget
- [ ] Product recommendations (PDP)
- [ ] Auto description generator (admin)

## Phase 4 — Polish & Launch (Week 12–14)
- [ ] SEO (react-helmet, sitemap, OG tags)
- [ ] Performance audit (Lighthouse 90+ target)
- [ ] Mobile QA (cross-device)
- [ ] Error boundaries + fallback UI
- [ ] Production env + GitHub Actions CI/CD
- [ ] Vercel deploy (FE) + Railway deploy (BE)
- [ ] GA4 + Hotjar setup
- [ ] Smoke testing all flows

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUICK START
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Environment Variables

### Client `.env.local`
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_APP_NAME=BL Jewels
VITE_APP_URL=http://localhost:5173
```

### Server `.env`
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bl-jewels

# Auth
JWT_SECRET=bl_jewels_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=bl_jewels_refresh_secret_change_this
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=orders@bljewels.com

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Git Init & Run
```bash
# Root monorepo
git init bl-jewels-platform
cd bl-jewels-platform

# Client
npm create vite@latest client -- --template react
cd client && npm install && npm run dev

# Server (separate terminal)
mkdir server && cd server
npm init -y
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken
npm install multer cloudinary razorpay openai nodemailer express-rate-limit
npm install -D nodemon
node src/server.js
```

---

*BL Jewels Platform — Internal Dev Document v1.0*  
*Purity with Auspiciousness ✦*
