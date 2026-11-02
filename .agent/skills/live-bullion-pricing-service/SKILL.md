---
name: live-bullion-pricing-service
description: Bullion spot pricing algorithms, purity karats (24K, 22K 916, 18K 750, 14K), silver bullion (999 Fine, 925 Sterling), market movement deltas, and regional bullion hub spreads (Mumbai, Delhi, Jaipur, Chennai).
---

# Live Bullion Spot Pricing Engine

This skill provides mathematical formulas, karat purity relationships, and live rate feeds for gold and silver commodities.

## 1. Purity & Karat Mathematics
In Indian fine jewelry, price per gram is mathematically derived from 24K (999 pure gold) spot price:

$$\text{Price}(22\text{K}) = \text{Price}(24\text{K}) \times \frac{22}{24} = \text{Price}(24\text{K}) \times 0.9167$$
$$\text{Price}(18\text{K}) = \text{Price}(24\text{K}) \times \frac{18}{24} = \text{Price}(24\text{K}) \times 0.7500$$
$$\text{Price}(14\text{K}) = \text{Price}(24\text{K}) \times \frac{14}{24} = \text{Price}(24\text{K}) \times 0.5833$$

## 2. Product Pricing Breakdown Formula
For every jewelry item sold:
$$\text{Final Price} = (\text{Gross Weight in Grams} \times \text{Karat Gold Rate}) + \text{Making Charges (VA)} + \text{Stone/Gem Value} + \text{GST (3\%)}$$

- **Gold Rate**: Transparent daily spot price without hidden markups.
- **Making Charges (Value Addition)**: 8%–18% depending on complexity (hand-carved nakshi vs machine chain).
- **GST**: Statutory 3% on fine jewelry in India.

## 3. Regional Bullion Spreads
- **Mumbai (Zaveri Bazaar)**: Benchmark base spot.
- **Delhi (Chandni Chowk)**: Benchmark + ₹50/10g freight/logistics spread.
- **Jaipur (Johari Bazaar)**: Benchmark − ₹20/10g colored gemstone hub discount.
- **Chennai (T. Nagar)**: Benchmark + ₹120/10g high physical gold demand premium.

