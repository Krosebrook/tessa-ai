/**
 * Tessa AI Configuration
 * Central configuration file for constants, settings, and defaults
 */

/**
 * Agent Configuration
 */
export const AGENT_CONFIG = {
  name: 'tessa_assistant',
  personality: 'Warm, friendly, and helpful',
  contextWindowSize: 6, // Number of recent messages to include in context
  maxResponseLength: 3, // Maximum sentences in voice response
};

/**
 * Voice Settings Defaults
 */
export const VOICE_DEFAULTS = {
  speech_rate: 1.0,
  pitch: 1.1,
  volume: 1.0,
  language: 'en-US',
};

/**
 * Voice Recognition Configuration
 */
export const RECOGNITION_CONFIG = {
  continuous: true,
  interimResults: false,
  language: 'en-US',
};

/**
 * System Prompt Template
 * @param {Array} recentMessages - Recent conversation messages
 * @param {string} userText - Current user input
 * @returns {string} Formatted prompt
 */
export const buildSystemPrompt = (recentMessages, userText) => {
  return `You are Tessa, a helpful and friendly personal assistant. You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.`;
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NO_UNDERSTANDING: "I'm sorry, I didn't quite understand that. Could you rephrase?",
  PROCESSING_ERROR: "I'm having trouble processing that right now. Could you try again?",
  NO_MICROPHONE: "I can't access your microphone. Please check your browser permissions.",
  NO_CONVERSATION: "I couldn't load our conversation. Please refresh the page.",
  NETWORK_ERROR: "I'm having connection issues. Please check your internet connection.",
  RATE_LIMIT: "I'm a bit overwhelmed right now. Please try again in a moment.",
};

/**
 * Status Messages
 */
export const STATUS_MESSAGES = {
  INITIALIZING: 'Initializing...',
  READY: 'Ready to help',
  LISTENING: 'Listening for you...',
  THINKING: 'Thinking...',
  SPEAKING: 'Speaking...',
};

/**
 * Greeting Configuration
 */
export const GREETING_CONFIG = {
  message: "Hi! I'm Tessa, your personal assistant. How can I help you today?",
  delay: 1500, // ms before greeting
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  conversationMaxHeight: '60vh',
  messageMaxWidth: '32rem', // max-w-xl
  typingSpeed: 50, // ms per character
  animationDuration: {
    hudPulse: 4000, // ms
    ringRotation: 20000, // ms
    particleMotion: 0.4, // units per frame
  },
};

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  debounceSettingsMs: 500, // Debounce settings save
  maxConversationLength: 100, // Archive after this many messages
  cacheTimeout: 300000, // 5 minutes
};

/**
 * Feature Flags
 * Enable/disable features for gradual rollout or testing
 */
export const FEATURE_FLAGS = {
  enableVoiceActivityDetection: false,
  enableStreamingResponses: false,
  enableMultiLanguage: false,
  enableConversationExport: false,
  enableAnalytics: false,
};

/**
 * Development Configuration
 */
export const DEV_CONFIG = {
  enableDebugLogging: import.meta.env.DEV,
  mockLLMResponses: false,
  skipAuthentication: false,
};

/**
 * Helper function to check if a feature is enabled
 * @param {string} featureName - Name of the feature
 * @returns {boolean} Whether feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURE_FLAGS[featureName] === true;
};

/**
 * Helper function for debug logging
 * @param  {...any} args - Arguments to log
 */
export const debugLog = (...args) => {
  if (DEV_CONFIG.enableDebugLogging) {
    console.log('[Tessa]', ...args);
  }
};

export default {
  AGENT_CONFIG,
  VOICE_DEFAULTS,
  RECOGNITION_CONFIG,
  buildSystemPrompt,
  ERROR_MESSAGES,
  STATUS_MESSAGES,
  GREETING_CONFIG,
  UI_CONFIG,
  PERFORMANCE_CONFIG,
  FEATURE_FLAGS,
  DEV_CONFIG,
  isFeatureEnabled,
  debugLog,
};
