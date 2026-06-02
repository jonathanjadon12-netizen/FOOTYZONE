import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { User, Mail, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AVATAR_OPTIONS = [
  {
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="%23E25E42"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90c0-15 10-25 30-25s30 10 30 25z" fill="white"/></svg>`
  },
  {
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="%233B82F6"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90c0-15 10-25 30-25s30 10 30 25z" fill="white"/></svg>`
  },
  {
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="%2310B981"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90c0-15 10-25 30-25s30 10 30 25z" fill="white"/></svg>`
  },
  {
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="%23F59E0B"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90c0-15 10-25 30-25s30 10 30 25z" fill="white"/></svg>`
  },
  {
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="%238B5CF6"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90c0-15 10-25 30-25s30 10 30 25z" fill="white"/></svg>`
  }
];

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Autofill email query param if coming from Landing page CTA
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Name: must not contain any numbers
    if (/\d/.test(name)) {
      setError('Name should not contain numbers.');
      return;
    }

    // Validate Email: must be in a proper mail format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setLoading(true);

    const res = await signup(name, email, password, selectedAvatar);
    setLoading(false);
    
    if (res.success) {
      navigate('/profiles');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex items-center justify-center p-4 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C84B31]/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A373]/5 rounded-full filter blur-3xl" />

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
            Create Your Account
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
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Your Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/70 rounded-xl border border-stone-200 text-sm focus:border-[#C84B31] focus:bg-white outline-none transition-all text-stone-900 font-semibold"
              />
            </div>
          </div>

          {/* Email Address */}
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
                className="w-full pl-11 pr-4 py-3 bg-white/70 rounded-xl border border-stone-200 text-sm focus:border-[#C84B31] focus:bg-white outline-none transition-all text-stone-900 font-semibold"
              />
            </div>
          </div>

          {/* Profile Avatar Picker */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2.5">Select Profile Avatar</label>
            <div className="flex flex-wrap gap-3 justify-center py-2.5 bg-white/50 rounded-xl border border-stone-200/50 p-3 mb-1">
              {AVATAR_OPTIONS.map((av, idx) => (
                <img 
                  key={idx}
                  src={av.url}
                  alt={`Avatar Option ${idx + 1}`}
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all duration-300 hover:scale-110 shadow-sm ${
                    selectedAvatar === av.url 
                      ? 'border-[#C84B31] scale-110 shadow-md shadow-[#C84B31]/15 ring-2 ring-[#C84B31]/10' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Choose Password</label>
            <div className="relative">
              <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/70 rounded-xl border border-stone-200 text-sm focus:border-[#C84B31] focus:bg-white outline-none transition-all text-stone-900 font-semibold"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/15 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <p className="text-[10px] text-stone-500 mt-6 text-center font-semibold">
          Already have an account? <Link to="/login" className="text-[#C84B31] font-black hover:underline ml-1">Sign in now</Link>
        </p>

        <div className="mt-6 pt-4 border-t border-stone-200/50 flex items-center justify-center gap-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider select-none">
          <span>Made with ❤️ in India</span>
          <span>🇮🇳</span>
        </div>

      </div>
    </div>
  );
}

export default Signup;
