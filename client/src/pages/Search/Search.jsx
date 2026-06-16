import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useSpeech } from '../../hooks/useSpeech';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import MatchCard from '../../components/cards/MatchCard';
import { Search as SearchIcon, Mic, MicOff, SlidersHorizontal, Check } from 'lucide-react';

function Search() {
  const { catalogFeed } = useApp();

  // Search state
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  
  // Filters panel
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Gather catalog feed array for query computations
  const getFlattenedCatalog = () => {
    if (!catalogFeed) return [];
    const trendingList = catalogFeed.trending || [];
    const picksList = catalogFeed.picks || catalogFeed.originals || [];
    const movies = trendingList.concat(picksList);
    // Remove duplicates
    const unique = [];
    const seen = new Set();
    movies.forEach(m => {
      if (m && m._id && !seen.has(m._id)) {
        seen.add(m._id);
        unique.push(m);
      }
    });
    return unique;
  };

  // Compute Search computations on debounced term changes
  useEffect(() => {
    const list = getFlattenedCatalog();
    if (!debouncedQuery) {
      setResults(list.slice(0, 8)); // default list
      return;
    }

    const filtered = list.filter((m) => {
      const titleMatch = m.title.toLowerCase().includes(debouncedQuery.toLowerCase());
      const descMatch = m.description.toLowerCase().includes(debouncedQuery.toLowerCase());
      const genreMatch = selectedGenre === 'All' || m.genres.includes(selectedGenre);
      const langMatch = selectedLanguage === 'All' || m.language.toLowerCase() === selectedLanguage.toLowerCase();
      
      return (titleMatch || descMatch) && genreMatch && langMatch;
    });

    setResults(filtered);
  }, [debouncedQuery, selectedGenre, selectedLanguage, catalogFeed]);

  // Voice Search Hook Trigger integration
  const { isListening, toggleListening } = useSpeech((text) => {
    setQuery(text);
  });

  const genresOptions = ['All', 'Matches', 'Shows', 'Originals', 'La Liga', 'Premier League', 'World Cup', 'Champions League', 'Fails', 'Horror', 'Skills'];
  const languagesOptions = ['All', 'en', 'ja'];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#231F1D] flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        
        {/* Search Bar Input Block */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <div className="relative flex items-center">
            <SearchIcon size={20} className="absolute left-4 text-stone-400" />
            <input 
              type="text"
              placeholder="Search matches, football shows, players, or original content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-4 bg-white/80 rounded-2xl border border-stone-300 text-sm focus:border-[#C84B31] focus:bg-white outline-none transition-all text-stone-900 placeholder-stone-400 font-semibold shadow-md"
            />
            
            {/* Action buttons inside bar */}
            <div className="absolute right-3 flex items-center gap-2">
              <button 
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening ? 'bg-[#C84B31] text-white animate-pulse shadow-md shadow-[#C84B31]/15' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl hover:bg-stone-200/50 transition-all cursor-pointer ${showFilters ? 'text-[#C84B31]' : 'text-stone-500 hover:text-stone-900'}`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Section Panel */}
        {showFilters && (
          <div className="max-w-2xl mx-auto mb-8 p-6 glass-panel rounded-2xl border border-stone-200/60 space-y-4 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">Search Filters Panel</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Genres Dropdown */}
              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Category Genre</label>
                <select 
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none text-stone-900 focus:border-[#C84B31]/50 font-semibold cursor-pointer shadow-sm"
                >
                  {genresOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Language Dropdown */}
              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-2">Audio Language</label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none text-stone-900 focus:border-[#C84B31]/50 font-semibold cursor-pointer shadow-sm"
                >
                  {languagesOptions.map(l => <option key={l} value={l}>{l === 'All' ? 'All Languages' : l.toUpperCase()}</option>)}
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Results Grid Displays */}
        <div className="space-y-6 pt-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 border-l-4 border-[#C84B31] pl-3">
            {query ? `Search results for "${query}" (${results.length})` : 'Popular Searches Trending Now'}
          </h3>

          {results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xs text-stone-500 font-semibold">No content matches found. Refine your query parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.map((movie) => (
                <div key={movie._id} className="relative scale-100 hover:scale-105 transition-transform duration-300">
                  <MatchCard match={movie} />
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default Search;
