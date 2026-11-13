import React from 'react';
import { Tag } from 'lucide-react';
import { ArticleShareButtons } from './ArticleShareButtons';

export const ArticleTags = ({ tags = [], articleTitle, onCopyLink, copiedLink }) => {
  return (
    <div className="pt-8 mt-10 border-t border-[#E9DED2] space-y-5">
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-accent uppercase tracking-[0.16em] text-[#756B65] mr-1">
            <Tag className="w-3.5 h-3.5 text-[#D4AF66]" aria-hidden="true" />
            <span>Topics</span>
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-[#F8F2EC] border border-[#E9DED2] hover:border-[#D4AF66] text-[12px] font-medium text-[#292321] transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Share Bar (especially useful on Mobile/Tablet where sidebar is hidden) */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 lg:hidden">
        <span className="font-accent text-[11px] uppercase tracking-[0.18em] text-[#756B65] font-semibold">
          Share Article
        </span>
        <ArticleShareButtons
          title={articleTitle}
          onCopyLink={onCopyLink}
          copiedLink={copiedLink}
          variant="pills"
        />
      </div>
    </div>
  );
};

export default ArticleTags;

