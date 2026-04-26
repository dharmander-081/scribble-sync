export interface Player {
  playerId: string;
  username: string;
  score: number;
  state: 'guessing' | 'drawing' | 'disconnected';
  hasGuessedCorrectly?: boolean;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  text: string;
  type: 'standard' | 'system' | 'close_guess' | 'correct_guess';
  timestamp: number;
}

export interface GameState {
  myPlayerId: string | null;
  roomId: string | null;
  players: Player[];
  currentDrawerId: string | null;
  currentWord: string | null;
  maskedWord: string | null;
  messages: ChatMessage[];
  round: number;
  maxRounds: number;
  turnStartTime: number | null;
  duration: number | null;
  turnStatus: 'starting' | 'active' | 'ending' | null;
  activeColor: string;
  activeSize: number;
  activeTool: 'brush' | 'eraser' | 'fill';
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawEventPayload {
  strokeId: string;
  sequenceNumber: number;
  color: string;
  brushSize: number;
  points: Point[];
}
