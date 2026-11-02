import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LiveRatesMarquee } from '../components/layout/LiveRatesMarquee';
import { USPStrip } from '../components/home/USPStrip';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { BestSellers } from '../components/home/BestSellers';
import { NewArrivals } from '../components/home/NewArrivals';
import { BrandStory } from '../components/home/BrandStory';
import { Testimonials } from '../components/home/Testimonials';
import { BrandAmbassadorSpotlight } from '../components/home/BrandAmbassadorSpotlight';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Concurrent instant data fetching across all 8 core jewelry domain endpoints
    const fetchAllHomeDataConcurrently = async () => {
      try {
        const [
          catsRes,
          occRes,
          featRes,
          newRes,
          bannersRes,
          ratesRes,
          reviewsRes,
          settingsRes,
        ] = await Promise.allSettled([
          categoryService.getCategories(),
          occasionService.getOccasions(),
          productService.getFeatured(),
          productService.getNewArrivals(),
          bannerService.getBanners(),
          rateService.getLiveRates(),
          reviewService.getFeaturedReviews(),
          settingService.getSettings(),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value?.categories) {
          setCategories(catsRes.value.categories);
        }
        if (occRes.status === 'fulfilled' && occRes.value?.occasions) {
          setOccasions(occRes.value.occasions);
        }
        if (featRes.status === 'fulfilled' && featRes.value?.products) {
          setBestSellers(featRes.value.products);
        }
        if (newRes.status === 'fulfilled' && newRes.value?.products) {
          setNewArrivals(newRes.value.products);
        }
        if (bannersRes.status === 'fulfilled' && bannersRes.value?.banners) {
          setBanners(bannersRes.value.banners);
        }
        if (ratesRes.status === 'fulfilled' && ratesRes.value?.success) {
          setLiveRates(ratesRes.value);
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.reviews) {
          setTestimonials(reviewsRes.value.reviews);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) {
          setSiteSettings(settingsRes.value.settings);
        }
      } catch (err) {
        console.error('Concurrent home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHomeDataConcurrently();
  }, []);

  return (
    <main>
      {/* 1. Dynamic Hero Showcase Banners (Managed from Executive Admin CMS) */}
      <HeroSection initialBanners={banners} />

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

      {/* 7. The Royal Bridal Heritage Spotlight */}
      <BrandAmbassadorSpotlight />

      {/* 8. The BL Jewels Royal Promises & Itemized "Bill Yourself" Price Calculator */}
      <RoyalPromisesSection />

      {/* 9. Dynamic Patron Reflection Reviews (Testimonials at the End) */}
      <Testimonials initialReviews={testimonials} />

      {/* 10. Auspicious VIP Newsletter */}
      <NewsletterSection />
    </main>
  );
};
