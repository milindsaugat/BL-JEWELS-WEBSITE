import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronRight, X, RotateCcw, ShieldCheck } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton';
import { METALS, KARATS, OCCASIONS, SORT_OPTIONS } from '../lib/constants';

export const Collection = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedMetal, setSelectedMetal] = useState('');
  const [selectedKarat, setSelectedKarat] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMax, setPriceMax] = useState(500000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: slug || undefined,
          metal: selectedMetal || undefined,
          karat: selectedKarat || undefined,
          occasion: selectedOccasion || undefined,
          maxPrice: priceMax || undefined,
          sort: sortBy,
        };

        const res = await productService.getProducts(params);
        if (res.products) {
          setProducts(res.products);
        }

        if (slug) {
          const cat = categories.find((c) => c.slug === slug);
          setCurrentCategory(cat || null);
        } else {
          setCurrentCategory(null);
        }
      } catch (err) {
        console.error('Fetch collection products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, selectedMetal, selectedKarat, selectedOccasion, priceMax, sortBy, categories]);

  const resetFilters = () => {
    setSelectedMetal('');
    setSelectedKarat('');
    setSelectedOccasion('');
    setPriceMax(500000);
    setSortBy('newest');
  };

  const hasActiveFilters = selectedMetal || selectedKarat || selectedOccasion || priceMax < 500000;

  return (
    <div className="py-8 bg-pearl min-h-screen">
      <div className="container-bl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 font-body mb-6">
          <Link to="/" className="hover:text-crimson-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link to="/collections" className="hover:text-crimson-700">Collections</Link>
          {slug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold text-charcoal capitalize">
                {currentCategory?.name || slug.replace('-', ' ')}
              </span>
            </>
          )}
        </nav>

        {/* Collection Hero Header */}
        <div className="bg-gradient-to-r from-ivory via-parchment/60 to-ivory rounded-2xl p-6 md:p-10 border border-gold-300/50 mb-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-accent tracking-wider text-gold-800 uppercase font-bold">
              BL Jewels Fine Jewelry
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-crimson-900 capitalize">
              {currentCategory?.name || 'All Jewelry Collections'}
            </h1>
            <p className="font-body text-xs sm:text-sm text-stone-600 leading-relaxed">
              {currentCategory?.description ||
                'Explore our master handcrafted fine jewelry, each certified with 100% official BIS 916 hallmarking and guaranteed purity.'}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gold-300 text-center shrink-0 shadow-gold-sm">
            <span className="font-accent text-2xl font-bold text-crimson-700 block">
              {products.length}
            </span>
            <span className="text-[11px] text-stone-500 font-body uppercase tracking-wider">
              Hallmarked Designs
            </span>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <Link
            to="/collections"
            className={`px-4 py-2 rounded-full text-xs font-medium font-body whitespace-nowrap transition-all ${
              !slug
                ? 'bg-crimson-700 text-white shadow-crimson'
                : 'bg-ivory hover:bg-parchment/70 text-stone-700 border border-border-light'
            }`}
          >
            All Pieces
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/collections/${cat.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-medium font-body whitespace-nowrap transition-all ${
                slug === cat.slug
                  ? 'bg-crimson-700 text-white shadow-crimson'
                  : 'bg-ivory hover:bg-parchment/70 text-stone-700 border border-border-light'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-ivory rounded-2xl p-6 border border-gold-200/60 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-border-light">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-crimson-700" />
                  <h3 className="font-accent text-xs font-bold text-charcoal tracking-wider uppercase">
                    Refine Jewels
                  </h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-crimson-700 hover:underline flex items-center gap-1 font-body"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Metal Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-800 font-body uppercase tracking-wider block">
                  Metal Type
                </label>
                <div className="space-y-1.5">
                  {METALS.map((m) => (
                    <label
                      key={m.value}
                      className="flex items-center gap-2 text-xs text-stone-700 font-body cursor-pointer hover:text-crimson-700"
                    >
                      <input
                        type="radio"
                        name="metal"
                        checked={selectedMetal === m.value}
                        onChange={() => setSelectedMetal(m.value)}
                        className="text-crimson-700 focus:ring-gold-400"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Karat Filter */}
              <div className="space-y-2 pt-3 border-t border-border-light">
                <label className="text-xs font-semibold text-stone-800 font-body uppercase tracking-wider block">
                  Gold Karat (Hallmark)
                </label>
                <div className="space-y-1.5">
                  {KARATS.map((k) => (
                    <label
                      key={k.value}
                      className="flex items-center gap-2 text-xs text-stone-700 font-body cursor-pointer hover:text-crimson-700"
                    >
                      <input
                        type="radio"
                        name="karat"
                        checked={selectedKarat === k.value}
                        onChange={() => setSelectedKarat(k.value)}
                        className="text-crimson-700 focus:ring-gold-400"
                      />
                      <span>{k.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Occasion Filter */}
              <div className="space-y-2 pt-3 border-t border-border-light">
                <label className="text-xs font-semibold text-stone-800 font-body uppercase tracking-wider block">
                  Celebration & Occasion
                </label>
                <div className="space-y-1.5">
                  {OCCASIONS.map((o) => (
                    <label
                      key={o.value}
                      className="flex items-center gap-2 text-xs text-stone-700 font-body cursor-pointer hover:text-crimson-700"
                    >
                      <input
                        type="radio"
                        name="occasion"
                        checked={selectedOccasion === o.value}
                        onChange={() => setSelectedOccasion(o.value)}
                        className="text-crimson-700 focus:ring-gold-400"
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2 pt-3 border-t border-border-light">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800 font-body">
                  <span>Max Budget</span>
                  <span className="font-accent text-crimson-700 font-bold">
                    ₹{Number(priceMax).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="10000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-crimson-700"
                />
              </div>

            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="flex-1 min-w-0">
            
            {/* Top Toolbar */}
            <div className="bg-ivory rounded-xl p-3 md:p-4 mb-6 border border-border-light flex items-center justify-between gap-4 flex-wrap">
              
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white border border-gold-300 rounded-lg text-xs font-medium text-stone-800"
              >
                <Filter className="w-3.5 h-3.5 text-crimson-700" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>

              <div className="text-xs text-stone-500 font-body">
                Showing <strong className="text-stone-800">{products.length}</strong> creations
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-stone-500 font-body hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-border-light rounded-lg px-3 py-1.5 text-xs text-stone-800 font-body focus:outline-none focus:border-gold-400"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="lg:hidden bg-ivory rounded-xl p-5 mb-6 border border-gold-300 space-y-4 animate-in slide-in-from-top duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-border-light">
                  <h4 className="font-accent text-xs font-bold text-charcoal">Filter Collections</h4>
                  <button onClick={() => setMobileFilterOpen(false)} className="text-stone-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-body">
                  <div>
                    <p className="font-semibold text-stone-800 mb-1.5">Metal</p>
                    {METALS.slice(1).map(m => (
                      <button
                        key={m.value}
                        onClick={() => setSelectedMetal(selectedMetal === m.value ? '' : m.value)}
                        className={`block w-full text-left py-1 ${selectedMetal === m.value ? 'text-crimson-700 font-bold' : 'text-stone-600'}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 mb-1.5">Gold Karat</p>
                    {KARATS.slice(1).map(k => (
                      <button
                        key={k.value}
                        onClick={() => setSelectedKarat(selectedKarat === k.value ? '' : k.value)}
                        className={`block w-full text-left py-1 ${selectedKarat === k.value ? 'text-crimson-700 font-bold' : 'text-stone-600'}`}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2 bg-crimson-700 text-white rounded-lg text-xs font-semibold font-body"
                >
                  Apply Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-ivory rounded-2xl border border-border-light space-y-4">
                <p className="font-display text-xl font-bold text-charcoal">
                  No matching jewelry pieces found
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto font-body">
                  Try adjusting your filter options or clearing selected metal purity to view all creations.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-crimson-700 text-white rounded-lg text-xs font-semibold font-body"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
