import { createLogger } from '../utils/logger.js';

const logger = createLogger('errorHandler');

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details,
    });
  }

  if (err.type === 'auth') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: err.message,
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
};