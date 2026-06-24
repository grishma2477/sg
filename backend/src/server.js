import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Sentry must be initialized before any other imports
Sentry.init({
  dsn: process.env.SENTRY_DSN,           // TODO: Set SENTRY_DSN in .env — get from sentry.io → New Project
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  environment: process.env.NODE_ENV || 'development',
  enabled: !!process.env.SENTRY_DSN,
});

import http from 'http';
import app from './app.js';
import { connectDB } from './database/DBConnection.js';
import { initSocket } from './realtime/socketServer.js';
import { LedgerService } from './application/services/LedgerService.js';
import { runExpireRideRequestsWorker } from './application/workers/expireRideRequestsWorker.js';
import logger from './infrastructure/logger.js';

const REQUIRED_ENV = [
  'ACCESS_TOKEN_SECRET_KEY',
  'REFRESH_TOKEN_SECRET_KEY',
  'DATABASE_URL',
  // Production-critical — warn in dev, hard-fail in prod
  ...(process.env.NODE_ENV === 'production' ? [
    'REDIS_URL',
    'SENTRY_DSN',
    'FRONTEND_URL',
    'ALLOWED_ORIGINS',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'ADMIN_EMAIL',
    'GOOGLE_MAPS_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ] : []),
];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  logger.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 5000;

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

const server = http.createServer(app);

(async () => {
  try {
    await connectDB();
    await LedgerService.initializePlatformAccounts();
    runExpireRideRequestsWorker();
    logger.info('Ride expiration worker started');

    initSocket(server);
    logger.info('Socket.io initialized');

    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`, { port: PORT, env: process.env.NODE_ENV });
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message, stack: err.stack });
    process.exit(1);
  }
})();
