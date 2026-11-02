import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Truck, RefreshCw, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { BRAND } from '../../lib/constants';

export const Footer = () => {
  return (
    <footer className="bg-[#1C1410] text-[#FAF7F2] pt-16 pb-8 border-t-2 border-[#C9A44A]/40">
      <div className="container-bl">
        
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-accent text-xs font-bold tracking-wider text-gold-300">BIS 916 HALLMARK</h4>
              <p className="text-xs text-stone-400 font-body">100% Certified Gold Purity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-accent text-xs font-bold tracking-wider text-gold-300">LIFETIME BUYBACK</h4>
              <p className="text-xs text-stone-400 font-body">Guaranteed Gold Valuation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-accent text-xs font-bold tracking-wider text-gold-300">INSURED DELIVERY</h4>
              <p className="text-xs text-stone-400 font-body">Blue Dart Luxury Express</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-accent text-xs font-bold tracking-wider text-gold-300">15-DAY RETURNS</h4>
              <p className="text-xs text-stone-400 font-body">No-Questions-Asked Policy</p>
            </div>
          </div>
        </div>

        {/* Main Footer 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block bg-[#FAF7F2] px-3.5 py-1.5 rounded-2xl border border-gold-400/50 shadow-gold-sm hover:scale-[1.02] transition-transform">
              <img
                src="/images/bl-jewels-logo.png"
                alt="BL Jewels — Purity with Auspiciousness"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="font-display italic text-base text-gold-200">
              "Purity with Auspiciousness"
            </p>
            <p className="text-xs text-stone-400 leading-relaxed font-body">
              Crafting generational fine jewelry since 1984. Every necklace, ring, and bangle is hallmarked with BIS 916 authenticity, celebrating India’s rich regal heritage and auspicious moments.
            </p>
            <div className="pt-2 text-xs text-stone-300 space-y-1.5 font-body">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Zaveri Bazaar, Mumbai, Maharashtra</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="font-accent text-xs font-bold text-gold-400 tracking-wider uppercase mb-4">
              Fine Collections
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-300 font-body">
              <li><Link to="/collections/rings" className="hover:text-gold-300 transition-colors">Solitaire & Gold Rings</Link></li>
              <li><Link to="/collections/necklaces" className="hover:text-gold-300 transition-colors">Royal Kundan & Polki Chokers</Link></li>
              <li><Link to="/collections/earrings" className="hover:text-gold-300 transition-colors">Temple Jhumkas & Chandbalis</Link></li>
              <li><Link to="/collections/bangles-bracelets" className="hover:text-gold-300 transition-colors">Rajwadi Kadas & Tennis Bracelets</Link></li>
              <li><Link to="/collections/mangalsutra" className="hover:text-gold-300 transition-colors">Sacred Swarna Mangalsutras</Link></li>
              <li><Link to="/collections/bridal-heritage" className="hover:text-gold-300 transition-colors">Bridal Wedding Trousseau</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-accent text-xs font-bold text-gold-400 tracking-wider uppercase mb-4">
              Purity & Care
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-300 font-body">
              <li><Link to="/about" className="hover:text-gold-300 transition-colors">The BL Jewels Legacy</Link></li>
              <li><Link to="/about" className="hover:text-gold-300 transition-colors">BIS Hallmark Verification Guide</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 transition-colors">Book Boutique VIP Appointment</Link></li>
              <li><Link to="/account/orders" className="hover:text-gold-300 transition-colors">Track Express Shipment</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 transition-colors">Jewelry Care & Cleaning</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 transition-colors">Bespoke Bridal Consultations</Link></li>
            </ul>
          </div>

          {/* Auspicious Newsletter */}
          <div className="space-y-4">
            <h3 className="font-accent text-xs font-bold text-gold-400 tracking-wider uppercase">
              Join the Auspicious Circle
            </h3>
            <p className="text-xs text-stone-400 font-body leading-relaxed">
              Subscribe to receive exclusive access to new royal collections, festive gold offers, and private salon viewings.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Welcome to BL Jewels Auspicious Circle!'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full px-3.5 py-2.5 bg-white/5 border border-gold-400/40 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold-300 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 text-white rounded-lg text-xs font-medium font-body transition-all shadow-crimson flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                <span>Subscribe for VIP Privileges</span>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4 font-body">
          <p>© {new Date().getFullYear()} BL Jewels Pvt. Ltd. All rights reserved. Registered BIS Hallmark Jeweler.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/about" className="hover:text-stone-300">Privacy Policy</Link>
            <Link to="/about" className="hover:text-stone-300">Terms of Service</Link>
            <Link to="/about" className="hover:text-stone-300">Hallmark Certifications</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

