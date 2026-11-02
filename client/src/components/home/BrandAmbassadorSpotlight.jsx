import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Crown, PhoneCall, Gem } from 'lucide-react';

export const BrandAmbassadorSpotlight = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FCFAF7] relative overflow-hidden border-b border-stone-200/80">
      
      {/* ── Background: Luminous Ambient Glow & Subtle Lattice ── */}
      <div className="absolute top-1/4 right-1/4 w-[650px] h-[550px] bg-gradient-to-tr from-rose-200/25 via-gold-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[450px] h-[450px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Filigree Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#8B1A1A 1.5px, transparent 1.5px), radial-gradient(#C9A44A 1.5px, #FCFAF7 1.5px)`,
          backgroundSize: `48px 48px`,
          backgroundPosition: `0 0, 24px 24px`,
        }}
      />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── Left Content (6 Cols): Royal Heritage Story & Craftsmanship ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-center lg:text-left">
            
            {/* Signature Block (Fluid cursive signature + BL Jewels Atelier) */}
            <div className="space-y-1">
              <span 
                className="ambassador-signature text-5xl sm:text-6xl lg:text-[70px] text-[#7A1D28] block tracking-wide select-none drop-shadow-sm leading-tight"
                style={{ fontFamily: "'Great Vibes', 'Alex Brush', 'Allura', cursive" }}
              >
                The Royal Bridal Heritage
              </span>
              <span className="font-body text-base sm:text-lg text-stone-600 tracking-wider block font-medium pl-1">
                by BL Jewels • Fine Jewellery Atelier
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#5B101D] tracking-tight leading-tight sm:leading-[1.15]">
                Auspicious Heirlooms Sculpted for
              </h2>
              <span className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#B68936] tracking-tight block">
                Generations of Royal Brides
              </span>
            </div>

            {/* Editorial Story */}
            <p className="font-body text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Embodying timeless Rajputana majesty, certified 22K (916) purity, and master nakshi craftsmanship. Handcrafted with syndicate uncut polki diamonds and sacred temple motifs to celebrate life's most auspicious milestones with eternal magnificence.
            </p>

            {/* Luxury Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs text-stone-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% BIS 916 & HUID Certified</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs text-stone-800 text-xs font-semibold">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>7th-Gen Master Karigar Artistry</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs text-stone-800 text-xs font-semibold">
                <Gem className="w-4 h-4 text-[#8B1A1A]" />
                <span>Syndicate Uncut Polki Diamonds</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                to="/collections?occasion=bridal"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#7A1D28] to-[#5B101D] hover:from-[#5B101D] hover:to-[#400B14] text-white rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2.5 group"
              >
                <span>Explore Bridal Vault</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2.5"
              >
                <PhoneCall className="w-4 h-4 text-[#B68936]" />
                <span>Book Atelier Consultation</span>
              </Link>
            </div>

          </div>

          {/* ── Right Content: The Royal 10-Lobed Scalloped Indian Jharokha Arch Frame (6 Cols) ── */}
          <div className="lg:col-span-6 flex items-center justify-center">
            
            <div className="relative w-full max-w-[440px] sm:max-w-[480px] aspect-[480/580] group">
              
              {/* Decorative Warm Aura Behind Arch Frame */}
              <div className="absolute inset-4 bg-gradient-to-t from-[#B68936]/35 via-rose-300/30 to-amber-200/20 rounded-[60px] blur-3xl transform scale-95 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />

              {/* 
                Authentic Indian Multi-Lobed Scalloped Petal Arch Frame
                viewBox 0 0 480 580 with 10 cusped lobes matching the Right Gold reference!
              */}
              <svg 
                viewBox="0 0 480 580" 
                className="w-full h-full drop-shadow-2xl overflow-visible transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              >
                <defs>
                  {/* Linear gradient for rich metallic 24K gold foil borders */}
                  <linearGradient id="royalGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E6C875" />
                    <stop offset="25%" stopColor="#FFF2C2" />
                    <stop offset="50%" stopColor="#C9A44A" />
                    <stop offset="75%" stopColor="#8F6A24" />
                    <stop offset="100%" stopColor="#E6C875" />
                  </linearGradient>

                  <linearGradient id="warmBottomGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="55%" stopColor="#7A1D28" stopOpacity="0" />
                    <stop offset="85%" stopColor="#7A1D28" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#4A0D15" stopOpacity="0.9" />
                  </linearGradient>

                  {/* The 10-lobed Scalloped Arch ClipPath using geometric circular arc lobes */}
                  <clipPath id="royalScallopedJharokha">
                    <path d="M 240,45 A 60 60 0 0 1 320,85 A 65 65 0 0 1 390,175 A 70 70 0 0 1 420,290 A 70 70 0 0 1 390,405 A 65 65 0 0 1 320,495 A 60 60 0 0 1 240,535 A 60 60 0 0 1 160,495 A 65 65 0 0 1 90,405 A 70 70 0 0 1 60,290 A 70 70 0 0 1 90,175 A 65 65 0 0 1 160,85 A 60 60 0 0 1 240,45 Z" />
                  </clipPath>
                </defs>

                {/* Outer Glow Halo Stroke */}
                <path
                  d="M 240,45 A 60 60 0 0 1 320,85 A 65 65 0 0 1 390,175 A 70 70 0 0 1 420,290 A 70 70 0 0 1 390,405 A 65 65 0 0 1 320,495 A 60 60 0 0 1 240,535 A 60 60 0 0 1 160,495 A 65 65 0 0 1 90,405 A 70 70 0 0 1 60,290 A 70 70 0 0 1 90,175 A 65 65 0 0 1 160,85 A 60 60 0 0 1 240,45 Z"
                  fill="#FFFBF2"
                  stroke="url(#royalGoldFoil)"
                  strokeWidth="8"
                />

                {/* Inner Image Container Clipped to the 10-lobed Indian Arch */}
                <g clipPath="url(#royalScallopedJharokha)">
                  {/* Royal Bridal Muse Image */}
                  <image
                    href="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"
                    x="20"
                    y="25"
                    width="440"
                    height="530"
                    preserveAspectRatio="xMidYMid slice"
                    className="group-hover:scale-105 transition-transform duration-700 ease-out origin-center"
                  />

                  {/* Soft bottom magenta/wine gradient overlay matching reference */}
                  <rect
                    x="0"
                    y="0"
                    width="480"
                    height="580"
                    fill="url(#warmBottomGlow)"
                    pointerEvents="none"
                  />
                </g>

                {/* Inner Delicate Gold Border Line */}
                <path
                  d="M 240,56 A 55 55 0 0 1 314,94 A 60 60 0 0 1 380,178 A 65 65 0 0 1 408,290 A 65 65 0 0 1 380,402 A 60 60 0 0 1 314,486 A 55 55 0 0 1 240,524 A 55 55 0 0 1 166,486 A 60 60 0 0 1 100,402 A 65 65 0 0 1 72,290 A 65 65 0 0 1 100,178 A 60 60 0 0 1 166,94 A 55 55 0 0 1 240,56 Z"
                  fill="none"
                  stroke="url(#royalGoldFoil)"
                  strokeWidth="2.5"
                  opacity="0.9"
                />

                {/* Caption Tag Inside Arch at Bottom */}
                <g transform="translate(240, 490)">
                  <rect
                    x="-125"
                    y="-15"
                    width="250"
                    height="30"
                    rx="15"
                    fill="#1A070B"
                    stroke="url(#royalGoldFoil)"
                    strokeWidth="1.2"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="#F3E5AB"
                    fontSize="10.5"
                    fontFamily="'Bodoni Moda', Georgia, serif"
                    fontWeight="600"
                    letterSpacing="0.14em"
                  >
                    ROYAL BRIDAL HEIRLOOMS 2026
                  </text>
                </g>

              </svg>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
};
