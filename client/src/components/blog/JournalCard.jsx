import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

const formatShortDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const JournalCard = ({ article, showDate = true }) => {
  if (!article) return null;

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group bg-white rounded-[12px] overflow-hidden border border-[#E9DED2] hover:border-[#D4AF66] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(41,35,33,0.07)] flex flex-col h-full"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-[#F8F2EC]">
        <img
          src={article.coverImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-accent uppercase tracking-[0.16em] font-semibold text-[#940303]">
              {article.category}
            </span>
            {showDate && article.publishedAt && (
              <span className="inline-flex items-center gap-1 text-[#756B65]">
                <Calendar className="w-3 h-3 text-[#D4AF66]" aria-hidden="true" />
                <span>{formatShortDate(article.publishedAt)}</span>
              </span>
            )}
          </div>

          <h3 className="font-display text-[20px] sm:text-[22px] font-medium text-[#292321] group-hover:text-[#940303] transition-colors leading-[1.28] line-clamp-2">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-[14px] leading-[1.65] text-[#756B65] line-clamp-3 font-body">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="pt-3.5 border-t border-[#E9DED2] flex items-center justify-between text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-[#756B65]">
            <Clock className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <span>{article.readTimeMinutes || 3} min read</span>
          </span>

          <span className="inline-flex items-center gap-1.5 font-accent font-semibold uppercase tracking-[0.14em] text-[#940303] text-[11px]">
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF66] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default JournalCard;

