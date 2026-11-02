import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { AISearchBar } from '../components/ai/AISearchBar';
import { PriyaChatbot } from '../components/ai/PriyaChatbot';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { LiveRateModal } from '../components/common/LiveRateModal';

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-charcoal font-body antialiased">
      {/* Top Announcement Ribbon */}
      <AnnouncementBar />

      {/* Header Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Customer Overlays */}
      <CartDrawer />
      <AISearchBar />
      <PriyaChatbot />
      <QuickViewModal />
      <LiveRateModal />

      {/* Luxury Customer Footer */}
      <Footer />
    </div>
  );
};
