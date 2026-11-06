import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppRoutes } from './router';
import { ScrollToTop } from './components/common/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}
