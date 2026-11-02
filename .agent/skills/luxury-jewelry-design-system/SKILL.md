---
name: luxury-jewelry-design-system
description: Design tokens, typography pairing (Bodoni Moda + DM Sans), luxury color palettes (Deep Crimson #8B1A1A, Pure Gold #C9A44A, Warm Pearl #FAF7F2), glassmorphism, and visual hierarchy for fine jewelry e-commerce.
---

# Luxury Jewelry Design System & Typography Engine

This skill governs the visual language, design tokens, typography rules, and aesthetic standards for the BL Jewels luxury fine jewelry platform.

## 1. Brand Philosophy: "Purity with Auspiciousness"
Fine jewelry in India is not merely an accessory; it is sacred wealth, an auspicious heirloom, and emotional treasure passed across generations. The visual system must balance:
- **Imperial Splendor**: High-contrast serifs, subtle gold shimmer, deep royal red accents.
- **Modern Clarity**: Generous negative space, razor-sharp typography, zero clutter, effortless navigation.

## 2. Color Palette & Design Tokens
```css
:root {
  /* Brand Dominants */
  --crimson-900: #5C0A0A; /* Royal Maroon */
  --crimson-800: #7A0F0F; /* Auspicious Vermilion */
  --crimson-700: #8B1A1A; /* Primary Brand Crimson */
  
  /* Bullion Golds */
  --gold-500: #C9A44A;    /* Primary Auspicious 22K Gold */
  --gold-400: #D4B05A;    /* Polished Gold Highlight */
  --gold-300: #E0C478;    /* Pale Gold Accent */
  --gold-200: #EDD98A;    /* Shimmer Gold */
  
  /* Canvas & Backgrounds */
  --pearl: #FAF7F2;       /* Warm Pearl Linen Canvas */
  --ivory: #F5F0E8;       /* Subtle Card Tint */
  --charcoal: #1C1410;    /* Ebony Deep Base */
}
```

## 3. Typography Rules
- **Headings & Hero (`font-display`, `font-heading`)**: **Bodoni Moda**
  - High-fashion, razor-sharp vertical contrast serif.
  - Used for Hero banner main titles, Section Headings, Product Title headings, and Modal titles.
  - Letter spacing: `-0.01em` to `-0.02em`.
- **Menu, Body & Prices (`font-body`, `font-sans`)**: **DM Sans**
  - Modern geometric humanist sans-serif.
  - Used for Category navigation bar, Announcement tickers, Product descriptions, Specification tables, and Rupee pricing (`₹3,42,000`).
  - Letter spacing: `0.02em` for body, `0.08em` for uppercase labels.
- **Admin Portal UI**: **Inter** for all headings/UI controls and **DM Sans** for data tables.

## 4. UI Elements & Component Standards
- **Buttons**:
  - Primary CTA: Crimson background with gold micro-border (`border border-gold-400/40 shadow-crimson`).
  - Secondary CTA: Frosted black/glass with gold outline (`border border-gold-400/60`).
- **Cards**:
  - `bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-gold transition-all duration-300`.
- **Hallmark Badges**:
  - Certified BIS 916 shield with gold foil metallic ring.

