import React from 'react';

export const LoadingSkeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-parchment/60 via-ivory to-parchment/60 rounded-lg ${className}`}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-ivory rounded-xl overflow-hidden border border-border-light p-3 space-y-3">
      <LoadingSkeleton className="w-full aspect-square rounded-lg" />
      <LoadingSkeleton className="w-1/3 h-4" />
      <LoadingSkeleton className="w-3/4 h-5" />
      <LoadingSkeleton className="w-1/2 h-6" />
    </div>
  );
};

