const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { registerRoomHandlers } = require('./src/handlers/roomHandler');
const { registerDrawHandlers } = require('./src/handlers/drawHandler');
const { registerGameHandlers } = require('./src/handlers/gameHandler');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Tighten this in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('[Server] New connection:', socket.id);

  // Global Error Handler for Socket
  socket.on('error', (err) => {
    console.error(`[Socket Error] ${socket.id}:`, err);
  });

  // Register handlers
  registerRoomHandlers(io, socket);
  registerDrawHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
