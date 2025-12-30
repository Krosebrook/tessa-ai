import { useState, useEffect, useCallback, useRef } from 'react';
import { SPEECH_RECOGNITION, STATUS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Custom hook for Web Speech Recognition API
 * Manages speech recognition lifecycle, state, and event handling
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onResult - Callback when speech is recognized
 * @param {Function} options.onError - Callback when an error occurs
 * @returns {Object} Speech recognition state and controls
 */
export const useSpeechRecognition = ({ onResult, onError } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if Speech Recognition API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = SPEECH_RECOGNITION.CONTINUOUS;
      recognition.lang = SPEECH_RECOGNITION.LANGUAGE;
      recognition.interimResults = SPEECH_RECOGNITION.INTERIM_RESULTS;
      recognition.maxAlternatives = SPEECH_RECOGNITION.MAX_ALTERNATIVES;

      recognitionRef.current = recognition;
      setIsSupported(true);

      // Set up event handlers
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (onResult) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (onError) {
          onError(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onstart = () => {
        setIsListening(true);
      };
    } else {
      console.warn('Speech Recognition API not supported');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, [onResult, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      if (onError) {
        onError(error.message);
      }
    }
  }, [isListening, onError]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, [isListening]);

  const abort = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.abort();
      setIsListening(false);
    } catch (error) {
      console.error('Error aborting recognition:', error);
    }
  }, []);

  return {
    isListening,
    isSupported,
    start,
    stop,
    abort,
  };
};

export default useSpeechRecognition;
