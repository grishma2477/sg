import Redis from "ioredis";
import logger from "./logger.js";

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
  lazyConnect:       true,
  retryStrategy:     (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error",   (err) => logger.error("Redis error", { message: err.message }));
redis.on("close",   ()    => logger.warn("Redis connection closed"));

export default redis;
