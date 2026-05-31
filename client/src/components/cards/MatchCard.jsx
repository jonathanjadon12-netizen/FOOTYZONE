import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

function MatchCard({ match }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/watch/${match._id}`)}
      className="relative flex-shrink-0 w-44 sm:w-52 h-28 sm:h-32 rounded-lg cursor-pointer overflow-hidden border border-stone-200/60 shadow-md group select-none bg-stone-900"
    >
      {/* Static Default Backdrop Poster */}
      <img 
        src={match.poster || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'} 
        alt={match.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
        }}
        className="w-full h-full object-cover rounded-lg"
      />

      {/* Sleek Play Button & Info Overlay on Hover */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-300 rounded-lg ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Play Icon Centered */}
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#C84B31] text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        {/* Title and Info */}
        <div className="space-y-0.5 text-white">
          <h4 className="text-[10px] font-black uppercase tracking-wide truncate drop-shadow">
            {match.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[8px] text-stone-300 font-bold truncate">
            <span>{match.duration}m</span>
            <span>•</span>
            <span>{(match.genres && match.genres[0]) || 'Football'}</span>
            <span>•</span>
            <span className="text-[#3b9c52]">98% Match</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchCard;
