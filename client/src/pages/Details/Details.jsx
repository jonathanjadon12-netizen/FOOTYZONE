import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../../contexts/AppContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { Play, Plus, Check, Share2, Star, Send, ThumbsUp, HelpCircle } from 'lucide-react';

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { watchlist, toggleWatchlist, user } = useApp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/matches/${id}`);
        setData(res.data.data);
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const isAdded = watchlist.includes(id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText) return;
    setSubmittingReview(true);
    try {
      const res = await axios.post(`/api/matches/${id}/reviews`, { rating, text: reviewText });
      setReviews([res.data.data, ...reviews]);
      setReviewText('');
    } catch (err) {
      alert('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C84B31] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-center p-4">
        <h3 className="text-xl font-bold uppercase tracking-wider text-[#C84B31]">Asset not found</h3>
        <button onClick={() => navigate('/browse')} className="mt-4 px-6 py-2.5 bg-[#C84B31] text-white hover:bg-[#A83D27] rounded-xl text-xs uppercase font-bold transition-all shadow-lg shadow-[#C84B31]/10 active:scale-95 cursor-pointer">
          Return Home
        </button>
      </div>
    );
  }

  const { content, type } = data;
  const isPremium = user?.subscription?.plan && user.subscription.plan !== 'free';

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col overflow-x-hidden">
      <Navbar />

      {/* 1. Backdrop Banner Banner */}
      <div className="relative h-[45vh] sm:h-[60vh] w-full">
        <img 
          src={content.banner || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'} 
          alt={content.title} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';
          }}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F4EF] via-[#F7F4EF]/60 to-transparent" />
      </div>

      {/* 2. Core Metadata Details block */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-32 relative z-10 space-y-12 pb-24 w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Poster card */}
          <div className="hidden md:block">
            <img 
              src={content.poster || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'} 
              alt={content.title} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
              }}
              className="w-full rounded-2xl border border-stone-200 shadow-2xl select-none pointer-events-none"
            />
          </div>

          {/* Right Synopsis details */}
          <div className="md:col-span-2 space-y-6">
            <span className="px-2.5 py-0.5 bg-[#C84B31] text-white text-[9px] font-black tracking-widest rounded-full uppercase inline-block box-glow">
              {type === 'series' ? 'TV SHOW' : 'FOOTBALL MATCH'}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight select-none text-stone-900">
              {content.title}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700">98% Match</span>
              <span className="text-stone-550">{content.releaseYear}</span>
              <span className="text-stone-550">
                {type === 'series' ? `${content.episodes?.length || 0} Episodes` : `${content.duration} minutes`}
              </span>
              <span className="text-[#C84B31] border border-[#C84B31]/30 px-1.5 py-0.5 rounded uppercase tracking-wider text-[9px] font-black bg-[#C84B31]/5">4K HDR</span>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed font-semibold">
              {content.description}
            </p>

            {/* Cast & Genres list */}
            <div className="space-y-2 text-xs font-semibold text-stone-600 border-t border-stone-200 pt-4">
              <p><span className="text-stone-900 font-extrabold">Featured Players:</span> {content.cast?.join(', ')}</p>
              <p><span className="text-stone-900 font-extrabold">Genres:</span> {content.genres?.join(', ')}</p>
            </div>

            {/* HUD Buttons */}
            <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-6 relative">
              <button 
                onClick={() => navigate(`/watch/${content._id}`)}
                className="px-6 py-3 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Play size={14} fill="currentColor" /> Play Stream
              </button>

              <button 
                onClick={() => toggleWatchlist(content._id)}
                className="w-12 h-12 rounded-xl border border-stone-300 hover:border-[#C84B31] text-stone-800 flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors active:scale-95 cursor-pointer"
              >
                {isAdded ? <Check size={16} className="text-[#C84B31]" /> : <Plus size={16} />}
              </button>

              <button 
                onClick={handleShare}
                className="w-12 h-12 rounded-xl border border-stone-300 hover:border-[#C84B31] text-stone-800 flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors active:scale-95 cursor-pointer"
              >
                <Share2 size={16} />
              </button>

              {isCopied && (
                <span className="text-[10px] text-[#C84B31] font-bold uppercase tracking-widest mt-1 bg-[#C84B31]/10 px-2.5 py-1 rounded">URL copied to clipboard!</span>
              )}
            </div>

          </div>

        </div>

        {/* 3. Series Episodes Selector (Renders TV list if content is Series) */}
        {type === 'series' && content.episodes && (
          <div className="border-t border-stone-200 pt-10">
            <h3 className="text-xl font-black uppercase tracking-wider text-stone-900 mb-6">Episodes Catalog</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.episodes.map((ep) => (
                <div 
                  key={ep._id}
                  onClick={() => navigate(`/watch/${ep._id}`)}
                  className="flex gap-4 p-3 bg-white/70 rounded-2xl hover:bg-stone-100 cursor-pointer transition-all border border-stone-200 hover:border-stone-350 shadow-sm group"
                >
                  <img 
                    src={ep.thumbnail || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'} 
                    alt={ep.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
                    }}
                    className="w-32 h-20 object-cover rounded-lg shrink-0 border border-stone-200/60"
                  />
                  <div>
                    <span className="text-[9px] text-[#C84B31] font-black uppercase tracking-wider">Season {ep.season} • Episode {ep.episodeNumber}</span>
                    <h4 className="text-xs font-extrabold text-stone-900 group-hover:text-[#C84B31] transition-colors mt-0.5">{ep.title}</h4>
                    <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-relaxed font-semibold">{ep.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Comments and Reviews Block */}
        <div className="border-t border-stone-200 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Write a Review Block */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest text-stone-900 mb-4">Write a review</h4>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Viewer rating</label>
                <select 
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none text-stone-900 focus:border-[#C84B31]/50 font-semibold cursor-pointer shadow-sm"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
                  <option value={3}>⭐⭐⭐ (Good)</option>
                  <option value={2}>⭐⭐ (Average)</option>
                  <option value={1}>⭐ (Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Your experience</label>
                <textarea 
                  rows={3}
                  required
                  placeholder={`Share your thoughts on ${content.title}...`}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none text-stone-900 focus:border-[#C84B31]/50 resize-none font-semibold shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#C84B31]/15 cursor-pointer"
              >
                Submit Review <Send size={12} />
              </button>
            </form>
          </div>

          {/* Reviews Grid */}
          <div className="md:col-span-2 space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-sm font-black uppercase tracking-widest text-stone-900">Viewer Reviews ({reviews.length})</h4>
            
            {reviews.length === 0 ? (
              <p className="text-xs text-stone-500 font-semibold">No reviews yet. Be the first to share your thoughts on {content.title}!</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="p-4 bg-white/75 rounded-2xl border border-stone-200/60 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-900">{r.name}</span>
                    <span className="text-[10px] text-[#C84B31]">{'⭐'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-semibold">{r.text}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-550 pt-1 font-bold">
                    <button className="flex items-center gap-1 hover:text-[#C84B31] transition-colors cursor-pointer">
                      <ThumbsUp size={10} /> Helpful ({r.likes || 0})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default Details;
