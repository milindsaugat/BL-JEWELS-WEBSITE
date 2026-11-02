import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Sparkles, Gem, Clock, HeartHandshake } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-16 bg-pearl min-h-screen">
      <div className="container-bl max-w-4xl mx-auto space-y-16">
        
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <span className="font-accent text-xs font-bold text-gold-700 tracking-[0.2em] uppercase">
            Founded 1984 • Zaveri Bazaar, Mumbai
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-crimson-900 leading-tight">
            Purity with Auspiciousness
          </h1>
          <div className="w-20 h-0.5 bg-gold-400 mx-auto mt-2" />
          <p className="font-display italic text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
            "We believe fine jewelry is not merely a precious metal. It is an auspicious blessing, an heirloom passed with tearful pride from mother to daughter."
          </p>
        </div>

        {/* Hero Image */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/9]">
          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=85"
            alt="BL Jewels Heritage Workshop"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Story Section */}
        <div className="space-y-6 font-body text-sm sm:text-base text-stone-700 leading-relaxed bg-white rounded-3xl p-8 sm:p-12 border border-border-light shadow-sm">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-crimson-900">
            Four Decades of Royal Goldsmith Heritage
          </h2>
          <p>
            Established in 1984 in the historic goldsmith alleys of Zaveri Bazaar, <strong>BL Jewels</strong> was founded with a solemn vow to elevate Indian jewelry standards. In an era where purity was often opaque, BL Jewels became an early pioneer of strict 22 Karat (916) certification, insisting that every single creation bear undeniable proof of gold fineness.
          </p>
          <p>
            Over the past four decades, our ateliers have crafted bridal trousseaus for over 50,000 royal ceremonies, family unions, and auspicious festival moments across India and worldwide.
          </p>
        </div>

        {/* The 4 Auspicious Pillars */}
        <div className="space-y-6">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-charcoal text-center">
            The BL Jewels Pillars of Promise
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-ivory rounded-2xl p-6 border border-gold-200 shadow-sm space-y-3">
              <ShieldCheck className="w-8 h-8 text-crimson-700" />
              <h4 className="font-accent text-sm font-bold text-charcoal uppercase tracking-wider">
                100% BIS 916 Hallmark
              </h4>
              <p className="text-xs text-stone-600 font-body leading-relaxed">
                Zero tolerance on karat dilution. Every gram of 22K or 18K gold is authenticated at government assay facilities with unique HUID codes.
              </p>
            </div>

            <div className="bg-ivory rounded-2xl p-6 border border-gold-200 shadow-sm space-y-3">
              <Gem className="w-8 h-8 text-crimson-700" />
              <h4 className="font-accent text-sm font-bold text-charcoal uppercase tracking-wider">
                Natural Syndicate Polki
              </h4>
              <p className="text-xs text-stone-600 font-body leading-relaxed">
                We select syndicate uncut diamonds and natural VVS/EF solitaires, foil-backed in 24K pure gold according to royal jadau craftsmanship.
              </p>
            </div>

            <div className="bg-ivory rounded-2xl p-6 border border-gold-200 shadow-sm space-y-3">
              <HeartHandshake className="w-8 h-8 text-crimson-700" />
              <h4 className="font-accent text-sm font-bold text-charcoal uppercase tracking-wider">
                Lifetime Buyback Assurance
              </h4>
              <p className="text-xs text-stone-600 font-body leading-relaxed">
                Your investment is secure for life. We offer 100% net gold weight buyback at prevailing market rates with complete transparency.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-crimson-900 to-crimson-800 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-pearl">
            Begin Your Auspicious Heirlooms
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-body max-w-lg mx-auto">
            Experience the warmth of our Zaveri Bazaar flagship boutique or discover our bridal trousseau collections online.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/collections"
              className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal rounded-xl text-xs font-semibold font-body tracking-wider"
            >
              Explore Collections
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

