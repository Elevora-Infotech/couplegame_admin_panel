import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Sparkles, KeyRound, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, verify2FA, resend2FA, cancel2FA, tempAuth } = useAuth();

  // Handle countdown timer for resend code
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    } else if (result.requires2FA) {
      setResendCooldown(30);
    }
    setIsLoading(false);
  };

  // Step 2: 2FA OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const result = await verify2FA(otp);
    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    const result = await resend2FA();
    if (result.success) {
      setInfoMessage(result.message);
      setResendCooldown(30);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-violet-600/20 blur-[150px] rounded-full animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-600/20 blur-[150px] rounded-full animate-float-delayed pointer-events-none"></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="glass-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#030712]/70">
          {/* Subtle shine effect on top edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4 relative group cursor-pointer animate-glow">
              <div className="absolute inset-0 bg-white/20 rounded-3xl translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {tempAuth ? (
                <ShieldCheck className="w-8 h-8 text-white relative z-10" />
              ) : (
                <Sparkles className="w-8 h-8 text-white relative z-10" />
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight text-center">
              {tempAuth ? 'Two-Step Verification' : 'EleVora Admin'}
            </h1>
            <p className="text-violet-300/70 mt-2 text-center text-sm font-medium">
              {tempAuth
                ? `Enter the 6-digit code sent to ${tempAuth.emailMasked}`
                : 'Secure access portal for game operations'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center justify-center font-medium shadow-lg shadow-rose-500/5 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Info Banner */}
          {infoMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center justify-center font-medium shadow-lg shadow-emerald-500/5 animate-in slide-in-from-top-2">
              {infoMessage}
            </div>
          )}

          {/* STEP 1: Email & Password Form */}
          {!tempAuth ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all outline-none"
                    placeholder="admin@elevora.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)] text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] focus:ring-violet-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Continue with Password'
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 6-Digit OTP Form */
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 text-center">
                  6-Digit Verification Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-slate-600 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all outline-none"
                    placeholder="••••••"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Verification codes expire after 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)] text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] focus:ring-emerald-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Verify & Access Dashboard'
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <button
                  type="button"
                  onClick={cancel2FA}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    resendCooldown > 0
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-violet-400 hover:text-violet-300'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
