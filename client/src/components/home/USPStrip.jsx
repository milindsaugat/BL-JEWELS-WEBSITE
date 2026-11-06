import React from 'react';
import { ShieldCheck, Gem, Truck, RefreshCw } from 'lucide-react';

export const USPStrip = () => {
  const usps = [
    {
      icon: ShieldCheck,
      title: 'BIS 916 HALLMARKED',
      subtitle: 'Government certified gold purity stamps on every single creation',
    },
    {
      icon: Gem,
      title: 'CERTIFIED DIAMONDS',
      subtitle: 'Natural VVS/EF solitaires and syndicate uncut polki gemstones',
    },
    {
      icon: Truck,
      title: 'INSURED EXPRESS DELIVERY',
      subtitle: 'Tamper-proof transit via Blue Dart Luxury Express across India',
    },
    {
      icon: RefreshCw,
      title: 'LIFETIME BUYBACK',
      subtitle: 'Guaranteed 100% gold weight buyback and 15-day return assurance',
    },
  ];

  return (
    <section className="bg-white border-y border-stone-200/80 py-10">
      <div className="container-bl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {usps.map((usp, idx) => {
            const Icon = usp.icon;
            return (
              <div key={idx} className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gold-300 flex items-center justify-center text-[#930303] shadow-gold-sm shrink-0 group-hover:scale-105 group-hover:bg-[#930303] group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-accent text-xs font-bold text-charcoal tracking-cinzel uppercase">
                    {usp.title}
                  </h3>
                  <p className="font-body text-xs text-stone-600 mt-1 leading-relaxed">
                    {usp.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

