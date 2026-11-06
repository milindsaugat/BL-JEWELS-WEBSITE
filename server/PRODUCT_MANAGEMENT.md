# Product management

Admin Products supports create/edit/delete, drafts/publish, featured/new flags, category, image uploads/URLs and cover selection, metal/stone details, care, tags, occasions, certifications and SEO. Variants have independent SKU, label, size, colour, karat, weight, regular/sale price and stock.

Combos are pre-packed sets: select component products, variant SKUs and quantities. Sellable combo variants hold the set price and set stock independently of component stock. This does not automatically assemble loose stock into sets.

Public reads exclude unpublished products. Recently viewed stores up to 24 product IDs per browser and account (guest history is separate), then fetches current public product data. Clearing history removes local IDs. It is not cross-device tracking.

Order creation verifies current prices and reserves stock in a MongoDB transaction. Use MongoDB Atlas or a replica set; standalone MongoDB does not support these transactions. A failed order rolls back stock writes. Cancellation restores reserved stock once. Returned merchandise is inspected and restocked by the administrator; a return request does not automatically restore stock or refund payment. Payment processing is not changed by this feature.

Live database checkout, uploads and payment delivery were not exercised during these changes. Unit tests use isolated model mocks; admin layout was checked in headless Chrome with mocked API responses at 390px and 1440px.

Tests:
- server: node --test test/productManagement.test.js test/customerAccount.test.js test/goldRateRoutes.test.js test/goldRateService.test.js
- client: node --test scripts/recent-products.test.mjs
- client/admin: npm run build
