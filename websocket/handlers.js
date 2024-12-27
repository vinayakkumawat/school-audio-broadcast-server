import { handleNewAudio, handleAudioRemoved } from '../controllers/audioController.js';
import { WS_EVENTS } from '../config/constants.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('websocket');

export const setupWebSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    const rateLimitMap = new Map();
    const RATE_LIMIT = 10; // events per minute
    const RATE_WINDOW = 60 * 1000; // 1 minute

    const isRateLimited = (eventName) => {
      const now = Date.now();
      const key = `${socket.id}:${eventName}`;
      const userEvents = rateLimitMap.get(key) || [];
      const recentEvents = userEvents.filter(time => now - time < RATE_WINDOW);
      
      if (recentEvents.length >= RATE_LIMIT) {
        return true;
      }

      recentEvents.push(now);
      rateLimitMap.set(key, recentEvents);
      return false;
    };

    socket.on(WS_EVENTS.NEW_AUDIO, async (audioData) => {
      try {
        if (isRateLimited(WS_EVENTS.NEW_AUDIO)) {
          socket.emit(WS_EVENTS.ERROR, 'Rate limit exceeded');
          return;
        }

        const audio = await handleNewAudio(audioData);
        io.emit(WS_EVENTS.NEW_AUDIO, audio);
        logger.info(`New audio received: ${audio.id}`);
      } catch (error) {
        logger.error(`Error handling new audio: ${error.message}`);
        socket.emit(WS_EVENTS.ERROR, error.message);
      }
    });

    socket.on(WS_EVENTS.AUDIO_REMOVED, async (audioId) => {
      try {
        if (isRateLimited(WS_EVENTS.AUDIO_REMOVED)) {
          socket.emit(WS_EVENTS.ERROR, 'Rate limit exceeded');
          return;
        }

        await handleAudioRemoved(audioId);
        io.emit(WS_EVENTS.AUDIO_REMOVED, audioId);
        logger.info(`Audio removed: ${audioId}`);
      } catch (error) {
        logger.error(`Error removing audio: ${error.message}`);
        socket.emit(WS_EVENTS.ERROR, error.message);
      }
    });

    socket.on('disconnect', () => {
      rateLimitMap.delete(socket.id);
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};