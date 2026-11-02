---
name: dual-bullion-marquee-engine
description: High-performance bidirectional marquee animation engine for live gold and silver spot rates. Features Left-to-Right gold motion, Right-to-Left silver motion, interactive pause-on-hover, seamless infinite loops, and hardware acceleration.
---

# Dual Bullion Live Rates Marquee Engine

This skill dictates the engineering and implementation of the bidirectional live bullion rate tickers in BL Jewels.

## 1. Architectural Requirements
- **Gold Track (Track 1)**:
  - Direction: **Left to Right** (`0% -> -50%` or `-50% -> 0%`).
  - Color Theme: Deep Royal Maroon backdrop (`#2A0606`) with pure 22K Gold text highlights (`#F3E5AB`, `#C9A44A`).
  - Content: 24K Pure Gold, 22K (916) Hallmark Gold, 18K Diamond Jewelry Gold, Sovereign Coins, Mumbai/Delhi/Jaipur/Chennai bullion spot prices.
- **Silver Track (Track 2)**:
  - Direction: **Right to Left** (`0% -> -50%`).
  - Color Theme: Deep Ebony base (`#160A0A`) with Sterling Silver foil highlights (`#E2E8F0`, `#CBD5E1`).
  - Content: 999 Fine Pure Silver/g, 1 Kg Silver Bar, 925 Sterling Silver, Festive Coins, Insured Free Delivery badge.

## 2. Hardware-Accelerated CSS Engine
```css
@keyframes marquee-rtl {
  0%   { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

@keyframes marquee-ltr {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0%); }
}

.animate-marquee-rtl {
  display: flex;
  width: max-content;
  animation: marquee-rtl 42s linear infinite;
  will-change: transform;
}

.animate-marquee-ltr {
  display: flex;
  width: max-content;
  animation: marquee-ltr 42s linear infinite;
  will-change: transform;
}

/* Pause on user hover */
.marquee-container:hover .animate-marquee-rtl,
.marquee-container:hover .animate-marquee-ltr {
  animation-play-state: paused;
}
```

## 3. Seamless Infinite Looping Standard
- Every marquee track must render two identical sets of bullion items side-by-side (`[...items, ...items]`).
- The keyframe animation transforms precisely by `-50%`, ensuring zero stutter, zero gaps, and 60fps buttery smooth scrolling on mobile, desktop, and 4K displays.

