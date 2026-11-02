import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 5, count = 0, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5 text-gold-500">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-gold-500 text-gold-500'
                : 'fill-stone-200 text-stone-200'
            }`}
          />
        ))}
      </div>
      <span className="font-body text-xs font-semibold text-stone-700">
        {rating.toFixed(1)}
      </span>
      {count > 0 && (
        <span className="font-body text-xs text-stone-400">
          ({count})
        </span>
      )}
    </div>
  );
};

