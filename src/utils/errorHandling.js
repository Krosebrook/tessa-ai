/**
 * Error handling utilities for Tessa AI
 * Provides retry logic, exponential backoff, and error classification
 */

/**
 * Checks if the browser is online
 * @returns {boolean} True if online, false if offline
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Checks if Web Speech API is available
 * @returns {boolean} True if available, false otherwise
 */
export const isSpeechRecognitionAvailable = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Checks if Speech Synthesis is available
 * @returns {boolean} True if available, false otherwise
 */
export const isSpeechSynthesisAvailable = () => {
  return !!window.speechSynthesis;
};

/**
 * Executes a function with exponential backoff retry logic
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @returns {Promise} Result of the function or throws error after max retries
 */
export const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've exhausted attempts or shouldn't retry this error
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Executes a function with a timeout
 * @param {Function} fn - Async function to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMessage - Error message for timeout
 * @returns {Promise} Result of the function or timeout error
 */
export const withTimeout = async (fn, timeoutMs = 30000, timeoutMessage = 'Operation timed out') => {
  return Promise.race([
    fn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
};

/**
 * Classifies errors into categories for better handling
 * @param {Error} error - Error to classify
 * @returns {string} Error category
 */
export const classifyError = (error) => {
  if (!error) return 'unknown';
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorType = error.name?.toLowerCase() || '';
  
  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout') ||
      errorType === 'networkerror') {
    return 'network';
  }
  
  // Authentication errors
  if (errorMessage.includes('auth') || 
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      error.status === 401 || error.status === 403) {
    return 'auth';
  }
  
  // Speech API errors
  if (errorMessage.includes('speech') ||
      errorMessage.includes('recognition') ||
      errorMessage.includes('synthesis') ||
      errorMessage.includes('microphone')) {
    return 'speech';
  }
  
  // LLM/API errors
  if (errorMessage.includes('llm') ||
      errorMessage.includes('agent') ||
      errorMessage.includes('conversation') ||
      error.status >= 500) {
    return 'api';
  }
  
  return 'unknown';
};

/**
 * Gets a user-friendly error message based on error type
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  const category = classifyError(error);
  
  const messages = {
    network: "I'm having trouble connecting. Please check your internet connection and try again.",
    auth: "There was an authentication issue. Please try logging in again.",
    speech: "I'm having trouble with the microphone or speaker. Please check your device permissions.",
    api: "I'm experiencing some technical difficulties. Please try again in a moment.",
    unknown: "Something unexpected happened. Please try again.",
  };
  
  return messages[category] || messages.unknown;
};

/**
 * Determines if an error should be retried
 * @param {Error} error - Error to check
 * @returns {boolean} True if error should be retried
 */
export const shouldRetryError = (error) => {
  const category = classifyError(error);
  
  // Retry network and API errors, but not auth or speech errors
  return category === 'network' || category === 'api';
};

/**
 * Handles speech recognition errors with appropriate actions
 * @param {Event} event - Speech recognition error event
 * @returns {Object} Error handling result with action and message
 */
export const handleSpeechRecognitionError = (event) => {
  const error = event.error;
  
  const errorHandlers = {
    'no-speech': {
      action: 'retry',
      message: "I didn't hear anything. Could you try speaking again?",
      shouldRestart: true
    },
    'audio-capture': {
      action: 'permission',
      message: "I can't access the microphone. Please check your permissions.",
      shouldRestart: false
    },
    'not-allowed': {
      action: 'permission',
      message: "Microphone permission was denied. Please enable it in your browser settings.",
      shouldRestart: false
    },
    'network': {
      action: 'retry',
      message: "Network connection issue. Please check your internet and try again.",
      shouldRestart: true
    },
    'aborted': {
      action: 'ignore',
      message: null,
      shouldRestart: false
    },
    'service-not-allowed': {
      action: 'error',
      message: "Speech recognition is not allowed. Please check your browser settings.",
      shouldRestart: false
    }
  };
  
  return errorHandlers[error] || {
    action: 'retry',
    message: "Something went wrong with speech recognition. Let's try again.",
    shouldRestart: true
  };
};

/**
 * Creates a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
