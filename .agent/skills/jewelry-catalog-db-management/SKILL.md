---
name: jewelry-catalog-db-management
description: Database architecture and schemas for fine jewelry. Covers metal purity, diamond 4Cs (Cut, Clarity, Color, Carat), gram weight variants, BIS hallmarking records, inventory management, and coupon validation state.
---

# Fine Jewelry Database & Schema Management

This skill governs the MongoDB Mongoose schemas, document models, and in-memory data structures for the BL Jewels catalog.

## 1. Product Schema Attributes
A luxury fine jewelry document must capture specialized physical attributes:
```javascript
{
  name: String,            // "Maya Royal Kundan Choker Necklace"
  slug: String,            // "maya-royal-kundan-choker-necklace"
  categorySlug: String,    // "necklaces"
  metal: {
    type: String,          // 'gold' | 'diamond' | 'platinum' | 'silver'
    karat: String,         // '22K' | '18K' | '14K' | '24K'
    purity: String,        // '916' | '750' | '999'
    color: String,         // 'yellow' | 'rose' | 'white'
  },
  variants: [
    {
      label: String,       // "Standard · 42.5g"
      weight: Number,      // Gross weight in grams (e.g. 42.5)
      size: String,        // "Adjustable Dori Length"
      price: Number,       // ₹3,42,000
      discountPrice: Number, // ₹3,18,000
      stock: Number,       // Active inventory quantity
      sku: String,         // "BLJ-NK-001-STD"
      isDefault: Boolean,
    }
  ],
  stone: {
    type: String,          // "Syndicate Uncut Polki & Emeralds"
    carats: Number,        // Total stone weight
    quality: String,       // "VVS1 / Natural Zambian"
    color: String,         // "E-F Colorless"
  },
  certifications: [String], // ["100% BIS 916 Hallmark", "IGI Certified"]
  isFeatured: Boolean,
  isNewArrival: Boolean,
}
```

## 2. Order Schema & Armored Dispatch State
- **Status Enum**: `pending`, `confirmed`, `processing`, `dispatched`, `delivered`, `cancelled`.
- **Logistics**: Blue Dart Armored Security with tamper-proof seal serial numbers and transit insurance policy references.

