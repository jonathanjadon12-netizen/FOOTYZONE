import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Plus, Trash2, Smile, Lock, HelpCircle, X } from 'lucide-react';

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

function Profiles() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, selectProfile, addProfile, deleteProfile } = useApp();

  // Create Mode states
  const [isCreating, setIsCreating] = useState(searchParams.get('new') === 'true');
  const [profileName, setProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleSelect = (profile) => {
    selectProfile(profile);
    navigate('/browse');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!profileName) return;
    setLoading(true);
    const res = await addProfile(profileName, selectedAvatar, false);
    setLoading(false);
    
    if (res.success) {
      setIsCreating(false);
      setProfileName('');
    } else {
      alert(res.error);
    }
  };

  const handleDelete = (id) => {
    deleteProfile(id);
  };

  const profilesList = user?.profiles || [];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col items-center justify-center p-6">
      
      {!isCreating ? (
        <div className="max-w-4xl text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/logo.png" 
              alt="FOOTYZONE Logo" 
              className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-300 select-none"
            />
            <span className="text-4xl font-black tracking-wider uppercase text-stone-900">
              FOOTYZONE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-10 select-none text-stone-900">
            Who is watching?
          </h2>

          {/* Profiles Grid */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {profilesList.map((p) => (
              <div 
                key={p._id}
                onClick={() => handleSelect(p)}
                className="group flex flex-col items-center cursor-pointer relative"
              >
                <div className="relative">
                  <img 
                    src={p.avatar} 
                    alt={p.profileName} 
                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl border-2 border-transparent group-hover:border-[#C84B31] transition-all shadow-xl group-hover:scale-105"
                  />
                  {/* Avatar card select */}
                </div>

                <span className="mt-4 text-sm font-black text-stone-600 group-hover:text-stone-900 transition-colors">
                  {p.profileName}
                </span>

                {/* Profile Delete controls */}
                {profilesList.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(p._id);
                    }}
                    className="absolute -top-2.5 -right-2.5 p-2 bg-white hover:bg-[#C84B31] hover:text-white text-stone-600 rounded-full border border-stone-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}

            {/* Add Profile CTA card */}
            {profilesList.length < 5 && (
              <button 
                onClick={() => setIsCreating(true)}
                className="group flex flex-col items-center cursor-pointer bg-transparent border-0"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-stone-200/40 group-hover:bg-stone-200/70 rounded-xl border-2 border-dashed border-stone-300 group-hover:border-stone-500 flex items-center justify-center transition-all shadow-sm group-hover:scale-105">
                  <Plus size={36} className="text-stone-400 group-hover:text-stone-850 transition-colors" />
                </div>
                <span className="mt-4 text-sm font-black text-stone-500 group-hover:text-stone-900 transition-colors">
                  Add Profile
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Create Profile Modal */
        <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-stone-200/60 shadow-xl">
          <h3 className="text-xl font-black uppercase tracking-wider text-stone-900 mb-6">Create Sub-Profile</h3>
          
          <form onSubmit={handleCreate} className="space-y-6">
            
            {/* Profile Avatar Selection Options */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Choose Avatar</label>
              <div className="flex flex-wrap gap-4 justify-center mb-4">
                {AVATAR_OPTIONS.map((av) => (
                  <img 
                    key={av.url}
                    src={av.url}
                    alt="profile avatar option"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`w-14 h-14 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                      selectedAvatar === av.url ? 'border-[#C84B31] scale-110 shadow-lg shadow-[#C84B31]/20' : 'border-transparent hover:scale-105 opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Profile Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Profile Name</label>
              <input 
                type="text"
                required
                maxLength={15}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 rounded-xl border border-stone-200 text-sm focus:border-[#C84B31] outline-none text-stone-900 font-semibold transition-all"
              />
            </div>

            {/* Profile ready trigger */}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-grow py-3 bg-stone-100 hover:bg-stone-200/80 text-stone-850 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-stone-300 cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={loading}
                className="flex-grow py-3 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                {loading ? 'Creating...' : 'Save Profile'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 3. CUSTOM CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm bg-[#F7F4EF] border border-stone-300 rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/60 bg-[#C84B31] text-white">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 size={14} /> FOOTYZONE SAYS
              </h3>
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs font-semibold text-stone-700">
              <p className="text-sm font-bold text-stone-850">
                Are you sure you want to delete? Once deleted, it cannot be brought back.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-150 hover:bg-stone-200 text-stone-800 transition-all uppercase text-[10px] font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#C84B31] hover:bg-[#A83D27] text-white transition-all uppercase text-[10px] font-black cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profiles;
