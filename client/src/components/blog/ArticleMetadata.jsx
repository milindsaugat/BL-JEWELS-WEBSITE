import React from 'react';
import { Calendar, Clock, Eye } from 'lucide-react';

const formatPublishedDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const ArticleMetadata = ({ category, publishedAt, readTimeMinutes, views }) => {
  const formattedDate = formatPublishedDate(publishedAt);

  return (
    <div className="space-y-3">
      {category && (
        <div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#F8F2EC] border border-[#E9DED2] text-[#940303] font-accent text-[11.5px] font-semibold uppercase tracking-[0.18em]">
            {category}
          </span>
        </div>
      )}

      <div className="flex items-center gap-x-5 gap-y-2 flex-wrap text-[13.5px] text-[#756B65] font-body">
        {formattedDate && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <time dateTime={publishedAt}>{formattedDate}</time>
          </span>
        )}

        {readTimeMinutes && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <span>{readTimeMinutes} min read</span>
          </span>
        )}

        {typeof views === 'number' && views > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <span>{views.toLocaleString('en-IN')} views</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ArticleMetadata;

