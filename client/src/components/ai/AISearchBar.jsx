import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { aiService, productService } from '../../services/api';
import { formatCurrency } from '../../lib/utils';

export const AISearchBar = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const QUICK_TAGS = [
    '22K Kundan Choker',
    'Diamond Solitaire Ring',
    'Swarna Mangalsutra',
    'Temple Jhumka',
    'Polki Kada',
    'Tennis Bracelet',
  ];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [isSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await aiService.searchSuggest(query);
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch {
        // Fallback search using products
        try {
          const res = await productService.getProducts({ search: query });
          if (res.products) {
            setSuggestions(res.products.slice(0, 5).map(p => ({
              id: p._id,
              name: p.name,
              slug: p.slug,
              price: p.variants?.[0]?.discountPrice || p.variants?.[0]?.price,
              image: p.images?.[0]?.url,
              karat: p.metal?.karat || '22K',
              matchReason: 'Direct catalog match',
            })));
          }
        } catch {
          // Ignore
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (slug) => {
    closeSearch();
    navigate(`/products/${slug}`);
  };

  const handleFullSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/70 backdrop-blur-md transition-opacity"
        onClick={closeSearch}
      />

      {/* Modal Dialog */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16 md:pt-24 pointer-events-none">
        <div className="relative w-full max-w-2xl bg-pearl rounded-2xl shadow-2xl border border-gold-300/50 overflow-hidden pointer-events-auto">
          
          {/* Header Search Form */}
          <form onSubmit={handleFullSearch} className="flex items-center gap-3 p-4 md:p-5 bg-white border-b border-border-light">
            <Search className="w-5 h-5 text-gold-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by design, metal purity (22K/18K), occasion, or style..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm md:text-base font-body text-charcoal placeholder-stone-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="p-1.5 rounded-full text-stone-400 hover:text-charcoal hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Tags */}
          <div className="px-5 py-3 bg-ivory/60 border-b border-border-light flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-stone-500 font-body flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold-600" />
              Popular:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs bg-white hover:bg-gold-50 border border-gold-200/80 px-2.5 py-1 rounded-pill text-stone-700 transition-colors font-body"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="max-h-96 overflow-y-auto p-4 md:p-5">
            {loading ? (
              <div className="py-10 text-center text-xs text-stone-500 font-body flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching our fine jewelry catalog...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gold-800 font-accent px-1">
                  Matching Heirloom Pieces ({suggestions.length})
                </p>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item.slug)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold-300 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-parchment rounded-lg overflow-hidden shrink-0 border border-gold-200/50">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-gold-700 bg-gold-50 px-1.5 py-0.5 rounded">
                          {item.karat}
                        </span>
                        <span className="text-[11px] text-stone-400 font-body">
                          {item.matchReason}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-charcoal truncate mt-0.5 group-hover:text-[#930303] transition-colors">
                        {item.name}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-body text-sm font-bold text-[#930303]">
                        ₹{formatCurrency(item.price)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-gold-600 transition-colors ml-auto mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="py-12 text-center space-y-2">
                <p className="font-display text-base font-semibold text-charcoal">No jewelry matches found for "{query}"</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto font-body">
                  Try searching for gold karat (22K, 18K), jewelry type (choker, ring, jhumka), or occasion (wedding, gifting).
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-400 font-body">
                Start typing to discover BIS 916 hallmarked jewels, solitaires, and royal bridal chokers.
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-5 py-3 bg-white border-t border-border-light flex items-center justify-between text-[11px] text-stone-500 font-body">
            <span className="flex items-center gap-1 text-gold-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              BIS 916 Hallmarked Certified Search
            </span>
            <span>Press ESC to close</span>
          </div>

        </div>
      </div>
    </div>
  );
};

