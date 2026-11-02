---
name: fine-jewelry-ecommerce-flow
description: End-to-end luxury e-commerce transactional pipeline. Covers slide-over cart drawer with live weight totals, address verification, festive coupon discount calculation, Razorpay UPI/Netbanking payment verification, and order confirmation.
---

# Fine Jewelry E-Commerce Transactional Engine

This skill dictates the shopping cart, checkout, payment processing, and order lifecycle for high-value fine jewelry purchases.

## 1. Cart Drawer UX (`CartDrawer.jsx`)
- Slide-over glassmorphism drawer triggered from any page.
- Displays individual item thumbnail, pure gold weight in grams, selected ring size / choker dori length, and unit pricing.
- Live subtotal, estimated GST (3%), and complimentary insured express shipping indicator.
- Festive promo code input with instant validation and discount deduction.

## 2. Multi-Step Checkout Pipeline (`CheckoutPage.jsx`)
1. **Shipping Address**: Pincode verification against Blue Dart Armored delivery network.
2. **Order Review**: Itemized bill with gold weight summary, hallmark certificates, and coupon savings.
3. **Payment**:
   - Razorpay React SDK integration: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cardless EMI for bridal trousseau purchases.
   - Fallback instant demo payment verification for development and client walkthroughs.

## 3. Post-Purchase Vault Confirmation (`OrderSuccess.jsx`)
- Generates official Order ID (e.g., `#BLJ-ORD-8821`).
- Provides Blue Dart tracking reference.
- Confirms BIS Hallmarking inspection certificate attachment.

