import '@testing-library/jest-dom';

// Mock window.speechSynthesis
global.speechSynthesis = {
  getVoices: jest.fn(() => []),
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  speaking: false,
  pending: false,
  paused: false,
};

// Mock window.SpeechRecognition
global.SpeechRecognition = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  continuous: true,
  lang: 'en-US',
  interimResults: false,
  maxAlternatives: 1,
  onresult: null,
  onerror: null,
  onend: null,
  onstart: null,
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
});
