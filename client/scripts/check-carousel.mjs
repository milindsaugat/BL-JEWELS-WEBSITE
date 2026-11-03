import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/hooks/useCarousel.js', import.meta.url), 'utf8')
  .replace(/^import .*\n/, '').replace('export const useCarousel', 'const useCarousel');

const setup = (reduced = false) => {
  let time = 0, id = 0, position = 0, captured = false;
  const frames = new Map(), listeners = new Map(), effects = [];
  const el = {
    clientWidth: 800, scrollWidth: 2400, firstElementChild: { getBoundingClientRect: () => ({ width: 240 }) },
    get scrollLeft() { return position; },
    set scrollLeft(value) { position = Math.max(0, Math.min(1600, value)); },
    scrollTo({ left }) { this.scrollLeft = left; },
    scrollBy(options) { this.lastScroll = options; },
    setPointerCapture() { captured = true; }, hasPointerCapture() { return captured; },
    releasePointerCapture() { captured = false; },
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name) { listeners.delete(name); },
  };
  const context = {
    useRef: current => ({ current }), useState: initial => [initial, () => {}],
    useEffect: effect => effects.push(effect),
    performance: { now: () => time }, window: { matchMedia: () => ({ matches: reduced }) },
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    ResizeObserver: class { observe() {} disconnect() {} },
    getComputedStyle: () => ({ columnGap: '24px' }),
  };
  const useCarousel = vm.runInNewContext(source + '\nuseCarousel;', context);
  const carousel = useCarousel('test');
  carousel.sliderRef.current = el;
  const cleanup = effects[0]();
  const tick = () => {
    time += 16;
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time));
  };
  const event = (x, type = 'pointermove', pointerType = 'mouse') => ({
    clientX: x, pointerId: 1, pointerType, button: 0, type,
    target: { closest: () => null }, preventDefault() {},
  });
  return { carousel, el, frames, listeners, cleanup, tick, event };
};

{
  const { carousel: c, el, frames, listeners, cleanup, tick, event } = setup();
  c.handlePointerDown(event(200, 'pointerdown', 'touch'));
  c.handlePointerMove(event(100, 'pointermove', 'touch'));
  assert.equal(el.scrollLeft, 0); assert.equal(frames.size, 0);
  c.handlePointerDown(event(200, 'pointerdown'));
  c.handlePointerUp(event(200, 'pointerup'));
  c.handleClickCapture({ preventDefault() { throw Error('A tap must navigate'); } });

  c.handlePointerDown(event(200, 'pointerdown')); tick();
  c.handlePointerMove(event(140)); c.handlePointerMove(event(100));
  assert.equal(frames.size, 1); assert.equal(el.scrollLeft, 0);
  tick(); assert.equal(el.scrollLeft, 100);
  c.handlePointerUp(event(100, 'pointerup')); tick();
  assert.ok(el.scrollLeft > 100, 'Mouse drag should coast after release');
  let prevented = false;
  c.handleClickCapture({ preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.ok(prevented, 'Dragging a link must not navigate');
  listeners.get('wheel')(); assert.equal(frames.size, 0, 'Trackpad input stops custom momentum');
  c.scrollSlider('right'); assert.equal(el.lastScroll.left, 792); assert.equal(el.lastScroll.behavior, 'smooth');
  cleanup(); assert.equal(frames.size, 0);
}
{
  const { carousel: c, el, frames, cleanup, tick, event } = setup(true);
  c.handlePointerDown(event(200, 'pointerdown')); tick(); c.handlePointerMove(event(100));
  c.handlePointerUp(event(100, 'pointerup'));
  assert.equal(el.scrollLeft, 100); assert.equal(frames.size, 0);
  c.scrollSlider('left'); assert.equal(el.lastScroll.behavior, 'instant');
  cleanup();
}
console.log('PASS: native touch, link clicks, batched drag, momentum, wheel cancellation, arrow distance, reduced motion and cleanup.');
