import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

import { socket } from '../lib/socket';

export const Timer: React.FC = () => {
  const maskedWord = useGameStore((state) => state.maskedWord) || '';
  const currentWord = useGameStore((state) => state.currentWord);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const currentDrawerId = useGameStore((state) => state.currentDrawerId);
  const turnStartTime = useGameStore((state) => state.turnStartTime);
  const duration = useGameStore((state) => state.duration);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const players = useGameStore((state) => state.players);
  const turnStatus = useGameStore((state) => state.turnStatus);

  const canStart = players.length >= 2;
  const isDrawer = myPlayerId === currentDrawerId;
  const displayWord = isDrawer ? currentWord : maskedWord;

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!turnStartTime || !duration) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - turnStartTime) / 1000);
      return Math.max(0, duration - elapsed);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [turnStartTime, duration]);

  const isWarning = timeLeft < 15 && timeLeft > 0;
  const isCritical = timeLeft < 5 && timeLeft > 0;

  let timerColorClass = 'bg-slate-200 text-slate-700';
  if (isCritical) {
    timerColorClass = 'bg-red-500 text-white animate-pulse';
  } else if (isWarning) {
    timerColorClass = 'bg-orange-500 text-white';
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-3xl px-6 py-4 shadow-sm border border-slate-100 mb-4">
      <div className={`flex items-center justify-center w-14 h-14 rounded-full font-bold text-xl transition-colors duration-300 ${timerColorClass}`}>
        {timeLeft}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {!currentDrawerId && turnStatus !== 'active' && (
          <button 
            onClick={() => socket.emit('start_game')}
            disabled={!canStart}
            className={`mb-1 px-4 py-1 rounded-full text-xs font-bold transition-colors shadow-sm ${
              canStart 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canStart ? 'Start Game' : 'Waiting for players...'}
          </button>
        )}
        <h1 className="text-3xl font-extrabold tracking-widest text-slate-800 font-mono uppercase">
          {turnStatus === 'ending' ? `Word: ${currentWord}` : (displayWord || 'Waiting...')}
        </h1>
      </div>
      
      <div className="w-14 flex justify-end">
        <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">
          R{round || 1}/{maxRounds || 3}
        </div>
      </div>
    </div>
  );
};
