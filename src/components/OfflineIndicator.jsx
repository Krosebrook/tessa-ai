import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Component that displays when the application goes offline
 * Shows a banner at the top of the screen with retry option
 */
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowReconnecting(true);
      // Give a moment to show "Reconnecting..." before hiding
      setTimeout(() => {
        setIsOnline(true);
        setShowReconnecting(false);
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render if online
  if (isOnline && !showReconnecting) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 ${
        showReconnecting 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
          : 'bg-gradient-to-r from-rose-600 to-red-600'
      } text-white px-4 py-3 shadow-lg`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2">
        {!showReconnecting && <WifiOff className="w-5 h-5" />}
        <span className="font-medium">
          {showReconnecting 
            ? '✓ Connection restored' 
            : 'No internet connection - Some features may not work'
          }
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
