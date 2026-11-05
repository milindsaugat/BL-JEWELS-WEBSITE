import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LiveRatesMarquee } from '../components/layout/LiveRatesMarquee';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { BestSellers } from '../components/home/BestSellers';
import { NewArrivals } from '../components/home/NewArrivals';
import { BrandStory } from '../components/home/BrandStory';
import { Testimonials } from '../components/home/Testimonials';
import { RoyalPromisesSection } from '../components/home/RoyalPromisesSection';
import { NewsletterSection } from '../components/home/NewsletterSection';
import {
  productService,
  categoryService,
  occasionService,
  bannerService,
  rateService,
  reviewService,
  settingService,
} from '../services/api';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [liveRates, setLiveRates] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // Render each section as soon as its own request completes.
    const load = (request, key, setter) => request.then((data) => {
      if (active) setter(key ? (data?.[key] ?? []) : data);
    }).catch(() => {});

    load(bannerService.getBanners(), 'banners', setBanners)
      .finally(() => { if (active) setBannersLoading(false); });
    load(categoryService.getCategories(), 'categories', setCategories);
    load(occasionService.getOccasions(), 'occasions', setOccasions);
    load(productService.getFeatured(), 'products', setBestSellers);
    load(productService.getNewArrivals(), 'products', setNewArrivals);
    load(rateService.getLiveRates(), null, setLiveRates);
    load(reviewService.getFeaturedReviews(), 'reviews', setTestimonials);
    load(settingService.getSettings(), 'settings', setSiteSettings);
    return () => { active = false; };
  }, []);

  return (
    <main>
      {/* 1. Dynamic Hero Showcase Banners (Managed from Executive Admin CMS) */}
      {bannersLoading ? (
        <div role="status" aria-label="Loading banners">
          <LoadingSkeleton className="w-full aspect-[2.1/1] min-h-[195px] sm:aspect-[2.6/1] md:aspect-[3/1] max-h-[640px]" />
        </div>
      ) : <HeroSection initialBanners={banners} />}

      {/* 2. Dynamic Live Bullion Rates Dual Marquee (Direct from Backend Rate Service) */}
      <LiveRatesMarquee initialRates={liveRates} />

      {/* 4 Point USP Strip (BIS 916, Diamonds, Insured Delivery, Buyback) - Hidden per request */}
      {/* <USPStrip /> */}

      {/* 3. Dynamic Categories Grid & Occasion Companions */}
      <FeaturedCollections categories={categories} initialOccasions={occasions} />

      {/* 4. Dynamic Bestselling Royal Creations */}
      <BestSellers products={bestSellers} />

      {/* 5. Dynamic Brand Story & Legacy Philosophy */}
      <BrandStory storyData={siteSettings?.brandStory} />

      {/* 6. Dynamic New Arrivals */}
      <NewArrivals products={newArrivals} />

      {/* 7. The BL Jewels Royal Promises & Itemized "Bill Yourself" Price Calculator */}
      <RoyalPromisesSection />

      {/* 9. Dynamic Patron Reflection Reviews (Testimonials at the End) */}
      <Testimonials initialReviews={testimonials} />

      {/* 10. Auspicious VIP Newsletter */}
      <NewsletterSection />
    </main>
  );
};
