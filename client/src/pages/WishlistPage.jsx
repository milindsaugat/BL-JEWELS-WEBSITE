import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { productService } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';

export const WishlistPage = () => {
  const { wishlist, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setProducts([]);
      setLoading(false);
      return;
    }

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
  }, [wishlist, isAuthenticated]);

  // Guest Protection: If not logged in, show lock screen and prompt sign in
  if (!isAuthenticated) {
    return (
      <div className="py-24 bg-pearl min-h-[70vh] flex items-center justify-center">
        <div className="container-bl text-center max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-ivory border border-gold-300 flex items-center justify-center text-[#930303] shadow-gold-sm">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Sign In to View Wishlist</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-body leading-relaxed">
            Your saved fine jewelry heirlooms are private. Please sign in or create an account to view and manage your wishlist.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('wishlist')}
              className="inline-block px-8 py-3.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 cursor-pointer"
            >
              Sign In to View Wishlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="py-24 bg-pearl min-h-[70vh] flex items-center justify-center">
        <div className="container-bl text-center max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-ivory border border-gold-300 flex items-center justify-center text-[#930303] shadow-gold-sm">
            <Heart className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Your Wishlist is Empty</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-body leading-relaxed">
            Click the heart icon on any royal creation to save your favorite wedding chokers and diamond solitaires here.
          </p>
          <Link
            to="/collections"
            className="inline-block px-8 py-3.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25"
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
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#930303]">
              My Wishlist ({products.length})
            </h1>
          </div>
          <Link
            to="/collections"
            className="text-xs font-semibold text-[#930303] hover:underline font-body"
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

