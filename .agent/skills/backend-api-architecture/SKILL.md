---
name: backend-api-architecture
description: Scalable Express.js REST API architecture for fine jewelry. Covers modular routing, CORS multi-origin handling (storefront 5173 + admin 5174), controller validation, error boundary middleware, and dual-mode storage (MongoDB Atlas + Memory fallback).
---

# Resilient Backend API Architecture

This skill governs the server infrastructure, routing protocols, and resilience mechanisms powering the BL Jewels backend on port `5000`.

## 1. Core Principles
- **Runtime**: Node.js 20+ with ES Modules (`import/export`).
- **Framework**: Express.js 4.x.
- **Dual-Storage Resilience**:
  - Primary: MongoDB Atlas via Mongoose 8.
  - Automatic Fallback: High-fidelity in-memory store (`memoryStore.js`) pre-seeded with 22K certified jewelry, festive banners, and promo coupons when no MongoDB URI is connected.

## 2. Multi-Origin CORS Configuration
Both the Customer Storefront and the Decoupled Admin Portal must communicate seamlessly:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
}));
```

## 3. Route Hierarchy (`/api/v1`)
- `/api/v1/auth`: Authentication, JWT issuance, admin role guard.
- `/api/v1/products`: Fine jewelry catalog, category filtering, search.
- `/api/v1/banners`: Homepage hero carousel CMS CRUD.
- `/api/v1/orders`: Insured order dispatches, status pipelines.
- `/api/v1/coupons`: Festive promo code validation and discount calculations.
- `/api/v1/ai`: Smart search autocomplete, AI Karigar product copy generator, Priya styling chatbot.
- `/api/v1/health`: Server uptime, system timestamp, brand heartbeat.

