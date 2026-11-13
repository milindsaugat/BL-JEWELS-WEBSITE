import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { JournalCard } from './JournalCard';

export const RelatedArticles = ({ articles = [] }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section
      aria-label="More From The Royal Journal"
      className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-12 mt-12 border-t border-[#E9DED2] space-y-7"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="font-accent text-[11.5px] uppercase tracking-[0.2em] font-semibold text-[#D4AF66] block">
            Continue Reading
          </span>
          <h2 className="font-display text-[28px] sm:text-[34px] font-medium text-[#940303] leading-tight">
            More From The Royal Journal
          </h2>
          <p className="text-[15px] text-[#756B65] font-body">
            Discover stories, inspiration and expert jewellery insights.
          </p>
        </div>

        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 font-accent text-[12px] font-semibold uppercase tracking-[0.16em] text-[#940303] hover:text-[#700202] group self-start sm:self-auto"
        >
          <span className="border-b border-[#940303]/40 group-hover:border-[#700202] pb-0.5">
            All Stories
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D4AF66] transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <JournalCard key={article._id || article.slug} article={article} showDate={false} />
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;

