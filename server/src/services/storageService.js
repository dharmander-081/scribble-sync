/**
 * In-memory storage for room states.
 * Structure:
 * Map<roomId, {
 *   players: Player[],
 *   currentDrawerId: string | null,
 *   currentWord: string | null,
 *   maskedWord: string | null,
 *   round: number,
 *   maxRounds: number,
 *   turnStartTime: number | null,
 *   duration: number | null,
 *   turnStatus: 'starting' | 'active' | 'ending' | null,
 *   canvasBuffer: DrawEvent[],
 *   timerId: NodeJS.Timeout | null
 * }>
 */
const rooms = new Map();

const getRoom = (roomId) => rooms.get(roomId);

const setRoom = (roomId, state) => rooms.set(roomId, state);

const deleteRoom = (roomId) => rooms.delete(roomId);

const getCleanRoom = (room, playerId) => {
  if (!room) return null;
  const { timerId, currentWord, ...rest } = room;
  return {
    ...rest,
    currentWord: room.currentDrawerId === playerId ? currentWord : null
  };
};

module.exports = {
  getRoom,
  setRoom,
  deleteRoom,
  getCleanRoom
};
