import React from 'react';
import { Check, Copy } from 'lucide-react';

const WhatsAppIcon = ({ className = 'w-3.5 h-3.5 shrink-0' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M12 2.25A9.75 9.75 0 0 0 3.63 17l-1.1 4.02 4.13-1.08A9.75 9.75 0 1 0 12 2.25Z"
      fill="#25D366"
    />
    <path
      d="M16.65 14.37c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
      fill="#FFFFFF"
    />
  </svg>
);

const FacebookIcon = ({ className = 'w-3.5 h-3.5 shrink-0' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="#1877F2" />
    <path
      d="M13.3 18.5v-5.9h1.98l.3-2.3H13.3V8.83c0-.67.18-1.12 1.14-1.12h1.22V5.65c-.21-.03-.94-.09-1.78-.09-1.76 0-2.97 1.08-2.97 3.05v1.69H8.92v2.3h1.99v5.9h2.39Z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Shared WhatsApp / Facebook / Copy Link action bar for editorial blog pages.
 */
export const ArticleShareButtons = ({
  title,
  onCopyLink,
  copiedLink,
  variant = 'sidebar',
}) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(
    `${title || 'BL Jewels — The Royal Journal'} ${shareUrl}`
  );

  const isSidebar = variant === 'sidebar';
  const itemClass = isSidebar
    ? 'flex-1 min-w-fit px-2.5 py-2 rounded-lg bg-[#FFFFFF] border border-[#E9DED2] hover:border-[#940303] text-[12px] font-medium text-[#292321] hover:text-[#940303] inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors'
    : 'px-3.5 py-1.5 rounded-full bg-white border border-[#E9DED2] hover:border-[#940303] text-[12px] font-medium text-[#292321] hover:text-[#940303] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors';

  return (
    <div className={isSidebar ? 'flex flex-wrap gap-2' : 'flex items-center gap-2 flex-wrap'}>
      <a
        href={`https://wa.me/?text=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share article on WhatsApp"
        className={itemClass}
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share article on Facebook"
        className={itemClass}
      >
        <FacebookIcon />
        <span>Facebook</span>
      </a>
      <button
        type="button"
        onClick={onCopyLink}
        className={`${itemClass} cursor-pointer`}
      >
        {copiedLink ? (
          <>
            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
            <span className="text-emerald-700">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 shrink-0 text-[#D4AF66]" aria-hidden="true" />
            <span>{isSidebar ? 'Copy' : 'Copy Link'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ArticleShareButtons;

