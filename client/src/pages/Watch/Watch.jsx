import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useApp } from '../../contexts/AppContext';
import VideoPlayer from '../../components/player/VideoPlayer';
import { ChevronLeft, Users, Send, Smile, Info } from 'lucide-react';

function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useApp();

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);

  // Watch Party States
  const [showPartyPanel, setShowPartyPanel] = useState(false);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState('');
  
  // Chat & Emoji states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Load movie detail
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/matches/${id}`);
        // If series details, select its first episode URL, otherwise stream standard film
        if (res.data.data.type === 'series') {
          setMovie(res.data.data.content.episodes[0]);
        } else {
          setMovie(res.data.data.content);
        }
      } catch (err) {
        // Cloudinary stream endpoint fallback check
        try {
          const fallbackRes = await axios.get(`/api/video/video/${id}`);
          if (fallbackRes.data?.data) {
            const v = fallbackRes.data.data;
            setMovie({
              _id: v._id,
              title: v.title,
              description: v.description,
              videoURL: v.videoUrl, // map videoUrl to videoURL expected by player
              poster: v.thumbnail,
              banner: v.thumbnail,
              duration: v.duration,
              isVIP: false,
              rating: "PG-13",
              genres: ["Cloud Stream"]
            });
          }
        } catch (cloudErr) {
          // Standard movie fallback check
          try {
            const fallbackRes = await axios.get('/api/matches');
            const data = fallbackRes.data?.data || {};
            const trendingList = data.trending || [];
            const picksList = data.picks || data.originals || [];
            const allMovies = trendingList.concat(picksList);
            const found = allMovies.find(m => m && m._id === id);
            if (found) setMovie(found);
          } catch (e) {
            console.error("All fallback checks failed:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // Watch Party Listeners
    newSocket.on('chat_received', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    newSocket.on('party_announcement', (ann) => {
      setChatMessages(prev => [...prev, { username: 'SYSTEM', text: ann.message, timestamp: '' }]);
    });

    newSocket.on('emoji_blast_received', ({ emoji }) => {
      triggerFloatingEmoji(emoji);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoinParty = () => {
    if (!roomId || !socket || !activeProfile) return;
    socket.emit('join_party', { roomId, username: activeProfile.profileName });
    setJoinedRoom(roomId);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatText || !socket || !joinedRoom || !activeProfile) return;
    socket.emit('send_chat', { roomId: joinedRoom, username: activeProfile.profileName, text: chatText });
    setChatText('');
  };

  const handleEmojiBlast = (emoji) => {
    if (!socket || !joinedRoom) return;
    socket.emit('send_emoji_blast', { roomId: joinedRoom, emoji });
    triggerFloatingEmoji(emoji);
  };

  const triggerFloatingEmoji = (emoji) => {
    const newEmoji = { id: Date.now() + Math.random(), emoji, x: Math.random() * 80 + 10 };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2000); // Evict emoji after 2 seconds animation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C84B31] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold uppercase tracking-wider text-[#C84B31]">Video clip not found</h3>
        <button onClick={() => navigate('/browse')} className="mt-4 px-6 py-2.5 bg-[#C84B31] hover:bg-[#A83D27] rounded-xl text-xs uppercase font-bold text-white transition-all cursor-pointer">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-row overflow-hidden relative">
      
      {/* 1. Floating Emojis Blast Overlay Container */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {floatingEmojis.map((e) => (
          <span 
            key={e.id}
            className="absolute bottom-10 text-4xl animate-bounce pointer-events-none select-none"
            style={{
              left: `${e.x}%`,
              animation: 'floatUp 2.5s ease-out forwards',
              position: 'absolute'
            }}
          >
            {e.emoji}
          </span>
        ))}
      </div>

      {/* 2. Main Video Cinema Column */}
      <div className="flex-grow flex flex-col relative h-screen">
        {/* Floating Back Buttons */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-[#C84B31] hover:text-white text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/10 shadow-lg cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={() => setShowPartyPanel(!showPartyPanel)}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-[#C84B31] hover:text-white text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/10 shadow-lg cursor-pointer"
          >
            <Users size={17} />
          </button>
        </div>

        {/* Custom Advanced Media Player */}
        <div className="flex-grow w-full h-full">
          <VideoPlayer 
            movie={movie} 
            onVideoEnd={() => {
              alert("Video playback completed successfully.");
              navigate(-1);
            }} 
          />
        </div>
      </div>

      {/* 3. Watch Party Synchronizer Side Panel (Socket.io) */}
      {showPartyPanel && (
        <aside className="w-80 border-l border-stone-200 bg-[#F7F4EF] flex flex-col shrink-0 h-screen z-20">
          
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#C84B31] flex items-center gap-2">
              <Users size={16} /> Cinematic Party
            </h3>
            <button onClick={() => setShowPartyPanel(false)} className="text-stone-500 hover:text-stone-900 text-xs font-bold uppercase tracking-wider cursor-pointer">Close</button>
          </div>

          {!joinedRoom ? (
            /* Join Room panel interface */
            <div className="p-6 space-y-4 flex-grow flex flex-col justify-center">
              <span className="px-2 py-0.5 bg-[#C84B31]/10 text-[#C84B31] text-[9px] font-black tracking-widest border border-[#C84B31]/20 rounded uppercase text-center block">Watch Sync Active</span>
              <h4 className="text-xs font-bold text-stone-600 text-center leading-relaxed font-semibold">
                Connect and sync playheads, playback speed, and emoji reactions with friends!
              </h4>
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Enter Party Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-stone-300 text-xs focus:border-[#C84B31] outline-none text-stone-950 text-center tracking-widest uppercase font-bold shadow-sm"
                />
                <button 
                  onClick={handleJoinParty}
                  className="w-full py-3 bg-[#C84B31] hover:bg-[#A83D27] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C84B31]/10 cursor-pointer"
                >
                  Join Cinematic Room
                </button>
              </div>
            </div>
          ) : (
            /* Joined Room Chat Panel */
            <div className="flex-grow flex flex-col h-full overflow-hidden">
              
              {/* Room Header Info */}
              <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-[10px] text-stone-600 font-bold">
                <span>Room: <span className="text-stone-900 uppercase font-black">{joinedRoom}</span></span>
                <span className="text-emerald-700 font-black">Sync Live</span>
              </div>

              {/* Chat Messages scroll area */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl text-xs ${m.username === 'SYSTEM' ? 'bg-[#C84B31]/5 border border-[#C84B31]/10 text-[#C84B31] text-center font-extrabold' : 'bg-white border border-stone-200 text-stone-900 shadow-sm font-semibold'}`}>
                    {m.username !== 'SYSTEM' && (
                      <p className="font-black text-[#C84B31] text-[10px] mb-0.5 uppercase tracking-wide">{m.username}</p>
                    )}
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Emoji Blast HUD */}
              <div className="p-3 border-t border-stone-250 flex gap-2 justify-center bg-stone-100">
                {['😀', '😂', '🔥', '👏', '😮', '💀'].map((em) => (
                  <button 
                    key={em}
                    onClick={() => handleEmojiBlast(em)}
                    className="text-xl hover:scale-125 transition-transform active:scale-95 cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-stone-250 flex gap-2">
                <input 
                  type="text"
                  placeholder="Say something to room..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className="flex-grow px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs focus:border-[#C84B31] outline-none text-stone-900 font-semibold"
                />
                <button type="submit" className="p-2 bg-[#C84B31] hover:bg-[#A83D27] rounded-xl text-white flex items-center justify-center shrink-0 cursor-pointer">
                  <Send size={14} />
                </button>
              </form>

            </div>
          )}

        </aside>
      )}

      {/* Injected styling rule for floating emoji animation */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1);
          }
          100% {
            transform: translateY(-600px) scale(1);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
}

export default Watch;
