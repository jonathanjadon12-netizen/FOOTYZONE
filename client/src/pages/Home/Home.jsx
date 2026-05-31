import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { useApp } from '../../contexts/AppContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import MatchCard from '../../components/cards/MatchCard';
import Skeleton from '../../components/cards/Skeleton';
import { Play, Plus, Check, Info, Volume2, VolumeX } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const { catalogFeed, activeProfile, watchlist, toggleWatchlist, aiRecommendations } = useApp();
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroMuted, setHeroMuted] = useState(true);
  const [heroPlayTrailer, setHeroPlayTrailer] = useState(false);
  const [cloudinaryVideos, setCloudinaryVideos] = useState([]);

  // Fetch Cloudinary streams for users
  useEffect(() => {
    const fetchCloudinary = async () => {
      try {
        const res = await axios.get('/api/video/all-videos');
        if (res.data?.data) {
          const mapped = res.data.data.map(v => ({
            _id: v._id,
            title: v.title,
            description: v.description,
            poster: v.thumbnail,
            banner: v.thumbnail,
            trailerURL: v.videoUrl,
            videoURL: v.videoUrl,
            rating: 'PG-13',
            duration: Math.round(v.duration / 60) || 5,
            isVIP: false,
            genres: ['Cloud Stream']
          }));
          setCloudinaryVideos(mapped);
        }
      } catch (err) {
        console.error('Failed to load Cloudinary streams on homepage:', err);
      }
    };
    fetchCloudinary();
  }, []);

  // Load hero backdrop movie
  useEffect(() => {
    if (catalogFeed?.trending?.length > 0) {
      setHeroMovie(catalogFeed.trending[0]);
      // Trigger trailer autoplay after 2.5 seconds
      const timer = setTimeout(() => {
        setHeroPlayTrailer(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [catalogFeed]);

  const isAdded = heroMovie ? watchlist.includes(heroMovie._id) : false;

  const renderRow = (title, items) => {
    if (!items || items.length === 0) return null;
    
    const filteredItems = items;

    if (filteredItems.length === 0) return null;

    return (
      <div className="space-y-3 px-4 sm:px-8 py-4 relative z-20">
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-stone-900 border-l-4 border-[#C84B31] pl-3">
          {title}
        </h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {filteredItems.map((movie) => (
            <MatchCard key={movie._id} match={movie} />
          ))}
        </div>
      </div>
    );
  };

  const renderLoaderRow = (title) => (
    <div className="space-y-3 px-4 sm:px-8 py-4">
      <div className="h-5 w-48 bg-stone-200 rounded skeleton" />
      <div className="flex items-center gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col overflow-x-hidden">
      <Navbar />

      {/* 1. Full Screen Featured Hero Video Banner */}
      <div className="relative h-[65vh] sm:h-[85vh] w-full bg-[#EFECE5]">
        {heroMovie ? (
          <>
            <div className="absolute inset-0 z-0">
              {heroPlayTrailer ? (
                <ReactPlayer 
                  url={heroMovie.videoURL}
                  playing
                  muted={heroMuted}
                  loop
                  width="100%"
                  height="100%"
                  className="absolute inset-0 object-cover scale-110"
                  config={{ file: { attributes: { style: { objectFit: 'cover', width: '100%', height: '100%' } } } }}
                />
              ) : (
                <img 
                  src={heroMovie.banner || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'} 
                  alt={heroMovie.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';
                  }}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Cinematic overlays */}
              <div className="absolute inset-0 hero-gradient-overlay z-10" />
              <div className="absolute inset-0 hero-left-gradient-overlay z-10" />
            </div>

            {/* Hero details card */}
            <div className="absolute inset-x-0 bottom-16 sm:bottom-28 z-20 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end h-full">
              <div className="max-w-xl">
                <span className="px-2.5 py-0.5 bg-[#C84B31] text-white text-[9px] font-black tracking-widest rounded-full uppercase select-none mb-4 inline-block box-glow">
                  FOOTYZONE Original
                </span>
                
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight select-none mb-3 text-stone-900 drop-shadow-sm">
                  {heroMovie.title}
                </h2>
                
                <p className="text-xs sm:text-sm text-stone-700 select-none line-clamp-3 leading-relaxed mb-6 font-medium">
                  {heroMovie.description}
                </p>

                {/* Hero HUD Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => navigate(`/watch/${heroMovie._id}`)}
                    className="px-6 sm:px-8 py-3 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Play size={15} fill="currentColor" /> Play Now
                  </button>

                  <button 
                    onClick={() => toggleWatchlist(heroMovie._id)}
                    className="px-5 sm:px-6 py-3 bg-white/70 hover:bg-white border border-stone-300 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 text-stone-800 cursor-pointer"
                  >
                    {isAdded ? <Check size={15} className="text-[#C84B31]" /> : <Plus size={15} />}
                    Watchlist
                  </button>

                  {/* Volume Trigger */}
                  <button 
                    onClick={() => setHeroMuted(!heroMuted)}
                    className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-850 bg-white/50 hover:bg-white transition-colors cursor-pointer"
                  >
                    {heroMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[#EFECE5] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#C84B31] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 2. Netflix-style Categorized Grid Sections */}
      <section className="flex-grow bg-[#F7F4EF] pb-16 -mt-10 relative z-20 space-y-4">
        {catalogFeed ? (
          <>
            {/* AI Recommendation matches shelf */}
            {aiRecommendations.length > 0 && renderRow('Personalized AI Matches for You', aiRecommendations)}

            {/* Cloudinary Premium Stream Shelf */}
            {cloudinaryVideos.length > 0 && renderRow('QUALITY WATCH', cloudinaryVideos)}

            {renderRow('UEFA Champions League', catalogFeed.uefaChampionsLeague)}
            {renderRow('Premier League', catalogFeed.premierLeague)}
            {renderRow('La Liga', catalogFeed.laLiga)}
            {renderRow('World Cup', catalogFeed.worldCup)}
            {renderRow('International Matches', catalogFeed.internationalMatches)}
            {renderRow('Club Matches', catalogFeed.clubMatches)}
            {renderRow('Compilations', catalogFeed.compilations)}
          </>
        ) : (
          <>
            {renderLoaderRow('Trending Matches Now')}
            {renderLoaderRow('Match Highlights & Recaps')}
            {renderLoaderRow('FOOTYZONE Original Matches')}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Home;
