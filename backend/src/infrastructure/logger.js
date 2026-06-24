import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, requestId, userId, stack }) => {
    let line = `${timestamp} [${level}]`;
    if (requestId) line += ` [${requestId}]`;
    if (userId)    line += ` [u:${userId}]`;
    line += ` ${stack ?? message}`;
    return line;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [];

if (isDev) {
  transports.push(new winston.transports.Console({ format: devFormat }));
} else {
  transports.push(new winston.transports.Console({ format: prodFormat }));
  transports.push(
    new winston.transports.DailyRotateFile({
      filename:     'logs/error-%DATE%.log',
      datePattern:  'YYYY-MM-DD',
      level:        'error',
      maxFiles:     '30d',
      zippedArchive: true,
      format:       prodFormat,
    })
  );
  transports.push(
    new winston.transports.DailyRotateFile({
      filename:     'logs/combined-%DATE%.log',
      datePattern:  'YYYY-MM-DD',
      maxFiles:     '30d',
      zippedArchive: true,
      format:       prodFormat,
    })
  );
}

const logger = winston.createLogger({
  level:      isDev ? 'debug' : 'info',
  transports,
  exceptionHandlers: [
    new winston.transports.Console({ format: isDev ? devFormat : prodFormat }),
    ...(isDev ? [] : [
      new winston.transports.DailyRotateFile({ filename: 'logs/exceptions-%DATE%.log', datePattern: 'YYYY-MM-DD', maxFiles: '30d' }),
    ]),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: isDev ? devFormat : prodFormat }),
  ],
  exitOnError: false,
});

export default logger;
