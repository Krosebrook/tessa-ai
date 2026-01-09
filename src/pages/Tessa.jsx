import React, { useState, useEffect, useCallback, useRef } from 'react';
import HudCircle from '../components/tessa/HudCircle';
import TypingMessage from '../components/tessa/TypingMessage';
import SettingsPanel from '../components/tessa/SettingsPanel';
import SpeechApiCheck from '../components/SpeechApiCheck';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { 
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  withRetry,
  withTimeout,
  getUserFriendlyErrorMessage,
  shouldRetryError,
  handleSpeechRecognitionError,
  isOnline
} from '@/utils/errorHandling';
import { 
  AGENT_CONFIG, 
  STATUS_MESSAGES, 
  API_CONFIG
} from '@/lib/constants';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

const TessaPage = () => {
  const [showSpeechApiWarning, setShowSpeechApiWarning] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [tessaStatus, setTessaStatus] = useState('Initializing...');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [tessaVoice, setTessaVoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    speech_rate: 1.0,
    pitch: 1.1,
    volume: 1.0
  });
  
  const initialGreetingSpoken = useRef(false);
  const synth = window.speechSynthesis;

  // Check for Speech API support on mount
  useEffect(() => {
    if (!isSpeechRecognitionAvailable() || !isSpeechSynthesisAvailable()) {
      setShowSpeechApiWarning(true);
    }
  }, []);

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

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await base44.entities.UserPreferences.list();
        if (prefs && prefs.length > 0 && prefs[0].voice_settings) {
          setVoiceSettings(prefs[0].voice_settings);
          
          if (prefs[0].voice_settings.preferred_voice_name) {
            const voices = synth.getVoices();
            const preferredVoice = voices.find(v => v.name === prefs[0].voice_settings.preferred_voice_name);
            if (preferredVoice) {
              setTessaVoice(preferredVoice);
            }
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    if (synth.getVoices().length > 0) {
      loadPreferences();
    } else {
      synth.onvoiceschanged = () => {
        loadPreferences();
      };
    }
  }, [synth]);

  // Load or create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const user = await base44.auth.me();
        const conversations = await base44.agents.listConversations({
          agent_name: 'tessa_assistant'
        });
        
        if (conversations && conversations.length > 0) {
          const lastConversation = conversations[0];
          setConversationId(lastConversation.id);
          
          if (lastConversation.messages && lastConversation.messages.length > 0) {
            const formattedMessages = lastConversation.messages.map(msg => ({
              sender: msg.role === 'user' ? 'user' : 'tessa',
              text: msg.content,
              isTyping: false
            }));
            setConversation(formattedMessages);
          }
        } else {
          const newConversation = await base44.agents.createConversation({
            agent_name: 'tessa_assistant',
            metadata: {
              name: 'Tessa Session',
              description: `Personal assistant session for ${user.full_name}`
            }
          });
          setConversationId(newConversation.id);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };

    initConversation();
  }, []);

  const addMessageToConversation = useCallback((sender, text, isTyping = false) => {
    const newMessage = { sender, text, isTyping };
    if (isTyping) {
      setCurrentMessage(text);
      setConversation(prev => [...prev, newMessage]);
    } else {
      setConversation(prev => {
        const newConv = [...prev];
        const lastMsg = newConv[newConv.length - 1];
        if (lastMsg && lastMsg.isTyping) {
          lastMsg.isTyping = false;
          lastMsg.text = text;
        } else {
           newConv.push(newMessage);
        }
        return newConv;
      });
      setCurrentMessage('');
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognition || isListening) return;
    try {
      recognition.start();
      setIsListening(true);
      setTessaStatus('Listening for you...');
    } catch(e) {
      console.error("Recognition already started.", e);
    }
  }, [isListening]);

  const speak = useCallback((text, onEndCallback) => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (tessaVoice) {
      utterance.voice = tessaVoice;
    }
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.speech_rate;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setTessaStatus('Speaking...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTessaStatus('Ready to help');
      if(onEndCallback) onEndCallback();
    };

    synth.speak(utterance);
  }, [tessaVoice, synth, voiceSettings]);

  const processUserInput = useCallback(async (userText) => {
    if (!conversationId || isProcessing) return;
    
    // Check if online before processing
    if (!isOnline()) {
      const errorMsg = "You're offline. Please check your internet connection.";
      addMessageToConversation('tessa', errorMsg, true);
      if (isSpeechSynthesisAvailable()) {
        speak(errorMsg);
      }
      return;
    }
    
    setIsProcessing(true);
    setTessaStatus(STATUS_MESSAGES.THINKING);
    
    try {
      // Get conversation with retry logic
      const conversationData = await withRetry(
        () => base44.agents.getConversation(conversationId),
        {
          maxRetries: API_CONFIG.MAX_RETRIES,
          initialDelay: API_CONFIG.RETRY_DELAY,
          shouldRetry: shouldRetryError
        }
      );
      
      await base44.agents.addMessage(conversationData, {
        role: 'user',
        content: userText
      });
      
      const recentMessages = conversation.slice(-AGENT_CONFIG.CONTEXT_WINDOW_SIZE).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      const contextPrompt = `You are Tessa, a helpful and friendly personal assistant. You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.`;

      // Call LLM with timeout and retry
      const response = await withTimeout(
        () => withRetry(
          () => base44.integrations.Core.InvokeLLM({
            prompt: contextPrompt,
            add_context_from_internet: false
          }),
          {
            maxRetries: API_CONFIG.MAX_RETRIES,
            initialDelay: API_CONFIG.RETRY_DELAY,
            shouldRetry: shouldRetryError
          }
        ),
        API_CONFIG.LLM_TIMEOUT,
        'LLM request timed out'
      );
      
      const tessaResponse = response || "I'm sorry, I didn't quite understand that. Could you rephrase?";
      
      await base44.agents.addMessage(conversationData, {
        role: 'assistant',
        content: tessaResponse
      });
      
      addMessageToConversation('tessa', tessaResponse, true);
      speak(tessaResponse, () => {
        startListening();
      });
      
    } catch (error) {
      console.error('Error processing user input:', error);
      
      // Get user-friendly error message
      const errorMsg = getUserFriendlyErrorMessage(error);
      addMessageToConversation('tessa', errorMsg, true);
      
      if (isSpeechSynthesisAvailable()) {
        speak(errorMsg);
      }
    } finally {
      setIsProcessing(false);
      setTessaStatus(STATUS_MESSAGES.READY);
    }
  }, [conversationId, isProcessing, conversation, addMessageToConversation, speak, startListening]);

  useEffect(() => {
    if (!initialGreetingSpoken.current && conversationId) {
      const greetingTimeout = setTimeout(() => {
        const greeting = AGENT_CONFIG.DEFAULT_GREETING;
        addMessageToConversation('tessa', greeting, true);
        if (isSpeechSynthesisAvailable()) {
          speak(greeting, () => {
            if (isSpeechRecognitionAvailable()) {
              startListening();
            }
          });
        } else {
          // If no speech synthesis, at least start listening
          if (isSpeechRecognitionAvailable()) {
            startListening();
          }
        }
        initialGreetingSpoken.current = true;
      }, AGENT_CONFIG.GREETING_DELAY);

      return () => clearTimeout(greetingTimeout);
    }
  }, [conversationId, addMessageToConversation, speak, startListening]);

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        
        addMessageToConversation('user', transcript);
        
        if (recognition) {
          try {
            recognition.stop();
          } catch(e) {
            console.error("Error stopping recognition:", e);
          }
        }
        
        processUserInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // Handle error with appropriate action
        const errorHandling = handleSpeechRecognitionError(event);
        
        setIsListening(false);
        
        // Show user-friendly message if needed
        if (errorHandling.message) {
          addMessageToConversation('tessa', errorHandling.message, true);
          if (isSpeechSynthesisAvailable()) {
            speak(errorHandling.message);
          }
        }
        
        // Restart recognition if appropriate
        if (errorHandling.shouldRestart && isSpeechRecognitionAvailable()) {
          setTimeout(() => {
            startListening();
          }, 1000);
        } else {
          setTessaStatus(STATUS_MESSAGES.READY);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if(!synth.speaking && !isProcessing) {
           setTessaStatus('Ready to help');
        }
      };
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch(e) {
          // Already stopped
        }
      }
      synth.cancel();
    };
  }, [addMessageToConversation, processUserInput, synth, isProcessing]);

  const handleSettingsUpdate = (newSettings) => {
    if (newSettings.voice_settings) {
      setVoiceSettings(newSettings.voice_settings);
      
      if (newSettings.voice_settings.preferred_voice_name) {
        const voices = synth.getVoices();
        const preferredVoice = voices.find(v => v.name === newSettings.voice_settings.preferred_voice_name);
        if (preferredVoice) {
          setTessaVoice(preferredVoice);
        }
      }
    }
  };

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
      >
        <Settings className="w-5 h-5" />
      </Button>

      <HudCircle status={tessaStatus} isSpeaking={isSpeaking} isListening={isListening} />

      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end p-8 pt-20 pointer-events-none">
        <div className="w-full max-w-4xl mx-auto space-y-4 overflow-y-auto max-h-[60vh]">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                  <TypingMessage text={msg.text} onComplete={() => addMessageToConversation('tessa', msg.text, false)} />
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