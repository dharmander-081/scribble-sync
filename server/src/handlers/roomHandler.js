const { getRoom, setRoom, deleteRoom, getCleanRoom } = require('../services/storageService');
const { handleDrawerDisconnect } = require('../services/roomService');

const registerRoomHandlers = (io, socket) => {
  const joinRoom = ({ roomId, username, playerId }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerId = playerId;
    socket.username = username;

    let room = getRoom(roomId);

    if (!room) {
      room = {
        players: [],
        currentDrawerId: null,
        currentWord: null,
        maskedWord: null,
        round: 0,
        maxRounds: 3,
        turnStartTime: null,
        duration: null,
        turnStatus: 'starting',
        canvasBuffer: [],
        timerId: null
      };
      setRoom(roomId, room);
    }

    // Check if player already exists (reconnection)
    const existingPlayer = room.players.find(p => p.playerId === playerId);
    if (existingPlayer) {
      existingPlayer.state = 'guessing';
      existingPlayer.username = username; // Update username if changed
    } else {
      room.players.push({
        playerId,
        username,
        score: 0,
        state: 'guessing',
        hasGuessedCorrectly: false
      });
    }

    // Sync state to everyone (filtered correctly for each)
    const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
    if (socketsInRoom) {
      for (const socketId of socketsInRoom) {
        const s = io.sockets.sockets.get(socketId);
        if (s) {
          s.emit('room_state_sync', getCleanRoom(room, s.playerId));
        }
      }
    }
    
    // Broadcast existing canvas buffer to new joiner
    if (room.canvasBuffer.length > 0) {
      room.canvasBuffer.forEach(drawEvent => {
        socket.emit('draw_event', drawEvent);
      });
    }
  };

  const handleDisconnect = () => {
    if (socket.roomId) {
      const room = getRoom(socket.roomId);
      if (room) {
        const player = room.players.find(p => p.playerId === socket.playerId);
        if (player) {
          player.state = 'disconnected';
          
          // Rule: If drawer disconnects, end turn immediately
          handleDrawerDisconnect(io, socket.roomId, socket.playerId);
          
          // Rule: If room is empty, delete it
          const activePlayers = room.players.filter(p => p.state !== 'disconnected');
          if (activePlayers.length === 0) {
            if (room.timerId) clearTimeout(room.timerId);
            deleteRoom(socket.roomId);
          } else {
            // Broadcast filtered sync to remaining players
            const socketsInRoom = io.sockets.adapter.rooms.get(socket.roomId);
            if (socketsInRoom) {
              for (const socketId of socketsInRoom) {
                const s = io.sockets.sockets.get(socketId);
                if (s) {
                  s.emit('room_state_sync', getCleanRoom(room, s.playerId));
                }
              }
            }
          }
        }
      }
    }
  };

  socket.on('join_room', joinRoom);
  socket.on('disconnect', handleDisconnect);
};

module.exports = { registerRoomHandlers };
