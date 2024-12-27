export const WS_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NEW_AUDIO: 'new_audio',
    AUDIO_REMOVED: 'audio_removed',
    ERROR: 'error',
};

export const CSV_FILES = {
    USERS: 'data/users.csv',
    AUDIO: 'data/audio.csv',
    ADMIN: 'data/admin.csv',
};

// Use environment variables for sensitive data
export const JWT_SECRET = 'oR79W8UQ/An4U7eTa4mfWQ==';
export const BCRYPT_ROUNDS = 10;

// Production configuration
export const PRODUCTION_CONFIG = {
    PORT: 3001,
    NODE_ENV: 'production',
    CORS_ORIGIN: 'http://yourdomain.com',
    WS_URL: 'wss://yourdomain.com',
};