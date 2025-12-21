import React, { useState, useEffect, useCallback, useRef } from 'react';
import HudCircle from '../components/tessa/HudCircle';
import TypingMessage from '../components/tessa/TypingMessage';
import SettingsPanel from '../components/tessa/SettingsPanel';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

const TessaPage = () => {
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
    
    setIsProcessing(true);
    setTessaStatus('Thinking...');
    
    try {
      const conversationData = await base44.agents.getConversation(conversationId);
      
      await base44.agents.addMessage(conversationData, {
        role: 'user',
        content: userText
      });
      
      const recentMessages = conversation.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      const contextPrompt = `You are Tessa, a helpful and friendly personal assistant. You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });
      
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
      const errorMsg = "I'm having trouble processing that right now. Could you try again?";
      addMessageToConversation('tessa', errorMsg, true);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [conversationId, isProcessing, conversation, addMessageToConversation, speak, startListening]);

  useEffect(() => {
    if (!initialGreetingSpoken.current && conversationId) {
      const greetingTimeout = setTimeout(() => {
        const greeting = "Hi! I'm Tessa, your personal assistant. How can I help you today?";
        addMessageToConversation('tessa', greeting, true);
        speak(greeting, () => {
          startListening();
        });
        initialGreetingSpoken.current = true;
      }, 1500);

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
        setIsListening(false);
        setTessaStatus('Ready to help');
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
  );
};

export default TessaPage;