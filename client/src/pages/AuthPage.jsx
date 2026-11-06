import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ShieldCheck, Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AuthPage = () => {
  const [params] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => params.get('tab') !== 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const destination = params.get('next') === 'checkout'
    ? '/checkout'
    : location.state?.from || '/account';

  const { login, register, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (params.get('tab') === 'register') {
      setIsLogin(false);
    } else if (params.get('tab') === 'login') {
      setIsLogin(true);
    }
  }, [params]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(res.message || 'Invalid email or password credentials.');
        }
      } else {
        const res = await register({ name, email, password, phone });
        if (res.success) {
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(res.message || 'Registration could not be completed. Please try again.');
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
      navigate(destination, { replace: true });
    } else {
      setErrorMsg(res.message || 'Unable to sign in with demo credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#FAF7F2] px-4 py-10 sm:py-16 min-h-[calc(100vh-140px)] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto grid md:grid-cols-12 bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xl">
        
        {/* ── Left Column: Royal Heritage Brand Pillar ── */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#930303] via-[#7A0303] to-[#5C0202] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#C9A44A_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-gold-400/40 flex items-center justify-center text-gold-300 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#E6C975]" />
            </div>
            
            <span className="font-accent text-[11px] font-bold text-gold-300 tracking-[0.25em] uppercase block">
              BL Jewels Customer Portal
            </span>
            
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight text-white">
              Purity with Auspiciousness
            </h1>
            
            <p className="font-body text-xs sm:text-sm text-stone-200 leading-relaxed opacity-90">
              Track Blue Dart armored deliveries, access certified BIS 916 hallmark guarantees, and curate your generational wedding trousseau.
            </p>
          </div>

          <div className="relative z-10 pt-8 mt-8 border-t border-white/15 space-y-2 text-xs text-stone-300 font-body">
            <div className="flex items-center gap-2 text-gold-300 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Certified 22K (916) Pure Gold</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Suraksha & Buyback guarantee across all pan-India orders.
            </p>
          </div>
        </div>

        {/* ── Right Column: Sign In / Registration Form ── */}
        <div className="md:col-span-7 p-6 sm:p-10 space-y-5 bg-white flex flex-col justify-center">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#930303]">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Customer Account</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              {isLogin ? 'Sign In to Your Account' : 'Create an Account'}
            </h2>
            <p className="font-body text-xs text-stone-500">
              {isLogin
                ? 'Welcome back. Enter your credentials to manage your jewelry orders.'
                : 'Register today for festive offers, wishlist syncing & tracking.'}
            </p>
          </div>

          {/* ✦ 1-CLICK QUICK DEMO ACCESS ✦ */}
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-gold-300/70 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-accent text-[11px] font-bold text-gold-900 uppercase tracking-wider">
                  One-Click Demo Account
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-body truncate mt-0.5">
                demo@bljewels.com • Pass: DemoUser123!
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-[#930303] hover:bg-[#7A0303] text-white rounded-xl text-xs font-semibold font-body shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-gold-300" />
              <span>One-Click Login</span>
            </button>
          </div>

          {/* Tab Switcher: Sign In vs New Registration */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-body font-semibold">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-[#930303] shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-[#930303] shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-body">
            
            {/* Name (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
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
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
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
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 01234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">Password *</label>
                {isLogin && (
                  <span className="text-[11px] text-stone-400 font-normal">
                    Demo pass: <strong className="text-stone-700 font-mono">DemoUser123!</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-gold-400 focus:bg-white transition-colors"
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

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>
                {isSubmitting
                  ? 'Verifying...'
                  : isLogin
                  ? 'Sign In to Account'
                  : 'Complete Registration'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center text-xs text-stone-500 font-body">
            <Link to="/collections" className="hover:text-stone-900 transition-colors">
              ← Continue Browsing Collections
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AuthPage;
