const { getRoom, deleteRoom } = require('./storageService');
const { getRandomWord, maskWord } = require('../utils/wordList');

const startTurn = (io, roomId) => {
  const room = getRoom(roomId);
  if (!room) return;

  // Prevent starting twice
  if (room.turnStatus === 'active') return;

  if (room.timerId) clearTimeout(room.timerId);

  const activePlayers = room.players.filter(p => p.state !== 'disconnected');
  
  // Rule: Need at least 2 players to start
  if (activePlayers.length < 2) {
    room.turnStatus = 'starting';
    io.to(roomId).emit('system_message', { 
      id: Math.random().toString(36).substring(2, 9),
      text: 'Waiting for more players to start...' 
    });
    io.to(roomId).emit('room_state_sync', room);
    return;
  }

  let nextDrawerIndex = 0;
  if (room.currentDrawerId) {
    const currentIndex = activePlayers.findIndex(p => p.playerId === room.currentDrawerId);
    nextDrawerIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % activePlayers.length;
  }
  
  const drawer = activePlayers[nextDrawerIndex];
  const word = getRandomWord();
  console.log(`[Game] Room ${roomId} starting turn. Drawer: ${drawer.username}, Word: ${word}`);
  
  room.currentDrawerId = drawer.playerId;
  room.currentWord = word;
  room.maskedWord = maskWord(word);
  room.turnStartTime = Date.now();
  room.duration = 60;
  room.turnStatus = 'active';
  room.canvasBuffer = []; 
  
  room.players.forEach(p => p.hasGuessedCorrectly = false);

  const basePayload = {
    currentDrawerId: room.currentDrawerId,
    maskedWord: room.maskedWord,
    turnStartTime: room.turnStartTime,
    duration: room.duration,
    turnStatus: room.turnStatus
  };

  io.to(roomId).emit('start_turn', basePayload);

  // Private word reveal to drawer
  const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
  if (socketsInRoom) {
    for (const socketId of socketsInRoom) {
      const s = io.sockets.sockets.get(socketId);
      if (s && s.playerId === drawer.playerId) {
        s.emit('start_turn', { ...basePayload, currentWord: room.currentWord });
      }
    }
  }

  room.timerId = setTimeout(() => {
    endTurn(io, roomId);
  }, room.duration * 1000);
};

const endTurn = (io, roomId) => {
  const room = getRoom(roomId);
  if (!room) return;

  if (room.timerId) clearTimeout(room.timerId);
  room.timerId = null;

  const activePlayers = room.players.filter(p => p.state !== 'disconnected');
  if (activePlayers.length === 0) {
    deleteRoom(roomId);
    return;
  }

  // Prune disconnected players for the next turn
  room.players = activePlayers;

  room.turnStatus = 'ending';
  io.to(roomId).emit('end_turn', { word: room.currentWord });
  room.canvasBuffer = [];

  setTimeout(() => {
    if (getRoom(roomId)) {
      startTurn(io, roomId);
    }
  }, 5000);
};

const handleDrawerDisconnect = (io, roomId, playerId) => {
  const room = getRoom(roomId);
  if (!room || room.currentDrawerId !== playerId) return;

  if (room.turnStatus === 'active') {
    io.to(roomId).emit('system_message', { 
      id: Math.random().toString(36).substring(2, 9),
      text: 'Drawer left the game! Ending turn...' 
    });
    endTurn(io, roomId);
  }
};

module.exports = {
  startTurn,
  endTurn,
  handleDrawerDisconnect
};
