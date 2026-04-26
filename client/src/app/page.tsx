'use client';

import { useEffect } from 'react';
import { PlayerList } from '../components/PlayerList';
import { Timer } from '../components/Timer';
import { CanvasBoard } from '../components/CanvasBoard';
import { Toolbar } from '../components/Toolbar';
import { ChatPanel } from '../components/ChatPanel';
import { useSocket } from '../hooks/useSocket';

export default function Home() {
  // Initialize websocket connection
  useSocket();

  return (
    <main className="flex h-screen w-full bg-slate-50 p-4 font-sans overflow-hidden">
      
      {/* Left Column - Player List (20%) */}
      <div className="w-1/5 min-w-[250px] pr-4 h-full hidden lg:block">
        <PlayerList />
      </div>

      {/* Center Column - Game Core (60%) */}
      <div className="flex-1 flex flex-col h-full">
        <Timer />
        <CanvasBoard />
        <div className="h-24">
          <Toolbar />
        </div>
      </div>

      {/* Right Column - Chat (20%) */}
      <div className="w-1/5 min-w-[300px] pl-4 h-full hidden md:block">
        <ChatPanel />
      </div>
      
    </main>
  );
}
