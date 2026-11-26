import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  RotateCw,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import OtpInput from '../components/common/OtpInput';

export const AuthPage = () => {
  const [params] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => params.get('tab') !== 'register');
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

  // OTP Verification state (for Registration & Login)
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('login'); // 'login' | 'register'
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Password flow state
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [serverForgotOtp, setServerForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const destination = params.get('next') === 'checkout'
    ? '/checkout'
    : location.state?.from || '/account';

  const {
    login,
    initiateRegister,
    verifyLoginOtp,
    verifyRegisterOtp,
    resendAuthOtp,
    isAuthenticated,
  } = useAuthStore();

  useEffect(() => {
    if (params.get('tab') === 'register') {
      setIsLogin(false);
      setStep('form');
    } else if (params.get('tab') === 'login') {
      setIsLogin(true);
      setStep('form');
    }
  }, [params]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  // 60-Second Cooldown Countdown Timers
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

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
          setServerOtp(res.otp || '');
          setInfoMsg(res.message || `A 6-digit verification code has been dispatched to ${res.email || email}.`);
          setResendCooldown(60);
          setOtp('');
        } else if (res.success) {
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(res.message || 'Invalid email or password credentials.');
        }
      } else {
        const res = await initiateRegister({ name, email, password, phone });
        if (res.requireOtp) {
          setStep('otp');
          setOtpPurpose('register');
          setOtpEmail(res.email || email);
          setServerOtp(res.otp || '');
          setInfoMsg(res.message || `A 6-digit verification code has been dispatched to ${res.email || email}.`);
          setResendCooldown(60);
          setOtp('');
        } else if (res.success) {
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
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(res.message || 'Invalid verification code. Please check and try again.');
        }
      } else {
        const res = await verifyLoginOtp(otpEmail, otp.trim());
        if (res.success) {
          navigate(destination, { replace: true });
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
        if (res.otp || res.demoOtp) setServerOtp(res.otp || res.demoOtp);
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

  // ✦ FORGOT PASSWORD HANDLERS ✦
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
        setServerForgotOtp(res.otp || res.demoOtp || '');
        setNewPassword('');
        setConfirmPassword('');
        setInfoMsg(res.message || `A 6-digit password reset code has been sent to ${cleanForgotEmail}.`);
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

        {/* ── Right Column: Sign In / Registration / OTP / Forgot Password View ── */}
        <div className="md:col-span-7 p-6 sm:p-10 space-y-5 bg-white flex flex-col justify-center">
          
          {step === 'forgot' ? (
            /* ========================================================================= */
            /* ✦ FORGOT PASSWORD VIEW (OTP PROTECTED) ✦                                  */
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
                <div className="w-10 h-10 rounded-2xl bg-[#930303]/10 border border-[#930303]/20 flex items-center justify-center text-[#930303] mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                  {forgotStep === 'request' ? 'Reset Your Password' : 'Create New Password'}
                </h2>
                <p className="font-body text-xs text-stone-600 leading-relaxed">
                  {forgotStep === 'request'
                    ? 'Enter your registered email address to receive a secure 6-digit verification code.'
                    : `Enter the 6-digit verification code sent to ${forgotEmail || email} and choose a new password.`}
                </p>
              </div>

              {/* Status Notice */}
              {infoMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {forgotStep === 'request' ? (
                /* Sub-step 1: Email Request */
                <form onSubmit={handleForgotRequestOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Registered Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your registered email"
                        value={forgotEmail || email}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setEmail(e.target.value);
                        }}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-gold-400 focus:bg-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Sub-step 2: OTP Verification & New Password */
                <form onSubmit={handleForgotResetPassword} className="space-y-4">
                  {serverForgotOtp && (
                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-center space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Password Reset OTP</span>
                      </div>
                      <div className="text-2xl font-mono font-black text-[#930303] tracking-[0.25em] bg-white py-1 px-3 rounded-lg border border-amber-200 inline-block shadow-inner select-all">
                        {serverForgotOtp}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setForgotOtp(serverForgotOtp)}
                          className="px-3 py-1 bg-[#930303] hover:bg-[#7A0303] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          ⚡ Auto-Fill OTP
                        </button>
                      </div>
                    </div>
                  )}

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
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-gold-400 focus:bg-white text-xs transition-colors"
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
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-gold-400 focus:bg-white text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || forgotOtp.length < 6}
                    className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password & Return to Login</span>
                        <ArrowRight className="w-4 h-4" />
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
            /* ✦ STEP 2: 6-DIGIT EMAIL OTP VERIFICATION VIEW (SIGN IN / REGISTER) ✦     */
            /* ========================================================================= */
            <div className="space-y-5 animate-in fade-in duration-200">
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

              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-[#930303]/10 border border-[#930303]/20 flex items-center justify-center text-[#930303] mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                  {otpPurpose === 'register' ? 'Verify Your Email' : 'Two-Factor Verification'}
                </h2>
                <p className="font-body text-xs text-stone-600 leading-relaxed">
                  We have sent a 6-digit verification code to{' '}
                  <strong className="text-stone-900 font-semibold">{otpEmail}</strong>.
                  Please enter it below to proceed:
                </p>
              </div>

              {/* Status / Success Banner */}
              {infoMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-body flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {serverOtp && (
                  <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-center space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verification OTP Code</span>
                    </div>
                    <div className="text-3xl font-mono font-black text-[#930303] tracking-[0.25em] bg-white py-1 px-4 rounded-xl border border-amber-200 inline-block shadow-inner select-all">
                      {serverOtp}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setOtp(serverOtp)}
                        className="px-3.5 py-1.5 bg-[#930303] hover:bg-[#7A0303] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        ⚡ Auto-Fill OTP
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    autoFocus
                  />
                  <p className="text-[11px] text-stone-400 text-center mt-2.5">
                    Code expires in 10 minutes. Check spam folder if not received.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length < 6}
                  className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {otpPurpose === 'register'
                          ? 'Verify & Complete Registration'
                          : 'Verify & Sign In'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend Cooldown Section */}
                <div className="pt-2 text-center">
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
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span>Customer Account</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                  {isLogin ? 'Sign In to Your Account' : 'Create an Account'}
                </h2>
                <p className="font-body text-xs text-stone-500">
                  {isLogin
                    ? 'Welcome back. Enter your credentials to manage your jewelry orders.'
                    : 'Register today with instant email verification for festive offers & tracking.'}
                </p>
              </div>

              {/* Status / Success Banner */}
              {infoMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Tab Switcher: Sign In vs New Registration */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-body font-semibold">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setErrorMsg(''); setInfoMsg(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    isLogin
                      ? 'bg-white text-[#930303] shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setErrorMsg(''); setInfoMsg(''); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
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
                        placeholder="Enter your full name"
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
                      placeholder="Enter your email address"
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
                        placeholder="Enter your mobile number"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* ✦ FORGOT PASSWORD LINK ✦ */}
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

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-50 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isLogin ? 'Sign In with Email OTP' : 'Send Verification OTP'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Navigation */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-center text-xs text-stone-500 font-body">
                <Link to="/collections" className="hover:text-stone-900 transition-colors">
                  ← Continue Browsing Collections
                </Link>
              </div>
            </>
          )}

        </div>

      </div>
    </section>
  );
};

export default AuthPage;
