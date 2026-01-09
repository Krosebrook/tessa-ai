/**
 * Tests for error handling utilities
 */
import {
  isOnline,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  withRetry,
  withTimeout,
  classifyError,
  getUserFriendlyErrorMessage,
  shouldRetryError,
  handleSpeechRecognitionError,
  debounce,
} from '../errorHandling';

describe('errorHandling utilities', () => {
  describe('isOnline', () => {
    it('should return true when navigator is online', () => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator is offline', () => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      expect(isOnline()).toBe(false);
    });
  });

  describe('isSpeechRecognitionAvailable', () => {
    it('should return true when SpeechRecognition is available', () => {
      global.SpeechRecognition = jest.fn();
      expect(isSpeechRecognitionAvailable()).toBe(true);
    });

    it('should return true when webkitSpeechRecognition is available', () => {
      delete global.SpeechRecognition;
      global.webkitSpeechRecognition = jest.fn();
      expect(isSpeechRecognitionAvailable()).toBe(true);
      global.SpeechRecognition = global.webkitSpeechRecognition; // Restore
    });
  });

  describe('isSpeechSynthesisAvailable', () => {
    it('should return true when speechSynthesis is available', () => {
      expect(isSpeechSynthesisAvailable()).toBe(true);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(mockFn);
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const result = await withRetry(mockFn, { 
        maxRetries: 3, 
        initialDelay: 10 
      });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('persistent failure'));
      
      await expect(
        withRetry(mockFn, { maxRetries: 2, initialDelay: 10 })
      ).rejects.toThrow('persistent failure');
      
      expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should respect shouldRetry function', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('no retry'));
      const shouldRetry = jest.fn().mockReturnValue(false);
      
      await expect(
        withRetry(mockFn, { maxRetries: 2, shouldRetry })
      ).rejects.toThrow('no retry');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalled();
    });
  });

  describe('withTimeout', () => {
    it('should resolve if function completes before timeout', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await withTimeout(mockFn, 1000);
      expect(result).toBe('success');
    });

    it('should reject if function exceeds timeout', async () => {
      const mockFn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 2000)));
      
      await expect(
        withTimeout(mockFn, 100, 'Timeout exceeded')
      ).rejects.toThrow('Timeout exceeded');
    });
  });

  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error = new Error('network request failed');
      expect(classifyError(error)).toBe('network');
    });

    it('should classify auth errors', () => {
      const error = new Error('unauthorized access');
      expect(classifyError(error)).toBe('auth');
    });

    it('should classify speech errors', () => {
      const error = new Error('speech recognition failed');
      expect(classifyError(error)).toBe('speech');
    });

    it('should classify API errors', () => {
      const error = new Error('LLM request failed');
      expect(classifyError(error)).toBe('api');
    });

    it('should return unknown for unrecognized errors', () => {
      const error = new Error('something strange');
      expect(classifyError(error)).toBe('unknown');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return friendly message for network errors', () => {
      const error = new Error('fetch failed');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('internet connection');
    });

    it('should return friendly message for auth errors', () => {
      const error = { status: 401, message: 'unauthorized' };
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('authentication');
    });
  });

  describe('shouldRetryError', () => {
    it('should retry network errors', () => {
      const error = new Error('network timeout');
      expect(shouldRetryError(error)).toBe(true);
    });

    it('should retry API errors', () => {
      const error = new Error('llm request failed');
      expect(shouldRetryError(error)).toBe(true);
    });

    it('should not retry auth errors', () => {
      const error = new Error('unauthorized');
      expect(shouldRetryError(error)).toBe(false);
    });

    it('should not retry speech errors', () => {
      const error = new Error('microphone not found');
      expect(shouldRetryError(error)).toBe(false);
    });
  });

  describe('handleSpeechRecognitionError', () => {
    it('should handle no-speech error', () => {
      const event = { error: 'no-speech' };
      const result = handleSpeechRecognitionError(event);
      expect(result.action).toBe('retry');
      expect(result.shouldRestart).toBe(true);
    });

    it('should handle audio-capture error', () => {
      const event = { error: 'audio-capture' };
      const result = handleSpeechRecognitionError(event);
      expect(result.action).toBe('permission');
      expect(result.shouldRestart).toBe(false);
    });

    it('should handle not-allowed error', () => {
      const event = { error: 'not-allowed' };
      const result = handleSpeechRecognitionError(event);
      expect(result.action).toBe('permission');
      expect(result.message).toContain('permission');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
