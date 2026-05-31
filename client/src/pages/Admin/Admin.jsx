import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../../contexts/AppContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { Users, Video, IndianRupee, Clock, Plus, BarChart2, ShieldCheck, Film, Search, Trash2, Edit3, Calendar, X } from 'lucide-react';

function Admin() {
  const { fetchCatalog } = useApp();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [videoURL, setVideoURL] = useState('');
  const [poster, setPoster] = useState(''); // Custom Thumbnail URL state
  const [cast, setCast] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('PG-13');
  const [releaseYear, setReleaseYear] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Catalog Management States
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesSearch, setMatchesSearch] = useState('');

  // Edit modal details
  const [editingMatch, setEditingMatch] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editGenres, setEditGenres] = useState('');
  const [editVideoURL, setEditVideoURL] = useState('');
  const [editPoster, setEditPoster] = useState(''); // Custom edit poster state
  const [editDuration, setEditDuration] = useState('');
  const [editReleaseYear, setEditReleaseYear] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/analytics');
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setMatchesLoading(true);
    try {
      const res = await axios.get('/api/admin/matches');
      setMatches(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch matches catalog:", err);
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchMatches();
  }, []);

  // Auto-detect video duration from video URL
  useEffect(() => {
    if (!videoURL || !videoURL.trim()) return;

    try {
      new URL(videoURL);
    } catch (_) {
      return; // Not a valid URL yet
    }

    const video = document.createElement('video');
    video.src = videoURL;
    video.preload = 'metadata';

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        const durationInMinutes = Math.round(video.duration / 60);
        setDuration(durationInMinutes.toString());
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoURL]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccessMsg('');
    try {
      await axios.post('/api/admin/upload', {
        title,
        description,
        genres,
        videoURL,
        poster, // Send custom thumbnail URL to backend
        cast,
        duration,
        rating,
        releaseYear,
        isOriginal
      });
      setSuccessMsg('Football match content successfully saved and seeder added inside MongoDB Atlas database!');
      
      // Clear fields
      setTitle('');
      setDescription('');
      setGenres('');
      setVideoURL('');
      setPoster('');
      setCast('');
      setDuration('');
      setReleaseYear('');
      setIsOriginal(false);
      
      // Re-trigger catalog sync
      fetchCatalog();
      fetchAnalytics();
      fetchMatches();
    } catch (err) {
      alert('Error uploading match item.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    try {
      await axios.delete(`/api/admin/delete/${id}`);
      setSuccessMsg("Match deleted successfully from database.");
      fetchCatalog();
      fetchAnalytics();
      fetchMatches();
    } catch (err) {
      alert("Failed to delete match catalog item.");
    }
  };

  const openEditModal = (match) => {
    setEditingMatch(match);
    setEditTitle(match.title);
    setEditDescription(match.description);
    setEditGenres(match.genres.join(', '));
    setEditVideoURL(match.videoURL);
    setEditPoster(match.poster || '');
    setEditDuration(match.duration.toString());
    setEditReleaseYear(match.releaseYear.toString());
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await axios.put(`/api/admin/edit/${editingMatch._id}`, {
        title: editTitle,
        description: editDescription,
        genres: editGenres,
        videoURL: editVideoURL,
        poster: editPoster, // Send custom edit thumbnail URL
        duration: editDuration,
        releaseYear: editReleaseYear
      });
      setSuccessMsg("Match catalog item successfully updated in database!");
      setEditingMatch(null);
      fetchCatalog();
      fetchAnalytics();
      fetchMatches();
    } catch (err) {
      alert("Failed to update match catalog item.");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredMatches = matches.filter(match => 
    match.title.toLowerCase().includes(matchesSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full space-y-12">
        
        <div className="flex items-center gap-3 border-b border-stone-200/60 pb-5">
          <ShieldCheck className="text-[#C84B31]" size={24} />
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-stone-900">FOOTYZONE Operations</h2>
            <p className="text-xs text-stone-500 mt-1 font-semibold">Platform analytics and administrative catalogue management panel.</p>
          </div>
        </div>

        {/* 1. Analytics grids indicators */}
        {!loading && analytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Users</p>
                <h4 className="text-xl font-black text-stone-900 mt-0.5">{analytics.summary.totalUsers}</h4>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Catalog Size</p>
                <h4 className="text-xl font-black text-stone-900 mt-0.5">{analytics.summary.totalMatches} titles</h4>
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 glass-panel rounded-2xl skeleton shadow-sm" />
            ))}
          </div>
        )}

        {/* 2. Management panels split columns */}
        <div className="w-full">
          
          {/* Upload panel column */}
          <div className="w-full glass-panel p-6 sm:p-8 rounded-2xl border border-stone-200/60 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="text-[#C84B31]" size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">Upload New Match / Original</h3>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-semibold shadow-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold text-stone-700">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Title Name</label>
                  <input type="text" required placeholder="e.g. Real Madrid vs Barcelona" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 font-semibold animate-transition" />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Category</label>
                  <select 
                    required 
                    value={genres} 
                    onChange={(e) => setGenres(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 font-semibold cursor-pointer"
                  >
                    <option value="" disabled>Select a Category</option>
                    <option value="UEFA Champions League">UEFA Champions League</option>
                    <option value="Premier League">Premier League</option>
                    <option value="La Liga">La Liga</option>
                    <option value="World Cup">World Cup</option>
                    <option value="International matches">International matches</option>
                    <option value="Club Matches">Club Matches</option>
                    <option value="compilations">Compilations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Synopsis Details</label>
                <textarea rows={3} required placeholder="Enter description content..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 resize-none font-semibold" />
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Custom Thumbnail URL</label>
                <input type="text" placeholder="e.g. https://images.unsplash.com/... (optional fallback will apply if left blank)" value={poster} onChange={(e) => setPoster(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 font-semibold" />
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Direct MP4 Video Stream URL</label>
                <input type="text" placeholder="Leave empty for BigBuckBunny" value={videoURL} onChange={(e) => setVideoURL(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 font-semibold" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex justify-between items-center text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">
                    <span>Duration (mins)</span>
                    {duration && <span className="text-[#C84B31] text-[8px] tracking-normal font-semibold lowercase">auto-detected</span>}
                  </label>
                  <input type="number" required placeholder="120" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 font-semibold animate-transition" />
                </div>
                
                <div>
                  <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Release Year</label>
                  <input type="number" required placeholder="2024" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/50 font-semibold" />
                </div>

                <div className="flex gap-4 pt-5 select-none justify-center">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={isOriginal} onChange={(e) => setIsOriginal(e.target.checked)} className="accent-[#C84B31] w-4 h-4" />
                    <span>Original</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 mt-2 cursor-pointer"
              >
                {uploading ? 'Processing Database...' : 'Register Title Upload'}
              </button>

            </form>
          </div>

          {/* 3. Catalogued Matches Table / List */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-stone-200/60 space-y-6 shadow-sm bg-white/70 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Film className="text-[#C84B31]" size={18} /> Matches Catalogue Index
                </h3>
                <p className="text-[10px] text-stone-500 mt-1 font-semibold">
                  Delete match assets from the streaming library, edit titles and synopsis details.
                </p>
              </div>
              
              {/* Search filter */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                <input
                  type="text"
                  placeholder="Search matches by title..."
                  value={matchesSearch}
                  onChange={(e) => setMatchesSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-stone-900 outline-none focus:border-[#C84B31]/40 text-xs font-semibold shadow-sm"
                />
              </div>
            </div>

            {/* Table display */}
            {matchesLoading ? (
              <div className="space-y-3 py-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 glass-panel rounded-xl skeleton shadow-sm" />
                ))}
              </div>
            ) : filteredMatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-stone-750">
                  <thead>
                    <tr className="border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500">
                      <th className="pb-3 font-bold">Cover</th>
                      <th className="pb-3 font-bold">Title Name</th>
                      <th className="pb-3 font-bold">Genres</th>
                      <th className="pb-3 font-bold">Release / Duration</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredMatches.map((m) => (
                      <tr key={m._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5">
                          <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-md border border-stone-200 shadow-sm" />
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="font-black text-stone-900 truncate max-w-xs">{m.title}</div>
                          <div className="text-[10px] text-stone-500 truncate max-w-xs mt-0.5">{m.description}</div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {m.genres.slice(0, 2).map((genre, idx) => (
                              <span key={idx} className="bg-stone-150 text-stone-600 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-black">
                                {genre}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 text-stone-600 font-bold">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} /> {m.releaseYear}
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{m.duration} mins</div>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(m)}
                              className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-[#C84B31]/10 hover:text-[#C84B31] transition-all cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(m._id)}
                              className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                              title="Delete Match"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-stone-550">
                <p className="text-xs font-bold">No football matches catalogued inside the index.</p>
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />

      {/* 4. EDIT MATCH MODAL DIALOG */}
      {editingMatch && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg bg-[#F7F4EF] border border-stone-300 rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/60 bg-stone-100/50">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Edit3 size={14} className="text-[#C84B31]" /> Modify Catalog Info
              </h3>
              <button 
                onClick={() => setEditingMatch(null)}
                className="text-stone-550 hover:text-stone-900 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold text-stone-700">
              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Video Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Detailed Synopsis</label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] resize-none leading-relaxed font-bold shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Category</label>
                  <select
                    required
                    value={editGenres}
                    onChange={(e) => setEditGenres(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] font-bold shadow-sm cursor-pointer animate-transition"
                  >
                    <option value="UEFA Champions League">UEFA Champions League</option>
                    <option value="Premier League">Premier League</option>
                    <option value="La Liga">La Liga</option>
                    <option value="World Cup">World Cup</option>
                    <option value="International matches">International matches</option>
                    <option value="Club Matches">Club Matches</option>
                    <option value="compilations">Compilations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] font-bold shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Custom Thumbnail URL</label>
                <input
                  type="text"
                  required
                  value={editPoster}
                  onChange={(e) => setEditPoster(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Direct Video Stream URL</label>
                <input
                  type="text"
                  required
                  value={editVideoURL}
                  onChange={(e) => setEditVideoURL(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] font-bold shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-150 hover:bg-stone-200 text-stone-800 transition-all uppercase text-[10px] font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#C84B31] hover:bg-[#A83D27] text-white transition-all uppercase text-[10px] font-black cursor-pointer"
                >
                  {savingEdit ? "Updating..." : "Commit Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 5. CUSTOM CONFIRM DELETE MODAL */}
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
                    handleDeleteMatch(deleteConfirmId);
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

export default Admin;
