import { pool } from '../database/DBConnection.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { CacheService } from '../application/services/CacheService.js';

// GET /api/admin/performance/slow-queries
export const getSlowQueries = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '20'), 50);
    const minMs = parseFloat(req.query.min_ms ?? '50');

    // pg_stat_statements must be enabled via sprint12_performance.sql migration
    const { rows } = await pool.query(`
      SELECT
        LEFT(query, 200)                                      AS query_preview,
        calls,
        ROUND((total_exec_time / calls)::numeric, 2)         AS avg_ms,
        ROUND(total_exec_time::numeric, 2)                   AS total_ms,
        ROUND(stddev_exec_time::numeric, 2)                  AS stddev_ms,
        rows,
        ROUND((rows::numeric / NULLIF(calls,0)), 1)          AS avg_rows
      FROM pg_stat_statements
      WHERE calls > 5
        AND (total_exec_time / calls) > $1
      ORDER BY avg_ms DESC
      LIMIT $2
    `, [minMs, limit]);

    res.json(ApiResponse.success({ queries: rows, min_ms: minMs }));
  } catch (err) {
    if (err.message?.includes('pg_stat_statements')) {
      return res.status(503).json(ApiResponse.error(
        'pg_stat_statements extension not enabled. Run sprint12_performance.sql migration.', 503
      ));
    }
    next(err);
  }
};

// GET /api/admin/performance/cache-stats
export const getCacheStats = async (req, res, next) => {
  try {
    const stats = await CacheService.stats();
    res.json(ApiResponse.success(stats));
  } catch (err) { next(err); }
};

// POST /api/admin/performance/cache-flush
export const flushCache = async (req, res, next) => {
  try {
    const { pattern = '*' } = req.body;
    await CacheService.flush(pattern);
    res.json(ApiResponse.success(null, `Cache flushed: ${pattern}`));
  } catch (err) { next(err); }
};

// GET /api/admin/performance/db-stats
export const getDbStats = async (req, res, next) => {
  try {
    const [sizeRes, connRes, tableRes] = await Promise.all([
      pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size`),
      pool.query(`
        SELECT count(*) AS total, count(*) FILTER (WHERE state='active') AS active
        FROM pg_stat_activity WHERE datname = current_database()
      `),
      pool.query(`
        SELECT relname AS table_name,
               n_live_tup AS live_rows,
               n_dead_tup AS dead_rows,
               pg_size_pretty(pg_total_relation_size(relid)) AS total_size
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 15
      `),
    ]);

    res.json(ApiResponse.success({
      db_size:     sizeRes.rows[0].db_size,
      connections: connRes.rows[0],
      tables:      tableRes.rows,
    }));
  } catch (err) { next(err); }
};
