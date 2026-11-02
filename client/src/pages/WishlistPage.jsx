import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { productService } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';

export const WishlistPage = () => {
  const { wishlist } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await productService.getProducts({});
        if (res.products) {
          const filtered = res.products.filter(p => wishlist.includes(p._id));
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Fetch wishlist error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (products.length === 0 && !loading) {
    return (
      <div className="py-24 bg-pearl min-h-[70vh] flex items-center justify-center">
        <div className="container-bl text-center max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-ivory border border-gold-300 flex items-center justify-center text-crimson-700 shadow-gold-sm">
            <Heart className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Your Wishlist is Empty</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-body leading-relaxed">
            Click the heart icon on any royal creation to save your favorite wedding chokers and diamond solitaires here.
          </p>
          <Link
            to="/collections"
            className="inline-block px-8 py-3.5 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-crimson"
          >
            Explore Fine Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-pearl min-h-screen">
      <div className="container-bl">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-light">
          <div>
            <span className="font-accent text-xs font-bold text-gold-700 uppercase tracking-wider">
              Saved Heirlooms
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-crimson-900">
              My Wishlist ({products.length})
            </h1>
          </div>
          <Link
            to="/collections"
            className="text-xs font-semibold text-crimson-700 hover:underline font-body"
          >
            Discover More Jewels →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
};

