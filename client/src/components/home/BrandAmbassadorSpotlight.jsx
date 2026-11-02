import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Crown, PhoneCall, Gem } from 'lucide-react';

export const BrandAmbassadorSpotlight = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FCFAF7] relative overflow-hidden border-b border-stone-200/80">
      
      {/* ── Background: Luminous Ambient Glow & Subtle Lattice ── */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[500px] bg-gradient-to-tr from-rose-200/25 via-gold-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[450px] h-[450px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Filigree Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#8B1A1A 1.5px, transparent 1.5px), radial-gradient(#C9A44A 1.5px, #FCFAF7 1.5px)`,
          backgroundSize: `48px 48px`,
          backgroundPosition: `0 0, 24px 24px`,
        }}
      />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
          
          {/* ── Left Half (50%): Royal Heritage Story & Craftsmanship ── */}
          <div className="space-y-6 sm:space-y-7 text-center lg:text-left">
            
            {/* Signature Block (Fluid cursive signature + BL Jewels Atelier) */}
            <div className="space-y-1.5">
              <span 
                className="ambassador-signature text-5xl sm:text-6xl lg:text-[68px] xl:text-[76px] text-[#7A1D28] block tracking-wide select-none drop-shadow-sm leading-tight"
                style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Allura', cursive" }}
              >
                The Royal Bridal Heritage
              </span>
              <span className="font-body text-base sm:text-lg text-stone-600 tracking-wider block font-medium pl-1">
                by BL Jewels • Fine Jewellery Atelier
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1.5">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-semibold text-[#5B101D] tracking-tight leading-tight sm:leading-[1.15]">
                Auspicious Heirlooms Sculpted for
              </h2>
              <span className="font-display text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B68936] via-[#D4AF37] to-[#8F6A24] tracking-tight block">
                Generations of Royal Brides
              </span>
            </div>

            {/* Editorial Story */}
            <p className="font-body text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Embodying timeless Rajputana majesty, certified 22K (916) purity, and master nakshi craftsmanship. Handcrafted with syndicate uncut polki diamonds and sacred temple motifs to celebrate life's most auspicious milestones with eternal magnificence.
            </p>

            {/* Luxury Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs text-stone-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% BIS 916 & HUID Certified</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs text-stone-800 text-xs font-semibold">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>7th-Gen Master Karigar Artistry</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs text-stone-800 text-xs font-semibold">
                <Gem className="w-4 h-4 text-[#8B1A1A]" />
                <span>Syndicate Uncut Polki Diamonds</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                to="/collections?occasion=bridal"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#7A1D28] to-[#5B101D] hover:from-[#5B101D] hover:to-[#400B14] text-white rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2.5 group"
              >
                <span>Explore Bridal Vault</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-[#B68936] rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2.5"
              >
                <PhoneCall className="w-4 h-4 text-[#B68936]" />
                <span>Book Atelier Consultation</span>
              </Link>
            </div>

          </div>

          {/* ── Right Half (50%): Grand Image Cover (Full Height & Width Coverage) ── */}
          <div className="w-full">
            <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] xl:h-[660px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A44A]/60 group bg-[#120407]">
              
              {/* Opulent Royal Indian Bridal Portrait covering the entire half */}
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85"
                alt="The Royal Bridal Heritage by BL Jewels"
                className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />

              {/* Ambient Luxury Dark Gold Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#120407]/90 via-[#120407]/20 to-transparent pointer-events-none" />
              
              {/* Delicate Gold Inner Border Frame */}
              <div className="absolute inset-3 sm:inset-4 border border-[#C9A44A]/40 rounded-xl sm:rounded-2xl pointer-events-none" />

              {/* Four Corner Gold Filigree Accents */}
              <div className="absolute top-6 left-6 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-l-2 border-[#E6C875] pointer-events-none opacity-85" />
              <div className="absolute top-6 right-6 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-r-2 border-[#E6C875] pointer-events-none opacity-85" />
              <div className="absolute bottom-6 left-6 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-l-2 border-[#E6C875] pointer-events-none opacity-85" />
              <div className="absolute bottom-6 right-6 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-r-2 border-[#E6C875] pointer-events-none opacity-85" />

              {/* Royal Bridal Floating Badge at Bottom */}
              <div className="absolute bottom-8 left-6 sm:left-8 right-6 sm:right-8 flex items-center justify-between pointer-events-none z-10">
                <div className="px-5 py-2.5 rounded-full bg-[#120407]/85 backdrop-blur-md border border-[#C9A44A]/70 shadow-2xl flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#E6C875]" />
                  <span className="font-display text-xs sm:text-sm font-semibold text-[#F3E5AB] tracking-widest uppercase">
                    ROYAL BRIDAL HEIRLOOMS • 22K (916)
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#E6C875]" />
                  <span>Master Karigar Artistry</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
