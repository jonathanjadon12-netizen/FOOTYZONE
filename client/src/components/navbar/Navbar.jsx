import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Search, Film, CreditCard, LogOut, ChevronDown, Monitor, Menu, X, Sun, Moon } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeProfile, logout, isAuthenticated } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Sync theme on mount
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <nav className={`mx-auto max-w-7xl w-full pointer-events-auto transition-all duration-300 rounded-2xl border bg-[#F7F4EF] border-stone-300/65 shadow-md flex flex-col relative ${
        isScrolled ? 'py-2.5 px-4 sm:px-6 shadow-lg shadow-stone-900/5' : 'py-3.5 px-4 sm:px-6'
      }`}>
        <div className="flex items-center justify-between w-full">
        
        {/* Left Section: Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <Link to={isAuthenticated ? "/browse" : "/login"} className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="FOOTYZONE Logo" 
              className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition-transform duration-300 select-none bg-[#F7F4EF]"
            />
            <span className="text-lg sm:text-xl font-black tracking-wider uppercase text-stone-900 select-none">
              FOOTYZONE
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/browse" 
              className={`text-sm font-semibold transition-colors ${location.pathname === '/browse' ? 'text-[#C84B31] font-bold' : 'text-stone-600 hover:text-[#C84B31]'}`}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className={`text-sm font-semibold transition-colors ${location.pathname === '/explore' ? 'text-[#C84B31] font-bold' : 'text-stone-600 hover:text-[#C84B31]'}`}
            >
              Explore
            </Link>
          </div>
        </div>

        {/* Right Section: Actions & Profiles */}
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Theme Mode Toggle Trigger */}
          <button 
            onClick={toggleTheme}
            className="text-stone-600 hover:text-[#C84B31] transition-colors p-2 rounded-full hover:bg-stone-200/50 cursor-pointer flex items-center justify-center outline-none"
            aria-label="Toggle Theme Mode"
          >
            {darkMode ? <Sun size={19} className="text-amber-500 animate-pulse" /> : <Moon size={19} className="text-[#C84B31]" />}
          </button>

          {/* Quick Search Trigger */}
          <Link to="/search" className="text-stone-600 hover:text-[#C84B31] transition-colors p-2 rounded-full hover:bg-stone-200/50">
            <Search size={19} />
          </Link>

          {/* User Profile Panel Dropdown */}
          {activeProfile && (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="group outline-none cursor-pointer flex items-center"
              >
                <img 
                  src={activeProfile.avatar} 
                  alt={activeProfile.profileName} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeProfile.profileName || 'User')}`;
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md object-cover border border-stone-200 group-hover:border-[#C84B31] transition-colors"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl py-2 shadow-2xl animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-stone-200/40 mb-1">
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Active Profile</p>
                    <p className="text-sm font-black text-stone-900 mt-0.5 truncate">{activeProfile.profileName}</p>

                  </div>

                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:text-stone-950 hover:bg-stone-200/50 transition-colors"
                    >
                      <Monitor size={15} className="text-[#C84B31]" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <Link 
                    to="/profiles" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:text-stone-950 hover:bg-stone-200/50 transition-colors"
                  >
                    <ChevronDown size={15} className="text-stone-500" />
                    <span>Switch Profile</span>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-stone-600 hover:text-[#C84B31] transition-colors p-2 rounded-full hover:bg-stone-200/50 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Links Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F4EF] border-b border-stone-200/60 px-4 py-4 space-y-2 shadow-md animate-fade-in">
          <Link 
            to="/browse" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors ${
              location.pathname === '/browse' ? 'bg-[#C84B31]/10 text-[#C84B31]' : 'text-stone-700 hover:bg-stone-100 hover:text-[#C84B31]'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/explore" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors ${
              location.pathname === '/explore' ? 'bg-[#C84B31]/10 text-[#C84B31]' : 'text-stone-700 hover:bg-stone-100 hover:text-[#C84B31]'
            }`}
          >
            Explore
          </Link>
        </div>
      )}
      </nav>
    </div>
  );
}

export default Navbar;
