export const corsConfig = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all methods
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    exposedHeaders: ['set-cookie'],
};
