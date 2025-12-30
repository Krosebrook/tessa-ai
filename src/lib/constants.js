/**
 * Application-wide constants
 * Centralized location for magic numbers, strings, and configuration values
 */

// Voice Settings
export const VOICE_SETTINGS = {
  DEFAULT_SPEECH_RATE: 1.0,
  DEFAULT_PITCH: 1.1,
  DEFAULT_VOLUME: 1.0,
  MIN_SPEECH_RATE: 0.5,
  MAX_SPEECH_RATE: 2.0,
  MIN_PITCH: 0.5,
  MAX_PITCH: 2.0,
  MIN_VOLUME: 0.0,
  MAX_VOLUME: 1.0,
  SPEECH_RATE_STEP: 0.1,
  PITCH_STEP: 0.1,
  VOLUME_STEP: 0.1,
};

// Speech Recognition Settings
export const SPEECH_RECOGNITION = {
  LANGUAGE: 'en-US',
  CONTINUOUS: true,
  INTERIM_RESULTS: false,
  MAX_ALTERNATIVES: 1,
};

// Agent Configuration
export const AGENT_CONFIG = {
  NAME: 'tessa_assistant',
  CONTEXT_WINDOW_SIZE: 6, // Number of recent messages to include
  DEFAULT_GREETING: "Hi! I'm Tessa, your personal assistant. How can I help you today?",
  GREETING_DELAY: 1500, // ms to wait before initial greeting
};

// Status Messages
export const STATUS_MESSAGES = {
  INITIALIZING: 'Initializing...',
  READY: 'Ready to help',
  LISTENING: 'Listening for you...',
  THINKING: 'Thinking...',
  SPEAKING: 'Speaking...',
};

// Error Messages
export const ERROR_MESSAGES = {
  PROCESSING_ERROR: "I'm having trouble processing that right now. Could you try again?",
  INITIALIZATION_ERROR: 'Failed to initialize. Please refresh the page.',
  RECOGNITION_ERROR: 'Speech recognition error. Please try again.',
  SYNTHESIS_ERROR: 'Speech synthesis error.',
  NO_MICROPHONE: 'Microphone access is required. Please grant permission.',
};

// API Configuration
export const API_CONFIG = {
  LLM_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
};

// UI Configuration
export const UI_CONFIG = {
  MAX_CONVERSATION_HEIGHT: '60vh',
  ANIMATION_DURATION: 300, // ms
  TOAST_DURATION: 3000, // ms
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'base44_access_token',
  APP_ID: 'base44_app_id',
  FUNCTIONS_VERSION: 'base44_functions_version',
  FROM_URL: 'base44_from_url',
};

// Conversation Settings
export const CONVERSATION_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  AUTO_SAVE_DELAY: 2000, // ms
  MAX_STORED_CONVERSATIONS: 50,
};

// Performance Targets
export const PERFORMANCE_TARGETS = {
  FIRST_CONTENTFUL_PAINT: 1500, // ms
  TIME_TO_INTERACTIVE: 3000, // ms
  MAX_BUNDLE_SIZE: 500 * 1024, // 500KB
};

// Browser Support
export const BROWSER_REQUIREMENTS = {
  MIN_CHROME_VERSION: 88,
  MIN_EDGE_VERSION: 88,
  MIN_SAFARI_VERSION: 14.1,
  MIN_FIREFOX_VERSION: 78,
};

export default {
  VOICE_SETTINGS,
  SPEECH_RECOGNITION,
  AGENT_CONFIG,
  STATUS_MESSAGES,
  ERROR_MESSAGES,
  API_CONFIG,
  UI_CONFIG,
  STORAGE_KEYS,
  CONVERSATION_CONFIG,
  PERFORMANCE_TARGETS,
  BROWSER_REQUIREMENTS,
};
