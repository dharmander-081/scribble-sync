import React, { useState, useRef, useEffect, UIEvent } from 'react';
import { useGameStore } from '../store/useGameStore';
import { socket } from '../lib/socket';
import { ChatMessage } from '../types/game';

export const ChatPanel: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  const messages = useGameStore((state) => state.messages);
  const addMessage = useGameStore((state) => state.addMessage);
  
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const currentDrawerId = useGameStore((state) => state.currentDrawerId);
  const players = useGameStore((state) => state.players);
  
  const isDrawer = myPlayerId === currentDrawerId && currentDrawerId !== null;
  const me = players.find(p => p.playerId === myPlayerId);
  const hasGuessed = me?.hasGuessedCorrectly;
  const isDisabled = isDrawer || hasGuessed;

  let placeholder = "Type your guess...";
  if (isDrawer) placeholder = "You are drawing...";
  else if (hasGuessed) placeholder = "You guessed it!";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Setup Socket Listeners
  useEffect(() => {
    const handleChatMessage = (msg: ChatMessage) => {
      addMessage({ ...msg, type: msg.type || 'standard' });
    };

    const handleSystemMessage = (msg: ChatMessage) => {
      addMessage({ ...msg, type: 'system' });
    };

    const handleCorrectGuess = (msg: ChatMessage) => {
      addMessage({ ...msg, type: 'correct_guess' });
    };

    socket.on('chat_message', handleChatMessage);
    socket.on('system_message', handleSystemMessage);
    socket.on('correct_guess', handleCorrectGuess);

    return () => {
      socket.off('chat_message', handleChatMessage);
      socket.off('system_message', handleSystemMessage);
      socket.off('correct_guess', handleCorrectGuess);
    };
  }, [addMessage]);

  // Auto Scroll Logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAutoScroll(true);
    setHasNewMessages(false);
  };

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    } else {
      setHasNewMessages(true);
    }
  }, [messages, isAutoScroll]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if scrolled near the bottom (within 20px)
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 20;
    
    setIsAutoScroll(isAtBottom);
    if (isAtBottom) {
      setHasNewMessages(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isDisabled) return;
    
    socket.emit('send_guess', { guess: inputValue.trim() });
    setInputValue('');
    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Chat & Guesses</h2>
      </div>
      
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 italic">
            Start guessing!
          </div>
        ) : (
          messages.map((msg, index) => {
            const key = msg.id || `msg-${index}`;
            if (msg.type === 'system') {
              return (
                <div key={key} className="text-center text-sm italic text-slate-500 my-2">
                  {msg.text}
                </div>
              );
            }
            
            if (msg.type === 'correct_guess') {
              return (
                <div key={key} className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-sm font-semibold animate-pulse">
                  {msg.username} {msg.text}
                </div>
              );
            }

            if (msg.type === 'close_guess') {
              return (
                <div key={key} className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-xl text-sm font-semibold">
                  {msg.username}: {msg.text}
                </div>
              );
            }

            return (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold mb-1 ml-1">{msg.username}</span>
                <div className="bg-slate-100 text-slate-800 px-3 py-2 rounded-2xl rounded-tl-sm w-fit max-w-[90%] text-sm">
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* New Messages Indicator */}
      {!isAutoScroll && hasNewMessages && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:bg-blue-600 transition-colors"
        >
          New messages ↓
        </button>
      )}
      
      <div className="p-3 border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isDisabled}
            placeholder={placeholder}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </form>
      </div>
    </div>
  );
};
