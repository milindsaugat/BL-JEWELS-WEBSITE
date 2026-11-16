import React from 'react';

export const RateCacheNotice = ({ meta }) => {
  if (!meta) return null;

  const updated = meta.lastUpdated
    ? new Date(meta.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : '';

  const message =
    meta.message ||
    (meta.ratesAvailable === false
      ? 'Live rate limit reached. Rates currently not available.'
      : meta.disabled
      ? 'Live updates are paused. Showing the last saved rates. '
      : meta.stale
      ? 'Refresh unavailable. Showing older saved rates. '
      : 'Reference rates refresh every 4 hours. ');

  return (
    <div
      role="status"
      className="flex items-center justify-center px-4 py-1.5 text-xs bg-amber-50/95 border-b border-amber-200/80 text-amber-900 font-body text-center"
    >
      <span>
        {message} {updated && `Last updated: ${updated} IST.`}
      </span>
    </div>
  );
};
