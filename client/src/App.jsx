import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppRoutes } from './router';
import { ScrollToTop } from './components/common/ScrollToTop';
import { useOfferStore } from './store/offerStore';

export default function App() {
  useEffect(() => {
    useOfferStore.getState().fetchActiveOffers();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}
