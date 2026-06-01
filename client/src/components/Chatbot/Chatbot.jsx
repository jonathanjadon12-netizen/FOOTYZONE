import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../../contexts/AppContext';

export default function Chatbot() {
  const { isAuthenticated, activeProfile, user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'live' | 'standings'
  const [guestId, setGuestId] = useState('');
  
  // Chat States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Live Sports Data States
  const [liveData, setLiveData] = useState({ liveScores: [], fixtures: [], standings: [], topScorers: [] });
  const [sportsLoading, setSportsLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('isl');

  const messagesEndRef = useRef(null);

  // Initialize Guest ID and load initial history
  useEffect(() => {
    let savedGuestId = localStorage.getItem('footyzone_guest_id');
    if (!savedGuestId) {
      savedGuestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('footyzone_guest_id', savedGuestId);
    }
    setGuestId(savedGuestId);
  }, []);

  // Load chat history when guestId or user session is ready or when open
  useEffect(() => {
    if (isOpen && (isAuthenticated || guestId)) {
      fetchChatHistory();
      fetchLiveSports();
    }
  }, [isOpen, isAuthenticated, guestId]);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, activeTab]);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`/api/chat/history?guestId=${guestId}`);
      if (res.data.status === 'success' && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        // Welcome fallback
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `👋 **Namaste ${activeProfile?.name || user?.name || 'Football Fan'}!** 🇮🇳\n\nWelcome to **FootyBot**, your premium AI Football Intelligence companion on Footyzone. ⚽\n\nI am **100% FREE** for all guest and registered fans! I can help you with:\n\n* **Indian Football:** Detailed statistics for ISL, I-League, and legends like *Sunil Chhetri* 🐐\n* **Rupee Conversions:** Transfer fees and salaries converted instantly into **Indian Rupees (₹ Crores)** 🪙\n* **Match Info:** Live scores, IST kickoffs, and standings 🏟️\n* **Tactical corner:** Formations and playstyle analysis (like *Gegenpressing*) 🧠\n\nAsk me any question, or toggle the tabs above to see real-time matches!`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const fetchLiveSports = async (leagueKey = selectedLeague) => {
    setSportsLoading(true);
    try {
      const res = await axios.get(`/api/chat/live?league=${leagueKey}`);
      if (res.data.status === 'success') {
        setLiveData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching live scores:', err);
    } finally {
      setSportsLoading(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput('');

    // Add user message locally
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: text,
        guestId,
        profileId: activeProfile?._id
      });

      if (response.data.status === 'success') {
        const reply = response.data.data.reply;
        setMessages(prev => [...prev, {
          id: response.data.data.messageId || (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          createdAt: new Date().toISOString()
        }]);

        // Trigger search logging behind the scenes to track search analytics
        await axios.post('/api/chat/search', {
          query: text,
          guestId
        });
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Penalty shootout error!** \n\nUnable to reach FootyBot intelligence server. Please check your connection or restart the server.`,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to parse simple markdown bold, lists, and rupee conversions beautifully
  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();
      
      const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');
      if (isBullet) {
        trimmed = trimmed.substring(1).trim();
      }

      // Convert **bold** and `code` highlights
      const parts = [];
      let currentText = trimmed;
      const regex = /(\*\*.*?\*\*|`.*?`|₹\s*\d+[^)]*|https?:\/\/[^\s]+)/g;
      
      let match;
      let lastIndex = 0;

      while ((match = regex.exec(currentText)) !== null) {
        const matchStr = match[0];
        const matchIdx = match.index;

        if (matchIdx > lastIndex) {
          parts.push({ type: 'text', value: currentText.substring(lastIndex, matchIdx) });
        }

        if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
          parts.push({ type: 'bold', value: matchStr.slice(2, -2) });
        } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
          parts.push({ type: 'code', value: matchStr.slice(1, -1) });
        } else if (matchStr.includes('₹')) {
          // Highlight Rupee conversions uniquely!
          parts.push({ type: 'rupee', value: matchStr });
        } else {
          parts.push({ type: 'link', value: matchStr });
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < currentText.length) {
        parts.push({ type: 'text', value: currentText.substring(lastIndex) });
      }

      const inlineElements = parts.map((p, pIdx) => {
        if (p.type === 'bold') {
          return <strong key={pIdx} className="font-extrabold text-[#F3F0EA]">{p.value}</strong>;
        }
        if (p.type === 'code') {
          return <code key={pIdx} className="bg-stone-850 text-[#E25E42] px-1 rounded text-[11px] font-mono border border-stone-800">{p.value}</code>;
        }
        if (p.type === 'rupee') {
          return <span key={pIdx} className="bg-[#E25E42]/10 border border-[#E25E42]/30 text-[#E25E42] px-1 py-0.5 rounded text-xs font-semibold">{p.value}</span>;
        }
        if (p.type === 'link') {
          return <a key={pIdx} href={p.value} target="_blank" rel="noopener noreferrer" className="text-[#E25E42] underline hover:text-[#F2785D] break-all">{p.value}</a>;
        }
        return p.value;
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc mb-1 leading-relaxed text-xs text-[#A39E93]">
            {inlineElements}
          </li>
        );
      }

      return (
        <p key={lineIdx} className={`mb-1.5 leading-relaxed text-xs ${trimmed === '' ? 'h-2' : ''} text-[#F3F0EA]`}>
          {inlineElements}
        </p>
      );
    });
  };

  const handleQuickLeagueSelect = (leagueKey) => {
    setSelectedLeague(leagueKey);
    fetchLiveSports(leagueKey);
  };

  const quickSearchButtons = [
    { label: 'ISL Table 🇮🇳', prompt: 'Show me the Indian Super League standings and top scorers.' },
    { label: 'Sunil Chhetri 🐐', prompt: 'Show statistics and accomplishments of Sunil Chhetri.' },
    { label: 'Live Scores ⚽', prompt: 'Show live matchday scores and match events.' },
    { label: 'Messi vs Ronaldo ⚡', prompt: 'Compare Lionel Messi and Cristiano Ronaldo stats and market values.' },
    { label: 'Mbappe Value ₹', prompt: 'What is Kylian Mbappe transfer fee and value in Rupees?' },
    { label: 'Tactics Corner 🧠', prompt: 'Explain the Gegenpressing tactic and 4-3-3 formation.' }
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Chat window panel */}
      {isOpen ? (
        <div className="w-[400px] h-[580px] max-w-[calc(100vw-32px)] glass-panel shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-stone-200/20 dark:border-stone-800/80 transition-all duration-300 ease-out transform scale-100 origin-bottom-right">
          
          {/* 1. Header Banner */}
          <div className="px-4 py-3 bg-gradient-to-r from-stone-905 to-[#171513] border-b border-stone-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E25E42] to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  ⚽
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-stone-900 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">FootyBot</h3>
                  <span className="bg-[#E25E42]/20 text-[#E25E42] text-[9px] font-extrabold uppercase px-1 rounded tracking-widest">
                    FREE AI
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#A39E93] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-ping"></span>
                  Grounded live scores & statistics
                </span>
              </div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#A39E93] hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 2. Custom Tabs (Chat | Live scores | Standings) */}
          <div className="grid grid-cols-3 border-b border-stone-800/60 bg-stone-950 text-xs font-semibold">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`py-2 text-center transition-all ${
                activeTab === 'chat' 
                  ? 'text-[#E25E42] border-b-2 border-[#E25E42] bg-[#E25E42]/5' 
                  : 'text-[#A39E93] hover:text-white hover:bg-stone-900'
              }`}
            >
              💬 AI Assistant
            </button>
            <button 
              onClick={() => setActiveTab('live')}
              className={`py-2 text-center transition-all ${
                activeTab === 'live' 
                  ? 'text-[#E25E42] border-b-2 border-[#E25E42] bg-[#E25E42]/5' 
                  : 'text-[#A39E93] hover:text-white hover:bg-stone-900'
              }`}
            >
              🏟️ Live Matches
            </button>
            <button 
              onClick={() => setActiveTab('standings')}
              className={`py-2 text-center transition-all ${
                activeTab === 'standings' 
                  ? 'text-[#E25E42] border-b-2 border-[#E25E42] bg-[#E25E42]/5' 
                  : 'text-[#A39E93] hover:text-white hover:bg-stone-900'
              }`}
            >
              🏆 Standings
            </button>
          </div>

          {/* 3. Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0C0B0A]">
            
            {/* A. AI CHAT TAB */}
            {activeTab === 'chat' && (
              <>
                {messages.map((m) => {
                  const isAI = m.role === 'assistant';
                  return (
                    <div key={m.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} items-start space-x-2`}>
                      {isAI && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E25E42] to-amber-500 flex items-center justify-center text-xs shadow-md shrink-0">
                          🤖
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md border ${
                        isAI 
                          ? 'bg-stone-900 border-stone-800 text-[#F3F0EA] rounded-tl-none' 
                          : 'bg-[#E25E42] border-[#E25E42]/45 text-white rounded-tr-none'
                      }`}>
                        {renderMessageContent(m.content)}
                        <span className="block text-[8px] text-right mt-1.5 opacity-55">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* AI Loading Thinking Dots */}
                {loading && (
                  <div className="flex justify-start items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E25E42] to-amber-500 flex items-center justify-center text-xs shadow shrink-0">
                      🤖
                    </div>
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5 shadow-md">
                      <div className="w-2 h-2 bg-[#E25E42] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#E25E42] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#E25E42] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* B. LIVE SCORES & FIXTURES TAB */}
            {activeTab === 'live' && (
              <div className="space-y-4">
                {sportsLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-2 border-[#E25E42] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {!sportsLoading && (
                  <>
                    <h4 className="text-xs font-bold text-[#E25E42] flex items-center">
                      <span className="mr-1.5">🏁</span>
                      Recent Match Scores
                    </h4>
                    
                    {liveData.liveScores.length === 0 ? (
                      <p className="text-[11px] text-[#A39E93]">No recent match scores available.</p>
                    ) : (
                      <div className="grid gap-2.5">
                        {liveData.liveScores.map(score => (
                          <div key={score.id} className="bg-stone-900 p-3 rounded-xl border border-stone-800 shadow">
                            <div className="flex justify-between items-center text-[10px] text-[#A39E93] mb-1.5">
                              <span>{score.league}</span>
                              <span className="text-[#E25E42] font-extrabold animate-pulse">{score.minute}</span>
                            </div>
                            <div className="grid grid-cols-7 items-center text-center">
                              <span className="col-span-3 text-xs font-bold text-white text-right">{score.home}</span>
                              <span className="col-span-1 bg-stone-950 py-1 rounded text-xs font-extrabold text-[#E25E42] mx-1.5">
                                {score.homeScore} - {score.awayScore}
                              </span>
                              <span className="col-span-3 text-xs font-bold text-white text-left">{score.away}</span>
                            </div>
                            {score.events.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] text-[#A39E93] text-center italic">
                                Timeline: {score.events.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <h4 className="text-xs font-bold text-white mt-4 flex items-center">
                      📅 Upcoming Fixtures (IST)
                    </h4>
                    <div className="grid gap-2">
                      {liveData.fixtures.map(f => (
                        <div key={f.id} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 text-xs">
                          <div className="flex justify-between font-bold text-stone-200">
                            <span>{f.home} vs {f.away}</span>
                            <span className="text-[#E25E42] text-[10px]">{f.league}</span>
                          </div>
                          <div className="text-[10px] text-[#A39E93] mt-1">
                            ⏰ {f.formattedDate} | 🏟️ {f.venue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* C. LEAGUE STANDINGS TAB */}
            {activeTab === 'standings' && (
              <div className="space-y-4">
                {/* League select dropdown */}
                <div className="flex items-center space-x-2">
                  <label className="text-[10px] font-bold text-[#A39E93] uppercase">League:</label>
                  <select 
                    value={selectedLeague}
                    onChange={(e) => handleQuickLeagueSelect(e.target.value)}
                    className="bg-stone-900 border border-stone-800 text-xs text-white rounded px-2.5 py-1 focus:ring-1 focus:ring-[#E25E42]"
                  >
                    <option value="isl">Indian Super League (ISL)</option>
                    <option value="premier league">English Premier League</option>
                    <option value="la liga">La Liga (Spain)</option>
                  </select>
                </div>

                {sportsLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-2 border-[#E25E42] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {!sportsLoading && (
                  <div className="space-y-4">
                    {/* Standings Table */}
                    <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
                      <div className="grid grid-cols-12 bg-stone-950 p-2 text-[10px] font-bold text-[#A39E93]">
                        <span className="col-span-1 text-center">#</span>
                        <span className="col-span-5">Club</span>
                        <span className="col-span-2 text-center">P</span>
                        <span className="col-span-2 text-center">GD</span>
                        <span className="col-span-2 text-center">PTS</span>
                      </div>
                      
                      <div className="divide-y divide-stone-800">
                        {liveData.standings.map((t) => (
                          <div key={t.pos} className="grid grid-cols-12 p-2 text-[11px] items-center">
                            <span className="col-span-1 text-center font-bold text-[#A39E93]">{t.pos}</span>
                            <span className="col-span-5 font-semibold text-white truncate">{t.team}</span>
                            <span className="col-span-2 text-center text-[#A39E93]">{t.played}</span>
                            <span className="col-span-2 text-center text-[#A39E93]">{t.goalsFor - t.goalsAgainst}</span>
                            <span className="col-span-2 text-center font-extrabold text-[#E25E42]">{t.points}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Goalscorers */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-2 flex items-center">
                        ⚽ Top Goalscorers
                      </h4>
                      <div className="bg-stone-900 rounded-xl border border-stone-800 divide-y divide-stone-800 overflow-hidden">
                        {liveData.topScorers.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2.5 text-xs">
                            <div>
                              <span className="font-bold text-white">{s.name}</span>
                              <span className="text-[10px] text-[#A39E93] block">{s.team}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-[#E25E42]">{s.goals} Goals</span>
                              <span className="text-[9px] text-[#A39E93] block">{s.assists} assists</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* 4. Suggested Questions Chips */}
          {activeTab === 'chat' && messages.length <= 1 && (
            <div className="px-4 py-2 bg-stone-950 border-t border-stone-900/50 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar shadow-inner">
              {quickSearchButtons.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.prompt)}
                  className="text-[10px] font-semibold bg-stone-900 hover:bg-[#E25E42]/10 text-stone-300 hover:text-[#E25E42] px-2.5 py-1 rounded-full border border-stone-850 hover:border-[#E25E42]/40 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* 5. Chat Footer Input Form */}
          {activeTab === 'chat' && (
            <div className="p-3 bg-stone-900 border-t border-stone-800/60 flex items-center space-x-2">
              <textarea
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask FootyBot..."
                disabled={loading}
                className="flex-1 bg-stone-950 text-white text-xs placeholder-stone-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E25E42] resize-none border border-stone-850 max-h-16 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-br from-[#E25E42] to-orange-600 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer active:scale-95'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
                aria-label="Send Message"
              >
                <svg className="w-3.5 h-3.5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          )}
          
        </div>
      ) : (
        /* 6. Floating Toggle Button */
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E25E42] to-orange-600 hover:from-orange-600 hover:to-red-600 flex items-center justify-center text-white shadow-2xl hover:shadow-orange-600/35 transform hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer relative border border-white/10"
          aria-label="Open Football Assistant"
        >
          {/* Live Notification Indicator */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-stone-900 shadow">
            1
          </span>
          <span className="text-2.5xl group-hover:rotate-180 transition-transform duration-700">⚽</span>
          <div className="absolute inset-0 rounded-full bg-[#E25E42]/20 -z-10 animate-ping opacity-60"></div>
        </button>
      )}
    </div>
  );
}
