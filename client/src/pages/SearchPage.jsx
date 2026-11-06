import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { productService } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ search: query });
        if (res.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      doSearch();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="py-12 bg-pearl min-h-screen">
      <div className="container-bl">
        
        <div className="mb-10 space-y-2">
          <span className="font-accent text-xs font-bold text-gold-700 tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            AI Search Results
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#930303]">
            Search Results for "{query}"
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Found {products.length} auspicious fine jewelry creations
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-xs text-stone-500 font-body">Searching BL Jewels catalog...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-border-light space-y-4">
            <Search className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-display text-xl font-bold text-charcoal">No Matching Pieces Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-body">
              Try searching for "22K Kundan", "Solitaire", "Mangalsutra", or "Polki Kada".
            </p>
            <Link
              to="/collections"
              className="inline-block px-6 py-2.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
