---
name: executive-admin-cms
description: Decoupled executive administration architecture on dedicated port 5174. Covers Hero Banner CMS, 22K (916) Catalog publishing with AI Karigar assistant, Blue Dart Armored Dispatch management, and Auspicious Promo coupon engine.
---

# Executive Admin CMS & Store Operations

This skill dictates the design, architecture, and workflow of the isolated BL Jewels Admin Portal (`admin/`).

## 1. Complete Architectural Isolation
- **Dedicated Port**: Runs strictly on `http://localhost:5174`.
- **Decoupled Project**: Own `package.json`, isolated Vite config, dedicated Tailwind config, and zero customer storefront dependencies.
- **Enterprise Typography**: Strictly **Inter** (for UI controls, buttons, headers) and **DM Sans** (for tables and data).

## 2. Core Management Modules
1. **Executive Dashboard (`/`)**:
   - Live revenue statistics, order fulfillment KPI cards, and hero banner health status.
2. **Hero Banners & CMS (`/banners`)**:
   - Homepage carousel manager: add, edit, toggle active/inactive, change priority order, update images, dual CTAs, and BIS 916 badge copy.
3. **Jewelry Catalog Manager (`/products`)**:
   - Manage 22K/18K pieces, uncut polki sets, solitaire diamond rings.
   - Integrated **AI Karigar Assistant**: 1-click generation of regal romantic descriptions honoring ancient nakshi and temple traditions.
4. **Orders & Armored Dispatches (`/orders`)**:
   - Blue Dart Armored tracking, status pipelines: `Pending Hallmark Check` → `Confirmed` → `Velvet Packaging` → `Dispatched` → `Delivered`.
5. **Coupons & Auspicious Incentives (`/coupons`)**:
   - Create percentage/flat promo codes (`SHUBH10`, `WELCOME5`), set minimum cart thresholds, and max discount caps.

