import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBanners } from './pages/AdminBanners';
import { AdminCategories } from './pages/AdminCategories';
import { AdminOccasions } from './pages/AdminOccasions';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminUsers } from './pages/AdminUsers';
import { AdminCoupons } from './pages/AdminCoupons';
import { AdminReviews } from './pages/AdminReviews';
import { AdminGoldRates } from './pages/AdminGoldRates';
import { AdminAnnouncement } from './pages/AdminAnnouncement';
import { AdminSubscribers } from './pages/AdminSubscribers';
import { AdminBlogs } from './pages/AdminBlogs';
import AdminSupport from './pages/AdminSupport';
import { AdminPaymentAccounts } from './pages/AdminPaymentAccounts';
import { AdminSettings } from './pages/AdminSettings';
import { useAuthStore } from './store/authStore';

// Protected route wrapper
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AdminLogin />,
  },
  {
    path: '/',
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'banners',
        element: <AdminBanners />,
      },
      {
        path: 'categories',
        element: <AdminCategories />,
      },
      {
        path: 'occasions',
        element: <AdminOccasions />,
      },
      {
        path: 'products',
        element: <AdminProducts />,
      },
      {
        path: 'orders',
        element: <AdminOrders />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'coupons',
        element: <AdminCoupons />,
      },
      {
        path: 'testimonials',
        element: <AdminReviews />,
      },
      {
        path: 'gold-rates',
        element: <AdminGoldRates />,
      },
      {
        path: 'announcements',
        element: <AdminAnnouncement />,
      },
      {
        path: 'subscribers',
        element: <AdminSubscribers />,
      },
      {
        path: 'blogs',
        element: <AdminBlogs />,
      },
      {
        path: 'support',
        element: <AdminSupport />,
      },
      {
        path: 'payment-accounts',
        element: <AdminPaymentAccounts />,
      },
      {
        path: 'settings',
        element: <AdminSettings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

