import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

export const HallmarkBadge = ({ purity = '916', karat = '22K', compact = false }) => {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-700 bg-gold-50/80 border border-gold-200/80 px-2 py-0.5 rounded-pill">
        <ShieldCheck className="w-3 h-3 text-gold-600" />
        <span>BIS {purity}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-50 via-pearl to-gold-50 border border-gold-300/70 px-3 py-1.5 rounded-lg shadow-gold-sm">
      <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-700">
        <Award className="w-4 h-4" />
      </div>
      <div>
        <p className="font-accent text-[11px] font-bold text-gold-900 tracking-wider">
          BIS {purity} HALLMARKED
        </p>
        <p className="text-[10px] text-stone-500 font-body">
          {karat} Certified Purity Guaranteed
        </p>
      </div>
    </div>
  );
};

