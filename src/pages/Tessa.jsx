/**
 * Tessa AI - Main Voice Assistant Page
 * Refactored to use custom hooks for better code organization
 */
import React, { useState, useEffect, useRef } from 'react';
import HudCircle from '../components/tessa/HudCircle';
import TypingMessage from '../components/tessa/TypingMessage';
import SettingsPanel from '../components/tessa/SettingsPanel';
import SpeechApiCheck from '../components/SpeechApiCheck';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import useTessaConversation from '@/hooks/useTessaConversation';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';
import useTessaSettings from '@/hooks/useTessaSettings';
import { 
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  handleSpeechRecognitionError,
  isOnline
} from '@/utils/errorHandling';
import { 
  AGENT_CONFIG, 
  STATUS_MESSAGES 
} from '@/lib/constants';

/**
 * Main Tessa page component
 * Manages voice interaction, conversation state, and UI
 */
const TessaPage = () => {
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeechApiWarning, setShowSpeechApiWarning] = useState(false);
  const [tessaStatus, setTessaStatus] = useState(STATUS_MESSAGES.INITIALIZING);
  
  // Refs
  const initialGreetingSpoken = useRef(false);

  // Custom hooks
  const {
    conversation,
    conversationId,
    isProcessing,
    addMessageToConversation,
    processWithLLM,
  } = useTessaConversation();

  const { settings, updateSettings } = useTessaSettings();
  
  const {
    isSpeaking,
    isSupported: isSynthesisSupported,
    speak,
    cancel: cancelSpeech,
  } = useSpeechSynthesis({
    voiceSettings: settings?.voice_settings || {},
    onStart: () => setTessaStatus(STATUS_MESSAGES.SPEAKING),
    onEnd: () => setTessaStatus(STATUS_MESSAGES.READY),
  });

  const {
    isListening,
    isSupported: isRecognitionSupported,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({
    onResult: (transcript) => {
      // Add user message to conversation
      addMessageToConversation('user', transcript);
      
      // Process with LLM
      handleUserInput(transcript);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      
      // Handle error appropriately
      const errorHandling = handleSpeechRecognitionError({ error });
      
      if (errorHandling.message) {
        addMessageToConversation('tessa', errorHandling.message, true);
        if (isSynthesisSupported) {
          speak(errorHandling.message);
        }
      }
      
      // Restart if appropriate
      if (errorHandling.shouldRestart && isRecognitionSupported) {
        setTimeout(() => startListening(), 1000);
      }
    },
  });

  // Check for Speech API support on mount
  useEffect(() => {
    if (!isSpeechRecognitionAvailable() || !isSpeechSynthesisAvailable()) {
      setShowSpeechApiWarning(true);
    }
  }, []);

  /**
   * Handle user input by processing with LLM and speaking response
   * @param {string} userText - User's transcribed speech
   */
  const handleUserInput = async (userText) => {
    // Check online status
    if (!isOnline()) {
      const errorMsg = "You're offline. Please check your internet connection.";
      addMessageToConversation('tessa', errorMsg, true);
      if (isSynthesisSupported) {
        speak(errorMsg);
      }
      return;
    }

    setTessaStatus(STATUS_MESSAGES.THINKING);

    // Process with LLM
    const response = await processWithLLM(userText);
    
    if (response) {
      // Add Tessa's response with typing animation
      addMessageToConversation('tessa', response, true);
      
      // Speak the response
      if (isSynthesisSupported) {
        speak(response, {
          onComplete: () => {
            // Restart listening after speaking
            if (isRecognitionSupported) {
              startListening();
            }
          }
        });
      } else {
        // No synthesis, just restart listening
        if (isRecognitionSupported) {
          startListening();
        }
      }
    }
    
    setTessaStatus(STATUS_MESSAGES.READY);
  };

  /**
   * Speak the initial greeting when conversation is ready
   */
  useEffect(() => {
    if (!initialGreetingSpoken.current && conversationId) {
      const greetingTimeout = setTimeout(() => {
        const greeting = AGENT_CONFIG.DEFAULT_GREETING;
        addMessageToConversation('tessa', greeting, true);
        
        if (isSynthesisSupported) {
          speak(greeting, {
            onComplete: () => {
              if (isRecognitionSupported) {
                startListening();
              }
            }
          });
        } else if (isRecognitionSupported) {
          // No synthesis, just start listening
          startListening();
        }
        
        initialGreetingSpoken.current = true;
      }, AGENT_CONFIG.GREETING_DELAY);

      return () => clearTimeout(greetingTimeout);
    }
  }, [conversationId, addMessageToConversation, speak, startListening, isSynthesisSupported, isRecognitionSupported]);

  /**
   * Update status based on listening and speaking state
   */
  useEffect(() => {
    if (isListening) {
      setTessaStatus(STATUS_MESSAGES.LISTENING);
    } else if (isSpeaking) {
      setTessaStatus(STATUS_MESSAGES.SPEAKING);
    } else if (!isProcessing) {
      setTessaStatus(STATUS_MESSAGES.READY);
    }
  }, [isListening, isSpeaking, isProcessing]);

  /**
   * Handle settings updates with error handling
   * @param {Object} newSettings - Updated settings
   */
  const handleSettingsUpdate = async (newSettings) => {
    const success = await updateSettings(newSettings);
    if (!success) {
      // Could add toast notification here in the future
      console.error('Failed to update settings');
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopListening();
      cancelSpeech();
    };
  }, [stopListening, cancelSpeech]);

  return (
    <>
      {showSpeechApiWarning && (
        <SpeechApiCheck onDismiss={() => setShowSpeechApiWarning(false)} />
      )}
      
      <div className="flex flex-col items-center justify-center h-screen w-full text-white p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 z-10 text-purple-300 hover:text-white hover:bg-purple-800/50"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <HudCircle 
          status={tessaStatus} 
          isSpeaking={isSpeaking} 
          isListening={isListening} 
        />

        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end p-8 pt-20 pointer-events-none">
          <div className="w-full max-w-4xl mx-auto space-y-4 overflow-y-auto max-h-[60vh]">
            {conversation.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xl text-shadow-md backdrop-blur-sm ${
                    msg.sender === 'user'
                      ? 'bg-rose-500/10 border border-rose-400/20 text-right'
                      : 'bg-purple-500/10 border border-purple-400/20 text-left'
                  }`}
                  style={{
                    boxShadow: `0 0 15px ${msg.sender === 'user' ? 'rgba(244, 114, 182, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
                    textShadow: '0 0 5px rgba(255,255,255,0.3)',
                  }}
                >
                  {msg.isTyping && msg.sender === 'tessa' ? (
                    <TypingMessage 
                      text={msg.text} 
                      onComplete={() => addMessageToConversation('tessa', msg.text, false)} 
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            onSettingsUpdate={handleSettingsUpdate}
          />
        )}
      </div>
    </>
  );
};

export default TessaPage;
