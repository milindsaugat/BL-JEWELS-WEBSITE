import { useEffect, useRef, useState } from 'react';

export const useCarousel = (contentKey, resetKey) => {
  const sliderRef = useRef(null);
  const drag = useRef(null);
  const frame = useRef(0);
  const suppressClick = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bounds, setBounds] = useState({ left: false, right: false });
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop = () => { cancelAnimationFrame(frame.current); frame.current = 0; };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    let boundsFrame = 0;
    const measure = () => {
      boundsFrame = 0;
      const left = el.scrollLeft > 2;
      const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
      setBounds(previous => previous.left === left && previous.right === right ? previous : { left, right });
    };
    const schedule = () => { if (!boundsFrame) boundsFrame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    el.addEventListener('scroll', schedule, { passive: true });
    el.addEventListener('wheel', stop, { passive: true });
    el.addEventListener('keydown', stop);
    measure();
    return () => {
      stop();
      cancelAnimationFrame(boundsFrame);
      observer.disconnect();
      el.removeEventListener('scroll', schedule);
      el.removeEventListener('wheel', stop);
      el.removeEventListener('keydown', stop);
      drag.current = null;
    };
  }, [contentKey, resetKey]);

  const handlePointerDown = (event) => {
    stop();
    suppressClick.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0 ||
        event.target.closest('button, input, select, textarea, [contenteditable="true"]')) return;
    const el = sliderRef.current;
    // Stop an arrow animation before taking direct control of the track.
    el.scrollTo({ left: el.scrollLeft, behavior: 'instant' });
    drag.current = { id: event.pointerId, x: event.clientX, start: el.scrollLeft,
      target: el.scrollLeft, lastX: event.clientX, time: performance.now(), velocity: 0, moved: false };
  };

  const handlePointerMove = (event) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    const el = sliderRef.current;
    const delta = event.clientX - state.x;
    if (!state.moved && Math.abs(delta) < 5) return;
    if (!state.moved) {
      state.moved = true;
      suppressClick.current = true;
      setIsDragging(true);
      el.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const now = performance.now();
    const elapsed = Math.max(1, now - state.time);
    state.velocity = Math.max(-2, Math.min(2, (state.lastX - event.clientX) / elapsed));
    state.lastX = event.clientX;
    state.time = now;
    state.target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, state.start - delta));
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      el.scrollLeft = state.target;
    });
  };

  const handlePointerUp = (event) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    drag.current = null;
    stop();
    setIsDragging(false);
    const el = sliderRef.current;
    if (el.hasPointerCapture(state.id)) el.releasePointerCapture(state.id);
    if (!state.moved) return;
    el.scrollLeft = state.target;
    if (event.type === 'pointercancel' || event.type === 'lostpointercapture' || reducedMotion() || performance.now() - state.time > 80) return;
    let velocity = state.velocity;
    let previous = performance.now();
    const coast = (now) => {
      const dt = Math.min(32, now - previous);
      previous = now;
      velocity *= Math.exp(-dt / 150);
      const before = el.scrollLeft;
      el.scrollLeft += velocity * dt;
      if (Math.abs(velocity) > 0.025 && Math.abs(el.scrollLeft - before) > 0.1) {
        frame.current = requestAnimationFrame(coast);
      } else frame.current = 0;
    };
    frame.current = requestAnimationFrame(coast);
  };

  const handleClickCapture = (event) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const scrollSlider = (direction) => {
    const el = sliderRef.current;
    if (!el) return;
    stop();
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = el.firstElementChild?.getBoundingClientRect().width || el.clientWidth;
    const stride = cardWidth + gap;
    const step = stride * Math.max(1, Math.floor(el.clientWidth / stride));
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: reducedMotion() ? 'instant' : 'smooth' });
  };

  return {
    sliderRef, isDragging, canScrollLeft: bounds.left, canScrollRight: bounds.right, scrollSlider,
    handlePointerDown, handlePointerMove, handlePointerUp, handleClickCapture,
  };
};
