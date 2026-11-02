---
name: security-performance-hardening
description: Performance optimization and enterprise security standards for luxury e-commerce. Covers font preloading, Core Web Vitals (LCP, INP, CLS), Helmet security headers, cookie authentication, and zero-layout-shift asset delivery.
---

# Security & Performance Hardening

This skill dictates production security and performance standards for both the BL Jewels Storefront and Executive Admin Suite.

## 1. Font Preloading & Zero-Layout-Shift (CLS)
- Google Fonts (`Bodoni Moda`, `DM Sans`, `Inter`) must load asynchronously with `font-display: swap`.
- Direct `@import` rules in CSS stylesheets provide deterministic rendering even if `<link>` requests are delayed or cached.
- High-priority LCP hero images must specify `fetchpriority="high"` on slide 0 to achieve LCP < 1.8s.

## 2. Security Headers & Protection
- **Helmet Middleware**: Cross-origin resource policies, XSS filtering, frameguard clickjacking protection.
- **JWT Protection**:
  - Access Token (15m expiry) stored securely in memory/Authorization header.
  - Refresh Token stored in `httpOnly` secure cookies.
- **Input Sanitization**: Defense against NoSQL query injection on MongoDB filters.

## 3. Production Build Validation
- Automated continuous build checks: `vite build` must compile with 0 errors and output minified, gzip-optimized chunks.

