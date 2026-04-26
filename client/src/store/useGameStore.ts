import { create } from 'zustand';
import { GameState, Player, ChatMessage } from '../types/game';

interface GameStore extends GameState {
  setRoomState: (state: Partial<GameState>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addMessage: (message: ChatMessage) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  setCorrectGuess: (playerId: string) => void;
  endTurn: () => void;
  setDrawingTool: (tool: { activeColor?: string; activeSize?: number; activeTool?: 'brush' | 'eraser' | 'fill' }) => void;
  reset: () => void;
}

const initialState: GameState = {
  myPlayerId: null,
  roomId: null,
  players: [],
  currentDrawerId: null,
  currentWord: null,
  maskedWord: null,
  messages: [],
  round: 0,
  maxRounds: 3,
  turnStartTime: null,
  duration: null,
  turnStatus: null,
  
  // Drawing tools state
  activeColor: '#000000',
  activeSize: 8,
  activeTool: 'brush',
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  
  setRoomState: (newState) => set((state) => ({ ...state, ...newState })),
  
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.playerId !== playerId)
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages.slice(-100), message]
  })),
  
  updatePlayerScore: (playerId, score) => set((state) => ({
    players: state.players.map(p => 
      p.playerId === playerId ? { ...p, score } : p
    )
  })),

  setCorrectGuess: (playerId) => set((state) => ({
    players: state.players.map(p => 
      p.playerId === playerId ? { ...p, hasGuessedCorrectly: true } : p
    )
  })),

  endTurn: () => set((state) => ({
    currentDrawerId: null,
    currentWord: null,
    maskedWord: null,
    turnStartTime: null,
    duration: null,
    players: state.players.map(p => ({ ...p, hasGuessedCorrectly: false, state: 'guessing' }))
  })),

  setDrawingTool: (tool) => set((state) => ({ ...state, ...tool })),
  
  reset: () => set(initialState),
}));
