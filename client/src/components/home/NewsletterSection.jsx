import React, { useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-crimson-950 via-crimson-900 to-crimson-950 text-white relative overflow-hidden">
      
      {/* Gold pattern shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A44A_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="container-bl relative z-10 text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-accent text-[11px] font-semibold tracking-wider uppercase">
            BL Jewels Auspicious Circle
          </span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal sm:font-medium text-pearl">
          Experience Generational Luxury
        </h2>

        <p className="font-body text-xs sm:text-sm text-stone-300 leading-relaxed">
          Subscribe to receive VIP private exhibition invites, festival gold savings, and early access to our handcrafted bridal masterpieces.
        </p>

        {subscribed ? (
          <div className="p-4 bg-white/10 rounded-xl border border-gold-400/50 text-gold-200 text-sm font-body">
            🙏 Thank you for joining the BL Jewels Auspicious Circle. Use code <strong>WELCOME5</strong> for 5% off your first heirloom.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-gold-400/40 rounded-xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:border-gold-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-charcoal font-semibold text-xs sm:text-sm font-body tracking-wider rounded-xl transition-all shadow-gold"
            >
              Join Circle
            </button>
          </form>
        )}

        <p className="text-[11px] text-stone-400 font-body flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
          <span>We respect your privacy. No spam, only rare jewelry privileges.</span>
        </p>
      </div>
    </section>
  );
};

