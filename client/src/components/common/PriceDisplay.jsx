import React from 'react';
import { formatCurrency } from '../../lib/utils';

export const PriceDisplay = ({ price, discountPrice, size = 'md', className = '' }) => {
  const currentPrice = discountPrice || price;
  const originalPrice = discountPrice ? price : null;
  const savings = originalPrice ? originalPrice - currentPrice : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl md:text-2xl',
    xl: 'text-2xl md:text-3xl font-semibold',
  };

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`font-body font-bold text-[#930303] tracking-tight ${sizeClasses[size]}`}>
        ₹{formatCurrency(currentPrice)}
      </span>
      {originalPrice && (
        <span className="font-body text-xs md:text-sm text-stone-400 line-through font-normal">
          ₹{formatCurrency(originalPrice)}
        </span>
      )}
      {savings > 0 && size !== 'sm' && (
        <span className="text-[11px] font-body font-medium tracking-normal text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-pill">
          Save ₹{formatCurrency(savings)}
        </span>
      )}
    </div>
  );
};

