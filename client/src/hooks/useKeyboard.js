import { useEffect } from 'react';

export const useKeyboard = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (handlers.onPlayPause) handlers.onPlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (handlers.onForward) handlers.onForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (handlers.onRewind) handlers.onRewind();
          break;
        case 'KeyF':
          e.preventDefault();
          if (handlers.onFullscreen) handlers.onFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          if (handlers.onMute) handlers.onMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
};
