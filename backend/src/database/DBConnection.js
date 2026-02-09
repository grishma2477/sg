// src/config/db.js

import postgres from 'pg';
import { Env } from '../utils/Env.js';

const { Pool } = postgres;

const pool = new Pool({
  host: Env.DB_HOST,
  port: Env.DB_PORT,
  user: Env.DB_USER,
  database: Env.DB_NAME,
  password: Env.DB_PASSWORD
});

const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
    return pool;
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);
    throw err instanceof Error ? err : new Error(JSON.stringify(err));
  }
};


export { pool, connectDB };
