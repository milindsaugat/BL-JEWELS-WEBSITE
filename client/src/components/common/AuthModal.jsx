import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Heart,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalReason, authModalData } = useUIStore();
  const { login, register, toggleWishlist } = useAuthStore();
  const { closeDrawer } = useCartStore();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setIsSubmitting(false);
      setShowPassword(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handlePostAuthSuccess = async () => {
    closeAuthModal();
    if (authModalReason === 'checkout') {
      closeDrawer();
      navigate('/checkout');
      toast.success('Signed in! Proceeding to secure checkout...');
    } else if (authModalReason === 'wishlist') {
      if (authModalData) {
        await toggleWishlist(authModalData);
        toast.success('Added to your wishlist!');
      } else {
        toast.success('Signed in! Your wishlist is ready.');
      }
    } else {
      toast.success('Welcome back to BL Jewels!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          await handlePostAuthSuccess();
        } else {
          setErrorMsg(res.message || 'Invalid email or password credentials.');
        }
      } else {
        const res = await register({ name, email, password, phone });
        if (res.success) {
          await handlePostAuthSuccess();
        } else {
          setErrorMsg(res.message || 'Registration could not be completed.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    setEmail('demo@bljewels.com');
    setPassword('DemoUser123!');

    const res = await login('demo@bljewels.com', 'DemoUser123!');
    if (res.success) {
      await handlePostAuthSuccess();
    } else {
      setErrorMsg(res.message || 'Unable to sign in with demo credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Gold Foil Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#930303] via-[#C9A44A] to-[#930303]" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="p-5 sm:p-7 space-y-4">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#930303]">
              {authModalReason === 'checkout' ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#930303]" />
                  <span>Checkout Access</span>
                </>
              ) : authModalReason === 'wishlist' ? (
                <>
                  <Heart className="w-3.5 h-3.5 text-[#930303]" />
                  <span>Saved Wishlist</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>Customer Account</span>
                </>
              )}
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
              {authModalReason === 'checkout'
                ? 'Sign In to Complete Order'
                : authModalReason === 'wishlist'
                ? 'Sign In to Save Wishlist'
                : isLogin
                ? 'Sign In to Your Account'
                : 'Create Customer Account'}
            </h3>

            <p className="font-body text-xs text-stone-500 leading-relaxed">
              {authModalReason === 'checkout'
                ? 'Login or register to proceed to secure checkout & armored delivery.'
                : authModalReason === 'wishlist'
                ? 'Please sign in or create an account to save your favorite jewelry pieces.'
                : isLogin
                ? 'Welcome back. Sign in to access your orders and profile.'
                : 'Register today for festive benefits, wishlist syncing & tracking.'}
            </p>
          </div>

          {/* ✦ 1-CLICK INSTANT DEMO LOGIN ✦ */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F2] border border-gold-300/80 flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-accent text-[10px] font-bold text-stone-800 uppercase tracking-wider">
                  One-Click Demo Account
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-body truncate mt-0.5">
                demo@bljewels.com • Pass: DemoUser123!
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body shadow-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-gold-300" />
              <span>Instant Demo</span>
            </button>
          </div>

          {/* Tab Switcher: Sign In vs New Registration */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-body font-semibold">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                isLogin
                  ? 'bg-white text-[#930303] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-white text-[#930303] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs font-body">
            
            {/* Name (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Phone (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 01234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">Password *</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              <span>
                {isSubmitting
                  ? 'Verifying...'
                  : isLogin
                  ? 'Sign In & Continue'
                  : 'Register & Continue'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Secure Trust Badge */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-body">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
            <span>256-bit Encrypted • 100% Certified 22K (916) Pure Gold</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthModal;

