import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { ChevronRight, ShieldCheck, Film, Monitor, Tv, Play } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [emailInput, setEmailInput] = useState('');

  const handleCTA = (e) => {
    e.preventDefault();
    if (emailInput) {
      navigate(`/signup?email=${emailInput}`);
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col relative overflow-hidden">
      
      {/* 1. Cinematic Background Autoplay Hero Trailer (Beige Overlay Blended) */}
      <div className="absolute inset-0 z-0 h-[85vh] md:h-screen w-full opacity-20 select-none pointer-events-none mix-blend-multiply">
        <ReactPlayer 
          url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          playing
          loop
          muted
          width="100%"
          height="100%"
          className="absolute inset-0 object-cover scale-110"
          config={{ file: { attributes: { style: { objectFit: 'cover', width: '100%', height: '100%' } } } }}
        />
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="absolute inset-0 hero-left-gradient-overlay" />
      </div>

      {/* 2. Floating Navbar */}
      <header className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(isAuthenticated ? '/browse' : '/login')}
        >
          <img 
            src="/logo.png" 
            alt="FOOTYZONE Logo" 
            className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300 select-none"
          />
          <span className="text-2xl font-black tracking-wider uppercase text-stone-900">
            FOOTYZONE
          </span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-[#C84B31] text-white text-xs font-black rounded-xl shadow-lg shadow-[#C84B31]/15 hover:bg-[#A83D27] active:scale-95 transition-all uppercase tracking-widest"
        >
          Sign In
        </button>
      </header>

      {/* 3. Hero Content Block */}
      <main className="relative z-10 flex-grow flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto pt-24 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5 select-none">
          <span className="px-3 py-1 bg-[#C84B31]/10 text-[#C84B31] text-[10px] sm:text-xs font-black tracking-widest border border-[#C84B31]/20 rounded-full uppercase animate-pulse">
            Football Streaming Redefined
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] sm:text-xs font-black tracking-widest border border-emerald-500/20 rounded-full uppercase flex items-center gap-1.5 shadow-sm shadow-emerald-500/5">
            Proudly Made in India <span className="text-xs">🇮🇳</span>
          </span>
        </div>
        
        <h2 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight uppercase text-stone-900">
          Unlimited Matches, Football Shows, and <span className="text-[#C84B31] neon-glow">Exclusive Originals</span>
        </h2>
        
        <p className="text-sm sm:text-lg text-stone-600 mt-6 max-w-2xl leading-relaxed">
          Watch anywhere, stream on multiple screens simultaneously. Premium 4K HDR quality.
        </p>

        {/* CTA Email fields */}
        <form onSubmit={handleCTA} className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-lg">
          <input 
            type="email"
            placeholder="Enter your email address"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="flex-grow px-5 py-4 bg-white/80 backdrop-blur-md rounded-xl border border-stone-300 text-sm focus:border-[#C84B31] focus:bg-white outline-none text-stone-900 transition-all shadow-md placeholder-stone-400 font-semibold"
          />
          <button 
            type="submit"
            className="px-8 py-4 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C84B31]/15 transition-all active:scale-95 shrink-0"
          >
            Get Started <ChevronRight size={18} />
          </button>
        </form>
      </main>

      {/* 4. Product Highlight Badges Section */}
      <section className="relative z-10 bg-[#EFECE5] border-t border-stone-200/80 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] mb-4">
              <Tv size={24} />
            </div>
            <h4 className="text-md font-bold uppercase tracking-wider text-stone-900">Watch on your TV</h4>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed font-medium">
              Stream on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more devices.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] mb-4">
              <Monitor size={24} />
            </div>
            <h4 className="text-md font-bold uppercase tracking-wider text-stone-900">Stream Everywhere</h4>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed font-medium">
              Watch unlimited matches and football shows on your phone, tablet, laptop, and television screens.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-md font-bold uppercase tracking-wider text-stone-900">Parental Gate Control</h4>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed font-medium">
              Set age restrictions and secure kids profiles to lock mature ratings behind numerical credentials.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Landing;
