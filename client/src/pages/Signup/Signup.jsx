import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { User, Mail, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AVATAR_OPTIONS = [
  {
    url: 'https://imgs.search.brave.com/O3uxkwM6KSSb5biG3U8CN06PSAUpOa7reCQtWyKH4Xg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hdmF0/YXJmaWxlcy5hbHBo/YWNvZGVycy5jb20v/Mzc1L3RodW1iLTM1/MC0zNzUxODgud2Vi/cA'
  },
  {
    url: 'https://imgs.search.brave.com/Ki2zUi_0AchRdHLzMxTpHcd8PtvnaE4KFzNz7GKPpo0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hdmF0/YXJmaWxlcy5hbHBo/YWNvZGVycy5jb20v/Mzc0L3RodW1iLTM1/MC0zNzQ4MDAud2Vi/cA'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Neymar_%28cropped%29.jpg'
  },
  {
    url: 'https://imgs.search.brave.com/vbpv2GbSqTmZOIVqxoDujLH6uc3jzeeemuUeOnbvDF0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjIx/ODgyNDg5My9waG90/by9zdHV0dGdhcnQt/Z2VybWFueS1sYW1p/bmUteWFtYWwtb2Yt/c3BhaW4tcG9zZXMt/Zm9yLWEtcGhvdG8t/d2l0aC1oaXMtY2Fy/bHNiZXJnLXBsYXll/ci1vZi10aGUuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPVVt/NHNqMDhhUGVqc1dY/dEhXRXhrR05IT0po/b1JpRHhHSHZuWnRx/SUVldkU9'
  },
  {
    url: 'https://imgs.search.brave.com/uv4iDA7-nVOOh40LUGHut3sOObN22t_2ONNlQxL1UGY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjI2/NDgxMzExMi9waG90/by9iaXJtaW5naGFt/LWVuZ2xhbmQtam9h/by1wZWRyby1vZi1j/aGVsc2VhLWNlbGVi/cmF0ZXMtc2Nvcmlu/Zy1oaXMtdGVhbXMt/Zm91cnRoLWdvYWwt/YW5kLWhpcy1oYXQu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWREUXhDTmF1QjZk/MHJjd3VsY0x3UjQ2/Qzk2OEJZY25RVWpH/REQ4M1l4MVk9'
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
      navigate('/profiles?new=true');
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
