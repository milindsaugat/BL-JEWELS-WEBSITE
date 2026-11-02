import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Crown, PhoneCall, Gem } from 'lucide-react';

export const BrandAmbassadorSpotlight = () => {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-[#FCFAF7] relative overflow-hidden border-b border-stone-200/80">
      
      {/* ── Background: Luminous Ambient Glow & Subtle Lattice ── */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[400px] h-[400px] bg-amber-100/25 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Filigree Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#8B1A1A 1.5px, transparent 1.5px), radial-gradient(#C9A44A 1.5px, #FCFAF7 1.5px)`,
          backgroundSize: `48px 48px`,
          backgroundPosition: `0 0, 24px 24px`,
        }}
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── THE SINGLE UNIFIED CONTAINER (DIVIDED INTO 2 SECTIONS: 50% TEXT + 50% IMAGE) ── */}
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#C9A44A]/60 shadow-[0_20px_50px_rgba(201,164,74,0.18)] bg-white grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[580px] lg:min-h-[640px]">
          
          {/* ── SECTION 1 (LEFT 50%): ROYAL HERITAGE STORY & CRAFTSMANSHIP ── */}
          <div className="p-8 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between space-y-6 sm:space-y-7 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFEB] relative">
            
            {/* Subtle Royal Filigree Corner Accents inside Section 1 */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#C9A44A]/40 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#C9A44A]/40 pointer-events-none" />

            {/* Top Header Group */}
            <div className="space-y-4">
              {/* Signature Block (Cursive Signature + Atelier Subhead) */}
              <div className="space-y-1">
                <span 
                  className="ambassador-signature text-4xl sm:text-5xl lg:text-[50px] xl:text-[56px] text-[#7A1D28] block tracking-wide select-none drop-shadow-xs leading-tight"
                  style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Allura', cursive" }}
                >
                  The Royal Bridal Heritage
                </span>
                <span className="font-body text-xs sm:text-sm text-stone-600 tracking-wider block font-medium pl-1">
                  by BL Jewels • Fine Jewellery Atelier
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1.5">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-semibold text-[#5B101D] tracking-tight leading-tight">
                  Auspicious Heirlooms Sculpted for
                </h2>
                <span className="font-display text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B68936] via-[#D4AF37] to-[#8F6A24] tracking-tight block">
                  Generations of Royal Brides
                </span>
              </div>

              {/* Editorial Story */}
              <p className="font-body text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-xl">
                Embodying timeless Rajputana majesty, certified 22K (916) purity, and master nakshi craftsmanship. Handcrafted with syndicate uncut polki diamonds and sacred temple motifs to celebrate life's most auspicious milestones with eternal magnificence.
              </p>
            </div>

            {/* Middle Group: 3 Luxury Trust Indicators */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-stone-200/90 shadow-2xs text-stone-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% BIS 916 & HUID Certified</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-stone-200/90 shadow-2xs text-stone-800 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>7th-Gen Master Karigar Artistry</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 border border-stone-200/90 shadow-2xs text-stone-800 text-xs font-semibold">
                <Gem className="w-3.5 h-3.5 text-[#8B1A1A] shrink-0" />
                <span>Syndicate Uncut Polki Diamonds</span>
              </div>
            </div>

            {/* Bottom Group: Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to="/collections?occasion=bridal"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#7A1D28] to-[#5B101D] hover:from-[#5B101D] hover:to-[#400B14] text-white rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <span>Explore Bridal Vault</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-[#B68936] rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-2xs flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#B68936]" />
                <span>Book Atelier Consultation</span>
              </Link>
            </div>

          </div>

          {/* ── SECTION 2 (RIGHT 50%): IMAGE COVER (SEAMLESSLY JOINED IN SAME CONTAINER) ── */}
          <div className="relative w-full h-[460px] sm:h-[520px] lg:h-full min-h-[480px] lg:min-h-full bg-[#120407] group overflow-hidden">
            
            {/* Royal Bridal Portrait completely covering the right section */}
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85"
              alt="The Royal Bridal Heritage by BL Jewels"
              className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
            />

            {/* Vertical subtle gold separator line between Section 1 and Section 2 on desktop */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#C9A44A]/60 to-transparent pointer-events-none z-10" />

            {/* Ambient Luxury Dark Gold Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120407]/90 via-[#120407]/15 to-transparent pointer-events-none" />

            {/* Corner Filigree on Image side */}
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#E6C875] pointer-events-none opacity-80" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#E6C875] pointer-events-none opacity-80" />

            {/* Floating Badge at Bottom */}
            <div className="absolute bottom-7 left-6 sm:left-8 right-6 sm:right-8 flex items-center justify-between pointer-events-none z-10">
              <div className="px-4 sm:px-5 py-2.5 rounded-full bg-[#120407]/85 backdrop-blur-md border border-[#C9A44A]/70 shadow-2xl flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6C875]" />
                <span className="font-display text-[11px] sm:text-xs font-semibold text-[#F3E5AB] tracking-widest uppercase">
                  ROYAL BRIDAL HEIRLOOMS • 22K (916)
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#E6C875]" />
                <span>Master Karigar Artistry</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
