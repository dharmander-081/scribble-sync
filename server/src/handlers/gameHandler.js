const { getRoom } = require('../services/storageService');
const { startTurn } = require('../services/roomService');

const registerGameHandlers = (io, socket) => {
  const handleSendGuess = ({ guess }) => {
    const { roomId, playerId, username } = socket;
    if (!roomId || !guess) return;

    const room = getRoom(roomId);
    if (!room || room.turnStatus !== 'active') return;

    // Security: Drawer cannot guess
    if (room.currentDrawerId === playerId) return;

    const player = room.players.find(p => p.playerId === playerId);
    if (!player || player.hasGuessedCorrectly) return;

    // Rate limiting (simple)
    const now = Date.now();
    if (player.lastGuessTime && now - player.lastGuessTime < 500) {
      return;
    }
    player.lastGuessTime = now;

    // Input Validation
    if (!guess || guess.length > 100) {
      socket.emit('error_message', { message: 'Invalid guess length' });
      return;
    }

    const isCorrect = guess.toLowerCase().trim() === room.currentWord.toLowerCase().trim();

    if (isCorrect) {
      // Atomic check: set to true immediately to prevent duplicate scoring
      player.hasGuessedCorrectly = true;
      
      // Calculate score
      const elapsed = (Date.now() - room.turnStartTime) / 1000;
      let score = Math.max(10, Math.floor(100 * (1 - elapsed / room.duration)));
      
      // Rule: Only the first person to guess gets the full score
      const correctGuessersCount = room.players.filter(p => p.hasGuessedCorrectly).length;
      if (correctGuessersCount > 1) {
        score = Math.floor(score * 0.5); // 50% reduction for others
      }

      player.score += score;

      io.to(roomId).emit('correct_guess', {
        id: Math.random().toString(36).substring(2, 9),
        playerId,
        username,
        score: player.score,
        text: 'guessed the word!'
      });

      // Check if all guessers are done
      const activeGuessers = room.players.filter(p => p.playerId !== room.currentDrawerId && p.state !== 'disconnected');
      const allGuessed = activeGuessers.every(p => p.hasGuessedCorrectly);

      if (allGuessed && activeGuessers.length > 0) {
        // Trigger turn end early if roomService provides a way (or just wait for timer)
        // For now, we'll let the timer handle it or add an early-end trigger in roomService
      }
    } else {
      // Normal chat message
      io.to(roomId).emit('chat_message', {
        id: Math.random().toString(36).substring(2, 9),
        playerId,
        username,
        text: guess,
        timestamp: Date.now()
      });
    }
  };

  const handleStartGame = () => {
    const { roomId } = socket;
    if (!roomId) return;
    startTurn(io, roomId);
  };

  socket.on('send_guess', handleSendGuess);
  socket.on('start_game', handleStartGame);
};

module.exports = { registerGameHandlers };
