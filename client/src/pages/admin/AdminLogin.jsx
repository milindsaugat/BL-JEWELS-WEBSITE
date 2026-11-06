import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound, Mail, Lock, X, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'newPassword' | 'success'
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

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

  // Step 1: Request OTP via Google SMTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMsg('');
    setForgotLoading(true);

    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotSuccessMsg(res.message || 'Verification code dispatched to your email.');
        setForgotStep('otp');
      } else {
        setForgotError(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect to email service.';
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await authService.verifyOtp(forgotEmail, otp);
      if (res.success) {
        setForgotStep('newPassword');
      } else {
        setForgotError(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please verify.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await authService.resetPassword(forgotEmail, otp, newPassword);
      if (res.success) {
        setForgotStep('success');
      } else {
        setForgotError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccessMsg('');
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
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@bljewels.com"
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-stone-300 font-semibold">Admin Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                  setForgotStep('email');
                  setForgotError('');
                }}
                className="text-[11px] text-gold-400 hover:text-gold-300 transition-colors font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-gold-300 transition-colors cursor-pointer p-0.5"
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
            className="w-full py-3.5 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 border border-gold-400/40 cursor-pointer"
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

      {/* ── FORGOT PASSWORD MODAL (EMAIL OTP FLOW VIA GOOGLE SMTP) ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#1C1410] border border-[#C9A44A]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white">
            
            {/* Close Modal Button */}
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-gold-400/50 text-gold-300 flex items-center justify-center shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gold-300 font-accent tracking-wide pt-1">
                Admin Password Recovery
              </h2>
              <p className="text-[11px] text-stone-400">
                {forgotStep === 'email' && 'Enter your registered email address to receive a 6-digit OTP verification code.'}
                {forgotStep === 'otp' && `Enter the 6-digit verification code sent to ${forgotEmail}.`}
                {forgotStep === 'newPassword' && 'Create a strong, new password for your administrator account.'}
                {forgotStep === 'success' && 'Password updated successfully!'}
              </p>
            </div>

            {/* Error Message Notice */}
            {forgotError && (
              <div className="p-3 bg-red-950/60 border border-red-500/60 rounded-xl text-red-200 text-xs font-body leading-relaxed">
                {forgotError}
              </div>
            )}

            {/* Success Message Notice */}
            {forgotSuccessMsg && forgotStep === 'otp' && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-body flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {/* ── STEP 1: ENTER EMAIL ── */}
            {forgotStep === 'email' && (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Administrator Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. admin@bljewels.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-charcoal font-bold text-xs rounded-xl shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send 6-Digit OTP Code</span>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 2: ENTER OTP ── */}
            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-center text-lg tracking-[8px] font-mono focus:outline-none focus:border-gold-400"
                  />
                  <span className="block text-[10px] text-stone-400 text-center mt-1">
                    Valid for 10 minutes
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || otp.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-charcoal font-bold text-xs rounded-xl shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={forgotLoading}
                    className="text-[11px] text-stone-400 hover:text-gold-300 transition-colors"
                  >
                    Resend OTP Code
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: NEW PASSWORD ── */}
            {forgotStep === 'newPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">New Password (Min 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-gold-300 p-0.5"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-gold-400"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[#930303] hover:bg-[#7A0303] text-white font-bold text-xs rounded-xl shadow-md shadow-[#930303]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-gold-400/40 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving New Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 4: SUCCESS ── */}
            {forgotStep === 'success' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    Password Reset Successfully!
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Your administrator credentials have been updated. You can now log in with your new password.
                  </p>
                </div>
                <button
                  onClick={closeForgotModal}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Proceed to Login
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
