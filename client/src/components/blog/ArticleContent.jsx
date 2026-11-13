import React from 'react';

export const ArticleContent = ({ sanitizedHtml }) => {
  if (!sanitizedHtml) return null;

  return (
    <div
      className="bl-editorial-prose font-body"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default ArticleContent;

