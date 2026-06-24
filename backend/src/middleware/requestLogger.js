import { randomUUID } from 'crypto';
import logger from '../infrastructure/logger.js';

export function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID().slice(0, 8);
  const start     = Date.now();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId   = req.user?.userId ?? null;
    const level    = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'http';

    logger[level]('request', {
      requestId,
      method:     req.method,
      path:       req.path,
      statusCode: res.statusCode,
      duration,
      ip:         req.ip || req.connection?.remoteAddress,
      userId,
      userAgent:  req.headers['user-agent'],
    });
  });

  next();
}
