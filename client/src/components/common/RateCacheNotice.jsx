import React from 'react';

export const RateCacheNotice = ({ meta }) => {
  if (!meta?.lastUpdated) return null;
  const updated = new Date(meta.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return <p role="status" className={`rounded-xl border p-3 text-xs sm:text-sm leading-relaxed ${meta.stale ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-white/10 border-white/20 text-inherit'}`}>
    {meta.disabled ? 'Live updates are paused. Showing the last saved rates. ' : meta.stale ? 'Refresh unavailable. Showing older saved rates. ' : 'Reference rates refresh every 4 hours. '}
    Last updated: {updated} IST.
  </p>;
};
