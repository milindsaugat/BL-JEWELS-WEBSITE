import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Sparkles, User, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      const res = await register({ name, email, password, phone });
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="py-16 bg-pearl min-h-screen flex items-center justify-center">
      <div className="container-bl max-w-md mx-auto">
        
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gold-300 shadow-xl space-y-6">
          
          {/* Top Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-crimson-700 text-gold-300 flex items-center justify-center border border-gold-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-crimson-900">
              {isLogin ? 'Welcome to BL Jewels' : 'Create Your BL Account'}
            </h1>
            <p className="font-body text-xs text-stone-500">
              {isLogin
                ? 'Sign in to access your saved heirlooms & VIP privileges'
                : 'Join our auspicious circle for exclusive festival benefits'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-pearl p-1 rounded-xl border border-border-light text-xs font-body font-semibold">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isLogin ? 'bg-white text-crimson-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isLogin ? 'bg-white text-crimson-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
            {!isLogin && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98200 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-800 hover:to-crimson-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-crimson flex items-center justify-center gap-1.5"
            >
              <span>{isLogin ? 'Sign In to Account' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-stone-500 font-body">
            <span className="flex items-center justify-center gap-1 text-gold-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Confidential & BIS Registered Portal
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

