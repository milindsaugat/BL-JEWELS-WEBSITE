import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const ArticleCTA = () => (
  <section aria-label="Explore BL Jewels Collections" className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-12">
    <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#940303] to-[#700202] border border-[#D4AF66]/55 px-6 py-7 sm:px-10 sm:py-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Subtle decorative gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,102,0.22)_0%,transparent_70%)]"
      />

      <div className="relative z-10 space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 font-accent text-[11.5px] uppercase tracking-[0.2em] text-[#E8C98A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
          <span>100% Certified BIS 916 Hallmark</span>
        </div>
        <h2 className="font-display text-[24px] sm:text-[30px] font-medium leading-snug text-white">
          Experience Handcrafted Royal Heirloom Jewellery
        </h2>
        <p className="text-[14px] sm:text-[15px] text-white/85 leading-relaxed font-body">
          Explore 22K gold necklaces, uncut Polki Jadau chokers, and certified solitaires with complimentary insured delivery.
        </p>
      </div>

      <Link
        to="/collections"
        className="relative z-10 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#D4AF66] hover:bg-[#E8C98A] text-[#292321] font-accent font-semibold text-[12px] uppercase tracking-[0.14em] transition-all duration-200 hover:-translate-y-0.5 shrink-0 group"
      >
        <span>Explore Collections</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  </section>
);

export default ArticleCTA;

