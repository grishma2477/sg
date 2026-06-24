import postgres from 'pg';
import { Env } from '../utils/Env.js';
import logger from '../infrastructure/logger.js';

const { Pool } = postgres;

const pool = new Pool({
  host:                    Env.DB_HOST,
  port:                    Env.DB_PORT,
  user:                    Env.DB_USER,
  database:                Env.DB_NAME,
  password:                Env.DB_PASSWORD,
  max:                     20,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => logger.error('pg pool error', { message: err.message }));

const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    logger.info('PostgreSQL connected');
    return pool;
  } catch (err) {
    logger.error('PostgreSQL connection error', { message: err.message });
    throw err instanceof Error ? err : new Error(JSON.stringify(err));
  }
};

export { pool, connectDB };
