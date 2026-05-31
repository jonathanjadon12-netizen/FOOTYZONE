import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { 
  Video, 
  Trash2, 
  Edit3, 
  Search, 
  PlusCircle, 
  Play, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Tv
} from "lucide-react";
import { useApp } from "../contexts/AppContext";

function AdminVideos() {
  const { token } = useApp();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Play Video Modal State
  const [playingVideo, setPlayingVideo] = useState(null);

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/video/all-videos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(res.data.data);
    } catch (err) {
      console.error("Failed to fetch videos from server:", err);
      setErrorMsg("Failed to retrieve upload records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filter videos by title search
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination bounds
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Delete Video
  const handleDeleteVideo = async (id) => {
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await axios.delete(`/api/video/delete-video/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Video catalog deleted successfully from storage and database.");
      // Refresh list
      fetchVideos();
      // Back to page 1 if current page is empty
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setErrorMsg("Failed to delete video catalog item.");
    }
  };

  // Edit Video Form Modal Open
  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axios.put(
        `/api/video/edit-video/${editingVideo._id}`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setSuccessMsg("Video metadata updated successfully.");
        setEditingVideo(null);
        fetchVideos();
      }
    } catch (err) {
      setErrorMsg("Failed to save edited video metadata.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Date utility
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Duration utility
  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.round(sec % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-8">
        
        {/* Title Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/60 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Tv className="text-[#C84B31]" /> Catalog Stream Index
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-semibold">
              Manage Cloudinary assets, optimize transform rules, play premium feeds, and update title descriptions.
            </p>
          </div>
          <Link
            to="/admin/upload"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#C84B31] hover:bg-[#A83D27] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg select-none shrink-0"
          >
            <PlusCircle size={16} /> Upload Studio Uploader
          </Link>
        </div>

        {/* Notifications HUD */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl p-4 flex gap-3 text-xs items-center font-bold animate-fade-in">
            <Check className="text-emerald-700 shrink-0" size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex gap-3 text-xs items-center font-bold animate-fade-in">
            <AlertCircle className="text-red-700 shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filtering and search inputs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search uploads by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-stone-300 text-stone-900 outline-none focus:border-[#C84B31] text-xs font-bold shadow-sm placeholder-stone-350"
            />
          </div>
          <span className="text-[10px] text-stone-500 font-black uppercase tracking-widest shrink-0">
            Total Library: <span className="text-stone-950">{filteredVideos.length} assets</span>
          </span>
        </div>

        {/* Grid display items with skeletal lazy loaders */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video glass-panel rounded-2xl border border-stone-200/60 skeleton h-64 shadow-sm" />
            ))}
          </div>
        ) : currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((video) => (
              <div 
                key={video._id}
                className="group glass-panel rounded-2xl border border-stone-200/60 overflow-hidden flex flex-col justify-between hover:border-stone-350 transition-all duration-300 shadow-sm bg-white/70"
              >
                
                {/* Visual cover card */}
                <div className="relative aspect-video bg-black overflow-hidden select-none">
                  <img
                    src={video.thumbnail || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'}
                    alt={video.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60" />
                  
                  {/* Floating Action Trigger */}
                  <button
                    onClick={() => setPlayingVideo(video)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#C84B31] text-white flex items-center justify-center shadow-2xl scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-[#A83D27] cursor-pointer"
                  >
                    <Play size={20} fill="white" />
                  </button>

                  <span className="absolute bottom-3 right-3 text-[9px] bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800 text-stone-300 font-bold flex items-center gap-1">
                    <Clock size={10} /> {formatDuration(video.duration)}
                  </span>
                </div>

                {/* Body metadata card info */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-stone-900 truncate leading-tight group-hover:text-[#C84B31] transition-all">
                      {video.title}
                    </h3>
                    <p className="text-[11px] text-stone-650 leading-normal line-clamp-2 font-bold">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-200/60 pt-3.5 text-[10px] text-stone-500 font-bold">
                    <span className="flex items-center gap-1.5 uppercase">
                      <Calendar size={12} /> {formatDate(video.createdAt)}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-[#C84B31]/10 hover:text-[#C84B31] transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(video._id)}
                        className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel border border-stone-200/60 rounded-2xl space-y-3 bg-white/70 shadow-sm">
            <Video className="mx-auto text-stone-400 animate-pulse" size={36} />
            <p className="text-xs font-bold text-stone-600">No matching cloud videos in library.</p>
            <p className="text-[10px] text-stone-500">Upload video assets using the Cloudinary Studio uploader.</p>
          </div>
        )}

        {/* Pagination HUD */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 select-none font-bold text-xs text-stone-600">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-stone-100 transition-all text-stone-900 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page <span className="text-stone-900">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-stone-100 transition-all text-stone-900 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </main>

      {/* 1. EDIT VIDEO MODAL DIALOG */}
      {editingVideo && (
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
                onClick={() => setEditingVideo(null)}
                className="text-stone-500 hover:text-stone-900 transition-all cursor-pointer"
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

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
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

      {/* 2. PLAYING VIDEO PREVIEW MODAL */}
      {playingVideo && (
        <div 
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setPlayingVideo(null)}
        >
          <div 
            className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-stone-850"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Trigger */}
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-video w-full bg-black">
              <video
                key={playingVideo.videoUrl}
                controls
                autoPlay
                poster={playingVideo.thumbnail}
                className="w-full h-full object-contain"
              >
                <source src={playingVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video playback preview.
              </video>
            </div>
            
            {/* Info Drawer */}
            <div className="p-6 bg-[#F7F4EF] border-t border-stone-200 space-y-2">
              <h3 className="text-base font-black text-stone-900">{playingVideo.title}</h3>
              <p className="text-xs text-stone-605 font-semibold leading-relaxed">{playingVideo.description}</p>
              <div className="flex gap-2 pt-2">
                <span className="text-[9px] bg-[#C84B31]/10 text-[#C84B31] border border-[#C84B31]/20 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  Cloudinary Transform (q_auto, f_auto)
                </span>
                <span className="text-[9px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  Duration: {formatDuration(playingVideo.duration)}
                </span>
              </div>
            </div>
          </div>
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
                    handleDeleteVideo(deleteConfirmId);
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

      <Footer />
    </div>
  );
}

export default AdminVideos;
