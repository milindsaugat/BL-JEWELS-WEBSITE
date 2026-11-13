import React, { useEffect, useRef } from 'react';

export const ReadingProgress = () => {
  const barRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || CSS.supports?.('animation-timeline', 'scroll()')) return;

    const update = () => {
      if (!barRef.current) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      barRef.current.style.transform = `scaleX(${ratio})`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        className="bl-reading-progress-native h-full w-full origin-left bg-gradient-to-r from-[#940303] via-[#D4AF66] to-[#E8C98A]"
        style={
          typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', 'scroll()')
            ? undefined
            : { transform: 'scaleX(0)' }
        }
      />
    </div>
  );
};

export default ReadingProgress;

