'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 8);
    
    // Store username in sessionStorage
    sessionStorage.setItem('scribble_username', username.trim());
    
    // Redirect to the room
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomId.trim()) return;
    
    // Store username in sessionStorage
    sessionStorage.setItem('scribble_username', username.trim());
    
    // Redirect to the room
    router.push(`/room/${roomId.trim()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight text-slate-800 mb-2">
            Scribble<span className="text-blue-500">Sync</span>
          </h1>
          <p className="text-slate-400 font-medium italic">Draw. Guess. Sync.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label>
            <input 
              type="text" 
              placeholder="Who are you?"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 font-semibold placeholder:text-slate-300"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={handleCreateRoom}
              disabled={!username.trim()}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transform transition-all active:scale-95 ${
                username.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              CREATE NEW ROOM
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="px-4 text-slate-300 font-bold text-xs">OR JOIN ONE</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 font-semibold placeholder:text-slate-300"
            />
            <button 
              onClick={handleJoinRoom}
              disabled={!username.trim() || !roomId.trim()}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transform transition-all active:scale-95 ${
                username.trim() && roomId.trim()
                  ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              JOIN ROOM
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-12 text-slate-400 text-sm font-medium">
        Built for fun by <span className="text-slate-600 font-bold">Antigravity</span>
      </p>
    </div>
  );
}
