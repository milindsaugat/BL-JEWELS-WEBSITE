import React from 'react';

const promises = [
  { icon: 'shield', title: 'Certified Purity', description: 'BIS hallmarked gold with clearly stated purity.' },
  { icon: 'receipt', title: 'Clear Pricing', description: 'Gold value, making charges and taxes, itemised.' },
  { icon: 'coins', title: 'Gold Rate Updates', description: 'Reference gold rates with the latest update time.' },
  { icon: 'craft', title: 'Fair Making Charges', description: 'Know the craftsmanship cost before you buy.' },
  { icon: 'gem', title: 'Timeless Designs', description: 'Thoughtful pieces for everyday and celebrations.' },
  { icon: 'return', title: 'Buyback & Exchange', description: 'Exchange support as per our store policy.' },
];

const PromiseIcon = ({ name }) => {
  const artwork = {
    shield: <><path d="M16 3 27 7v8c0 7-6 12-11 14C11 27 5 22 5 15V7Z" /><path d="m10 16 4 4 8-9" /></>,
    receipt: <><path d="M8 3h12l5 5v21l-4-2-5 2-4-2-4 2Z" /><path d="M19 3v7h6M12 14h9M12 19h9M12 24h5" /></>,
    coins: <><ellipse cx="13" cy="9" rx="9" ry="4" /><path d="M4 9v6c0 2 4 4 9 4 2 0 4-.3 6-1M4 15v6c0 2 4 4 9 4h2M22 9v4" /><circle cx="24" cy="23" r="6" /><path d="M24 20v6m-2-4 2-2 2 2" /></>,
    craft: <><path d="m4 12 8-8 16 16-8 8ZM8 8l16 16M7 20l5 5" /><path d="m20 5 1-3 1 3 3 1-3 1-1 3-1-3-3-1Z" /></>,
    gem: <><path d="M8 5h16l6 9-14 15L2 14ZM2 14h28M8 5l8 24L24 5M8 5l8 9 8-9" /></>,
    return: <><path d="M5 12a12 12 0 1 1 0 10M5 5v8h8" /><path d="m11 17 5-4 5 4-5 7Z" /></>,
  };
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-7 h-7">{artwork[name]}</svg>;
};

const PromiseCard = ({ icon, title, description }) => (
  <article className="min-w-0 h-full rounded-2xl border border-[#C9A44A]/25 bg-[#261219] px-3 py-5 sm:px-4 sm:py-6 text-center transition-colors duration-200 hover:border-[#C9A44A]/60 hover:bg-[#2D151E]">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#C9A44A]/30 bg-[#361823] text-[#E6C875]">
      <PromiseIcon name={icon} />
    </div>
    <h3 className="font-display text-[15px] sm:text-base font-semibold leading-snug text-[#F6EACC] min-h-[40px] flex items-center justify-center">{title}</h3>
    <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-[#CFBEC1] max-w-[210px] mx-auto">{description}</p>
  </article>
);

export const RoyalPromisesSection = () => (
  <section aria-labelledby="royal-promises-title" className="w-full bg-[#170A0F] py-12 sm:py-16 text-white border-y border-[#C9A44A]/15">
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
        <div className="flex items-center justify-center gap-3 mb-3" aria-hidden="true">
          <span className="h-px w-8 bg-[#C9A44A]/50" />
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#C9A44A]" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" /></svg>
          <span className="h-px w-8 bg-[#C9A44A]/50" />
        </div>
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-semibold text-[#C9A44A] mb-2">The auspicious standard</p>
        <h2 id="royal-promises-title" className="font-display text-[28px] sm:text-4xl lg:text-[40px] leading-tight font-semibold text-[#FFF8EC]">The BL Jewels <span className="text-[#E6C875]">Royal Promises</span></h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#CFBEC1] max-w-lg mx-auto mt-3">Pure craftsmanship, honest pricing and care you can count on.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {promises.map(promise => <PromiseCard key={promise.icon} {...promise} />)}
      </div>
    </div>
  </section>
);
