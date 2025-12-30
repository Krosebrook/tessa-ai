import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing Tessa's voice input/output
 * Handles speech recognition and synthesis
 * 
 * @param {Object} voiceSettings - Voice configuration (pitch, rate, volume)
 * @returns {Object} Voice control functions and state
 */
const useTessaVoice = (voiceSettings = {}) => {
  const [tessaVoice, setTessaVoice] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = synth.getVoices();
      const foundVoice = voices.find(voice => voice.name.includes('Google US English Female')) 
        || voices.find(voice => voice.name.includes('Samantha')) 
        || voices.find(voice => voice.name.includes('Female') && voice.lang.startsWith('en'));
      setTessaVoice(foundVoice || voices.find(voice => voice.lang.startsWith('en')));
    };

    synth.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [synth]);

  // Update voice when settings change
  useEffect(() => {
    if (voiceSettings.preferred_voice_name) {
      const voices = synth.getVoices();
      const preferredVoice = voices.find(v => v.name === voiceSettings.preferred_voice_name);
      if (preferredVoice) {
        setTessaVoice(preferredVoice);
      }
    }
  }, [voiceSettings.preferred_voice_name, synth]);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error("Recognition already started.", e);
    }
  }, [isListening]);

  /**
   * Stop listening for voice input
   */
  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && isListening) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
  }, [isListening]);

  /**
   * Speak text using speech synthesis
   * @param {string} text - Text to speak
   * @param {Function} onEndCallback - Callback when speech ends
   */
  const speak = useCallback((text, onEndCallback) => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (tessaVoice) {
      utterance.voice = tessaVoice;
    }
    utterance.pitch = voiceSettings.pitch || 1.1;
    utterance.rate = voiceSettings.speech_rate || 1.0;
    utterance.volume = voiceSettings.volume || 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    synth.speak(utterance);
  }, [tessaVoice, synth, voiceSettings]);

  /**
   * Stop current speech
   */
  const stopSpeaking = useCallback(() => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);

  /**
   * Set up event handlers for recognition
   * @param {Function} onResult - Called when speech is recognized
   * @param {Function} onError - Called on recognition error
   */
  const setupRecognitionHandlers = useCallback((onResult, onError) => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Already stopped
        }
      }
      synth.cancel();
    };
  }, [synth]);

  return {
    isListening,
    isSpeaking,
    tessaVoice,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setupRecognitionHandlers,
    recognition: recognitionRef.current
  };
};

export default useTessaVoice;
