import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const ArticleBreadcrumb = ({ category = 'Royal Journal' }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#756B65] flex-wrap font-body">
    <Link to="/" className="hover:text-[#940303] transition-colors duration-200">
      Home
    </Link>
    <ChevronRight className="w-3.5 h-3.5 text-[#D4AF66] shrink-0" aria-hidden="true" />
    <Link to="/blog" className="hover:text-[#940303] transition-colors duration-200">
      The Royal Journal
    </Link>
    {category && (
      <>
        <ChevronRight className="w-3.5 h-3.5 text-[#D4AF66] shrink-0" aria-hidden="true" />
        <span className="text-[#940303] font-medium truncate max-w-[260px] sm:max-w-sm">
          {category}
        </span>
      </>
    )}
  </nav>
);

export default ArticleBreadcrumb;

