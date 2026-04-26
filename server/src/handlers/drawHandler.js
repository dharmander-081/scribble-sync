const { getRoom } = require('../services/storageService');

const registerDrawHandlers = (io, socket) => {
  const handleDrawEvent = (payload) => {
    const { roomId, playerId } = socket;
    if (!roomId) return;

    const room = getRoom(roomId);
    if (!room) return;

    // Security: Only current drawer can broadcast strokes
    if (room.currentDrawerId !== playerId) {
      console.warn(`Non-drawer ${socket.username} tried to draw in room ${roomId}`);
      return;
    }

    // Buffer the event for new joiners (limit to 500 batches to prevent memory bloat)
    if (room.canvasBuffer.length < 500) {
      room.canvasBuffer.push(payload);
    }

    // Relay to everyone else in the room
    socket.to(roomId).emit('draw_event', payload);
  };

  socket.on('draw_event', handleDrawEvent);
};

module.exports = { registerDrawHandlers };
