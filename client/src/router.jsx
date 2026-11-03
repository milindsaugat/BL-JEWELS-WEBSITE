import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { CustomerLayout } from './layouts/CustomerLayout';
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));

// Customer Pages
import { Home } from './pages/Home';
const Collection = lazy(() => import('./pages/Collection').then(module => ({ default: module.Collection })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(module => ({ default: module.OrderSuccess })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(module => ({ default: module.AccountPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(module => ({ default: module.WishlistPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const LiveRatePage = lazy(() => import('./pages/LiveRatePage').then(module => ({ default: module.LiveRatePage })));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners').then(module => ({ default: module.AdminBanners })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(module => ({ default: module.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(module => ({ default: module.AdminOrders })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then(module => ({ default: module.AdminCoupons })));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div role="status" className="min-h-[40vh] flex items-center justify-center text-stone-500">Loading?</div>}>
    <Routes>
      {/* ── CUSTOMER STOREFRONT (with Customer Navbar, Announcement Bar, Footer, Priya Chatbot) ── */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collection />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success/:id" element={<OrderSuccess />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders" element={<AccountPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/live-rate" element={<LiveRatePage />} />
      </Route>

      {/* ── ADMIN LOGIN (Standalone Login Portal) ── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── SEPARATE ADMIN PORTAL (with dedicated Sidebar, Topbar, No customer elements) ── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="coupons" element={<AdminCoupons />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};
