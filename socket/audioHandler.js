const audioService = require('../services/audioService');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

function setupAudioSocket(io) {
  const audioNamespace = io.of('/audio');

  audioNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  audioNamespace.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.email}`);

    socket.on('audio-stream', async (audioData) => {
      try {
        const audioLog = await audioService.saveAudioFile(
          socket.user.id,
          Buffer.from(audioData)
        );
        
        // Broadcast to admin clients
        audioNamespace.to('admin-room').emit('new-audio', audioLog);
        
        socket.emit('audio-received', { success: true });
      } catch (error) {
        logger.error('Error processing audio:', error);
        socket.emit('audio-error', { message: 'Failed to process audio' });
      }
    });

    socket.on('join-admin', () => {
      if (socket.user.isAdmin) {
        socket.join('admin-room');
        logger.info('Admin joined listening room');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.email}`);
    });
  });
}

module.exports = setupAudioSocket;