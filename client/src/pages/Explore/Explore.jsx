import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import MatchCard from '../../components/cards/MatchCard';
import { SlidersHorizontal } from 'lucide-react';

function Explore() {
  const { catalogFeed } = useApp();

  const [items, setItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortBy, setSortBy] = useState('popular');
  const [filterGenre, setFilterGenre] = useState('All');

  // Load catalog list
  useEffect(() => {
    if (!catalogFeed) return;
    const all = catalogFeed.trending.concat(catalogFeed.picks);
    
    // Remove duplicates
    const unique = [];
    const seen = new Set();
    all.forEach(m => {
      if (!seen.has(m._id)) {
        seen.add(m._id);
        unique.push(m);
      }
    });

    // Apply genre filters
    let filtered = filterGenre === 'All' ? unique : unique.filter(m => m.genres.includes(filterGenre));

    // Apply sorting
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sortBy === 'rated') {
      filtered.sort((a, b) => (b.rating === 'R' ? 1 : -1));
    }

    setItems(filtered);
  }, [catalogFeed, sortBy, filterGenre]);

  // Infinite Scroll Trigger Simulated helper
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, items.length));
  };

  const genres = ['All', 'Matches', 'Originals', 'La Liga', 'Premier League', 'Champions League', 'Goals', 'Saves', 'Defence', 'Passing', 'Highlights', 'Skills'];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        
        {/* Controls HUD Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-6 bg-white/70 rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="text-[#C84B31]" size={18} />
            <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">Explore Catalog Shelves</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Genre filter */}
            <select 
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none text-stone-900 focus:border-[#C84B31] flex-grow sm:flex-grow-0 font-semibold cursor-pointer shadow-sm"
            >
              {genres.map(g => <option key={g} value={g}>{g} Shelf</option>)}
            </select>

            {/* Sorting selectors */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none text-stone-900 focus:border-[#C84B31] flex-grow sm:flex-grow-0 font-semibold cursor-pointer shadow-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">New Releases</option>
              <option value="rated">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Content list Grid display */}
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xs text-stone-500 font-semibold">No content matches found for this filter combination.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.slice(0, visibleCount).map((movie) => (
                <div key={movie._id} className="relative scale-100 hover:scale-105 transition-transform duration-300">
                  <MatchCard match={movie} />
                </div>
              ))}
            </div>

            {/* Load more trigger buttons */}
            {visibleCount < items.length && (
              <div className="flex justify-center pt-8 border-t border-stone-200">
                <button 
                  onClick={handleLoadMore}
                  className="px-8 py-3.5 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#C84B31]/15 cursor-pointer"
                >
                  Stream More Content
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Explore;
