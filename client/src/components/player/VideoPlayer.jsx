import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useApp } from '../../contexts/AppContext';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, SkipForward, Settings, Subtitles, HelpCircle, Lock } from 'lucide-react';

function VideoPlayer({ movie, onVideoEnd }) {
  const { token, user, savePlayhead } = useApp();
  const playerRef = useRef(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playedProgress, setPlayedProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [quality, setQuality] = useState('720p');
  
  // Custom overlays
  const [showSettings, setShowSettings] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);

  const isFree = false;

  // 1. Initial Ad Countdown Pre-Roll Trigger (Disabled - Free & Ad-Free)
  useEffect(() => {
    setIsPlaying(true);
  }, []);

  // 2. Playhead Auto-Save Play Progress Intervals
  useEffect(() => {
    if (playedSeconds > 10 && playedSeconds % 8 === 0) {
      savePlayhead(movie._id, Math.round(playedSeconds));
    }
  }, [playedSeconds, movie._id]);

  // 3. Skip Intro Logic (Display between 15s and 45s of video)
  useEffect(() => {
    if (playedSeconds >= 15 && playedSeconds <= 45) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }
  }, [playedSeconds]);

  // 4. Keyboard Shortcuts Hook Integration
  const keyboardHandlers = {
    onPlayPause: () => {
      if (showAd) return;
      setIsPlaying(prev => !prev);
    },
    onForward: () => {
      if (showAd) return;
      const current = playerRef.current?.getCurrentTime() || 0;
      playerRef.current?.seekTo(Math.min(current + 10, duration));
    },
    onRewind: () => {
      if (showAd) return;
      const current = playerRef.current?.getCurrentTime() || 0;
      playerRef.current?.seekTo(Math.max(current - 10, 0));
    },
    onFullscreen: () => {
      const container = document.getElementById('player-container');
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch((err) => console.error(err));
        } else {
          document.exitFullscreen();
        }
      }
    },
    onMute: () => {
      setIsMuted(prev => !prev);
    }
  };

  useKeyboard(keyboardHandlers);

  const handlePlayPause = () => {
    if (showAd) return;
    setIsPlaying(!isPlaying);
  };

  const handleSeekChange = (e) => {
    if (showAd) return;
    const seekToVal = parseFloat(e.target.value);
    setPlayedProgress(seekToVal);
    playerRef.current?.seekTo(seekToVal);
  };

  const handleSkipIntro = () => {
    playerRef.current?.seekTo(50); // Skip playhead to 50 seconds
    setShowSkipIntro(false);
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleQualityChange = (selectedQuality) => {
    if (['720p', '1080p', '1440p', '4K'].includes(selectedQuality) && isFree) {
      alert("This resolution is locked. Please upgrade to a Premium Subscription plan to unlock High Definition streaming (720p/1080p/4K).");
      return;
    }
    setQuality(selectedQuality);
    setShowSettings(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const adClip = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const streamingUrl = showAd ? adClip : `/api/matches/stream/${movie._id}?resolution=${quality}&token=${token}`;

  return (
    <div 
      id="player-container"
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-lg group border border-white/5 shadow-2xl"
    >
      <ReactPlayer 
        ref={playerRef}
        url={streamingUrl}
        playing={isPlaying}
        muted={isMuted}
        volume={volume}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={({ played, playedSeconds }) => {
          setPlayedProgress(played);
          setPlayedSeconds(playedSeconds);
        }}
        onDuration={(d) => setDuration(d)}
        onEnded={onVideoEnd}
      />

      {/* 1. Free Plan Countdown Ad Pre-Roll Overlay */}
      {showAd && (
        <div className="absolute inset-0 bg-[#000]/90 flex flex-col items-center justify-center z-30">
          <div className="text-center max-w-md px-6">
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black tracking-widest rounded uppercase">SPONSORED AD</span>
            <h3 className="text-xl font-black mt-3 text-white">FOOTYZONE Premium Commercial</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              You are watching standard free definition (480p). Unlock ad-free 4K catalog viewing by upgrading today.
            </p>
            <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin mx-auto mt-6" />
            <span className="block text-gray-500 text-xs mt-3 uppercase tracking-wider font-bold">
              Video begins in {adCountdown} seconds...
            </span>
          </div>
        </div>
      )}

      {/* 2. Floating Skip Intro Button */}
      {showSkipIntro && !showAd && (
        <button 
          onClick={handleSkipIntro}
          className="absolute bottom-24 right-8 bg-white/95 text-black hover:bg-red-600 hover:text-white px-5 py-3 rounded-md text-xs font-black tracking-widest uppercase transition-all shadow-xl z-20 flex items-center gap-2 border border-white/20 active:scale-95"
        >
          Skip Intro <SkipForward size={14} fill="currentColor" />
        </button>
      )}

      {/* 3. Media Controller HUD Layer */}
      {!showAd && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-20">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-sm">{movie.title}</span>
              <span className="text-[10px] bg-red-600/20 text-[#e50914] px-1.5 py-0.5 rounded font-black border border-red-600/30 uppercase tracking-widest">
                {quality}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              Shortcuts: <kbd className="bg-white/10 px-1 rounded">Space</kbd> Play/Pause • <kbd className="bg-white/10 px-1 rounded">F</kbd> Fullscreen
            </div>
          </div>

          {/* Center Play Indicator */}
          <div className="flex items-center justify-center">
            <button 
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-[#e50914] text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-white/10 shadow-2xl"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
          </div>

          {/* Bottom HUD Controls */}
          <div className="space-y-4">
            
            {/* Timeline Slider Progress bar */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-300">{formatTime(playedSeconds)}</span>
              <input 
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={playedProgress}
                onChange={handleSeekChange}
                className="flex-grow accent-[#e50914] h-1 bg-white/20 rounded-lg cursor-pointer outline-none transition-all hover:h-2"
              />
              <span className="text-[10px] font-bold text-gray-300">{formatTime(duration)}</span>
            </div>

            {/* Panel Buttons */}
            <div className="flex items-center justify-between">
              
              {/* Left Panel Actions */}
              <div className="flex items-center gap-5">
                <button onClick={handlePlayPause} className="text-gray-300 hover:text-white transition-colors">
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>

                <button 
                  onClick={() => playerRef.current?.seekTo(Math.max(playedSeconds - 10, 0))}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCcw size={20} />
                </button>

                <button 
                  onClick={() => playerRef.current?.seekTo(Math.min(playedSeconds + 10, duration))}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCw size={20} />
                </button>

                {/* Volume slider */}
                <div className="flex items-center gap-2 group/volume">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-gray-300 hover:text-white transition-colors">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1 accent-[#e50914] hidden group-hover/volume:block transition-all"
                  />
                </div>
              </div>

              {/* Right Panel Actions */}
              <div className="flex items-center gap-4 relative">
                
                {/* Speed and Quality Overlay Menu */}
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-300 hover:text-white transition-colors p-1"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute right-0 bottom-10 w-64 bg-[#0a0a0f]/95 border border-white/10 rounded-xl p-4 shadow-2xl z-30 space-y-4">
                    {/* Quality Switchers */}
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Video Quality</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['480p', '720p', '1080p', '4K'].map((q) => {
                          const locked = ['720p', '1080p', '4K'].includes(q) && isFree;
                          return (
                            <button
                              key={q}
                              onClick={() => handleQualityChange(q)}
                              className={`py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                                quality === q 
                                  ? 'bg-[#e50914] text-white' 
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              {q} {locked && <Lock size={8} className="text-yellow-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Speed Regulators */}
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Playback Speed</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`py-1 rounded text-[10px] font-bold transition-colors ${
                              playbackRate === rate 
                                ? 'bg-white text-black' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => keyboardHandlers.onFullscreen()}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Maximize2 size={20} />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default VideoPlayer;
