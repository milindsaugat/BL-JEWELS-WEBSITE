# BL Jewels — MERN E-Commerce Platform
> *"Purity with Auspiciousness"* ✦ Fine Indian Heritage Jewelry

A luxury MERN e-commerce platform built strictly according to `BL_Jewels_PRD_TRD_Design.md`, tailored for Indian high-trust fine jewelry with deep crimson (`#8B1A1A`), champagne gold (`#C9A44A`), warm pearl (`#FAF7F2`), and charcoal typography.

---

## ✦ Key Modules Developed

1. **Brand Design System & Aesthetics**
   - **Colors**: Deep Crimson (`#8B1A1A`), Primary Gold (`#C9A44A`), Warm Pearl (`#FAF7F2`), Ivory (`#F5F0E8`).
   - **Typography**: Cormorant Garamond (Editorial Display), DM Sans (Body), Cinzel (Roman Classical Accent).
   - **Effects**: Gold shimmer animations (`.gold-shimmer-text`), frosted glassmorphism (`.glass`), custom gold scrollbars.

2. **Customer Storefront (`/client`)**
   - **Homepage**: Hero Section, USP Strip (BIS 916 Hallmark, Insured Shipping, Lifetime Buyback), Featured Collections, Bestsellers, Heritage Story, New Arrivals, Patron Testimonials, VIP Newsletter.
   - **Product Listing Page (PLP)**: Dynamic filtering by Metal type, Gold Karat (22K, 18K, 14K), Occasion, and Price Slider with sorting (Price, Rating, Newest).
   - **Product Detail Page (PDP)**: Multi-angle gallery with zoom preview, weight & karat selectors, live EMI calculator, BIS Hallmark badge, tabs for Craftsmanship, Care Guide & Hallmark Guarantees.
   - **Cart & Slide-out Drawer**: Real-time quantity stepper, free express shipping progress bar, coupon validation (`SHUBH10`, `WELCOME5`), and complete tax breakdown (3% GST).
   - **Checkout**: Multi-step delivery address form, gift packaging note, Razorpay secure payment simulator and Pay on Delivery options.
   - **Order Confirmation**: Instant receipt with Blue Dart Luxury Express tracking number and BIS Hallmark purity certificate.
   - **Wishlist & Account**: Saved favorites, order history, and saved addresses.

3. **AI Layer**
   - **Priya — AI Styling Chatbot**: Floating 56px bottom-right widget with auto-detect Hindi/English/Hinglish jewelry stylist guidance.
   - **Smart Search Modal**: Debounced instant semantic suggestions matching karat, occasion, and budget.
   - **Admin AI Copy Generator**: Auto-generates editorial descriptions and SEO tags for new creations.

4. **Backend API Server (`/server`)**
   - **Endpoints**: `/api/v1/auth`, `/api/v1/products`, `/api/v1/categories`, `/api/v1/orders`, `/api/v1/payments`, `/api/v1/ai`.
   - **Resilience**: Full MongoDB Atlas support + automatic seamless in-memory fallback for instant zero-config local development.

---

## ✦ Quick Start

### 1. Install & Run Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/v1/health
```

### 2. Install & Run Frontend Client
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 3. Demo Credentials
- **Admin Portal**: `admin@bljewels.com` / `AdminPassword123!` (Route: `/admin`)
- **Customer Account**: `ananya@example.com` / `Customer123!`
- **Coupons**: `SHUBH10` (10% off), `WELCOME5` (5% off)

