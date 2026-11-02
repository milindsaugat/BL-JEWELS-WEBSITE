import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@bljewels.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [errorMsg, setErrorMsg] = useState('');

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.message || 'Invalid administrator credentials.');
    }
  };

  const handleInstantDemoLogin = async () => {
    await login('admin@bljewels.com', 'AdminPassword123!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#140E0B] flex items-center justify-center p-4">
      {/* Gold pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A44A_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#1C1410] border border-[#C9A44A]/40 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-white">
        
        {/* Emblem */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white p-2 border-2 border-gold-400 flex items-center justify-center shadow-gold">
            <img
              src="/images/bl-jewels-icon.png"
              alt="BL Jewels Royal Monogram"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-accent text-xl sm:text-2xl font-bold tracking-cinzel text-gold-300">
              BL JEWELS
            </h1>
            <p className="font-accent text-[11px] tracking-[0.25em] text-stone-400 uppercase mt-0.5">
              Executive Portal Authentication
            </p>
          </div>
        </div>

        {/* 1-Click Demo Login */}
        <div className="p-3.5 bg-white/5 border border-gold-400/30 rounded-2xl text-center space-y-2">
          <span className="text-[11px] font-accent uppercase text-gold-300 tracking-wider font-semibold block">
            ✦ Fast Executive Access ✦
          </span>
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-charcoal font-semibold text-xs rounded-xl shadow-gold transition-all"
          >
            One-Click Sign In as Executive Admin
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-body">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-body">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Admin Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Admin Secret Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-crimson-700 hover:bg-crimson-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold tracking-wider transition-all shadow-crimson flex items-center justify-center gap-2 border border-gold-400/40"
          >
            <span>Authorize & Enter Admin Suite</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5 font-body">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
          <span>Restricted to BL Jewels Authorized Personnel Only</span>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-stone-400 hover:text-gold-300 transition-colors">
            ← Return to Customer Storefront
          </Link>
        </div>

      </div>
    </div>
  );
};
