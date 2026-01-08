// src/config/db.js
import dotenv from 'dotenv';
import postgres from 'pg';

dotenv.config();
const { Pool } = postgres;

// 🔍 DEBUG: log DB config (safe version)
console.log("🔍 DB CONFIG USED BY BACKEND:");
console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? "****" : undefined
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
