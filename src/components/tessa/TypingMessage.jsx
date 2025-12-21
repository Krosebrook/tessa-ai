import React, { useState, useEffect } from 'react';

const TypingMessage = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i > text.length) {
          clearInterval(intervalId);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);

      return () => clearInterval(intervalId);
    }
  }, [text, speed, onComplete]);

  return <>{displayedText}</>;
};

export default TypingMessage;