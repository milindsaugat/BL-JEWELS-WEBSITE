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
  ShieldCheck,
  KeyRound,
  RotateCw,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { authService } from '../../services/api';
import OtpInput from './OtpInput';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalReason, authModalData } = useUIStore();
  const {
    login,
    initiateRegister,
    verifyLoginOtp,
    verifyRegisterOtp,
    resendAuthOtp,
    toggleWishlist,
  } = useAuthStore();
  const { closeDrawer } = useCartStore();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View state: 'form' | 'otp' | 'forgot'
  const [step, setStep] = useState('form');

  // OTP Verification state
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('login'); // 'login' | 'register'
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Password flow state
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Reset state on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setInfoMsg('');
      setStep('form');
      setOtp('');
      setForgotStep('request');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPassword('');
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

  // 60-second cooldown timer for Auth OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 60-second cooldown timer for Forgot Password OTP
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

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
    setInfoMsg('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.requireOtp) {
          setStep('otp');
          setOtpPurpose('login');
          setOtpEmail(res.email || email);
          setInfoMsg(res.message || `A 6-digit verification code has been dispatched to ${res.email || email}.`);
          setResendCooldown(60);
          setOtp('');
        } else if (res.success) {
          await handlePostAuthSuccess();
        } else {
          setErrorMsg(res.message || 'Invalid email or password credentials.');
        }
      } else {
        const res = await initiateRegister({ name, email, password, phone });
        if (res.requireOtp) {
          setStep('otp');
          setOtpPurpose('register');
          setOtpEmail(res.email || email);
          setInfoMsg(res.message || `A 6-digit verification code has been dispatched to ${res.email || email}.`);
          setResendCooldown(60);
          setOtp('');
        } else if (res.success) {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (otpPurpose === 'register') {
        const res = await verifyRegisterOtp(otpEmail, otp.trim());
        if (res.success) {
          await handlePostAuthSuccess();
        } else {
          setErrorMsg(res.message || 'Invalid verification code. Please check and try again.');
        }
      } else {
        const res = await verifyLoginOtp(otpEmail, otp.trim());
        if (res.success) {
          await handlePostAuthSuccess();
        } else {
          setErrorMsg(res.message || 'Invalid verification code. Please check and try again.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await resendAuthOtp(otpEmail, otpPurpose);
      if (res.success) {
        setInfoMsg(res.message || `A fresh 6-digit verification code has been sent to ${otpEmail}.`);
        setResendCooldown(60);
      } else {
        setErrorMsg(res.message || 'Could not resend code. Please try again later.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✦ FORGOT PASSWORD HANDLERS (MODAL) ✦
  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    const cleanForgotEmail = String(forgotEmail || email).trim().toLowerCase();
    if (!cleanForgotEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');
    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword(cleanForgotEmail);
      if (res.success) {
        setForgotStep('reset');
        setForgotCooldown(60);
        setForgotOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setInfoMsg(res.message || `A 6-digit reset code has been sent to ${cleanForgotEmail}.`);
      } else {
        setErrorMsg(res.message || 'No registered account found with this email.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');
    setIsSubmitting(true);

    try {
      const cleanForgotEmail = String(forgotEmail || email).trim().toLowerCase();
      const res = await authService.resetPassword(cleanForgotEmail, forgotOtp.trim(), newPassword);
      if (res.success) {
        setStep('form');
        setIsLogin(true);
        setEmail(cleanForgotEmail);
        setPassword(newPassword);
        setInfoMsg('Password updated successfully! Please sign in with your new password.');
        setErrorMsg('');
        toast.success('Password updated successfully! Please sign in.');
      } else {
        setErrorMsg(res.message || 'Failed to reset password. Please check your verification code.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to reset password. Please check your code.');
    } finally {
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
          
          {step === 'forgot' ? (
            /* ========================================================================= */
            /* ✦ FORGOT PASSWORD VIEW (MODAL) ✦                                          */
            /* ========================================================================= */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <div className="space-y-1">
                <div className="w-9 h-9 rounded-2xl bg-[#930303]/10 border border-[#930303]/20 flex items-center justify-center text-[#930303] mb-1.5">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                  {forgotStep === 'request' ? 'Reset Your Password' : 'Create New Password'}
                </h3>
                <p className="font-body text-xs text-stone-600 leading-relaxed">
                  {forgotStep === 'request'
                    ? 'Enter your registered email to receive a 6-digit password reset code.'
                    : `Enter the code sent to ${forgotEmail || email} and set a new password.`}
                </p>
              </div>

              {/* Status Notice */}
              {infoMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {forgotStep === 'request' ? (
                /* Sub-step 1: Email Request */
                <form onSubmit={handleForgotRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Registered Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your registered email"
                        value={forgotEmail || email}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setEmail(e.target.value);
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Sub-step 2: OTP Verification & New Password */
                <form onSubmit={handleForgotResetPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Enter 6-Digit Reset Code *
                    </label>
                    <OtpInput
                      value={forgotOtp}
                      onChange={setForgotOtp}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      New Password (Min 6 Characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-gold-400 focus:bg-white text-xs transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-gold-400 focus:bg-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || forgotOtp.length < 6}
                    className="w-full py-2.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    {forgotCooldown > 0 ? (
                      <span className="text-xs text-stone-400 font-body">
                        Resend code in <strong className="font-mono text-stone-700">{forgotCooldown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotRequestOtp}
                        disabled={isSubmitting}
                        className="text-xs font-semibold text-[#930303] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Didn't receive code? Resend Reset Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : step === 'otp' ? (
            /* ========================================================================= */
            /* ✦ STEP 2: 6-DIGIT EMAIL OTP VERIFICATION VIEW ✦                           */
            /* ========================================================================= */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                  setOtp('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {otpPurpose === 'register' ? 'Registration' : 'Sign In'}</span>
              </button>

              <div className="space-y-1">
                <div className="w-9 h-9 rounded-2xl bg-[#930303]/10 border border-[#930303]/20 flex items-center justify-center text-[#930303] mb-1.5">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                  {otpPurpose === 'register' ? 'Verify Your Email' : 'Enter Verification Code'}
                </h3>
                <p className="font-body text-xs text-stone-600 leading-relaxed">
                  We sent a 6-digit verification code to{' '}
                  <strong className="text-stone-900 font-semibold">{otpEmail}</strong>:
                </p>
              </div>

              {/* Status / Success Banner */}
              {infoMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    autoFocus
                  />
                  <p className="text-[10px] text-stone-400 text-center mt-2">
                    Valid for 10 minutes. Check your spam folder if not found.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length < 6}
                  className="w-full py-2.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {otpPurpose === 'register'
                          ? 'Verify & Complete Registration'
                          : 'Verify & Sign In'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Resend Cooldown */}
                <div className="pt-1 text-center">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-stone-400 font-body">
                      Resend code in <strong className="font-mono text-stone-700">{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting}
                      className="text-xs font-semibold text-[#930303] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Didn't receive the code? Resend Code
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* ✦ STEP 1: CREDENTIALS / FORM VIEW ✦                                       */
            /* ========================================================================= */
            <>
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
                    : 'Register today with email OTP verification for festive benefits & tracking.'}
                </p>
              </div>

              {/* Status / Success Banner */}
              {infoMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Tab Switcher: Sign In vs New Registration */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-body font-semibold">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setErrorMsg(''); setInfoMsg(''); }}
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
                  onClick={() => { setIsLogin(false); setErrorMsg(''); setInfoMsg(''); }}
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
                        placeholder="Enter your full name"
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
                      placeholder="Enter your email address"
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
                        placeholder="Enter your mobile number"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* ✦ FORGOT PASSWORD LINK IN MODAL ✦ */}
                  {isLogin && (
                    <div className="flex justify-end pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStep('forgot');
                          setForgotEmail(email);
                          setForgotStep('request');
                          setForgotOtp('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setErrorMsg('');
                          setInfoMsg('');
                        }}
                        className="text-[11px] font-semibold text-[#930303] hover:underline cursor-pointer transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isLogin
                          ? 'Sign In with Email OTP'
                          : 'Send Verification OTP'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Secure Trust Badge */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-body">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>256-bit Encrypted • 100% Certified 22K (916) Pure Gold</span>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthModal;
