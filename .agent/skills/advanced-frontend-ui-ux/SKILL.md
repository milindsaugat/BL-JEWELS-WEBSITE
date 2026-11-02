---
name: advanced-frontend-ui-ux
description: High-performance frontend engineering in React 18 and Vite. Component composition, responsive grid/flex engines, Lucide icons, glassmorphism, zero-layout-shift, and accessible interactive states.
---

# Advanced Frontend UI/UX Engineering

This skill provides architectural guidelines and component patterns for building high-conversion, responsive, and resilient user interfaces for luxury e-commerce.

## 1. Technical Foundation
- **Framework**: React 18 with Vite 5/8 (Fast HMR, ES Modules).
- **Styling**: Tailwind CSS v3.4 + CSS Modules/Variables for dynamic themes.
- **State Management**:
  - `cartStore.js`: Persistent localStorage cart with slide-over drawer state.
  - `authStore.js`: User authentication, JWT tokens, wishlist persistence.
  - `uiStore.js`: Global modals, AI search triggers, drawer controls.
- **Icons**: `lucide-react` (Tree-shakable, consistent 1.5px stroke).

## 2. Layout & Spacing Architecture
- **Full Max Width Principles**:
  - Luxury headers, announcement bars, and category strips must never artificially constrain navigation on standard desktop displays (1280px–1920px).
  - Use `w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10`.
- **Zero-Wrap Navigation**:
  - Enforce `whitespace-nowrap shrink-0` across category links and utility pills.
  - Never allow multi-line text breaking inside navbars or category ribbons.

## 3. Glassmorphism & Micro-Interactions
- Frosted Sticky Navbars:
  ```html
  <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#C9A44A]/30 shadow-gold-sm transition-all duration-300">
  ```
- Gold Hover Glow:
  ```html
  <div className="hover:border-gold-400 hover:shadow-gold transition-all duration-300 transform hover:-translate-y-0.5">
  ```
- Keyboard Accessibility:
  - Global `Cmd+K` / `Ctrl+K` listener to instantly trigger the AI search overlay.

