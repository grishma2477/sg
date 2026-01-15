// src/config/db.js
import dotenv from 'dotenv';
import postgres from 'pg';

dotenv.config({ path: "./src/.env" });
const { Pool } = postgres;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectDB = async () => {
  try {
    // Try a simple query to check connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
    return pool;
  } catch (err) {
    throw err;
  }
};

export { pool, connectDB };
