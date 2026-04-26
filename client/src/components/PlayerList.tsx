import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const PlayerList: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const currentDrawerId = useGameStore((state) => state.currentDrawerId);
  const myPlayerId = useGameStore((state) => state.myPlayerId);

  const displayPlayers = players;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Players</h2>
      
      <div className="flex flex-col space-y-3 overflow-y-auto pr-2 flex-1">
        {displayPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
            <p className="text-sm font-medium italic">Waiting for players...</p>
          </div>
        ) : (
          displayPlayers.map((player) => {
          const isDrawer = player.playerId === currentDrawerId;
          const isCorrect = player.hasGuessedCorrectly;
          const isMe = player.playerId === myPlayerId;
          
          let bgColorClass = 'bg-slate-50 hover:bg-slate-100';
          let borderColorClass = 'border-transparent';

          if (isDrawer) {
            bgColorClass = 'bg-purple-50';
            borderColorClass = 'border-purple-500 border-l-4 shadow-sm';
          } else if (isCorrect) {
            bgColorClass = 'bg-green-50';
            borderColorClass = 'border-green-500 border-l-4';
          }

          return (
            <div 
              key={player.playerId} 
              className={`flex items-center p-3 rounded-2xl transition-all border ${bgColorClass} ${borderColorClass}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold mr-3 shrink-0">
                {player.username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-grow overflow-hidden">
                <div className="flex items-center font-semibold text-slate-800 truncate">
                  {player.username}
                  {isMe && <span className="ml-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500">YOU</span>}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {player.score} pts
                </div>
              </div>
              
              {isDrawer && (
                <div className="text-purple-500 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              )}

              {isCorrect && !isDrawer && (
                <div className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
};
