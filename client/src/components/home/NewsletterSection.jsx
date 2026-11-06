import React from 'react';
import { Sparkles } from 'lucide-react';
import { SubscribeForm } from '../common/SubscribeForm';
export const NewsletterSection=()=> <section className="bg-white px-4 py-10 sm:py-14"><div className="max-w-6xl mx-auto rounded-3xl bg-[#FAF0EB] border border-[#EADBD4] p-6 sm:p-10 grid md:grid-cols-2 items-center gap-8"><div><p className="flex items-center gap-2 text-[#930303] text-xs tracking-widest uppercase"><Sparkles size={16}/>The BL Jewels circle</p><h2 className="font-display text-3xl sm:text-4xl text-[#930303] mt-3">A little sparkle in your inbox.</h2><p className="text-sm leading-6 text-stone-600 mt-3">New collections, thoughtful gifts and special moments. Be the first to discover what is new.</p></div><SubscribeForm/></div></section>;
