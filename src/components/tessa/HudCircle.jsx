import React from 'react';

const HudCircle = ({ status, isSpeaking, isListening }) => {
  const statusColor = isListening ? 'text-emerald-400' : isSpeaking ? 'text-rose-400' : 'text-purple-400';

  return (
    <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center pointer-events-none">
      <style>{`
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          filter: drop-shadow(0 0 5px var(--glow-purple));
        }
        .ring-1 {
          width: 100%;
          height: 100%;
          animation: rotate 20s linear infinite;
        }
        .ring-2 {
          width: 85%;
          height: 85%;
          border-style: dashed;
          animation: rotate-reverse 30s linear infinite;
        }
        .ring-3 {
          width: 70%;
          height: 70%;
          animation: rotate 15s linear infinite;
        }
        .core {
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(244, 114, 182, 0.1) 50%, rgba(168, 85, 247, 0) 70%);
          border-radius: 50%;
          transition: transform 0.3s ease;
          animation: pulse 4s ease-in-out infinite;
        }
        .speaking-core {
           transform: scale(1.1);
           animation: pulse-fast 1.5s ease-in-out infinite;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
      <div className="ring ring-1"></div>
      <div className="ring ring-2"></div>
      <div className="ring ring-3"></div>
      <div className={`core ${isSpeaking ? 'speaking-core' : ''}`}></div>

      <div className="absolute text-center">
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest" style={{ textShadow: '0 0 10px var(--glow-purple)' }}>
          T E S S A
        </h2>
        <p className={`mt-2 text-sm md:text-base font-light uppercase tracking-wider ${statusColor}`}>
          {status}
        </p>
      </div>
    </div>
  );
};

export default HudCircle;