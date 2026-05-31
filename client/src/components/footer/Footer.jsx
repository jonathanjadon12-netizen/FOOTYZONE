import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Shield, FileText, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const { isAuthenticated } = useApp();

  const modalData = {
    help: {
      title: "Help Center & Support",
      icon: <HelpCircle className="text-[#C84B31] w-8 h-8" />,
      desc: "Welcome to the FOOTYZONE Help Center! Here's how to get the most out of your free platform:\n\n• WATCH PARTIES: Click the party icon next to the video playhead, enter a room name, and share it with friends to synchronize play/pause, speeds, and live emoji reactions!\n• CLOUD STREAMING: Administrators can access the Admin Dashboard to drag and upload custom match video assets directly via Cloudinary.\n• KIDS MODE: Toggle the 'Kids Profile' checkmark when creating/editing a viewer profile to filter out PG-13 and mature match content automatically."
    },
    terms: {
      title: "Terms of Streaming Use",
      icon: <FileText className="text-[#C84B31] w-8 h-8" />,
      desc: "By streaming on FOOTYZONE, you agree to the following cooperative MERN fair-use guidelines:\n\n• All premium-level 4K HD catalog streams, synchronized watch synchronize chat drawers, and playhead progress saves are offered 100% free of charge.\n• Device sessions are capped at 4 concurrent screens max per account to maintain healthy bandwidth.\n• You may not scrape, pirate, or commercialize any broadcast segments seeded on the platform."
    },
    privacy: {
      title: "Privacy Statement",
      icon: <Shield className="text-[#C84B31] w-8 h-8" />,
      desc: "We prioritize your soccer-viewing privacy. Here's exactly how we manage user data:\n\n• SECURITY: Active user passwords are encrypted using industry-standard salted bcrypt hashing, and concurrent logins are securely tracked via JWT tokens.\n• PERSONALIZATION: Watch history, watchlist bookmarks, and profile preferences are stored strictly inside our MongoDB cluster to improve your custom feed.\n• NO ADVERTISING: We do not sell user profiles or tracking metrics to third-party ad networks. Stream with total peace of mind."
    }
  };

  return (
    <footer className="bg-[#EFECE5] border-t border-stone-200/60 py-12 px-4 sm:px-6 lg:px-8 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <Link 
            to={isAuthenticated ? "/browse" : "/login"}
            className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <img 
              src="/logo.png" 
              alt="FOOTYZONE Logo" 
              className="h-10 w-auto object-contain hover:brightness-105 transition-all duration-300 select-none"
            />
            <span className="text-lg font-black tracking-wider uppercase text-stone-900 select-none">
              FOOTYZONE
            </span>
          </Link>
          <p className="text-xs text-stone-500 mt-1 font-medium select-none">© {new Date().getFullYear()} FOOTYZONE Inc. Premium Football Streaming.</p>
          <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2 select-none">
            <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">Proudly Made in India</span>
            <span className="text-xs">🇮🇳</span>
          </div>
        </div>
        
        {/* Interactive Functional Footer Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-6">
          <Link to="/browse" className="text-xs text-stone-600 hover:text-[#C84B31] transition-colors font-bold uppercase tracking-wider">Browse</Link>
          
          <span className="text-xs text-stone-300 hidden sm:inline">|</span>

          <button 
            onClick={() => setActiveModal('help')}
            className="text-xs text-stone-600 hover:text-[#C84B31] transition-colors font-bold uppercase tracking-wider cursor-pointer"
          >
            Help Center
          </button>
          
          <button 
            onClick={() => setActiveModal('terms')}
            className="text-xs text-stone-600 hover:text-[#C84B31] transition-colors font-bold uppercase tracking-wider cursor-pointer"
          >
            Terms of Use
          </button>

          <button 
            onClick={() => setActiveModal('privacy')}
            className="text-xs text-stone-600 hover:text-[#C84B31] transition-colors font-bold uppercase tracking-wider cursor-pointer"
          >
            Privacy Statement
          </button>
        </div>
      </div>

      {/* Description Modal Overlay */}
      {activeModal && modalData[activeModal] && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors p-1.5 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-2 bg-[#C84B31]/10 rounded-xl">
                {modalData[activeModal].icon}
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-stone-900">
                {modalData[activeModal].title}
              </h3>
            </div>

            {/* Modal Content / Description */}
            <p className="text-xs text-stone-600 leading-relaxed font-semibold whitespace-pre-line bg-stone-50 border border-stone-200 p-5 rounded-2xl shadow-inner max-h-[60vh] overflow-y-auto">
              {modalData[activeModal].desc}
            </p>

            {/* Close action */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-[#C84B31] text-white hover:bg-[#A83D27] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
}

export default Footer;
