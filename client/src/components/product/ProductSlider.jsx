import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarousel } from '../../hooks/useCarousel';
import { ProductCard } from './ProductCard';
export const ProductSlider = ({ title, subtitle, products = [], onClear }) => {
  const c = useCarousel(products);
  if (!products.length) return null;
  return <section className="py-8 sm:py-12 border-t border-stone-200">
    <div className="flex items-end justify-between gap-4 mb-6"><div><h2 className="font-display text-2xl sm:text-3xl text-[#930303]">{title}</h2><p className="text-sm text-stone-500 mt-2">{subtitle}</p></div><div className="flex items-center gap-2">{onClear && <button onClick={onClear} className="text-xs text-stone-500 underline">Clear history</button>}<div className="hidden md:flex gap-2">{['left','right'].map(dir=><button key={dir} aria-label={`${dir === 'left' ? 'Previous' : 'Next'} ${title}`} disabled={dir === 'left' ? !c.canScrollLeft : !c.canScrollRight} onClick={()=>c.scrollSlider(dir)} className="p-2.5 rounded-full border bg-white disabled:opacity-30">{dir==='left'?<ChevronLeft size={18}/>:<ChevronRight size={18}/>}</button>)}</div></div></div>
    <div ref={c.sliderRef} tabIndex={0} aria-label={title} onPointerDown={c.handlePointerDown} onPointerMove={c.handlePointerMove} onPointerUp={c.handlePointerUp} onPointerCancel={c.handlePointerUp} onClickCapture={c.handleClickCapture} className={`flex gap-4 overflow-x-auto pb-4 ${c.isDragging?'cursor-grabbing':'cursor-grab'}`} style={{scrollbarWidth:'thin',touchAction:'pan-x pan-y'}}>
      {products.map(p=><div key={p._id} className="shrink-0 w-[72%] min-[480px]:w-[44%] md:w-[31%] lg:w-[calc((100%_-_48px)/4)]"><ProductCard product={p}/></div>)}
    </div>
  </section>;
};
