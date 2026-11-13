import React from 'react';
import { Share2, Check } from 'lucide-react';

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const ArticleAuthor = ({ authorName, authorRole, publishedLabel, onShare, copiedLink }) => {
  if (!authorName && !onShare) return null;

  return (
    <div className="pt-5 border-t border-[#E9DED2] flex items-center justify-between gap-4 flex-wrap">
      {authorName && (
        <div className="flex items-center gap-3.5">
          <div
            aria-hidden="true"
            className="w-11 h-11 rounded-full bg-[#F8F2EC] border border-[#D4AF66] text-[#940303] flex items-center justify-center font-accent font-semibold text-sm shrink-0"
          >
            {getInitials(authorName)}
          </div>
          <div>
            <p className="text-[14.5px] font-semibold text-[#292321] leading-snug">{authorName}</p>
            {(authorRole || publishedLabel) && (
              <p className="text-[12.5px] text-[#756B65] mt-0.5">
                {[authorRole, publishedLabel].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}

      {onShare && (
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E9DED2] hover:border-[#940303] text-[12.5px] font-medium text-[#292321] hover:text-[#940303] cursor-pointer transition-colors duration-200"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-emerald-800">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#940303]" />
              <span>Share Story</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ArticleAuthor;

