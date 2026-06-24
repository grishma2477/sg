import redis from '../../infrastructure/redisClient.js';
import logger from '../../infrastructure/logger.js';

export class CacheService {
  /**
   * Cache-aside: returns cached value or calls fetcher, caches result, returns it.
   * @param {string} key
   * @param {() => Promise<any>} fetcher
   * @param {number} ttlSeconds  default 300 (5 minutes)
   */
  static async get(key, fetcher, ttlSeconds = 300) {
    try {
      const cached = await redis.get(key);
      if (cached !== null) return JSON.parse(cached);
    } catch (err) {
      logger.warn('cache_read_error', { key, err: err.message });
    }

    const value = await fetcher();

    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn('cache_write_error', { key, err: err.message });
    }

    return value;
  }

  static async invalidate(key) {
    try { await redis.del(key); } catch (_) {}
  }

  static async flush(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } catch (err) {
      logger.warn('cache_flush_error', { pattern, err: err.message });
    }
  }

  static async stats() {
    try {
      const info = await redis.info('stats');
      const memory = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      return { info, memory, keyspace };
    } catch (err) {
      return { error: err.message };
    }
  }
}
