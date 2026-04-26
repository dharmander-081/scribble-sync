import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useGameStore } from '../store/useGameStore';
import { socket } from '../lib/socket';

export const useSocket = () => {
  const setRoomState = useGameStore((state) => state.setRoomState);
  const setCorrectGuess = useGameStore((state) => state.setCorrectGuess);
  const updatePlayerScore = useGameStore((state) => state.updatePlayerScore);
  const endTurn = useGameStore((state) => state.endTurn);

  useEffect(() => {
    // Initialize socket connection
    socket.connect();

    // Create unique playerId for this session (persists on refresh within same tab)
    let playerId = typeof window !== 'undefined' ? sessionStorage.getItem('scribble_player_id') : null;
    if (!playerId) {
      playerId = uuidv4();
      if (typeof window !== 'undefined') sessionStorage.setItem('scribble_player_id', playerId);
    }
    
    useGameStore.getState().setRoomState({ myPlayerId: playerId });

    const handleConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      
      // Auto-join/rejoin room
      socket.emit('join_room', {
        roomId: 'default-room',
        username: `Player_${playerId!.substring(0, 4)}`,
        playerId
      });
    };

    const handleDisconnect = (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
    };

    const handleError = (err: any) => {
      console.error('[Socket] Error:', err);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('error_message', (data) => console.warn('[Game Error]', data.message));

    // Handle basic game events
    socket.on('room_state_sync', (payload) => {
      console.log('Received room state sync:', payload);
      setRoomState(payload);
    });

    socket.on('start_turn', (payload) => {
      console.log('Starting new turn:', payload);
      setRoomState(payload);
    });

    socket.on('correct_guess', (payload) => {
      console.log('Received correct guess:', payload);
      const { playerId: correctPlayerId, score } = payload;
      setCorrectGuess(correctPlayerId);
      if (score !== undefined) {
        updatePlayerScore(correctPlayerId, score);
      }
    });

    socket.on('end_turn', (payload) => {
      console.log('Turn ended:', payload);
      endTurn();
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off('room_state_sync');
      socket.off('start_turn');
      socket.off('correct_guess');
      socket.off('end_turn');
      socket.off('error_message');
      socket.disconnect();
    };
  }, [setRoomState, setCorrectGuess, updatePlayerScore, endTurn]);

  return socket;
};
