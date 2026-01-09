import React from 'react';
import { AlertTriangle, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Component that checks for Web Speech API support and displays warnings
 * Shows different messages based on what's missing
 */
const SpeechApiCheck = ({ onDismiss }) => {
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasSpeechSynthesis = !!window.speechSynthesis;

  // If both are available, don't show anything
  if (hasSpeechRecognition && hasSpeechSynthesis) {
    return null;
  }

  const getMissingFeatures = () => {
    const missing = [];
    if (!hasSpeechRecognition) missing.push('Speech Recognition');
    if (!hasSpeechSynthesis) missing.push('Speech Synthesis');
    return missing;
  };

  const missingFeatures = getMissingFeatures();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-gradient-to-br from-purple-900/90 to-rose-900/90 rounded-2xl p-8 border border-purple-400/20 shadow-2xl">
        <div className="text-center">
          <div className="mb-4 flex justify-center gap-3">
            <AlertTriangle className="w-12 h-12 text-yellow-400" />
            {!hasSpeechRecognition && <Mic className="w-12 h-12 text-rose-400" />}
            {!hasSpeechSynthesis && <Volume2 className="w-12 h-12 text-rose-400" />}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Limited Browser Support
          </h2>
          
          <p className="text-purple-200 mb-4">
            Your browser doesn't support: <strong>{missingFeatures.join(' and ')}</strong>
          </p>

          <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-purple-300 mb-3">
              <strong>What this means:</strong>
            </p>
            <ul className="text-sm text-purple-200 space-y-2 list-disc list-inside">
              {!hasSpeechRecognition && (
                <li>You won't be able to use voice input (speaking to Tessa)</li>
              )}
              {!hasSpeechSynthesis && (
                <li>Tessa won't be able to speak responses aloud</li>
              )}
            </ul>
          </div>

          <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-purple-300 mb-3">
              <strong>Recommended browsers:</strong>
            </p>
            <ul className="text-sm text-purple-200 space-y-1 list-disc list-inside">
              <li>Google Chrome (recommended)</li>
              <li>Microsoft Edge</li>
              <li>Safari</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="outline"
                className="border-purple-400/20 text-purple-200 hover:bg-purple-800/50"
              >
                Continue Anyway
              </Button>
            )}
            
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500"
            >
              Refresh Page
            </Button>
          </div>

          <p className="mt-4 text-xs text-purple-400">
            Note: Firefox has limited Web Speech API support
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeechApiCheck;
