import winston from 'winston';
import 'winston-daily-rotate-file';

const createLogger = (module) => {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.metadata({ fillWith: ['timestamp', 'module'] })
    ),
    defaultMeta: { module },
    transports: [
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d'
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d'
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  });
};

export { createLogger };