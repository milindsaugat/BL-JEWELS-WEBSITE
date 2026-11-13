import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const ArticleHero = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    setLoaded(Boolean(imgRef.current?.complete));
  }, [src]);

  if (!src) return null;

  return (
    <section aria-label="Featured article image" className="max-w-[1120px] mx-auto px-5 sm:px-8 pb-10 sm:pb-12">
      <motion.figure
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[16px] border border-[#E9DED2] bg-[#F8F2EC] shadow-[0_12px_36px_rgba(41,35,33,0.08)]"
      >
        <div className="aspect-[16/9] max-h-[600px] w-full overflow-hidden">
          <img
            ref={imgRef}
            src={src}
            alt={alt || 'BL Jewels Royal Journal featured photograph'}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
              loaded || reduced ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </motion.figure>
    </section>
  );
};

export default ArticleHero;

