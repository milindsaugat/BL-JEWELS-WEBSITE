import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArticleBreadcrumb } from './ArticleBreadcrumb';
import { ArticleMetadata } from './ArticleMetadata';
import { ArticleAuthor } from './ArticleAuthor';

export const ArticleHeader = ({ blog, onShare, copiedLink }) => {
  const reduced = useReducedMotion();

  return (
    <header className="bg-[#FFFCF8] pt-7 pb-7 sm:pt-10 sm:pb-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1120px] mx-auto px-5 sm:px-8 space-y-5"
      >
        <ArticleBreadcrumb category={blog.category} />

        <ArticleMetadata
          category={blog.category}
          publishedAt={blog.publishedAt || blog.createdAt}
          readTimeMinutes={blog.readTimeMinutes}
          views={blog.views}
        />

        <div className="space-y-4">
          <h1
            className="font-display font-medium text-[#292321] tracking-[-0.015em] max-w-[960px]"
            style={{
              fontSize: 'clamp(30px, 4.2vw, 52px)',
              lineHeight: 1.12,
            }}
          >
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-[16px] sm:text-[18px] leading-[1.7] text-[#756B65] max-w-[850px] font-body">
              {blog.excerpt}
            </p>
          )}
        </div>

        <ArticleAuthor
          authorName={blog.authorName}
          authorRole={blog.authorRole}
          onShare={onShare}
          copiedLink={copiedLink}
        />
      </motion.div>
    </header>
  );
};

export default ArticleHeader;

