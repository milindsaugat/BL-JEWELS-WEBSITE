import React, { useEffect, useState } from 'react';
import { blogService } from '../services/api';
import { JournalListing } from '../components/blog/JournalListing';

export const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    blogService
      .getBlogs()
      .then((res) => {
        if (active) setBlogs(res.blogs || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return <JournalListing blogs={blogs} loading={loading} />;
};

export default BlogPage;
