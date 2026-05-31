import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Mail, Key, Eye, EyeOff, Lock, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';

function AdminLogin() {
  const navigate = useNavigate();
  const { login, verifyMFA, mfaRequired, setMfaRequired } = useApp();

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Errors & Loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Email: must be in a proper mail format if not already in MFA state
    if (!mfaRequired) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    setLoading(true);

    if (mfaRequired) {
      const res = await verifyMFA(mfaCode);
      setLoading(false);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.message || 'Incorrect 2FA code.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (!res.mfa) {
          navigate('/admin');
        }
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex items-center justify-center p-4 relative">
      {/* Dynamic background glow overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C84B31]/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C84B31]/10 rounded-full filter blur-3xl" />

      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-8 border border-stone-200/60 shadow-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/logo.png" 
              alt="FOOTYZONE Logo" 
              className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300 select-none"
            />
            <span className="text-2xl font-black tracking-wider uppercase text-stone-900">
              FOOTYZONE
            </span>
          </div>
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">
            {mfaRequired ? 'Padlock MFA Code Verification' : 'Welcome Back, Football Fan'}
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 rounded-xl p-3 text-xs mb-6 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!mfaRequired ? (
            <>
              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-stone-200 text-sm focus:border-[#C84B31] outline-none transition-all text-stone-900 font-semibold"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-white rounded-xl border border-stone-200 text-sm focus:border-[#C84B31] outline-none transition-all text-stone-900 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#C84B31]/5 border border-[#C84B31]/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3 text-[#C84B31]">
                <Lock size={20} className="box-glow rounded-full animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-wider">MFA Code Verification</span>
              </div>
              
              <p className="text-stone-650 text-xs leading-relaxed font-semibold">
                An active Padlock 2FA is configured for this account. Enter the verification code to authorize your access.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-[#C84B31] uppercase tracking-widest mb-2">6-Digit 2FA Code</label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest font-black py-3 bg-white rounded-xl border border-stone-200 text-lg focus:border-[#C84B31] outline-none transition-all text-stone-900 placeholder-stone-300"
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/15 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mfaRequired ? (
              <>Verify & Enter Console <ShieldCheck size={18} /></>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-stone-200/60 pt-4 text-center">
          <p className="text-[10px] text-stone-500 font-semibold">
            New to FOOTYZONE? <Link to="/signup" className="text-[#C84B31] font-black hover:underline ml-1">Sign up now</Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200/50 flex items-center justify-center gap-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider select-none">
          <span>Made with ❤️ in India</span>
          <span>🇮🇳</span>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
