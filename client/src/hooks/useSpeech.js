import { useState, useEffect, useRef } from 'react';

export const useSpeech = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (onResult) onResult(text);
      };

      recognitionRef.current = rec;
    }
  }, [onResult]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice search recognition is not supported on this browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return { isListening, toggleListening };
};
