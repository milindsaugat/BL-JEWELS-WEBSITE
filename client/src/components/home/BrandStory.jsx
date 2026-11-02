import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Sparkles, ArrowRight } from 'lucide-react';

export const BrandStory = ({ storyData = null }) => {
  const eyebrow = storyData?.eyebrow || 'Our Heritage & Philosophy';
  const legacyYears = storyData?.legacyYears || '40+ YEARS LEGACY';
  const legacySubtitle = storyData?.legacySubtitle || 'Serving Indian royal families & connoisseurs since 1984';
  const image = storyData?.image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85';
  const p1 = storyData?.paragraph1 || 'Founded in the historic jewelry quarter of Zaveri Bazaar, Mumbai, BL Jewels was born from a singular sacred vow: Purity with Auspiciousness. We believe that fine jewelry is not merely an ornament — it is a blessing, a family heirloom, and a sacred celebration of love.';
  const p2 = storyData?.paragraph2 || 'Every polki choker, auspicious mangalsutra, and solitaire ring is shaped by master karigars whose lineages have sculpted jewelry for generations. With 100% government BIS 916 hallmarking and transparent karat certifications, we guarantee that the beauty you wear today retains its auspicious value for generations to come.';

  return (
    <section className="py-24 bg-white border-y border-stone-200/80 relative overflow-hidden">
      <div className="container-bl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Editorial Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={image}
                alt="BL Jewels Heritage Artisan Craftsmanship"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            
            {/* Floating Trust Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white p-5 rounded-2xl shadow-premium border border-gold-300 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-crimson-700 text-gold-300 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-accent text-xs font-bold text-charcoal tracking-wider">
                    {legacyYears}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-body">
                    {legacySubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Brand Story Copy */}
          <div className="lg:col-span-7 space-y-6 lg:pl-6">
            <span className="font-accent text-xs font-semibold text-gold-800 tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal sm:font-medium text-crimson-900 leading-tight">
              Where Auspicious Gold Meets <span className="italic font-normal text-gold-700">Artisanal Royalty</span>
            </h2>

            <p className="font-body text-base text-stone-600 leading-relaxed">
              {p1}
            </p>

            <p className="font-body text-sm text-stone-600 leading-relaxed">
              {p2}
            </p>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/about"
                className="px-6 py-3 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold tracking-wider font-body shadow-crimson transition-all inline-flex items-center gap-2"
              >
                <span>Read Full Brand Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

