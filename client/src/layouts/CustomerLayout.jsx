import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { AISearchBar } from '../components/ai/AISearchBar';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { LiveRateModal } from '../components/common/LiveRateModal';
import { AuthModal } from '../components/common/AuthModal';
import { GlobalSeoSync } from '../components/common/SeoHead';

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-charcoal font-body antialiased print:bg-white print:text-black">
      <div className="print:hidden">
        <GlobalSeoSync />
        {/* Top Announcement Ribbon */}
        <AnnouncementBar />

        {/* Header Navigation */}
        <Navbar />
      </div>

      {/* Main Page Content */}
      <main className="flex-1 print:m-0 print:p-0">
        <Outlet />
      </main>

      {/* Global Customer Overlays & Footer */}
      <div className="print:hidden">
        <CartDrawer />
        <AISearchBar />
        <QuickViewModal />
        <LiveRateModal />
        <AuthModal />
        <Footer />
      </div>
    </div>
  );
};
