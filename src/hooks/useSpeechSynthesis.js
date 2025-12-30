import { useState, useEffect, useCallback, useRef } from 'react';
import { VOICE_SETTINGS } from '@/lib/constants';

/**
 * Custom hook for Web Speech Synthesis API
 * Manages speech synthesis lifecycle, voice selection, and settings
 * 
 * @param {Object} voiceSettings - Voice configuration settings
 * @param {Function} onStart - Callback when speech starts
 * @param {Function} onEnd - Callback when speech ends
 * @param {Function} onError - Callback when an error occurs
 * @returns {Object} Speech synthesis state and controls
 */
export const useSpeechSynthesis = ({ 
  voiceSettings = {},
  onStart,
  onEnd,
  onError 
} = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const synthRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = synthRef.current.getVoices();
        setVoices(availableVoices);

        // Auto-select a preferred voice
        const preferredVoice = 
          availableVoices.find(v => v.name === voiceSettings.preferred_voice_name) ||
          availableVoices.find(v => v.name.includes('Google US English Female')) ||
          availableVoices.find(v => v.name.includes('Samantha')) ||
          availableVoices.find(v => v.name.includes('Female') && v.lang.startsWith('en')) ||
          availableVoices.find(v => v.lang.startsWith('en'));
        
        setSelectedVoice(preferredVoice);
      };

      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;

      return () => {
        if (synthRef.current) {
          synthRef.current.onvoiceschanged = null;
          synthRef.current.cancel();
        }
      };
    } else {
      console.warn('Speech Synthesis API not supported');
      setIsSupported(false);
    }
  }, [voiceSettings.preferred_voice_name]);

  // Update selected voice when preference changes
  useEffect(() => {
    if (voiceSettings.preferred_voice_name && voices.length > 0) {
      const voice = voices.find(v => v.name === voiceSettings.preferred_voice_name);
      if (voice) {
        setSelectedVoice(voice);
      }
    }
  }, [voiceSettings.preferred_voice_name, voices]);

  const speak = useCallback((text, options = {}) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Apply settings
    utterance.pitch = voiceSettings.pitch ?? VOICE_SETTINGS.DEFAULT_PITCH;
    utterance.rate = voiceSettings.speech_rate ?? VOICE_SETTINGS.DEFAULT_SPEECH_RATE;
    utterance.volume = voiceSettings.volume ?? VOICE_SETTINGS.DEFAULT_VOLUME;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onStart) {
        onStart();
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) {
        onEnd();
      }
      if (options.onComplete) {
        options.onComplete();
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      if (onError) {
        onError(event.error);
      }
    };

    synthRef.current.speak(utterance);
  }, [selectedVoice, voiceSettings, onStart, onEnd, onError]);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    cancel,
    pause,
    resume,
  };
};

export default useSpeechSynthesis;
